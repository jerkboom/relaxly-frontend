import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Hostel } from '../types';

interface HistoryState {
  recentHostels: Hostel[];
  addToHistory: (hostel: Hostel) => void;
  clearHistory: () => void;
}

export const useHistoryStore = create<HistoryState>()(
  persist(
    (set) => ({
      recentHostels: [],

      addToHistory: (hostel: Hostel) => set((state) => {
        // Remove existing if any to avoid duplicates
        const filtered = state.recentHostels.filter(h => h._id !== hostel._id);
        // Add to front and limit to 10
        const updated = [hostel, ...filtered].slice(0, 10);
        return { recentHostels: updated };
      }),

      clearHistory: () => set({ recentHostels: [] }),
    }),
    {
      name: 'view-history-storage',
    }
  )
);
