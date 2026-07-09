'use client';

import {
  useCallback,
  useEffect,
  useState,
} from 'react';

import Link from 'next/link';
import { useRouter } from 'next/navigation';

import {
  FaBed,
  FaClock,
  FaHome,
  FaMoneyBillWave,
  FaUniversity,
  FaMapMarkerAlt,
  FaReceipt,
  FaSignOutAlt,
  FaQuestionCircle,
  FaPhone,
  FaEnvelope,
  FaWhatsapp,
  FaBars,
  FaChevronRight,
} from 'react-icons/fa';

import { useNav } from '../layout';

import {
  useAuthStore,
} from '../../../src/store/authStore';

import API from '../../../src/lib/axios';

interface DashboardData {
  stats: {
    totalBookings: number;
    activeBookings: number;
    pendingBookings: number;
    totalPayments: number;
  };

  recentBookings: {
    _id: string;

    hostel: {
      _id?: string;
      name: string;
      location: string | { address: string; city: string; region: string };
    };

    room: {
      roomType: string;
      images?: string[];
    };

    paymentStatus: string;

    bookingStatus: string;

    totalPaid: number;

    checkInDate: string;
  }[];
}

import { useSettingsStore } from '../../../src/store/settingsStore';

export default function StudentDashboardPage() {
  const router = useRouter();
  const { openSidebar } = useNav();
  const { token, logout } =
    useAuthStore();
  
  const { supportSettings } = useSettingsStore();

  const [dashboard, setDashboard] =
    useState<DashboardData | null>(
      null
    );

  const fetchDashboard =
    useCallback(
      async () => {
        try {
          if (!token) return;

          const response =
            await API.get(
              '/dashboard/student',
              {
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              }
            );

          setDashboard(
            response.data
          );
        } catch {
          // Silent error, will show 0s
        }
      },
      [token]
    );

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void fetchDashboard();
    }, 0);

    return () => window.clearTimeout(timer);
  }, [fetchDashboard]);

  const handleLogout = () => {
    logout();
    router.replace('/login');
  };

  return (
    <main className="min-h-screen bg-slate-100 pb-20">

      {/* HEADER */}
      <header className="border-b border-slate-200 bg-white sticky top-0 z-10">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">

          <div className="flex items-center gap-4">
            <button
              onClick={openSidebar}
              className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-50 text-slate-600 transition hover:bg-slate-100 lg:hidden"
            >
              <FaBars className="text-xl" />
            </button>

            <div>
              <h1 className="text-2xl sm:text-4xl font-black text-slate-900">
                Student Dashboard
              </h1>

              <p className="mt-1 hidden text-sm sm:block text-slate-600">
                Welcome back to your hostel portal
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
              <Link
                href="/hostels"
                className="hidden md:flex rounded-2xl bg-blue-600 px-6 py-3 font-bold text-white transition hover:bg-blue-700"
              >
                Browse Hostels
              </Link>

              <button
                onClick={handleLogout}
                className="flex items-center gap-2 rounded-2xl border-2 border-slate-100 bg-white px-6 py-3 font-bold text-red-600 transition hover:bg-red-50 hover:border-red-100"
              >
                <FaSignOutAlt />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          </div>
        </header>

        {/* CONTENT */}
        <div className="mx-auto max-w-7xl px-6 py-10">

          {/* STATS */}
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            {/* TOTAL BOOKINGS */}
            <Link
              href="/student/bookings"
              role="button"
              className="group relative overflow-hidden rounded-[2rem] bg-white p-7 shadow-sm transition-all hover:-translate-y-1 hover:shadow-xl active:scale-95"
            >
              <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-100 text-3xl text-blue-600 transition group-hover:scale-110">
                <FaHome />
              </div>

              <p className="text-slate-500 font-medium">
                Total Bookings
              </p>

              <h2 className="mt-2 text-5xl font-black text-slate-900">
                {
                  dashboard?.stats?.totalBookings || 0
                }
              </h2>

              <div className="mt-6 flex items-center justify-between border-t border-slate-50 pt-4">
                <span className="text-xs font-bold text-slate-400 group-hover:text-blue-600 transition">View All Stays</span>
                <FaChevronRight className="text-xs text-slate-300 group-hover:text-blue-600 group-hover:translate-x-1 transition" />
              </div>
            </Link>

            {/* ACTIVE */}
            <Link
              href="/student/bookings?status=active"
              role="button"
              className="group relative overflow-hidden rounded-[2rem] bg-white p-7 shadow-sm transition-all hover:-translate-y-1 hover:shadow-xl active:scale-95"
            >
              <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-100 text-3xl text-emerald-600 transition group-hover:scale-110">
                <FaUniversity />
              </div>

              <p className="text-slate-500 font-medium">
                Active Bookings
              </p>

              <h2 className="mt-2 text-5xl font-black text-slate-900">
                {
                  dashboard?.stats?.activeBookings || 0
                }
              </h2>

              <div className="mt-6 flex items-center justify-between border-t border-slate-50 pt-4">
                <span className="text-xs font-bold text-slate-400 group-hover:text-emerald-600 transition">Manage Stays</span>
                <FaChevronRight className="text-xs text-slate-300 group-hover:text-emerald-600 group-hover:translate-x-1 transition" />
              </div>
            </Link>

            {/* PENDING */}
            <Link
              href="/student/bookings?status=pending"
              role="button"
              className="group relative overflow-hidden rounded-[2rem] bg-white p-7 shadow-sm transition-all hover:-translate-y-1 hover:shadow-xl active:scale-95"
            >
              <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-orange-100 text-3xl text-orange-600 transition group-hover:scale-110">
                <FaClock />
              </div>

              <p className="text-slate-500 font-medium">
                Pending Bookings
              </p>

              <h2 className="mt-2 text-5xl font-black text-slate-900">
                {
                  dashboard?.stats?.pendingBookings || 0
                }
              </h2>

              <div className="mt-6 flex items-center justify-between border-t border-slate-50 pt-4">
                <span className="text-xs font-bold text-slate-400 group-hover:text-orange-600 transition">Review Requests</span>
                <FaChevronRight className="text-xs text-slate-300 group-hover:text-orange-600 group-hover:translate-x-1 transition" />
              </div>
            </Link>

            {/* PAYMENTS */}
            <Link
              href="/student/bookings?payment=true"
              role="button"
              className="group relative overflow-hidden rounded-[2rem] bg-white p-7 shadow-sm transition-all hover:-translate-y-1 hover:shadow-xl active:scale-95"
            >
              <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-100 text-3xl text-indigo-600 transition group-hover:scale-110">
                <FaMoneyBillWave />
              </div>

              <p className="text-slate-500 font-medium">
                Total Payments
              </p>

              <h2 className="mt-2 text-4xl font-black text-slate-900">
                GHS{' '}
                {
                  dashboard?.stats?.totalPayments || 0
                }
              </h2>

              <div className="mt-6 flex items-center justify-between border-t border-slate-50 pt-4">
                <span className="text-xs font-bold text-slate-400 group-hover:text-indigo-600 transition">Payment History</span>
                <FaChevronRight className="text-xs text-slate-300 group-hover:text-indigo-600 group-hover:translate-x-1 transition" />
              </div>
            </Link>
          </div>

          {/* QUICK ACTIONS */}
          <div className="mt-10 grid gap-6 md:grid-cols-3">

            <Link
              href="/hostels"
              className="rounded-[2rem] bg-blue-600 p-8 text-white transition hover:bg-blue-700"
            >
              <FaHome className="mb-5 text-4xl" />

              <h3 className="text-3xl font-black">
                Browse Hostels
              </h3>

              <p className="mt-3 text-blue-100">
                Explore available hostels near your university.
              </p>
            </Link>

            <Link
              href="/student/bookings"
              className="rounded-[2rem] bg-white p-8 shadow-sm transition hover:shadow-md"
            >
              <FaBed className="mb-5 text-4xl text-blue-600" />

              <h3 className="text-3xl font-black text-slate-900">
                My Bookings
              </h3>

              <p className="mt-3 text-slate-600">
                Track and manage your bookings.
              </p>
            </Link>

            <Link
              href="/profile"
              className="rounded-[2rem] bg-white p-8 shadow-sm transition hover:shadow-md"
            >
              <FaUniversity className="mb-5 text-4xl text-indigo-600" />

              <h3 className="text-3xl font-black text-slate-900">
                Profile
              </h3>

              <p className="mt-3 text-slate-600">
                Update your student information.
              </p>
            </Link>
          </div>

          {/* RECENT BOOKINGS */}
          <div className="mt-12 rounded-[2rem] sm:rounded-[2.5rem] border border-slate-100 bg-white p-5 sm:p-8 shadow-sm">

            {/* TOP */}
            <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">

              <div>
                <h2 className="text-2xl sm:text-4xl font-black tracking-tight text-slate-900">
                  Recent Bookings
                </h2>

                <p className="mt-1 sm:mt-2 text-base sm:text-lg font-medium text-slate-500">
                  Your latest hostel reservations
                </p>
              </div>

              <Link
                href="/student/bookings"
                className="w-fit rounded-2xl bg-blue-50 px-5 py-3 text-sm font-black text-blue-600 transition hover:bg-blue-100"
              >
                View All
              </Link>
            </div>

            {/* EMPTY STATE */}
            {dashboard?.recentBookings
              ?.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-[2rem] border border-dashed border-slate-200 py-20 text-center">

                <div className="mb-6 flex h-16 sm:h-20 w-16 sm:w-20 items-center justify-center rounded-full bg-slate-100 text-3xl sm:text-4xl text-slate-300">
                  <FaHome />
                </div>

                <h3 className="text-xl sm:text-2xl font-black text-slate-900">
                  No bookings yet
                </h3>

                <p className="mt-2 sm:mt-3 max-w-md text-sm sm:text-base text-slate-500 px-4">
                  Start exploring available hostels and reserve your preferred room.
                </p>

                <Link
                  href="/hostels"
                  className="mt-6 sm:mt-8 rounded-2xl bg-blue-600 px-8 py-4 font-black text-white transition hover:bg-blue-700"
                >
                  Browse Hostels
                </Link>
              </div>
            ) : (

              /* BOOKINGS */
              <div className="space-y-4 sm:space-y-6">

                {dashboard?.recentBookings?.map(
                  (booking) => {

                    const isPaid =
                      booking.paymentStatus ===
                        'paid' ||
                      booking.paymentStatus ===
                        'success';

                    const isApproved =
                      booking.bookingStatus ===
                      'approved';

                    return (
                      <div
                        key={booking._id}
                        className="group overflow-hidden rounded-[1.5rem] sm:rounded-[2rem] border border-slate-100 bg-slate-50 transition-all hover:border-blue-100 hover:bg-white hover:shadow-lg"
                      >

                        <div className="flex flex-col gap-6 sm:gap-8 p-5 sm:p-8 lg:flex-row lg:items-center lg:justify-between">

                          {/* LEFT */}
                          <div className="flex flex-col sm:flex-row items-start gap-5 sm:gap-6">

                            {/* IMAGE */}
                            <div className="h-20 w-20 sm:h-28 sm:w-28 overflow-hidden rounded-2xl sm:rounded-3xl bg-slate-200 shrink-0">

                              {booking.room
                                ?.images?.[0] ? (
                                <img
                                  src={
                                    booking.room
                                      .images[0]
                                  }
                                  alt={
                                    booking.hostel
                                      ?.name
                                  }
                                  className="h-full w-full object-cover transition duration-500 group-hover:scale-110"
                                />
                              ) : (
                                <div className="flex h-full items-center justify-center text-slate-300">
                                  <FaHome className="text-3xl sm:text-4xl" />
                                </div>
                              )}
                            </div>

                            {/* DETAILS */}
                            <div className="min-w-0 flex-1">

                              <div className="mb-2 flex flex-wrap items-center gap-2">

                                <span className="rounded-full bg-blue-100 px-3 py-1 text-[10px] sm:text-xs font-black uppercase tracking-widest text-blue-700">
                                  {
                                    booking.room
                                      ?.roomType
                                  }
                                </span>

                                <span className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-slate-400">
                                  REF #
                                  {booking._id
                                    ?.slice(-6)
                                    .toUpperCase()}
                                </span>
                              </div>

                              <h3 className="text-xl sm:text-3xl font-black text-slate-900 truncate">
                                {
                                  booking.hostel
                                    ?.name
                                }
                              </h3>

                              <div className="mt-1 sm:mt-2 flex items-center gap-2 text-sm sm:text-base text-slate-500">

                                <FaMapMarkerAlt className="text-blue-500 shrink-0" />

                                <span className="font-medium truncate">
                                  {
                                    typeof booking.hostel?.location === 'object'
                                      ? `${booking.hostel.location.city}, ${booking.hostel.location.region}`
                                      : (booking.hostel?.location || 'N/A')
                                  }
                                </span>
                              </div>

                              {/* STATUS */}
                              <div className="mt-4 sm:mt-5 flex flex-wrap gap-2 sm:gap-3">

                                <span
                                  className={`rounded-full px-3 sm:px-4 py-1.5 sm:py-2 text-[10px] sm:text-xs font-black uppercase tracking-wider ${
                                    isPaid
                                      ? 'bg-emerald-100 text-emerald-700'
                                      : 'bg-amber-100 text-amber-700'
                                  }`}
                                >
                                  Payment:{' '}
                                  {
                                    booking.paymentStatus
                                  }
                                </span>

                                <span
                                  className={`rounded-full px-3 sm:px-4 py-1.5 sm:py-2 text-[10px] sm:text-xs font-black uppercase tracking-wider ${
                                    isApproved
                                      ? 'bg-blue-100 text-blue-700'
                                      : booking.bookingStatus ===
                                        'pending'
                                      ? 'bg-orange-100 text-orange-700'
                                      : 'bg-slate-100 text-slate-700'
                                  }`}
                                >
                                  {
                                    booking.bookingStatus
                                  }
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* RIGHT */}
                          <div className="flex flex-col items-start gap-5 sm:gap-6 lg:items-end">

                            {/* PRICE */}
                            <div className="text-left lg:text-right">

                              <p className="text-[10px] sm:text-xs font-black uppercase tracking-widest text-slate-400">
                                Total Amount
                              </p>

                              <h2 className="mt-0.5 sm:mt-1 text-2xl sm:text-4xl lg:text-5xl font-black tracking-tight text-slate-900">
                                GHS{' '}
                                {
                                  booking.totalPaid
                                }
                              </h2>

                              <p className="mt-1 sm:mt-2 text-xs sm:text-sm font-medium text-slate-500">
                                Check-in:{' '}
                                {new Date(
                                  booking.checkInDate
                                ).toLocaleDateString()}
                              </p>
                            </div>

                            {/* BUTTONS */}
                            <div className="flex flex-wrap gap-2 sm:gap-3">

                              <Link
                                href="/student/bookings"
                                className="rounded-xl sm:rounded-2xl border border-slate-200 bg-white px-4 sm:px-5 py-2.5 sm:py-3 text-xs sm:text-sm font-black text-slate-700 transition hover:bg-slate-100"
                              >
                                View Booking
                              </Link>

                              <Link
                                href={`/hostels/${booking.hostel?._id}`}
                                className="rounded-xl sm:rounded-2xl bg-blue-600 px-4 sm:px-5 py-2.5 sm:py-3 text-xs sm:text-sm font-black text-white transition hover:bg-blue-700"
                              >
                                Hostel Details
                              </Link>

                              {isPaid && (
                                <Link
                                  href={`/payments/receipt/${booking._id}`}
                                  className="rounded-xl sm:rounded-2xl bg-emerald-600 px-4 sm:px-5 py-2.5 sm:py-3 text-xs sm:text-sm font-black text-white transition hover:bg-emerald-700"
                                >
                                  <div className="flex items-center gap-2">
                                    <FaReceipt />
                                    Receipt
                                  </div>
                                </Link>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  }
                )}
              </div>
            )}
          </div>

          {/* HELP & SUPPORT */}
          <div className="mt-12 rounded-[2.5rem] bg-slate-900 p-10 text-white shadow-2xl">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-10">
              <div className="max-w-xl">
                <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-600 text-3xl">
                  <FaQuestionCircle />
                </div>
                
                <h2 className="text-4xl font-black tracking-tight">
                  Need Help & Support?
                </h2>
                
                <p className="mt-4 text-lg text-slate-400">
                  Our dedicated support team is here to assist you with any questions or issues regarding your hostel booking experience.
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1 w-full lg:w-auto">
                <a 
                  href={`mailto:${supportSettings.email}`}
                  className="flex items-center gap-4 rounded-[1.5rem] bg-slate-800 p-5 transition hover:bg-slate-700"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500/20 text-blue-400">
                    <FaEnvelope className="text-xl" />
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-widest text-slate-500">Email Us</p>
                    <p className="font-bold">{supportSettings.email}</p>
                  </div>
                </a>

                <a 
                  href={`tel:${supportSettings.phone}`}
                  className="flex items-center gap-4 rounded-[1.5rem] bg-slate-800 p-5 transition hover:bg-slate-700"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-400">
                    <FaPhone className="text-xl" />
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-widest text-slate-500">Call Us</p>
                    <p className="font-bold">{supportSettings.phone}</p>
                  </div>
                </a>

                <a 
                  href={`https://wa.me/${supportSettings.whatsapp.replace(/\D/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-4 rounded-[1.5rem] bg-emerald-600 p-5 transition hover:bg-emerald-700 sm:col-span-2 lg:col-span-1"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/20 text-white">
                    <FaWhatsapp className="text-2xl" />
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-widest text-emerald-100">WhatsApp Support</p>
                    <p className="font-black text-xl">Chat with us</p>
                  </div>
                </a>
              </div>
            </div>
          </div>
        </div>
      </main>
  );
}
