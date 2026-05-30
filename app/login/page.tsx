'use client';

import { useState } from 'react';

import Link from 'next/link';

import { useRouter } from 'next/navigation';

import toast from 'react-hot-toast';

import {
  FaEnvelope,
  FaLock,
  FaArrowRight,
} from 'react-icons/fa';

import { loginUser } from '../../src/services/authService';

import { useAuthStore } from '../../src/store/authStore';
import { getErrorMessage } from '../../src/utils/errorUtils';

export default function LoginPage() {
  const router = useRouter();

  const { setAuth } =
    useAuthStore();

  const [loading, setLoading] =
    useState(false);

  const [formData, setFormData] =
    useState({
      email: '',
      password: '',
    });

  // HANDLE INPUT
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]:
        e.target.value,
    });
  };

  // HANDLE LOGIN
  const handleSubmit = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    try {
      setLoading(true);

      const response =
        await loginUser(
          formData
        );

      const user = response.user || response.data?.user;
      const token = response.token || response.data?.token;
      const message = response.message || response.data?.message || 'Login successful';

      if (!user || !token) {
        throw new Error('Invalid response from server');
      }

      // SAVE AUTH
      setAuth(
        user,
        token
      );

      console.log('LOGIN USER ROLE:', user.role);

      toast.success(
        message
      );

      // REDIRECT LOGIC
      const userRole = String(user.role).toUpperCase();

      if (userRole === 'ADMIN') {
        router.push('/admin/dashboard');
        return;
      }

      // 1. Check Email Verification First
      if (user.isEmailVerified === false) {
        router.push('/verify-email-pending');
        return;
      }

      // 2. Role-based status checks
      if (userRole === 'OWNER') {
        const status = String(user.verificationStatus).toUpperCase();
        if (status === 'PENDING') {
          router.push('/owner/pending-approval');
        } else if (status === 'REJECTED') {
          router.push('/owner/rejected');
        } else if (status === 'SUSPENDED') {
          router.push('/suspended');
        } else {
          router.push('/owner/dashboard');
        }
        return;
      }

      // 3. Student dashboard (must be verified to reach here)
      router.push('/student/dashboard');
    } catch (error: unknown) {
      toast.error(
        getErrorMessage(
          error,
          'Login failed'
        )
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-gray-100 to-blue-50 px-4 sm:px-6 py-8 sm:py-12">
      <div className="w-full max-w-[500px] rounded-[1.5rem] sm:rounded-[2rem] bg-white p-6 sm:p-10 shadow-2xl">
        {/* HEADER */}
        <div className="mb-8 sm:mb-10 text-center">
          <Link
            href="/"
            className="flex items-center justify-center gap-2 text-2xl sm:text-3xl font-black text-blue-600"
          >
            <img src="/logo.svg" alt="Relaxly Logo" className="h-8 w-8" />
            <span>Relaxly</span>
          </Link>

          <h1 className="mt-4 sm:mt-6 mb-2 sm:mb-3 text-3xl sm:text-4xl md:text-5xl font-black text-gray-900 leading-tight">
            Welcome Back
          </h1>

          <p className="text-base sm:text-lg text-gray-500">
            Login to continue
          </p>
        </div>

        {/* FORM */}
        <form
          onSubmit={handleSubmit}
          className="space-y-4 sm:space-y-6"
        >
          {/* EMAIL */}
          <div>
            <label className="mb-2 sm:mb-3 block text-sm sm:text-base font-semibold text-gray-700">
              Email Address
            </label>

            <div className="flex items-center rounded-2xl border border-gray-200 bg-gray-50 px-4 sm:px-5 transition focus-within:border-blue-500 focus-within:bg-white">
              <FaEnvelope className="text-gray-400 shrink-0" />

              <input
                type="email"
                name="email"
                placeholder="example@gmail.com"
                value={
                  formData.email
                }
                onChange={
                  handleChange
                }
                required
                className="w-full bg-transparent px-3 sm:px-4 py-4 sm:py-5 text-sm sm:text-base text-gray-900 placeholder:text-gray-400 outline-none"
              />
            </div>
          </div>

          {/* PASSWORD */}
          <div>
            <div className="mb-2 sm:mb-3 flex items-center justify-between">
              <label className="text-sm sm:text-base font-semibold text-gray-700">
                Password
              </label>

              <Link
                href="/forgot-password"
                className="text-xs sm:text-sm font-semibold text-blue-600"
              >
                Forgot Password?
              </Link>
            </div>

            <div className="flex items-center rounded-2xl border border-gray-200 bg-gray-50 px-4 sm:px-5 transition focus-within:border-blue-500 focus-within:bg-white">
              <FaLock className="text-gray-400 shrink-0" />

              <input
                type="password"
                name="password"
                placeholder="Password"
                value={
                  formData.password
                }
                onChange={
                  handleChange
                }
                required
                className="w-full bg-transparent px-3 sm:px-4 py-4 sm:py-5 text-sm sm:text-base text-gray-900 placeholder:text-gray-400 outline-none"
              />
            </div>
          </div>

          {/* BUTTON */}
          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-3 rounded-2xl bg-blue-600 py-4 sm:py-5 text-base sm:text-lg font-bold text-white transition hover:bg-blue-700 disabled:opacity-60"
          >
            {loading
              ? 'Logging In...'
              : 'Login'}

            {!loading && (
              <FaArrowRight />
            )}
          </button>
        </form>

        {/* FOOTER */}
        <div className="mt-6 sm:mt-8 text-center text-sm sm:text-base text-gray-500">
          Don&apos;t have an account?

          <Link
            href="/register"
            className="ml-2 font-bold text-blue-600"
          >
            Register
          </Link>
        </div>
      </div>
    </main>
  );
}
