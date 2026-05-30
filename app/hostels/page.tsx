'use client';

import {
  Suspense,
  useEffect,
  useState,
  useCallback,
  useMemo,
} from 'react';

import {
  useRouter,
  useSearchParams,
} from 'next/navigation';

import {
  FaSearch,
  FaFilter,
  FaTimes,
  FaSlidersH,
  FaArrowLeft,
  FaChevronDown,
  FaCheck,
  FaMapMarkerAlt,
  FaUniversity,
  FaBed,
  FaMoneyBillWave,
  FaShieldAlt,
  FaStar,
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
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, hasHydrated } = useAuthStore();

  // Data States
  const [hostels, setHostels] = useState<Hostel[]>([]);
  const [universities, setUniversities] = useState<University[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  // Filter States
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  
  const [filters, setFilters] = useState<HostelFilterParams>({
    page: 1,
    limit: 12,
    sort: 'newest',
    amenities: [],
    roomTypes: [],
  });

  // Fetch Universities
  useEffect(() => {
    getUniversities().then(data => {
      setUniversities(data?.data || data || []);
    }).catch(err => console.error('Failed to fetch universities', err));
  }, []);

  // Sync with URL params
  useEffect(() => {
    const qSearch = searchParams.get('search');
    const qUni = searchParams.get('university');
    const qBudget = searchParams.get('budget');

    if (qSearch) {
      setSearch(qSearch);
      setDebouncedSearch(qSearch);
    }

    if (qUni || qBudget) {
      setFilters(prev => ({
        ...prev,
        university: qUni || prev.university,
        maxPrice: qBudget ? Number(qBudget) : prev.maxPrice,
      }));
    }
  }, [searchParams]);

  // Search Debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setFilters(prev => ({ ...prev, page: 1 })); // Reset to page 1 on search
    }, 500);
    return () => clearTimeout(timer);
  }, [search]);

  // Fetch Hostels
  const fetchHostelsData = useCallback(async () => {
    if (!hasHydrated) return;
    
    try {
      setLoading(true);
      const params = {
        ...filters,
        location: debouncedSearch || undefined, // Use search as location if not a specific university
      };
      
      const result = await getHostels(params);
      setHostels(result.hostels);
      setTotal(result.total);
      setTotalPages(result.totalPages);
    } catch (error) {
      console.error('Failed to fetch hostels:', error);
    } finally {
      setLoading(false);
    }
  }, [filters, debouncedSearch, hasHydrated]);

  useEffect(() => {
    fetchHostelsData();
  }, [fetchHostelsData]);

  // Handlers
  const handleFilterChange = (key: keyof HostelFilterParams, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value, page: 1 }));
  };

  const toggleArrayFilter = (key: 'amenities' | 'roomTypes', value: string) => {
    setFilters(prev => {
      const current = (prev[key] as string[]) || [];
      const updated = current.includes(value)
        ? current.filter(v => v !== value)
        : [...current, value];
      return { ...prev, [key]: updated, page: 1 };
    });
  };

  const resetFilters = () => {
    setFilters({
      page: 1,
      limit: 12,
      sort: 'newest',
      amenities: [],
      roomTypes: [],
      minPrice: undefined,
      maxPrice: undefined,
      university: undefined,
      gender: undefined,
      verified: false,
      availableNow: false,
    });
    setSearch('');
    setDebouncedSearch('');
    router.push('/hostels');
  };

  const removeChip = (key: keyof HostelFilterParams, value?: any) => {
    if (key === 'amenities' || key === 'roomTypes') {
      toggleArrayFilter(key, value);
    } else {
      handleFilterChange(key, undefined);
    }
  };

  // UI Components
  const FilterSidebar = () => (
    <aside className="sticky top-28 hidden h-fit w-72 space-y-8 lg:block">
      {/* Search/Location */}
      <div className="space-y-4">
        <h3 className="text-sm font-black uppercase tracking-widest text-slate-400">Search Area</h3>
        <div className="relative">
          <FaMapMarkerAlt className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-500" />
          <input 
            type="text" 
            placeholder="City or Area..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-2xl border-2 border-slate-100 bg-white py-3 pl-12 pr-4 text-sm font-bold text-slate-900 focus:border-blue-600 outline-none transition-all"
          />
        </div>
      </div>

      {/* University */}
      <div className="space-y-4">
        <h3 className="text-sm font-black uppercase tracking-widest text-slate-400">University</h3>
        <select 
          value={filters.university || ''}
          onChange={(e) => handleFilterChange('university', e.target.value)}
          className="w-full rounded-2xl border-2 border-slate-100 bg-white py-3 px-4 text-sm font-bold text-slate-900 focus:border-blue-600 outline-none"
        >
          <option value="">All Universities</option>
          {universities.map(uni => (
            <option key={uni._id} value={uni._id}>{uni.name}</option>
          ))}
        </select>
      </div>

      {/* Room Types */}
      <div className="space-y-4">
        <h3 className="text-sm font-black uppercase tracking-widest text-slate-400">Room Type</h3>
        <div className="grid grid-cols-2 gap-2">
          {ROOM_TYPES_OPTIONS.map(type => (
            <button
              key={type.id}
              onClick={() => toggleArrayFilter('roomTypes', type.id)}
              className={`rounded-xl border-2 py-2 px-3 text-xs font-black transition-all ${
                filters.roomTypes?.includes(type.id)
                  ? 'border-blue-600 bg-blue-50 text-blue-600'
                  : 'border-slate-50 bg-white text-slate-500 hover:border-slate-200'
              }`}
            >
              {type.label}
            </button>
          ))}
        </div>
      </div>

      {/* Price Range */}
      <div className="space-y-4">
        <h3 className="text-sm font-black uppercase tracking-widest text-slate-400">Price Range (GHS)</h3>
        <div className="flex items-center gap-2">
          <input 
            type="number" 
            placeholder="Min"
            value={filters.minPrice || ''}
            onChange={(e) => handleFilterChange('minPrice', e.target.value ? Number(e.target.value) : undefined)}
            className="w-full rounded-xl border-2 border-slate-100 bg-white p-3 text-xs font-bold"
          />
          <span className="text-slate-300">—</span>
          <input 
            type="number" 
            placeholder="Max"
            value={filters.maxPrice || ''}
            onChange={(e) => handleFilterChange('maxPrice', e.target.value ? Number(e.target.value) : undefined)}
            className="w-full rounded-xl border-2 border-slate-100 bg-white p-3 text-xs font-bold"
          />
        </div>
      </div>

      {/* Gender */}
      <div className="space-y-4">
        <h3 className="text-sm font-black uppercase tracking-widest text-slate-400">Gender Preference</h3>
        <div className="flex gap-2">
          {['Mixed', 'Male', 'Female'].map(g => (
            <button
              key={g}
              onClick={() => handleFilterChange('gender', filters.gender === g ? undefined : g)}
              className={`flex-1 rounded-xl border-2 py-2 text-xs font-black transition-all ${
                filters.gender === g
                  ? 'border-blue-600 bg-blue-50 text-blue-600'
                  : 'border-slate-50 bg-white text-slate-500 hover:border-slate-200'
              }`}
            >
              {g}
            </button>
          ))}
        </div>
      </div>

      {/* Amenities */}
      <div className="space-y-4">
        <h3 className="text-sm font-black uppercase tracking-widest text-slate-400">Amenities</h3>
        <div className="space-y-2 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
          {AMENITIES_OPTIONS.map(amenity => (
            <label key={amenity} className="flex items-center gap-3 group cursor-pointer">
              <div 
                onClick={() => toggleArrayFilter('amenities', amenity)}
                className={`flex h-5 w-5 shrink-0 items-center justify-center rounded border-2 transition-all ${
                  filters.amenities?.includes(amenity)
                    ? 'border-blue-600 bg-blue-600 text-white'
                    : 'border-slate-200 bg-white group-hover:border-blue-300'
                }`}
              >
                {filters.amenities?.includes(amenity) && <FaCheck className="text-[10px]" />}
              </div>
              <span className="text-sm font-bold text-slate-600 group-hover:text-slate-900 transition-colors">{amenity}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Toggles */}
      <div className="space-y-4 pt-4 border-t border-slate-100">
        <label className="flex items-center justify-between cursor-pointer group">
          <span className="text-sm font-black text-slate-700">Verified Only</span>
          <div 
            onClick={() => handleFilterChange('verified', !filters.verified)}
            className={`relative h-6 w-11 rounded-full transition-colors ${filters.verified ? 'bg-blue-600' : 'bg-slate-200'}`}
          >
            <div className={`absolute top-1 h-4 w-4 rounded-full bg-white transition-all ${filters.verified ? 'left-6' : 'left-1'}`} />
          </div>
        </label>
        
        <label className="flex items-center justify-between cursor-pointer group">
          <span className="text-sm font-black text-slate-700">Available Now</span>
          <div 
            onClick={() => handleFilterChange('availableNow', !filters.availableNow)}
            className={`relative h-6 w-11 rounded-full transition-colors ${filters.availableNow ? 'bg-emerald-500' : 'bg-slate-200'}`}
          >
            <div className={`absolute top-1 h-4 w-4 rounded-full bg-white transition-all ${filters.availableNow ? 'left-6' : 'left-1'}`} />
          </div>
        </label>
      </div>

      {/* Reset */}
      <button 
        onClick={resetFilters}
        className="flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-100 py-4 text-sm font-black text-slate-600 transition hover:bg-slate-200"
      >
        <FaUndo /> Reset All
      </button>
    </aside>
  );

  const ActiveChips = () => {
    const activeFilters = useMemo(() => {
      const chips: { key: keyof HostelFilterParams; label: string; value?: any }[] = [];
      if (filters.university) {
        const uni = universities.find(u => u._id === filters.university);
        chips.push({ key: 'university', label: uni?.name || 'University' });
      }
      if (filters.gender) chips.push({ key: 'gender', label: filters.gender });
      if (filters.minPrice || filters.maxPrice) chips.push({ key: 'maxPrice', label: `GHS ${filters.minPrice || 0} - ${filters.maxPrice || '∞'}` });
      if (filters.verified) chips.push({ key: 'verified', label: 'Verified' });
      if (filters.availableNow) chips.push({ key: 'availableNow', label: 'Available' });
      
      filters.roomTypes?.forEach(t => {
        const label = ROOM_TYPES_OPTIONS.find(o => o.id === t)?.label || t;
        chips.push({ key: 'roomTypes', label, value: t });
      });
      
      filters.amenities?.forEach(a => {
        chips.push({ key: 'amenities', label: a, value: a });
      });
      
      return chips;
    }, [filters, universities]);

    if (activeFilters.length === 0) return null;

    return (
      <div className="mb-8 flex flex-wrap gap-2">
        {activeFilters.map((chip, idx) => (
          <button 
            key={`${chip.key}-${idx}`}
            onClick={() => removeChip(chip.key, chip.value)}
            className="flex items-center gap-2 rounded-full bg-blue-50 px-4 py-1.5 text-xs font-black text-blue-600 transition hover:bg-blue-100"
          >
            {chip.label}
            <FaTimes />
          </button>
        ))}
        <button 
          onClick={resetFilters}
          className="text-xs font-black text-slate-400 hover:text-slate-600 underline"
        >
          Clear all
        </button>
      </div>
    );
  };

  return (
    <main className="min-h-screen bg-white">
      {/* NAVBAR / SEARCH */}
      <header className="sticky top-0 z-[60] border-b border-slate-100 bg-white/80 backdrop-blur-xl px-6 py-4">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push(getDashboardRoute(user?.role))}
              className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-50 text-slate-600 transition hover:bg-slate-100"
            >
              <FaArrowLeft />
            </button>
            <div className="hidden sm:block">
              <h1 className="text-xl font-black text-slate-900">Explore Hostels</h1>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-tighter">{total} Properties found</p>
            </div>
          </div>

          <div className="relative flex-1 max-w-2xl">
            <FaSearch className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search city, area, or hostel name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-2xl border-2 border-slate-50 bg-slate-50 py-3.5 pl-14 pr-6 text-base font-bold text-slate-900 outline-none transition-all focus:border-blue-600 focus:bg-white"
            />
          </div>

          <div className="flex items-center gap-3">
            <div className="relative hidden sm:block">
              <select 
                value={filters.sort}
                onChange={(e) => handleFilterChange('sort', e.target.value)}
                className="appearance-none rounded-2xl border-2 border-slate-50 bg-slate-50 py-3.5 pl-5 pr-10 text-sm font-black text-slate-700 outline-none focus:border-blue-600"
              >
                {SORT_OPTIONS.map(opt => (
                  <option key={opt.id} value={opt.id}>{opt.label}</option>
                ))}
              </select>
              <FaChevronDown className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-xs text-slate-400" />
            </div>
            
            <button
              onClick={() => setShowMobileFilters(true)}
              className="flex h-12 px-6 items-center gap-2 rounded-2xl bg-slate-900 text-white font-black text-sm lg:hidden"
            >
              <FaSlidersH />
              Filters
            </button>
          </div>
        </div>
      </header>

      {/* MAIN LAYOUT */}
      <div className="mx-auto max-w-7xl px-6 py-10">
        <div className="flex gap-12">
          {/* Sidebar */}
          <FilterSidebar />

          {/* Listing */}
          <div className="flex-1">
            <ActiveChips />

            {loading && filters.page === 1 ? (
              <div className="grid gap-8 sm:grid-cols-2">
                {[1, 2, 4, 5, 6].map(i => (
                  <div key={i} className="h-[450px] animate-pulse rounded-[2.5rem] bg-slate-50" />
                ))}
              </div>
            ) : hostels.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-[3rem] bg-slate-50 py-32 text-center">
                <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-white text-4xl text-slate-200 shadow-sm">
                  <FaFilter />
                </div>
                <h3 className="text-3xl font-black text-slate-900">No Hostels Found</h3>
                <p className="mt-3 text-slate-500 font-medium max-w-sm">We couldn't find any hostels matching your current filters. Try broadening your search.</p>
                <button
                  onClick={resetFilters}
                  className="mt-8 rounded-2xl bg-blue-600 px-8 py-4 font-black text-white shadow-lg shadow-blue-200 transition hover:bg-blue-700"
                >
                  Clear All Filters
                </button>
              </div>
            ) : (
              <>
                <div className="grid gap-8 sm:grid-cols-2">
                  {hostels.map(hostel => (
                    <HostelCard key={hostel._id} hostel={hostel} />
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="mt-16 flex items-center justify-center gap-4">
                    <button 
                      disabled={filters.page === 1}
                      onClick={() => handleFilterChange('page', (filters.page || 1) - 1)}
                      className="rounded-xl border-2 border-slate-100 p-4 font-black transition hover:bg-slate-50 disabled:opacity-30"
                    >
                      <FaArrowLeft />
                    </button>
                    <span className="text-sm font-black text-slate-900">Page {filters.page} of {totalPages}</span>
                    <button 
                      disabled={filters.page === totalPages}
                      onClick={() => handleFilterChange('page', (filters.page || 1) + 1)}
                      className="rounded-xl border-2 border-slate-100 p-4 font-black transition hover:bg-slate-50 disabled:opacity-30"
                    >
                      <FaArrowLeft className="rotate-180" />
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* MOBILE DRAWER */}
      <AnimatePresence>
        {showMobileFilters && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowMobileFilters(false)}
              className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed inset-x-0 bottom-0 z-[110] flex flex-col max-h-[90vh] rounded-t-[3rem] bg-white shadow-2xl"
            >
              <div className="sticky top-0 border-b border-slate-50 bg-white px-10 py-8 flex items-center justify-between rounded-t-[3rem]">
                <div>
                  <h2 className="text-3xl font-black text-slate-900">Filters</h2>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Refine your search</p>
                </div>
                <button
                  onClick={() => setShowMobileFilters(false)}
                  className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-600"
                >
                  <FaTimes />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-10 space-y-10 custom-scrollbar">
                {/* Re-use components or similar logic here for mobile */}
                <div className="space-y-6">
                   {/* Mobile Sorting */}
                   <div>
                    <h3 className="text-sm font-black uppercase tracking-widest text-slate-400 mb-4">Sort By</h3>
                    <div className="flex flex-wrap gap-2">
                      {SORT_OPTIONS.map(opt => (
                        <button
                          key={opt.id}
                          onClick={() => handleFilterChange('sort', opt.id)}
                          className={`rounded-xl border-2 py-2 px-4 text-xs font-black transition-all ${
                            filters.sort === opt.id
                              ? 'border-blue-600 bg-blue-50 text-blue-600'
                              : 'border-slate-50 bg-white text-slate-500'
                          }`}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  {/* Re-use Sidebar parts here if needed for mobile ... keeping it brief for brevity */}
                  <div>
                    <h3 className="text-sm font-black uppercase tracking-widest text-slate-400 mb-4">University</h3>
                    <select 
                      value={filters.university || ''}
                      onChange={(e) => handleFilterChange('university', e.target.value)}
                      className="w-full rounded-2xl border-2 border-slate-100 bg-slate-50 py-4 px-6 font-bold"
                    >
                      <option value="">All Universities</option>
                      {universities.map(uni => <option key={uni._id} value={uni._id}>{uni.name}</option>)}
                    </select>
                  </div>

                  <div>
                    <h3 className="text-sm font-black uppercase tracking-widest text-slate-400 mb-4">Gender</h3>
                    <div className="grid grid-cols-3 gap-2">
                      {['Mixed', 'Male', 'Female'].map(g => (
                        <button
                          key={g}
                          onClick={() => handleFilterChange('gender', g)}
                          className={`rounded-xl border-2 py-3 text-xs font-black ${
                            filters.gender === g ? 'border-blue-600 bg-blue-50 text-blue-600' : 'border-slate-50 bg-slate-50 text-slate-500'
                          }`}
                        >
                          {g}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-10 border-t border-slate-50 bg-slate-50 flex gap-4">
                <button
                  onClick={resetFilters}
                  className="flex-1 rounded-[2rem] bg-white border-2 border-slate-200 py-5 text-lg font-black text-slate-600"
                >
                  Reset
                </button>
                <button
                  onClick={() => setShowMobileFilters(false)}
                  className="flex-[2] rounded-[2rem] bg-slate-900 py-5 text-lg font-black text-white shadow-xl shadow-slate-200"
                >
                  Show {total} Hostels
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #e2e8f0;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #cbd5e1;
        }
      `}</style>
    </main>
  );
}

export default function HostelsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-slate-50">
          <div className="h-16 w-16 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
        </div>
      }
    >
      <HostelsPageContent />
    </Suspense>
  );
}