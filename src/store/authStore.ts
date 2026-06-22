/**
 * ==================================================
 * Relaxly Frontend
 * File: src/store/authStore.ts
 *
 * Purpose:
 * Manages the global authentication state using Zustand.
 * Persists user data and JWT tokens to localStorage.
 *
 * State:
 * - user: Authenticated user profile.
 * - token: JWT for API authorization.
 * - hasHydrated: Tracking for client-side persistence loading.
 *
 * Actions:
 * - setAuth: Login/Register success handler.
 * - logout: Wipes session data.
 * - initializeAuth: Persistence lifecycle hook.
 *
 * ==================================================
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { useWishlistStore } from './wishlistStore';
import { useHistoryStore } from './historyStore';
import { queryClient } from '../lib/queryClient';

interface User {
  _id: string;
  name: string;
  email: string;
  role: 'student' | 'owner' | 'admin';
  gender: 'Male' | 'Female';
  isEmailVerified: boolean;
  verificationStatus: 'pending' | 'approved' | 'rejected' | 'suspended';
  rejectionReason?: string;
}

interface AuthState {
  user: User | null;

  token: string | null;

  hasHydrated: boolean;

  setAuth: (
    user: User,
    token: string
  ) => void;

  logout: () => void;

  initializeAuth: () => void;
}

export const useAuthStore =
  create<AuthState>()(
    persist(
      (set) => ({
        user: null,

        token: null,

        hasHydrated: false,

        setAuth: (user, token) =>
          set({
            user,
            token,
          }),

        logout: () => {
          // Clear everything
          set({
            user: null,
            token: null,
          });
          
          // Clear other stores
          useWishlistStore.getState().clearWishlist();
          useHistoryStore.getState().clearHistory();
          
          // Clear React Query cache
          queryClient.clear();

          // Also clear localStorage explicitly if needed, but persist middleware usually handles it
          if (typeof window !== 'undefined') {
            localStorage.removeItem('auth-storage');
          }
        },

        initializeAuth: () =>
          set({
            hasHydrated: true,
          }),
      }),

      {
        name: 'auth-storage',

        partialize: (state) => ({
          user: state.user,
          token: state.token,
        }),

        onRehydrateStorage:
          () => (state) => {
            state?.initializeAuth();
          },
      }
    )
  );
