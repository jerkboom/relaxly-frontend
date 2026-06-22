/**
 * ==================================================
 * Relaxly Frontend
 * File: app/HomePageClient.tsx
 *
 * Purpose:
 * Client-side logic for the landing page.
 * ==================================================
 */

'use client';

import { useEffect, useState, useMemo, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FaCheckCircle,
  FaPhone,
  FaMapMarkerAlt,
  FaShieldAlt,
  FaWifi,
  FaSearch,
  FaChevronDown,
  FaThLarge,
  FaCalendarCheck,
  FaHeart,
  FaCog,
  FaSignOutAlt,
  FaHome,
  FaHistory
} from 'react-icons/fa';
import { useAuthStore } from '../src/store/authStore';
import HostelCard from '../src/components/home/HostelCard';
import UniversityCard from '../src/components/home/UniversityCard';
import { Hostel, University } from '../src/types';
import { getHostels } from '../src/services/hostelService';
import { getUniversities } from '../src/services/universityService';
import { getPublicStats } from '../src/services/settingsService';
import { useSettingsStore } from '../src/store/settingsStore';
import { generateSlug } from '../src/utils/seoUtils';

/** Static branding and trust features. */
const features = [
  {
    title: 'Secure Payments',
    icon: FaShieldAlt,
    description: 'Pay securely with Paystack and Mobile Money.',
  },
  {
    title: 'Direct Owner Contact',
    icon: FaPhone,
    description: 'Contact hostel owners directly via call or WhatsApp.',
  },
  {
    title: 'Verified Hostels',
    icon: FaCheckCircle,
    description: 'Only trusted and verified hostels are listed.',
  },
  {
    title: 'Modern Amenities',
    icon: FaWifi,
    description: 'WiFi, security, water, electricity and more.',
  },
];

interface HostelsResponse {
  hostels?: Hostel[];
  data?: {
    hostels?: Hostel[];
  } | Hostel[];
}

interface PlatformStats {
  universities: number;
  hostels: number;
  students: number;
}

export default function HomePageClient() {
  const router = useRouter();
  const { supportSettings } = useSettingsStore();

  const { user, token, hasHydrated, logout } = useAuthStore();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const isLoggedIn = !!(hasHydrated && user && token);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getDisplayName = () => {
    if (!user) return '';
    if (user.role === 'owner') return user.name;
    return user.name.split(' ')[0];
  };

  const getInitials = (name: string) => {
    if (!name) return '?';
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return parts[0][0].toUpperCase();
  };

  const [hostels, setHostels] = useState<Hostel[]>([]);
  const [universities, setUniversities] = useState<University[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<PlatformStats | null>(null);

  /** Sticky Header Logic: Track scroll for shadow effect */
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  /** Search input states for the landing page widget. */
  const [searchQuery, setSearchQuery] = useState('');
  const [universityQuery, setUniversityQuery] = useState('');
  const [budgetQuery, setBudgetQuery] = useState('');

  /** 
   * Reactive Filtering: 
   * Filters the fetched hostels locally for instant feedback on the landing page.
   */
  const filteredHostels = useMemo(() => {
    if (!hostels) return [];
    
    return hostels.filter(hostel => {
      const matchesSearch = !searchQuery.trim() || 
        hostel.name.toLowerCase().includes(searchQuery.toLowerCase());
      
      const hostelUni = typeof hostel.university === 'object' ? hostel.university?.name : '';
      const matchesUniversity = !universityQuery.trim() || 
        (hostelUni && hostelUni.toLowerCase().includes(universityQuery.toLowerCase()));

      return matchesSearch && matchesUniversity;
    });
  }, [hostels, searchQuery, universityQuery]);

  /**
   * Data Lifecycle:
   * Fetches initial discovery data for the landing page.
   */
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [hostelsData, universityData, statsData] = await Promise.all([
          getHostels() as unknown as HostelsResponse,
          getUniversities(),
          getPublicStats().catch(() => null) // Fail silently and fallback to null
        ]);

        // Standardize hostel list extraction
        let hostelsList: Hostel[] = [];
        if (Array.isArray(hostelsData)) {
          hostelsList = hostelsData;
        } else if (hostelsData?.hostels) {
          hostelsList = hostelsData.hostels;
        } else if (hostelsData?.data) {
          if (Array.isArray(hostelsData.data)) {
            hostelsList = hostelsData.data;
          } else if (hostelsData.data.hostels) {
            hostelsList = hostelsData.data.hostels;
          }
        }

        setHostels(hostelsList);
        setUniversities(universityData.universities || universityData || []);
        if (statsData) setStats(statsData);
      } catch (error) {
        console.error('Homepage data fetch error:', error);
        setHostels([]);
        setUniversities([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  /** Navigates to the discovery page with applied query parameters. */
  const handleSearch = () => {
    const params = new URLSearchParams();
    if (searchQuery.trim()) params.append('search', searchQuery.trim());
    if (universityQuery.trim())
      params.append('university', universityQuery.trim());
    if (budgetQuery.trim()) params.append('budget', budgetQuery.trim());

    router.push(`/hostels?${params.toString()}`);
  };

  /** Formats large numbers for display (e.g. 1500 -> 1.5k) */
  const formatStat = (num: number | undefined) => {
    if (num === undefined || num === null) return '--';
    if (num < 1000) return num.toString();
    return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'k';
  };


  return (
    <main className="min-h-screen bg-white text-gray-900 overflow-x-hidden">
      {/* NAVBAR */}
      <header className={`fixed top-0 left-0 right-0 z-[1000] border-b bg-white/90 backdrop-blur transition-all duration-300 ${
        isScrolled ? 'py-3 shadow-lg shadow-slate-200/50' : 'py-4 sm:py-5 shadow-none'
      }`}>
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6">
          <Link href="/" className="flex items-center gap-2 text-xl sm:text-2xl font-bold text-blue-600">
            <img src="/logo.svg" alt="Relaxly Logo" className="h-8 w-8" />
            <span>Relaxly</span>
          </Link>

          <nav className="hidden items-center gap-4 lg:gap-8 md:flex">
            <a href="#features" className="transition hover:text-blue-600">
              Features
            </a>
            <a href="#hostels" className="transition hover:text-blue-600">
              Hostels
            </a>
            <a href="#universities" className="transition hover:text-blue-600">
              Universities
            </a>
          </nav>

          <div className="flex items-center gap-2 sm:gap-3">
            {isLoggedIn && user ? (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex items-center gap-2 rounded-xl p-1.5 hover:bg-slate-50 transition-colors outline-none cursor-pointer"
                >
                  {/* User Avatar */}
                  {/* @ts-ignore */}
                  {user.avatar || user.profilePhoto || user.profilePicture ? (
                    <img
                      /* @ts-ignore */
                      src={user.avatar || user.profilePhoto || user.profilePicture}
                      /* @ts-ignore */
                      alt={user.name}
                      className="h-9 w-9 rounded-full object-cover ring-2 ring-blue-100"
                    />
                  ) : (
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-600 font-bold text-white shadow-sm ring-2 ring-blue-100">
                      {getInitials(user.name)}
                    </div>
                  )}

                  {/* Display Name and Chevron */}
                  <span className="hidden sm:inline text-sm font-semibold text-slate-700">
                    {getDisplayName()}
                  </span>
                  <FaChevronDown className={`text-xs text-slate-500 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* Dropdown Menu */}
                <AnimatePresence>
                  {isDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      transition={{ duration: 0.15, ease: 'easeOut' }}
                      className="absolute right-0 mt-2 w-64 origin-top-right rounded-2xl bg-white p-2.5 shadow-2xl border border-slate-100 ring-1 ring-black/5 z-[1010]"
                    >
                      {/* User Info Header */}
                      <div className="px-3 py-3 border-b border-slate-50 mb-2">
                        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                          Signed in as
                        </p>
                        <p className="text-sm font-bold text-slate-900 truncate">
                          {user.name}
                        </p>
                        <p className="text-xs text-slate-500 truncate">
                          {user.email}
                        </p>
                        <span className={`inline-block mt-2 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          user.role === 'owner' ? 'bg-amber-55 text-amber-700 border border-amber-100' : 
                          user.role === 'admin' ? 'bg-rose-50 text-rose-600 border border-rose-100' : 
                          'bg-blue-50 text-blue-600 border border-blue-100'
                        }`}>
                          {user.role === 'owner' ? 'Hostel Owner' : user.role === 'admin' ? 'Administrator' : 'Student'}
                        </span>
                      </div>

                      {/* Dropdown Items based on role */}
                      <div className="space-y-0.5">
                        {user.role === 'student' && (
                          <>
                            <Link
                              href="/student/dashboard"
                              onClick={() => setIsDropdownOpen(false)}
                              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-50 hover:text-blue-600 transition"
                            >
                              <FaThLarge className="text-slate-400" />
                              <span>View Dashboard</span>
                            </Link>
                            <Link
                              href="/student/bookings"
                              onClick={() => setIsDropdownOpen(false)}
                              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-50 hover:text-blue-600 transition"
                            >
                              <FaCalendarCheck className="text-slate-400" />
                              <span>My Bookings</span>
                            </Link>
                            <Link
                              href="/saved-hostels"
                              onClick={() => setIsDropdownOpen(false)}
                              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-50 hover:text-blue-600 transition"
                            >
                              <FaHeart className="text-slate-400" />
                              <span>Saved Hostels</span>
                            </Link>
                            <Link
                              href="/profile"
                              onClick={() => setIsDropdownOpen(false)}
                              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-50 hover:text-blue-600 transition"
                            >
                              <FaCog className="text-slate-400" />
                              <span>Profile Settings</span>
                            </Link>
                          </>
                        )}

                        {user.role === 'owner' && (
                          <>
                            <Link
                              href="/owner/dashboard"
                              onClick={() => setIsDropdownOpen(false)}
                              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-50 hover:text-blue-600 transition"
                            >
                              <FaThLarge className="text-slate-400" />
                              <span>Owner Dashboard</span>
                            </Link>
                            <Link
                              href="/owner/hostels"
                              onClick={() => setIsDropdownOpen(false)}
                              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-50 hover:text-blue-600 transition"
                            >
                              <FaHome className="text-slate-400" />
                              <span>My Hostels</span>
                            </Link>
                            <Link
                              href="/owner/bookings"
                              onClick={() => setIsDropdownOpen(false)}
                              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-50 hover:text-blue-600 transition"
                            >
                              <FaCalendarCheck className="text-slate-400" />
                              <span>Bookings</span>
                            </Link>
                            <Link
                              href="/owner/payout-history"
                              onClick={() => setIsDropdownOpen(false)}
                              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-50 hover:text-blue-600 transition"
                            >
                              <FaHistory className="text-slate-400" />
                              <span>Payouts</span>
                            </Link>
                            <Link
                              href="/owner/profile"
                              onClick={() => setIsDropdownOpen(false)}
                              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-50 hover:text-blue-600 transition"
                            >
                              <FaCog className="text-slate-400" />
                              <span>Settings</span>
                            </Link>
                          </>
                        )}

                        {user.role === 'admin' && (
                          <Link
                            href="/admin/dashboard"
                            onClick={() => setIsDropdownOpen(false)}
                            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-50 hover:text-blue-600 transition"
                          >
                            <FaThLarge className="text-slate-400" />
                            <span>Admin Dashboard</span>
                          </Link>
                        )}

                        <div className="border-t border-slate-50 my-1 pt-1" />

                        <button
                          onClick={() => {
                            setIsDropdownOpen(false);
                            logout();
                            router.push('/');
                          }}
                          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-red-600 hover:bg-red-50 transition cursor-pointer"
                        >
                          <FaSignOutAlt className="text-red-400" />
                          <span>Logout</span>
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <>
                <Link
                  href="/login"
                  className="rounded-xl border px-3 sm:px-5 py-2 text-sm sm:text-base font-medium transition hover:bg-gray-100"
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  className="rounded-xl bg-blue-600 px-3 sm:px-5 py-2 text-sm sm:text-base font-medium text-white transition hover:bg-blue-700"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* HERO SECTION - Landing impact and quick discovery */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 text-white pt-[72px] sm:pt-[88px] lg:pb-32">
        <div className="absolute inset-0 bg-black/20" />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 py-12 lg:py-0 flex flex-col">
          
          {/* DESKTOP SEARCH WIDGET - Precision Spacing & Proportions */}
          <div className="hidden lg:block mt-8 mb-12">
            <div className="rounded-3xl bg-white p-5 shadow-2xl border border-slate-100">
              <div className="grid grid-cols-4 gap-4">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search hostel"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full h-14 rounded-2xl border px-5 outline-none focus:border-blue-500 transition-colors font-semibold text-slate-900"
                  />
                </div>

                <div className="relative">
                  <input
                    type="text"
                    placeholder="University"
                    value={universityQuery}
                    onChange={(e) => setUniversityQuery(e.target.value)}
                    className="w-full h-14 rounded-2xl border px-6 outline-none focus:border-blue-500 transition-colors font-semibold text-slate-900"
                  />
                </div>

                <div className="relative">
                  <input
                    type="text"
                    placeholder="Budget"
                    value={budgetQuery}
                    onChange={(e) => setBudgetQuery(e.target.value)}
                    className="w-full h-14 rounded-2xl border px-6 outline-none focus:border-blue-500 transition-colors font-semibold text-slate-900"
                  />
                </div>

                <button
                  onClick={handleSearch}
                  className="w-full h-14 rounded-2xl bg-blue-600 px-6 font-semibold text-white hover:bg-blue-700 transition shadow-lg shadow-blue-200"
                >
                  Search
                </button>
              </div>
            </div>
          </div>

          <div className="grid gap-10 lg:gap-16 lg:py-12 md:grid-cols-2 md:items-center">
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <p className="mb-4 inline-block rounded-full bg-white/20 px-4 py-2 text-xs sm:text-sm font-medium backdrop-blur">
                {isLoggedIn ? `Welcome back, ${getDisplayName()} 👋` : '#1 Hostel Booking Platform For Students'}
              </p>

              <h1 className="mb-6 text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black leading-tight">
                Find The Perfect Hostel Near Your University
              </h1>

              <p className="mb-8 max-w-xl text-base sm:text-lg text-blue-100">
                Search, compare, book, and pay for verified student hostels across
                Ghana.
              </p>

              <div className="flex flex-wrap gap-4">
                <Link
                  href="/hostels"
                  className="w-full sm:w-auto text-center rounded-2xl bg-white px-7 py-4 font-semibold text-blue-700 transition hover:scale-105"
                >
                  Explore Hostels
                </Link>

                <Link
                  href="/register"
                  className="w-full sm:w-auto text-center rounded-2xl border border-white/40 px-7 py-4 font-semibold transition hover:bg-white/10"
                >
                  Create Account
                </Link>
              </div>
            </motion.div>

            {/* Branded Building Image with Location Badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="relative"
            >
              <img
                src="/images/relaxly-building.png"
                alt="Relaxly Hostel Building"
                className="h-64 sm:h-[400px] md:h-[500px] lg:h-[550px] w-full rounded-3xl object-cover shadow-2xl"
              />

              <div className="absolute -bottom-4 sm:-bottom-6 left-4 sm:left-6 rounded-2xl bg-white p-3 sm:p-5 text-gray-900 shadow-2xl">
                <div className="flex items-center gap-3">
                  <FaMapMarkerAlt className="text-blue-600 shrink-0" />
                  <div>
                    <p className="font-bold text-sm sm:text-base">University of Ghana</p>
                    <p className="text-xs sm:text-sm text-gray-500">
                      Nearby hostels available
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* MOBILE SEARCH WIDGET - Positioned below Hero */}
      <section className="relative z-20 mx-auto -mt-10 sm:-mt-12 lg:hidden max-w-6xl px-4 sm:px-6">
        <div className="rounded-3xl bg-white p-4 sm:p-6 shadow-2xl border border-slate-100">
          <div className="grid gap-3 sm:gap-5 md:grid-cols-2">
            <div className="relative">
              <input
                type="text"
                placeholder="Search hostel"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-2xl border px-5 py-3 sm:py-4 outline-none focus:border-blue-500 transition-colors font-medium text-slate-900"
              />
            </div>

            <div className="relative">
              <input
                type="text"
                placeholder="University"
                value={universityQuery}
                onChange={(e) => setUniversityQuery(e.target.value)}
                className="w-full rounded-2xl border px-5 py-3 sm:py-4 outline-none focus:border-blue-500 transition-colors font-medium text-slate-900"
              />
            </div>

            <div className="relative">
              <input
                type="text"
                placeholder="Budget"
                value={budgetQuery}
                onChange={(e) => setBudgetQuery(e.target.value)}
                className="w-full rounded-2xl border px-5 py-3 sm:py-4 outline-none focus:border-blue-500 transition-colors font-medium text-slate-900"
              />
            </div>

            <button
              onClick={handleSearch}
              className="rounded-2xl bg-blue-600 px-5 py-3 sm:py-4 font-semibold text-white hover:bg-blue-700 transition shadow-lg shadow-blue-200"
            >
              Search
            </button>
          </div>
        </div>
      </section>

      {/* FEATURED HOSTELS - Displayed as a responsive grid */}
      <section
        id="hostels"
        className="bg-gray-50 py-16 sm:py-24"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="mb-10 sm:mb-16 flex items-end justify-between gap-4">
            <div>
              <p className="mb-2 sm:mb-3 font-semibold text-blue-600 text-sm sm:text-base">
                FEATURED HOSTELS
              </p>

              <h2 className="text-2xl sm:text-3xl md:text-4xl font-black">
                Popular Hostels
              </h2>
            </div>

            <Link
              href="/hostels"
              className="font-semibold text-blue-600 whitespace-nowrap hover:underline"
            >
              View All
            </Link>
          </div>

          {loading ? (
            <div className="grid gap-6 sm:gap-8 md:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3].map((item) => (
                <div
                  key={item}
                  className="h-[350px] sm:h-[420px] animate-pulse rounded-3xl bg-gray-200"
                />
              ))}
            </div>
          ) : filteredHostels.length === 0 ? (
            <div className="rounded-[3rem] bg-white p-12 sm:p-24 text-center shadow-sm border border-slate-100 flex flex-col items-center">
              <div className="mb-8 flex h-24 w-24 items-center justify-center rounded-full bg-slate-50 text-4xl text-slate-200">
                <FaSearch />
              </div>
              <h3 className="mb-3 text-2xl sm:text-3xl font-black text-slate-900">
                No hostels found
              </h3>
              <p className="text-slate-500 font-medium max-w-md mx-auto">
                We couldn't find any hostels matching "{searchQuery}" at {universityQuery || 'your university'}. Try a different search term.
              </p>
            </div>
          ) : (
            <div className="grid gap-6 sm:gap-8 md:grid-cols-2 lg:grid-cols-3">
              {filteredHostels
                .slice(0, 6)
                .map((hostel) => (
                  <HostelCard
                    key={hostel._id}
                    hostel={hostel}
                  />
                ))}
            </div>
          )}
        </div>
      </section>

      {/* PLATFORM STATISTICS / SOCIAL PROOF */}
      <section className="bg-blue-50 py-12 sm:py-16 border-y border-blue-100/50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 text-center divide-y sm:divide-y-0 sm:divide-x divide-blue-200/50">
            <div className="flex flex-col items-center justify-center p-4">
              {loading ? (
                <div className="h-10 w-24 sm:h-12 sm:w-28 animate-pulse rounded-xl bg-blue-200/50 mb-2" />
              ) : (
                <span className="text-4xl sm:text-5xl font-black text-blue-600 mb-2">{formatStat(stats?.universities)}</span>
              )}
              <span className="text-sm sm:text-base font-bold text-slate-600 uppercase tracking-widest">Supported Universities</span>
            </div>
            <div className="flex flex-col items-center justify-center p-4">
              {loading ? (
                <div className="h-10 w-24 sm:h-12 sm:w-28 animate-pulse rounded-xl bg-blue-200/50 mb-2" />
              ) : (
                <span className="text-4xl sm:text-5xl font-black text-blue-600 mb-2">{formatStat(stats?.hostels)}</span>
              )}
              <span className="text-sm sm:text-base font-bold text-slate-600 uppercase tracking-widest">Verified Hostels</span>
            </div>
            <div className="flex flex-col items-center justify-center p-4">
              {loading ? (
                <div className="h-10 w-24 sm:h-12 sm:w-28 animate-pulse rounded-xl bg-blue-200/50 mb-2" />
              ) : (
                <span className="text-4xl sm:text-5xl font-black text-blue-600 mb-2">{formatStat(stats?.students)}</span>
              )}
              <span className="text-sm sm:text-base font-bold text-slate-600 uppercase tracking-widest">Students Hosted</span>
            </div>
          </div>
        </div>
      </section>

      {/* TRUST FEATURES - Value proposition cards */}
      <section
        id="features"
        className="bg-gray-50 py-16 sm:py-24"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="mb-10 sm:mb-16 text-center">
            <p className="mb-2 sm:mb-3 font-semibold text-blue-600 text-sm sm:text-base">
              WHY CHOOSE US
            </p>

            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black">
              Everything Students Need
            </h2>
          </div>

          <div className="grid gap-6 sm:gap-8 md:grid-cols-2 lg:grid-cols-4">
            {features.map((feature) => {
              const Icon = feature.icon;

              return (
                <motion.div
                  whileHover={{
                    y: -8,
                  }}
                  key={feature.title}
                  className="rounded-3xl border bg-white p-6 sm:p-8 shadow-sm transition"
                >
                  <div className="mb-6 flex h-12 sm:h-16 w-12 sm:w-16 items-center justify-center rounded-2xl bg-blue-100 text-xl sm:text-2xl text-blue-600">
                    <Icon />
                  </div>

                  <h3 className="mb-3 text-lg sm:text-xl font-bold">
                    {feature.title}
                  </h3>

                  <p className="text-sm sm:text-base leading-7 text-gray-600">
                    {feature.description}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CALL TO ACTION */}
      <section className="bg-blue-600 py-16 sm:py-24 text-white">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 text-center">
          <h2 className="mb-6 text-3xl sm:text-4xl md:text-5xl font-black leading-tight">
            Ready To Find Your Perfect Hostel?
          </h2>

          <p className="mx-auto mb-10 max-w-2xl text-base sm:text-lg text-blue-100">
            Join thousands of students already using Relaxly to find safe, affordable and verified accommodation.
          </p>

          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link
              href="/register"
              className="w-full sm:w-auto rounded-2xl bg-white px-8 py-4 font-bold text-blue-700 transition hover:scale-105 shadow-xl"
            >
              Get Started
            </Link>

            <Link
              href="/hostels"
              className="w-full sm:w-auto rounded-2xl border border-white/40 px-8 py-4 font-bold transition hover:bg-white/10"
            >
              Browse Hostels
            </Link>
          </div>
        </div>
      </section>

      {/* FOOTER - Branded contact and platform info */}
      <footer className="bg-gray-950 py-10 sm:py-14 text-gray-400">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 sm:px-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-4">
          <div>
            <h3 className="mb-4 text-xl sm:text-2xl font-black text-white flex items-center gap-2">
              <img src="/logo.svg" alt="Relaxly Logo" className="h-8 w-8 brightness-0 invert" />
              <span>Relaxly</span>
            </h3>

            <p className="text-sm sm:text-base leading-7">
              Modern hostel booking platform for students across Ghana.
            </p>
          </div>

          <div>
            <h4 className="mb-4 font-bold text-white">
              Platform
            </h4>

            <div className="space-y-3 text-sm sm:text-base">
              <Link href="/hostels" className="hover:text-white transition block">Hostels</Link>
              <p>Universities</p>
              <p>Payments</p>
            </div>
          </div>

          <div>
            <h4 className="mb-4 font-bold text-white">
              Company
            </h4>

            <div className="space-y-3 text-sm sm:text-base">
              <p>About</p>
              <p>Contact</p>
              <p>Support</p>
              <Link href="/privacy-policy" className="hover:text-white transition block">Privacy Policy</Link>
              <Link href="/terms-and-conditions" className="hover:text-white transition block">Terms & Conditions</Link>
              <Link href="/refund-policy" className="hover:text-white transition block">Refund Policy</Link>
            </div>
          </div>

          <div>
            <h4 className="mb-4 font-bold text-white">
              Contact
            </h4>

            <div className="space-y-3 text-sm sm:text-base">
              <p>Accra, Ghana</p>
              <p>{supportSettings.email}</p>
              <p>{supportSettings.phone}</p>
            </div>
          </div>
        </div>

        <div className="mt-10 sm:mt-14 border-t border-white/10 pt-8 text-center text-xs sm:text-sm">
          © 2026 Relaxly. All rights reserved.
        </div>
      </footer>
    </main>
  );
}
