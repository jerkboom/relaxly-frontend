'use client';

import { useState } from 'react';

import Link from 'next/link';

import { useRouter } from 'next/navigation';

import toast from 'react-hot-toast';

import {
  FaEnvelope,
  FaLock,
  FaUser,
  FaArrowRight,
  FaUniversity,
  FaIdCard,
  FaKey,
  FaVenusMars,
  FaLink,
} from 'react-icons/fa';

import { registerUser, RegisterData } from '../../src/services/authService';
import { useAuthStore } from '../../src/store/authStore';
import { getErrorMessage } from '../../src/utils/errorUtils';

export default function RegisterPage() {
  const router = useRouter();

  const [loading, setLoading] =
    useState(false);

  const [formData, setFormData] =
    useState({
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      gender: 'Male' as 'Male' | 'Female',
      role: 'student' as 'student' | 'owner',
      ownerAccessCode: '',
      governmentIdUrl: '',
    });

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement
    >
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    if (loading) return;

    if (
      formData.password !==
      formData.confirmPassword
    ) {
      toast.error(
        'Passwords do not match'
      );

      return;
    }

    try {
      setLoading(true);

      const payload: RegisterData = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        gender: formData.gender,
        role: formData.role as 'student' | 'owner',
      };

      if (formData.role === 'owner') {
        payload.ownerAccessCode = formData.ownerAccessCode;
        payload.governmentIdUrl = formData.governmentIdUrl;
      }

      const response =
        await registerUser(payload);

      // UNIFIED SUCCESS BLOCK: Redirect all roles to verification pending
      const userData = response.user || response.data?.user;
      const userEmail = userData?.email || formData.email;

      localStorage.setItem('pendingVerificationEmail', userEmail);
      
      toast.success(
        response.message || 
        'Account created! Please check your email to verify your account.'
      );

      router.push('/verify-email-pending');
      return;
    } catch (error: unknown) {
      toast.error(
        getErrorMessage(
          error,
          'Registration failed'
        )
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-gray-100 to-blue-50 px-4 sm:px-6 py-8 sm:py-12">
      <div className="w-full max-w-[700px] rounded-[1.5rem] sm:rounded-[2rem] bg-white p-6 sm:p-10 shadow-2xl">
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
            Create Account
          </h1>

          <p className="text-base sm:text-lg text-gray-500">
            Start your hostel journey today
          </p>
        </div>

        {/* FORM */}
        <form
          onSubmit={handleSubmit}
          className="space-y-4 sm:space-y-6"
        >
          {/* NAME & EMAIL */}
          <div className="grid gap-4 sm:gap-6 md:grid-cols-2">
            <div>
              <label className="mb-2 sm:mb-3 block text-sm sm:text-base font-semibold text-gray-700">
                Full Name
              </label>

              <div className="flex items-center rounded-2xl border border-gray-200 bg-gray-50 px-4 sm:px-5 transition focus-within:border-blue-500 focus-within:bg-white">
                <FaUser className="text-gray-400 shrink-0" />

                <input
                  type="text"
                  name="name"
                  placeholder="Richard Ofori"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full bg-transparent px-3 sm:px-4 py-4 sm:py-5 text-sm sm:text-base text-gray-900 placeholder:text-gray-400 outline-none"
                />
              </div>
            </div>

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
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full bg-transparent px-3 sm:px-4 py-4 sm:py-5 text-sm sm:text-base text-gray-900 placeholder:text-gray-400 outline-none"
                />
              </div>
            </div>
          </div>

          {/* ROLE & GENDER */}
          <div className="grid gap-4 sm:gap-6 md:grid-cols-2">
            <div>
              <label className="mb-2 sm:mb-3 block text-sm sm:text-base font-semibold text-gray-700">
                Account Type
              </label>

              <div className="flex items-center rounded-2xl border border-gray-200 bg-gray-50 px-4 sm:px-5 transition focus-within:border-blue-500 focus-within:bg-white">
                <FaUser className="text-gray-400 shrink-0" />
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  className="w-full bg-transparent px-3 sm:px-4 py-4 sm:py-5 text-sm sm:text-base text-gray-900 outline-none"
                >
                  <option value="student">
                    Student
                  </option>

                  <option value="owner">
                    Hostel Owner
                  </option>
                </select>
              </div>
            </div>

            <div>
              <label className="mb-2 sm:mb-3 block text-sm sm:text-base font-semibold text-gray-700">
                Gender
              </label>

              <div className="flex items-center rounded-2xl border border-gray-200 bg-gray-50 px-4 sm:px-5 transition focus-within:border-blue-500 focus-within:bg-white">
                <FaVenusMars className="text-gray-400 shrink-0" />
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  required
                  className="w-full bg-transparent px-3 sm:px-4 py-4 sm:py-5 text-sm sm:text-base text-gray-900 outline-none"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                </select>
              </div>
            </div>
          </div>

          {/* DYNAMIC FIELDS: OWNER */}
          {formData.role === 'owner' && (
            <div className="grid gap-4 sm:gap-6 md:grid-cols-2">
              <div>
                <label className="mb-2 sm:mb-3 block text-sm sm:text-base font-semibold text-gray-700">
                  Owner Access Code
                </label>

                <div className="flex items-center rounded-2xl border border-gray-200 bg-gray-50 px-4 sm:px-5 transition focus-within:border-blue-500 focus-within:bg-white">
                  <FaKey className="text-gray-400 shrink-0" />

                  <input
                    type="text"
                    name="ownerAccessCode"
                    placeholder="Access Code"
                    value={formData.ownerAccessCode}
                    onChange={handleChange}
                    required
                    className="w-full bg-transparent px-3 sm:px-4 py-4 sm:py-5 text-sm sm:text-base text-gray-900 placeholder:text-gray-400 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 sm:mb-3 block text-sm sm:text-base font-semibold text-gray-700">
                  Gov ID Image URL
                </label>

                <div className="flex items-center rounded-2xl border border-gray-200 bg-gray-50 px-4 sm:px-5 transition focus-within:border-blue-500 focus-within:bg-white">
                  <FaLink className="text-gray-400 shrink-0" />

                  <input
                    type="text"
                    name="governmentIdUrl"
                    placeholder="https://..."
                    value={formData.governmentIdUrl}
                    onChange={handleChange}
                    required
                    className="w-full bg-transparent px-3 sm:px-4 py-4 sm:py-5 text-sm sm:text-base text-gray-900 placeholder:text-gray-400 outline-none"
                  />
                </div>
              </div>
            </div>
          )}

          {/* PASSWORDS */}
          <div className="grid gap-4 sm:gap-6 md:grid-cols-2">
            <div>
              <label className="mb-2 sm:mb-3 block text-sm sm:text-base font-semibold text-gray-700">
                Password
              </label>

              <div className="flex items-center rounded-2xl border border-gray-200 bg-gray-50 px-4 sm:px-5 transition focus-within:border-blue-500 focus-within:bg-white">
                <FaLock className="text-gray-400 shrink-0" />

                <input
                  type="password"
                  name="password"
                  placeholder="Password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="w-full bg-transparent px-3 sm:px-4 py-4 sm:py-5 text-sm sm:text-base text-gray-900 placeholder:text-gray-400 outline-none"
                />
              </div>
            </div>

            <div>
              <label className="mb-2 sm:mb-3 block text-sm sm:text-base font-semibold text-gray-700">
                Confirm Password
              </label>

              <div className="flex items-center rounded-2xl border border-gray-200 bg-gray-50 px-4 sm:px-5 transition focus-within:border-blue-500 focus-within:bg-white">
                <FaLock className="text-gray-400 shrink-0" />

                <input
                  type="password"
                  name="confirmPassword"
                  placeholder="Confirm"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  className="w-full bg-transparent px-3 sm:px-4 py-4 sm:py-5 text-sm sm:text-base text-gray-900 placeholder:text-gray-400 outline-none"
                />
              </div>
            </div>
          </div>

          {/* BUTTON */}
          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-3 rounded-2xl bg-blue-600 py-4 sm:py-5 text-base sm:text-lg font-bold text-white transition hover:bg-blue-700 disabled:opacity-60"
          >
            {loading
              ? 'Creating Account...'
              : 'Create Account'}

            {!loading && <FaArrowRight />}
          </button>
        </form>

        {/* FOOTER */}
        <div className="mt-6 sm:mt-8 text-center text-sm sm:text-base text-gray-500">
          Already have an account?

          <Link
            href="/login"
            className="ml-2 font-bold text-blue-600"
          >
            Login
          </Link>
        </div>
      </div>
    </main>
  );
}
