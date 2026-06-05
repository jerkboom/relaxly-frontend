/**
 * ==================================================
 * Relaxly Frontend
 * File: app/hostels/HostelsPageClient.tsx
 * ==================================================
 */

'use client';

import {
  Suspense,
  useEffect,
  useState,
  useCallback,
  useMemo,
  useRef,
} from 'react';

import {
  useSearchParams,
} from 'next/navigation';

import Link from 'next/link';

import {
  FaSearch,
  FaFilter,
  FaTimes,
  FaArrowLeft,
  FaCheck,
  FaShieldAlt,
  FaUndo,
} from 'react-icons/fa';

import {
  getHostels,
} from '../../src/services/hostelService';

import {
  getUniversities,
} from '../../src/services/universityService';

import HostelCard from '../../src/components/home/HostelCard';

import {
  motion,
  AnimatePresence,
} from 'framer-motion';

import {
  useAuthStore,
} from '../../src/store/authStore';

import {
  Hostel,
  University,
  HostelFilterParams,
  HostelSortOption,
} from '../../src/types';

import { getDashboardRoute } from '../../src/utils/navigationUtils';

const AMENITIES_OPTIONS = [
  'WiFi', 'Air Conditioning', 'Study Area', 'Security', 'Private Washroom', 'Kitchen', 'Parking', 'Generator'
];

const ROOM_TYPES_OPTIONS = [
  { id: '1-in-1', label: 'Single' },
  { id: '2-in-1', label: 'Double' },
  { id: '3-in-1', label: 'Triple' },
  { id: '4-in-1', label: 'Quad' },
  { id: '5-in-1', label: '5 Sharing' },
  { id: '6-in-1', label: '6 Sharing' },
  { id: '7-in-1', label: '7 Sharing' },
  { id: '8-in-1', label: '8 Sharing' },
];

const SORT_OPTIONS: { id: HostelSortOption; label: string }[] = [
  { id: 'newest', label: 'Newest First' },
  { id: 'price_low', label: 'Lowest Price' },
  { id: 'price_high', label: 'Highest Price' },
  { id: 'popular', label: 'Most Popular' },
  { id: 'rated', label: 'Top Rated' },
];

function HostelsPageContent() {
  const searchParams = useSearchParams();
  const { user, hasHydrated } = useAuthStore();
  const isFirstRender = useRef(true);

  // Data States
  const [hostels, setHostels] = useState<Hostel[]>([]);
  const [universities, setUniversities] = useState<University[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  // Filter States
  const initialSearch = useMemo(() => searchParams.get('search') || '', [searchParams]);
  const [search, setSearch] = useState(initialSearch);
  const [debouncedSearch, setDebouncedSearch] = useState(initialSearch);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  
  const [filters, setFilters] = useState<HostelFilterParams>(() => {
    const qUni = searchParams.get('university');
    const qBudget = searchParams.get('budget');
    return {
      page: 1,
      limit: 12,
      sort: 'newest',
      amenities: [],
      roomTypes: [],
      university: qUni || undefined,
      maxPrice: qBudget ? Number(qBudget) : undefined,
    };
  });

  // Fetch Universities
  useEffect(() => {
    getUniversities().then(data => {
      setUniversities(data?.data || data || []);
    }).catch(err => console.error('Failed to fetch universities', err));
  }, []);

  // Sync with URL params on changes after initial mount
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    const qSearch = searchParams.get('search') || '';
    const qUni = searchParams.get('university');
    const qBudget = searchParams.get('budget');

    setSearch(qSearch);
    setDebouncedSearch(qSearch);

    setFilters(prev => ({
      ...prev,
      university: qUni || prev.university,
      maxPrice: qBudget ? Number(qBudget) : prev.maxPrice,
    }));
  }, [searchParams]);

  // Search Debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setFilters(prev => ({ ...prev, page: 1 }));
    }, 500);
    return () => clearTimeout(timer);
  }, [search]);

  // Fetch Hostels
  const fetchHostelsData = useCallback(async () => {
    if (!hasHydrated) return;
    
    try {
      setLoading(true);
      const params: HostelFilterParams = {
        ...filters,
        location: debouncedSearch || undefined,
      };
      
      const response = await getHostels(params);
      
      if (response) {
        setHostels(response.hostels || []);
        setTotal(response.total || 0);
        setTotalPages(response.totalPages || 1);
      }
    } catch (error) {
      console.error('Failed to fetch hostels', error);
    } finally {
      setLoading(false);
    }
  }, [filters, debouncedSearch, hasHydrated]);

  useEffect(() => {
    const triggerFetch = async () => {
      await fetchHostelsData();
    };
    triggerFetch();
  }, [fetchHostelsData]);

  // Handlers
  const toggleAmenity = (amenity: string) => {
    setFilters(prev => ({
      ...prev,
      page: 1,
      amenities: prev.amenities?.includes(amenity)
        ? prev.amenities.filter(a => a !== amenity)
        : [...(prev.amenities || []), amenity]
    }));
  };

  const toggleRoomType = (type: string) => {
    setFilters(prev => ({
      ...prev,
      page: 1,
      roomTypes: prev.roomTypes?.includes(type)
        ? prev.roomTypes.filter(t => t !== type)
        : [...(prev.roomTypes || []), type]
    }));
  };

  const resetFilters = () => {
    setFilters({
      page: 1,
      limit: 12,
      sort: 'newest',
      amenities: [],
      roomTypes: [],
    });
    setSearch('');
    setDebouncedSearch('');
  };

  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (filters.university) count++;
    if (filters.minPrice || filters.maxPrice) count++;
    if (filters.amenities?.length) count += filters.amenities.length;
    if (filters.roomTypes?.length) count += filters.roomTypes.length;
    return count;
  }, [filters]);

  return (
    <main className="min-h-screen bg-slate-50">
      {/* HEADER & SEARCH BAR */}
      <div className="sticky top-0 z-30 bg-white/80 backdrop-blur-xl border-b border-slate-100">
        <div className="mx-auto max-w-7xl px-4 py-4 md:px-6 lg:px-8">
          <div className="flex items-center gap-4">
            <Link href={getDashboardRoute(user?.role)} className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-600 transition hover:bg-slate-200">
              <FaArrowLeft />
            </Link>
            
            <div className="relative flex-1 group">
              <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name, location or university..."
                className="w-full rounded-2xl bg-slate-100 py-3 pl-12 pr-4 font-medium outline-none ring-2 ring-transparent transition-all focus:bg-white focus:ring-blue-500/20 shadow-sm"
              />
            </div>

            <button 
              onClick={() => setShowMobileFilters(true)}
              className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-slate-900 text-white shadow-lg lg:hidden"
            >
              <FaFilter />
              {activeFiltersCount > 0 && (
                <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-blue-500 text-[10px] font-black">
                  {activeFiltersCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8 md:px-6 lg:px-8">
        <div className="flex gap-10">
          
          {/* SIDEBAR FILTERS (Desktop) */}
          <aside className="hidden w-72 shrink-0 lg:block space-y-8">
            <div className="rounded-3xl bg-white p-8 shadow-sm border border-slate-100">
              <div className="mb-8 flex items-center justify-between">
                <h2 className="text-xl font-black text-slate-900">Filters</h2>
                {activeFiltersCount > 0 && (
                  <button onClick={resetFilters} className="text-xs font-black text-blue-600 uppercase tracking-widest hover:text-blue-700 flex items-center gap-1">
                    <FaUndo className="text-[10px]" /> Reset
                  </button>
                )}
              </div>

              {/* Sorting */}
              <div className="mb-8">
                <p className="mb-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Sort Results</p>
                <div className="space-y-2">
                  {SORT_OPTIONS.map((opt) => (
                    <button
                      key={opt.id}
                      onClick={() => setFilters(prev => ({ ...prev, sort: opt.id, page: 1 }))}
                      className={`flex w-full items-center justify-between rounded-xl px-4 py-2.5 text-sm font-bold transition-all ${
                        filters.sort === opt.id 
                          ? 'bg-blue-600 text-white shadow-md shadow-blue-200' 
                          : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      {opt.label}
                      {filters.sort === opt.id && <FaCheck className="text-[10px]" />}
                    </button>
                  ))}
                </div>
              </div>

              {/* University */}
              <div className="mb-8">
                <p className="mb-4 text-[10px] font-black uppercase tracking-widest text-slate-400">University</p>
                <select 
                  value={filters.university || ''}
                  onChange={(e) => setFilters(prev => ({ ...prev, university: e.target.value || undefined, page: 1 }))}
                  className="w-full rounded-xl bg-slate-50 p-3 text-sm font-bold text-slate-900 outline-none ring-2 ring-transparent transition focus:ring-blue-500/20"
                >
                  <option value="">All Universities</option>
                  {universities.map(uni => (
                    <option key={uni._id} value={uni.name}>{uni.name}</option>
                  ))}
                </select>
              </div>

              {/* Price Range */}
              <div className="mb-8">
                <p className="mb-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Budget Range (GHS)</p>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    placeholder="Min"
                    value={filters.minPrice || ''}
                    onChange={(e) => setFilters(prev => ({ ...prev, minPrice: e.target.value ? Number(e.target.value) : undefined, page: 1 }))}
                    className="w-full rounded-xl bg-slate-50 p-3 text-sm font-bold outline-none focus:bg-white focus:ring-2 focus:ring-blue-500/20"
                  />
                  <span className="text-slate-300">-</span>
                  <input
                    type="number"
                    placeholder="Max"
                    value={filters.maxPrice || ''}
                    onChange={(e) => setFilters(prev => ({ ...prev, maxPrice: e.target.value ? Number(e.target.value) : undefined, page: 1 }))}
                    className="w-full rounded-xl bg-slate-50 p-3 text-sm font-bold outline-none focus:bg-white focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
              </div>

              {/* Amenities */}
              <div className="mb-8">
                <p className="mb-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Amenities</p>
                <div className="flex flex-wrap gap-2">
                  {AMENITIES_OPTIONS.map(amenity => (
                    <button
                      key={amenity}
                      onClick={() => toggleAmenity(amenity)}
                      className={`rounded-full px-4 py-1.5 text-[11px] font-black uppercase tracking-tight transition-all ${
                        filters.amenities?.includes(amenity)
                          ? 'bg-blue-600 text-white shadow-md'
                          : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                      }`}
                    >
                      {amenity}
                    </button>
                  ))}
                </div>
              </div>

              {/* Room Types */}
              <div>
                <p className="mb-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Room Capacity</p>
                <div className="grid grid-cols-2 gap-2">
                  {ROOM_TYPES_OPTIONS.map(opt => (
                    <button
                      key={opt.id}
                      onClick={() => toggleRoomType(opt.id)}
                      className={`flex items-center justify-center rounded-xl p-2.5 text-xs font-black transition-all ${
                        filters.roomTypes?.includes(opt.id)
                          ? 'bg-slate-900 text-white'
                          : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Support Card */}
            <div className="rounded-3xl bg-blue-600 p-8 text-white shadow-2xl shadow-blue-200">
              <FaShieldAlt className="mb-4 text-3xl" />
              <h3 className="mb-2 text-lg font-black leading-tight">Need Help?</h3>
              <p className="mb-6 text-xs font-bold text-blue-100">Our team can help you find and verify any hostel on the platform.</p>
              <button className="w-full rounded-xl bg-white py-3 text-sm font-black text-blue-600 transition hover:bg-blue-50">
                Contact Support
              </button>
            </div>
          </aside>

          {/* RESULTS AREA */}
          <div className="flex-1">
            <div className="mb-8 flex items-end justify-between">
              <div>
                <h1 className="text-3xl font-black text-slate-900 md:text-4xl lg:text-5xl">Explore Hostels</h1>
                <p className="mt-2 text-sm font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                  <span className="text-blue-600">{total}</span> listings found 
                  {debouncedSearch && <span className="text-slate-300">| Result for &quot;{debouncedSearch}&quot;</span>}
                </p>
              </div>
              
              <div className="hidden lg:flex items-center gap-3 rounded-2xl bg-white p-1.5 shadow-sm border border-slate-100">
                <button className="flex h-10 items-center justify-center rounded-xl bg-slate-900 px-4 text-xs font-black text-white">Grid</button>
                <button className="flex h-10 items-center justify-center rounded-xl px-4 text-xs font-black text-slate-400 hover:bg-slate-50 transition">Map</button>
              </div>
            </div>

            {loading ? (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3">
                {[1, 2, 3, 4, 5, 6].map(i => (
                  <div key={i} className="h-[400px] animate-pulse rounded-[2.5rem] bg-slate-200" />
                ))}
              </div>
            ) : hostels.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-[3rem] bg-white py-20 px-8 text-center shadow-sm border border-slate-100">
                <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-slate-50 text-4xl text-slate-200">
                  <FaSearch />
                </div>
                <h3 className="text-2xl font-black text-slate-900">No Hostels Found</h3>
                <p className="mt-2 max-w-sm text-lg font-medium text-slate-500 leading-relaxed">
                  We couldn&apos;t find any listings matching your current filters. Try resetting or adjusting them.
                </p>
                <button onClick={resetFilters} className="mt-8 rounded-2xl bg-blue-600 px-8 py-4 font-black text-white shadow-xl shadow-blue-200 transition hover:scale-105">
                  Clear All Filters
                </button>
              </div>
            ) : (
              <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3">
                {hostels.map(hostel => (
                  <HostelCard key={hostel._id} hostel={hostel} />
                ))}
              </div>
            )}

            {/* PAGINATION */}
            {!loading && totalPages > 1 && (
              <div className="mt-16 flex items-center justify-center gap-4">
                <button 
                  disabled={filters.page === 1}
                  onClick={() => setFilters(prev => ({ ...prev, page: (prev.page || 1) - 1 }))}
                  className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white font-black text-slate-600 shadow-sm transition hover:bg-blue-600 hover:text-white disabled:opacity-30"
                >
                  &larr;
                </button>
                <div className="flex items-center gap-2">
                  {[...Array(totalPages)].map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setFilters(prev => ({ ...prev, page: i + 1 }))}
                      className={`h-12 w-12 rounded-xl text-sm font-black transition-all ${
                        filters.page === i + 1 
                          ? 'bg-slate-900 text-white shadow-lg' 
                          : 'bg-white text-slate-400 hover:bg-slate-50'
                      }`}
                    >
                      {i + 1}
                    </button>
                  ))}
                </div>
                <button 
                  disabled={filters.page === totalPages}
                  onClick={() => setFilters(prev => ({ ...prev, page: (prev.page || 1) + 1 }))}
                  className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white font-black text-slate-600 shadow-sm transition hover:bg-blue-600 hover:text-white disabled:opacity-30"
                >
                  &rarr;
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* MOBILE FILTERS DRAWER */}
      <AnimatePresence>
        {showMobileFilters && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowMobileFilters(false)}
              className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-sm lg:hidden"
            />
            <motion.div 
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed inset-x-0 bottom-0 z-50 h-[90vh] overflow-y-auto rounded-t-[3rem] bg-white p-8 lg:hidden"
            >
              <div className="mb-8 flex items-center justify-between">
                <h2 className="text-2xl font-black text-slate-900">Filters</h2>
                <button onClick={() => setShowMobileFilters(false)} className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-600">
                  <FaTimes />
                </button>
              </div>

              {/* Sorting (Mobile) */}
              <div className="mb-10">
                <p className="mb-4 text-xs font-black uppercase tracking-widest text-slate-400">Sort By</p>
                <div className="grid grid-cols-2 gap-3">
                  {SORT_OPTIONS.map((opt) => (
                    <button
                      key={opt.id}
                      onClick={() => setFilters(prev => ({ ...prev, sort: opt.id, page: 1 }))}
                      className={`rounded-2xl px-4 py-4 text-xs font-black transition-all ${
                        filters.sort === opt.id 
                          ? 'bg-blue-600 text-white shadow-xl shadow-blue-200' 
                          : 'bg-slate-50 text-slate-600'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Price Range (Mobile) */}
              <div className="mb-10">
                <p className="mb-4 text-xs font-black uppercase tracking-widest text-slate-400">Monthly Budget (GHS)</p>
                <div className="flex items-center gap-4">
                  <input
                    type="number"
                    placeholder="Min"
                    value={filters.minPrice || ''}
                    onChange={(e) => setFilters(prev => ({ ...prev, minPrice: e.target.value ? Number(e.target.value) : undefined, page: 1 }))}
                    className="w-full rounded-2xl bg-slate-100 p-4 font-black outline-none"
                  />
                  <input
                    type="number"
                    placeholder="Max"
                    value={filters.maxPrice || ''}
                    onChange={(e) => setFilters(prev => ({ ...prev, maxPrice: e.target.value ? Number(e.target.value) : undefined, page: 1 }))}
                    className="w-full rounded-2xl bg-slate-100 p-4 font-black outline-none"
                  />
                </div>
              </div>

              {/* Amenities (Mobile) */}
              <div className="mb-10">
                <p className="mb-4 text-xs font-black uppercase tracking-widest text-slate-400">Amenities</p>
                <div className="flex flex-wrap gap-3">
                  {AMENITIES_OPTIONS.map(amenity => (
                    <button
                      key={amenity}
                      onClick={() => toggleAmenity(amenity)}
                      className={`rounded-full px-6 py-3 text-xs font-black uppercase tracking-tight transition-all ${
                        filters.amenities?.includes(amenity)
                          ? 'bg-slate-900 text-white shadow-xl'
                          : 'bg-slate-100 text-slate-500'
                      }`}
                    >
                      {amenity}
                    </button>
                  ))}
                </div>
              </div>

              {/* Submit Button */}
              <button 
                onClick={() => setShowMobileFilters(false)}
                className="w-full rounded-[2rem] bg-blue-600 py-6 text-lg font-black text-white shadow-2xl shadow-blue-200 transition active:scale-95"
              >
                Show {total} Hostels
              </button>
              <button 
                onClick={() => { resetFilters(); setShowMobileFilters(false); }}
                className="mt-4 w-full py-4 text-sm font-black text-slate-400 uppercase tracking-widest"
              >
                Reset All
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </main>
  );
}

export default function HostelsPageClient() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
      </div>
    }>
      <HostelsPageContent />
    </Suspense>
  );
}
