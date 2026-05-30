'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { FaTimesCircle, FaRedo, FaExclamationTriangle, FaArrowLeft, FaHeadset } from 'react-icons/fa';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { initializePayment } from '../../../src/services/paymentService';

import {
  Suspense,
} from 'react';

function FailedContent() {
  const searchParams = useSearchParams();
  const bookingId = searchParams.get('bookingId');
  const message = searchParams.get('message') || 'Verification failed. Please try again.';
  const [retrying, setRetrying] = useState(false);

  const retryPayment = async () => {
    if (!bookingId || retrying) {
      return;
    }

    try {
      setRetrying(true);
      const payment = await initializePayment(bookingId);

      if (!payment.authorization_url) {
        throw new Error('Payment session expired');
      }

      window.location.assign(payment.authorization_url);
    } catch (error: unknown) {
      setRetrying(false);
      toast.error(error instanceof Error ? error.message : 'Unable to initialize payment');
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-12 md:py-20">
      <div className="mx-auto max-w-xl">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="overflow-hidden rounded-[3rem] bg-white shadow-2xl shadow-rose-500/10"
        >
          {/* Header */}
          <div className="bg-rose-500 p-12 text-center text-white">
            <motion.div
              initial={{ rotate: -180, scale: 0 }}
              animate={{ rotate: 0, scale: 1 }}
              transition={{ type: 'spring', stiffness: 200, damping: 15 }}
              className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-white/20 text-5xl backdrop-blur-sm"
            >
              <FaTimesCircle />
            </motion.div>
            <h1 className="text-4xl font-black md:text-5xl">Payment Failed</h1>
            <p className="mt-4 text-xl font-bold opacity-90">Something went wrong with your transaction.</p>
          </div>

          {/* Content */}
          <div className="p-10 md:p-14">
            <div className="mb-10 rounded-2xl bg-rose-50 p-6 text-rose-700">
              <div className="flex gap-4">
                <FaExclamationTriangle className="mt-1 shrink-0 text-xl" />
                <div>
                  <h3 className="font-black uppercase tracking-widest text-[10px] mb-1">Reason for Failure</h3>
                  <p className="font-bold">{message}</p>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <h2 className="text-xl font-black text-slate-900">What would you like to do?</h2>
              
              <div className="grid grid-cols-1 gap-4">
                {bookingId && (
                  <button
                    onClick={retryPayment}
                    disabled={retrying}
                    className="flex items-center justify-center gap-3 rounded-2xl bg-blue-600 py-5 text-lg font-black text-white transition hover:bg-blue-700 hover:scale-[1.02]"
                  >
                    <FaRedo />
                    {retrying ? 'Opening Payment...' : 'Retry Payment'}
                  </button>
                )}
                
                <Link
                  href="/student/bookings"
                  className="flex items-center justify-center gap-3 rounded-2xl border-2 border-slate-100 py-5 text-lg font-black text-slate-600 transition hover:bg-slate-50"
                >
                  <FaArrowLeft />
                  Back to My Bookings
                </Link>
              </div>
            </div>

            <div className="mt-12 pt-8 border-t border-slate-100">
              <div className="flex items-center justify-center gap-6">
                <div className="text-center">
                  <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-500 transition hover:bg-blue-50 hover:text-blue-600">
                    <FaHeadset />
                  </div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Get Support</p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </main>
  );
}

export default function PaymentFailedPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-slate-50">
          <div className="h-16 w-16 animate-spin rounded-full border-4 border-rose-500 border-t-transparent" />
        </div>
      }
    >
      <FailedContent />
    </Suspense>
  );
}

