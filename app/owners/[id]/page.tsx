'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { 
  FaPhone, 
  FaEnvelope, 
  FaWhatsapp, 
  FaArrowLeft, 
  FaCheckCircle, 
  FaMapMarkerAlt,
  FaHome,
  FaUserAlt,
  FaCalendarAlt
} from 'react-icons/fa';
import toast from 'react-hot-toast';
import API from '../../../src/lib/axios';
import { getSingleHostel } from '../../../src/services/hostelService';
import { useAuthStore } from '../../../src/store/authStore';
import { getOptimizedImageUrl } from '../../../src/utils/imageUtils';

import { getDashboardRoute } from '../../../src/utils/navigationUtils';

interface OwnerDetails {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  profileImage?: string;
  bio?: string;
  createdAt?: string;
}

interface HostelShort {
  _id: string;
  name: string;
  location: string | { address: string; city: string; region: string };
}

export default function OwnerContactPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { token } = useAuthStore();
  
  const ownerId = params.id as string;
  const hostelId = searchParams.get('hostel');

  const [owner, setOwner] = useState<OwnerDetails | null>(null);
  const [hostel, setHostel] = useState<HostelShort | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchOwnerData = useCallback(async () => {
    try {
      setLoading(true);
      
      // Fetch owner profile
      const userResponse = await API.get(`/users/${ownerId}`);
      setOwner(userResponse.data?.data || userResponse.data);

      // If hostelId is provided, fetch hostel details for address
      if (hostelId) {
        const hostelData = await getSingleHostel(hostelId);
        setHostel({
          _id: hostelData._id,
          name: hostelData.name,
          location: hostelData.location
        });
      }
    } catch (error: any) {
      console.error('Failed to load owner data:', error);
      toast.error('Unable to load owner contact details');
      // If unauthorized, redirect to login
      if (error.response?.status === 401) {
        router.push('/login');
      }
    } finally {
      setLoading(false);
    }
  }, [ownerId, hostelId, router]);

  useEffect(() => {
    if (ownerId) {
      fetchOwnerData();
    }
  }, [ownerId, fetchOwnerData]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
      </div>
    );
  }

  if (!owner) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 p-6 text-center">
        <h1 className="text-3xl font-black text-slate-900">Owner Not Found</h1>
        <p className="mt-4 text-slate-500">The contact details you are looking for are unavailable.</p>
        <Link href="/hostels" className="mt-8 rounded-2xl bg-blue-600 px-8 py-4 font-bold text-white transition hover:scale-105">
          Back to Hostels
        </Link>
      </div>
    );
  }

  const handleCall = () => {
    if (owner.phone) {
      window.location.href = `tel:${owner.phone}`;
    } else {
      toast.error('Phone number not available');
    }
  };

  const handleEmail = () => {
    window.location.href = `mailto:${owner.email}?subject=Inquiry about ${hostel?.name || 'your hostel'}`;
  };

  const handleWhatsApp = () => {
    if (owner.phone) {
      const formattedPhone = owner.phone.replace(/\D/g, '');
      const message = encodeURIComponent(`Hi ${owner.name}, I am interested in ${hostel?.name || 'your hostel'} listed on the platform.`);
      window.open(`https://wa.me/${formattedPhone}?text=${message}`, '_blank');
    } else {
      toast.error('WhatsApp contact not available');
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 py-12 px-6">
      <div className="mx-auto max-w-4xl">
        <button
          onClick={() => {
            if (typeof window !== 'undefined' && window.history.length > 1) {
              router.back();
            } else if (hostelId) {
              router.push(`/hostels/${hostelId}`);
            } else {
              router.push('/');
            }
          }}
          className="mb-8 flex items-center gap-2 rounded-2xl bg-white px-5 py-3 text-sm font-bold text-slate-600 shadow-sm transition hover:text-blue-600 active:scale-95 cursor-pointer"
        >
          <FaArrowLeft />
          Back
        </button>

        <div className="overflow-hidden rounded-[3rem] bg-white shadow-xl border border-slate-100">
          {/* HEADER SECTION */}
          <div className="relative h-48 bg-gradient-to-r from-blue-600 to-indigo-700">
            <div className="absolute -bottom-16 left-12">
              <div className="flex h-32 w-32 items-center justify-center rounded-[2.5rem] bg-white p-2 shadow-2xl">
                {owner.profileImage ? (
                  <img 
                    src={getOptimizedImageUrl(owner.profileImage, 'w_200,h_200,c_fill,g_face,q_auto,f_auto')} 
                    alt={owner.name} 
                    loading="lazy"
                    className="h-full w-full rounded-[2rem] object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center rounded-[2rem] bg-slate-100 text-5xl font-black text-blue-600">
                    {owner.name.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="pt-20 pb-12 px-12">
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-8">
              <div>
                <div className="flex items-center gap-3">
                  <h1 className="text-4xl font-black text-slate-900">{owner.name}</h1>
                  <FaCheckCircle className="text-blue-500 text-xl" title="Verified Owner" />
                </div>
                <p className="mt-2 flex items-center gap-2 text-slate-500 font-medium">
                  <FaUserAlt className="text-xs" />
                  Property Host
                </p>
                
                {owner.createdAt && (
                  <p className="mt-4 flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-widest">
                    <FaCalendarAlt />
                    Member since {owner.createdAt ? new Date(owner.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : 'N/A'}
                  </p>
                )}
              </div>

              {hostel && (
                <div className="rounded-3xl bg-blue-50 p-6 border border-blue-100">
                  <p className="text-[10px] font-black text-blue-600 uppercase tracking-[0.2em]">Managing Property</p>
                  <h3 className="mt-1 text-xl font-black text-slate-900">{hostel.name}</h3>
                  <p className="mt-1 flex items-center gap-1 text-sm text-slate-500">
                    <FaMapMarkerAlt />
                    {typeof hostel.location === 'object' ? `${hostel.location.city}, ${hostel.location.region}` : hostel.location}
                  </p>
                </div>
              )}
            </div>

            <div className="mt-12 grid gap-8 lg:grid-cols-2">
              {/* CONTACT INFO */}
              <div className="space-y-6">
                <h3 className="text-2xl font-black text-slate-900">Contact Information</h3>
                
                <div className="space-y-4">
                  <div className="flex items-center gap-4 rounded-3xl bg-slate-50 p-5 border border-slate-100">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-blue-600 shadow-sm">
                      <FaEnvelope />
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Email Address</p>
                      <p className="font-bold text-slate-900">{owner.email}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 rounded-3xl bg-slate-50 p-5 border border-slate-100">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-emerald-600 shadow-sm">
                      <FaPhone />
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Phone Number</p>
                      <p className="font-bold text-slate-900">{owner.phone || 'Not provided'}</p>
                    </div>
                  </div>
                </div>

                {owner.bio && (
                  <div className="mt-8">
                    <h4 className="text-lg font-black text-slate-900">About the Host</h4>
                    <p className="mt-3 text-slate-600 leading-relaxed font-medium">
                      {owner.bio}
                    </p>
                  </div>
                )}
              </div>

              {/* ACTION BUTTONS */}
              <div className="flex flex-col gap-4 justify-center">
                <button
                  onClick={handleCall}
                  className="flex w-full items-center justify-center gap-4 rounded-[2rem] bg-slate-900 py-6 text-xl font-black text-white shadow-xl transition-all hover:bg-black hover:scale-[1.02] active:scale-95"
                >
                  <FaPhone />
                  Call Owner
                </button>

                <button
                  onClick={handleWhatsApp}
                  className="flex w-full items-center justify-center gap-4 rounded-[2rem] bg-emerald-500 py-6 text-xl font-black text-white shadow-xl transition-all hover:bg-emerald-600 hover:scale-[1.02] active:scale-95"
                >
                  <FaWhatsapp className="text-2xl" />
                  WhatsApp
                </button>

                <button
                  onClick={handleEmail}
                  className="flex w-full items-center justify-center gap-4 rounded-[2rem] bg-blue-600 py-6 text-xl font-black text-white shadow-xl transition-all hover:bg-blue-700 hover:scale-[1.02] active:scale-95"
                >
                  <FaEnvelope />
                  Send Email
                </button>
              </div>
            </div>
          </div>

          {/* FOOTER NOTE */}
          <div className="bg-slate-50 px-12 py-8 border-t border-slate-100">
            <div className="flex items-start gap-4">
              <div className="mt-1 text-blue-600">
                <FaHome />
              </div>
              <p className="text-sm text-slate-500 font-medium leading-relaxed">
                By contacting the owner, you agree to our terms of service. For your safety, always meet in public spaces and verify the property before making any off-platform payments.
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
