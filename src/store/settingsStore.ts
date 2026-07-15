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
  whatsappObj?: {
    number: string;
    displayName: string;
    defaultMessage: string;
    enabled: boolean;
  };
  emailObj?: {
    address: string;
    displayName: string;
    responseTime: string;
    enabled: boolean;
  };
  workingHours?: {
    timezone: string;
    weekdays: { open: string; close: string };
    weekend: { open: string; close: string };
  };
  isOnline?: boolean;
}

interface SettingsState {
  maintenanceMode: boolean;
  maintenanceMessage: string;
  supportSettings: SupportSettings;
  duplicateBookingWindowMs: number;
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
  duplicateBookingWindowMs: 20 * 24 * 60 * 60 * 1000,
  isLoading: true,

  /**
   * Fetches the latest global settings from the backend.
   * Fallbacks to hardcoded defaults if the API fails.
   */
  fetchSettings: async () => {
    try {
      const data = await getPublicSettings();
      const rawSupport = data.supportSettings || {};
      const normalizedSupport = {
        email: typeof rawSupport.email === 'string' ? rawSupport.email : (rawSupport.email?.address || 'support@relaxly.com'),
        phone: rawSupport.phone || '+233 XX XXX XXXX',
        whatsapp: typeof rawSupport.whatsapp === 'string' ? rawSupport.whatsapp : (rawSupport.whatsapp?.number || '+233000000000'),
        whatsappObj: typeof rawSupport.whatsapp === 'object' ? rawSupport.whatsapp : undefined,
        emailObj: typeof rawSupport.email === 'object' ? rawSupport.email : undefined,
        workingHours: rawSupport.workingHours,
        isOnline: rawSupport.isOnline
      };

      set({ 
        maintenanceMode: !!data.maintenanceMode, 
        maintenanceMessage: data.maintenanceMessage || 'Platform is currently under maintenance.',
        supportSettings: normalizedSupport,
        duplicateBookingWindowMs: Number(data.duplicateBookingWindowMs) || 20 * 24 * 60 * 60 * 1000,
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
