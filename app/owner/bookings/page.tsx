/**
 * ==================================================
 * Relaxly Frontend
 * File: app/owner/bookings/page.tsx
 *
 * Purpose:
 * Management interface for hostel owners to monitor and process student reservations.
 * Provides a real-time overview of current occupancy and financial status.
 *
 * Target User:
 * - Hostel Owners
 * - Property Managers
 *
 * Major Features:
 * - Search & Multi-criteria Filtering (Status, Hostel, Allocation).
 * - Approval Flow: Owners can manually approve or reject pending requests.
 * - Check-in System: Mark students as arrived once paid and approved.
 * - Identity Verification: Displays booking codes and payment references.
 *
 * API Dependencies:
 * - getOwnerBookings(): Fetches all reservations for owner properties.
 * - updateBookingStatus(): Approves or rejects a reservation.
 * - checkInStudent(): Finalizes student arrival.
 *
 * Responsive Behavior:
 * - Mobile: Fully stacked card layout for narrow screens.
 * - Tablet/Laptop: 2-column grid to prevent content squeezing.
 * - Desktop/Ultrawide: Unified 5-column row for efficient data density.
 *
 * ==================================================
 */

'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { 
  FaCalendarCheck, 
  FaHome, 
  FaCheckCircle, 
  FaTimesCircle, 
  FaClock,
  FaSearch,
  FaFilter,
  FaMars,
  FaVenus,
  FaTransgender,
  FaRegCalendarAlt,
  FaUserGraduate
} from 'react-icons/fa';
import { getOwnerBookings, updateBookingStatus, checkInStudent } from '../../../src/services/bookingService';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

// --- TYPES ---

interface Booking {
  _id: string;
  student: {
    _id: string;
    name: string;
    email: string;
    gender?: 'Male' | 'Female';
  };
  hostel: {
    _id: string;
    name: string;
    location: string;
  };
  room: {
    _id: string;
    roomType: string;
    occupancyStyle: string;
    genderAllocation: 'Male' | 'Female' | 'Mixed';
    price: number;
    billingPeriod: string;
    availableBeds: number;
    maleAvailableBeds: number;
    femaleAvailableBeds: number;
    roomStatus: 'available' | 'unavailable' | 'maintenance';
  };
  bookingStatus: 'pending' | 'approved' | 'rejected' | 'cancelled' | 'completed' | 'checked-in';
  paymentStatus: 'pending' | 'paid' | 'failed' | 'cancelled' | 'abandoned';
  amount: number;
  amountPaid: number;
  checkInDate: string;
  createdAt: string;
  bookingCode?: string;
  paymentReference?: string;
  checkedIn?: boolean;
  checkedInAt?: string;
}

// --- COMPONENTS ---

/**
 * Renders a stylized badge based on entity state.
 * Supports different themes for booking, payment, and room statuses.
 */
const StatusBadge = ({ type, value }: { type: 'booking' | 'payment' | 'room' | 'gender', value: string }) => {
  const getStyles = () => {
    const normalized = value?.toLowerCase();
    
    if (type === 'booking') {
      switch (normalized) {
        case 'approved': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
        case 'pending': return 'bg-amber-100 text-amber-700 border-amber-200';
        case 'rejected': return 'bg-rose-100 text-rose-700 border-rose-200';
        case 'cancelled': return 'bg-slate-100 text-slate-600 border-slate-200';
        case 'completed': return 'bg-blue-100 text-blue-700 border-blue-200';
        case 'checked-in': return 'bg-blue-600 text-white border-blue-700';
        default: return 'bg-slate-50 text-slate-400 border-slate-100';
      }
    }
    
    if (type === 'payment') {
      switch (normalized) {
        case 'paid': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
        case 'pending': return 'bg-amber-100 text-amber-700 border-amber-200';
        case 'failed': return 'bg-rose-100 text-rose-700 border-rose-200';
        case 'abandoned': return 'bg-slate-100 text-slate-500 border-slate-200';
        case 'cancelled': return 'bg-slate-100 text-slate-400 border-slate-100';
        default: return 'bg-slate-100 text-slate-400 border-slate-200';
      }
    }

    if (type === 'room') {
      switch (normalized) {
        case 'available': return 'bg-emerald-50 text-emerald-600 border-emerald-100';
        case 'maintenance': return 'bg-orange-50 text-orange-600 border-orange-100';
        case 'unavailable': return 'bg-rose-50 text-rose-600 border-rose-100';
        default: return 'bg-slate-50 text-slate-400 border-slate-100';
      }
    }

    if (type === 'gender') {
      switch (normalized) {
        case 'male': return 'bg-blue-50 text-blue-600 border-blue-100';
        case 'female': return 'bg-pink-50 text-pink-600 border-pink-100';
        case 'mixed': return 'bg-purple-50 text-purple-600 border-purple-100';
        default: return 'bg-slate-50 text-slate-400 border-slate-100';
      }
    }

    return '';
  };

  const getIcon = () => {
    const normalized = value?.toLowerCase();
    if (type === 'booking') {
      if (normalized === 'approved') return <FaCheckCircle />;
      if (normalized === 'pending') return <FaClock />;
      if (normalized === 'cancelled') return <FaTimesCircle />;
      return <FaTimesCircle />;
    }
    if (type === 'gender') {
      if (normalized === 'male') return <FaMars />;
      if (normalized === 'female') return <FaVenus />;
      return <FaTransgender />;
    }
    return null;
  };

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[10px] font-black uppercase tracking-tight ${getStyles()}`}>
      {getIcon()}
      {value}
    </span>
  );
};

/**
 * Animated placeholder for loading states.
 * Mirrors the grid structure of active cards.
 */
const SkeletonRow = () => (
  <div className="grid animate-pulse grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-8 rounded-[2.5rem] bg-white p-8 shadow-sm">
    <div className="flex items-center gap-4">
      <div className="h-14 w-14 rounded-2xl bg-slate-100" />
      <div className="flex-1 space-y-2">
        <div className="h-4 w-3/4 rounded bg-slate-100" />
        <div className="h-3 w-1/2 rounded bg-slate-100" />
      </div>
    </div>
    <div className="space-y-3">
      <div className="h-4 w-1/2 rounded bg-slate-100" />
      <div className="h-10 w-full rounded-xl bg-slate-100" />
    </div>
    <div className="space-y-2">
      <div className="h-3 w-1/3 rounded bg-slate-100" />
      <div className="h-8 w-3/4 rounded bg-slate-100" />
    </div>
    <div className="space-y-2">
      <div className="h-3 w-1/3 rounded bg-slate-100" />
      <div className="h-8 w-1/2 rounded-full bg-slate-100" />
    </div>
    <div className="h-10 w-full rounded-xl bg-slate-100" />
  </div>
);

// --- MAIN PAGE ---

export default function OwnerBookings() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  /** Tracks which booking is currently being processed by an API call. */
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  
  // Filter States
  const [filters, setFilters] = useState({
    bookingStatus: 'All',
    paymentStatus: 'All',
    hostel: 'All',
    genderAllocation: 'All'
  });

  /** Fetches fresh booking data for the owner. */
  const fetchBookings = async () => {
    try {
      setLoading(true);
      const data = await getOwnerBookings();
      setBookings(data as unknown as Booking[]);
    } catch (error) {
      console.error('Failed to fetch bookings:', error);
      toast.error('Could not load bookings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void fetchBookings();
    }, 0);

    return () => window.clearTimeout(timer);
  }, []);

  /**
   * Updates a reservation's approval status.
   * Action results in local state sync to prevent full refresh.
   */
  const handleUpdateStatus = async (bookingId: string, status: 'approved' | 'rejected') => {
    try {
      setProcessingId(bookingId);
      await updateBookingStatus(bookingId, status);
      toast.success(`Booking ${status} successfully`);
      
      setBookings(prev => prev.map(b => 
        b._id === bookingId ? { ...b, bookingStatus: status } : b
      ));
    } catch (error: unknown) {
      console.error('Update status failed:', error);
      toast.error(error instanceof Error ? error.message : `Failed to ${status} booking`);
    } finally {
      setProcessingId(null);
    }
  };

  /**
   * Finalizes the arrival flow.
   * Marking a student as checked-in auto-completes the booking record.
   */
  const handleCheckIn = async (bookingId: string) => {
    try {
      setProcessingId(bookingId);
      await checkInStudent(bookingId);
      toast.success('Student checked-in successfully');
      
      setBookings(prev => prev.map(b => 
        b._id === bookingId ? { ...b, bookingStatus: 'checked-in' as any, checkedIn: true, checkedInAt: new Date().toISOString() } : b
      ));
    } catch (error: unknown) {
      console.error('Check-in failed:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to check-in student');
    } finally {
      setProcessingId(null);
    }
  };

  /** Dynamically generates a list of unique hostels for the filter dropdown. */
  const hostelOptions = useMemo(() => {
    const names = Array.from(new Set(bookings.map(b => b.hostel?.name).filter(Boolean)));
    return ['All', ...names];
  }, [bookings]);

  /** 
   * Client-side search and filter logic. 
   * Provides instant UI feedback without network round-trips.
   */
  const filteredBookings = useMemo(() => {
    return bookings.filter(booking => {
      const student = booking.student || {};
      const hostel = booking.hostel || {};
      const room = booking.room || {};

      // Search matching across identity and property fields
      const searchStr = `${student.name} ${student.email} ${hostel.name} ${room.roomType}`.toLowerCase();
      if (searchQuery && !searchStr.includes(searchQuery.toLowerCase())) return false;

      // Exact match status filtering
      if (filters.bookingStatus !== 'All' && booking.bookingStatus !== filters.bookingStatus.toLowerCase()) return false;
      if (filters.paymentStatus !== 'All' && booking.paymentStatus !== filters.paymentStatus.toLowerCase()) return false;
      if (filters.hostel !== 'All' && hostel.name !== filters.hostel) return false;
      if (filters.genderAllocation !== 'All' && room.genderAllocation !== filters.genderAllocation) return false;

      return true;
    });
  }, [bookings, searchQuery, filters]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-20 w-1/3 rounded-3xl bg-slate-100 animate-pulse" />
        {[1, 2, 3, 4, 5].map(i => <SkeletonRow key={i} />)}
      </div>
    );
  }

  return (
    <div className="space-y-10">
      {/* HEADER SECTION - Branding and quick controls */}
      <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">Booking Management</h1>
          <p className="mt-2 text-slate-500 font-medium">Review, confirm, and manage student reservations.</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-4">
          <div className="relative">
            <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search student or hostel..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-2xl border-2 border-slate-100 bg-white py-3 pl-12 pr-6 text-sm font-bold text-slate-900 outline-none transition focus:border-blue-600 sm:w-80"
            />
          </div>
          <button 
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 rounded-2xl border-2 px-6 py-3 text-sm font-black transition-all ${
              showFilters ? 'border-blue-600 bg-blue-50 text-blue-600' : 'border-slate-100 bg-white text-slate-600 hover:bg-slate-50'
            }`}
          >
            <FaFilter />
            <span>Filters</span>
          </button>
        </div>
      </div>

      {/* FILTERS PANEL - Animated expansion for clean UI */}
      <AnimatePresence>
        {showFilters && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="grid grid-cols-2 gap-4 rounded-[2rem] bg-slate-50 p-6 md:grid-cols-4">
              <div>
                <label className="mb-2 block text-[10px] font-black uppercase tracking-widest text-slate-400">Booking Status</label>
                <select 
                  value={filters.bookingStatus}
                  onChange={(e) => setFilters({ ...filters, bookingStatus: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs font-bold text-slate-900 outline-none focus:ring-2 focus:ring-blue-600/20"
                >
                  {['All', 'Pending', 'Approved', 'Rejected', 'Cancelled', 'Completed'].map(opt => <option key={opt}>{opt}</option>)}
                </select>
              </div>
              <div>
                <label className="mb-2 block text-[10px] font-black uppercase tracking-widest text-slate-400">Payment Status</label>
                <select 
                  value={filters.paymentStatus}
                  onChange={(e) => setFilters({ ...filters, paymentStatus: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs font-bold text-slate-900 outline-none focus:ring-2 focus:ring-blue-600/20"
                >
                  {['All', 'Paid', 'Pending', 'Failed'].map(opt => <option key={opt}>{opt}</option>)}
                </select>
              </div>
              <div>
                <label className="mb-2 block text-[10px] font-black uppercase tracking-widest text-slate-400">Hostel</label>
                <select 
                  value={filters.hostel}
                  onChange={(e) => setFilters({ ...filters, hostel: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs font-bold text-slate-900 outline-none focus:ring-2 focus:ring-blue-600/20"
                >
                  {hostelOptions.map(opt => <option key={opt}>{opt}</option>)}
                </select>
              </div>
              <div>
                <label className="mb-2 block text-[10px] font-black uppercase tracking-widest text-slate-400">Allocation</label>
                <select 
                  value={filters.genderAllocation}
                  onChange={(e) => setFilters({ ...filters, genderAllocation: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs font-bold text-slate-900 outline-none focus:ring-2 focus:ring-blue-600/20"
                >
                  {['All', 'Male', 'Female', 'Mixed'].map(opt => <option key={opt}>{opt}</option>)}
                </select>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* BOOKINGS LIST - Responsive grid of management cards */}
      {filteredBookings.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-[4rem] border-4 border-dashed border-slate-100 bg-white py-32 text-center">
          <div className="mb-8 flex h-24 w-24 items-center justify-center rounded-full bg-slate-50 text-4xl text-slate-200">
            <FaCalendarCheck />
          </div>
          <h2 className="text-3xl font-black text-slate-900">No matching bookings</h2>
          <p className="mt-4 text-slate-500 font-medium">Try adjusting your filters or search terms.</p>
          <button 
            onClick={() => { setFilters({ bookingStatus: 'All', paymentStatus: 'All', hostel: 'All', genderAllocation: 'All' }); setSearchQuery(''); }}
            className="mt-8 rounded-2xl bg-blue-600 px-8 py-4 font-black text-white shadow-lg shadow-blue-200 transition hover:scale-105 active:scale-95"
          >
            Clear All Filters
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {/* DESKTOP TABLE HEADER - Visible only on large screens */}
          <div className="hidden grid-cols-5 items-center gap-8 px-10 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 xl:grid">
            <span>Student & Identity</span>
            <span>Room & Availability</span>
            <span>Financials</span>
            <span>Status Metrics</span>
            <span className="text-right">Actions</span>
          </div>

          <div className="grid gap-6">
            {filteredBookings.map((booking) => (
              <motion.div 
                layout
                key={booking._id}
                className="group relative overflow-hidden rounded-[2rem] sm:rounded-[2.5rem] bg-white p-6 sm:p-8 shadow-sm transition-all hover:shadow-xl hover:border-blue-100 border-2 border-transparent max-w-full"
              >
                {/* DYNAMIC CARD LAYOUT - Adapts from 1 to 5 columns */}
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-8 xl:items-center">
                  
                  {/* 1. STUDENT IDENTITY */}
                  <div className="flex items-center gap-4 sm:gap-6 min-w-0">
                    <div className="relative shrink-0">
                      <div className="flex h-14 w-14 sm:h-16 sm:w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 text-xl sm:text-2xl font-black text-white shadow-xl">
                        {booking.student?.name?.charAt(0) || 'S'}
                      </div>
                      <div className={`absolute -bottom-1.5 -right-1.5 flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-full border-4 border-white shadow-sm ${
                        booking.student?.gender === 'Male' ? 'bg-blue-500' : 'bg-pink-500'
                      }`}>
                        {booking.student?.gender === 'Male' ? <FaMars className="text-[9px] sm:text-[10px] text-white" /> : <FaVenus className="text-[9px] sm:text-[10px] text-white" />}
                      </div>
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight truncate mb-1">{booking.student?.name}</h4>
                      <p className="text-xs font-bold text-slate-400 truncate mb-3">{booking.student?.email}</p>
                      <div className="flex flex-col gap-1.5">
                        <span className="text-[9px] font-black text-blue-600 uppercase tracking-widest bg-blue-50 px-2 py-0.5 rounded w-fit">Code: {booking.bookingCode || 'N/A'}</span>
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest bg-slate-50 px-2 py-0.5 rounded w-fit break-all max-w-full">Ref: {booking.paymentReference || 'N/A'}</span>
                      </div>
                    </div>
                  </div>

                  {/* 2. PROPERTY DETAILS */}
                  <div className="space-y-4 min-w-0">
                    <div className="flex items-center gap-2">
                      <FaHome className="text-blue-600 shrink-0" />
                      <span className="text-sm font-black text-slate-900 truncate">{booking.hostel?.name}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="rounded-xl bg-slate-50 p-2.5 border border-slate-100">
                        <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Room Type</p>
                        <p className="text-[11px] font-bold text-slate-700 truncate">{booking.room?.roomType}</p>
                      </div>
                      <div className="rounded-xl bg-slate-50 p-2.5 border border-slate-100">
                        <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Availability</p>
                        <div className="flex items-center gap-1.5">
                          <span className={`h-1.5 w-1.5 rounded-full ${booking.room?.availableBeds > 0 ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                          <span className="text-[11px] font-black text-slate-900">{booking.room?.availableBeds} Left</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <StatusBadge type="room" value={booking.room?.roomStatus} />
                      <StatusBadge type="gender" value={booking.room?.genderAllocation} />
                    </div>
                  </div>

                  {/* 3. FINANCIAL SUMMARY */}
                  <div className="space-y-3 min-w-0">
                    <div className="flex flex-col">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Amount</span>
                      <h5 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tighter truncate break-words">GHS {booking.amount}</h5>
                    </div>
                    <div className="flex items-center gap-2">
                      <StatusBadge type="payment" value={booking.paymentStatus} />
                    </div>
                  </div>

                  {/* 4. LIFECYCLE METRICS */}
                  <div className="space-y-4 min-w-0">
                    <div className="flex flex-col">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Booking State</span>
                      <StatusBadge type="booking" value={booking.bookingStatus} />
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2 text-slate-500">
                        <FaRegCalendarAlt className="text-xs shrink-0" />
                        <span className="text-[11px] font-bold">In: {new Date(booking.checkInDate).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>

                  {/* 5. WORKFLOW ACTIONS */}
                  <div className="flex flex-col gap-2.5 xl:items-end">
                    {booking.bookingStatus === 'pending' ? (
                      <div className="flex flex-wrap xl:flex-col gap-2 w-full">
                        <button
                          disabled={processingId !== null}
                          onClick={() => handleUpdateStatus(booking._id, 'approved')}
                          className="flex-1 xl:w-full flex items-center justify-center gap-2 rounded-xl bg-emerald-600 py-2.5 text-[10px] font-black text-white transition hover:bg-emerald-700 active:scale-95 disabled:opacity-50 shadow-sm"
                        >
                          {processingId === booking._id ? <div className="h-3 w-3 animate-spin rounded-full border-2 border-white border-t-transparent" /> : <><FaCheckCircle /> Approve</>}
                        </button>
                        <button
                          disabled={processingId !== null}
                          onClick={() => handleUpdateStatus(booking._id, 'rejected')}
                          className="flex-1 xl:w-full flex items-center justify-center gap-2 rounded-xl bg-rose-600 py-2.5 text-[10px] font-black text-white transition hover:bg-rose-700 active:scale-95 disabled:opacity-50 shadow-sm"
                        >
                          {processingId === booking._id ? <div className="h-3 w-3 animate-spin rounded-full border-2 border-white border-t-transparent" /> : <><FaTimesCircle /> Reject</>}
                        </button>
                      </div>
                    ) : (booking.bookingStatus === 'approved' && booking.paymentStatus === 'paid') ? (
                      <button
                        disabled={processingId !== null}
                        onClick={() => handleCheckIn(booking._id)}
                        className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 py-3 text-[10px] font-black text-white transition hover:bg-blue-700 active:scale-95 shadow-lg shadow-blue-200 disabled:opacity-50"
                      >
                        {processingId === booking._id ? <div className="h-3 w-3 animate-spin rounded-full border-2 border-white border-t-transparent" /> : <><FaUserGraduate /> Check In</>}
                      </button>
                    ) : booking.checkedIn ? (
                      <div className="text-left xl:text-right">
                        <p className="text-[8px] font-black text-slate-300 uppercase tracking-widest mb-1">Arrived At</p>
                        <p className="text-[10px] font-bold text-slate-700">{booking.checkedInAt ? new Date(booking.checkedInAt).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' }) : 'N/A'}</p>
                      </div>
                    ) : (
                      <div className="text-left xl:text-right lg:opacity-40">
                        <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-1">ID: {booking._id.slice(-6).toUpperCase()}</p>
                        <p className="text-[11px] font-black text-slate-900">{new Date(booking.createdAt).toLocaleDateString()}</p>
                      </div>
                    )}
                  </div>

                </div>

                {/* PROGRESS INDICATOR - Visual status feedback */}
                <div className="absolute bottom-0 left-0 h-1 bg-slate-50 w-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: booking.bookingStatus === 'approved' ? '100%' : booking.bookingStatus === 'pending' ? '50%' : '100%' }}
                    className={`h-full ${
                      booking.bookingStatus === 'approved' ? 'bg-emerald-500' : 
                      booking.bookingStatus === 'pending' ? 'bg-amber-500' : 
                      booking.bookingStatus === 'rejected' ? 'bg-rose-500' : 'bg-slate-300'
                    }`}
                  />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
