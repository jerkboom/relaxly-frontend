'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { FaExclamationTriangle, FaSignOutAlt, FaEnvelopeOpenText } from 'react-icons/fa';
import { useAuthStore } from '../../src/store/authStore';

import { useSettingsStore } from '../../src/store/settingsStore';

export default function SuspendedPage() {
  const router = useRouter();
  const { logout } = useAuthStore();
  const { supportSettings } = useSettingsStore();

  const handleLogout = () => {
    logout();
    router.replace('/login');
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-12">
      <div className="w-full max-w-[600px] rounded-[2.5rem] bg-white p-8 sm:p-12 shadow-xl text-center border-t-8 border-amber-500">
        <div className="mx-auto mb-8 flex h-24 w-24 items-center justify-center rounded-3xl bg-amber-50 text-5xl text-amber-500">
          <FaExclamationTriangle />
        </div>

        <h1 className="text-4xl font-black text-slate-900 mb-6">
          Account Suspended
        </h1>

        <div className="bg-amber-50 rounded-[2rem] p-8 mb-8 text-left border border-amber-100">
          <p className="text-sm font-black uppercase tracking-widest text-amber-600 mb-2">Notice:</p>
          <p className="text-lg font-medium text-slate-800 italic">
            &quot;Your account has been suspended due to a violation of our terms of service or pending further investigation. Please contact support for more information.&quot;
          </p>
        </div>

        <p className="text-slate-500 mb-10 leading-relaxed text-lg">
          If you believe this is an error, please reach out to our administration team.
        </p>

        <div className="flex flex-col gap-4">
          <a
            href={`mailto:${supportSettings.email}`}
            className="flex w-full items-center justify-center gap-3 rounded-[1.5rem] bg-slate-900 py-5 text-xl font-bold text-white transition hover:bg-slate-800"
          >
            <FaEnvelopeOpenText />
            Contact Support
          </a>

          <button
            onClick={handleLogout}
            className="flex w-full items-center justify-center gap-3 rounded-[1.5rem] border-2 border-slate-100 py-5 text-xl font-bold text-slate-600 transition hover:bg-slate-50"
          >
            <FaSignOutAlt />
            Logout
          </button>
        </div>
      </div>
    </main>
  );
}
