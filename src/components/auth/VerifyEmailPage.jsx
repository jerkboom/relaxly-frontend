'use client';

import { useEffect, useRef, useState } from 'react';

import Link from 'next/link';

import { useParams, useRouter } from 'next/navigation';

import toast from 'react-hot-toast';

import {
  FaCheckCircle,
  FaEnvelopeOpenText,
  FaExclamationCircle,
} from 'react-icons/fa';

import { verifyEmail } from '../../services/authService';

export default function VerifyEmailPage() {
  const params = useParams();

  const router = useRouter();

  const hasRequested =
    useRef(false);

  const [status, setStatus] =
    useState('loading');

  const token = Array.isArray(
    params.token
  )
    ? params.token[0]
    : params.token;

  useEffect(() => {
    if (
      !token ||
      hasRequested.current
    ) {
      return;
    }

    hasRequested.current = true;

    const verify = async () => {
      try {
        const response =
          await verifyEmail(token);

        setStatus('success');

        toast.success(
          response.message ||
            'Email verified successfully! You can now log in.'
        );

        // Redirect to login after a brief moment for the toast to be seen
        setTimeout(() => {
          router.push('/login');
        }, 2000);
      } catch (error) {
        setStatus('error');

        toast.error(
          error.response?.data
            ?.message ||
            'Email verification failed'
        );
      }
    };

    verify();
  }, [router, token]);

  const isSuccess =
    status === 'success';

  const isError =
    status === 'error';

  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-gray-100 to-blue-50 px-6 py-12">
      <div className="w-full max-w-xl rounded-[2rem] bg-white p-8 text-center shadow-2xl sm:p-10">
        <Link
          href="/"
          className="flex items-center justify-center gap-2 text-3xl font-black text-blue-600"
        >
          <img src="/logo.svg" alt="Relaxly Logo" className="h-8 w-8" />
          <span>Relaxly</span>
        </Link>

        <div className="mx-auto mt-8 flex h-20 w-20 items-center justify-center rounded-full bg-blue-50 text-4xl text-blue-600">
          {isSuccess ? (
            <FaCheckCircle />
          ) : isError ? (
            <FaExclamationCircle />
          ) : (
            <FaEnvelopeOpenText />
          )}
        </div>

        <h1 className="mt-8 mb-3 text-4xl font-black text-gray-900 sm:text-5xl">
          {isSuccess
            ? 'Email Verified'
            : isError
              ? 'Verification Failed'
              : 'Verifying Email'}
        </h1>

        <p className="text-base leading-7 text-gray-500 sm:text-lg">
          {isSuccess
            ? 'Your email has been verified. Redirecting you to login.'
            : isError
              ? 'This verification link may be invalid or expired.'
              : 'Please wait while we confirm your email address.'}
        </p>

        {isError && (
          <Link
            href="/login"
            className="mt-8 inline-flex items-center justify-center rounded-2xl bg-blue-600 px-8 py-4 font-bold text-white transition hover:bg-blue-700"
          >
            Go to Login
          </Link>
        )}
      </div>
    </main>
  );
}
