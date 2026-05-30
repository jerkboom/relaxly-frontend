'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { FaCheckCircle, FaReceipt, FaHome, FaArrowRight, FaCalendarCheck } from 'react-icons/fa';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { getBookingById } from '../../../src/services/bookingService';
import type { PaymentStatus } from '../../../src/types';

interface SuccessDetails {
  bookingId: string;
  hostelName: string;
  roomType: string;
  totalPaid: number;
  reference: string;
  paymentStatus: PaymentStatus;
}

import {
  Suspense,
} from 'react';

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('en-GH', {
    style: 'currency',
    currency: 'GHS',
    minimumFractionDigits: 2,
  }).format(value);

function SuccessContent() {
  const searchParams = useSearchParams();
  const [details, setDetails] = useState<SuccessDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [verifying, setVerifying] = useState(false);

  const bookingId = searchParams.get('bookingId');
  const reference = searchParams.get('reference');

  useEffect(() => {
    let pollCount = 0;
    const maxPolls = 5;
    let pollInterval: NodeJS.Timeout;

    const fetchAndVerify = async () => {
      if (!bookingId) {
        setLoading(false);
        return;
      }

      try {
        const booking = await getBookingById(bookingId);
        const isPaid = ['paid', 'success', 'completed'].includes(booking.paymentStatus);

        if (!isPaid && pollCount < maxPolls) {
          pollCount++;
          pollInterval = setTimeout(fetchAndVerify, 2000);
          return;
        }

        updateDetails(booking);
      } catch (error) {
        console.error('Error loading booking:', error);
        toast.error('Unable to load confirmation details');
      } finally {
        setLoading(false);
      }
    };

    const updateDetails = (booking: any) => {
      setDetails({
        bookingId: booking._id,
        hostelName: typeof booking.hostel === 'object' ? booking.hostel.name : 'Hostel',
        roomType: typeof booking.room === 'object' ? booking.room.roomType : 'Room',
        totalPaid: booking.totalPaid,
        reference: reference || booking.paymentReference || 'N/A',
        paymentStatus: booking.paymentStatus,
      });
    };

    fetchAndVerify();

    return () => {
      if (pollInterval) clearTimeout(pollInterval);
    };
  }, [bookingId, reference]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-6">
          <div className="h-16 w-16 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent" />
          <p className="text-slate-500 font-bold animate-pulse">Confirming your payment...</p>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-12 md:py-20">
      <div className="mx-auto max-w-2xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="overflow-hidden rounded-[3rem] bg-white shadow-2xl shadow-emerald-500/10"
        >
          {/* Header */}
          <div className="bg-gradient-to-br from-emerald-500 to-teal-600 p-12 text-center text-white relative overflow-hidden">
            {/* Background pattern/glow */}
            <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
              <div className="absolute top-[-50%] left-[-50%] w-[200%] h-[200%] bg-[radial-gradient(circle,white_0%,transparent_70%)]" />
            </div>

            <motion.div
              initial={{ scale: 0, rotate: -20 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', damping: 12, stiffness: 200 }}
              className="relative mx-auto mb-8 flex h-28 w-28 items-center justify-center rounded-[2rem] bg-white text-emerald-600 text-5xl shadow-2xl shadow-emerald-900/20"
            >
              <FaCheckCircle />
            </motion.div>
            <h1 className="relative text-4xl font-black md:text-6xl tracking-tight">Payment Successful!</h1>
            <p className="relative mt-6 text-xl font-medium opacity-90 max-w-md mx-auto leading-relaxed">
              Your stay at <span className="font-black underline decoration-white/30 underline-offset-4">{details?.hostelName}</span> is officially confirmed.
            </p>
          </div>

          {/* Receipt Content */}
          <div className="p-10 md:p-16">
            <div className="mb-12 flex items-center gap-6">
              <div className="bg-slate-50 p-4 rounded-2xl text-slate-400">
                <FaReceipt className="text-xl" />
              </div>
              <div className="flex-1">
                <h2 className="text-sm font-black uppercase tracking-[0.2em] text-slate-400">Transaction Details</h2>
                <div className="h-0.5 w-full bg-slate-50 mt-2" />
              </div>
            </div>

            <div className="space-y-10">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div className="group">
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2">Hostel & Property</p>
                  <p className="text-2xl font-black text-slate-900 group-hover:text-blue-600 transition-colors">{details?.hostelName}</p>
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2">Room Configuration</p>
                  <p className="text-2xl font-black text-slate-900">{details?.roomType}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-10 border-t border-slate-50 pt-10">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2">Transaction Reference</p>
                  <p className="font-bold text-slate-600 font-mono tracking-tight bg-slate-50 px-3 py-1 rounded-lg inline-block border border-slate-100">{details?.reference}</p>
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2">Booking Status</p>
                  <div className="flex items-center gap-2 text-emerald-600 font-black uppercase tracking-widest text-sm">
                    <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                    {details?.paymentStatus || 'Confirmed'}
                  </div>
                </div>
              </div>

              <div className="overflow-hidden rounded-[2.5rem] bg-slate-900 p-10 text-white shadow-2xl shadow-slate-900/20 relative">
                {/* Decorative glow */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 blur-[60px] rounded-full" />
                
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative">
                  <div>
                    <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 mb-1">Total Amount Paid</h3>
                    <p className="text-sm font-medium text-slate-500">Fully inclusive of all service fees</p>
                  </div>
                  <div className="text-right">
                    <span className="text-4xl font-black tracking-tighter text-white md:text-5xl">
                      {details ? formatCurrency(details.totalPaid) : 'GHS 0.00'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="mt-16 grid grid-cols-1 gap-6 sm:grid-cols-2">
              <Link
                href="/student/bookings"
                className="flex items-center justify-center gap-4 rounded-[2rem] bg-blue-600 py-6 text-xl font-black text-white shadow-2xl shadow-blue-500/20 transition-all hover:bg-blue-700 hover:scale-[1.02] active:scale-[0.98]"
              >
                <FaCalendarCheck />
                My Bookings
              </Link>
              <Link
                href="/student/dashboard"
                className="flex items-center justify-center gap-4 rounded-[2rem] bg-white border-2 border-slate-100 py-6 text-xl font-black text-slate-600 transition-all hover:bg-slate-50 hover:border-slate-200"
              >
                <FaHome />
                Dashboard
              </Link>
            </div>
            
            <div className="mt-12 text-center">
              <Link 
                href={details ? `/payments/receipt/${details.bookingId}` : '#'}
                target="_blank"
                className="group inline-flex items-center gap-3 text-xs font-black uppercase tracking-[0.2em] text-blue-600 hover:text-blue-700 transition-all"
              >
                <span className="border-b-2 border-blue-600/20 group-hover:border-blue-600 transition-all">Download Official Receipt</span>
                <FaArrowRight className="text-[10px] group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </main>
  );
}

export default function PaymentSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-slate-50">
          <div className="h-16 w-16 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent" />
        </div>
      }
    >
      <SuccessContent />
    </Suspense>
  );
}
