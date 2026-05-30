'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { FaBan, FaArrowLeft, FaHome, FaInfoCircle } from 'react-icons/fa';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { initializePayment } from '../../../src/services/paymentService';

import {
  Suspense,
} from 'react';

function CancelledContent() {
  const searchParams = useSearchParams();
  const bookingId = searchParams.get('bookingId');
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
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="overflow-hidden rounded-[3rem] bg-white shadow-2xl shadow-slate-500/10"
        >
          {/* Header */}
          <div className="bg-slate-800 p-12 text-center text-white">
            <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-white/10 text-5xl backdrop-blur-sm">
              <FaBan />
            </div>
            <h1 className="text-4xl font-black md:text-5xl">Cancelled</h1>
            <p className="mt-4 text-xl font-bold opacity-90">Transaction was aborted.</p>
          </div>

          {/* Content */}
          <div className="p-10 md:p-14 text-center">
            <div className="mb-10 inline-flex items-center gap-3 rounded-full bg-slate-100 px-6 py-2 text-slate-600">
              <FaInfoCircle />
              <span className="text-sm font-bold">Your booking is still preserved as &quot;Pending&quot;.</span>
            </div>

            <p className="mb-12 text-lg font-medium text-slate-500">
              You closed the payment window. You can complete this payment anytime from your dashboard.
            </p>

            <div className="space-y-4">
              {bookingId && (
                <button
                  onClick={retryPayment}
                  disabled={retrying}
                  className="flex w-full items-center justify-center gap-3 rounded-2xl bg-emerald-600 py-5 text-lg font-black text-white transition hover:bg-emerald-700"
                >
                  {retrying ? 'Opening Payment...' : 'Retry Payment'}
                </button>
              )}

              <Link
                href="/student/bookings"
                className="flex items-center justify-center gap-3 rounded-2xl bg-blue-600 py-5 text-lg font-black text-white transition hover:bg-blue-700 hover:scale-[1.02]"
              >
                <FaArrowLeft />
                Go to My Bookings
              </Link>
              
              <Link
                href="/student/dashboard"
                className="flex items-center justify-center gap-3 rounded-2xl border-2 border-slate-100 py-5 text-lg font-black text-slate-600 transition hover:bg-slate-50"
              >
                <FaHome />
                Home
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </main>
  );
}

export default function PaymentCancelledPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-slate-50">
          <div className="h-16 w-16 animate-spin rounded-full border-4 border-slate-200 border-t-transparent" />
        </div>
      }
    >
      <CancelledContent />
    </Suspense>
  );
}

