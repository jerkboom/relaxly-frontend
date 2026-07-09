'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { FaEnvelope, FaArrowLeft, FaPaperPlane } from 'react-icons/fa';
import { useAuthStore } from '../../src/store/authStore';
import API from '../../src/lib/axios';

export default function VerifyEmailPendingPage() {
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState<string>('');

  useEffect(() => {
    const storedEmail = localStorage.getItem('pendingVerificationEmail');
    if (storedEmail) {
      setEmail(storedEmail);
    } else if (user?.email) {
      setEmail(user.email);
    }
  }, [user]);

  const handleResend = async () => {
    const targetEmail = email || user?.email;
    if (!targetEmail) {
      toast.error('No email found to resend verification');
      return;
    }

    try {
      setLoading(true);
      await API.post('/auth/resend-verification', { email: targetEmail });
      toast.success('Verification email sent! Please check your inbox.');
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to resend email';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('pendingVerificationEmail');
    logout();
    router.replace('/login');
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-12">
      <div className="w-full max-w-[500px] rounded-[2rem] bg-white p-8 sm:p-12 shadow-xl text-center">
        <div className="mx-auto mb-8 flex h-20 w-20 items-center justify-center rounded-full bg-blue-50 text-4xl text-blue-600">
          <FaEnvelope />
        </div>

        <h1 className="text-3xl font-black text-slate-900 mb-4">
          Verify Your Email
        </h1>

        <p className="text-slate-500 mb-8 leading-relaxed">
          We&apos;ve sent a verification link to <span className="font-bold text-slate-900">{email || 'your email'}</span>. 
          Please check your inbox and click the link to activate your account.
        </p>

        <div className="space-y-4">
          <button
            onClick={handleResend}
            disabled={loading}
            className="flex w-full items-center justify-center gap-3 rounded-2xl bg-blue-600 py-4 text-lg font-bold text-white transition hover:bg-blue-700 disabled:opacity-60"
          >
            {loading ? 'Sending...' : 'Resend Verification Email'}
            <FaPaperPlane className="text-sm" />
          </button>

          <button
            onClick={handleLogout}
            className="flex w-full items-center justify-center gap-3 rounded-2xl border-2 border-slate-100 py-4 text-lg font-bold text-slate-600 transition hover:bg-slate-50"
          >
            <FaArrowLeft className="text-sm" />
            Back to Login
          </button>
        </div>

        <p className="mt-8 text-sm text-slate-400">
          Didn&apos;t receive anything? Check your spam folder or try resending.
        </p>
      </div>
    </main>
  );
}
