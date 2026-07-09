'use client';

import API from '../../../src/lib/axios';
import { useEffect, useState, useCallback, useRef } from 'react';
import Link from 'next/link';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import ProtectedRoute from '../../../src/components/auth/ProtectedRoute';

import {
  FaArrowLeft,
  FaBed,
  FaCheckCircle,
  FaLock,
  FaChevronRight,
  FaCreditCard,
  FaShieldAlt,
  FaInfoCircle,
} from 'react-icons/fa';

import { getSingleRoom } from '../../../src/services/hostelService';
import { createBooking, getMyBookings } from '../../../src/services/bookingService';
import { initializePayment } from '../../../src/services/paymentService';

import { Room, Booking } from '../../../src/types';

import PaymentBreakdown from '../../../src/components/payment/PaymentBreakdown';
import ReservationTimer from '../../../src/components/payment/ReservationTimer';

import toast from 'react-hot-toast';

import { useAuthStore } from '../../../src/store/authStore';
import { useSettingsStore } from '../../../src/store/settingsStore';
import { connectSocket } from '../../../src/lib/socket';
import { Socket } from 'socket.io-client';

import {
  motion,
  AnimatePresence,
} from 'framer-motion';

import { getErrorMessage } from '../../../src/utils/errorUtils';
import { getOptimizedImageUrl } from '../../../src/utils/imageUtils';


type Step =
  | 'review'
  | 'confirm'
  | 'payment';

/**
 * Robust states for the checkout process.
 */
type CheckoutState = 
  | 'idle' 
  | 'processing' 
  | 'success' 
  | 'expired' 
  | 'error';

/**
 * BookingPage Component
 *
 * Handles the multi-step checkout process for booking a room:
 * 1. 'review' - Display room details and initial pricing.
 * 2. 'confirm' - User confirms the booking, creating a backend snapshot.
 * 3. 'payment' - Backend snapshot is used to initialize Paystack payment.
 */
export default function BookingPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();

  const roomId = params.id as string;
  const isRetry = searchParams.get('retry') === 'true';

  const { maintenanceMode } = useSettingsStore();

  const [room, setRoom] = useState<Room | null>(null);
  const [pendingBooking, setPendingBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState<Step>('review');
  const [checkoutState, setCheckoutState] = useState<CheckoutState>('idle');
  const [refundPolicyAccepted, setRefundPolicyAccepted] = useState(false);

  const [publicSettings, setPublicSettings] = useState<{ serviceFee?: number; serviceFeePercent?: number } | null>(null);

  useEffect(() => {
    API.get('/auth/settings/public')
      .then(res => {
        if(res.data.success && res.data.data) {
           setPublicSettings(res.data.data);
        }
      })
      .catch(err => console.error('Failed to fetch settings', err));
  }, []);

  const { token, user } = useAuthStore();

  /**
   * Prevents double-initialization of payments.
   */
  const paymentLockRef = useRef(false);

  // REAL-TIME UPDATES: Listen for payment confirmation if user stays on page
  useEffect(() => {
    if (!token) return;

    let activeSocket: Socket | null = null;

    const setupSocket = async () => {
      activeSocket = await connectSocket(token);
      if (activeSocket) {
        activeSocket.on('payment_update', async (data: { bookingId: string }) => {
          // If the update is for our current pending booking, refresh and redirect
          if (pendingBooking && data.bookingId === pendingBooking._id) {
            const myBookings = await getMyBookings();
            const fresh = myBookings.find(b => b._id === pendingBooking._id);
            if (fresh && ['paid', 'success', 'completed'].includes(fresh.paymentStatus)) {
              setCheckoutState('success');
              router.replace(`/payments/success?bookingId=${fresh._id}`);
            }
          }
        });
      }
    };

    setupSocket();

    return () => {
      if (activeSocket) {
        activeSocket.off('payment_update');
      }
    };
  }, [token, pendingBooking, router]);

  const getReadableError = (error: unknown, fallback: string) => {
    const msg = getErrorMessage(error, fallback);
    const lowerMsg = msg.toLowerCase();

    if (lowerMsg.includes('expired')) return 'Your reservation session has expired. Please restart to secure your spot.';
    if (lowerMsg.includes('already paid')) return 'This booking has already been confirmed and paid for.';
    if (lowerMsg.includes('not found')) return 'The requested room or booking details could not be found.';
    if (lowerMsg.includes('unauthorized')) return 'Please log in again to continue your booking.';
    if (lowerMsg.includes('available') || lowerMsg.includes('beds')) return 'This room is no longer available for booking.';
    
    return msg;
  };

  /**
   * Initializes the Paystack payment flow.
   */
  const handleInitializePayment = useCallback(
    async (bookingId: string) => {
      if (paymentLockRef.current || checkoutState === 'processing') {
        return;
      }

      try {
        paymentLockRef.current = true;
        setCheckoutState('processing');
        setStep('payment');

        // STABILIZATION: Pre-fetch fresh booking status
        const myBookings = await getMyBookings();
        const fresh = myBookings.find(b => b._id === bookingId);
        
        if (fresh) {
          if (['paid', 'success', 'completed'].includes(fresh.paymentStatus)) {
            console.log('payment verified');
            setCheckoutState('success');
            toast.success('Payment already confirmed!');
            console.log('booking finalized');
            router.replace(`/payments/success?bookingId=${bookingId}`);
            return;
          }

          if (fresh.status === 'expired' || fresh.paymentStatus === 'expired') {
            setCheckoutState('expired');
            throw new Error('This reservation has expired.');
          }
        }

        console.log('checkout triggered');
        
        const callbackUrl = `${window.location.origin}/payments/verify`;
        console.log("PAYMENT CALLBACK URL", callbackUrl);

        const data = await initializePayment(bookingId, callbackUrl);
        console.log('payment initialized');

        if (!data.authorization_url) {
          throw new Error('Unable to initialize secure payment session');
        }

        toast.success('Redirecting to secure checkout...');

        // Slight delay for UX
        setTimeout(() => {
          window.location.assign(data.authorization_url);
        }, 1000);
      } catch (error: unknown) {
        const msg = getReadableError(error, 'Unable to initialize payment');
        setCheckoutState(msg.includes('expired') ? 'expired' : 'error');
        toast.error(msg);
        paymentLockRef.current = false;
        
        // If error during payment init, stay on checkout step
        setStep('payment');
      }
    }, [router, checkoutState]
  );

  const fetchLockRef = useRef<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (fetchLockRef.current === roomId) return;
      
      try {
        fetchLockRef.current = roomId;
        // 1. Fetch Room and settings in parallel
        const [roomData, settingsRes] = await Promise.all([
          getSingleRoom(roomId),
          API.get('/auth/settings/public').catch(() => null)
        ]);

        if (!roomData) throw new Error('Room not found');
        setRoom(roomData);

        const settings = settingsRes?.data?.data || settingsRes?.data;
        if (settings) {
          setPublicSettings(settings);
        }
        const duplicateWindow = Number(settings?.duplicateBookingWindowMs) || 20 * 24 * 60 * 60 * 1000;

        // 2. Ownership & Status Validation
        const bookings = await getMyBookings();
        
        // Priority 1: Check if already paid for this room within the cooldown window
        const alreadyPaid = bookings.find(
          (b: Booking) => {
            const isSameRoom = (typeof b.room === 'string' ? b.room === roomId : b.room._id === roomId);
            const isPaid = ['paid', 'success', 'completed'].includes(b.paymentStatus);
            const bookingAge = Date.now() - new Date(b.createdAt).getTime();
            const isRecent = bookingAge < duplicateWindow;
            
            return isSameRoom && isPaid && isRecent;
          }
        );

        if (alreadyPaid) {
          router.replace(`/payments/success?bookingId=${alreadyPaid._id}`);
          return;
        }

        // Priority 2: Check for existing pending/failed booking within the cooldown window
        const existingPending = bookings.find(
          (b: Booking) => {
            const isSameRoom = (typeof b.room === 'string' ? b.room === roomId : b.room._id === roomId);
            const isPendingOrFailed = (b.paymentStatus === 'pending' || b.paymentStatus === 'failed');
            const isNotExpired = !['expired', 'cancelled', 'rejected'].includes(b.status);
            const bookingAge = Date.now() - new Date(b.createdAt).getTime();
            const isRecent = bookingAge < duplicateWindow;

            return isSameRoom && isPendingOrFailed && isNotExpired && isRecent;
          }
        );

        if (existingPending) {
          setPendingBooking(existingPending);
          setStep('payment'); // Already has a reservation, go to checkout step
          
          if (isRetry) {
            handleInitializePayment(existingPending._id);
          }
        }
      } catch (error: unknown) {
        const msg = getReadableError(error, 'Could not load checkout');
        toast.error(msg);
        if (msg.includes('not found')) router.push('/hostels');
      } finally {
        setLoading(false);
      }
    };

    if (roomId) fetchData();
  }, [roomId, isRetry, handleInitializePayment, router]);

  // CREATE BOOKING
  const handleCreateBooking = async () => {
    if (maintenanceMode) {
      toast.error('Platform is currently under maintenance. Bookings are temporarily disabled.');
      return;
    }
    if (checkoutState === 'processing' || paymentLockRef.current) return;

    if (pendingBooking) {
      if (['paid', 'success', 'completed'].includes(pendingBooking.paymentStatus)) {
         router.replace(`/payments/success?bookingId=${pendingBooking._id}`);
         return;
      }
      setStep('payment');
      return;
    }

    if (!room || room.availableBeds <= 0 || room.roomStatus === 'unavailable') {
      toast.error('This room is no longer available.');
      return;
    }

    try {
      setCheckoutState('processing');
      const bookingResponse = await createBooking({
        room: room._id,
        hostel: typeof room.hostel === 'object' ? room.hostel._id : room.hostel,
        checkInDate: new Date().toISOString(),
        refundPolicyAccepted,
      });

      setPendingBooking(bookingResponse);
      setStep('payment'); // Move to final checkout step after hold is created
    } catch (error: unknown) {
      toast.error(getReadableError(error, 'Unable to secure reservation'));
    } finally {
      setCheckoutState('idle');
    }
  };


  // LOADING
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-6">
          <div className="relative">
            <div className="h-20 w-20 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600" />
            <div className="absolute inset-0 flex items-center justify-center">
              <FaShieldAlt className="text-blue-600 animate-pulse" />
            </div>
          </div>

          <div className="text-center">
            <p className="text-slate-900 font-black uppercase tracking-[0.3em] text-[10px] mb-2">
              Secure Session
            </p>
            <p className="text-slate-400 font-medium">
              Preparing your checkout experience...
            </p>
          </div>
        </div>
      </div>
    );
  }

  // ROOM NOT FOUND
  if (!room) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="rounded-[3rem] bg-white p-16 text-center shadow-xl">
          <h1 className="text-4xl font-black text-slate-900">
            Room Not Found
          </h1>

          <Link
            href="/hostels"
            className="mt-8 inline-block rounded-2xl bg-blue-600 px-8 py-4 font-bold text-white transition hover:scale-105"
          >
            Back to Hostels
          </Link>
        </div>
      </div>
    );
  }

  const hostelData =
    typeof room.hostel ===
    'object'
      ? room.hostel
      : null;

  const steps = [
    {
      id: 'review',
      label: 'Review Room',
    },
    {
      id: 'confirm',
      label:
        'Secure Booking',
    },
    {
      id: 'payment',
      label: 'Checkout',
    },
  ];

  const currentStepIndex =
    steps.findIndex(
      (s) => s.id === step
    );

  return (
    <ProtectedRoute>
      <main className="min-h-screen bg-slate-50 pb-20">

        {/* TOP NAV */}
        <nav className="sticky top-0 z-50 border-b border-slate-200 bg-white/80 backdrop-blur-md">
          <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">

            <div className="flex items-center gap-4">

              <button
                onClick={() => {
                  if (step === 'review') {
                    const hostelId = typeof room?.hostel === 'object' ? room.hostel._id : room?.hostel;
                    router.push(`/hostels/${hostelId}`);
                  } else {
                    setStep(steps[currentStepIndex - 1].id as Step);
                  }
                }}
                className="p-3 rounded-2xl hover:bg-slate-100 transition text-slate-600"
              >
                <FaArrowLeft />
              </button>

              <div>
                <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest leading-none mb-1">
                  {hostelData?.name ||
                    'Hostel'}
                </h3>

                <h2 className="text-lg font-black text-slate-900 leading-none">
                  {room.roomType}
                </h2>
              </div>
            </div>

            {/* DESKTOP STEPS */}
            <div className="hidden md:flex items-center gap-2 lg:gap-3">
              {steps.map(
                (s, idx) => (
                  <div
                    key={s.id}
                    className="flex items-center gap-2 lg:gap-3"
                  >
                    <div
                      className={`flex items-center gap-2 px-3 lg:px-4 py-1.5 lg:py-2 rounded-full transition-all duration-500 ${
                        idx ===
                        currentStepIndex
                          ? 'bg-blue-600 text-white shadow-lg shadow-blue-200'
                          : idx <
                              currentStepIndex
                            ? 'bg-emerald-100 text-emerald-600'
                            : 'bg-slate-100 text-slate-400'
                      }`}
                    >
                      <span className="text-[10px] lg:text-xs font-black">
                        {idx + 1}
                      </span>

                      <span className="text-xs lg:text-sm font-bold whitespace-nowrap">
                        {s.label}
                      </span>

                      {idx <
                        currentStepIndex && (
                        <FaCheckCircle className="text-[10px] lg:text-xs" />
                      )}
                    </div>

                    {idx <
                      steps.length -
                        1 && (
                      <div className="w-4 lg:w-8 h-0.5 bg-slate-100 rounded-full" />
                    )}
                  </div>
                )
              )}
            </div>

            <div className="flex items-center gap-2">
              <FaShieldAlt className="text-blue-600 text-xl" />

              <span className="hidden sm:inline text-xs font-black text-slate-400 uppercase tracking-widest">
                Secure Checkout
              </span>
            </div>
          </div>

          {/* MOBILE PROGRESS */}
          <div className="h-1 bg-slate-100 w-full overflow-hidden">
            <motion.div
              className="h-full bg-blue-600"
              initial={{
                width: 0,
              }}
              animate={{
                width: `${
                  ((currentStepIndex +
                    1) /
                    steps.length) *
                  100
                }%`,
              }}
              transition={{
                duration: 0.5,
              }}
            />
          </div>
        </nav>

        {/* PAGE CONTENT */}
        <div className="max-w-7xl mx-auto px-6 pt-12">

          <div className="flex flex-col lg:flex-row gap-12 items-start">

            {/* MAIN AREA */}
            <div className="w-full lg:w-[65%] xl:w-[68%]">

              <AnimatePresence mode="wait">

                {/* REVIEW STEP */}
                {step ===
                  'review' && (
                  <motion.div
                    key="review"
                    initial={{
                      opacity: 0,
                      y: 20,
                    }}
                    animate={{
                      opacity: 1,
                      y: 0,
                    }}
                    exit={{
                      opacity: 0,
                      y: -20,
                    }}
                    className="space-y-8"
                  >
                    <div className="bg-white rounded-[3rem] shadow-2xl shadow-slate-200/50 overflow-hidden border border-slate-100/50">
                      
                      {/* ROOM HERO */}
                      <div className="relative h-64 md:h-80 w-full bg-slate-100">
                        {room.displayImage || room.featuredImage || (room.images && room.images[0]) ? (
                          <img 
                            src={getOptimizedImageUrl(room.displayImage || room.featuredImage || room.images[0], 'w_800,h_600,c_fill,q_auto,f_auto')} 
                            alt={room.roomType}
                            loading="lazy"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-slate-300">
                            <FaBed className="text-6xl" />
                          </div>
                        )}
                        <div className="absolute top-6 left-6">
                          <span className="bg-white/90 backdrop-blur px-4 py-2 rounded-2xl text-[10px] font-black tracking-widest text-blue-700 uppercase shadow-xl">
                            {room.roomType}
                          </span>
                        </div>
                        <div className="absolute bottom-6 right-6">
                          <div className="bg-emerald-500 text-white px-4 py-2 rounded-2xl text-[10px] font-black tracking-widest uppercase flex items-center gap-2 shadow-xl shadow-emerald-500/20">
                            <FaCheckCircle />
                            Verified Hostel
                          </div>
                        </div>
                      </div>

                      <div className="p-10 md:p-14">
                        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
                          <div>
                            <h3 className="text-sm font-black text-blue-600 uppercase tracking-[0.2em] mb-2">
                              {hostelData?.name || 'Hostel Selection'}
                            </h3>
                            <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight">
                              Review Your Room
                            </h1>
                            <p className="text-slate-500 font-medium mt-2 flex items-center gap-2">
                              <span className="bg-slate-100 p-1.5 rounded-lg text-slate-400">
                                <FaShieldAlt className="text-xs" />
                              </span>
                              {hostelData?.location 
                                ? (typeof hostelData.location === 'object' 
                                    ? `${hostelData.location.city}, ${hostelData.location.region}` 
                                    : hostelData.location)
                                : 'Location details confirmed'}
                            </p>
                          </div>

                          <div className="bg-slate-50 rounded-3xl p-6 border border-slate-100 min-w-[200px]">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Billing Period</p>
                            <p className="text-xl font-black text-slate-900 capitalize">{room.billingPeriod || 'Academic Year'}</p>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                          <div className="flex items-center gap-4 p-5 rounded-[2rem] bg-slate-50 border border-slate-100">
                            <div className="bg-white p-3 rounded-2xl shadow-sm text-blue-600">
                              <FaBed />
                            </div>
                            <div>
                              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Occupancy</p>
                              <p className="font-bold text-slate-900">{room.occupancyStyle || 'Standard'}</p>
                            </div>
                          </div>

                          <div className="flex items-center gap-4 p-5 rounded-[2rem] bg-slate-50 border border-slate-100">
                            <div className="bg-white p-3 rounded-2xl shadow-sm text-emerald-600">
                              <FaCheckCircle />
                            </div>
                            <div>
                              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Availability</p>
                              <p className="font-bold text-slate-900">{room.availableBeds} Beds Left</p>
                            </div>
                          </div>

                          <div className="flex items-center gap-4 p-5 rounded-[2rem] bg-slate-50 border border-slate-100">
                            <div className="bg-white p-3 rounded-2xl shadow-sm text-amber-600">
                              <FaInfoCircle />
                            </div>
                            <div>
                              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Washroom</p>
                              <p className="font-bold text-slate-900">{room.privateWashroom ? 'Private' : 'Shared'}</p>
                            </div>
                          </div>
                        </div>

                        {/* AMENITIES PREVIEW - High Trust Signal */}
                        {room.amenities && room.amenities.length > 0 && (
                          <div className="mb-12">
                            <h4 className="text-[10px] font-black text-blue-600 uppercase tracking-[0.2em] mb-4">Included Room Amenities</h4>
                            <div className="flex flex-wrap gap-2">
                              {room.amenities.slice(0, 12).map((amenity, idx) => (
                                <span 
                                  key={idx} 
                                  className="flex items-center gap-1.5 rounded-xl bg-blue-50 px-4 py-2 text-xs font-bold text-blue-700 border border-blue-200 shadow-sm"
                                >
                                  <FaCheckCircle className="text-[10px]" /> {amenity}
                                </span>
                              ))}
                              {room.amenities.length > 12 && (
                                <span className="bg-slate-50 border border-slate-100 px-4 py-2 rounded-xl text-xs font-bold text-slate-400">
                                  +{room.amenities.length - 12} more
                                </span>
                              )}
                            </div>
                          </div>
                        )}

                        <div className="rounded-[2rem] bg-blue-50/50 p-8 border border-blue-100/50 flex items-start gap-6">
                          <div className="bg-blue-600 p-3 rounded-2xl text-white shadow-lg shadow-blue-200 shrink-0">
                            <FaShieldAlt />
                          </div>
                          <p className="text-base font-medium leading-relaxed text-blue-900/70">
                            By continuing, you agree to reserve this room at <span className="font-black text-blue-900">{hostelData?.name}</span>. You will be able to review the full payment breakdown before finalizing your stay.
                          </p>
                        </div>

                      </div>
                    </div>

                    <button
                      onClick={() => setStep('confirm')}
                      className="group w-full md:w-auto bg-slate-900 hover:bg-black text-white px-12 py-6 rounded-[2rem] text-xl font-black shadow-2xl shadow-slate-900/20 transition-all flex items-center justify-center gap-4 hover:scale-[1.02] active:scale-[0.98]"
                    >
                      <span>Continue to Reservation</span>
                      <FaChevronRight className="text-sm group-hover:translate-x-1 transition-transform" />
                    </button>
                  </motion.div>
                )}

                {/* SECURE BOOKING STEP */}
                {step ===
                  'confirm' && (
                  <motion.div
                    key="confirm"
                    initial={{
                      opacity: 0,
                      y: 20,
                    }}
                    animate={{
                      opacity: 1,
                      y: 0,
                    }}
                    exit={{
                      opacity: 0,
                      y: -20,
                    }}
                    className="space-y-8"
                  >
                    <div className="bg-white rounded-[3rem] shadow-2xl shadow-slate-200/50 p-10 md:p-14 border border-slate-100/50">

                      <div className="flex items-center gap-6 mb-10">
                        <div className="bg-blue-600 p-5 rounded-3xl text-3xl text-white shadow-lg shadow-blue-200">
                          <FaLock />
                        </div>

                        <div>
                          <span className="rounded-full bg-blue-100 px-4 py-1 text-[10px] font-black tracking-widest text-blue-700 uppercase">
                            Step 2 of 3
                          </span>

                          <h1 className="text-4xl md:text-5xl font-black text-slate-900 mt-2 tracking-tight">
                            Secure Your Booking
                          </h1>
                        </div>
                      </div>

                      <div className="mb-10 rounded-[2rem] bg-blue-50/50 p-8 border border-blue-100/50">
                        <p className="text-lg font-medium leading-relaxed text-blue-900/70">
                          Please verify your student details below. Once you click &quot;Continue to Checkout&quot;, we will temporarily secure this room for you at <span className="font-black text-blue-900">{hostelData?.name}</span>.
                        </p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
                        <div className="p-6 rounded-[2rem] bg-slate-50 border border-slate-100">
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Student Name</p>
                          <p className="text-lg font-bold text-slate-900">{user?.name || 'Guest Student'}</p>
                        </div>
                        <div className="p-6 rounded-[2rem] bg-slate-50 border border-slate-100">
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Email Address</p>
                          <p className="text-lg font-bold text-slate-900">{user?.email || 'N/A'}</p>
                        </div>
                        <div className="p-6 rounded-[2rem] bg-slate-50 border border-slate-100">
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Room Selection</p>
                          <p className="text-lg font-bold text-slate-900">{room.roomType}</p>
                        </div>
                        <div className="p-6 rounded-[2rem] bg-slate-50 border border-slate-100">
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Check-in Date</p>
                          <p className="text-lg font-bold text-slate-900">Academic Year 2024/2025</p>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div className="flex items-start gap-4 p-6 rounded-[2rem] bg-slate-50 border border-slate-100">
                          <div className="mt-1 bg-blue-100 p-2 rounded-full text-blue-600">
                            <FaInfoCircle className="text-sm" />
                          </div>
                          <div>
                            <h4 className="font-black text-slate-900 uppercase tracking-wider text-xs mb-1">Reservation Policy</h4>
                            <p className="text-sm text-slate-500 font-medium">By continuing, a 15-minute hold will be placed on this room. You must complete the payment within this window to finalize your stay.</p>
                          </div>
                        </div>

                        {/* REFUND POLICY CONSENT */}
                        <div className="p-6 rounded-[2rem] bg-blue-50 border border-blue-100 transition-all hover:bg-blue-100/50">
                          <label className="flex items-start gap-4 cursor-pointer group mb-3">
                            <input
                              type="checkbox"
                              checked={refundPolicyAccepted}
                              onChange={(e) => setRefundPolicyAccepted(e.target.checked)}
                              className="mt-1 h-5 w-5 rounded border-blue-300 text-blue-600 focus:ring-blue-500 cursor-pointer transition-transform group-active:scale-90"
                            />
                            <span className="text-sm font-bold text-blue-900/70 leading-relaxed group-hover:text-blue-900 transition-colors">
                              I acknowledge the accommodation provider&apos;s 
                              <Link href="/refund-policy" target="_blank" className="mx-1 text-blue-600 hover:underline decoration-2 underline-offset-4">cancellation and refund terms</Link> 
                              and understand that Relaxly will support the refund process when applicable.
                            </span>
                          </label>
                          <p className="text-[10px] font-medium text-blue-900/40 leading-relaxed pl-9">
                            By continuing, you confirm that you have reviewed the applicable booking, cancellation, and refund terms associated with this accommodation.
                          </p>
                        </div>
                      </div>

                    </div>

                    <button
                      onClick={handleCreateBooking}
                      disabled={checkoutState === 'processing' || !refundPolicyAccepted}
                      className="group w-full md:w-auto bg-slate-900 hover:bg-black text-white px-12 py-6 rounded-[2rem] text-xl font-black shadow-2xl shadow-slate-900/20 transition-all flex items-center justify-center gap-4 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {checkoutState === 'processing' ? (
                        <>
                          <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          <span>Securing Your Spot...</span>
                        </>
                      ) : (
                        <>
                          <span>Continue to Checkout</span>
                          <FaChevronRight className="text-sm group-hover:translate-x-1 transition-transform" />
                        </>
                      )}
                    </button>
                  </motion.div>
                )}


                {/* CHECKOUT STEP */}
                {step ===
                  'payment' && (
                  <motion.div
                    key="payment"
                    initial={{
                      opacity: 0,
                      scale: 0.95,
                    }}
                    animate={{
                      opacity: 1,
                      scale: 1,
                    }}
                    className="space-y-8"
                  >
                    {checkoutState === 'processing' ? (
                      <div className="bg-white rounded-[4rem] shadow-2xl shadow-slate-200/50 p-20 text-center border border-slate-100">
                        <div className="flex flex-col items-center gap-10">
                          <div className="relative">
                            <div className="h-40 w-40 animate-spin rounded-full border-[12px] border-slate-50 border-t-blue-600" />
                            <div className="absolute inset-0 flex items-center justify-center text-5xl text-blue-600">
                              <FaLock />
                            </div>
                          </div>
                          <div>
                            <h2 className="text-4xl md:text-5xl font-black text-slate-900 mb-6 tracking-tight">
                              Preparing Secure Checkout
                            </h2>
                            <p className="text-xl text-slate-500 font-medium max-w-md mx-auto leading-relaxed">
                              We are connecting you to our secure payment partner. This will only take a moment.
                            </p>
                          </div>
                          <div className="flex items-center gap-3 text-slate-400 font-black uppercase tracking-[0.2em] text-[10px] bg-slate-50 px-6 py-3 rounded-full">
                            <span className="relative flex h-2 w-2">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                              <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                            </span>
                            Encrypted Connection
                          </div>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="bg-white rounded-[3rem] shadow-2xl shadow-slate-200/50 p-10 md:p-14 border border-slate-100/50">
                          <div className="flex items-center gap-6 mb-10">
                            <div className="bg-emerald-600 p-5 rounded-3xl text-3xl text-white shadow-lg shadow-emerald-200">
                              <FaCheckCircle />
                            </div>
                            <div>
                              <span className="rounded-full bg-emerald-100 px-4 py-1 text-[10px] font-black tracking-widest text-emerald-700 uppercase">
                                Final Confirmation
                              </span>
                              <h1 className="text-4xl md:text-5xl font-black text-slate-900 mt-2 tracking-tight">
                                Confirm Your Stay
                              </h1>
                            </div>
                          </div>

                          <div className="mb-10 rounded-[2rem] bg-emerald-50/50 p-8 border border-emerald-100/50">
                            <p className="text-lg font-medium leading-relaxed text-emerald-900/70">
                              Your room is now temporarily held. Please review the payment summary on the right and complete your payment to finalize your booking at <span className="font-black text-emerald-900">{hostelData?.name}</span>.
                            </p>
                          </div>

                          <div className="space-y-4">
                            <div className="flex items-start gap-4 p-6 rounded-[2rem] bg-slate-50 border border-slate-100">
                              <div className="mt-1 bg-blue-100 p-2 rounded-full text-blue-600">
                                <FaInfoCircle className="text-sm" />
                              </div>
                              <div>
                                <h4 className="font-black text-slate-900 uppercase tracking-wider text-xs mb-1">Final Step</h4>
                                <p className="text-sm text-slate-500 font-medium">To avoid losing your reservation, please complete payment before the timer expires. You will be redirected to our secure payment gateway.</p>
                              </div>
                            </div>
                          </div>
                        </div>

                        <button
                          onClick={() => {
                            if (pendingBooking) {
                              handleInitializePayment(pendingBooking._id);
                            } else {
                              toast.error('Reservation session expired. Please restart.');
                            }
                          }}
                          className="w-full md:w-auto bg-emerald-600 hover:bg-emerald-700 text-white px-12 py-6 rounded-[2rem] text-xl font-black shadow-2xl shadow-emerald-500/30 transition-all flex items-center justify-center gap-4 hover:scale-[1.02] active:scale-[0.98]"
                        >
                          <span>Complete Secure Payment</span>
                          <FaCreditCard className="text-sm" />
                        </button>
                      </>
                    )}
                  </motion.div>
                )}

              </AnimatePresence>
            </div>

            {/* SIDEBAR */}
            <div className="w-full lg:w-[32%] xl:w-[30%] lg:sticky lg:top-32 space-y-8">
              {pendingBooking?.expiresAt && (
                <div className="transition-all duration-500 hover:scale-[1.02]">
                  <ReservationTimer 
                    expiresAt={pendingBooking.expiresAt} 
                    onExpire={() => {
                      toast.error('Reservation expired. Please restart the booking.');
                      setPendingBooking(null);
                      setStep('review');
                    }}
                  />
                </div>
              )}

              {pendingBooking && (
                <div className="rounded-[2.5rem] bg-blue-50/50 p-8 flex items-start gap-5 ring-1 ring-blue-100/50 shadow-xl shadow-blue-500/5 transition-all hover:bg-blue-50">
                  <div className="bg-blue-600 p-2.5 rounded-xl text-white shadow-lg shadow-blue-200 shrink-0">
                    <FaInfoCircle className="text-sm" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Active Reservation</h4>
                    <p className="text-sm font-bold text-blue-900/70 leading-relaxed">
                      This room is locked for you. Complete payment before the timer expires to finalize your stay.
                    </p>
                  </div>
                </div>
              )}

              <div className="transition-all duration-500 hover:translate-y-[-4px]">
                <PaymentBreakdown
                  roomPrice={pendingBooking?.roomPrice || room.price}
                  basePrice={pendingBooking?.basePrice || room.basePrice}
                  platformAdjustment={pendingBooking?.platformAdjustment || room.adjustmentAmount}
                  bookingFee={
                    pendingBooking?.bookingFee !== undefined 
                      ? pendingBooking.bookingFee 
                      : (publicSettings?.serviceFeePercent !== undefined 
                          ? ((room.totalPrice || room.price) * publicSettings.serviceFeePercent) / 100 
                          : 0)
                  }
                  serviceFeePercent={publicSettings?.serviceFeePercent}
                  totalPaid={
                    pendingBooking?.totalPaid !== undefined
                      ? pendingBooking.totalPaid
                      : ((room.totalPrice || room.price) + 
                          (publicSettings?.serviceFeePercent !== undefined 
                            ? ((room.totalPrice || room.price) * publicSettings.serviceFeePercent) / 100 
                            : 0))
                  }
                  loading={loading || (checkoutState === 'processing' && step === 'review')}
                />
              </div>
              
              {/* TRUST BADGE */}
              <div className="flex flex-col items-center gap-4 py-8 opacity-50 grayscale hover:opacity-100 hover:grayscale-0 transition-all duration-700">
                <div className="flex items-center gap-6">
                  <FaShieldAlt className="text-2xl text-slate-400" />
                  <FaLock className="text-2xl text-slate-400" />
                  <FaCheckCircle className="text-2xl text-slate-400" />
                </div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Certified Secure Checkout</p>
              </div>
            </div>

          </div>
        </div>
      </main>
    </ProtectedRoute>
  );
}
