'use client';

import { useEffect, useRef, useState } from 'react';

import { useRouter, useSearchParams } from 'next/navigation';

import toast from 'react-hot-toast';

import {
  FaCheckCircle,
  FaTimesCircle,
  FaSpinner,
} from 'react-icons/fa';

import { verifyPayment } from '../../../src/services/paymentService';

/**
 * VerifyPaymentClient Component
 *
 * This component acts as the "callback" handler for Paystack redirects.
 * It extracts the transaction reference from the URL and calls the backend
 * to verify the final status of the payment.
 *
 * Key features:
 * - Verification Lock: Uses a ref to ensure the verification API is only
 *   called once per mount, preventing race conditions or double-verification.
 * - Automatic Redirection: Redirects to success/failed pages based on result.
 */
export default function VerifyPaymentClient() {
  const router = useRouter();

  const searchParams =
    useSearchParams();

  const reference =
    searchParams.get(
      'reference'
    );

  const [status, setStatus] =
    useState<
      'loading' | 'success' | 'failed'
    >(reference ? 'loading' : 'failed');

  const [message, setMessage] =
    useState(
      reference
        ? 'Verifying payment...'
        : 'Payment reference missing'
    );

  /**
   * Ref used to prevent multiple verification attempts in Strict Mode
   * or during rapid re-renders.
   */
  const verificationLockRef = useRef(false);

  useEffect(() => {
    if (!reference) {
      return;
    }

    const runVerification =
      async () => {
        // Stop if already verifying or verified
        if (verificationLockRef.current) {
          return;
        }

        try {
          verificationLockRef.current = true;
          const response =
            await verifyPayment(reference);

          console.log('Payment Verification Response:', response);

          // Support both response.success and response.status (common backend variations)
          const isVerified = response.success === true || (response as any).status === true || (response as any).status === 'success';

          if (
            isVerified
          ) {
            setStatus(
              'success'
            );

            setMessage(
              'Payment verified successfully'
            );

            // Attempt to find the booking ID from the verification response
            const bookingId =
              response.booking?._id ||
              response.data?.booking?._id;

            setTimeout(() => {
              router.push(
                `/payments/success?bookingId=${bookingId}&reference=${reference}`
              );
            }, 1500);
          } else {
            setStatus(
              'failed'
            );

            const bookingId =
              response.booking?._id ||
              response.data?.booking?._id;
            const rawErrorMsg = response.message || (response as any).error || 'Verification failed';
            const errorMsg = typeof rawErrorMsg === 'string' 
              ? rawErrorMsg 
              : JSON.stringify(rawErrorMsg);

            setMessage(errorMsg);

            setTimeout(() => {
              router.push(
                `/payments/failed?bookingId=${bookingId}&message=${encodeURIComponent(errorMsg)}`
              );
            }, 1500);
          }
        } catch (error: unknown) {
          setStatus(
            'failed'
          );

          setMessage(
            error instanceof Error
              ? error.message
              : 'Verification failed'
          );

          toast.error(
            'Verification failed'
          );
        }
      };

    runVerification();
  }, [reference, router]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100 px-4 sm:px-6 py-8">
      <div className="w-full max-w-2xl rounded-[2rem] sm:rounded-[3rem] bg-white p-8 sm:p-14 text-center shadow-xl">
        {status ===
          'loading' && (
          <>
            <FaSpinner className="mx-auto mb-6 sm:mb-8 animate-spin text-5xl sm:text-7xl text-blue-600" />

            <h1 className="mb-3 sm:mb-4 text-3xl sm:text-5xl font-black text-slate-900 leading-tight">
              Verifying Payment
            </h1>

            <p className="text-base sm:text-xl font-bold text-slate-500">
              Please wait while
              we confirm your
              transaction...
            </p>
          </>
        )}

        {status ===
          'success' && (
          <>
            <FaCheckCircle className="mx-auto mb-6 sm:mb-8 text-5xl sm:text-7xl text-emerald-500" />

            <h1 className="mb-3 sm:mb-4 text-3xl sm:text-5xl font-black text-slate-900 leading-tight">
              Payment Successful
            </h1>

            <p className="text-base sm:text-xl font-bold text-slate-500">
              Confirming your reservation...
            </p>
          </>
        )}

        {status ===
          'failed' && (
          <>
            <FaTimesCircle className="mx-auto mb-6 sm:mb-8 text-5xl sm:text-7xl text-red-500" />

            <h1 className="mb-3 sm:mb-4 text-3xl sm:text-5xl font-black text-slate-900 leading-tight">
              Verification Failed
            </h1>

            <p className="mb-8 sm:mb-10 text-base sm:text-lg font-bold text-slate-500">
              {message}
            </p>

            <button
              onClick={() =>
                router.push(
                  '/student/bookings'
                )
              }
              className="w-full sm:w-auto rounded-2xl bg-blue-600 px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg font-black text-white transition hover:bg-blue-700"
            >
              Go To My Bookings
            </button>
          </>
        )}
      </div>
    </main>
  );
}
