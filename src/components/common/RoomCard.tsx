'use client';

import React from 'react';
import { 
  FaSnowflake, 
  FaToilet, 
  FaUserFriends, 
  FaClock,
  FaCheckCircle,
  FaBan,
  FaInfoCircle,
  FaMale,
  FaFemale,
  FaBed
} from 'react-icons/fa';
import { Room } from '../../types';
import ImageGallery from './ImageGallery';

interface RoomCardProps {
  room: Room;
  isSelected: boolean;
  onSelect: (id: string) => void;
}

export default function RoomCard({ room, isSelected, onSelect }: RoomCardProps) {
  const isAvailable = room.availableBeds > 0 && room.roomStatus === 'available';
  const isMaintenance = room.roomStatus === 'maintenance';
  const isFull = room.availableBeds === 0 || room.roomStatus === 'unavailable';

  return (
    <div className={`group relative rounded-[3rem] border-4 transition-all duration-500 w-full ${
      isSelected 
        ? 'border-blue-600 bg-blue-50/30 shadow-2xl scale-[1.01]' 
        : 'border-white bg-white shadow-lg hover:border-blue-100 hover:shadow-2xl'
    }`} style={{ border: '4px solid transparent' /* outer card border already there */ }}>
      {isSelected && (
        <div className="absolute top-0 right-0 z-20 rounded-tr-[2.5rem] rounded-bl-[2rem] bg-blue-600 px-6 py-2 text-xs font-black text-white shadow-lg">
          SELECTED
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-[40%_60%] gap-8 rounded-[2.75rem] p-2">
        {/* Room Gallery Section */}
        <div className="relative h-72 w-full lg:h-full min-h-[350px] overflow-hidden rounded-[2.5rem] shadow-md" style={{ border: '2px solid #3b82f620' }}>
          <ImageGallery 
            images={room.images || []} 
            alt={room.roomType} 
            showThumbnails={false}
            height="h-full"
            className="w-full h-full"
          />
          <div className="absolute top-6 left-6 z-10 flex flex-col gap-2">
            <div className="rounded-2xl bg-white/95 px-4 py-2 text-[10px] md:text-xs font-black text-slate-900 shadow-xl backdrop-blur-md">
              {room.occupancyStyle}
            </div>
            {isMaintenance && (
              <div className="flex items-center gap-2 rounded-2xl bg-orange-500 px-4 py-2 text-[10px] md:text-xs font-black text-white shadow-xl">
                <FaClock /> MAINTENANCE
              </div>
            )}
            {isFull && !isMaintenance && (
              <div className="flex items-center gap-2 rounded-2xl bg-red-500 px-4 py-2 text-[10px] md:text-xs font-black text-white shadow-xl">
                <FaBan /> FULLY BOOKED
              </div>
            )}
          </div>
        </div>

        {/* Room Info Section */}
        <div className="flex flex-col py-4 pr-6 sm:pr-8 lg:pr-10 min-w-0 w-full" style={{ border: '2px solid #10b98120' }}>
          <div className="space-y-6">
            <div className="flex flex-wrap gap-2">
              <span className="rounded-full bg-blue-600 px-4 py-1.5 text-[10px] font-black tracking-widest text-white uppercase shadow-md shadow-blue-200 whitespace-normal text-center">
                {room.roomType}
              </span>
              {room.hasAC && (
                <span className="flex items-center gap-1.5 rounded-full bg-cyan-50 px-3.5 py-1.5 text-[10px] font-black text-cyan-700 uppercase border border-cyan-100">
                  <FaSnowflake className="shrink-0" /> AC Included
                </span>
              )}
              <span className="flex items-center gap-1.5 rounded-full bg-slate-50 px-3.5 py-1.5 text-[10px] font-black text-slate-600 uppercase border border-slate-100">
                <FaToilet className="shrink-0" /> {room.privateWashroom ? 'Private' : 'Shared'} Washroom
              </span>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
              <h3 className="text-3xl md:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight">
                GHS {room.price}
                <span className="ml-2 text-sm font-bold text-slate-400 block sm:inline">
                  / {room.billingPeriod === 'academic year' ? 'Academic Year' : room.billingPeriod}
                </span>
              </h3>

              <div className={`flex items-center gap-2 rounded-2xl px-4 py-2 text-white shadow-lg w-fit ${
                room.genderAllocation === 'Mixed' ? 'bg-purple-600' :
                room.genderAllocation === 'Female' ? 'bg-pink-600' : 'bg-blue-600'
              }`}>
                {room.genderAllocation === 'Mixed' ? <FaUserFriends /> : room.genderAllocation === 'Female' ? <FaFemale /> : <FaMale />}
                <span className="text-[10px] font-black uppercase tracking-widest">
                  {room.genderAllocation === 'Mixed' ? 'MIXED ROOM' : `${room.genderAllocation} ONLY`}
                </span>
              </div>
            </div>
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            <div className="rounded-3xl bg-slate-50 p-6 border border-slate-100/50">
              <p className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                <FaBed className="text-blue-600" /> Availability Status
              </p>
              
              {room.genderAllocation === 'Mixed' ? (
                <div className="mt-4 grid grid-cols-1 gap-3">
                  <div className="flex justify-between items-center border-b border-slate-200 pb-2">
                    <div className="flex items-center gap-2">
                      <FaFemale className="text-pink-500 text-lg" />
                      <span className="text-xs font-black text-slate-700 uppercase">Female</span>
                    </div>
                    <h4 className={`text-xl font-black ${room.femaleAvailableBeds && room.femaleAvailableBeds > 0 ? 'text-pink-600' : 'text-slate-300'}`}>
                      {room.femaleAvailableBeds || 0}
                    </h4>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <FaMale className="text-blue-500 text-lg" />
                      <span className="text-xs font-black text-slate-700 uppercase">Male</span>
                    </div>
                    <h4 className={`text-xl font-black ${room.maleAvailableBeds && room.maleAvailableBeds > 0 ? 'text-blue-600' : 'text-slate-300'}`}>
                      {room.maleAvailableBeds || 0}
                    </h4>
                  </div>
                </div>
              ) : (
                <div className="mt-2 space-y-1">
                  <div className="flex items-baseline gap-2">
                    <h4 className={`text-3xl font-black ${room.availableBeds > 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                      {room.availableBeds} <span className="text-lg text-slate-400">/ {room.capacity}</span>
                    </h4>
                    <span className="text-[10px] font-bold text-slate-500 uppercase">Beds Left</span>
                  </div>
                  {room.availableBeds > 0 && room.availableBeds <= 3 && (
                    <p className="flex items-center gap-1 text-[9px] font-black text-orange-500 uppercase italic">
                      <FaInfoCircle /> High demand!
                    </p>
                  )}
                </div>
              )}
            </div>

            <div className="rounded-3xl bg-slate-50 p-6 border border-slate-100/50">
              <p className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                <FaCheckCircle className="text-blue-600" /> Key Features
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {room.amenities && room.amenities.slice(0, 4).map((amenity, idx) => (
                  <span key={idx} className="text-[10px] font-bold text-slate-700 bg-white px-3 py-1.5 rounded-lg border border-slate-200">
                    {amenity}
                  </span>
                ))}
                {room.amenities && room.amenities.length > 4 && (
                  <span className="text-[9px] font-bold text-slate-400 px-2 py-1">+{room.amenities.length - 4} more</span>
                )}
              </div>
            </div>
          </div>

          <div className="mt-auto pt-8 border-t border-slate-50">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
              <p className="text-sm font-medium text-slate-500 leading-relaxed max-w-xs">
                {room.description || "Experience comfort and style in this premium room variant designed for modern students."}
              </p>
              <button
                onClick={() => isAvailable && onSelect(room._id)}
                disabled={!isAvailable}
                className={`w-full shrink-0 rounded-[2rem] px-8 py-5 text-center text-xl font-black transition-all sm:w-auto ${
                  isSelected
                    ? 'bg-slate-900 text-white shadow-2xl scale-105'
                    : isAvailable
                    ? 'bg-blue-600 text-white shadow-xl shadow-blue-500/30 hover:bg-blue-700 hover:scale-[1.02] active:scale-95' 
                    : 'bg-slate-100 text-slate-400 cursor-not-allowed opacity-60'
                }`}
              >
                {isSelected ? 'SELECTED' : isAvailable ? 'CHOOSE ROOM' : isMaintenance ? 'MAINTENANCE' : 'SOLD OUT'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}