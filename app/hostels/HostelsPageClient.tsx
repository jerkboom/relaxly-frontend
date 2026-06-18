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
  useMemo,
  useRef,
} from 'react';

import {
  keepPreviousData,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';

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
  getActiveUniversities
} from '../../src/services/hostelService';

import { getUniversities } from '../../src/services/universityService';

import { normalizeUniversity } from '../../src/constants/universities';

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
  HostelFilterParams,
  HostelSortOption,
} from '../../src/types';

import { getDashboardRoute } from '../../src/utils/navigationUtils';
import { AMENITIES, getAmenityById } from '../../src/constants/amenities';
import { useWishlistStore } from '../../src/store/wishlistStore';
import { useHistoryStore } from '../../src/store/historyStore';
import { FaHeart } from 'react-icons/fa';
import { queryKeys } from '../../src/lib/queryKeys';

const ROOM_TYPES_OPTIONS = [
  { id: 'Single', label: 'Single' },
  { id: 'Double', label: 'Double' },
  { id: 'Triple', label: 'Triple' },
  { id: 'Quad', label: 'Quad' },
  { id: '5 Sharing', label: '5 Sharing' },
  { id: '6 Sharing', label: '6 Sharing' },
  { id: '7 Sharing', label: '7 Sharing' },
  { id: '8 Sharing', label: '8 Sharing' },
];

const SORT_OPTIONS: { id: HostelSortOption; label: string }[] = [
  { id: 'newest', label: 'Newest First' },
  { id: 'price_low', label: 'Lowest Price' },
  { id: 'price_high', label: 'Highest Price' },
  { id: 'popular', label: 'Most Popular' },
  { id: 'rated', label: 'Top Rated' },
];

type ActiveUniversityCount = {
  _id: string;
  count: number;
};

function HostelsPageContent() {
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const { user, hasHydrated } = useAuthStore();
  const { wishlistIds } = useWishlistStore();
  const { recentHostels } = useHistoryStore();
  const isFirstRender = useRef(true);

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

  const selectedAmenities = useMemo(
    () => Array.isArray(filters.amenities) ? filters.amenities : [],
    [filters.amenities]
  );

  const selectedRoomTypes = useMemo(
    () => Array.isArray(filters.roomTypes) ? filters.roomTypes : [],
    [filters.roomTypes]
  );

  const normalizedUniversity = useMemo(
    () => normalizeUniversity(filters.university || ''),
    [filters.university]
  );

  const hostelQueryKeyParams = useMemo(() => ({
    search: debouncedSearch || '',
    university: normalizedUniversity || '',
    amenities: [...selectedAmenities].sort().join(','),
    roomCapacity: [...selectedRoomTypes].sort().join(','),
    sort: filters.sort || 'newest',
    page: filters.page || 1,
    minPrice: filters.minPrice,
    maxPrice: filters.maxPrice,
    limit: filters.limit || 12,
  }), [
    debouncedSearch,
    normalizedUniversity,
    selectedAmenities,
    selectedRoomTypes,
    filters.sort,
    filters.page,
    filters.minPrice,
    filters.maxPrice,
    filters.limit,
  ]);

  const hostelQueryParams = useMemo<HostelFilterParams>(() => ({
    ...filters,
    university: normalizedUniversity || undefined,
    location: debouncedSearch || undefined,
    amenities: selectedAmenities.length ? selectedAmenities.join(',') : undefined,
    roomCapacity: selectedRoomTypes.length ? selectedRoomTypes.join(',') : undefined,
  }), [filters, normalizedUniversity, debouncedSearch, selectedAmenities, selectedRoomTypes]);

  const firstPageHostelParams = useMemo<HostelFilterParams>(() => ({
    page: 1,
    limit: 12,
    sort: 'newest',
  }), []);

  const hostelQuery = useQuery({
    queryKey: queryKeys.hostels.list(hostelQueryKeyParams),
    queryFn: () => getHostels(hostelQueryParams),
    enabled: hasHydrated,
    placeholderData: keepPreviousData,
  });

  const activeUniversitiesQuery = useQuery({
    queryKey: queryKeys.hostels.activeUniversities(),
    queryFn: getActiveUniversities,
  });

  useQuery({
    queryKey: queryKeys.universities.lists(),
    queryFn: getUniversities,
    enabled: hasHydrated,
  });

  useEffect(() => {
    if (!hasHydrated) return;

    queryClient.prefetchQuery({
      queryKey: queryKeys.hostels.list({
        search: '',
        university: '',
        amenities: '',
        roomCapacity: '',
        sort: 'newest',
        page: 1,
        limit: 12,
      }),
      queryFn: () => getHostels(firstPageHostelParams),
    });

    queryClient.prefetchQuery({
      queryKey: queryKeys.universities.lists(),
      queryFn: getUniversities,
    });

    queryClient.prefetchQuery({
      queryKey: queryKeys.hostels.activeUniversities(),
      queryFn: getActiveUniversities,
    });
  }, [hasHydrated, queryClient, firstPageHostelParams]);

  const hostels = (hostelQuery.data?.hostels || []) as Hostel[];
  const total = hostelQuery.data?.total || 0;
  const totalPages = hostelQuery.data?.totalPages || 1;
  const loading = hostelQuery.isLoading;
  const activeUniversities = (activeUniversitiesQuery.data || []) as ActiveUniversityCount[];

  // Handlers
  const toggleAmenity = (amenityId: string) => {
    setFilters(prev => {
      const current = Array.isArray(prev.amenities) ? prev.amenities : [];
      return {
        ...prev,
        page: 1,
        amenities: current.includes(amenityId)
          ? current.filter(a => a !== amenityId)
          : [...current, amenityId]
      };
    });
  };

  const toggleRoomType = (type: string) => {
    setFilters(prev => {
      const current = Array.isArray(prev.roomTypes) ? prev.roomTypes : [];
      return {
        ...prev,
        page: 1,
        roomTypes: current.includes(type)
          ? current.filter(t => t !== type)
          : [...current, type]
      };
    });
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
    const amenities = Array.isArray(filters.amenities) ? filters.amenities : [];
    const rooms = Array.isArray(filters.roomTypes) ? filters.roomTypes : [];
    count += amenities.length;
    count += rooms.length;
    return count;
  }, [filters]);

  const removeFilter = (type: string, value?: string) => {
    setFilters(prev => {
      const newState = { ...prev, page: 1 };
      if (type === 'university') { delete newState.university; }
      if (type === 'budget') { delete newState.minPrice; delete newState.maxPrice; }
      
      if (type === 'amenity' && value) { 
        const current = Array.isArray(prev.amenities) ? prev.amenities : [];
        newState.amenities = current.filter(a => a !== value); 
      }
      if (type === 'room' && value) { 
        const current = Array.isArray(prev.roomTypes) ? prev.roomTypes : [];
        newState.roomTypes = current.filter(t => t !== value); 
      }
      return newState;
    });
  };

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

            <Link 
              href="/saved-hostels"
              className="hidden sm:flex relative h-12 px-6 items-center gap-2 rounded-2xl bg-white border border-slate-200 text-slate-600 font-bold hover:bg-slate-50 transition"
            >
              <FaHeart className="text-rose-500" />
              <span>Saved</span>
              {wishlistIds.length > 0 && (
                <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-blue-600 px-1 text-[10px] font-black text-white">
                  {wishlistIds.length}
                </span>
              )}
            </Link>

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

              {/* University Stats & Filter */}
              <div className="mb-8">
                {activeUniversities.length > 0 ? (
                  <>
                    <div className="mb-4 rounded-2xl bg-blue-50 p-4 border border-blue-100 flex items-center justify-between">
                       <div>
                          <p className="text-[10px] font-black uppercase tracking-widest text-blue-600 mb-1">Active Hubs</p>
                          <p className="text-xl font-black text-slate-900">{activeUniversities.length}</p>
                       </div>
                       <div className="text-right">
                          <p className="text-[10px] font-black uppercase tracking-widest text-blue-600 mb-1">Hostels</p>
                          <p className="text-xl font-black text-slate-900">{activeUniversities.reduce((sum, u) => sum + u.count, 0)}</p>
                       </div>
                    </div>

                    <p className="mb-4 text-[10px] font-black uppercase tracking-widest text-slate-400">University</p>
                    <select 
                      value={filters.university || ''}
                      onChange={(e) => {
                        setFilters(prev => ({ ...prev, university: e.target.value || undefined, page: 1 }));
                      }}
                      className="w-full rounded-xl bg-slate-50 p-3 text-sm font-bold text-slate-900 outline-none ring-2 ring-transparent transition focus:ring-blue-500/20"
                    >
                      <option value="">All Universities</option>
                      {activeUniversities.map(uni => (
                        <option key={uni._id} value={uni._id}>{uni._id} • {uni.count} hostel{uni.count !== 1 ? 's' : ''}</option>
                      ))}
                    </select>
                  </>
                ) : (
                  <div className="rounded-2xl bg-slate-50 p-4 border border-slate-100 text-center">
                    <p className="text-xs font-bold text-slate-500">No universities currently have registered hostels.</p>
                  </div>
                )}
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
                  {AMENITIES.map(opt => (
                    <button
                      key={opt.id}
                      onClick={() => toggleAmenity(opt.id)}
                      className={`rounded-full px-4 py-1.5 text-[11px] font-black uppercase tracking-tight transition-all ${
                        filters.amenities?.includes(opt.id)
                          ? 'bg-blue-600 text-white shadow-md'
                          : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                      }`}
                    >
                      {opt.icon} {opt.label}
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
            <div className="mb-8">
              <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <h1 className="text-3xl font-black text-slate-900 md:text-4xl lg:text-5xl">Explore Hostels</h1>
                  <p className="mt-2 text-sm font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2 flex-wrap">
                    {filters.university ? (
                      <>Showing <span className="text-blue-600">{total}</span> hostels near {filters.university}</>
                    ) : (
                      <><span className="text-blue-600">{total}</span> listings found</>
                    )}
                    {debouncedSearch && <span className="text-slate-300">| Result for &quot;{debouncedSearch}&quot;</span>}
                  </p>
                </div>
                
                <div className="hidden lg:flex items-center gap-3 rounded-2xl bg-white p-1.5 shadow-sm border border-slate-100 shrink-0">
                  <button className="flex h-10 items-center justify-center rounded-xl bg-slate-900 px-4 text-xs font-black text-white">Grid</button>
                  <button className="flex h-10 items-center justify-center rounded-xl px-4 text-xs font-black text-slate-400 hover:bg-slate-50 transition">Map</button>
                </div>
              </div>

              {/* ACTIVE FILTER CHIPS */}
              {activeFiltersCount > 0 && (
                <div className="flex flex-wrap gap-2 animate-in fade-in slide-in-from-top-2">
                  {filters.university && (
                    <button onClick={() => removeFilter('university')} className="flex items-center gap-2 rounded-full bg-blue-100 px-4 py-1.5 text-[10px] font-black text-blue-600 uppercase transition hover:bg-blue-200">
                      Uni: {filters.university.split(' ').pop()} <FaTimes />
                    </button>
                  )}
                  {(filters.minPrice || filters.maxPrice) && (
                    <button onClick={() => removeFilter('budget')} className="flex items-center gap-2 rounded-full bg-slate-900 px-4 py-1.5 text-[10px] font-black text-white uppercase transition hover:bg-black">
                      Budget <FaTimes />
                    </button>
                  )}
                  {((filters.amenities as string[]) || []).map(a => {
                    const amenity = getAmenityById(a);
                    return (
                      <button key={a} onClick={() => removeFilter('amenity', a)} className="flex items-center gap-2 rounded-full bg-blue-50 px-4 py-1.5 text-[10px] font-black text-blue-500 uppercase border border-blue-100 transition hover:bg-blue-100">
                        {amenity?.icon} {amenity?.label || a} <FaTimes />
                      </button>
                    );
                  })}
                  {((filters.roomTypes as string[]) || []).map(t => (
                    <button key={t} onClick={() => removeFilter('room', t)} className="flex items-center gap-2 rounded-full bg-emerald-50 px-4 py-1.5 text-[10px] font-black text-emerald-600 border border-emerald-100 transition hover:bg-emerald-100">
                      Room: {t} <FaTimes />
                    </button>
                  ))}
                </div>
              )}
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
                <h3 className="text-2xl font-black text-slate-900">
                  {filters.university ? `No hostels currently registered near this university.` : 'No Hostels Found'}
                </h3>
                <p className="mt-2 max-w-sm text-lg font-medium text-slate-500 leading-relaxed">
                  We couldn&apos;t find any listings matching your current filters. Try resetting or adjusting them.
                </p>
                <button onClick={resetFilters} className="mt-8 rounded-2xl bg-blue-600 px-8 py-4 font-black text-white shadow-xl shadow-blue-200 transition hover:scale-105">
                  Clear Filters
                </button>
              </div>
            ) : (
              <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3">
                {hostels.map(hostel => (
                  <HostelCard key={hostel._id} hostel={hostel} />
                ))}
              </div>
            )}

            {/* RECENTLY VIEWED */}
            {!loading && recentHostels.length > 0 && (
              <div className="mt-20">
                <div className="mb-8 flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-black text-slate-900">Recently Viewed</h2>
                    <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mt-1">Pick up where you left off</p>
                  </div>
                </div>
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {recentHostels.slice(0, 4).map(h => (
                    <div key={h._id} className="scale-90 origin-top-left">
                      <HostelCard hostel={h} />
                    </div>
                  ))}
                </div>
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
                  {AMENITIES.map(opt => (
                    <button
                      key={opt.id}
                      onClick={() => toggleAmenity(opt.id)}
                      className={`rounded-full px-6 py-3 text-xs font-black uppercase tracking-tight transition-all ${
                        filters.amenities?.includes(opt.id)
                          ? 'bg-slate-900 text-white shadow-xl'
                          : 'bg-slate-100 text-slate-500'
                      }`}
                    >
                      {opt.label}
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
