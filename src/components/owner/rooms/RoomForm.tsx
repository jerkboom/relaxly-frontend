'use client';

import React, { useState, useEffect } from 'react';
import { 
  FaBed, 
  FaPlus, 
  FaSnowflake, 
  FaToilet, 
  FaTimes,
  FaCheckCircle,
  FaFemale,
  FaMale,
  FaInfoCircle
} from 'react-icons/fa';
import { createRoom, updateRoom } from '../../../services/hostelService';
import { getPublicSettings } from '../../../services/settingsService';
import { Room } from '../../../types';
import toast from 'react-hot-toast';
import ImageUploader from '../ImageUploader';
import { useRouter } from 'next/navigation';

interface RoomFormProps {
  hostelId: string;
  initialData?: Room | null;
  isEditing?: boolean;
}

export default function RoomForm({ hostelId, initialData, isEditing = false }: RoomFormProps) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [adjustments, setAdjustments] = useState<Record<string, number>>({});
  const [formData, setFormData] = useState({
    roomType: '1-in-1',
    occupancyStyle: '1-in-1' as '1-in-1' | '2-in-1' | '3-in-1' | '4-in-1' | '5-in-1' | '6-in-1' | '7-in-1' | '8-in-1',
    price: '',
    billingPeriod: 'academic year' as 'monthly' | 'semester' | 'academic year',
    capacity: '1',
    availableBeds: '1',
    maleAvailableBeds: '0',
    femaleAvailableBeds: '0',
    privateWashroom: false,
    hasAC: false,
    description: '',
    genderAllocation: 'Mixed' as 'Mixed' | 'Male' | 'Female',
    images: [] as string[],
    amenities: [] as string[],
    roomStatus: 'available' as 'available' | 'unavailable' | 'maintenance',
  });

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const settings = await getPublicSettings();
        if (settings?.roomTypeAdjustments) {
          setAdjustments(settings.roomTypeAdjustments);
        }
      } catch (error) {
        console.error('Failed to fetch adjustments:', error);
      }
    };
    fetchSettings();
  }, []);

  useEffect(() => {
    if (initialData) {
      setFormData({
        roomType: initialData.roomType,
        occupancyStyle: initialData.occupancyStyle,
        price: String(initialData.price),
        billingPeriod: initialData.billingPeriod,
        capacity: String(initialData.capacity),
        availableBeds: String(initialData.availableBeds),
        maleAvailableBeds: String(initialData.maleAvailableBeds || 0),
        femaleAvailableBeds: String(initialData.femaleAvailableBeds || 0),
        privateWashroom: !!initialData.privateWashroom,
        hasAC: !!initialData.hasAC,
        description: initialData.description || '',
        genderAllocation: initialData.genderAllocation || 'Mixed',
        images: initialData.images || [],
        amenities: initialData.amenities || [],
        roomStatus: initialData.roomStatus || 'available',
      });
    }
  }, [initialData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleImagesUploaded = (urls: string[]) => {
    setFormData(prev => ({ ...prev, images: urls }));
  };

  const toggleAmenity = (amenity: string) => {
    setFormData(prev => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter(a => a !== amenity)
        : [...prev.amenities, amenity]
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    const capacityNum = Number(formData.capacity);
    let availableBedsNum = Number(formData.availableBeds);
    let maleBeds = 0;
    let femaleBeds = 0;

    if (formData.genderAllocation === 'Mixed') {
      maleBeds = Number(formData.maleAvailableBeds);
      femaleBeds = Number(formData.femaleAvailableBeds);
      availableBedsNum = maleBeds + femaleBeds;
    } else if (formData.genderAllocation === 'Male') {
      maleBeds = availableBedsNum;
      femaleBeds = 0;
    } else if (formData.genderAllocation === 'Female') {
      maleBeds = 0;
      femaleBeds = availableBedsNum;
    }
    
    if (availableBedsNum > capacityNum) {
      toast.error('Available beds cannot exceed room capacity');
      return;
    }

    setSubmitting(true);

    const payload = {
      ...formData,
      hostel: hostelId,
      price: Number(formData.price),
      capacity: capacityNum,
      availableBeds: availableBedsNum,
      maleAvailableBeds: maleBeds,
      femaleAvailableBeds: femaleBeds,
      featuredImage: formData.images[0] || '',
    };

    try {
      if (isEditing && initialData) {
        await updateRoom(initialData._id, payload);
        toast.success('Room updated successfully');
      } else {
        await createRoom(payload);
        toast.success('Room created successfully');
      }
      router.push(`/owner/hostels/${hostelId}/rooms`);
      router.refresh();
    } catch (error: any) {
      console.error('Failed to save room:', error);
      toast.error(error.response?.data?.message || 'Failed to save room');
    } finally {
      setSubmitting(false);
    }
  };

  const roomAmenitiesList = [
    'Study Table', 'Mirror', 'Fan', 'Waste Bin', 'Curtains', 'Fridge', 'Cabinet', 'Bookshelf', 'Water Heater', 'Wi-Fi'
  ];

  const currentAdjustment = adjustments[formData.roomType] || 0;
  const basePrice = Number(formData.price) || 0;
  const displayPrice = basePrice + currentAdjustment;

  return (
    <form onSubmit={handleSubmit} className="space-y-12">
      <div className="grid gap-12 lg:grid-cols-2">
        {/* Left Column: Basic Info */}
        <div className="space-y-8">
          <section className="rounded-[2.5rem] bg-white p-8 shadow-sm">
            <h2 className="mb-6 flex items-center gap-2 text-2xl font-black text-slate-900">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                <FaBed />
              </span>
              Room Details
            </h2>

            <div className="grid gap-6 sm:grid-cols-2">
              <div className="space-y-2 sm:col-span-2">
                <label className="text-xs font-black uppercase tracking-wider text-slate-400">Room Type</label>
                <select 
                  name="roomType"
                  value={formData.roomType}
                  onChange={handleChange}
                  className="w-full rounded-2xl border-2 border-slate-100 bg-slate-50 px-5 py-4 font-bold text-slate-900 outline-none transition focus:border-blue-600 focus:bg-white"
                >
                  <option value="1-in-1">1-in-1 (Single)</option>
                  <option value="2-in-1">2-in-1 (Double)</option>
                  <option value="3-in-1">3-in-1 (Triple)</option>
                  <option value="4-in-1">4-in-1 (Quad)</option>
                  <option value="5-in-1">5-in-1 (Five Sharing)</option>
                  <option value="6-in-1">6-in-1 (Six Sharing)</option>
                  <option value="7-in-1">7-in-1 (Seven Sharing)</option>
                  <option value="8-in-1">8-in-1 (Eight Sharing)</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-wider text-slate-400">Occupancy Style</label>
                <select 
                  name="occupancyStyle"
                  value={formData.occupancyStyle}
                  onChange={handleChange}
                  className="w-full rounded-2xl border-2 border-slate-100 bg-slate-50 px-5 py-4 font-bold text-slate-900 outline-none transition focus:border-blue-600 focus:bg-white"
                >
                  <option value="1-in-1">1-in-1</option>
                  <option value="2-in-1">2-in-1</option>
                  <option value="3-in-1">3-in-1</option>
                  <option value="4-in-1">4-in-1</option>
                  <option value="5-in-1">5-in-1</option>
                  <option value="6-in-1">6-in-1</option>
                  <option value="7-in-1">7-in-1</option>
                  <option value="8-in-1">8-in-1</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-wider text-slate-400">Billing Period</label>
                <select 
                  name="billingPeriod"
                  value={formData.billingPeriod}
                  onChange={handleChange}
                  className="w-full rounded-2xl border-2 border-slate-100 bg-slate-50 px-5 py-4 font-bold text-slate-900 outline-none transition focus:border-blue-600 focus:bg-white"
                >
                  <option value="monthly">Monthly</option>
                  <option value="semester">Per Semester</option>
                  <option value="academic year">Per Academic Year</option>
                </select>
              </div>

              <div className="space-y-2 sm:col-span-2">
                <label className="text-xs font-black uppercase tracking-wider text-slate-400">Your Base Price (GHS)</label>
                <div className="relative">
                  <input 
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleChange}
                    placeholder="e.g. 2500"
                    required
                    className="w-full rounded-2xl border-2 border-slate-100 bg-slate-50 px-5 py-4 font-bold text-slate-900 outline-none transition focus:border-blue-600 focus:bg-white"
                  />
                  <p className="mt-2 text-[10px] font-bold text-slate-400">
                    * This is the amount you will receive per student.
                  </p>
                </div>
              </div>

              {/* Pricing Breakdown Preview */}
              <div className="sm:col-span-2 rounded-2xl bg-blue-50/50 p-6 border border-blue-100/50">
                <h3 className="text-xs font-black text-blue-600 uppercase tracking-widest mb-4 flex items-center gap-2">
                  <FaInfoCircle /> Pricing Breakdown Preview
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center text-sm">
                    <span className="font-bold text-slate-600">Your Earnings:</span>
                    <span className="font-black text-slate-900 text-lg">GHS {basePrice.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="font-bold text-slate-600">Platform Adjustment ({formData.roomType}):</span>
                    <span className="font-black text-blue-600">+ GHS {currentAdjustment.toLocaleString()}</span>
                  </div>
                  <div className="pt-3 border-t border-blue-200/50 flex justify-between items-center">
                    <span className="font-black text-slate-900">Student Sees:</span>
                    <span className="font-black text-emerald-600 text-2xl">GHS {displayPrice.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="rounded-[2.5rem] bg-white p-8 shadow-sm">
            <h2 className="mb-6 flex items-center gap-2 text-2xl font-black text-slate-900">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-50 text-purple-600">
                <FaMale />
              </span>
              Capacity & Gender
            </h2>

            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-wider text-slate-400">Gender Allocation</label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {['Male', 'Female', 'Mixed'].map((gender) => (
                    <button
                      key={gender}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, genderAllocation: gender as any }))}
                      className={`rounded-2xl py-4 font-bold transition ${
                        formData.genderAllocation === gender 
                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30' 
                        : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      {gender}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid gap-6 sm:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-wider text-slate-400">Total Bed Capacity</label>
                  <input 
                    type="number"
                    name="capacity"
                    value={formData.capacity}
                    onChange={handleChange}
                    className="w-full rounded-2xl border-2 border-slate-100 bg-slate-50 px-5 py-4 font-bold text-slate-900 outline-none transition focus:border-blue-600 focus:bg-white"
                  />
                </div>

                {formData.genderAllocation !== 'Mixed' ? (
                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-wider text-slate-400">Beds Currently Available</label>
                    <input 
                      type="number"
                      name="availableBeds"
                      value={formData.availableBeds}
                      onChange={handleChange}
                      className="w-full rounded-2xl border-2 border-slate-100 bg-slate-50 px-5 py-4 font-bold text-slate-900 outline-none transition focus:border-blue-600 focus:bg-white"
                    />
                  </div>
                ) : (
                  <>
                    <div className="space-y-2">
                      <label className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-pink-500">
                        <FaFemale /> Female Beds Available
                      </label>
                      <input 
                        type="number"
                        name="femaleAvailableBeds"
                        value={formData.femaleAvailableBeds}
                        onChange={handleChange}
                        className="w-full rounded-2xl border-2 border-pink-100 bg-pink-50/30 px-5 py-4 font-bold text-slate-900 outline-none transition focus:border-pink-500 focus:bg-white"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-blue-500">
                        <FaMale /> Male Beds Available
                      </label>
                      <input 
                        type="number"
                        name="maleAvailableBeds"
                        value={formData.maleAvailableBeds}
                        onChange={handleChange}
                        className="w-full rounded-2xl border-2 border-blue-100 bg-blue-50/30 px-5 py-4 font-bold text-slate-900 outline-none transition focus:border-blue-500 focus:bg-white"
                      />
                    </div>
                  </>
                )}
              </div>
            </div>
          </section>

          <section className="rounded-[2.5rem] bg-white p-8 shadow-sm">
            <h2 className="mb-6 flex items-center gap-2 text-2xl font-black text-slate-900">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
                <FaInfoCircle />
              </span>
              Amenities & Status
            </h2>

            <div className="space-y-6">
              <div className="flex flex-wrap gap-4">
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, hasAC: !prev.hasAC }))}
                  className={`flex items-center gap-2 rounded-2xl px-6 py-4 font-bold transition ${
                    formData.hasAC 
                    ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-500/30' 
                    : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <FaSnowflake /> Air Conditioned
                </button>
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, privateWashroom: !prev.privateWashroom }))}
                  className={`flex items-center gap-2 rounded-2xl px-6 py-4 font-bold transition ${
                    formData.privateWashroom 
                    ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/30' 
                    : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <FaToilet /> Private Washroom
                </button>
              </div>

              <div className="space-y-4">
                <label className="text-xs font-black uppercase tracking-wider text-slate-400">Status</label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {['available', 'unavailable', 'maintenance'].map((status) => (
                    <button
                      key={status}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, roomStatus: status as any }))}
                      className={`rounded-2xl py-4 text-xs font-black uppercase transition ${
                        formData.roomStatus === status 
                        ? (status === 'available' ? 'bg-emerald-600 text-white' : status === 'unavailable' ? 'bg-red-600 text-white' : 'bg-amber-600 text-white')
                        : 'bg-slate-50 text-slate-500 hover:bg-slate-100'
                      }`}
                    >
                      {status}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-wider text-slate-400">Amenities</label>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {roomAmenitiesList.map((amenity) => (
                    <button
                      key={amenity}
                      type="button"
                      onClick={() => toggleAmenity(amenity)}
                      className={`flex items-center gap-2 rounded-xl border-2 p-3 text-xs font-bold transition ${
                        formData.amenities.includes(amenity)
                        ? 'border-blue-600 bg-blue-50 text-blue-600'
                        : 'border-slate-100 bg-white text-slate-500 hover:border-slate-200'
                      }`}
                    >
                      {formData.amenities.includes(amenity) ? <FaCheckCircle /> : <div className="h-4 w-4 rounded-full border-2 border-slate-200" />}
                      {amenity}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* Right Column: Images & Description */}
        <div className="space-y-8">
          <section className="rounded-[2.5rem] bg-white p-8 shadow-sm">
            <h2 className="mb-6 flex items-center gap-2 text-2xl font-black text-slate-900">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                <FaPlus />
              </span>
              Room Images
            </h2>
            <ImageUploader 
              onImagesUploaded={handleImagesUploaded} 
              existingImages={formData.images} 
              maxImages={10} 
            />
            <p className="mt-4 text-xs font-bold text-slate-400">
              * The first image will be used as the featured image for this room type.
            </p>
          </section>

          <section className="rounded-[2.5rem] bg-white p-8 shadow-sm">
            <h2 className="mb-6 flex items-center gap-2 text-2xl font-black text-slate-900">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-50 text-slate-600">
                <FaInfoCircle />
              </span>
              Description
            </h2>
            <textarea 
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={6}
              placeholder="Describe the room features, view, furniture, etc."
              className="w-full rounded-[2rem] border-2 border-slate-100 bg-slate-50 p-6 font-bold text-slate-900 outline-none transition focus:border-blue-600 focus:bg-white"
            />
          </section>

          <div className="pt-8">
            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-[2rem] bg-slate-900 py-6 text-xl font-black text-white shadow-2xl transition hover:bg-blue-600 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70"
            >
              {submitting ? 'Saving Room...' : (isEditing ? 'Update Room Variant' : 'Create Room Variant')}
            </button>
          </div>
        </div>
      </div>
    </form>
  );
}
