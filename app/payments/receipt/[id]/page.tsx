'use client';

import {
  useEffect,
  useState,
} from 'react';

import {
  useParams,
  useRouter,
} from 'next/navigation';

import API from '../../../../src/lib/axios';
import type { PaymentStatus } from '../../../../src/types';

import {
  FaArrowLeft,
  FaCheckCircle,
  FaDownload,
  FaMapMarkerAlt,
  FaReceipt,
  FaPhoneAlt,
  FaEnvelope,
} from 'react-icons/fa';

interface Receipt {
  _id: string;

  totalPaid?: number | string | null;
  totalAmount?: number | string | null;
  amountPaid?: number | string | null;
  amount?: number | string | null;
  payment?: { amount?: number | string | null } | null;

  paymentReference?: string;

  paymentStatus: PaymentStatus;

  createdAt: string;

  student: {
    name: string;
    email: string;
    phone?: string;
  };

  room: {
    roomType: string;
    price: number;
  };

  hostel: {
    _id: string;
    name: string;
    location: string | { address: string; city: string; region: string };
    owner?: {
      name?: string;
      email?: string;
      phone?: string;
    };
  };

  bookingCode?: string;
}

const formatAmount = (receipt: Receipt) => {
  const amount = Number(
    receipt.totalAmount ??
      receipt.amountPaid ??
      receipt.payment?.amount ??
      receipt.totalPaid ??
      receipt.amount ??
      0
  );

  return (Number.isFinite(amount) ? amount : 0).toLocaleString('en-GH', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

export default function ReceiptPage() {
  const params = useParams();

  const router = useRouter();

  const [receipt, setReceipt] =
    useState<Receipt | null>(
      null
    );

  const [loading, setLoading] =
    useState(true);

  useEffect(() => {
    const fetchReceipt =
      async () => {
        try {
          const response =
            await API.get(
              `/bookings/${params.id}`
            );

          // Standardize data extraction - handle { success: true, data: booking } and { booking: booking }
          const bookingData = response.data?.data || response.data?.booking || response.data;
          setReceipt(bookingData);
        } catch {
          setReceipt(null);
        } finally {
          setLoading(false);
        }
      };

    if (params.id) {
      fetchReceipt();
    }
  }, [params.id]);

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return isNaN(date.getTime()) ? 'N/A' : date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-100">
        <p className="text-xl font-bold text-slate-500">
          Loading receipt...
        </p>
      </div>
    );
  }

  if (!receipt) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-100">
        <p className="text-xl font-bold text-red-500">
          Receipt not found
        </p>
      </div>
    );
  }

  return (
    <main className="min-h-screen w-full overflow-x-hidden bg-slate-100 px-4 py-6 sm:px-6 sm:py-10">
      <div className="mx-auto w-full max-w-4xl rounded-3xl bg-white p-4 shadow-xl sm:rounded-[3rem] sm:p-10">

        {/* TOP */}
        <div className="mb-8 flex flex-wrap items-center justify-between gap-3 sm:mb-10">
          
          {/* FIXED BACK BUTTON */}
          <button
            onClick={() => {
              if (
                window.history
                  .length > 1
              ) {
                router.back();
              } else {
                router.push(
                  '/student/bookings'
                );
              }
            }}
            className="flex min-h-11 flex-1 items-center justify-center gap-2 rounded-2xl bg-slate-100 px-3 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-200 active:scale-95 sm:flex-none sm:gap-3 sm:px-6 sm:py-4 sm:text-lg"
          >
            <FaArrowLeft />
            Back
          </button>

          <button
            onClick={() =>
              window.print()
            }
            className="flex min-h-11 flex-1 items-center justify-center gap-2 rounded-2xl bg-blue-600 px-3 py-3 text-sm font-bold text-white transition hover:bg-blue-700 active:scale-95 sm:flex-none sm:gap-3 sm:px-6 sm:py-4 sm:text-lg"
          >
            <FaDownload />
            Download
          </button>
        </div>

        {/* SUCCESS */}
        <div className="mb-10 text-center sm:mb-14">
          <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100 text-4xl text-emerald-600 sm:mb-6 sm:h-28 sm:w-28 sm:text-5xl">
            <FaCheckCircle />
          </div>

          <h1 className="break-words text-3xl font-black leading-tight text-slate-900 sm:text-6xl">
            Payment Receipt
          </h1>

          <p className="mt-3 text-sm font-bold text-slate-400 sm:mt-4 sm:text-lg">
            Payment completed successfully
          </p>
        </div>

        {/* RECEIPT CARD */}
        <div className="w-full rounded-3xl border border-slate-200 p-4 sm:rounded-[2.5rem] sm:p-10">

          {/* HOSTEL HEADER */}
          <div className="mb-8 flex min-w-0 flex-col items-start gap-4 sm:mb-10 sm:flex-row sm:items-center sm:gap-5">
            <div className="shrink-0 rounded-3xl bg-blue-100 p-4 text-2xl text-blue-600 sm:p-5 sm:text-3xl">
              <FaReceipt />
            </div>

            <div className="min-w-0">
              <p className="text-xs font-black uppercase tracking-widest text-slate-400">
                Hostel
              </p>

              <h2 className="break-words text-2xl font-black leading-tight text-slate-900 sm:text-4xl">
                {
                  receipt.hostel?.name || 'N/A'
                }
              </h2>

              <div className="mt-2 flex min-w-0 items-start gap-2 text-slate-400">
                <FaMapMarkerAlt className="mt-1 shrink-0" />

                <span className="break-words font-bold">
                  {
                    typeof receipt.hostel?.location === 'object'
                      ? `${receipt.hostel.location.city}, ${receipt.hostel.location.region}`
                      : (receipt.hostel?.location || 'N/A')
                  }
                </span>
              </div>
            </div>
          </div>

          {/* DETAILS */}
          <div className="grid gap-8 md:grid-cols-2">

            <div>
              <p className="text-xs font-black uppercase tracking-widest text-slate-400">
                Room Type
              </p>

              <p className="mt-2 break-words text-xl font-black text-slate-900 sm:text-2xl">
                {
                  receipt.room?.roomType || 'N/A'
                }
              </p>
            </div>

            <div>
              <p className="text-xs font-black uppercase tracking-widest text-slate-400">
                Amount Paid
              </p>

              <p className="mt-2 break-words text-2xl font-black text-blue-600 sm:text-4xl">
                GHS {formatAmount(receipt)}
              </p>
            </div>

            <div>
              <p className="text-xs font-black uppercase tracking-widest text-slate-400">
                Payment Status
              </p>

              <p className="mt-2 break-words text-lg font-black text-emerald-600 uppercase sm:text-xl">
                {
                  receipt.paymentStatus || 'Pending'
                }
              </p>
            </div>

            <div>
              <p className="text-xs font-black uppercase tracking-widest text-slate-400">
                Reference
              </p>

              <p className="mt-2 break-all font-black text-slate-900">
                {
                  receipt.paymentReference ||
                  (receipt as any).bookingCode ||
                  'N/A'
                }
              </p>
            </div>

            <div>
              <p className="text-xs font-black uppercase tracking-widest text-slate-400">
                Student
              </p>

              <p className="mt-2 break-words text-lg font-black text-slate-900 sm:text-xl">
                {
                  receipt.student?.name || 'N/A'
                }
              </p>
            </div>

            <div>
              <p className="text-xs font-black uppercase tracking-widest text-slate-400">
                Date
              </p>

              <p className="mt-2 break-words text-lg font-black text-slate-900 sm:text-xl">
                {formatDate(receipt.createdAt)}
              </p>
            </div>

            {/* HOST CONTACT */}
            <div className="rounded-3xl bg-slate-50 p-6">
              <div className="mb-3 flex items-center gap-3 text-blue-600">
                <FaPhoneAlt />

                <p className="text-xs font-black uppercase tracking-widest text-slate-400">
                  Hostel Contact
                </p>
              </div>

              <p className="break-words text-base font-black text-slate-900 sm:text-lg">
                {receipt.hostel
                  ?.owner?.phone ||
                  'Not available'}
              </p>
            </div>

            {/* EMAIL */}
            <div className="rounded-3xl bg-slate-50 p-6">
              <div className="mb-3 flex items-center gap-3 text-blue-600">
                <FaEnvelope />

                <p className="text-xs font-black uppercase tracking-widest text-slate-400">
                  Hostel Email
                </p>
              </div>

              <p className="break-all text-lg font-black text-slate-900">
                {receipt.hostel
                  ?.owner?.email ||
                  'Not available'}
              </p>
            </div>

          </div>

          {/* ACTION BUTTON */}
          <div className="mt-12">
            <button
              onClick={() =>
                router.push(
                  receipt.hostel?._id 
                    ? `/hostels/${receipt.hostel._id}`
                    : '/hostels'
                )
              }
              className="w-full rounded-3xl bg-blue-600 px-5 py-4 text-lg font-black text-white transition hover:bg-blue-700 active:scale-95 sm:px-8 sm:py-5 sm:text-xl"
            >
              View Hostel
            </button>
          </div>

        </div>
      </div>
    </main>
  );
}
