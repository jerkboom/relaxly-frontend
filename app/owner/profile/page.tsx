'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { FaUser, FaEnvelope, FaPhone, FaSave, FaBuilding } from 'react-icons/fa';
import { getUserProfile, updateUserProfile, UserProfile } from '../../../src/services/userService';
import toast from 'react-hot-toast';

export default function OwnerProfile() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchProfile = useCallback(async () => {
    try {
      const data = await getUserProfile();
      setUser(data);
      setName(data.name || '');
      setPhone(data.phone || '');
    } catch (error) {
      console.error('Failed to fetch profile:', error);
      toast.error('Could not load profile');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      await updateUserProfile({ name, phone });
      toast.success('Profile updated successfully');
      fetchProfile();
    } catch (error) {
      toast.error('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return isNaN(date.getTime()) ? 'N/A' : date.toLocaleDateString('en-US', { 
      month: 'long', 
      year: 'numeric' 
    });
  };

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6 sm:space-y-8">
      <div>
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900">Profile Settings</h1>
        <p className="mt-2 text-sm sm:text-base text-slate-500">Manage your personal information and account settings.</p>
      </div>

      <div className="overflow-hidden rounded-[1.5rem] sm:rounded-[2.5rem] bg-white shadow-sm">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 px-6 sm:px-8 py-10 sm:py-12 text-white">
          <div className="flex flex-col items-center gap-4 sm:gap-6 sm:flex-row text-center sm:text-left">
            <div className="flex h-20 w-20 sm:h-24 sm:w-24 shrink-0 items-center justify-center rounded-full bg-white text-3xl sm:text-4xl font-black text-blue-600">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <h2 className="text-2xl sm:text-3xl font-black truncate max-w-full">{user?.name}</h2>
              <p className="mt-1 text-blue-100 capitalize">{user?.role} Account</p>
              <p className="mt-1 sm:mt-2 text-xs sm:text-sm text-blue-200">Member since {formatDate(user?.createdAt)}</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleUpdate} className="p-6 sm:p-8 lg:p-12">
          <div className="grid gap-6 sm:gap-8 md:grid-cols-2">
            {/* NAME */}
            <div className="space-y-2 sm:space-y-3">
              <label className="flex items-center gap-2 font-bold text-sm sm:text-base text-slate-700">
                <FaUser className="text-blue-600" />
                Full Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-5 sm:px-6 py-3.5 sm:py-4 text-sm sm:text-base text-slate-900 outline-none transition focus:border-blue-600 focus:bg-white"
                required
              />
            </div>

            {/* EMAIL */}
            <div className="space-y-2 sm:space-y-3">
              <label className="flex items-center gap-2 font-bold text-sm sm:text-base text-slate-700">
                <FaEnvelope className="text-blue-600" />
                Email Address
              </label>
              <div className="w-full rounded-2xl border border-slate-100 bg-slate-100 px-5 sm:px-6 py-3.5 sm:py-4 text-sm sm:text-base text-slate-500 truncate">
                {user?.email}
              </div>
              <p className="text-[10px] sm:text-xs text-slate-400">Email cannot be changed.</p>
            </div>

            {/* PHONE */}
            <div className="space-y-2 sm:space-y-3">
              <label className="flex items-center gap-2 font-bold text-sm sm:text-base text-slate-700">
                <FaPhone className="text-blue-600" />
                Phone Number
              </label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="e.g. +233 24 000 0000"
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-5 sm:px-6 py-3.5 sm:py-4 text-sm sm:text-base text-slate-900 outline-none transition focus:border-blue-600 focus:bg-white"
              />
            </div>

            {/* ROLE */}
            <div className="space-y-2 sm:space-y-3">
              <label className="flex items-center gap-2 font-bold text-sm sm:text-base text-slate-700">
                <FaBuilding className="text-blue-600" />
                Account Type
              </label>
              <div className="w-full rounded-2xl border border-slate-100 bg-slate-100 px-5 sm:px-6 py-3.5 sm:py-4 text-sm sm:text-base text-slate-500 capitalize">
                {user?.role}
              </div>
            </div>
          </div>

          <div className="mt-8 sm:mt-12 flex justify-end border-t border-slate-100 pt-6 sm:pt-8">
            <button
              type="submit"
              disabled={saving}
              className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-2xl bg-blue-600 px-8 sm:px-10 py-3.5 sm:py-4 text-base sm:text-lg font-bold text-white transition hover:bg-blue-700 disabled:bg-slate-300"
            >
              <FaSave />
              {saving ? 'Saving...' : 'Save Profile Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
