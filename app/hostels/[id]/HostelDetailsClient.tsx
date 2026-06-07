'use client';

import {
  useEffect,
  useState,
} from 'react';

import Link from 'next/link';

import {
  useRouter,
} from 'next/navigation';

import {
  FaBed,
  FaCheckCircle,
  FaPhone,
  FaMapMarkerAlt,
  FaUniversity,
  FaWifi,
  FaSnowflake,
  FaArrowLeft,
  FaShieldAlt,
  FaHandshake,
  FaInfoCircle,
  FaBolt,
  FaTint,
  FaUserFriends,
} from 'react-icons/fa';

import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

import ImageGallery from '../../../src/components/common/ImageGallery';
import RoomCard from '../../../src/components/common/RoomCard';
import HostelCard from '../../../src/components/home/HostelCard';

import { getSingleHostel, getHostelRooms } from '../../../src/services/hostelService';

import {
  useAuthStore,
} from '../../../src/store/authStore';

import { Hostel, Room } from '../../../src/types';
import { useSettingsStore } from '../../../src/store/settingsStore';

interface HostelDetailsClientProps {
  id: string;
  initialHostel: Hostel | null;
  initialRooms: Room[];
  relatedHostels?: Hostel[];
}

export default function HostelDetailsClient({ id, initialHostel, initialRooms, relatedHostels = [] }: HostelDetailsClientProps) {
  const router = useRouter();
  const { user, hasHydrated } = useAuthStore();
  const {  } = useSettingsStore();

  const [hostel, setHostel] = useState<Hostel | null>(initialHostel);
  const [rooms, setRooms] = useState<Room[]>(initialRooms);
  const [loading, setLoading] = useState(!initialHostel);
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);
  const [isHighlighting, setIsHighlighting] = useState(false);

  const selectedRoom = selectedRoomId 
    ? rooms.find(r => r._id === selectedRoomId) || null 
    : null;

  // Calculate fees using backend provided fields
  const totalPrice = selectedRoom ? (selectedRoom.totalPrice || selectedRoom.price) : 0;

  useEffect(() => {
    if (selectedRoomId) {
      setIsHighlighting(true);
      const timer = setTimeout(() => setIsHighlighting(false), 2000);
      
      // On mobile, we might want to scroll to the selection info if needed, 
      // but the bottom bar handles most of it.
      // On desktop, the sticky card is already visible.
      
      return () => clearTimeout(timer);
    }
  }, [selectedRoomId]);

  const handleReserve = () => {
    if (!selectedRoomId) {
      const roomsSection = document.getElementById('rooms');
      if (roomsSection) {
        roomsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
      toast.error('Please select a room first');
      return;
    }

    if (!user) {
      router.push('/register');
      return;
    }
    router.push(`/booking/${selectedRoomId}`);
  };

  useEffect(() => {
    const handleReservationTrigger = (e: any) => {
      const { roomId } = e.detail;
      if (roomId) {
        if (!user) {
          router.push('/register');
          return;
        }
        router.push(`/booking/${roomId}`);
      }
    };

    window.addEventListener('trigger-reservation', handleReservationTrigger);
    return () => window.removeEventListener('trigger-reservation', handleReservationTrigger);
  }, [user, router]);

  useEffect(() => {
    // If we have initial data, we don't need to fetch on mount
    if (initialHostel && initialRooms.length > 0) {
      return;
    }

    // Wait for hydration to avoid incorrect redirects
    if (!hasHydrated) return;

    const fetchHostel = async () => {
      try {
        setLoading(true);
        const hostelData = await getSingleHostel(id);
        
        if (hostelData) {
          setHostel(hostelData);
          const roomsData = await getHostelRooms(id);
          setRooms(roomsData?.rooms || roomsData || []);
        } else {
          setHostel(null);
        }
      } catch (error) {
        console.error('Hostel details load error:', error);
        toast.error('Failed to load hostel details');
        setHostel(null);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchHostel();
    }
  }, [id, hasHydrated, initialHostel, initialRooms]);

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-50 py-10">
        <div className="mx-auto max-w-7xl px-4 md:px-6 lg:px-8 animate-pulse space-y-12">
          <div className="space-y-6">
            <div className="flex gap-4">
              <div className="h-14 w-14 rounded-2xl bg-slate-200" />
              <div className="h-10 w-48 rounded-full bg-slate-200" />
              <div className="h-10 w-32 rounded-full bg-slate-200" />
            </div>
            <div className="grid lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-4">
                <div className="h-24 w-full rounded-3xl bg-slate-200" />
                <div className="flex gap-3">
                  <div className="h-10 w-32 rounded-xl bg-slate-200" />
                  <div className="h-10 w-40 rounded-xl bg-slate-200" />
                </div>
                <div className="h-20 w-3/4 rounded-2xl bg-slate-200" />
              </div>
              <div className="lg:col-span-1 h-40 rounded-3xl bg-slate-200" />
            </div>
          </div>
          <div className="h-[300px] md:h-[450px] lg:h-[550px] rounded-[3rem] bg-slate-200" />
          <div className="grid gap-10 lg:grid-cols-[1fr_400px]">
            <div className="space-y-6">
              <div className="h-64 rounded-[3rem] bg-slate-200" />
              <div className="h-96 rounded-[3rem] bg-slate-200" />
            </div>
            <div className="h-[600px] rounded-[3rem] bg-slate-200" />
          </div>
        </div>
      </main>
    );
  }

  if (!hostel) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="rounded-[3rem] bg-white p-16 text-center shadow-xl">
          <h1 className="text-5xl font-black text-slate-900">Hostel Not Found</h1>
          <Link href="/hostels" className="mt-8 inline-block rounded-2xl bg-blue-600 px-8 py-4 font-bold text-white transition hover:scale-105">
            Back to Hostels
          </Link>
        </div>
      </main>
    );
  }

  const hostelAmenities = [
    { id: 'wifi', label: 'Wi-Fi', icon: <FaWifi />, value: hostel.wifi },
    { id: 'ac', label: 'Air Conditioning', icon: <FaSnowflake />, value: hostel.ac },
    { id: 'security', label: '24/7 Security', icon: <FaShieldAlt />, value: hostel.security },
    { id: 'water', label: 'Constant Water', icon: <FaTint />, value: hostel.water },
    { id: 'electricity', label: 'Standby Power', icon: <FaBolt />, value: hostel.electricity },
  ];

  return (
    <main className="min-h-screen bg-slate-50 pb-24 overflow-x-hidden">
      {/* NAVIGATION & HERO HEADER */}
      <section className="mx-auto mt-4 sm:mt-8 max-w-7xl px-4 md:px-6 lg:px-8">
        {/* Navigation row */}
        <div className="mb-6 flex flex-wrap items-center gap-3 sm:gap-4">
          <Link href="/hostels" className="flex h-12 w-12 sm:h-14 sm:w-14 shrink-0 items-center justify-center rounded-2xl bg-white text-slate-600 shadow-sm transition hover:bg-slate-50 hover:text-blue-600">
            <FaArrowLeft className="text-lg sm:text-xl" />
          </Link>
          <div className="flex items-center gap-2 rounded-full bg-blue-100 px-4 sm:px-5 py-2 text-xs sm:text-sm font-black text-blue-700 uppercase tracking-tight">
            <FaMapMarkerAlt className="shrink-0" />
            <span className="truncate">{hostel.location}</span>
          </div>
          <div className="flex items-center gap-2 rounded-full bg-emerald-100 px-4 sm:px-5 py-2 text-xs sm:text-sm font-black text-emerald-700 uppercase tracking-tight">
            <FaCheckCircle className="shrink-0" />
            <span>Verified</span>
          </div>
        </div>

        {/* Hero Grid */}
        <div className="grid lg:grid-cols-3 gap-8 mb-12">
          {/* Left Side (70%) */}
          <div className="lg:col-span-2 space-y-6">
            <div className="space-y-4">
              <h1 className="text-4xl sm:text-5xl lg:text-7xl font-black text-slate-900 tracking-tighter break-words">
                {hostel.name}
              </h1>
              
              <div className="flex flex-wrap gap-3">
                <div className="flex items-center gap-2 rounded-xl bg-slate-100 px-4 py-2 text-xs font-black text-slate-600 uppercase tracking-tight">
                  <FaBed className="shrink-0" />
                  <span>{rooms.length} Room Types</span>
                </div>
                <div className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-xs font-black text-white uppercase tracking-tight">
                  <span>From GHS {hostel.price || (rooms.length > 0 ? Math.min(...rooms.map(r => r.price)) : 'N/A')}</span>
                </div>
              </div>

              <p className="text-lg sm:text-xl leading-relaxed text-slate-600 font-medium max-w-3xl">
                {hostel.description?.substring(0, 250)}...
              </p>
            </div>
          </div>

          {/* Right Side (30%) - Nearby Institution Card */}
          <div className="lg:col-span-1">
            <div className="rounded-3xl border bg-white shadow-sm p-6 space-y-4">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-2xl text-blue-600">
                  <FaUniversity />
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Nearby Institution</p>
                  <p className="text-lg font-black text-slate-900 truncate">
                    {hostel.nearbyUniversities?.length 
                      ? hostel.nearbyUniversities[0] 
                      : hostel.university?.name || 'N/A'}
                  </p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-50">
                <div>
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Distance</p>
                  <p className="text-sm font-black text-slate-900">~1.2 km</p>
                </div>
                <div>
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Walking Time</p>
                  <p className="text-sm font-black text-slate-900">~15 mins</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <ImageGallery images={hostel.images || []} alt={hostel.name} layout="grid" />
      </section>

      {/* CONTENT GRID */}
      <section className="mx-auto mt-8 sm:mt-12 max-w-7xl px-4 md:px-6 lg:px-8">
        <div className="grid gap-8 lg:gap-12 lg:grid-cols-[2fr_1.2fr]">
          
          {/* LEFT CONTENT AREA */}
          <div className="space-y-8 sm:space-y-12 min-w-0">
            {/* ABOUT SECTION */}
            <div className="rounded-[2.5rem] sm:rounded-[3.5rem] bg-white p-8 sm:p-12 shadow-sm border border-slate-100">
              <div className="mb-6 sm:mb-8 flex items-center gap-4">
                <div className="h-8 sm:h-10 w-2 rounded-full bg-blue-600" />
                <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">About this Hostel</h2>
              </div>
              <p className="text-lg sm:text-xl leading-relaxed text-slate-600 font-medium whitespace-pre-wrap">
                {hostel.description || "Experience top-tier student living at its finest. This hostel offers a perfect blend of comfort, security, and proximity to campus, ensuring you can focus on your studies while enjoying a vibrant community life."}
              </p>
            </div>

            {/* AMENITIES SECTION */}
            <div className="rounded-[2.5rem] sm:rounded-[3.5rem] bg-white p-8 sm:p-12 shadow-sm border border-slate-100">
              <div className="mb-8 sm:mb-10 flex items-center gap-4">
                <div className="h-8 sm:h-10 w-2 rounded-full bg-blue-600" />
                <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">Building Amenities</h2>
              </div>
              <div className="grid gap-4 sm:gap-6 grid-cols-2 sm:grid-cols-2 lg:grid-cols-3">
                {hostelAmenities.map((item) => (
                  <div key={item.id} className={`group flex flex-col items-center justify-center gap-3 sm:gap-4 rounded-[1.5rem] sm:rounded-[2.5rem] p-6 sm:p-8 transition-all duration-300 ${
                    item.value 
                      ? 'bg-blue-50 text-blue-700 border-2 border-blue-100' 
                      : 'bg-slate-50 text-slate-300 opacity-60 border-2 border-slate-100'
                  }`}>
                    <div className={`flex h-12 w-12 sm:h-16 sm:w-16 items-center justify-center rounded-xl sm:rounded-2xl text-2xl sm:text-3xl transition-transform group-hover:scale-110 ${
                      item.value ? 'bg-white shadow-lg' : 'bg-slate-100'
                    }`}>
                      {item.icon}
                    </div>
                    <span className="text-[10px] sm:text-sm font-black uppercase tracking-widest text-center">{item.label}</span>
                    {item.value ? (
                      <span className="rounded-full bg-blue-600 px-2 sm:px-3 py-1 text-[8px] sm:text-[10px] font-black text-white">ACTIVE</span>
                    ) : (
                      <span className="text-[8px] sm:text-[10px] font-black text-slate-400 text-center leading-tight">UNAVAILABLE</span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* ROOMS LISTING - ANCHOR */}
            <div id="rooms" className="rounded-[2.5rem] sm:rounded-[4rem] bg-white p-6 md:p-10 shadow-sm border border-slate-100 w-full overflow-visible">
              <div className="mb-8 sm:mb-12 flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-3xl sm:text-4xl font-black text-slate-900 lg:text-5xl tracking-tight">Room Comparison</h2>
                  <p className="mt-2 sm:mt-3 text-base sm:text-lg text-slate-500 font-medium">Compare different room types and select your fit</p>
                </div>
                <div className="inline-flex items-center gap-3 rounded-2xl bg-slate-900 px-6 sm:px-8 py-3 sm:py-4 font-black text-white shadow-xl w-fit">
                  <span className="text-2xl sm:text-3xl">{rooms.length}</span>
                  <span className="text-xs sm:text-sm uppercase tracking-widest opacity-70">Variants</span>
                </div>
              </div>

              <div className="space-y-6 sm:space-y-10 w-full">
                {rooms.length === 0 ? (
                  <div className="rounded-[2rem] sm:rounded-[3rem] border-4 border-dashed border-slate-100 bg-slate-50 py-16 sm:py-24 text-center px-4">
                    <div className="mx-auto mb-6 sm:mb-8 flex h-20 w-20 sm:h-28 sm:w-28 items-center justify-center rounded-full bg-white text-4xl sm:text-5xl text-slate-200 shadow-sm">
                      <FaBed />
                    </div>
                    <h3 className="text-2xl sm:text-3xl font-black text-slate-900">No rooms listed currently</h3>
                    <p className="mt-2 sm:mt-4 text-base sm:text-lg text-slate-500 font-medium">Please check back later or contact the host.</p>
                  </div>
                ) : (
                  rooms.map((room) => (
                    <RoomCard 
                      key={room._id} 
                      room={room} 
                      isSelected={selectedRoomId === room._id}
                      onSelect={setSelectedRoomId}
                    />
                  ))
                )}
              </div>
            </div>

            {/* POLICIES & RULES */}
            <div className="grid gap-6 sm:gap-8 md:grid-cols-2">
              <div className="rounded-[2.5rem] sm:rounded-[3.5rem] bg-white p-8 sm:p-12 shadow-sm border border-slate-100">
                <div className="mb-6 sm:mb-8 flex items-center gap-4">
                  <div className="h-8 w-2 rounded-full bg-slate-900" />
                  <h3 className="text-xl sm:text-2xl font-black text-slate-900">Hostel Rules</h3>
                </div>
                <ul className="space-y-4">
                  {[
                    "No loud music after 10 PM",
                    "Visitors must sign in at the gate",
                    "Keep common areas clean",
                    "No smoking inside rooms",
                    "Regular inspections allowed"
                  ].map((rule, i) => (
                    <li key={i} className="flex items-start gap-4 text-sm sm:text-base text-slate-600 font-medium">
                      <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-slate-100 text-[10px]">
                        {i + 1}
                      </div>
                      {rule}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="rounded-[2.5rem] sm:rounded-[3.5rem] bg-blue-600 p-8 sm:p-12 text-white shadow-2xl shadow-blue-200">
                <div className="mb-6 sm:mb-8 flex items-center gap-4">
                  <div className="h-8 w-2 rounded-full bg-white" />
                  <h3 className="text-xl sm:text-2xl font-black">Booking Policy</h3>
                </div>
                <div className="space-y-6">
                  <div className="flex gap-4">
                    <FaInfoCircle className="mt-1 shrink-0 text-xl" />
                    <p className="text-xs sm:text-sm font-bold opacity-90 leading-relaxed">
                      Reservations are only confirmed after full payment. Ensure you verify room details before proceeding.
                    </p>
                  </div>
                  <div className="flex gap-4">
                    <FaHandshake className="mt-1 shrink-0 text-xl" />
                    <p className="text-xs sm:text-sm font-bold opacity-90 leading-relaxed">
                      Refunds are subject to the owner&apos;s cancellation policy. Standard 24-hour notice required for tours.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT SIDEBAR - STATS & CONTACT */}
          <aside className="lg:block">
            <div className="sticky top-12 space-y-6 sm:space-y-8">
              {/* CONTACT OWNER CARD */}
              <div className="rounded-[2.5rem] sm:rounded-[3.5rem] bg-white p-8 sm:p-12 shadow-sm border border-slate-100 flex flex-col items-center text-center">
                <h3 className="mb-8 text-xl sm:text-2xl font-black text-slate-900 w-full text-left">Property Host</h3>
                
                <div className="mb-8 flex flex-col items-center gap-6 w-full">
                  <div className="flex h-24 w-24 sm:h-32 sm:w-32 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-slate-800 to-slate-900 text-3xl sm:text-5xl font-black text-white shadow-2xl ring-8 ring-slate-50">
                    {hostel.owner?.name?.charAt(0) || 'O'}
                  </div>
                  <div className="space-y-3 w-full">
                    <h4 className="text-2xl sm:text-3xl font-black text-slate-900 break-words whitespace-normal leading-tight">
                      {hostel.owner?.name}
                    </h4>
                    <div className="flex flex-wrap items-center justify-center gap-2">
                      <div className="flex items-center gap-2 rounded-full bg-blue-50 px-4 py-1.5 text-blue-600 border border-blue-100 shadow-sm">
                        <FaCheckCircle className="text-sm shrink-0" />
                        <span className="text-[10px] sm:text-xs font-black uppercase tracking-widest">Verified Host</span>
                      </div>
                    </div>
                  </div>
                </div>

                <Link
                  href={`/owners/${hostel.owner?._id}?hostel=${hostel._id}`}
                  className="w-full flex items-center justify-center gap-3 sm:gap-4 rounded-[1.5rem] sm:rounded-[2.5rem] bg-slate-900 py-5 sm:py-6 text-base sm:text-lg font-black text-white transition-all hover:bg-slate-800 hover:scale-[1.02] active:scale-95 shadow-xl shadow-slate-200"
                >
                  <FaPhone className="text-lg sm:text-xl" />
                  Contact Owner
                </Link>
              </div>

              {/* GENDER & CAPACITY STATS */}
              <div className="rounded-[2.5rem] sm:rounded-[3.5rem] bg-gradient-to-br from-blue-700 to-indigo-800 p-8 sm:p-12 text-white shadow-2xl">
                <h3 className="text-xl sm:text-2xl font-black">Quick Stats</h3>
                <div className="mt-8 sm:mt-10 space-y-6 sm:space-y-8">
                  <div className="flex items-center justify-between border-b border-white/10 pb-3 sm:pb-4">
                    <span className="font-bold text-blue-100 opacity-80 uppercase text-[9px] sm:text-[10px] tracking-[0.2em]">Residency</span>
                    <div className="flex items-center gap-2 font-black text-sm sm:text-base">
                      <FaUserFriends />
                      <span>{hostel.genderAllowed}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between border-b border-white/10 pb-3 sm:pb-4">
                    <span className="font-bold text-blue-100 opacity-80 uppercase text-[9px] sm:text-[10px] tracking-[0.2em]">Scale</span>
                    <span className="font-black text-sm sm:text-base">{hostel.totalRooms} Room Variants</span>
                  </div>
                </div>
                <div className="mt-8 sm:mt-12 rounded-[1.5rem] sm:rounded-[2rem] bg-white/10 p-4 sm:p-6 backdrop-blur-md">
                  <p className="text-center text-[10px] sm:text-xs font-black uppercase tracking-widest opacity-80">Highly Rated Property</p>
                </div>
              </div>
            </div>
          </aside>

        </div>
      </section>

      {/* RELATED HOSTELS */}
      {relatedHostels.length > 0 && (
        <section className="mx-auto mt-16 max-w-7xl px-4 md:px-6 lg:px-8">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-black text-slate-900 tracking-tight">Similar Hostels Nearby</h2>
              <p className="mt-1 text-slate-500 font-medium text-lg">More great options in {hostel.location}</p>
            </div>
            <Link 
              href={`/hostels/location/${generateSlug(hostel.location)}`}
              className="hidden sm:block text-sm font-black text-blue-600 uppercase tracking-widest hover:text-blue-700"
            >
              View All
            </Link>
          </div>
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {relatedHostels.map((item) => (
              <HostelCard key={item._id} hostel={item} />
            ))}
          </div>
        </section>
      )}

      {/* MOBILE BOTTOM ACTION BAR */}
      <div className="fixed bottom-0 left-0 right-0 z-50 lg:hidden px-4 pb-6 pt-4 bg-white/90 backdrop-blur-xl border-t border-slate-100 shadow-[0_-10px_40px_rgba(0,0,0,0.08)]">
        <div className="mx-auto max-w-md flex items-center justify-between gap-4">
          <div className="flex flex-col min-w-0">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest truncate">
              {selectedRoom ? selectedRoom.roomType : 'Select a Variant'}
            </span>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-black text-blue-600">
                GHS {selectedRoom ? selectedRoom.price : (rooms.length > 0 ? Math.min(...rooms.map(r => r.price)) : 'N/A')}
              </span>
              <span className="text-[10px] font-bold text-slate-500 whitespace-nowrap">
                / {selectedRoom?.billingPeriod || 'Year'}
              </span>
            </div>
          </div>
          
          <button
            onClick={handleReserve}
            className={`flex-1 max-w-[180px] rounded-2xl py-4 text-center text-sm font-black text-white shadow-xl transition-all active:scale-95 ${
              selectedRoom 
                ? 'bg-blue-600 shadow-blue-500/30' 
                : 'bg-slate-900 shadow-slate-900/20'
            }`}
          >
            {selectedRoom ? 'Reserve Now' : 'Choose Room'}
          </button>
        </div>
      </div>
    </main>
  );
}


function generateSlug(text: any) { if (!text) return ''; return String(text).toLowerCase().trim().replace(/[^\w\s-]/g, '').replace(/[\s_-]+/g, '-').replace(/^-+|-+$/g, ''); }
