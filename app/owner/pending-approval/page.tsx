'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { FaClock, FaSignOutAlt, FaShieldAlt } from 'react-icons/fa';
import { useAuthStore } from '../../../src/store/authStore';

export default function OwnerPendingApprovalPage() {
  const router = useRouter();
  const { logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-12">
      <div className="w-full max-w-[600px] rounded-[2.5rem] bg-white p-8 sm:p-12 shadow-xl text-center">
        <div className="mx-auto mb-8 flex h-24 w-24 items-center justify-center rounded-3xl bg-amber-50 text-5xl text-amber-500">
          <FaClock />
        </div>

        <h1 className="text-4xl font-black text-slate-900 mb-6">
          Account Under Review
        </h1>

        <div className="bg-slate-50 rounded-[2rem] p-6 mb-8 text-left space-y-4 border border-slate-100">
          <div className="flex gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white text-blue-600 shadow-sm">
              <FaShieldAlt />
            </div>
            <div>
              <p className="font-bold text-slate-900">Security Verification</p>
              <p className="text-sm text-slate-500">We verify all hostel owners to ensure a safe environment for students.</p>
            </div>
          </div>
          
          <div className="pt-4 border-t border-slate-200">
            <p className="text-sm font-medium text-slate-600 italic">
              &quot;Our team is currently reviewing your documentation. This process usually takes 24-48 hours.&quot;
            </p>
          </div>
        </div>

        <p className="text-slate-500 mb-10 leading-relaxed text-lg">
          You&apos;ll receive an email notification once your account has been approved. Thank you for your patience!
        </p>

        <button
          onClick={handleLogout}
          className="flex w-full items-center justify-center gap-3 rounded-[1.5rem] border-2 border-slate-100 py-5 text-xl font-bold text-slate-600 transition hover:bg-slate-50"
        >
          <FaSignOutAlt />
          Logout
        </button>
      </div>
    </main>
  );
}
