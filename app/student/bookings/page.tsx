'use client';

import { useCallback, useEffect, useState } from 'react';

import Link from 'next/link';

import toast from 'react-hot-toast';

import {
  FaCalendarAlt,
  FaCreditCard,
  FaHome,
  FaMapMarkerAlt,
  FaArrowLeft,
  FaReceipt,
  FaPhoneAlt,
  FaExclamationTriangle,
  FaChevronRight,
  FaHistory,
  FaInfoCircle,
  FaBars,
} from 'react-icons/fa';

import { useNav } from '../layout';

import { useAuthStore } from '../../../src/store/authStore';

import {
  getMyBookings,
  cancelBooking,
} from '../../../src/services/bookingService';

import { initializePayment } from '../../../src/services/paymentService';

import { connectSocket } from '../../../src/lib/socket';

import {
  motion,
  AnimatePresence,
} from 'framer-motion';

import ConfirmationModal from '../../../src/components/common/ConfirmationModal';

interface Booking {
  _id: string;

  hostel: {
    _id: string;

    name: string;

    location: string;

    owner?: {
      _id?: string;

      name: string;

      email: string;

      phone?: string;
    };
  };

  room: {
    _id: string;

    roomType: string;

    price: number;

    images?: string[];
  };

  bookingStatus: string;

  paymentStatus: string;

  totalPaid: number;

  roomPrice: number;

  bookingFee: number;

  paymentReference?: string;
  bookingCode?: string;
  createdAt: string;
}

const statusColors: Record<string, string> = {
  paid:
    'bg-emerald-100 text-emerald-700 border-emerald-200',

  success:
    'bg-emerald-100 text-emerald-700 border-emerald-200',

  completed:
    'bg-emerald-100 text-emerald-700 border-emerald-200',

  pending:
    'bg-amber-100 text-amber-700 border-amber-200',

  failed:
    'bg-red-100 text-red-700 border-red-200',

  cancelled:
    'bg-slate-100 text-slate-700 border-slate-200',

  rejected:
    'bg-red-100 text-red-700 border-red-200',

  approved:
    'bg-blue-100 text-blue-700 border-blue-200',

  expired:
    'bg-slate-200 text-slate-500 border-slate-300',
};

export default function BookingsPage() {
  const { openSidebar } = useNav();
  const { token } =
    useAuthStore();

  const [bookings, setBookings] =
    useState<Booking[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [processingId, setProcessingId] =
    useState<string | null>(null);

  const [
    isCancelModalOpen,
    setIsCancelModalOpen,
  ] = useState(false);

  const [
    bookingToCancel,
    setBookingToCancel,
  ] = useState<string | null>(
    null
  );

  const fetchBookings =
    useCallback(async () => {
      try {
        if (!token) return;

        const data =
          await getMyBookings(
            token
          );

        setBookings(data as Booking[]);
      } catch {
        toast.error(
          'Failed to load bookings'
        );
      } finally {
        setLoading(false);
      }
    }, [token]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void fetchBookings();
    }, 0);

    return () => window.clearTimeout(timer);
  }, [fetchBookings]);

  // Listen for real-time payment updates
  useEffect(() => {
    if (!token) return;

    let activeSocket: any;

    const setupSocket = async () => {
      activeSocket = await connectSocket(token);
      if (activeSocket) {
        activeSocket.on('payment_update', (data: { bookingId: string }) => {
          // Refresh the list if the current page has the updated booking
          fetchBookings();
        });
      }
    };

    setupSocket();

    return () => {
      if (activeSocket) {
        activeSocket.off('payment_update');
      }
    };
  }, [token, fetchBookings]);

  const handlePayNow =
    async (
      bookingId: string
    ) => {
      if (processingId) {
        return;
      }

      try {
        setProcessingId(bookingId);

        // STABILIZATION: Pre-validate status before initializing
        const freshBookings = await getMyBookings(token || '');
        const current = freshBookings.find(b => b._id === bookingId);
        
        if (current && isPaid(current.paymentStatus)) {
           toast.success('This booking is already paid.');
           void fetchBookings();
           return;
        }

        if (current && (current.paymentStatus === 'expired' || (current as any).status === 'expired')) {
           toast.error('This reservation has expired.');
           void fetchBookings();
           return;
        }

        const payment = await initializePayment(bookingId);

        if (!payment.authorization_url) {
          throw new Error('Payment session unavailable');
        }

        window.location.assign(payment.authorization_url);
      } catch (error: unknown) {
        setProcessingId(null);
        toast.error(
          error instanceof Error
            ? error.message
            : 'Unable to initialize payment'
        );
      }
    };

  const handleCancelClick =
    (
      bookingId: string
    ) => {
      setBookingToCancel(
        bookingId
      );

      setIsCancelModalOpen(
        true
      );
    };

  const confirmCancellation =
    async () => {
      if (
        !bookingToCancel
      )
        return;

      try {
        setProcessingId(
          bookingToCancel
        );

        await cancelBooking(
          bookingToCancel
        );

        toast.success(
          'Booking cancelled'
        );

        fetchBookings();
      } catch (error: unknown) {
        toast.error(
          error instanceof Error
            ? error.message
            : 'Cancellation failed'
        );
      } finally {
        setProcessingId(
          null
        );

        setBookingToCancel(
          null
        );

        setIsCancelModalOpen(
          false
        );
      }
    };

  const isPaid = (
    status: string
  ) =>
    [
      'paid',
      'success',
      'completed',
    ].includes(
      status.toLowerCase()
    );

  const canPay = (booking: Booking) => {
    const pStatus = booking.paymentStatus.toLowerCase();
    const bStatus = (booking as any).status?.toLowerCase() || '';
    const bookingStatus = (booking as any).bookingStatus?.toLowerCase() || bStatus;
    
    return (pStatus === 'pending' || pStatus === 'failed') && 
           !['expired', 'cancelled', 'rejected'].includes(bookingStatus);
  };

  return (
    <main className="min-h-screen bg-slate-50">
      {/* TOP BAR */}
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-4">
            <button
              onClick={openSidebar}
              className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-50 text-slate-600 transition hover:bg-slate-100 lg:hidden"
            >
              <FaBars className="text-xl" />
            </button>

            <Link
              href="/student/dashboard"
              className="rounded-2xl p-3 text-slate-600 transition hover:bg-slate-100"
            >
              <FaArrowLeft />
            </Link>

            <h1 className="text-2xl font-black text-slate-900">
              My Stays
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/hostels"
              className="rounded-2xl bg-blue-600 px-6 py-3 font-bold text-white shadow-lg shadow-blue-500/20 transition hover:bg-blue-700"
            >
              Find More
            </Link>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-6 py-12">
          {loading ? (
            <div className="grid gap-8">
              {[1, 2, 3].map(
                (i) => (
                  <div
                    key={i}
                    className="h-64 animate-pulse rounded-[3rem] border border-slate-100 bg-white shadow-sm"
                  />
                )
              )}
            </div>
          ) : bookings.length ===
            0 ? (
            <motion.div
              initial={{
                opacity: 0,
                y: 20,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              className="rounded-[3.5rem] border border-slate-100 bg-white p-20 text-center shadow-sm"
            >
              <div className="mx-auto mb-8 flex h-28 w-28 items-center justify-center rounded-full bg-blue-50 text-5xl text-blue-600">
                <FaHome />
              </div>

              <h2 className="mb-4 text-4xl font-black text-slate-900">
                No Bookings Found
              </h2>

              <p className="mx-auto mb-10 max-w-md text-lg font-medium text-slate-500">
                You haven&apos;t made
                any bookings yet.
              </p>

              <Link
                href="/hostels"
                className="inline-block rounded-3xl bg-blue-600 px-10 py-5 font-black text-white shadow-xl shadow-blue-500/30 transition hover:scale-105"
              >
                Browse Hostels
              </Link>
            </motion.div>
          ) : (
            <div className="grid gap-10">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="flex items-center gap-3 text-xl font-black uppercase tracking-tight text-slate-900">
                  <FaHistory className="text-blue-600" />
                  Booking History
                </h2>
              </div>

              <AnimatePresence>
                {bookings.map(
                  (
                    booking,
                    idx
                  ) => (
                    <motion.div
                      key={
                        booking._id
                      }
                      initial={{
                        opacity: 0,
                        y: 20,
                      }}
                      animate={{
                        opacity: 1,
                        y: 0,
                      }}
                      transition={{
                        delay:
                          idx *
                          0.1,
                      }}
                      className="overflow-hidden rounded-[3rem] border border-slate-100 bg-white shadow-sm"
                    >
                      <div className="flex flex-col lg:flex-row">
                        {/* IMAGE */}
                        <div className="relative h-64 shrink-0 overflow-hidden bg-slate-100 lg:h-auto lg:w-80">
                          {booking.room
                            .images &&
                          booking.room
                            .images
                            .length >
                            0 ? (
                            <img
                              src={
                                booking
                                  .room
                                  .images[0]
                              }
                              alt={
                                booking
                                  .room
                                  .roomType
                              }
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="flex h-full items-center justify-center text-slate-300">
                              <FaHome className="text-6xl" />
                            </div>
                          )}

                          <div className="absolute left-6 top-6 flex flex-col gap-2">
                            <span
                              className={`rounded-full border px-4 py-2 text-[10px] font-black uppercase tracking-widest ${
                                statusColors[
                                  booking
                                    .paymentStatus
                                ]
                              }`}
                            >
                              Payment:{' '}
                              {
                                booking.paymentStatus
                              }
                            </span>
                          </div>
                        </div>

                        {/* DETAILS */}
                        <div className="flex-1 p-8 lg:p-12">
                          <div className="mb-8 flex flex-col items-start justify-between gap-4 md:flex-row">
                            <div>
                              <div className="mb-2 flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-blue-600">
                                <span>
                                  {
                                    booking
                                      .room
                                      .roomType
                                  }
                                </span>

                                <span>
                                  CODE:
                                  {' '}
                                  {booking.bookingCode || 'N/A'}
                                </span>
                              </div>

                              <h2 className="text-4xl font-black text-slate-900">
                                {
                                  booking
                                    .hostel
                                    .name
                                }
                              </h2>

                              <div className="mt-2 flex items-center gap-2 font-bold text-slate-400">
                                <FaMapMarkerAlt className="text-blue-500" />

                                <span>
                                  {
                                    booking
                                      .hostel
                                      .location
                                  }
                                </span>
                              </div>
                            </div>

                            <div className="rounded-3xl bg-slate-50 p-6 text-right">
                              <p className="mb-1 text-[10px] font-black uppercase tracking-widest text-slate-400">
                                Total Amount
                              </p>

                              <h3 className="text-3xl font-black text-slate-900">
                                GHS{' '}
                                {
                                  booking.totalPaid
                                }
                              </h3>
                            </div>
                          </div>

                          {/* INFO */}
                          <div className="grid grid-cols-1 gap-6 border-t border-slate-50 pt-8 md:grid-cols-2">
                            <div className="flex items-center gap-4 rounded-3xl border border-slate-100 bg-slate-50/50 p-5">
                              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-xl text-blue-600 shadow-sm">
                                <FaCalendarAlt />
                              </div>

                              <div>
                                <p className="mb-1 text-[10px] font-black uppercase tracking-widest text-slate-400">
                                  Reserved Since
                                </p>

                                <p className="font-black text-slate-900">
                                  {new Date(
                                    booking.createdAt
                                  ).toLocaleDateString()}
                                </p>
                              </div>
                            </div>

                            <div className="flex items-center gap-4 rounded-3xl border border-slate-100 bg-slate-50/50 p-5">
                              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-xl text-blue-600 shadow-sm">
                                <FaPhoneAlt />
                              </div>

                              <div>
                                <p className="mb-1 text-[10px] font-black uppercase tracking-widest text-slate-400">
                                  Host Contact
                                </p>

                                <p className="font-black text-slate-900">
                                  {booking
                                    .hostel
                                    .owner
                                    ?.phone ||
                                    'No phone available'}
                                </p>

                                <p className="text-xs font-bold text-slate-400">
                                  {booking
                                    .hostel
                                    .owner
                                    ?.name ||
                                    'Hostel Owner'}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* ACTIONS */}
                        <div className="flex flex-col justify-center gap-4 border-l border-slate-100 bg-slate-50 p-8 lg:w-80">
                          {isPaid(
                            booking.paymentStatus
                          ) ? (
                            <div className="space-y-4">
                              <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-4 text-center">
                                <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-1">Status</p>
                                <p className="text-sm font-black text-emerald-700">
                                  {(booking as any).bookingStatus === 'approved' ? 'Confirmed' : 'Payment Verified'}
                                </p>
                              </div>
                              <button
                                onClick={() =>
                                  window.open(
                                    `/payments/receipt/${booking._id}`,
                                    '_blank'
                                  )
                                }
                                className="w-full rounded-[2rem] bg-blue-600 py-6 text-lg font-black text-white shadow-xl shadow-blue-500/20 transition hover:bg-blue-700"
                              >
                                <div className="flex items-center justify-center gap-3">
                                  <FaReceipt />
                                  View Receipt
                                </div>
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() =>
                                handlePayNow(
                                  booking._id
                                )
                              }
                              disabled={
                                processingId !== null || !canPay(booking)
                              }
                              className={`w-full rounded-[2rem] py-6 text-lg font-black text-white shadow-xl transition ${
                                booking.paymentStatus === 'failed' 
                                  ? 'bg-rose-600 shadow-rose-500/20 hover:bg-rose-700' 
                                  : 'bg-emerald-600 shadow-emerald-500/20 hover:bg-emerald-700'
                              } disabled:opacity-50 disabled:grayscale`}
                            >
                              <div className="flex items-center justify-center gap-3">
                                <FaCreditCard />
                                {processingId === booking._id
                                  ? 'Opening...'
                                  : booking.paymentStatus === 'failed' 
                                    ? 'Retry Payment' 
                                    : 'Complete Payment'}
                              </div>
                            </button>
                          )}

                          <Link
                            href={`/hostels/${booking.hostel._id}`}
                            className="flex w-full items-center justify-center gap-2 rounded-[2rem] border-2 border-slate-200 bg-white py-6 text-center text-lg font-black text-slate-900 transition hover:bg-slate-100"
                          >
                            Hostel Details
                            <FaChevronRight className="text-sm" />
                          </Link>

                          {!isPaid(
                            booking.paymentStatus
                          ) && (
                            <button
                              onClick={() =>
                                handleCancelClick(
                                  booking._id
                                )
                              }
                              className="mt-2 flex items-center justify-center gap-2 py-2 text-sm font-black uppercase tracking-widest text-red-500 transition-colors hover:text-red-700"
                            >
                              <FaExclamationTriangle />
                              Cancel Booking
                            </button>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  )
                )}
              </AnimatePresence>
            </div>
          )}
        </div>

        {/* MODAL */}
        <ConfirmationModal
          isOpen={
            isCancelModalOpen
          }
          onClose={() =>
            setIsCancelModalOpen(
              false
            )
          }
          onConfirm={
            confirmCancellation
          }
          title="Cancel Booking?"
          message="Are you sure you want to cancel this booking?"
          confirmText="Yes, Cancel"
          type="danger"
          loading={
            processingId !==
            null
          }
        />

        {/* HELP */}
        <div className="fixed bottom-10 right-10 z-50">
          <button className="group relative rounded-3xl bg-slate-900 p-5 text-white shadow-2xl transition hover:scale-110">
            <FaInfoCircle className="text-2xl" />

            <div className="invisible absolute bottom-full right-0 mb-4 w-64 rounded-[2rem] border border-slate-800 bg-slate-900 p-6 text-sm font-medium text-white opacity-0 shadow-2xl transition-all group-hover:visible group-hover:opacity-100">
              Need help with your booking?
            </div>
          </button>
        </div>
      </main>
  );
}
