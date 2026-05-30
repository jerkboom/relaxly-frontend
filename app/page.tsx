/**
 * ==================================================
 * Relaxly Frontend
 * File: app/page.tsx
 *
 * Purpose:
 * Primary landing page and discovery hub for the Relaxly platform.
 * Provides students with high-level search and featured hostel previews.
 *
 * Target User:
 * - Unauthenticated visitors (Browsing)
 * - Students (Starting their search)
 *
 * Major Features:
 * - Hero Section with brand value proposition.
 * - Global Search (By name, university, or budget).
 * - Featured Hostels: Real-time discovery of top-rated properties.
 * - University Directory: Quick access to hostels by campus.
 * - Platform Features: Explanation of secure payments and verification.
 *
 * API Dependencies:
 * - getHostels(): Fetches popular listings.
 * - getUniversities(): Retrieves supported campuses.
 *
 * ==================================================
 */

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  FaCheckCircle,
  FaPhone,
  FaMapMarkerAlt,
  FaShieldAlt,
  FaWifi,
} from 'react-icons/fa';
import HostelCard from '../src/components/home/HostelCard';
import UniversityCard from '../src/components/home/UniversityCard';
import { Hostel, University } from '../src/types';
import { getHostels } from '../src/services/hostelService';
import { getUniversities } from '../src/services/universityService';
import { useAuthStore } from '../src/store/authStore';
import { useSettingsStore } from '../src/store/settingsStore';

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

export default function HomePage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { supportSettings } = useSettingsStore();

  const [hostels, setHostels] = useState<Hostel[]>([]);
  const [universities, setUniversities] = useState<University[]>([]);
  const [loading, setLoading] = useState(true);

  /** Search input states for the landing page widget. */
  const [searchQuery, setSearchQuery] = useState('');
  const [universityQuery, setUniversityQuery] = useState('');
  const [budgetQuery, setBudgetQuery] = useState('');

  /**
   * Data Lifecycle:
   * Fetches initial discovery data for the landing page.
   * Handles multi-version API response structures.
   */
  useEffect(() => {
    const fetchData = async () => {
      try {
        const hostelsData = await getHostels();
        const universityData = await getUniversities();

        // Standardize hostel list extraction
        const hostelsList = Array.isArray(hostelsData) 
          ? hostelsData 
          : (hostelsData?.hostels || (hostelsData as any)?.data || []);

        setHostels(Array.isArray(hostelsList) ? hostelsList : []);
        setUniversities(universityData.universities || universityData || []);
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

  return (
    <main className="min-h-screen bg-white text-gray-900 overflow-x-hidden">
      {/* NAVBAR */}
      <header className="sticky top-0 z-50 border-b bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6 py-4">
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
          </div>
        </div>
      </header>

      {/* HERO SECTION - Landing impact and quick discovery */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 text-white">
        <div className="absolute inset-0 bg-black/20" />

        <div className="relative mx-auto grid max-w-7xl gap-10 lg:gap-16 px-4 sm:px-6 py-12 sm:py-24 md:grid-cols-2 md:items-center">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <p className="mb-4 inline-block rounded-full bg-white/20 px-4 py-2 text-xs sm:text-sm font-medium backdrop-blur">
              #1 Hostel Booking Platform For Students
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
              className="h-64 sm:h-[400px] md:h-[550px] w-full rounded-3xl object-cover shadow-2xl"
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
      </section>

      {/* SEARCH WIDGET - Higher prominence for discovery */}
      <section className="relative z-20 mx-auto -mt-8 sm:-mt-12 max-w-6xl px-4 sm:px-6">
        <div className="rounded-3xl bg-white p-4 sm:p-6 shadow-2xl border border-slate-100">
          <div className="grid gap-3 sm:gap-5 md:grid-cols-4">
            <input
              type="text"
              placeholder="Search hostel"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="rounded-2xl border px-5 py-3 sm:py-4 outline-none focus:border-blue-500 transition-colors"
            />

            <input
              type="text"
              placeholder="University"
              value={universityQuery}
              onChange={(e) => setUniversityQuery(e.target.value)}
              className="rounded-2xl border px-5 py-3 sm:py-4 outline-none focus:border-blue-500 transition-colors"
            />

            <input
              type="text"
              placeholder="Budget"
              value={budgetQuery}
              onChange={(e) => setBudgetQuery(e.target.value)}
              className="rounded-2xl border px-5 py-3 sm:py-4 outline-none focus:border-blue-500 transition-colors"
            />

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
          ) : hostels.length === 0 ? (
            <div className="rounded-3xl bg-white p-8 sm:p-12 text-center shadow">
              <h3 className="mb-3 text-xl sm:text-2xl font-bold">
                No hostels available
              </h3>

              <p className="text-gray-500">
                Hostels will appear here once added.
              </p>
            </div>
          ) : (
            <div className="grid gap-6 sm:gap-8 md:grid-cols-2 lg:grid-cols-3">
              {(Array.isArray(hostels) ? hostels : [])
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

      {/* UNIVERSITIES DIRECTORY */}
      <section
        id="universities"
        className="mx-auto max-w-7xl px-4 sm:px-6 py-16 sm:py-24"
      >
        <div className="mb-10 sm:mb-16 text-center">
          <p className="mb-2 sm:mb-3 font-semibold text-blue-600 text-sm sm:text-base">
            UNIVERSITIES
          </p>

          <h2 className="text-2xl sm:text-3xl md:text-4xl font-black">
            Supported Universities
          </h2>
        </div>

        {loading ? (
          <div className="grid gap-6 sm:gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4].map((item) => (
              <div
                key={item}
                className="h-[180px] sm:h-[220px] animate-pulse rounded-3xl bg-gray-200"
              />
            ))}
          </div>
        ) : universities.length === 0 ? (
          <div className="rounded-3xl bg-white p-8 sm:p-12 text-center shadow">
            <h3 className="mb-3 text-xl sm:text-2xl font-bold">
              No universities available
            </h3>
          </div>
        ) : (
          <div className="grid gap-6 sm:gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
            {universities.map(
              (university) => (
                <Link key={university._id} href={`/hostels?university=${university.name}`}>
                  <UniversityCard
                    university={university}
                  />
                </Link>
              )
            )}
          </div>
        )}
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
