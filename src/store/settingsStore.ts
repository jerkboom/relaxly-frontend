/**
 * ==================================================
 * Relaxly Frontend
 * File: src/store/settingsStore.ts
 *
 * Purpose:
 * Stores public platform configurations such as:
 * - Support Contacts (WhatsApp, Phone, Email)
 * - Platform Maintenance status
 * - Global Service Fees (if applicable)
 *
 * This store ensures that students and owners see consistent
 * support information configured by administrators.
 *
 * ==================================================
 */

import { create } from 'zustand';
import { getPublicSettings } from '../services/settingsService';

interface SupportSettings {
  email: string;
  phone: string;
  whatsapp: string;
}

interface SettingsState {
  maintenanceMode: boolean;
  maintenanceMessage: string;
  supportSettings: SupportSettings;
  isLoading: boolean;
  fetchSettings: () => Promise<void>;
  /** Allows local overrides of maintenance state for UI testing. */
  setMaintenance: (mode: boolean, message?: string) => void;
}

export const useSettingsStore = create<SettingsState>((set) => ({
  maintenanceMode: false,
  maintenanceMessage: '',
  supportSettings: {
    email: 'support@relaxly.com',
    phone: '+233 XX XXX XXXX',
    whatsapp: '+233000000000'
  },
  isLoading: true,

  /**
   * Fetches the latest global settings from the backend.
   * Fallbacks to hardcoded defaults if the API fails.
   */
  fetchSettings: async () => {
    try {
      const data = await getPublicSettings();
      set({ 
        maintenanceMode: !!data.maintenanceMode, 
        maintenanceMessage: data.maintenanceMessage || 'Platform is currently under maintenance.',
        supportSettings: data.supportSettings || {
          email: 'support@relaxly.com',
          phone: '+233 XX XXX XXXX',
          whatsapp: '+233000000000'
        },
        isLoading: false 
      });
    } catch (error: any) {
      if (error.message === 'Network Error') {
        console.error('CRITICAL: Network Error - Frontend cannot reach backend.');
        console.error('Please verify your API URL in .env.local and ensure the backend is running.');
      } else {
        console.error('Failed to fetch settings:', error);
      }
      set({ isLoading: false });
    }
  },
  setMaintenance: (mode, message) => {
    set({ 
        maintenanceMode: mode, 
        maintenanceMessage: message || 'Platform is currently under maintenance.' 
    });
  }
}));
