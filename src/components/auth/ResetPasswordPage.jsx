'use client';

import { useState } from 'react';

import Link from 'next/link';

import { useParams, useRouter } from 'next/navigation';

import toast from 'react-hot-toast';

import {
  FaArrowRight,
  FaLock,
} from 'react-icons/fa';

import { resetPassword } from '../../services/authService';

export default function ResetPasswordPage() {
  const params = useParams();

  const router = useRouter();

  const [password, setPassword] =
    useState('');

  const [loading, setLoading] =
    useState(false);

  const token = Array.isArray(
    params.token
  )
    ? params.token[0]
    : params.token;

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!token) {
      toast.error(
        'Reset token is missing'
      );

      return;
    }

    try {
      setLoading(true);

      const response =
        await resetPassword(
          token,
          password
        );

      toast.success(
        response.message ||
          'Password reset successful'
      );

      router.push('/login');
    } catch (error) {
      toast.error(
        error.response?.data
          ?.message ||
          'Password reset failed'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-gray-100 to-blue-50 px-6 py-12">
      <div className="w-full max-w-xl rounded-[2rem] bg-white p-8 shadow-2xl sm:p-10">
        <div className="mb-10 text-center">
          <Link
            href="/"
            className="flex items-center justify-center gap-2 text-3xl font-black text-blue-600"
          >
            <img src="/logo.svg" alt="Relaxly Logo" className="h-8 w-8" />
            <span>Relaxly</span>
          </Link>

          <h1 className="mt-6 mb-3 text-4xl font-black text-gray-900 sm:text-5xl">
            Reset Password
          </h1>

          <p className="text-base text-gray-500 sm:text-lg">
            Choose a new password for your account.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-6"
        >
          <div>
            <label className="mb-3 block font-semibold text-gray-700">
              New Password
            </label>

            <div className="flex items-center rounded-2xl border border-gray-200 bg-gray-50 px-5 transition focus-within:border-blue-500 focus-within:bg-white">
              <FaLock className="text-gray-400" />

              <input
                type="password"
                name="password"
                placeholder="New password"
                value={password}
                onChange={(e) =>
                  setPassword(
                    e.target.value
                  )
                }
                required
                minLength={6}
                className="w-full bg-transparent px-4 py-5 text-gray-900 placeholder:text-gray-400 outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-3 rounded-2xl bg-blue-600 py-5 text-lg font-bold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading
              ? 'Resetting...'
              : 'Reset Password'}

            {!loading && <FaArrowRight />}
          </button>
        </form>
      </div>
    </main>
  );
}
