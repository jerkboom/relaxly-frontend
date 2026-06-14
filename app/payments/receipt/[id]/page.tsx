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

  totalPaid: number;

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
}

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
    <main className="min-h-screen bg-slate-100 px-6 py-10">
      <div className="mx-auto max-w-4xl rounded-[3rem] bg-white p-10 shadow-xl">

        {/* TOP */}
        <div className="mb-10 flex items-center justify-between">
          
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
            className="flex items-center gap-3 rounded-2xl bg-slate-100 px-6 py-4 text-lg font-bold text-slate-700 transition hover:bg-slate-200 active:scale-95"
          >
            <FaArrowLeft />
            Back
          </button>

          <button
            onClick={() =>
              window.print()
            }
            className="flex items-center gap-3 rounded-2xl bg-blue-600 px-6 py-4 text-lg font-bold text-white transition hover:bg-blue-700 active:scale-95"
          >
            <FaDownload />
            Download
          </button>
        </div>

        {/* SUCCESS */}
        <div className="mb-14 text-center">
          <div className="mx-auto mb-6 flex h-28 w-28 items-center justify-center rounded-full bg-emerald-100 text-5xl text-emerald-600">
            <FaCheckCircle />
          </div>

          <h1 className="text-6xl font-black text-slate-900">
            Payment Receipt
          </h1>

          <p className="mt-4 text-lg font-bold text-slate-400">
            Payment completed successfully
          </p>
        </div>

        {/* RECEIPT CARD */}
        <div className="rounded-[2.5rem] border border-slate-200 p-10">

          {/* HOSTEL HEADER */}
          <div className="mb-10 flex items-center gap-5">
            <div className="rounded-3xl bg-blue-100 p-5 text-3xl text-blue-600">
              <FaReceipt />
            </div>

            <div>
              <p className="text-xs font-black uppercase tracking-widest text-slate-400">
                Hostel
              </p>

              <h2 className="text-4xl font-black text-slate-900">
                {
                  receipt.hostel?.name || 'N/A'
                }
              </h2>

              <div className="mt-2 flex items-center gap-2 text-slate-400">
                <FaMapMarkerAlt />

                <span className="font-bold">
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

              <p className="mt-2 text-2xl font-black text-slate-900">
                {
                  receipt.room?.roomType || 'N/A'
                }
              </p>
            </div>

            <div>
              <p className="text-xs font-black uppercase tracking-widest text-slate-400">
                Amount Paid
              </p>

              <p className="mt-2 text-4xl font-black text-blue-600">
                GHS{' '}
                {
                  receipt.totalPaid || (receipt as any).amount || 0
                }
              </p>
            </div>

            <div>
              <p className="text-xs font-black uppercase tracking-widest text-slate-400">
                Payment Status
              </p>

              <p className="mt-2 text-xl font-black text-emerald-600 uppercase">
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

              <p className="mt-2 text-xl font-black text-slate-900">
                {
                  receipt.student?.name || 'N/A'
                }
              </p>
            </div>

            <div>
              <p className="text-xs font-black uppercase tracking-widest text-slate-400">
                Date
              </p>

              <p className="mt-2 text-xl font-black text-slate-900">
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

              <p className="text-lg font-black text-slate-900">
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
              className="w-full rounded-3xl bg-blue-600 px-8 py-5 text-xl font-black text-white transition hover:bg-blue-700 active:scale-95"
            >
              View Hostel
            </button>
          </div>

        </div>
      </div>
    </main>
  );
}
