'use client';

import React, { useEffect } from 'react';
import { useWishlistStore } from '../../src/store/wishlistStore';
import { useAuthStore } from '../../src/store/authStore';
import HostelCard from '../../src/components/home/HostelCard';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FaHeart, FaArrowRight, FaSearch, FaArrowLeft } from 'react-icons/fa';

export default function SavedHostelsPage() {
  const { wishlistHostels, fetchWishlist, clearWishlist, loading, lastWishlistSync } = useWishlistStore();
  const { user, hasHydrated } = useAuthStore();
  const router = useRouter();
  const [timeAgo, setTimeAgo] = React.useState('Just now');

  const handleBack = () => {
    // Check if there is a history to go back to
    if (typeof window !== 'undefined' && window.history.length > 1) {
      router.back();
    } else {
      router.push('/hostels');
    }
  };

  const handleClearAll = () => {
    if (window.confirm('Are you sure you want to clear all saved hostels from your view?')) {
      clearWishlist();
    }
  };

  useEffect(() => {
    if (hasHydrated && user) {
      fetchWishlist();
    }
  }, [hasHydrated, user, fetchWishlist]);

  useEffect(() => {
    const updateTimeAgo = () => {
      if (!lastWishlistSync) return;
      const now = new Date();
      const syncTime = new Date(lastWishlistSync);
      const diffMs = now.getTime() - syncTime.getTime();
      const diffMins = Math.round(diffMs / 60000);
      const diffHours = Math.round(diffMins / 60);
      const diffDays = Math.round(diffHours / 24);

      if (diffMins < 1) {
        setTimeAgo('Just now');
      } else if (diffMins < 60) {
        setTimeAgo(`${diffMins} min${diffMins === 1 ? '' : 's'} ago`);
      } else if (diffHours < 24) {
        setTimeAgo(`${diffHours} hour${diffHours === 1 ? '' : 's'} ago`);
      } else if (diffDays === 1) {
        setTimeAgo('Yesterday');
      } else {
        setTimeAgo(`${diffDays} days ago`);
      }
    };

    updateTimeAgo();
    const interval = setInterval(updateTimeAgo, 60000); // Update every minute
    return () => clearInterval(interval);
  }, [lastWishlistSync]);

  if (!hasHydrated || loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-8 text-center">
        <div className="h-20 w-20 bg-white rounded-3xl flex items-center justify-center text-rose-500 shadow-xl mb-6">
          <FaHeart size={32} />
        </div>
        <h1 className="text-3xl font-black text-slate-900 mb-4">Your Wishlist</h1>
        <p className="text-slate-500 max-w-md mb-8">Please log in to see your saved hostels and manage your favorites.</p>
        <Link href="/login" className="bg-slate-900 text-white px-8 py-4 rounded-2xl font-black shadow-lg hover:bg-blue-600 transition-all">
          Login to Account
        </Link>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 py-12 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 md:px-6 lg:px-8">
        {/* BACK NAVIGATION */}
        <div className="mb-8 sticky top-4 z-20">
          <button 
            onClick={handleBack}
            aria-label="Go back"
            className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-slate-600 shadow-sm transition hover:bg-slate-50 hover:text-blue-600 md:w-auto md:px-6 md:gap-3"
          >
            <FaArrowLeft className="text-lg" />
            <span className="hidden md:inline font-bold">Back to Results</span>
          </button>
        </div>

        <div className="mb-12 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
          <div>
            <div className="flex items-center gap-4 mb-3">
              <div className="h-14 w-14 bg-rose-50 rounded-2xl flex items-center justify-center text-rose-500 shadow-sm border border-rose-100">
                <FaHeart size={24} />
              </div>
              <div>
                <h1 className="text-4xl sm:text-6xl font-black text-slate-900 tracking-tight">
                  Saved Hostels <span className="text-blue-600 ml-2">({wishlistHostels.length})</span>
                </h1>
                <div className="flex items-center gap-3 mt-1">
                  <p className="text-lg text-slate-500 font-medium">Keep track of the places you love</p>
                  {lastWishlistSync && (
                    <>
                      <span className="hidden sm:inline w-1.5 h-1.5 rounded-full bg-slate-300" />
                      <p className="hidden sm:inline text-sm font-black text-slate-400 uppercase tracking-widest">
                        Updated {timeAgo}
                      </p>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex flex-wrap items-center gap-4">
            <Link 
              href="/hostels" 
              className="flex items-center gap-2 bg-slate-900 text-white px-8 py-4 rounded-2xl font-black shadow-lg hover:bg-blue-600 transition-all active:scale-95 text-sm uppercase tracking-wider"
            >
              <FaSearch size={14} />
              Browse More
            </Link>
            
            {wishlistHostels.length > 0 && (
              <button 
                onClick={handleClearAll}
                className="flex items-center gap-2 bg-white text-rose-600 border-2 border-rose-50 px-6 py-3 rounded-2xl font-black shadow-sm hover:bg-rose-50 transition-all active:scale-95 text-sm uppercase tracking-wider"
              >
                Clear All
              </button>
            )}
          </div>
        </div>

        {wishlistHostels.length === 0 ? (
          <div className="bg-white rounded-[3rem] p-12 sm:p-20 text-center shadow-sm border border-slate-100">
            <div className="mx-auto w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center text-slate-200 mb-8">
              <FaSearch size={40} />
            </div>
            <h3 className="text-3xl font-black text-slate-900 mb-4">No saved hostels yet</h3>
            <p className="text-xl text-slate-500 max-w-lg mx-auto mb-10 leading-relaxed">
              When you find a hostel you like, click the heart icon to save it here for quick access later.
            </p>
            <Link href="/hostels" className="inline-flex items-center gap-3 bg-blue-600 text-white px-10 py-5 rounded-[2rem] font-black text-lg shadow-xl shadow-blue-200 hover:scale-105 transition-all">
              Browse Hostels <FaArrowRight />
            </Link>
          </div>
        ) : (
          <>
            <div className="mb-6 flex items-center justify-between border-b border-slate-100 pb-4">
              <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">Your Saved Hostels</h2>
              <div className="flex items-center gap-2 text-slate-400 font-bold text-xs uppercase tracking-widest">
                <span>Sorted by:</span>
                <span className="text-blue-600">Recently Saved</span>
              </div>
            </div>
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {wishlistHostels.map((hostel) => (
                <HostelCard key={hostel._id} hostel={hostel} />
              ))}
            </div>
          </>
        )}
      </div>
    </main>
  );
}
