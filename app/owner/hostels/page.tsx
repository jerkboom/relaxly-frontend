'use client';

import React, { useEffect, useState } from 'react';
import { FaHome, FaMapMarkerAlt, FaBed, FaPlus, FaEdit, FaTrash } from 'react-icons/fa';
import Link from 'next/link';
import { useSettingsStore } from '../../../src/store/settingsStore';
import { FaExclamationCircle } from 'react-icons/fa';
import { getOwnerHostels, deleteHostel } from '../../../src/services/hostelService';
import toast from 'react-hot-toast';
import { Hostel } from '../../../src/types';
import ImageGallery from '../../../src/components/common/ImageGallery';

export default function OwnerHostels() {
  const [hostels, setHostels] = useState<Hostel[]>([]);
  const [loading, setLoading] = useState(true);
  const { maintenanceMode } = useSettingsStore();

  const fetchHostels = async () => {
    try {
      setLoading(true);
      const data = await getOwnerHostels();
      setHostels(data);
    } catch (error) {
      console.error('Failed to fetch hostels:', error);
      toast.error('Could not load hostels');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHostels();
  }, []);

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this hostel? This action cannot be undone.')) {
      return;
    }

    try {
      await deleteHostel(id);
      toast.success('Hostel deleted successfully');
      setHostels(prev => prev.filter(h => h._id !== id));
    } catch (error: any) {
      console.error('Failed to delete hostel:', error);
      toast.error(error.response?.data?.message || 'Failed to delete hostel');
    }
  };

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-black text-slate-900">My Hostels</h1>
          <p className="mt-2 text-slate-500">Manage your listed hostels and their rooms.</p>
        </div>
        <Link 
          href="/owner/hostels/create"
          className="flex items-center gap-2 rounded-2xl bg-blue-600 px-6 py-3 font-bold text-white transition hover:bg-blue-700"
        >
          <FaPlus />
          <span>Add New Hostel</span>
        </Link>
      </div>

      {hostels.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-[3rem] bg-white py-24 shadow-sm">
          <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-blue-50 text-5xl text-blue-600">
            <FaHome />
          </div>
          <h2 className="text-3xl font-black text-slate-900">No Hostels Found</h2>
          <p className="mt-3 text-slate-500">You haven't added any hostels yet.</p>
          <Link 
            href="/owner/hostels/create"
            className="mt-8 rounded-2xl bg-blue-600 px-8 py-4 font-bold text-white transition hover:bg-blue-700"
          >
            Create Your First Listing
          </Link>
        </div>
      ) : (
        <div className="grid gap-8 md:grid-cols-2 xl:grid-cols-3">
          {hostels.map((hostel) => (
            <div key={hostel._id} className="group overflow-hidden rounded-[2.5rem] bg-white shadow-sm transition hover:shadow-xl">
              {/* IMAGE PLACEHOLDER */}
              <div className="relative h-64 bg-slate-200">
                <ImageGallery 
                  images={hostel.images || []} 
                  alt={hostel.name} 
                  showThumbnails={false}
                  height="h-full"
                  className="h-full"
                />
                <div className="absolute top-4 right-4 z-10 flex gap-2">
                  <Link 
                    href={`/owner/hostels/edit/${hostel._id}`}
                    className="rounded-xl bg-white/90 p-3 text-blue-600 backdrop-blur-sm transition hover:bg-white"
                  >
                    <FaEdit />
                  </Link>
                  <button 
                    onClick={() => handleDelete(hostel._id)}
                    className="rounded-xl bg-white/90 p-3 text-red-600 backdrop-blur-sm transition hover:bg-white"
                  >
                    <FaTrash />
                  </button>
                </div>
              </div>

              <div className="p-8">
                <h3 className="text-2xl font-black text-slate-900">{hostel.name}</h3>
                <div className="mt-2 flex items-center gap-2 text-slate-500">
                  <FaMapMarkerAlt className="text-blue-600" />
                  <span className="truncate">{hostel.location}</span>
                </div>

                <div className="mt-6 flex items-center gap-6 border-t border-slate-100 pt-6">
                  <div className="flex items-center gap-2">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                      <FaBed />
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">Rooms</p>
                      <p className="font-bold text-slate-900">{hostel.rooms?.length || 0}</p>
                    </div>
                  </div>
                  
                  <Link 
                    href={`/owner/hostels/${hostel._id}/rooms`}
                    className="ml-auto rounded-xl bg-slate-900 px-4 py-2 text-sm font-bold text-white transition hover:bg-slate-800"
                  >
                    Manage Rooms
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

