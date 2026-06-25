'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  FaArrowLeft, 
  FaHome, 
  FaMapMarkerAlt, 
  FaInfoCircle, 
  FaUniversity, 
  FaMoneyBillWave, 
  FaImage, 
  FaBed, 
  FaUserFriends, 
  FaWifi, 
  FaSnowflake, 
  FaShieldAlt, 
  FaTint, 
  FaLightbulb,
  FaCheckCircle
} from 'react-icons/fa';
import Link from 'next/link';
import { createHostel } from '../../../../src/services/hostelService';
import { normalizeUniversity } from '../../../../src/constants/universities';
import { HOSTEL_AMENITIES } from '../../../../src/constants/amenities';
import ImageUploader from '../../../../src/components/owner/ImageUploader';
import UniversitySelector from '../../../../src/components/owner/UniversitySelector';
import toast from 'react-hot-toast';

export default function CreateHostel() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    primaryUniversity: '',
    selectedUniversities: [] as string[],
    location: {
      address: '',
      city: '',
      region: '',
      latitude: '',
      longitude: '',
    },
    price: '',
    pricingType: 'semester',
    totalRooms: '',
    availableRooms: '',
    genderAllowed: 'Mixed',
    wifi: false,
    ac: false,
    security: false,
    water: false,
    electricity: false,
    amenities: [] as string[],
    images: [] as string[],
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else if (['address', 'city', 'region', 'latitude', 'longitude'].includes(name)) {
      setFormData(prev => ({
        ...prev,
        location: {
          ...prev.location,
          [name]: value
        }
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const setPrimaryUniversity = (uniName: string) => {
    setFormData(prev => ({
      ...prev,
      primaryUniversity: uniName,
      // Automatically remove from nearby if it was there
      selectedUniversities: prev.selectedUniversities.filter(u => u !== uniName)
    }));
  };

  const toggleNearbyUniversity = (uniName: string) => {
    setFormData(prev => {
      if (prev.primaryUniversity === uniName) return prev;
      
      const isSelected = prev.selectedUniversities.includes(uniName);
      if (!isSelected && prev.selectedUniversities.length >= 4) {
        toast.error('You can select a maximum of 4 nearby universities.');
        return prev;
      }

      return {
        ...prev,
        selectedUniversities: isSelected
          ? prev.selectedUniversities.filter(u => u !== uniName)
          : [...prev.selectedUniversities, uniName]
      };
    });
  };

  const toggleHostelAmenity = (amenityId: string) => {
    setFormData(prev => {
      const isSelected = prev.amenities.includes(amenityId);
      const newAmenities = isSelected
        ? prev.amenities.filter(id => id !== amenityId)
        : [...prev.amenities, amenityId];
      
      const updates: any = { amenities: newAmenities };
      
      // Sync with legacy boolean flags
      if (amenityId === 'wifi') updates.wifi = !isSelected;
      if (amenityId === 'ac') updates.ac = !isSelected;
      if (amenityId === 'security') updates.security = !isSelected;
      if (amenityId === 'water_supply') updates.water = !isSelected;
      if (amenityId === 'generator') updates.electricity = !isSelected;

      return { ...prev, ...updates };
    });
  };

  const handleImagesUploaded = (urls: string[]) => {
    setFormData(prev => ({ 
      ...prev, 
      images: [...new Set([...prev.images, ...urls])] 
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.primaryUniversity || !formData.location.address || !formData.price) {
      toast.error('Please fill in all required fields and select a primary university');
      return;
    }

    // VALIDATION: GPS Coordinates
    const lat = formData.location.latitude ? Number(formData.location.latitude) : null;
    const lng = formData.location.longitude ? Number(formData.location.longitude) : null;

    if (lat !== null && (lat < -90 || lat > 90)) {
      toast.error('Latitude must be between -90 and 90');
      return;
    }

    if (lng !== null && (lng < -180 || lng > 180)) {
      toast.error('Longitude must be between -180 and 180');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        ...formData,
        location: {
          ...formData.location,
          latitude: lat !== null ? lat : undefined,
          longitude: lng !== null ? lng : undefined,
        },
        price: Number(formData.price),
        totalRooms: Number(formData.totalRooms) || 0,
        availableRooms: Number(formData.availableRooms) || 0,
        nearestUniversity: formData.primaryUniversity,
        nearbyUniversities: formData.selectedUniversities,
      };

      await createHostel(payload);
      toast.success('Hostel created successfully!');
      router.push('/owner/hostels');
    } catch (error: any) {
      console.error('Failed to create hostel:', error);
      toast.error(error.response?.data?.message || 'Failed to create hostel');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl space-y-8 pb-24">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link 
          href="/owner/hostels"
          className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-slate-600 shadow-sm transition hover:bg-slate-50 hover:text-blue-600"
        >
          <FaArrowLeft />
        </Link>
        <div>
          <h1 className="text-4xl font-black text-slate-900">Add New Hostel</h1>
          <p className="mt-1 text-slate-500">Create a premium listing for your hostel.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Basic Information Section */}
        <section className="rounded-[2.5rem] bg-white p-8 shadow-sm md:p-10">
          <div className="mb-8 flex items-center gap-3 border-b border-slate-50 pb-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              <FaInfoCircle />
            </div>
            <h2 className="text-2xl font-black text-slate-900">Basic Information</h2>
          </div>

          <div className="grid gap-8 md:grid-cols-2">
            <div className="space-y-2 md:col-span-2">
              <label htmlFor="name" className="text-sm font-bold text-slate-700">Hostel Name *</label>
              <div className="relative">
                <FaHome className="absolute top-4 left-4 text-slate-400" />
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="e.g. Royal Gardens Hostel"
                  className="w-full rounded-2xl border-2 border-slate-100 bg-slate-50 py-3.5 pr-4 pl-12 font-medium transition focus:border-blue-600 focus:bg-white focus:outline-none"
                  required
                />
              </div>
            </div>

            {/* UNIVERSITY SELECTION UPGRADE */}
            <div className="space-y-6 md:col-span-2">
              <UniversitySelector
                primaryUniversity={formData.primaryUniversity}
                selectedUniversities={formData.selectedUniversities}
                onChangePrimary={setPrimaryUniversity}
                onChangeNearby={(names) => setFormData(prev => ({ ...prev, selectedUniversities: names }))}
              />

              {/* LIVE SUMMARY CARD */}
              {(formData.primaryUniversity || formData.selectedUniversities.length > 0) && (
                <div className="mt-8 rounded-3xl bg-slate-900 p-8 text-white shadow-2xl shadow-blue-100 animate-in fade-in slide-in-from-top-4 duration-500">
                   <div className="flex items-center justify-between mb-6">
                      <h3 className="text-lg font-black flex items-center gap-2">
                        <FaUniversity className="text-blue-400" />
                        Search Visibility Summary
                      </h3>
                      <div className="flex flex-col items-end">
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Search Reach</p>
                        <p className="text-2xl font-black text-blue-400">
                          { (formData.primaryUniversity ? 1 : 0) + formData.selectedUniversities.length } Universities
                        </p>
                      </div>
                   </div>

                   <div className="space-y-4">
                      {formData.primaryUniversity && (
                        <div className="flex items-start gap-3">
                           <div className="mt-1 h-2 w-2 rounded-full bg-blue-500 shrink-0 shadow-[0_0_10px_rgba(59,130,246,0.8)]" />
                           <div>
                              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-0.5">Primary Campus (Top Ranked)</p>
                              <p className="text-sm font-bold text-slate-200">{formData.primaryUniversity}</p>
                           </div>
                        </div>
                      )}

                      {formData.selectedUniversities.length > 0 && (
                        <div className="flex items-start gap-3">
                           <div className="mt-1 h-2 w-2 rounded-full bg-emerald-500 shrink-0" />
                           <div className="min-w-0 flex-1">
                              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Nearby Campuses (Visible)</p>
                              <div className="flex flex-wrap gap-2">
                                 {formData.selectedUniversities.map((uni, i) => (
                                   <span key={i} className="text-[10px] font-bold text-slate-400 bg-white/5 px-2 py-1 rounded-lg border border-white/10 truncate max-w-full">
                                     {uni}
                                   </span>
                                 ))}
                              </div>
                           </div>
                        </div>
                      )}
                   </div>

                   <div className="mt-6 pt-6 border-t border-white/5">
                      <p className="text-[10px] font-medium text-slate-500 italic leading-relaxed">
                        Student searches for any of these universities will include your hostel. Direct matches on the primary campus are featured first for maximum conversion.
                      </p>
                   </div>
                </div>
              )}
            </div>

            <div className="space-y-2 md:col-span-2">
              <label htmlFor="address" className="text-sm font-bold text-slate-700">Physical Address *</label>
              <div className="relative">
                <FaMapMarkerAlt className="absolute top-4 left-4 text-slate-400" />
                <input
                  type="text"
                  id="address"
                  name="address"
                  value={formData.location.address}
                  onChange={handleChange}
                  placeholder="e.g. Plot 45, University Main Road, East Campus"
                  className="w-full rounded-2xl border-2 border-slate-100 bg-slate-50 py-3.5 pr-4 pl-12 font-medium transition focus:border-blue-600 focus:bg-white focus:outline-none"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="city" className="text-sm font-bold text-slate-700">City *</label>
              <div className="relative">
                <FaMapMarkerAlt className="absolute top-4 left-4 text-slate-400" />
                <input
                  type="text"
                  id="city"
                  name="city"
                  value={formData.location.city}
                  onChange={handleChange}
                  placeholder="e.g. Accra"
                  className="w-full rounded-2xl border-2 border-slate-100 bg-slate-50 py-3.5 pr-4 pl-12 font-medium transition focus:border-blue-600 focus:bg-white focus:outline-none"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="region" className="text-sm font-bold text-slate-700">Region *</label>
              <div className="relative">
                <FaMapMarkerAlt className="absolute top-4 left-4 text-slate-400" />
                <input
                  type="text"
                  id="region"
                  name="region"
                  value={formData.location.region}
                  onChange={handleChange}
                  placeholder="e.g. Greater Accra"
                  className="w-full rounded-2xl border-2 border-slate-100 bg-slate-50 py-3.5 pr-4 pl-12 font-medium transition focus:border-blue-600 focus:bg-white focus:outline-none"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="latitude" className="text-sm font-bold text-slate-700">Latitude (GPS)</label>
              <div className="relative">
                <FaMapMarkerAlt className="absolute top-4 left-4 text-slate-400" />
                <input
                  type="number"
                  step="any"
                  id="latitude"
                  name="latitude"
                  value={formData.location.latitude}
                  onChange={handleChange}
                  placeholder="e.g. 5.6037"
                  className="w-full rounded-2xl border-2 border-slate-100 bg-slate-50 py-3.5 pr-4 pl-12 font-medium transition focus:border-blue-600 focus:bg-white focus:outline-none"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="longitude" className="text-sm font-bold text-slate-700">Longitude (GPS)</label>
              <div className="relative">
                <FaMapMarkerAlt className="absolute top-4 left-4 text-slate-400" />
                <input
                  type="number"
                  step="any"
                  id="longitude"
                  name="longitude"
                  value={formData.location.longitude}
                  onChange={handleChange}
                  placeholder="e.g. -0.1870"
                  className="w-full rounded-2xl border-2 border-slate-100 bg-slate-50 py-3.5 pr-4 pl-12 font-medium transition focus:border-blue-600 focus:bg-white focus:outline-none"
                />
              </div>
            </div>

            {/* LOCATION PREVIEW */}
            <div className="md:col-span-2 rounded-2xl bg-blue-50/50 p-6 border border-blue-100">
               <h4 className="text-xs font-black uppercase tracking-widest text-blue-600 mb-3 flex items-center gap-2">
                 <FaMapMarkerAlt /> Location Preview
               </h4>
               <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">Latitude</p>
                    <p className="text-sm font-black text-slate-700">{formData.location.latitude || 'Not Set'}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">Longitude</p>
                    <p className="text-sm font-black text-slate-700">{formData.location.longitude || 'Not Set'}</p>
                  </div>
               </div>
               {formData.location.latitude && formData.location.longitude && (
                 <p className="mt-3 text-[10px] font-bold text-emerald-600 flex items-center gap-1">
                   <FaCheckCircle className="text-[8px]" /> Valid GPS coordinates provided.
                 </p>
               )}
            </div>

            <div className="space-y-2 md:col-span-2">
              <label htmlFor="description" className="text-sm font-bold text-slate-700">Hostel Description</label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Share what makes your hostel unique, rules, and nearby attractions..."
                rows={4}
                className="w-full rounded-2xl border-2 border-slate-100 bg-slate-50 p-4 font-medium transition focus:border-blue-600 focus:bg-white focus:outline-none"
              />
            </div>
          </div>
        </section>

        {/* Pricing & Capacity Section */}
        <section className="rounded-[2.5rem] bg-white p-8 shadow-sm md:p-10">
          <div className="mb-8 flex items-center gap-3 border-b border-slate-50 pb-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
              <FaMoneyBillWave />
            </div>
            <h2 className="text-2xl font-black text-slate-900">Pricing & Capacity</h2>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <label htmlFor="price" className="text-sm font-bold text-slate-700">Starting Price *</label>
              <div className="relative">
                <FaMoneyBillWave className="absolute top-4 left-4 text-slate-400" />
                <input
                  type="number"
                  id="price"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  placeholder="0.00"
                  className="w-full rounded-2xl border-2 border-slate-100 bg-slate-50 py-3.5 pr-4 pl-12 font-medium transition focus:border-blue-600 focus:bg-white focus:outline-none"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="pricingType" className="text-sm font-bold text-slate-700">Pricing Cycle *</label>
              <select
                id="pricingType"
                name="pricingType"
                value={formData.pricingType}
                onChange={handleChange}
                className="w-full rounded-2xl border-2 border-slate-100 bg-slate-50 p-3.5 font-medium transition focus:border-blue-600 focus:bg-white focus:outline-none"
              >
                <option value="monthly">Monthly</option>
                <option value="semester">Semester</option>
                <option value="academic year">Academic Year</option>
              </select>
            </div>

            <div className="space-y-2">
              <label htmlFor="totalRooms" className="text-sm font-bold text-slate-700">Total Rooms</label>
              <div className="relative">
                <FaBed className="absolute top-4 left-4 text-slate-400" />
                <input
                  type="number"
                  id="totalRooms"
                  name="totalRooms"
                  value={formData.totalRooms}
                  onChange={handleChange}
                  placeholder="Total capacity"
                  className="w-full rounded-2xl border-2 border-slate-100 bg-slate-50 py-3.5 pr-4 pl-12 font-medium transition focus:border-blue-600 focus:bg-white focus:outline-none"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="availableRooms" className="text-sm font-bold text-slate-700">Available Rooms</label>
              <div className="relative">
                <FaCheckCircle className="absolute top-4 left-4 text-slate-400" />
                <input
                  type="number"
                  id="availableRooms"
                  name="availableRooms"
                  value={formData.availableRooms}
                  onChange={handleChange}
                  placeholder="Current availability"
                  className="w-full rounded-2xl border-2 border-slate-100 bg-slate-50 py-3.5 pr-4 pl-12 font-medium transition focus:border-blue-600 focus:bg-white focus:outline-none"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="genderAllowed" className="text-sm font-bold text-slate-700">Gender Permitted</label>
              <div className="relative">
                <FaUserFriends className="absolute top-4 left-4 text-slate-400" />
                <select
                  id="genderAllowed"
                  name="genderAllowed"
                  value={formData.genderAllowed}
                  onChange={handleChange}
                  className="w-full appearance-none rounded-2xl border-2 border-slate-100 bg-slate-50 py-3.5 pr-4 pl-12 font-medium transition focus:border-blue-600 focus:bg-white focus:outline-none"
                >
                  <option value="Mixed">Mixed Gender</option>
                  <option value="Male">Male Only</option>
                  <option value="Female">Female Only</option>
                </select>
              </div>
            </div>
          </div>
        </section>

        {/* Amenities Section */}
        <section className="rounded-[2.5rem] bg-white p-8 shadow-sm md:p-10">
          <div className="mb-8 flex items-center gap-3 border-b border-slate-50 pb-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-50 text-orange-600">
              <FaSnowflake />
            </div>
            <h2 className="text-2xl font-black text-slate-900">Amenities & Features</h2>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
            {[
              { id: 'wifi', label: 'Wi-Fi Internet', icon: <FaWifi /> },
              { id: 'ac', label: 'Air Conditioning', icon: <FaSnowflake /> },
              { id: 'security', label: '24/7 Security', icon: <FaShieldAlt /> },
              { id: 'water', label: 'Constant Water', icon: <FaTint /> },
              { id: 'electricity', label: 'Stable Power', icon: <FaLightbulb /> },
            ].map((amenity) => (
              <label
                key={amenity.id}
                className={`flex cursor-pointer items-center gap-3 rounded-2xl border-2 p-4 transition-all ${
                  (formData as any)[amenity.id]
                    ? 'border-blue-600 bg-blue-50 text-blue-700'
                    : 'border-slate-100 bg-slate-50 text-slate-500 hover:border-slate-200'
                }`}
              >
                <input
                  type="checkbox"
                  name={amenity.id}
                  checked={(formData as any)[amenity.id]}
                  onChange={handleChange}
                  className="hidden"
                />
                <span className="text-xl">{amenity.icon}</span>
                <span className="font-bold">{amenity.label}</span>
              </label>
            ))}
          </div>
        </section>

        {/* Media Upload Section */}
        <section className="rounded-[2.5rem] bg-white p-8 shadow-sm md:p-10">
          <div className="mb-8 flex items-center gap-3 border-b border-slate-50 pb-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-50 text-purple-600">
              <FaImage />
            </div>
            <h2 className="text-2xl font-black text-slate-900">Hostel Gallery</h2>
          </div>

          <ImageUploader onImagesUploaded={handleImagesUploaded} />
          
          {formData.images.length > 0 && (
            <p className="mt-4 text-center text-sm font-medium text-emerald-600">
              {formData.images.length} image(s) ready for listing.
            </p>
          )}
        </section>

        {/* Action Buttons */}
        <div className="sticky bottom-8 z-10 flex items-center justify-between rounded-3xl bg-slate-900/90 p-4 backdrop-blur-md shadow-2xl">
          <Link
            href="/owner/hostels"
            className="rounded-2xl px-4 sm:px-8 py-4 font-bold text-white transition hover:bg-white/10"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 sm:gap-3 rounded-2xl bg-blue-600 px-6 sm:px-12 py-4 font-black text-white shadow-lg shadow-blue-500/30 transition hover:bg-blue-700 hover:scale-105 active:scale-95 disabled:opacity-70 disabled:hover:scale-100"
          >
            {loading ? (
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
            ) : null}
            <span className="text-sm sm:text-base">{loading ? 'Publishing...' : 'Publish Hostel Listing'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
