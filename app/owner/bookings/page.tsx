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
  FaUserGraduate,
  FaPhone,
  FaIdCard,
  FaUniversity,
  FaEnvelope,
  FaInfoCircle,
  FaBed,
  FaEdit,
  FaHistory,
  FaStickyNote,
  FaBuilding,
  FaExclamationTriangle
} from 'react-icons/fa';
import { getOwnerBookings, updateBookingStatus, checkInStudent, updateRoomAssignment, checkOutStudent } from '../../../src/services/bookingService';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

// --- TYPES ---

interface Booking {
  _id: string;
  student: {
    _id: string;
    name: string;
    email: string;
    phone?: string;
    studentId?: string;
    university?: {
      _id: string;
      name: string;
    };
    customUniversity?: string;
    gender?: 'Male' | 'Female';
  };
  studentPhone?: string;
  studentIdCard?: string;
  studentUniversity?: string;
  assignedRoomNumber?: string;
  assignedBedNumber?: string;
  assignedFloorNumber?: string;
  assignedBlock?: string;
  occupancyNotes?: string;
  checkedIn?: boolean;
  checkedInAt?: string;
  history?: {
    event: string;
    details: string;
    actor: { _id: string, name: string } | string;
    timestamp: string;
  }[];
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
  bookingStatus: 'pending' | 'approved' | 'rejected' | 'cancelled' | 'completed' | 'checked_in';
  paymentStatus: 'pending' | 'paid' | 'failed' | 'cancelled' | 'abandoned';
  amount: number;
  amountPaid: number;
  checkInDate: string;
  createdAt: string;
  bookingCode?: string;
  paymentReference?: string;
}

// --- COMPONENTS ---

/**
 * Detailed modal for student and booking information.
 */
const BookingModal = ({ booking, onClose, onCheckIn, onEditAssignment, processingId }: { 
  booking: Booking, 
  onClose: () => void, 
  onCheckIn: (id: string) => void,
  onEditAssignment: (booking: Booking) => void,
  processingId: string | null
}) => (
  <motion.div 
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto"
    onClick={onClose}
  >
    <motion.div 
      initial={{ scale: 0.9, opacity: 0, y: 20 }}
      animate={{ scale: 1, opacity: 1, y: 0 }}
      exit={{ scale: 0.9, opacity: 0, y: 20 }}
      className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-[2rem] sm:rounded-[3rem] bg-white shadow-2xl relative scrollbar-hide"
      onClick={e => e.stopPropagation()}
    >
      <div className="sticky top-0 z-10 h-32 bg-slate-900">
        <div className="absolute -bottom-10 left-10 flex items-end gap-6">
          <div className="flex h-24 w-24 items-center justify-center rounded-3xl bg-white p-1.5 shadow-xl">
            <div className="flex h-full w-full items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 text-3xl font-black text-white">
              {booking.student?.name?.charAt(0)}
            </div>
          </div>
          <div className="mb-2 pb-2">
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">{booking.student?.name}</h2>
            <StatusBadge type="booking" value={booking.bookingStatus} />
          </div>
        </div>
        <button 
          onClick={onClose}
          className="absolute right-6 top-6 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition"
        >
          <FaTimesCircle />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-10 pt-16">
        <div className="space-y-8">
          <div>
            <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4">Student Verification</h3>
            <div className="space-y-4">
              <div className="flex items-center gap-4 group">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-50 group-hover:bg-blue-50 transition">
                  <FaEnvelope className="text-slate-400 group-hover:text-blue-500" />
                </div>
                <div>
                  <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Email Address</p>
                  <p className="text-sm font-bold text-slate-700">{booking.student?.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-4 group">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-50 group-hover:bg-emerald-50 transition">
                  <FaPhone className="text-slate-400 group-hover:text-emerald-500" />
                </div>
                <div>
                  <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Phone Number</p>
                  <p className="text-sm font-bold text-slate-700">{booking.studentPhone || booking.student?.phone || 'Not Provided'}</p>
                </div>
              </div>
              <div className="flex items-center gap-4 group">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-50 group-hover:bg-purple-50 transition">
                  <FaIdCard className="text-slate-400 group-hover:text-purple-500" />
                </div>
                <div>
                  <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Student ID Number</p>
                  <p className="text-sm font-bold text-slate-700">{booking.studentIdCard || booking.student?.studentId || 'Not Provided'}</p>
                </div>
              </div>
              <div className="flex items-center gap-4 group">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-50 group-hover:bg-amber-50 transition">
                  <FaUniversity className="text-slate-400 group-hover:text-amber-500" />
                </div>
                <div>
                  <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">University / Institution</p>
                  <p className="text-sm font-bold text-slate-700">{booking.studentUniversity || booking.student?.customUniversity || booking.student?.university?.name || 'Not Assigned'}</p>
                </div>
              </div>
            </div>
          </div>

          {/* OCCUPANCY DETAILS */}
          {(booking.assignedRoomNumber || booking.checkedIn) && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Current Occupancy</h3>
                {booking.bookingStatus === 'checked_in' && (
                  <button 
                    onClick={() => onEditAssignment(booking)}
                    className="text-[9px] font-black text-blue-600 uppercase tracking-widest hover:underline flex items-center gap-1"
                  >
                    <FaEdit /> Edit
                  </button>
                )}
              </div>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="rounded-2xl bg-blue-50 p-4 border border-blue-100">
                  <p className="text-[8px] font-black text-blue-400 uppercase tracking-widest">Room</p>
                  <p className="text-sm font-black text-blue-700">{booking.assignedRoomNumber || 'Unassigned'}</p>
                </div>
                <div className="rounded-2xl bg-indigo-50 p-4 border border-indigo-100">
                  <p className="text-[8px] font-black text-indigo-400 uppercase tracking-widest">Bed</p>
                  <p className="text-sm font-black text-indigo-700">{booking.assignedBedNumber || 'N/A'}</p>
                </div>
                <div className="rounded-2xl bg-purple-50 p-4 border border-purple-100">
                  <p className="text-[8px] font-black text-purple-400 uppercase tracking-widest">Floor</p>
                  <p className="text-sm font-black text-purple-700">{booking.assignedFloorNumber || 'N/A'}</p>
                </div>
                <div className="rounded-2xl bg-amber-50 p-4 border border-amber-100">
                  <p className="text-[8px] font-black text-amber-400 uppercase tracking-widest">Block</p>
                  <p className="text-sm font-black text-amber-700">{booking.assignedBlock || 'N/A'}</p>
                </div>
              </div>
              {booking.occupancyNotes && (
                <div className="mt-4 rounded-2xl bg-slate-50 p-4 border border-slate-100">
                  <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1 flex items-center gap-1">
                    <FaStickyNote /> Occupancy Notes
                  </p>
                  <p className="text-xs font-medium text-slate-600 italic leading-relaxed">"{booking.occupancyNotes}"</p>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="space-y-8">
          <div>
            <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4">Booking Details</h3>
            <div className="rounded-3xl bg-slate-50 p-6 space-y-4">
              <div className="flex justify-between items-center border-b border-slate-200 pb-3">
                <span className="text-xs font-bold text-slate-500">Booking Code</span>
                <span className="text-xs font-black text-blue-600 font-mono bg-blue-50 px-2 py-0.5 rounded">{booking.bookingCode}</span>
              </div>
              <div className="flex justify-between items-center border-b border-slate-200 pb-3">
                <span className="text-xs font-bold text-slate-500">Hostel</span>
                <span className="text-xs font-black text-slate-900">{booking.hostel?.name}</span>
              </div>
              <div className="flex justify-between items-center border-b border-slate-200 pb-3">
                <span className="text-xs font-bold text-slate-500">Room</span>
                <span className="text-xs font-black text-slate-900">{booking.room?.roomType}</span>
              </div>
              <div className="flex justify-between items-center border-b border-slate-200 pb-3">
                <span className="text-xs font-bold text-slate-500">Amount Paid</span>
                <span className="text-sm font-black text-slate-900">GHS {booking.amount}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-slate-500">Booking Date</span>
                <span className="text-xs font-bold text-slate-700">{new Date(booking.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          </div>

          {/* HISTORY TIMELINE */}
          <div>
            <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4 flex items-center gap-2">
              <FaHistory /> Activity Timeline
            </h3>
            <div className="space-y-4 relative before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-100">
              {(booking.history || []).map((event, idx) => (
                <div key={idx} className="relative pl-8 group">
                  <div className="absolute left-1.5 top-1 h-3 w-3 rounded-full border-2 border-white bg-slate-300 group-first:bg-blue-600 transition" />
                  <p className="text-[10px] font-black text-slate-900 tracking-tight">{event.event.replace(/_/g, ' ')}</p>
                  <p className="text-[10px] text-slate-500 font-medium">{event.details}</p>
                  <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">{new Date(event.timestamp).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}</p>
                </div>
              ))}
              {(!booking.history || booking.history.length === 0) && (
                <p className="text-[10px] text-slate-400 font-medium italic pl-8">No activity recorded yet.</p>
              )}
            </div>
          </div>
        </div>
      </div>
      
      <div className="bg-slate-50 p-6 flex justify-end gap-3">
        <button 
          onClick={onClose}
          className="px-6 py-3 text-xs font-black text-slate-500 hover:text-slate-900 transition"
        >
          Close Window
        </button>
        {(['approved', 'completed'].includes(booking.bookingStatus) && booking.paymentStatus === 'paid' && !booking.checkedIn) && (
          <button 
            disabled={processingId !== null}
            onClick={() => { onCheckIn(booking._id); }}
            className="px-8 py-3 rounded-xl bg-blue-600 text-xs font-black text-white shadow-lg shadow-blue-200 hover:bg-blue-700 transition flex items-center gap-2"
          >
            {processingId === booking._id ? <div className="h-3 w-3 animate-spin rounded-full border-2 border-white border-t-transparent" /> : <><FaUserGraduate /> Proceed to Check In</>}
          </button>
        )}
      </div>
    </motion.div>
  </motion.div>
);

/**
 * REDESIGNED: Modal for assigning or editing room/bed numbers.
 */
const RoomAssignmentModal = ({ 
  booking, 
  isOpen, 
  onClose, 
  onConfirm, 
  isProcessing,
  type = 'check-in'
}: { 
  booking: Booking, 
  isOpen: boolean, 
  onClose: () => void, 
  onConfirm: (data: { assignedRoomNumber: string, assignedBedNumber: string, assignedFloorNumber: string, assignedBlock?: string, occupancyNotes?: string }) => void,
  isProcessing: boolean,
  type?: 'check-in' | 'edit'
}) => {
  const [roomNumber, setRoomNumber] = useState(booking.assignedRoomNumber || '');
  const [bedNumber, setBedNumber] = useState(booking.assignedBedNumber || '');
  const [floorNumber, setFloorNumber] = useState(booking.assignedFloorNumber || '');
  const [blockName, setBlockName] = useState(booking.assignedBlock || '');
  const [notes, setNotes] = useState(booking.occupancyNotes || '');

  if (!isOpen) return null;

  const isFormValid = roomNumber.trim() !== '' && bedNumber.trim() !== '' && floorNumber.trim() !== '';

  const handleConfirm = () => {
    onConfirm({ 
      assignedRoomNumber: roomNumber, 
      assignedBedNumber: bedNumber, 
      assignedFloorNumber: floorNumber,
      assignedBlock: blockName,
      occupancyNotes: notes 
    });
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md"
      onClick={onClose}
    >
      <motion.div 
        initial={{ scale: 0.95, opacity: 0, y: 30 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 30 }}
        className="w-full max-w-lg overflow-hidden rounded-[3rem] bg-white shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        {/* HEADER */}
        <div className="bg-slate-900 p-8 text-white relative">
          <div className="flex items-center gap-5">
            <div className="flex h-14 w-14 items-center justify-center rounded-[1.5rem] bg-blue-600 shadow-lg shadow-blue-500/20">
              <FaUserGraduate className="text-2xl" />
            </div>
            <div>
              <h2 className="text-2xl font-black tracking-tight">{type === 'check-in' ? 'Student Check-In' : 'Update Allocation'}</h2>
              <p className="text-[10px] font-bold text-blue-400 uppercase tracking-[0.2em] mt-1">Finalizing Occupancy Record</p>
            </div>
          </div>
          <button onClick={onClose} className="absolute right-8 top-8 text-white/40 hover:text-white transition">
            <FaTimesCircle className="text-xl" />
          </button>
        </div>

        {/* CONTENT */}
        <div className="p-8 max-h-[70vh] overflow-y-auto scrollbar-hide">
          
          {/* STUDENT SUMMARY */}
          <div className="mb-8 rounded-3xl bg-slate-50 p-6 border border-slate-100">
            <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4 flex items-center gap-2">
              <FaInfoCircle className="text-blue-500" /> Student Summary
            </h3>
            <div className="grid grid-cols-2 gap-y-4 gap-x-6">
              <div>
                <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Full Name</p>
                <p className="text-sm font-bold text-slate-800">{booking.student?.name}</p>
              </div>
              <div>
                <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Student ID</p>
                <p className="text-sm font-bold text-slate-800">{booking.student?.studentId || 'N/A'}</p>
              </div>
              <div>
                <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Phone</p>
                <p className="text-sm font-bold text-slate-800">{booking.student?.phone || 'N/A'}</p>
              </div>
              <div>
                <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">University</p>
                <p className="text-sm font-bold text-slate-800 truncate">{booking.student?.university?.name || booking.student?.customUniversity || 'N/A'}</p>
              </div>
            </div>
          </div>

          {/* ACCOMMODATION ASSIGNMENT */}
          <div className="space-y-6">
            <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
              <FaBed className="text-blue-500" /> Accommodation Assignment
            </h3>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-2 block text-[10px] font-black uppercase tracking-widest text-slate-500 pl-1">Room Number *</label>
                <input 
                  type="text"
                  value={roomNumber}
                  onChange={e => setRoomNumber(e.target.value)}
                  placeholder="e.g. 304"
                  className="w-full rounded-2xl border-2 border-slate-100 bg-slate-50 px-5 py-3.5 text-sm font-bold text-slate-900 outline-none focus:border-blue-600 transition shadow-inner"
                />
              </div>
              <div>
                <label className="mb-2 block text-[10px] font-black uppercase tracking-widest text-slate-500 pl-1">Bed Number *</label>
                <input 
                  type="text"
                  value={bedNumber}
                  onChange={e => setBedNumber(e.target.value)}
                  placeholder="e.g. Bed 1"
                  className="w-full rounded-2xl border-2 border-slate-100 bg-slate-50 px-5 py-3.5 text-sm font-bold text-slate-900 outline-none focus:border-blue-600 transition shadow-inner"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-2 block text-[10px] font-black uppercase tracking-widest text-slate-500 pl-1">Floor Number *</label>
                <input 
                  type="text"
                  value={floorNumber}
                  onChange={e => setFloorNumber(e.target.value)}
                  placeholder="e.g. 2nd Floor"
                  className="w-full rounded-2xl border-2 border-slate-100 bg-slate-50 px-5 py-3.5 text-sm font-bold text-slate-900 outline-none focus:border-blue-600 transition shadow-inner"
                />
              </div>
              <div>
                <label className="mb-2 block text-[10px] font-black uppercase tracking-widest text-slate-500 pl-1">Block / Wing (Opt.)</label>
                <input 
                  type="text"
                  value={blockName}
                  onChange={e => setBlockName(e.target.value)}
                  placeholder="e.g. Block A"
                  className="w-full rounded-2xl border-2 border-slate-100 bg-slate-50 px-5 py-3.5 text-sm font-bold text-slate-900 outline-none focus:border-blue-600 transition shadow-inner"
                />
              </div>
            </div>

            <div>
              <label className="mb-2 block text-[10px] font-black uppercase tracking-widest text-slate-500 pl-1">Occupancy Notes (Optional)</label>
              <textarea 
                value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder="Key collection info, special requests..."
                rows={2}
                className="w-full rounded-2xl border-2 border-slate-100 bg-slate-50 px-5 py-3.5 text-sm font-bold text-slate-900 outline-none focus:border-blue-600 transition resize-none shadow-inner"
              />
            </div>

            {!isFormValid && (
              <motion.p 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-[10px] font-bold text-rose-500 uppercase tracking-tight flex items-center gap-1.5 bg-rose-50 p-4 rounded-2xl border border-rose-100"
              >
                <FaExclamationTriangle className="shrink-0" /> Room, Bed, and Floor are mandatory for check-in.
              </motion.p>
            )}
          </div>
        </div>

        {/* FOOTER */}
        <div className="bg-slate-50 p-8 flex gap-4">
          <button 
            onClick={onClose}
            className="flex-1 px-6 py-4 text-xs font-black text-slate-500 hover:text-slate-900 transition uppercase tracking-widest"
          >
            Cancel
          </button>
          <button 
            disabled={!isFormValid || isProcessing}
            onClick={handleConfirm}
            className="flex-[2] relative overflow-hidden rounded-2xl bg-blue-600 px-8 py-4 text-xs font-black text-white shadow-xl shadow-blue-500/20 hover:bg-blue-700 transition disabled:opacity-50 active:scale-95"
          >
            {isProcessing ? (
               <div className="mx-auto h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
            ) : (
              <span className="flex items-center justify-center gap-2">
                <FaCheckCircle className="text-base" /> {type === 'check-in' ? 'CONFIRM CHECK-IN' : 'UPDATE ALLOCATION'}
              </span>
            )}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

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
        case 'checked_in': return 'bg-blue-600 text-white border-blue-700 shadow-sm shadow-blue-200';
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
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);

  // Assignment Modal States
  const [isAssignmentModalOpen, setIsAssignmentModalOpen] = useState(false);
  const [assignmentType, setAssignmentType] = useState<'check-in' | 'edit'>('check-in');
  const [bookingForAssignment, setBookingForAssignment] = useState<Booking | null>(null);
  
  // Filter States
  const [filters, setFilters] = useState({
    bookingStatus: 'All',
    paymentStatus: 'All',
    hostelId: 'All',
    allocation: 'All',
    assignment: 'All'
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
   * Initial Check-In action: Opens the assignment modal.
   */
  const handleInitiateCheckIn = (bookingId: string) => {
    const booking = bookings.find(b => b._id === bookingId);
    if (!booking) return;
    setBookingForAssignment(booking);
    setAssignmentType('check-in');
    setIsAssignmentModalOpen(true);
  };

  /**
   * Edit Assignment action: Opens the assignment modal.
   */
  const handleInitiateEditAssignment = (booking: Booking) => {
    setBookingForAssignment(booking);
    setAssignmentType('edit');
    setIsAssignmentModalOpen(true);
  };

  /**
   * Finalizes the arrival flow or updates assignment.
   */
  const handleConfirmAssignment = async (data: { assignedRoomNumber: string, assignedBedNumber: string, assignedFloorNumber: string, assignedBlock?: string, occupancyNotes?: string }) => {
    if (!bookingForAssignment) return;

    try {
      setProcessingId(bookingForAssignment._id);
      
      let updated: Booking;
      if (assignmentType === 'check-in') {
        const checkInPayload = {
          ...data,
          checkedIn: true,
          checkedInAt: new Date().toISOString()
        };
        updated = await checkInStudent(bookingForAssignment._id, checkInPayload as any) as unknown as Booking;
        toast.success('Accommodation assigned successfully.');
      } else {
        updated = await updateRoomAssignment(bookingForAssignment._id, data) as unknown as Booking;
        toast.success('Room assignment updated');
      }
      
      setBookings(prev => prev.map(b => 
        b._id === bookingForAssignment._id ? { ...b, ...updated } : b
      ));

      if (selectedBooking?._id === bookingForAssignment._id) {
        setSelectedBooking(prev => prev ? { ...prev, ...updated } : null);
      }

      setIsAssignmentModalOpen(false);
      setBookingForAssignment(null);
    } catch (error: unknown) {
      console.error('Assignment failed:', error);
      toast.error(error instanceof Error ? error.message : 'Action failed');
    } finally {
      setProcessingId(null);
    }
  };

  /**
   * Finalizes the check-out flow.
   */
  const handleCheckOut = async (bookingId: string) => {
    if (!window.confirm('Are you sure you want to check-out this student? This will mark the room as vacant.')) return;
    
    try {
      setProcessingId(bookingId);
      const updated = await checkOutStudent(bookingId) as unknown as Booking;
      toast.success('Student checked-out successfully');
      
      setBookings(prev => prev.map(b => 
        b._id === bookingId ? { ...b, ...updated } : b
      ));

      if (selectedBooking?._id === bookingId) {
        setSelectedBooking(prev => prev ? { ...prev, ...updated } : null);
      }
    } catch (error: unknown) {
      console.error('Check-out failed:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to check-out student');
    } finally {
      setProcessingId(null);
    }
  };

  /** Dynamically generates a list of unique hostels for the filter dropdown. */
  const hostelOptions = useMemo(() => {
    const hostels = bookings.map(b => b.hostel).filter(h => h && h._id && h.name);
    const uniqueHostels = Array.from(new Map(hostels.map(h => [h._id, h])).values());
    return uniqueHostels;
  }, [bookings]);

  /** 
   * Unified helper to determine if a booking is physically assigned a space.
   * Business Rule: Checked-in students are ALWAYS considered assigned.
   */
  const isAssigned = (booking: Booking) => 
    booking.bookingStatus === 'checked_in' || 
    !!booking.assignedRoomNumber;

  /** 
   * Client-side search and filter logic. 
   * Provides instant UI feedback without network round-trips.
   */
  const filteredBookings = useMemo(() => {
    // Bulletproof normalization: handles both 'checked-in' and 'checked_in'
    const normalize = (value: string = '') => 
      (value || '').trim().toLowerCase().replace(/-/g, '_');

    const result = bookings.filter(booking => {
      const student = booking.student || {};
      const hostel = booking.hostel || {};
      const room = booking.room || {};

      const bStatus = normalize(booking.bookingStatus);
      const fStatus = normalize(filters.bookingStatus);
      const bPayment = normalize(booking.paymentStatus);
      const fPayment = normalize(filters.paymentStatus);

      // Search matching across identity and property fields
      const searchStr = `${student.name} ${student.email} ${hostel.name} ${room.roomType} ${booking.assignedRoomNumber || ''}`.toLowerCase();
      if (searchQuery && !searchStr.includes(searchQuery.toLowerCase())) return false;

      // 1. Booking Status Filter
      if (filters.bookingStatus !== 'All') {
        if (bStatus !== fStatus) return false;
      }
      
      // 2. Payment Status Filter
      if (filters.paymentStatus !== 'All') {
        if (bPayment !== fPayment) return false;
      }

      // 3. Hostel Filter (by ID)
      if (filters.hostelId !== 'All' && String(hostel._id) !== String(filters.hostelId)) return false;

      // 4. Allocation Filter (Uses same logic as Assignment)
      if (filters.allocation !== 'All') {
        const assigned = isAssigned(booking);
        if (filters.allocation === 'Allocated' && !assigned) return false;
        if (filters.allocation === 'Unallocated' && assigned) return false;
      }

      // 5. Assignment Filter
      if (filters.assignment !== 'All') {
        const assigned = isAssigned(booking);
        if (filters.assignment === 'Assigned' && !assigned) return false;
        if (filters.assignment === 'Unassigned' && assigned) return false;
      }

      return true;
    });

    return result;
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
              placeholder="Search student or room..."
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
            <div className="grid grid-cols-2 gap-4 rounded-[2rem] bg-slate-50 p-6 md:grid-cols-5">
              <div>
                <label className="mb-2 block text-[10px] font-black uppercase tracking-widest text-slate-400">Booking Status</label>
                <select 
                  value={filters.bookingStatus}
                  onChange={(e) => setFilters({ ...filters, bookingStatus: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs font-bold text-slate-900 outline-none focus:ring-2 focus:ring-blue-600/20"
                >
                  {['All', 'Pending', 'Approved', 'Completed', 'Rejected', 'Cancelled'].map(opt => (
                    <option key={opt} value={opt === 'All' ? 'All' : opt.toLowerCase()}>{opt}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-2 block text-[10px] font-black uppercase tracking-widest text-slate-400">Payment Status</label>
                <select 
                  value={filters.paymentStatus}
                  onChange={(e) => setFilters({ ...filters, paymentStatus: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs font-bold text-slate-900 outline-none focus:ring-2 focus:ring-blue-600/20"
                >
                  {['All', 'Paid', 'Pending', 'Failed', 'Refunded'].map(opt => <option key={opt}>{opt}</option>)}
                </select>
              </div>
              <div>
                <label className="mb-2 block text-[10px] font-black uppercase tracking-widest text-slate-400">Hostel</label>
                <select 
                  value={filters.hostelId}
                  onChange={(e) => setFilters({ ...filters, hostelId: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs font-bold text-slate-900 outline-none focus:ring-2 focus:ring-blue-600/20"
                >
                  <option value="All">All Hostels</option>
                  {hostelOptions.map(hostel => (
                    <option key={hostel._id} value={hostel._id}>{hostel.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-2 block text-[10px] font-black uppercase tracking-widest text-slate-400">Allocation</label>
                <select 
                  value={filters.allocation}
                  onChange={(e) => setFilters({ ...filters, allocation: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs font-bold text-slate-900 outline-none focus:ring-2 focus:ring-blue-600/20"
                >
                  {['All', 'Allocated', 'Unallocated'].map(opt => <option key={opt}>{opt}</option>)}
                </select>
              </div>
              <div>
                <label className="mb-2 block text-[10px] font-black uppercase tracking-widest text-slate-400">Assignment</label>
                <select 
                  value={filters.assignment}
                  onChange={(e) => setFilters({ ...filters, assignment: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs font-bold text-slate-900 outline-none focus:ring-2 focus:ring-blue-600/20"
                >
                  {['All', 'Assigned', 'Unassigned'].map(opt => <option key={opt}>{opt}</option>)}
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
            onClick={() => { setFilters({ bookingStatus: 'All', paymentStatus: 'All', hostelId: 'All', allocation: 'All', assignment: 'All' }); setSearchQuery(''); }}
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
                      <div className="flex flex-col gap-1 mb-3">
                        <div className="flex items-center gap-2 text-xs font-bold text-slate-400 truncate">
                          <FaEnvelope className="shrink-0 text-[10px]" />
                          <span className="truncate">{booking.student?.email}</span>
                        </div>
                        {booking.student?.phone && (
                          <div className="flex items-center gap-2 text-xs font-bold text-slate-600 truncate">
                            <FaPhone className="shrink-0 text-[10px] text-emerald-500" />
                            <span className="truncate">{booking.student?.phone}</span>
                          </div>
                        )}
                        {booking.student?.studentId && (
                          <div className="flex items-center gap-2 text-xs font-bold text-slate-600 truncate">
                            <FaIdCard className="shrink-0 text-[10px] text-blue-500" />
                            <span className="truncate">ID: {booking.student?.studentId}</span>
                          </div>
                        )}
                        {(booking.studentUniversity || booking.student?.university?.name || booking.student?.customUniversity) && (
                          <div className="flex items-center gap-2 text-xs font-bold text-slate-600 truncate">
                            <FaUniversity className="shrink-0 text-[10px] text-amber-500" />
                            <span className="truncate">{booking.studentUniversity || booking.student?.university?.name || booking.student?.customUniversity}</span>
                          </div>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        <span className="text-[9px] font-black text-blue-600 uppercase tracking-widest bg-blue-50 px-2 py-0.5 rounded w-fit">Code: {booking.bookingCode || 'N/A'}</span>
                        <button 
                          onClick={() => setSelectedBooking(booking)}
                          className="text-[9px] font-black text-slate-400 uppercase tracking-widest bg-slate-50 px-2 py-0.5 rounded hover:bg-slate-100 transition flex items-center gap-1"
                        >
                          <FaInfoCircle className="text-[8px]" /> Details
                        </button>
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
                    ) : (
                      <div className="flex flex-col gap-2 w-full xl:items-end">
                        {/* 1. OCCUPANCY BADGES (Show if assigned, even if already checked out) */}
                        {isAssigned(booking) && (
                          <div className="flex flex-wrap gap-2 w-full xl:w-fit justify-end">
                            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-blue-50 border border-blue-100">
                              <FaBed className="text-blue-600 text-[10px]" />
                              <span className="text-[10px] font-black text-blue-700 uppercase tracking-tight">Room {booking.assignedRoomNumber}</span>
                            </div>
                            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-indigo-50 border border-indigo-100">
                              <FaInfoCircle className="text-indigo-600 text-[10px]" />
                              <span className="text-[10px] font-black text-indigo-700 uppercase tracking-tight">Bed {booking.assignedBedNumber}</span>
                            </div>
                            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-purple-50 border border-purple-100">
                              <FaHome className="text-purple-600 text-[10px]" />
                              <span className="text-[10px] font-black text-purple-700 uppercase tracking-tight">Floor {booking.assignedFloorNumber}</span>
                            </div>
                            {booking.assignedBlock && (
                              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-amber-50 border border-amber-100">
                                <FaBuilding className="text-amber-600 text-[10px]" />
                                <span className="text-[10px] font-black text-amber-700 uppercase tracking-tight">{booking.assignedBlock}</span>
                              </div>
                            )}
                          </div>
                        )}

                        {/* 2. ACTIVE ACTIONS (Show only if currently checked in) */}
                        {booking.bookingStatus === 'checked_in' && (
                          <div className="flex flex-wrap xl:flex-col gap-2 w-full">
                            <button 
                              onClick={() => handleInitiateEditAssignment(booking)}
                              className="flex-1 xl:w-full py-2 rounded-lg bg-slate-50 text-[9px] font-black text-slate-500 uppercase tracking-widest hover:bg-slate-100 transition flex items-center justify-center gap-1"
                            >
                              <FaEdit /> Edit
                            </button>
                            <button 
                              disabled={processingId !== null}
                              onClick={() => handleCheckOut(booking._id)}
                              className="flex-1 xl:w-full py-2 rounded-lg bg-rose-50 text-[9px] font-black text-rose-600 uppercase tracking-widest hover:bg-rose-100 transition flex items-center justify-center gap-1"
                            >
                              {processingId === booking._id ? <div className="h-3 w-3 animate-spin rounded-full border-2 border-rose-600 border-t-transparent" /> : <><FaTimesCircle /> Check Out</>}
                            </button>
                          </div>
                        )}

                        {/* 3. CHECK-IN ACTION (Show for approved/completed if not yet physically present) */}
                        {(['approved', 'completed'].includes(booking.bookingStatus) && booking.paymentStatus === 'paid' && !booking.checkedIn) && (
                          <button
                            disabled={processingId !== null}
                            onClick={() => handleInitiateCheckIn(booking._id)}
                            className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 py-3 text-[10px] font-black text-white transition hover:bg-blue-700 active:scale-95 shadow-lg shadow-blue-200 disabled:opacity-50"
                          >
                            {processingId === booking._id ? <div className="h-3 w-3 animate-spin rounded-full border-2 border-white border-t-transparent" /> : <><FaUserGraduate /> Check In</>}
                          </button>
                        )}
                        
                        {/* 4. ID Display for Fallback */}
                        {!booking.checkedIn && (
                           <div className="text-left xl:text-right lg:opacity-40">
                             <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-1">ID: {booking._id.slice(-6).toUpperCase()}</p>
                             <p className="text-[11px] font-black text-slate-900">{new Date(booking.createdAt).toLocaleDateString()}</p>
                           </div>
                        )}
                      </div>
                    )}
                  </div>

                </div>

                {/* PROGRESS INDICATOR - Visual status feedback */}
                <div className="absolute bottom-0 left-0 h-1 bg-slate-50 w-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: (booking.bookingStatus === 'approved' || booking.bookingStatus === 'checked_in') ? '100%' : booking.bookingStatus === 'pending' ? '50%' : '100%' }}
                    className={`h-full ${
                      (booking.bookingStatus === 'approved' || booking.bookingStatus === 'checked_in') ? 'bg-emerald-500' : 
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

      {/* MODAL OVERLAY */}
      <AnimatePresence>
        {selectedBooking && (
          <BookingModal 
            booking={selectedBooking} 
            onClose={() => setSelectedBooking(null)} 
            onCheckIn={handleInitiateCheckIn}
            onEditAssignment={handleInitiateEditAssignment}
            processingId={processingId}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isAssignmentModalOpen && bookingForAssignment && (
          <RoomAssignmentModal 
            booking={bookingForAssignment}
            isOpen={isAssignmentModalOpen}
            onClose={() => { setIsAssignmentModalOpen(false); setBookingForAssignment(null); }}
            onConfirm={handleConfirmAssignment}
            isProcessing={processingId === bookingForAssignment._id}
            type={assignmentType}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
