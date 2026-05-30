'use client';

import React from 'react';
import { FaClock, FaSpinner, FaLock, FaShieldAlt, FaInfoCircle } from 'react-icons/fa';
import { motion } from 'framer-motion';

export default function PaymentPendingPage() {
  return (
    <main className="min-h-screen bg-slate-50 px-4 py-12 md:py-20">
      <div className="mx-auto max-w-xl">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="overflow-hidden rounded-[3rem] bg-white shadow-2xl shadow-blue-500/10"
        >
          <div className="bg-white p-12 text-center">
            <div className="relative mx-auto mb-10 h-32 w-32">
              <FaSpinner className="h-full w-full animate-spin text-blue-600" />
              <div className="absolute inset-0 flex items-center justify-center text-4xl text-blue-600">
                <FaClock />
              </div>
            </div>
            
            <h1 className="text-4xl font-black text-slate-900 md:text-5xl">Payment Pending</h1>
            <p className="mt-4 text-xl font-bold text-slate-500">We are waiting for confirmation from Paystack.</p>
          </div>

          <div className="border-t border-slate-50 p-10 md:p-14">
            <div className="space-y-8">
              <div className="flex items-center gap-6 rounded-3xl bg-blue-50 p-6 text-blue-700">
                <FaInfoCircle className="shrink-0 text-2xl" />
                <p className="font-bold leading-relaxed">
                  Most payments are confirmed instantly, but some can take up to 20 minutes depending on your bank or mobile money provider.
                </p>
              </div>

              <div className="text-center">
                <p className="mb-6 font-medium text-slate-400">
                  You can safely close this page. We will notify you once the payment is confirmed.
                </p>
                
                <div className="flex flex-col gap-4">
                  <a
                    href="/student/bookings"
                    className="flex items-center justify-center gap-3 rounded-2xl bg-slate-900 py-5 text-lg font-black text-white transition hover:bg-black"
                  >
                    View My Bookings
                  </a>
                </div>
              </div>
            </div>

            <div className="mt-12 flex items-center justify-center gap-4 text-slate-300">
              <FaLock />
              <div className="h-4 w-px bg-slate-200" />
              <FaShieldAlt />
              <span className="text-[10px] font-black uppercase tracking-widest">Secure Payment Processing</span>
            </div>
          </div>
        </motion.div>
      </div>
    </main>
  );
}
