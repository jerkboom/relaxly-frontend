'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';
import {
  FaCopy,
  FaQrcode,
  FaHome,
  FaMoneyBillWave,
  FaChevronLeft,
  FaUsers,
  FaTrophy,
  FaDownload,
  FaEye,
  FaFolderOpen,
  FaWhatsapp,
  FaEnvelope,
  FaSpinner,
  FaAward,
  FaRoute,
  FaHistory,
  FaCheckCircle,
  FaClock,
  FaTimesCircle,
  FaBell,
  FaTelegram,
  FaFacebook,
  FaTwitter,
  FaShareAlt
} from 'react-icons/fa';

import API from '../../../src/lib/axios';
import { useAuthStore } from '../../../src/store/authStore';
import { useSettingsStore } from '../../../src/store/settingsStore';
import { getReferralUrl } from '../../../src/utils/urlHelper';

const formatMoney = (amount: number) => `GHS ${Number(amount || 0).toFixed(2)}`;

interface BookingRecord {
  _id: string;
  referredStudent: { name: string };
  hostel: { name: string; location: string };
  bookingAmount: number;
  commissionAmount: number;
  status: 'pending' | 'approved' | 'paid' | 'cancelled' | 'refunded';
  createdAt: string;
}

interface DashboardStats {
  profile: {
    role: 'ambassador' | 'campus_leader' | 'regional_manager';
    badge: 'bronze' | 'silver' | 'gold' | 'diamond' | 'legend';
    referralCode: string;
    referralUrl: string;
    qrCodeUrl?: string;
    university: string;
  };
  metrics: {
    referralsCount: number;
    bookingsCount: number;
    paidEarnings: number;
    pendingEarnings: number;
    availableBalance: number;
    leaderboardRank: number | string;
    minPayout?: number;
    totalClicks?: number;
    registrationStartedCount?: number;
    hostelViewsCount?: number;
    conversionRate?: number;
    bookingConversionRate?: number;
    deviceBreakdown?: any[];
    browserBreakdown?: any[];
    sourceBreakdown?: any[];
  };
  bookings: BookingRecord[];
}

export default function AmbassadorDashboard() {
  const router = useRouter();
  const { token } = useAuthStore();
  const { supportSettings } = useSettingsStore();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'overview' | 'bookings' | 'leaderboard' | 'marketing' | 'support'>('overview');

  // Payout States
  const [payoutsHistory, setPayoutsHistory] = useState<any[]>([]);
  const [isPayoutModalOpen, setIsPayoutModalOpen] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState<string>('');
  const [withdrawMethod, setWithdrawMethod] = useState<'momo' | 'bank'>('momo');
  const [momoNetwork, setMomoNetwork] = useState<string>('MTN');
  const [momoPhone, setMomoPhone] = useState<string>('');
  const [bankName, setBankName] = useState<string>('');
  const [bankAccName, setBankAccName] = useState<string>('');
  const [bankAccNum, setBankAccNum] = useState<string>('');
  const [submittingPayout, setSubmittingPayout] = useState(false);

  // Marketing Assets CMS state
  const [marketingAssets, setMarketingAssets] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [previewAsset, setPreviewAsset] = useState<any | null>(null);

  // Campaign Notifications state
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [showNotificationsDropdown, setShowNotificationsDropdown] = useState<boolean>(false);
  const referralCode = stats?.profile?.referralCode || '';
  const referralUrl = referralCode ? getReferralUrl(referralCode) : '';
  const fetchNotifications = useCallback(async () => {
    try {
      if (!token) return;
      const res = await API.get('/notifications', { headers: { Authorization: `Bearer ${token}` } });
      const dataEnvelope = res.data.data || res.data || {};
      const list = dataEnvelope.notifications || (Array.isArray(dataEnvelope) ? dataEnvelope : []);
      setNotifications(list);
      setUnreadCount(dataEnvelope.unreadCount !== undefined ? dataEnvelope.unreadCount : list.filter((n: any) => !n.read).length);
    } catch {
      // Ignored
    }
  }, [token]);

  const handleMarkAsRead = async (id: string) => {
    try {
      await API.patch(`/notifications/${id}/read`, {}, { headers: { Authorization: `Bearer ${token}` } });
      setNotifications(prev => prev.map(n => n._id === id ? { ...n, read: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch {
      // Ignored
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await API.patch('/notifications/read-all', {}, { headers: { Authorization: `Bearer ${token}` } });
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      setUnreadCount(0);
      toast.success('All notifications marked as read');
    } catch {
      // Ignored
    }
  };

  const handlePreviewAsset = async (asset: any) => {
    setPreviewAsset(asset);
    try {
      await API.post(`/ambassadors/assets/${asset._id}/download`, {}, { headers: { Authorization: `Bearer ${token}` } });
      setMarketingAssets(prev => prev.map(a => a._id === asset._id ? { ...a, downloadsCount: (a.downloadsCount || 0) + 1 } : a));
    } catch {
      // Ignored error
    }
  };

  const fetchMarketingAssets = useCallback(async () => {
    try {
      if (!token) return;
      const res = await API.get('/ambassadors/assets', { headers: { Authorization: `Bearer ${token}` } });
      setMarketingAssets(res.data.data || res.data || []);
    } catch {
      // Silent error
    }
  }, [token]);

  const handleDownloadAsset = async (asset: any) => {
    try {
      await API.post(`/ambassadors/assets/${asset._id}/download`, {}, { headers: { Authorization: `Bearer ${token}` } });
      window.open(asset.fileUrl, '_blank');
      toast.success('Download initialized!');
      // Refresh local download count
      setMarketingAssets(prev => prev.map(a => a._id === asset._id ? { ...a, downloadsCount: (a.downloadsCount || 0) + 1 } : a));
    } catch {
      window.open(asset.fileUrl, '_blank');
    }
  };

  const fetchDashboardData = useCallback(async () => {
    try {
      if (!token) return;
      setLoading(true);

      const [statsRes, leadRes] = await Promise.all([
        API.get('/ambassadors/dashboard', { headers: { Authorization: `Bearer ${token}` } }),
        API.get('/ambassadors/leaderboard')
      ]);

      setStats(statsRes.data.data || statsRes.data);
      setLeaderboard(leadRes.data.data || leadRes.data);
    } catch (err: any) {
      toast.error('Failed to load dashboard. Make sure your application is approved.');
      router.replace('/student/dashboard');
    } finally {
      setLoading(false);
    }
  }, [token, router]);

  const fetchPayoutHistory = useCallback(async () => {
    try {
      if (!token) return;
      const res = await API.get('/ambassadors/payouts', { headers: { Authorization: `Bearer ${token}` } });
      setPayoutsHistory(res.data.data || res.data || []);
    } catch {
      // Silent error
    }
  }, [token]);

  useEffect(() => {
    fetchDashboardData();
    fetchNotifications();
  }, [fetchDashboardData, fetchNotifications]);

  useEffect(() => {
    if (activeTab === 'overview') {
      fetchPayoutHistory();
    }
  }, [activeTab, fetchPayoutHistory]);

  useEffect(() => {
    if (activeTab === 'marketing') {
      fetchMarketingAssets();
    }
  }, [activeTab, fetchMarketingAssets]);

  const handleCopyLink = () => {
    if (!referralUrl) return;
    navigator.clipboard.writeText(referralUrl);
    toast.success('Referral link copied to clipboard!');
  };

  const handleCopyCode = () => {
    if (!stats?.profile.referralCode) return;
    navigator.clipboard.writeText(stats.profile.referralCode);
    toast.success('Referral code copied to clipboard!');
  };

  const handleRequestPayout = async (e: React.FormEvent) => {
    e.preventDefault();
    const amt = Number(withdrawAmount);
    const minPayout = stats?.metrics?.minPayout ?? 100;
    if (!amt || amt <= 0) {
      toast.error('Please enter a valid payout amount');
      return;
    }
    if (amt < minPayout) {
      toast.error(`Minimum payout request is ${formatMoney(minPayout)}`);
      return;
    }
    if (stats && amt > stats.metrics.availableBalance) {
      toast.error('Withdrawal amount cannot exceed Available Balance');
      return;
    }

    const details = withdrawMethod === 'momo' 
      ? { network: momoNetwork, phoneNumber: momoPhone }
      : { bankName, accountName: bankAccName, accountNumber: bankAccNum };

    if (withdrawMethod === 'momo' && !momoPhone.trim()) {
      toast.error('Please provide a Mobile Money phone number');
      return;
    }
    if (withdrawMethod === 'bank' && (!bankName.trim() || !bankAccName.trim() || !bankAccNum.trim())) {
      toast.error('Please complete all bank transfer fields');
      return;
    }

    try {
      setSubmittingPayout(true);
      await API.post('/ambassadors/payouts', {
        amount: amt,
        paymentMethod: withdrawMethod,
        paymentDetails: details
      }, { headers: { Authorization: `Bearer ${token}` } });

      toast.success('Payout request submitted successfully!');
      setIsPayoutModalOpen(false);
      setWithdrawAmount('');
      setMomoPhone('');
      setBankName('');
      setBankAccName('');
      setBankAccNum('');
      
      fetchDashboardData();
      fetchPayoutHistory();
    } catch (err: any) {
      toast.error(err.response?.data?.message || err.message || 'Failed to submit payout request');
    } finally {
      setSubmittingPayout(false);
    }
  };

  const getBadgeColor = (badge: string) => {
    switch (badge) {
      case 'legend': return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'diamond': return 'bg-cyan-100 text-cyan-700 border-cyan-200';
      case 'gold': return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'silver': return 'bg-slate-200 text-slate-700 border-slate-300';
      default: return 'bg-orange-100 text-orange-700 border-orange-200';
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'regional_manager': return 'Regional Manager';
      case 'campus_leader': return 'Campus Leader';
      default: return 'Campus Ambassador';
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="text-center space-y-4">
          <FaSpinner className="mx-auto animate-spin text-4xl text-blue-600" />
          <p className="text-sm font-semibold text-slate-500">Loading Ambassador Portal...</p>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 pb-20 overflow-x-hidden">
      {/* HEADER */}
      <header className="border-b border-slate-200 bg-white sticky top-0 z-10">
        <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 sm:px-6 py-3 sm:py-4">

          {/* Back button — fixed 44×44 square */}
          <Link
            href="/student/dashboard"
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200 transition"
          >
            <FaChevronLeft />
          </Link>

          {/* Title + badge — takes all remaining space, never pushes action buttons */}
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 min-w-0">
              <h1 className="truncate text-base sm:text-2xl font-black text-slate-900 leading-tight">
                Ambassador Portal
              </h1>
              {/* Badge: inline on sm+, sits on its own line on very small screens via flex-wrap */}
              {stats && (
                <span className={`shrink-0 text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full border ${getBadgeColor(stats.profile.badge)}`}>
                  {stats.profile.badge}
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 hidden sm:block truncate mt-0.5">
              {stats ? getRoleLabel(stats.profile.role) : 'Campus Partner'} • {stats?.profile.university}
            </p>
          </div>

          {/* Action buttons — Copy first (left), Notification second (right)
              ORDER MATTERS: notification is last in DOM so its dropdown (absolute right-0)
              anchors to the rightmost element and drops below it, never overlapping the copy button.
              The outer `relative` div is the sole positioning context for the dropdown;
              the button itself does NOT have `relative` to avoid nested stacking contexts. */}
          <div className="flex shrink-0 items-center gap-2">

            {/* Copy button — 44×44 on mobile, expands on lg+ */}
            <button
              onClick={handleCopyLink}
              className="flex h-11 w-11 lg:w-auto lg:px-4 items-center justify-center gap-2 rounded-xl bg-blue-600 text-sm font-bold text-white hover:bg-blue-700 transition"
              title="Copy Invite Link"
            >
              <FaCopy className="shrink-0" />
              <span className="hidden lg:inline">Copy Invite Link</span>
            </button>

            {/* Notification bell — rightmost, dropdown anchors to this element */}
            <div className="relative">
              {/* Note: no `relative` on the button itself — badge uses outer div as anchor */}
              <button
                onClick={() => setShowNotificationsDropdown(!showNotificationsDropdown)}
                className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200 transition"
                title="Notifications"
              >
                <FaBell />
              </button>

              {/* Unread badge — absolutely positioned within outer relative div */}
              {unreadCount > 0 && (
                <span className="pointer-events-none absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white ring-2 ring-white animate-pulse">
                  {unreadCount}
                </span>
              )}

              {/* Notification dropdown — anchored right-0 of the bell's relative wrapper */}
              {showNotificationsDropdown && (
                <div className="absolute right-0 top-full mt-2 w-[calc(100vw-2rem)] max-w-xs sm:w-80 rounded-2xl border border-slate-100 bg-white p-4 shadow-xl ring-1 ring-black/5 z-50 animate-in fade-in slide-in-from-top-3 duration-150">
                  <div className="flex items-center justify-between border-b border-slate-50 pb-2 mb-2">
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

                  <div className="max-h-60 overflow-y-auto space-y-2.5">
                    {notifications.length === 0 ? (
                      <p className="text-xs text-slate-400 italic text-center py-6">No notifications yet.</p>
                    ) : (
                      notifications.map((notif) => (
                        <div
                          key={notif._id}
                          onClick={() => handleMarkAsRead(notif._id)}
                          className={`p-2.5 rounded-xl border text-xs cursor-pointer transition ${
                            notif.read ? 'bg-white border-slate-100 text-slate-600' : 'bg-blue-50/40 border-blue-100 text-slate-850'
                          }`}
                        >
                          <div className="flex justify-between items-start gap-1">
                            <strong className="font-bold block truncate" title={notif.title}>{notif.title}</strong>
                            {!notif.read && <span className="h-1.5 w-1.5 rounded-full bg-blue-600 shrink-0 mt-1" />}
                          </div>
                          <p className="text-slate-500 mt-1 text-[11px] leading-relaxed">{notif.message}</p>
                          <span className="text-[9px] text-slate-400 font-semibold block mt-1.5">
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

      {/* METRICS & OVERVIEW */}
      {/* FIX 2: responsive container padding prevents overflow at 320px */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mt-8">
        
        {/* GROWTH TRACKER */}
        {/* FIX 6: p-5 md:p-8 reduces hero padding on mobile; overflow-hidden contains content */}
        <div className="mb-8 rounded-3xl bg-gradient-to-r from-blue-700 to-indigo-800 p-5 md:p-8 text-white shadow-xl overflow-hidden">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <span className="text-[10px] font-black uppercase tracking-widest bg-blue-500/30 px-3 py-1 rounded-full border border-blue-400/20">
                Active Promotion Rank
              </span>
              <h2 className="text-3xl font-black mt-3">
                {stats ? getRoleLabel(stats.profile.role) : 'Ambassador'}
              </h2>
              <p className="text-blue-100 text-sm mt-1">
                You are currently earning premium commissions from booking referrals on your campus.
              </p>
            </div>
            
            {/* FIX 6: w-full on mobile prevents box from pushing past viewport */}
            <div className="flex items-center gap-4 bg-white/10 rounded-2xl p-4 border border-white/10 backdrop-blur-sm w-full md:w-auto md:self-center shrink-0">
              <FaRoute className="text-2xl text-blue-300 shrink-0" />
              <div className="min-w-0">
                <p className="text-xs text-blue-200">Promotion Progress</p>
                <p className="text-sm font-bold mt-0.5 truncate">
                  {stats && stats.metrics.bookingsCount >= 50 ? 'Regional Manager Eligible' : `${stats?.metrics.bookingsCount || 0} / 50 Referral Bookings`}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* TABS */}
        {/* FIX 3: scrollable tabs — outer overflow-x-auto, inner w-max so tabs never shrink */}
        <div className="border-b border-slate-200 overflow-x-auto scrollbar-hide mb-8">
          <div className="flex w-max gap-6">
            {(['overview', 'bookings', 'leaderboard', 'marketing', 'support'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`pb-4 text-sm font-bold capitalize border-b-2 whitespace-nowrap transition-all ${
                  activeTab === tab 
                    ? 'border-blue-600 text-blue-600 font-extrabold' 
                    : 'border-transparent text-slate-500 hover:text-slate-900'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* TAB CONTENTS */}
        {activeTab === 'overview' && stats && (
          <div className="space-y-8 animate-fade-in">
            {/* STAT CARDS */}
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-5">
              <div className="rounded-3xl bg-white p-6 shadow-sm border border-slate-100">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600 text-xl mb-4">
                  <FaUsers />
                </div>
                <p className="text-xs font-bold uppercase text-slate-400 tracking-wider">Total Referrals</p>
                <p className="text-3xl font-black mt-1 text-slate-900">{stats.metrics.referralsCount}</p>
              </div>

              <div className="rounded-3xl bg-white p-6 shadow-sm border border-slate-100 flex flex-col justify-between">
                <div>
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 text-xl mb-4">
                    <FaMoneyBillWave />
                  </div>
                  <p className="text-xs font-bold uppercase text-slate-400 tracking-wider">Available Balance</p>
                  <p className="text-3xl font-black mt-1 text-slate-900 truncate max-w-full" title={formatMoney(stats.metrics.availableBalance)}>
                    {formatMoney(stats.metrics.availableBalance)}
                  </p>
                </div>
                <button
                  onClick={() => setIsPayoutModalOpen(true)}
                  disabled={stats.metrics.availableBalance < (stats.metrics.minPayout ?? 100) || payoutsHistory.some((p: any) => p.status === 'pending')}
                  className="mt-4 w-full rounded-xl bg-blue-600 py-2 text-xs font-bold text-white hover:bg-blue-700 disabled:bg-slate-100 disabled:text-slate-400 transition"
                >
                  {payoutsHistory.some((p: any) => p.status === 'pending') ? 'Payout Pending Review' : 'Request Payout'}
                </button>
              </div>

              <div className="rounded-3xl bg-white p-6 shadow-sm border border-slate-100">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 text-xl mb-4">
                  <FaHome />
                </div>
                <p className="text-xs font-bold uppercase text-slate-400 tracking-wider">Successful Bookings</p>
                <p className="text-3xl font-black mt-1 text-slate-900">{stats.metrics.bookingsCount}</p>
              </div>

              <div className="rounded-3xl bg-white p-6 shadow-sm border border-slate-100">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-50 text-amber-600 text-xl mb-4">
                  <FaMoneyBillWave />
                </div>
                <p className="text-xs font-bold uppercase text-slate-400 tracking-wider">Pending Earnings</p>
                <p className="text-3xl font-black mt-1 text-slate-900 truncate max-w-full" title={formatMoney(stats.metrics.pendingEarnings)}>
                  {formatMoney(stats.metrics.pendingEarnings)}
                </p>
              </div>

              <div className="rounded-3xl bg-white p-6 shadow-sm border border-slate-100">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-50 text-purple-600 text-xl mb-4">
                  <FaAward />
                </div>
                <p className="text-xs font-bold uppercase text-slate-400 tracking-wider">Paid Earnings</p>
                <p className="text-3xl font-black mt-1 text-slate-900 truncate max-w-full" title={formatMoney(stats.metrics.paidEarnings)}>
                  {formatMoney(stats.metrics.paidEarnings)}
                </p>
              </div>
            </div>

            {/* REFERRAL LINK & SHARE CENTER */}
            <div className="grid gap-6 md:grid-cols-3">
              {/* ASSETS */}
              <div className="rounded-3xl bg-white p-6 sm:p-8 shadow-sm border border-slate-100 space-y-6">
                <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                  <FaShareAlt className="text-blue-600" />
                  Your Referral Assets
                </h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">Referral Code</label>
                    <div className="flex items-center justify-between bg-slate-50 border border-slate-200 rounded-xl p-3">
                      <span className="font-mono font-bold text-sm text-slate-800">{referralCode}</span>
                      <button onClick={handleCopyCode} className="text-blue-600 hover:text-blue-800 p-1" title="Copy Code">
                        <FaCopy />
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">Referral URL</label>
                    <div className="flex items-center justify-between bg-slate-50 border border-slate-200 rounded-xl p-3 gap-2">
                      {/* FIX: min-w-0 flex-1 for responsive truncation instead of fixed max-w-[180px] */}
                      <span className="text-xs text-slate-600 truncate min-w-0 flex-1">{referralUrl}</span>
                      <button onClick={handleCopyLink} className="text-blue-600 hover:text-blue-800 p-1 shrink-0" title="Copy URL">
                        <FaCopy />
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* SHARE CENTER */}
              <div className="rounded-3xl bg-white p-6 sm:p-8 shadow-sm border border-slate-100 flex flex-col justify-between">
                <div>
                  <h3 className="text-lg font-black text-slate-900 mb-2">Share & Promote</h3>
                  <p className="text-xs text-slate-500">Quickly broadcast your referral link to your university network.</p>
                </div>
                
                <div className="grid grid-cols-2 gap-2 mt-4">
                  <a
                    href={`https://api.whatsapp.com/send?text=${encodeURIComponent("Hey! Use my link to sign up on Relaxly to book the best student hostels near campus: " + getReferralUrl(referralCode, 'whatsapp'))}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 rounded-xl bg-[#25D366] text-white py-2.5 text-xs font-bold hover:opacity-90 transition"
                  >
                    <FaWhatsapp className="text-sm" /> WhatsApp
                  </a>

                  <a
                    href={`https://t.me/share/url?url=${encodeURIComponent(getReferralUrl(referralCode, 'telegram'))}&text=${encodeURIComponent("Sign up on Relaxly to book the best student hostels near campus!")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 rounded-xl bg-[#0088cc] text-white py-2.5 text-xs font-bold hover:opacity-90 transition"
                  >
                    <FaTelegram className="text-sm" /> Telegram
                  </a>

                  <a
                    href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(getReferralUrl(referralCode, 'facebook'))}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 rounded-xl bg-[#1877F2] text-white py-2.5 text-xs font-bold hover:opacity-90 transition"
                  >
                    <FaFacebook className="text-sm" /> Facebook
                  </a>

                  <a
                    href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(getReferralUrl(referralCode, 'twitter'))}&text=${encodeURIComponent("Book the best student hostels on Relaxly using my link!")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 rounded-xl bg-[#1DA1F2] text-white py-2.5 text-xs font-bold hover:opacity-90 transition"
                  >
                    <FaTwitter className="text-sm" /> Twitter
                  </a>
                </div>

                <a
                  href={`mailto:?subject=${encodeURIComponent("Book the best student hostels on Relaxly")}&body=${encodeURIComponent("Hey, check out Relaxly to book the best student hostels! Here is my invite link: " + getReferralUrl(referralCode, 'email'))}`}
                  className="flex items-center justify-center gap-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 py-2.5 text-xs font-bold transition mt-2 w-full"
                >
                  <FaEnvelope className="text-sm" /> Share via Email
                </a>
              </div>

              {/* QR Code and Badges */}
              <div className="rounded-3xl bg-white p-6 sm:p-8 shadow-sm border border-slate-100 flex flex-col justify-between">
                <div>
                  <h3 className="text-lg font-black text-slate-900 mb-2">Instant QR Generator</h3>
                  <p className="text-xs text-slate-500">Let students scan your code to sign up directly via your link.</p>
                </div>
                
                <div className="flex items-center gap-6 mt-4">
                  <div className="bg-slate-100 border border-slate-200 rounded-2xl h-20 w-20 flex items-center justify-center shrink-0">
                    <FaQrcode className="text-3xl text-slate-400" />
                  </div>
                  
                  <div className="space-y-2">
                    <p className="text-xs font-bold text-slate-700">QR Code Link Generated</p>
                    <a 
                      href={`https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(getReferralUrl(referralCode, 'qr'))}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-xs font-bold text-blue-600 hover:underline"
                    >
                      <FaDownload /> Download QR Code
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* REFERRAL ANALYTICS & FUNNEL */}
            <div className="grid gap-6 md:grid-cols-3 mt-6">
              {/* CONVERSION FUNNEL */}
              <div className="md:col-span-2 bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-100 space-y-6">
                <div>
                  <h3 className="text-lg font-black text-slate-900">Referral Funnel Conversions</h3>
                  <p className="text-xs text-slate-500">Track user progress from click to booking.</p>
                </div>

                <div className="space-y-4">
                  {/* Step 1: Link Clicks */}
                  <div>
                    <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
                      <span>1. Link Clicks</span>
                      <span>{stats.metrics.totalClicks || 0} clicks</span>
                    </div>
                    <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                      <div className="bg-blue-600 h-full rounded-full" style={{ width: '100%' }}></div>
                    </div>
                  </div>

                  {/* Step 2: Registration Started */}
                  <div>
                    <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
                      <span>2. Registration Started</span>
                      <span>{stats.metrics.registrationStartedCount || 0} users ({stats.metrics.totalClicks && stats.metrics.totalClicks > 0 ? ((stats.metrics.registrationStartedCount || 0) / stats.metrics.totalClicks * 100).toFixed(0) : 0}%)</span>
                    </div>
                    <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                      <div className="bg-amber-500 h-full rounded-full transition-all duration-500" style={{ width: `${stats.metrics.totalClicks && stats.metrics.totalClicks > 0 ? ((stats.metrics.registrationStartedCount || 0) / stats.metrics.totalClicks * 100) : 0}%` }}></div>
                    </div>
                  </div>

                  {/* Step 3: Accounts Created */}
                  <div>
                    <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
                      <span>3. Accounts Created</span>
                      <span>{stats.metrics.referralsCount || 0} registered ({stats.metrics.totalClicks && stats.metrics.totalClicks > 0 ? ((stats.metrics.referralsCount || 0) / stats.metrics.totalClicks * 100).toFixed(0) : 0}%)</span>
                    </div>
                    <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                      <div className="bg-emerald-500 h-full rounded-full transition-all duration-500" style={{ width: `${stats.metrics.totalClicks && stats.metrics.totalClicks > 0 ? ((stats.metrics.referralsCount || 0) / stats.metrics.totalClicks * 100) : 0}%` }}></div>
                    </div>
                  </div>

                  {/* Step 4: Bookings Done */}
                  <div>
                    <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
                      <span>4. Hostel Bookings</span>
                      <span>{stats.metrics.bookingsCount || 0} bookings ({stats.metrics.totalClicks && stats.metrics.totalClicks > 0 ? ((stats.metrics.bookingsCount || 0) / stats.metrics.totalClicks * 100).toFixed(0) : 0}%)</span>
                    </div>
                    <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                      <div className="bg-indigo-600 h-full rounded-full transition-all duration-500" style={{ width: `${stats.metrics.totalClicks && stats.metrics.totalClicks > 0 ? ((stats.metrics.bookingsCount || 0) / stats.metrics.totalClicks * 100) : 0}%` }}></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* SHARING CHANNELS PERFORMANCE */}
              <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-100 flex flex-col justify-between">
                <div>
                  <h3 className="text-lg font-black text-slate-900 mb-1">Marketing Channels</h3>
                  <p className="text-xs text-slate-500">Bookings generated per share medium.</p>
                </div>

                <div className="space-y-3.5 my-4">
                  {[
                    { key: 'link', label: 'Standard Link', color: 'bg-slate-400' },
                    { key: 'qr', label: 'QR Code Scan', color: 'bg-indigo-500' },
                    { key: 'whatsapp', label: 'WhatsApp', color: 'bg-emerald-500' },
                    { key: 'telegram', label: 'Telegram', color: 'bg-sky-500' },
                    { key: 'facebook', label: 'Facebook', color: 'bg-blue-600' },
                    { key: 'twitter', label: 'X (Twitter)', color: 'bg-neutral-800' },
                    { key: 'email', label: 'Email', color: 'bg-red-500' }
                  ].map((chan) => {
                    const clickRecord = stats.metrics.sourceBreakdown?.find((s: any) => s._id === chan.key);
                    const count = clickRecord ? clickRecord.count : 0;
                    return (
                      <div key={chan.key} className="flex items-center justify-between text-xs font-semibold text-slate-700">
                        <div className="flex items-center gap-2">
                          <span className={`h-2.5 w-2.5 rounded-full ${chan.color}`}></span>
                          <span>{chan.label}</span>
                        </div>
                        <span className="font-bold text-slate-900">{count} clicks</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* DEVICE & BROWSER INSIGHTS */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-100 mt-6 grid gap-6 md:grid-cols-2">
              <div>
                <h4 className="text-sm font-black text-slate-900 mb-3 uppercase tracking-wider">Device Breakdown</h4>
                <div className="space-y-2">
                  {stats.metrics.deviceBreakdown && stats.metrics.deviceBreakdown.length > 0 ? (
                    stats.metrics.deviceBreakdown.map((d: any) => (
                      <div key={d._id} className="flex items-center justify-between text-xs font-semibold text-slate-700 border-b border-slate-50 pb-1.5">
                        <span className="capitalize">{d._id || 'Desktop'}</span>
                        <span className="font-bold text-slate-900">{d.count} clicks</span>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-slate-400 italic">No device clicks logged yet.</p>
                  )}
                </div>
              </div>

              <div>
                <h4 className="text-sm font-black text-slate-900 mb-3 uppercase tracking-wider">Top Browsers</h4>
                <div className="space-y-2">
                  {stats.metrics.browserBreakdown && stats.metrics.browserBreakdown.length > 0 ? (
                    stats.metrics.browserBreakdown.map((b: any) => (
                      <div key={b._id} className="flex items-center justify-between text-xs font-semibold text-slate-700 border-b border-slate-50 pb-1.5">
                        <span className="capitalize">{b._id || 'Chrome'}</span>
                        <span className="font-bold text-slate-900">{b.count} clicks</span>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-slate-400 italic">No browser clicks logged yet.</p>
                  )}
                </div>
              </div>
            </div>

            {/* PAYOUT HISTORY */}
            <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden mt-8">
              <div className="p-6 border-b border-slate-100 flex items-center gap-2">
                <FaHistory className="text-slate-500" />
                <h3 className="text-lg font-black text-slate-900">Payout Withdrawal History</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 text-slate-400 text-xs font-bold uppercase tracking-wider border-b border-slate-100">
                      <th className="px-6 py-4">Amount</th>
                      <th className="px-6 py-4">Method</th>
                      <th className="px-6 py-4">Request Date</th>
                      <th className="px-6 py-4">Reference</th>
                      <th className="px-6 py-4">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-sm">
                    {payoutsHistory.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="text-center py-10 text-slate-400">
                          No withdrawal requests submitted yet.
                        </td>
                      </tr>
                    ) : (
                      payoutsHistory.map((p) => (
                        <tr key={p._id} className="hover:bg-slate-50/50">
                          <td className="px-6 py-4 font-bold text-slate-800">GHS {p.amount.toFixed(2)}</td>
                          <td className="px-6 py-4 capitalize text-slate-600">{p.paymentMethod}</td>
                          <td className="px-6 py-4 text-slate-500">{new Date(p.requestedAt).toLocaleDateString()}</td>
                          <td className="px-6 py-4 font-mono text-xs text-slate-600">{p.referenceNumber || 'Pending Review'}</td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${
                              p.status === 'paid' ? 'bg-emerald-100 text-emerald-700' :
                              p.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                              p.status === 'hold' ? 'bg-orange-100 text-orange-700' :
                              'bg-red-100 text-red-700'
                            }`}>
                              {p.status === 'paid' && <FaCheckCircle />}
                              {p.status === 'pending' && <FaClock />}
                              {p.status === 'hold' && <FaClock />}
                              {p.status === 'rejected' && <FaTimesCircle />}
                              <span className="capitalize">{p.status}</span>
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'bookings' && stats && (
          <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden animate-fade-in">
            <div className="p-6 border-b border-slate-100">
              <h3 className="text-lg font-black text-slate-900">Referred Bookings Ledger</h3>
              <p className="text-xs text-slate-500 mt-1">Real-time status updates of referred bookings and payouts.</p>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-slate-400 text-xs font-bold uppercase tracking-wider border-b border-slate-100">
                    <th className="px-6 py-4">Student</th>
                    <th className="px-6 py-4">Booking Date</th>
                    <th className="px-6 py-4">Hostel</th>
                    <th className="px-6 py-4">Amount</th>
                    <th className="px-6 py-4">Commission</th>
                    <th className="px-6 py-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                  {stats.bookings.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center py-10 text-slate-400">
                        No referrals bookings made yet. Share your code to get started!
                      </td>
                    </tr>
                  ) : (
                    stats.bookings.map((b) => (
                      <tr key={b._id} className="hover:bg-slate-50/50">
                        <td className="px-6 py-4 font-bold text-slate-800">{b.referredStudent?.name}</td>
                        <td className="px-6 py-4 text-slate-500">{new Date(b.createdAt).toLocaleDateString()}</td>
                        <td className="px-6 py-4 text-slate-600">{b.hostel?.name}</td>
                        <td className="px-6 py-4 font-bold text-slate-700">{formatMoney(b.bookingAmount)}</td>
                        <td className="px-6 py-4 font-bold text-emerald-600">{formatMoney(b.commissionAmount)}</td>
                        <td className="px-6 py-4">
                          <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                            b.status === 'paid' ? 'bg-emerald-100 text-emerald-700' :
                            b.status === 'pending' ? 'bg-orange-100 text-orange-700' :
                            b.status === 'approved' ? 'bg-blue-100 text-blue-700' :
                            'bg-red-100 text-red-700'
                          }`}>
                            {b.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'leaderboard' && (
          <div className="grid gap-8 md:grid-cols-3 animate-fade-in">
            {/* LEADERBOARD LIST */}
            <div className="md:col-span-2 bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
              <div className="p-6 border-b border-slate-100">
                <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                  <FaTrophy className="text-amber-500" />
                  Campus Leaderboard
                </h3>
                <p className="text-xs text-slate-500 mt-1">Top performers across Relaxly Ghana network.</p>
              </div>

              <div className="divide-y divide-slate-100">
                {leaderboard.length === 0 ? (
                  <div className="text-center py-10 text-slate-400">Loading performers...</div>
                ) : (
                  leaderboard.map((item) => (
                    <div key={item.rank} className="flex items-center justify-between p-4 sm:p-6 hover:bg-slate-50 transition-colors gap-3">
                      <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                        <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-black border ${
                          item.rank === 1 ? 'bg-amber-100 text-amber-700 border-amber-200' :
                          item.rank === 2 ? 'bg-slate-100 text-slate-600 border-slate-200' :
                          item.rank === 3 ? 'bg-orange-100 text-orange-700 border-orange-200' :
                          'bg-slate-50 text-slate-400 border-slate-100'
                        }`}>
                          {item.rank}
                        </span>
                        
                        <div className="min-w-0">
                          <p className="font-bold text-slate-900 truncate">{item.name}</p>
                          <p className="text-xs text-slate-500 truncate">{item.university}</p>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <p className="font-black text-slate-900 text-sm">Score: {item.score || 0}</p>
                        <p className="text-[10px] text-slate-500 font-bold whitespace-nowrap">
                          {item.bookingsCount} bookings • {item.referralsCount} signups
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* BADGES BREAKDOWN */}
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 space-y-6 self-start">
              <div>
                <h3 className="text-lg font-black text-slate-900">Rank Badges</h3>
                <p className="text-xs text-slate-500 mt-1">Unlock tiers as referrals complete bookings.</p>
              </div>

              <div className="space-y-4">
                {[
                  { name: 'Bronze', limit: '0+ bookings', badge: 'bronze' },
                  { name: 'Silver', limit: '3+ bookings', badge: 'silver' },
                  { name: 'Gold', limit: '10+ bookings', badge: 'gold' },
                  { name: 'Diamond', limit: '25+ bookings', badge: 'diamond' },
                  { name: 'Legend', limit: '50+ bookings', badge: 'legend' }
                ].map((tier) => (
                  <div key={tier.name} className="flex items-center justify-between border-b border-slate-50 pb-3 last:border-0 last:pb-0">
                    <span className={`text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border ${getBadgeColor(tier.badge)}`}>
                      {tier.name}
                    </span>
                    <span className="text-xs font-bold text-slate-500">{tier.limit}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'marketing' && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-100 space-y-8 animate-fade-in">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h3 className="text-lg font-black text-slate-900">Ambassador Brand Center</h3>
                <p className="text-xs text-slate-500 mt-1">Professional promo graphics & posters tailored for your campus channels.</p>
              </div>

              {/* Category chips
                  Root cause: outer scrollable div had no explicit width, so on mobile inside
                  a flex-col parent it collapsed to content width causing overflow past card edge.
                  Fix: w-full on the scroll wrapper gives it a defined boundary to scroll within.
              */}
              <div className="w-full overflow-x-auto scrollbar-hide py-1">
                <div className="flex w-max gap-1.5 bg-slate-50 p-1.5 rounded-xl border border-slate-100">
                  {[
                    { id: 'all', name: 'All' },
                    { id: 'social_media', name: 'Social Media' },
                    { id: 'printable', name: 'Printable' },
                    { id: 'videos', name: 'Videos' },
                    { id: 'brand', name: 'Brand' },
                    { id: 'training', name: 'Training' }
                  ].map(cat => (
                    <button
                      key={cat.id}
                      onClick={() => setSelectedCategory(cat.id)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                        selectedCategory === cat.id
                          ? 'bg-blue-600 text-white shadow-sm'
                          : 'text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      {cat.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Asset cards: 1-col mobile, 2-col sm, 3-col lg */}
            <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
              {marketingAssets.filter(asset => selectedCategory === 'all' || asset.category === selectedCategory).length === 0 ? (
                <div className="col-span-full rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 py-12 text-center text-slate-400">
                  <FaFolderOpen className="mx-auto h-12 w-12 text-slate-300 mb-3" />
                  <p className="font-bold">No assets found</p>
                  <p className="text-xs text-slate-400 mt-1">There are no assets available in this category for your campus yet.</p>
                </div>
              ) : (
                marketingAssets
                  .filter(asset => selectedCategory === 'all' || asset.category === selectedCategory)
                  .map((asset) => (
                    <div key={asset._id} className="rounded-2xl border border-slate-100 bg-slate-50/50 p-4 sm:p-5 hover:border-blue-200 transition-colors flex flex-col justify-between">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-[9px] font-black uppercase tracking-wider bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">
                            {asset.category.replace('_', ' ')}
                          </span>
                          <span className="text-[9px] font-bold text-slate-400">
                            {(asset.fileSize / (1024 * 1024)).toFixed(1)} MB
                          </span>
                        </div>
                        
                        <div>
                          <h4 className="font-bold text-slate-800 text-base line-clamp-1">{asset.title}</h4>
                          <p className="text-xs text-slate-500 mt-1 line-clamp-2 min-h-[32px]">{asset.description || 'No description provided.'}</p>
                        </div>
                      </div>
                      
                      {/* Buttons: equal-width flex row, never overflow */}
                      <div className="flex gap-2 mt-5">
                        <button 
                          onClick={() => handlePreviewAsset(asset)}
                          className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors"
                        >
                          <FaEye className="text-slate-400 shrink-0" /> Preview
                        </button>
                        <button 
                          onClick={() => handleDownloadAsset(asset)}
                          className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-blue-600 py-2.5 text-xs font-bold text-white hover:bg-blue-700 transition-colors"
                        >
                          <FaDownload className="shrink-0" /> Download
                        </button>
                      </div>
                    </div>
                  ))
              )}
            </div>
          </div>
        )}

        {activeTab === 'support' && (
          <div className="grid gap-6 md:grid-cols-2 animate-fade-in">
            <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-100 space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-black text-slate-900">Contact Support</h3>
                  <p className="text-xs text-slate-500 mt-1">Get in touch to resolve dashboard or payout inquiries.</p>
                </div>
                <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                  supportSettings.isOnline ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-500'
                }`}>
                  <span className={`h-1.5 w-1.5 rounded-full ${supportSettings.isOnline ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`}></span>
                  {supportSettings.isOnline ? 'Online' : 'Offline'}
                </span>
              </div>

              <div className="space-y-4">
                {(supportSettings.whatsappObj?.enabled !== false) && (
                  <a
                    href={`https://wa.me/${(supportSettings.whatsappObj?.number || supportSettings.whatsapp).replace(/\D/g, '')}?text=${encodeURIComponent(supportSettings.whatsappObj?.defaultMessage || 'Hello Relaxly Support, I need assistance with my booking.')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-4 rounded-2xl bg-emerald-50 border border-emerald-100 p-4 text-emerald-900 hover:bg-emerald-100 transition-colors"
                  >
                    <FaWhatsapp className="text-2xl text-emerald-600" />
                    <div>
                      <p className="font-bold text-sm">
                        {supportSettings.whatsappObj?.displayName || 'WhatsApp Support'}
                      </p>
                      <p className="text-xs text-emerald-600">
                        {supportSettings.whatsappObj?.number || supportSettings.whatsapp}
                      </p>
                    </div>
                  </a>
                )}

                {(supportSettings.emailObj?.enabled !== false) && (
                  <a
                    href={`mailto:${supportSettings.emailObj?.address || supportSettings.email}`}
                    className="flex items-center gap-4 rounded-2xl bg-blue-50 border border-blue-100 p-4 text-blue-900 hover:bg-blue-100 transition-colors"
                  >
                    <FaEnvelope className="text-2xl text-blue-600" />
                    <div>
                      <p className="font-bold text-sm">
                        {supportSettings.emailObj?.displayName || 'Email Support'}
                      </p>
                      <p className="text-xs text-blue-600">
                        {supportSettings.emailObj?.responseTime || 'Within 2 hours'}
                      </p>
                    </div>
                  </a>
                )}
              </div>
            </div>

            <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-100 space-y-6">
              <div>
                <h3 className="text-lg font-black text-slate-900">Quick FAQs</h3>
                <p className="text-xs text-slate-500 mt-1">Answers to common ambassador questions.</p>
              </div>

              <div className="space-y-4">
                {[
                  { q: 'How are my payouts processed?', a: 'Payouts are approved weekly and sent directly to your MOMO or bank account configured in your Profile.' },
                  { q: 'When is commission marked as approved?', a: 'Once the referred student makes the initial booking checkout payment, commission enters your pending balance.' },
                  { q: 'How do override commissions work?', a: 'As a Campus Leader, you earn overrides from referrals submitted by junior ambassadors inside your campus team.' }
                ].map((faq, idx) => (
                  <div key={idx} className="space-y-1">
                    <p className="text-sm font-bold text-slate-800">{faq.q}</p>
                    <p className="text-xs text-slate-500 leading-relaxed">{faq.a}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* WITHDRAW PAYOUT MODAL */}
      {isPayoutModalOpen && stats && (
        // FIX: bottom-sheet on mobile (items-end + rounded-t-3xl), centered modal on sm+
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 p-0 sm:p-4 backdrop-blur-sm">
          <div className="bg-white rounded-t-3xl sm:rounded-3xl p-6 w-full sm:max-w-md shadow-2xl relative max-h-[95vh] overflow-y-auto">
            <h3 className="text-xl font-black text-slate-900 mb-2">Request Payout</h3>
            <p className="text-xs text-slate-500 mb-6">
              Minimum payout is <span className="font-bold">{formatMoney(stats.metrics.minPayout ?? 100)}</span>. Your Available Balance is <span className="font-bold text-blue-600">{formatMoney(stats.metrics.availableBalance)}</span>.
            </p>

            <form onSubmit={handleRequestPayout} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Withdrawal Amount (GHS) *</label>
                <input
                  type="number"
                  min={stats.metrics.minPayout ?? 100}
                  max={stats.metrics.availableBalance}
                  step="0.01"
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                  className="w-full border border-slate-200 p-3 rounded-xl focus:outline-none focus:border-blue-500 text-sm font-semibold text-slate-800"
                  placeholder={`Minimum ${(stats.metrics.minPayout ?? 100).toFixed(2)}`}
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Payment Channel *</label>
                <div className="grid grid-cols-2 gap-3 mt-1">
                  <button
                    type="button"
                    onClick={() => setWithdrawMethod('momo')}
                    className={`py-2.5 rounded-xl border text-xs font-bold transition-all ${
                      withdrawMethod === 'momo' 
                        ? 'border-blue-600 bg-blue-50 text-blue-600' 
                        : 'border-slate-200 text-slate-500'
                    }`}
                  >
                    Mobile Money
                  </button>
                  <button
                    type="button"
                    onClick={() => setWithdrawMethod('bank')}
                    className={`py-2.5 rounded-xl border text-xs font-bold transition-all ${
                      withdrawMethod === 'bank' 
                        ? 'border-blue-600 bg-blue-50 text-blue-600' 
                        : 'border-slate-200 text-slate-500'
                    }`}
                  >
                    Bank Account
                  </button>
                </div>
              </div>

              {withdrawMethod === 'momo' ? (
                <div className="space-y-3 bg-slate-50 border border-slate-200 rounded-2xl p-4 mt-2">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-600">Mobile Network</label>
                    <select
                      value={momoNetwork}
                      onChange={(e) => setMomoNetwork(e.target.value)}
                      className="w-full border border-slate-200 bg-white p-2.5 rounded-xl focus:outline-none focus:border-blue-500 text-xs text-slate-800 font-semibold"
                    >
                      <option value="MTN">MTN Mobile Money</option>
                      <option value="TELECEL">Telecel Cash</option>
                      <option value="AIRTELTIGO">AirtelTigo Cash</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-600">Mobile Money Phone Number</label>
                    <input
                      type="tel"
                      value={momoPhone}
                      onChange={(e) => setMomoPhone(e.target.value)}
                      placeholder="e.g. 0541234567"
                      className="w-full border border-slate-200 bg-white p-2.5 rounded-xl focus:outline-none focus:border-blue-500 text-xs text-slate-800 font-semibold"
                      required
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-3 bg-slate-50 border border-slate-200 rounded-2xl p-4 mt-2">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-600">Bank Name</label>
                    <input
                      type="text"
                      value={bankName}
                      onChange={(e) => setBankName(e.target.value)}
                      placeholder="e.g. Ecobank, GCB"
                      className="w-full border border-slate-200 bg-white p-2.5 rounded-xl focus:outline-none text-xs text-slate-800 font-semibold"
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-600">Account Name</label>
                    <input
                      type="text"
                      value={bankAccName}
                      onChange={(e) => setBankAccName(e.target.value)}
                      placeholder="e.g. John Doe"
                      className="w-full border border-slate-200 bg-white p-2.5 rounded-xl focus:outline-none text-xs text-slate-800 font-semibold"
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-600">Account Number</label>
                    <input
                      type="text"
                      value={bankAccNum}
                      onChange={(e) => setBankAccNum(e.target.value)}
                      placeholder="e.g. 1441002948712"
                      className="w-full border border-slate-200 bg-white p-2.5 rounded-xl focus:outline-none text-xs text-slate-800 font-semibold"
                      required
                    />
                  </div>
                </div>
              )}

              <div className="flex gap-3 mt-6 border-t border-slate-100 pt-4">
                <button
                  type="button"
                  onClick={() => setIsPayoutModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-500 hover:bg-slate-50 transition"
                  disabled={submittingPayout}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 transition flex items-center justify-center gap-2"
                  disabled={submittingPayout}
                >
                  {submittingPayout ? (
                    <>
                      <FaSpinner className="animate-spin" /> Submitting...
                    </>
                  ) : (
                    'Submit Request'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* STUDENT PREVIEW MODAL */}
      {previewAsset && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="relative w-full max-w-2xl rounded-3xl bg-white p-5 sm:p-6 shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 duration-150 max-h-[95vh] overflow-y-auto">
            <button 
              onClick={() => setPreviewAsset(null)}
              className="absolute right-4 top-4 text-slate-400 hover:text-slate-600 p-1.5 rounded-full hover:bg-slate-100 transition z-10 bg-white/85"
            >
              <FaTimesCircle className="h-5 w-5" />
            </button>

            <h3 className="text-lg font-bold text-slate-800 mb-1">
              Preview: {previewAsset.title}
            </h3>
            <p className="text-xs text-slate-400 mb-4 capitalize font-semibold">
              Category: {previewAsset.category.replace('_', ' ')} • Format: {previewAsset.fileType}
            </p>

            <div className="flex justify-center items-center bg-slate-50 rounded-2xl p-4 min-h-[300px] overflow-hidden">
              {previewAsset.fileType?.startsWith('image/') ? (
                <img 
                  src={previewAsset.fileUrl} 
                  alt={previewAsset.title} 
                  className="max-h-[60vh] object-contain rounded-xl shadow-sm"
                />
              ) : previewAsset.fileType?.startsWith('video/') ? (
                <video 
                  src={previewAsset.fileUrl} 
                  controls 
                  className="max-h-[60vh] w-full rounded-xl"
                />
              ) : (
                <div className="text-center p-6 space-y-4">
                  <FaFolderOpen className="mx-auto h-16 w-16 text-slate-300" />
                  <div>
                    <p className="text-sm font-bold text-slate-700">Document/Asset Preview Unavailable</p>
                    <p className="text-xs text-slate-400 mt-1">This format cannot be displayed directly in-app.</p>
                  </div>
                  <a
                    href={previewAsset.fileUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-block bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-4 py-2 rounded-xl transition"
                  >
                    Open in New Tab
                  </a>
                </div>
              )}
            </div>

            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 pt-4 border-t border-slate-100 mt-4">
              <span className="text-xs text-slate-400 font-bold">
                Size: {(previewAsset.fileSize / (1024 * 1024)).toFixed(1)} MB
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => setPreviewAsset(null)}
                  className="flex-1 sm:flex-none border border-slate-200 text-slate-600 hover:bg-slate-50 px-4 py-2 rounded-xl text-xs font-bold transition"
                >
                  Close Preview
                </button>
                <button
                  onClick={() => {
                    handleDownloadAsset(previewAsset);
                    setPreviewAsset(null);
                  }}
                  className="flex-1 sm:flex-none bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5"
                >
                  <FaDownload className="shrink-0" />
                  <span>Download Now</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
