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
  FaSpinner,
  FaCloudUploadAlt,
  FaTimes,
  FaBell
} from 'react-icons/fa';

import { useNav } from '../layout';
import { useAuthStore } from '../../../src/store/authStore';
import API from '../../../src/lib/axios';
import toast from 'react-hot-toast';
import { submitAmbassadorApplication } from '../../../src/services/ambassadorService';
import { uploadPublicFile } from '../../../src/services/authService';

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

    totalAmount?: number | string | null;
    amountPaid?: number | string | null;
    payment?: { amount?: number | string | null } | null;
    totalPaid?: number | string | null;
    amount?: number | string | null;

    checkInDate?: string | null;
  }[];
}

const getBookingAmount = (booking: DashboardData['recentBookings'][number]) =>
  Number(
    booking.totalAmount ??
      booking.amountPaid ??
      booking.payment?.amount ??
      booking.totalPaid ??
      booking.amount ??
      0
  ).toLocaleString('en-GH', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

const formatCheckInDate = (checkInDate?: string | null) => {
  if (!checkInDate) return 'Not scheduled';

  const date = new Date(checkInDate);
  return Number.isNaN(date.getTime())
    ? 'Not scheduled'
    : date.toLocaleDateString();
};

import { useSettingsStore } from '../../../src/store/settingsStore';

export default function StudentDashboardPage() {
  const router = useRouter();
  const { openSidebar } = useNav();
  const { token, logout, user } =
    useAuthStore();
  
  const { supportSettings } = useSettingsStore();

  const [dashboard, setDashboard] =
    useState<DashboardData | null>(
      null
    );

  // Ambassador application modal states
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
  const [submittingApplication, setSubmittingApplication] = useState(false);
  const [uploadingId, setUploadingId] = useState(false);
  const [uploadingPic, setUploadingPic] = useState(false);

  // Form states
  const [appForm, setAppForm] = useState({
    faculty: '',
    level: '100',
    hallHostel: '',
    whatsapp: '',
    instagramUsername: '',
    tiktokUsername: '',
    groupsManagedCount: 0,
    estimatedStudentReach: 0,
    leadershipExperience: '',
    whyBecomeAmbassador: '',
    studentIdUrl: '',
    profilePictureUrl: '',
    agreedToTerms: false
  });

  const handleOpenApplyModal = () => {
    const profile = (user as any)?.ambassadorProfile || {};
    setAppForm({
      faculty: profile.faculty || '',
      level: profile.level || '100',
      hallHostel: profile.hallHostel || '',
      whatsapp: profile.whatsapp || user?.phone || '',
      instagramUsername: profile.instagramUsername || '',
      tiktokUsername: profile.tiktokUsername || '',
      groupsManagedCount: profile.groupsManagedCount || 0,
      estimatedStudentReach: profile.estimatedStudentReach || 0,
      leadershipExperience: profile.leadershipExperience || '',
      whyBecomeAmbassador: profile.whyBecomeAmbassador || '',
      studentIdUrl: profile.studentIdUrl || '',
      profilePictureUrl: profile.profilePictureUrl || '',
      agreedToTerms: profile.agreedToTerms || false
    });
    setIsApplyModalOpen(true);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, field: 'studentIdUrl' | 'profilePictureUrl') => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size cannot exceed 5MB.');
      return;
    }

    const isId = field === 'studentIdUrl';
    if (isId) setUploadingId(true);
    else setUploadingPic(true);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await uploadPublicFile(formData);
      const url = res.fileUrl || res.url || res.data?.fileUrl;
      if (!url) throw new Error('Secure URL missing from upload response');
      setAppForm(prev => ({ ...prev, [field]: url }));
      toast.success('File uploaded successfully!');
    } catch (err: any) {
      toast.error('Failed to upload file: ' + err.message);
    } finally {
      if (isId) setUploadingId(false);
      else setUploadingPic(false);
    }
  };

  const handleSubmitApplication = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!appForm.faculty.trim() || !appForm.hallHostel.trim() || !appForm.whatsapp.trim() || !appForm.whyBecomeAmbassador.trim()) {
      toast.error('Please fill in all required fields.');
      return;
    }
    if (!appForm.studentIdUrl) {
      toast.error('Please upload your Student ID to apply.');
      return;
    }
    if (!appForm.agreedToTerms) {
      toast.error('You must agree to represent Relaxly professionally.');
      return;
    }

    setSubmittingApplication(true);
    try {
      await submitAmbassadorApplication({
        university: user?.schoolName || (user as any)?.university?.name || 'Accra Tech',
        faculty: appForm.faculty,
        level: appForm.level,
        hallHostel: appForm.hallHostel,
        phone: user?.phone || appForm.whatsapp,
        whatsapp: appForm.whatsapp,
        instagramUsername: appForm.instagramUsername,
        tiktokUsername: appForm.tiktokUsername,
        groupsManagedCount: Number(appForm.groupsManagedCount) || 0,
        estimatedStudentReach: Number(appForm.estimatedStudentReach) || 0,
        leadershipExperience: appForm.leadershipExperience,
        whyBecomeAmbassador: appForm.whyBecomeAmbassador,
        studentIdUrl: appForm.studentIdUrl,
        profilePictureUrl: appForm.profilePictureUrl,
        agreedToTerms: appForm.agreedToTerms
      });
      toast.success('Your Ambassador Application has been submitted successfully!');
      setIsApplyModalOpen(false);
      await fetchDashboard();
    } catch (err: any) {
      toast.error('Failed to submit application: ' + err.message);
    } finally {
      setSubmittingApplication(false);
    }
  };

  const fetchDashboard =
    useCallback(
      async () => {
        try {
          if (!token) return;

          const [dashboardRes, profileRes] = await Promise.all([
            API.get('/dashboard/student', {
              headers: { Authorization: `Bearer ${token}` }
            }),
            API.get('/users/profile', {
              headers: { Authorization: `Bearer ${token}` }
            })
          ]);

          setDashboard(dashboardRes.data);
          
          const profileData = profileRes.data?.data || profileRes.data;
          if (profileData) {
            useAuthStore.getState().setAuth(profileData, token);
          }
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

  // ── Notification bell state ──────────────────────────────────────────────
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);

  const fetchNotifications = useCallback(async () => {
    try {
      if (!token) return;
      const res = await API.get('/notifications', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const envelope = res.data.data || res.data || {};
      const list = envelope.notifications || (Array.isArray(envelope) ? envelope : []);
      setNotifications(list);
      setUnreadCount(
        envelope.unreadCount !== undefined
          ? envelope.unreadCount
          : list.filter((n: any) => !n.read).length
      );
    } catch {
      // silent
    }
  }, [token]);

  const handleMarkAsRead = async (id: string) => {
    try {
      await API.patch(`/notifications/${id}/read`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNotifications(prev => prev.map(n => n._id === id ? { ...n, read: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch {
      // silent
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await API.patch('/notifications/read-all', {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      setUnreadCount(0);
      toast.success('All notifications marked as read');
    } catch {
      // silent
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);
  // ─────────────────────────────────────────────────────────────────────────

  const handleLogout = () => {
    logout();
    router.replace('/login');
  };

  return (
    <main className="min-h-screen bg-slate-100 pb-20">

      {/* ── HEADER ────────────────────────────────────────────────────────────── */}
      {/*
        Layout: single flex row, two groups.
        Left  — min-w-0 flex-1  → menu button + title (title truncates, never pushes right group)
        Right — shrink-0        → logout button + notification bell (both h-10 w-10)
        Bell is LAST in the flex row so its absolute dropdown cannot overlap logout.
      */}
      <header className="border-b border-slate-200 bg-white sticky top-0 z-10">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 sm:px-6 py-4">

          {/* LEFT — menu + title */}
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <button
              onClick={openSidebar}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-slate-50 text-slate-600 transition hover:bg-slate-100 lg:hidden"
            >
              <FaBars className="text-lg" />
            </button>

            <div className="min-w-0">
              <h1 className="truncate text-xl sm:text-3xl font-black text-slate-900 leading-tight">
                Student Dashboard
              </h1>
              <p className="mt-0.5 hidden text-xs sm:block text-slate-500 font-medium">
                Welcome back to your hostel portal
              </p>
            </div>
          </div>

          {/* RIGHT — logout then bell (bell is last so dropdown falls below it, away from logout) */}
          <div className="flex items-center gap-2 shrink-0">

            {/* Browse Hostels — hidden on small screens */}
            <Link
              href="/hostels"
              className="hidden md:flex rounded-2xl bg-blue-600 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-blue-700"
            >
              Browse Hostels
            </Link>

            {/* Logout button */}
            <button
              onClick={handleLogout}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border-2 border-slate-100 bg-white text-red-600 transition hover:bg-red-50 hover:border-red-100 sm:w-auto sm:px-4 sm:gap-2"
              title="Logout"
            >
              <FaSignOutAlt className="shrink-0" />
              <span className="hidden sm:inline text-sm font-bold">Logout</span>
            </button>

            {/* Notification bell — rightmost so dropdown never overlaps logout */}
            <div className="relative">
              <button
                onClick={() => setShowNotifDropdown(v => !v)}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-slate-50 text-slate-600 transition hover:bg-slate-100"
                title="Notifications"
              >
                <FaBell />
                {/* Unread badge — scoped to this button's own stacking context */}
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white ring-2 ring-white pointer-events-none animate-pulse">
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* Dropdown — right-0 top-full so it opens below the bell, not over logout */}
              {showNotifDropdown && (
                <div className="absolute right-0 top-full mt-2 w-[calc(100vw-2rem)] max-w-xs sm:w-80 rounded-2xl border border-slate-100 bg-white p-4 shadow-xl ring-1 ring-black/5 z-50">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2 mb-3">
                    <span className="text-xs font-black text-slate-800 uppercase tracking-wider">Notifications</span>
                    {unreadCount > 0 && (
                      <button
                        onClick={handleMarkAllAsRead}
                        className="text-[10px] font-bold text-blue-600 hover:underline"
                      >
                        Mark all read
                      </button>
                    )}
                  </div>

                  <div className="max-h-64 overflow-y-auto space-y-2">
                    {notifications.length === 0 ? (
                      <p className="text-xs text-slate-400 italic text-center py-6">No notifications yet.</p>
                    ) : (
                      notifications.map((notif: any) => (
                        <div
                          key={notif._id}
                          onClick={() => handleMarkAsRead(notif._id)}
                          className={`p-2.5 rounded-xl border text-xs cursor-pointer transition ${
                            notif.read
                              ? 'bg-white border-slate-100 text-slate-600'
                              : 'bg-blue-50/50 border-blue-100 text-slate-800'
                          }`}
                        >
                          <div className="flex justify-between items-start gap-2">
                            <strong className="font-bold truncate" title={notif.title}>{notif.title}</strong>
                            {!notif.read && <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-blue-600 mt-1" />}
                          </div>
                          <p className="text-slate-500 mt-1 text-[11px] leading-relaxed">{notif.message}</p>
                          <span className="text-[9px] text-slate-400 font-semibold block mt-1">
                            {new Date(notif.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

          </div>
        </div>
      </header>

        {/* CONTENT */}
        <div className="mx-auto max-w-7xl px-6 py-10">

          {/* AMBASSADOR STATUS BANNER */}
          {/* AMBASSADOR STATUS BANNERS */}
          {user?.isAmbassador && user?.ambassadorStatus === 'pending' && (
            <div className="mb-8 rounded-3xl bg-white p-6 border border-slate-100 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-[10px] font-black uppercase tracking-widest bg-orange-50 text-orange-600 px-2.5 py-0.5 rounded-full border border-orange-100">
                  Under Review
                </span>
                <h3 className="text-lg font-bold text-slate-800 mt-2">Ambassador Application Pending</h3>
                <p className="text-slate-500 text-xs mt-1">Our campus coordination team is reviewing your application details.</p>
              </div>
              <span className="text-sm font-bold text-slate-400 self-start sm:self-center px-4 py-2 bg-slate-100 rounded-xl flex items-center gap-1.5 border border-slate-200">
                <FaClock className="h-4 w-4 text-orange-500" />
                Pending Marketing Approval
              </span>
            </div>
          )}

          {user?.isAmbassador && user?.ambassadorStatus === 'approved' && (
            <div className="mb-8 rounded-3xl bg-gradient-to-r from-blue-600 to-indigo-700 p-6 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-md">
              <div>
                <span className="text-[10px] font-black uppercase tracking-widest bg-blue-500/40 px-2.5 py-0.5 rounded-full border border-blue-400/20">
                  Approved Partner
                </span>
                <h3 className="text-xl font-bold mt-2">Your Ambassador Dashboard is active!</h3>
                <p className="text-blue-100 text-xs mt-1">Track your referred bookings, earnings, and campus ranking.</p>
              </div>
              <Link
                href="/student/ambassador"
                className="rounded-2xl bg-white px-5 py-3 text-sm font-bold text-blue-700 hover:bg-blue-50 transition self-start sm:self-center"
              >
                Go to Ambassador Dashboard
              </Link>
            </div>
          )}

          {user?.isAmbassador && user?.ambassadorStatus === 'rejected' && (
            <div className="mb-8 rounded-3xl bg-red-50/50 p-6 border border-red-100 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex-1">
                <span className="text-[10px] font-black uppercase tracking-widest bg-red-100 text-red-700 px-2.5 py-0.5 rounded-full border border-red-200">
                  Application Rejected
                </span>
                <h3 className="text-lg font-bold text-slate-800 mt-2">Ambassador Application Action Required</h3>
                {user?.rejectionReason && (
                  <p className="text-red-700 text-xs mt-1 font-bold">Reason: {user.rejectionReason}</p>
                )}
                <p className="text-slate-500 text-xs mt-1">Please review the reason and update your application details to submit again.</p>
              </div>
              <button
                onClick={handleOpenApplyModal}
                className="rounded-2xl bg-red-650 hover:bg-red-700 text-sm font-bold text-white px-5 py-3 transition self-start sm:self-center shrink-0 shadow-sm"
              >
                Update Application
              </button>
            </div>
          )}

          {(!user?.isAmbassador || user?.ambassadorStatus === 'none') && (
            <div className="mb-8 rounded-3xl bg-white p-6 border border-slate-100 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-[10px] font-black uppercase tracking-widest bg-blue-50 text-blue-600 px-2.5 py-0.5 rounded-full border border-blue-100">
                  Earn Income
                </span>
                <h3 className="text-lg font-bold text-slate-800 mt-2">Become a Relaxly Campus Ambassador</h3>
                <p className="text-slate-500 text-xs mt-1">Help friends find verified accommodation and earn commissions on every booking.</p>
              </div>
              <button
                onClick={handleOpenApplyModal}
                className="rounded-2xl bg-blue-600 px-5 py-3 text-sm font-bold text-white hover:bg-blue-700 transition self-start sm:self-center"
              >
                Apply Now
              </button>
            </div>
          )}

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

                        <div className="flex min-w-0 flex-col gap-5 p-5 sm:gap-8 sm:p-8 lg:flex-row lg:items-center lg:justify-between">

                          {/* LEFT */}
                          <div className="flex min-w-0 flex-col items-start gap-5 sm:flex-row sm:gap-6 lg:flex-1">

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

                              <h3 className="break-words text-2xl font-black leading-tight text-slate-900 sm:text-3xl">
                                {
                                  booking.hostel
                                    ?.name
                                }
                              </h3>

                              <div className="mt-1 sm:mt-2 flex items-center gap-2 text-sm sm:text-base text-slate-500">

                                <FaMapMarkerAlt className="text-blue-500 shrink-0" />

                                <span className="min-w-0 break-words font-medium">
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
                          <div className="flex w-full flex-col items-start gap-4 sm:gap-6 lg:w-auto lg:items-end">

                            {/* PRICE */}
                            <div className="w-full text-left lg:w-auto lg:text-right">

                              <p className="text-[10px] sm:text-xs font-black uppercase tracking-widest text-slate-400">
                                Total Amount
                              </p>

                              <h2 className="mt-0.5 sm:mt-1 text-2xl sm:text-4xl lg:text-5xl font-black tracking-tight text-slate-900">
                                GHS {getBookingAmount(booking)}
                              </h2>

                              <p className="mt-1 sm:mt-2 text-xs sm:text-sm font-medium text-slate-500">
                                Check-in:{' '}
                                {formatCheckInDate(booking.checkInDate)}
                              </p>
                            </div>

                            {/* BUTTONS */}
                            <div className="grid w-full grid-cols-2 gap-2 sm:flex sm:w-auto sm:gap-3">

                              <Link
                                href="/student/bookings"
                                className="flex min-h-11 w-full items-center justify-center rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-center text-xs font-black text-slate-700 transition hover:bg-slate-100 sm:w-auto sm:rounded-2xl sm:px-5 sm:py-3 sm:text-sm"
                              >
                                View Booking
                              </Link>

                              <Link
                                href={`/hostels/${booking.hostel?._id}`}
                                className="flex min-h-11 w-full items-center justify-center rounded-xl bg-blue-600 px-3 py-2.5 text-center text-xs font-black text-white transition hover:bg-blue-700 sm:w-auto sm:rounded-2xl sm:px-5 sm:py-3 sm:text-sm"
                              >
                                Hostel Details
                              </Link>

                              {isPaid && (
                                <Link
                                  href={`/payments/receipt/${booking._id}`}
                                  className="col-span-2 flex min-h-11 w-full items-center justify-center rounded-xl bg-emerald-600 px-3 py-2.5 text-center text-xs font-black text-white transition hover:bg-emerald-700 sm:w-auto sm:rounded-2xl sm:px-5 sm:py-3 sm:text-sm"
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
                
                <h2 className="text-4xl font-black tracking-tight flex flex-wrap items-center gap-3">
                  <span>Need Help & Support?</span>
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                    supportSettings.isOnline ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-slate-800 text-slate-400 border border-slate-700'
                  }`}>
                    <span className={`h-1.5 w-1.5 rounded-full ${supportSettings.isOnline ? 'bg-emerald-400 animate-pulse' : 'bg-slate-400'}`}></span>
                    {supportSettings.isOnline ? 'Online' : 'Offline'}
                  </span>
                </h2>
                
                <p className="mt-4 text-lg text-slate-400">
                  Our dedicated support team is here to assist you with any questions or issues regarding your hostel booking experience.
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1 w-full lg:w-auto">
                {(supportSettings.emailObj?.enabled !== false) && (
                  <a 
                    href={`mailto:${supportSettings.emailObj?.address || supportSettings.email}`}
                    className="flex items-center gap-4 rounded-[1.5rem] bg-slate-800 p-5 transition hover:bg-slate-700"
                  >
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500/20 text-blue-400">
                      <FaEnvelope className="text-xl" />
                    </div>
                    <div>
                      <p className="text-xs font-bold uppercase tracking-widest text-slate-500">
                        {supportSettings.emailObj?.displayName || 'Email Us'}
                      </p>
                      <p className="font-bold">{supportSettings.emailObj?.address || supportSettings.email}</p>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {supportSettings.emailObj?.responseTime || 'Response within 2 hours'}
                      </p>
                    </div>
                  </a>
                )}

                {(supportSettings.whatsappObj?.enabled !== false) && (
                  <a 
                    href={`https://wa.me/${(supportSettings.whatsappObj?.number || supportSettings.whatsapp).replace(/\D/g, '')}?text=${encodeURIComponent(supportSettings.whatsappObj?.defaultMessage || 'Hello Relaxly Support, I need assistance with my booking.')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-4 rounded-[1.5rem] bg-emerald-600 p-5 transition hover:bg-emerald-700 sm:col-span-2 lg:col-span-1"
                  >
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/20 text-white">
                      <FaWhatsapp className="text-2xl" />
                    </div>
                    <div>
                      <p className="text-xs font-bold uppercase tracking-widest text-emerald-100">
                        {supportSettings.whatsappObj?.displayName || 'WhatsApp Support'}
                      </p>
                      <p className="font-black text-xl">Chat with us</p>
                      <p className="text-xs text-emerald-100/80 mt-0.5">
                        {supportSettings.whatsappObj?.number || supportSettings.whatsapp}
                      </p>
                    </div>
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      {/* AMBASSADOR APPLICATION MODAL */}
      {isApplyModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-150">
            {/* Header */}
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-blue-50/50">
              <div>
                <h3 className="text-lg font-black text-slate-800">
                  {user?.ambassadorStatus === 'rejected' ? 'Update Ambassador Application' : 'Become a Relaxly Campus Ambassador'}
                </h3>
                <p className="text-xs text-slate-500 mt-1">Earn commissions by promoting verified student hostels on your campus.</p>
              </div>
              <button
                onClick={() => setIsApplyModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-full hover:bg-slate-100 transition"
              >
                <FaTimes className="h-5 w-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmitApplication} className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Auto-filled Section */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-3">Academic Profile (Read-Only)</h4>
                <div className="grid gap-4 sm:grid-cols-2 text-xs">
                  <div>
                    <label className="font-semibold text-slate-500 block mb-1">Full Name</label>
                    <input
                      type="text"
                      value={user?.name || ''}
                      readOnly
                      className="w-full rounded-xl border border-slate-200 bg-slate-100/50 px-3.5 py-2 font-bold text-slate-700 outline-none"
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-slate-500 block mb-1">Email Address</label>
                    <input
                      type="text"
                      value={user?.email || ''}
                      readOnly
                      className="w-full rounded-xl border border-slate-200 bg-slate-100/50 px-3.5 py-2 font-bold text-slate-700 outline-none"
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-slate-500 block mb-1">University</label>
                    <input
                      type="text"
                      value={user?.schoolName || (user as any)?.university?.name || 'Accra Tech'}
                      readOnly
                      className="w-full rounded-xl border border-slate-200 bg-slate-100/50 px-3.5 py-2 font-bold text-slate-700 outline-none"
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-slate-500 block mb-1">Student ID Card Number</label>
                    <input
                      type="text"
                      value={user?.studentId || 'N/A'}
                      readOnly
                      className="w-full rounded-xl border border-slate-200 bg-slate-100/50 px-3.5 py-2 font-bold text-slate-700 outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Ambassador Specific Fields */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-xs font-bold text-slate-700">Faculty *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Engineering / Science"
                    value={appForm.faculty}
                    onChange={(e) => setAppForm(prev => ({ ...prev, faculty: e.target.value }))}
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs text-slate-800 outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-bold text-slate-700">Level *</label>
                  <select
                    value={appForm.level}
                    onChange={(e) => setAppForm(prev => ({ ...prev, level: e.target.value }))}
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs text-slate-800 outline-none focus:border-blue-500"
                  >
                    <option value="100">Level 100</option>
                    <option value="200">Level 200</option>
                    <option value="300">Level 300</option>
                    <option value="400">Level 400</option>
                    <option value="postgraduate">Postgraduate</option>
                  </select>
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-bold text-slate-700">Hall / Hostel of Residence *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Limann Hall"
                    value={appForm.hallHostel}
                    onChange={(e) => setAppForm(prev => ({ ...prev, hallHostel: e.target.value }))}
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs text-slate-800 outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-bold text-slate-700">WhatsApp Number *</label>
                  <input
                    type="tel"
                    required
                    placeholder="e.g. 0541234567"
                    value={appForm.whatsapp}
                    onChange={(e) => setAppForm(prev => ({ ...prev, whatsapp: e.target.value }))}
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs text-slate-800 outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-bold text-slate-700">Instagram Handle (Optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. @username"
                    value={appForm.instagramUsername}
                    onChange={(e) => setAppForm(prev => ({ ...prev, instagramUsername: e.target.value }))}
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs text-slate-800 outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-bold text-slate-700">TikTok Handle (Optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. @username"
                    value={appForm.tiktokUsername}
                    onChange={(e) => setAppForm(prev => ({ ...prev, tiktokUsername: e.target.value }))}
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs text-slate-800 outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-bold text-slate-700">Student Groups Managed (Optional)</label>
                  <input
                    type="number"
                    min="0"
                    placeholder="e.g. 3 groups"
                    value={appForm.groupsManagedCount}
                    onChange={(e) => setAppForm(prev => ({ ...prev, groupsManagedCount: Number(e.target.value) }))}
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs text-slate-800 outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-bold text-slate-700">Estimated Student Reach *</label>
                  <input
                    type="number"
                    min="0"
                    required
                    placeholder="e.g. 500 students"
                    value={appForm.estimatedStudentReach}
                    onChange={(e) => setAppForm(prev => ({ ...prev, estimatedStudentReach: Number(e.target.value) }))}
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs text-slate-800 outline-none focus:border-blue-500"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="mb-1.5 block text-xs font-bold text-slate-700">Leadership Experience (Optional)</label>
                  <textarea
                    placeholder="List any class rep, senate, or club leadership roles..."
                    value={appForm.leadershipExperience}
                    onChange={(e) => setAppForm(prev => ({ ...prev, leadershipExperience: e.target.value }))}
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs text-slate-800 outline-none focus:border-blue-500 h-20 resize-none"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="mb-1.5 block text-xs font-bold text-slate-700">Why do you want to become a Relaxly Ambassador? *</label>
                  <textarea
                    required
                    placeholder="Tell us why you would be a great ambassador..."
                    value={appForm.whyBecomeAmbassador}
                    onChange={(e) => setAppForm(prev => ({ ...prev, whyBecomeAmbassador: e.target.value }))}
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs text-slate-800 outline-none focus:border-blue-500 h-24 resize-none"
                  />
                </div>

                {/* Upload Section */}
                <div>
                  <label className="mb-1.5 block text-xs font-bold text-slate-700">Upload Student ID Card *</label>
                  <div className="relative flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-200 bg-white p-4 text-center cursor-pointer hover:border-blue-400">
                    <input
                      type="file"
                      accept=".jpg,.jpeg,.png,.pdf"
                      onChange={(e) => handleFileUpload(e, 'studentIdUrl')}
                      className="absolute inset-0 cursor-pointer opacity-0"
                    />
                    {uploadingId ? (
                      <FaSpinner className="animate-spin text-lg text-blue-600" />
                    ) : appForm.studentIdUrl ? (
                      <span className="text-[10px] text-emerald-600 font-black truncate max-w-[180px]">
                        ID Card Uploaded ✓
                      </span>
                    ) : (
                      <span className="text-[10px] text-slate-400 font-bold flex items-center gap-1">
                        <FaCloudUploadAlt className="h-4 w-4" /> Click to Upload (Max 5MB)
                      </span>
                    )}
                  </div>
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-bold text-slate-700">Upload Profile Picture (Optional)</label>
                  <div className="relative flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-200 bg-white p-4 text-center cursor-pointer hover:border-blue-400">
                    <input
                      type="file"
                      accept=".jpg,.jpeg,.png"
                      onChange={(e) => handleFileUpload(e, 'profilePictureUrl')}
                      className="absolute inset-0 cursor-pointer opacity-0"
                    />
                    {uploadingPic ? (
                      <FaSpinner className="animate-spin text-lg text-blue-600" />
                    ) : appForm.profilePictureUrl ? (
                      <span className="text-[10px] text-emerald-600 font-black truncate max-w-[180px]">
                        Photo Uploaded ✓
                      </span>
                    ) : (
                      <span className="text-[10px] text-slate-400 font-bold flex items-center gap-1">
                        <FaCloudUploadAlt className="h-4 w-4" /> Click to Upload (Max 5MB)
                      </span>
                    )}
                  </div>
                </div>

                {/* Terms Agreement */}
                <div className="sm:col-span-2 mt-2">
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={appForm.agreedToTerms}
                      onChange={(e) => setAppForm(prev => ({ ...prev, agreedToTerms: e.target.checked }))}
                      required
                      className="mt-0.5 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-xs text-blue-900 font-semibold leading-relaxed">
                      I agree to represent Relaxly professionally, promote hostels ethically, and abide by the Relaxly Ambassador Agreement.
                    </span>
                  </label>
                </div>
              </div>

              {/* Submit footer buttons */}
              <div className="flex justify-end gap-2 pt-4 border-t border-slate-100 mt-6">
                <button
                  type="button"
                  onClick={() => setIsApplyModalOpen(false)}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-5 py-2.5 rounded-xl text-xs font-bold transition"
                  disabled={submittingApplication}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingApplication}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 shadow-sm"
                >
                  {submittingApplication ? (
                    <>
                      <FaSpinner className="animate-spin h-3.5 w-3.5" />
                      <span>Submitting...</span>
                    </>
                  ) : (
                    <span>{user?.ambassadorStatus === 'rejected' ? 'Update & Reapply' : 'Submit Application'}</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}
