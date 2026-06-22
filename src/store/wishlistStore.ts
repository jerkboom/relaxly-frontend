import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { toggleWishlist as toggleWishlistApi, getWishlist as getWishlistApi } from '../services/userService';
import toast from 'react-hot-toast';
import { invalidateHostelQueries, invalidateWishlistQueries } from '../lib/queryInvalidation';
import type { Hostel } from '../types';

interface WishlistState {
  wishlistIds: string[];
  wishlistHostels: Hostel[];
  loading: boolean;
  lastWishlistSync: string | null;
  hasHydrated: boolean;
  
  setWishlist: (ids: string[]) => void;
  fetchWishlist: () => Promise<void>;
  toggleWishlist: (hostelId: string) => Promise<void>;
  clearWishlist: () => void;
  isSaved: (hostelId: string) => boolean;
  initializeWishlist: () => void;
}

export const useWishlistStore = create<WishlistState>()(
  persist(
    (set, get) => ({
      wishlistIds: [],
      wishlistHostels: [],
      loading: false,
      lastWishlistSync: null,
      hasHydrated: false,

      setWishlist: (ids) => set({ wishlistIds: ids }),

      fetchWishlist: async () => {
        try {
          set({ loading: true });
          const hostels = await getWishlistApi() || [];
          const validHostels = hostels.filter((h: Hostel) => h !== null && h !== undefined);
          const ids = validHostels.map((h: Hostel) => h._id);
          set({ 
            wishlistHostels: validHostels, 
            wishlistIds: ids,
            lastWishlistSync: new Date().toISOString()
          });
        } catch (error) {
          console.error('Failed to fetch wishlist', error);
        } finally {
          set({ loading: false });
        }
      },

      toggleWishlist: async (hostelId: string) => {
        try {
          const { isSaved } = await toggleWishlistApi(hostelId);
          await Promise.all([
            invalidateHostelQueries(hostelId),
            invalidateWishlistQueries(),
          ]);
          
          if (isSaved) {
            set((state) => ({
              wishlistIds: [...state.wishlistIds, hostelId]
            }));
            toast.success('Hostel saved to wishlist', { icon: '❤️' });
          } else {
            set((state) => ({
              wishlistIds: state.wishlistIds.filter(id => id !== hostelId),
              wishlistHostels: state.wishlistHostels.filter(h => h._id !== hostelId)
            }));
            toast.success('Removed from wishlist');
          }
        } catch (error: unknown) {
          const status = typeof error === 'object' && error !== null && 'response' in error
            ? (error as { response?: { status?: number } }).response?.status
            : undefined;

          if (status === 401) {
            toast.error('Please login to save hostels');
          } else {
            toast.error('Failed to update wishlist');
          }
        }
      },

      clearWishlist: () => {
        set({ wishlistIds: [], wishlistHostels: [] });
      },

      isSaved: (hostelId: string) => {
        return get().wishlistIds.includes(hostelId);
      },

      initializeWishlist: () => {
        set({ hasHydrated: true });
      }
    }),
    {
      name: 'wishlist-storage',
      partialize: (state) => ({ wishlistIds: state.wishlistIds }),
      onRehydrateStorage: () => (state) => {
        state?.initializeWishlist();
      }
    }
  )
);
