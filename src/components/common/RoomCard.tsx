'use client';

import { motion, AnimatePresence } from 'framer-motion';
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
  FaBed,
  FaBolt,
  FaArrowRight
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

  // Booking details
  const basePrice = room.basePrice || room.price;
  const adjustmentAmount = room.adjustmentAmount || 0;
  // room.price is already the total student cost from backend
  const totalPrice = room.totalPrice || room.price;

  const getAvailabilityColor = (count: number) => {
    if (count === 0) return 'text-slate-500';
    if (count > 0 && count <= 2) return 'text-amber-600';
    return 'text-green-600';
  };

  const bedsPlural = (count: number) => (count === 1 ? 'bed' : 'beds');

  return (
    <motion.div 
      initial={false}
      animate={{ 
        borderColor: isSelected ? '#2563eb' : '#ffffff',
      }}
      className={`group relative overflow-hidden rounded-[2rem] sm:rounded-[3rem] border-4 bg-white transition-all duration-500 w-full ${
        isSelected ? 'shadow-2xl' : 'shadow-lg hover:border-blue-100 hover:shadow-2xl'
      }`}
    >
      <div className="grid grid-cols-1 lg:grid-cols-[40%_60%] gap-6 sm:gap-8 p-3 sm:p-4 lg:p-6 w-full max-w-full box-border">
        {/* Room Gallery Section */}
        <div className="relative h-56 sm:h-72 lg:h-auto min-h-[250px] sm:min-h-[350px] lg:min-h-[450px] overflow-hidden rounded-[1.5rem] sm:rounded-[2.5rem] shadow-sm">
          <ImageGallery 
            images={room.images || []} 
            alt={room.roomType} 
            showThumbnails={false}
            height="h-full"
            className="w-full h-full object-cover"
          />
          <div className="absolute top-4 sm:top-6 left-4 sm:left-6 z-10 flex flex-col gap-2">
            <div className="rounded-xl sm:rounded-2xl bg-white/95 px-3 sm:px-4 py-1.5 sm:py-2 text-[9px] sm:text-[10px] md:text-xs font-black text-slate-900 shadow-xl backdrop-blur-md">
              {room.occupancyStyle}
            </div>
            {isMaintenance && (
              <div className="flex items-center gap-2 rounded-xl sm:rounded-2xl bg-orange-500 px-3 sm:px-4 py-1.5 sm:py-2 text-[9px] sm:text-[10px] md:text-xs font-black text-white shadow-xl">
                <FaClock /> MAINTENANCE
              </div>
            )}
            {isFull && !isMaintenance && (
              <div className="flex items-center gap-2 rounded-xl sm:rounded-2xl bg-red-500 px-3 sm:px-4 py-1.5 sm:py-2 text-[9px] sm:text-[10px] md:text-xs font-black text-white shadow-xl">
                <FaBan /> FULLY BOOKED
              </div>
            )}
          </div>
        </div>

        {/* Room Info Section */}
        <div className="flex flex-col py-2 pr-2 sm:pr-4 lg:pr-6">
          <div className="space-y-4 sm:space-y-6 lg:space-y-8">
            <div className="flex flex-wrap gap-2">
              <span className="rounded-full bg-blue-600 px-3 sm:px-4 py-1 sm:py-1.5 text-[9px] sm:text-[10px] font-black tracking-widest text-white uppercase shadow-md shadow-blue-200">
                {room.roomType}
              </span>
              {room.hasAC && (
                <span className="flex items-center gap-1.5 rounded-full bg-cyan-50 px-3 sm:px-3.5 py-1 sm:py-1.5 text-[9px] sm:text-[10px] font-black text-cyan-700 uppercase border border-cyan-100">
                  <FaSnowflake className="shrink-0" /> AC
                </span>
              )}
              <span className="flex items-center gap-1.5 rounded-full bg-slate-50 px-3 sm:px-3.5 py-1 sm:py-1.5 text-[9px] sm:text-[10px] font-black text-slate-600 uppercase border border-slate-100">
                <FaToilet className="shrink-0" /> {room.privateWashroom ? 'Private' : 'Shared'}
              </span>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
              <div className="space-y-1">
                <p className="text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Final Student Price</p>
                <h3 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight">
                  GHS {totalPrice.toLocaleString()}
                  <span className="ml-2 text-xs sm:text-sm font-bold text-slate-400">
                    / {room.billingPeriod === 'academic year' ? 'Year' : 'Month'}
                  </span>
                </h3>
              </div>

              <div className={`flex items-center gap-2 rounded-xl sm:rounded-2xl px-3 sm:px-4 py-1.5 sm:py-2 text-white shadow-lg w-fit ${
                room.genderAllocation === 'Mixed' ? 'bg-purple-600' :
                room.genderAllocation === 'Female' ? 'bg-pink-600' : 'bg-blue-600'
              }`}>
                {room.genderAllocation === 'Mixed' ? <FaUserFriends /> : room.genderAllocation === 'Female' ? <FaFemale /> : <FaMale />}
                <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest">
                  {room.genderAllocation === 'Mixed' ? 'MIXED' : `${room.genderAllocation} ONLY`}
                </span>
              </div>
            </div>

            {/* NEW AMENITIES PLACEMENT - HIGHER CONVERSION */}
            <div className="space-y-3 pt-2">
              <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest pl-1">Included Amenities</p>
              <div className="flex flex-wrap gap-2">
                {(room.amenities && room.amenities.length > 0) ? (
                  room.amenities.map((amenity, idx) => (
                    <span 
                      key={idx} 
                      className="flex items-center gap-1.5 rounded-xl bg-blue-50 px-3 py-1.5 text-[10px] font-bold text-blue-700 border border-blue-200 shadow-sm"
                    >
                      <FaCheckCircle className="text-[10px]" /> {amenity}
                    </span>
                  ))
                ) : (
                  <span className="text-xs font-medium text-slate-400 italic">No specific amenities specified</span>
                )}
              </div>
            </div>

            <p className="text-sm sm:text-base font-medium text-slate-500 leading-relaxed max-w-2xl line-clamp-3 sm:line-clamp-none">
              {room.description || "Experience comfort and style in this premium room variant designed for modern students."}
            </p>

            <div className="grid gap-3 sm:gap-4 grid-cols-2">
              <div className="rounded-xl sm:rounded-2xl bg-slate-50 p-3 sm:p-4 border border-slate-100/50">
                <p className="flex items-center gap-2 text-[8px] sm:text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2 sm:mb-3">
                  <FaBed className="text-blue-600" /> Room Availability
                </p>
                <div className="space-y-1 sm:space-y-1.5 text-sm">
                  {room.genderAllocation === 'Mixed' ? (
                    <>
                      <div className="flex items-baseline justify-between">
                        <span className="font-bold text-slate-700">Male</span>
                        <span className={`font-black ${getAvailabilityColor(room.maleAvailableBeds || 0)}`}>
                          {room.maleAvailableBeds || 0} {bedsPlural(room.maleAvailableBeds || 0)} left
                        </span>
                      </div>
                      <div className="flex items-baseline justify-between">
                        <span className="font-bold text-slate-700">Female</span>
                        <span className={`font-black ${getAvailabilityColor(room.femaleAvailableBeds || 0)}`}>
                          {room.femaleAvailableBeds || 0} {bedsPlural(room.femaleAvailableBeds || 0)} left
                        </span>
                      </div>
                    </>
                  ) : (
                    <div className="flex items-baseline justify-between">
                      <span className="font-bold text-slate-700">{room.genderAllocation}</span>
                      <span className={`font-black ${getAvailabilityColor(room.availableBeds)}`}>
                        {room.availableBeds} {bedsPlural(room.availableBeds)} left
                      </span>
                    </div>
                  )}
                </div>
              </div>
              <div className="rounded-xl sm:rounded-2xl bg-blue-50 p-3 sm:p-4 border border-blue-100/50 flex flex-col justify-center min-h-[60px] sm:min-h-0">
                 {!isSelected && (
                   <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (isAvailable) onSelect(room._id);
                    }}
                    disabled={!isAvailable}
                    className={`w-full rounded-lg sm:rounded-xl py-2 sm:py-2.5 text-[10px] sm:text-xs font-black transition-all ${
                      isAvailable
                        ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-md active:scale-95' 
                        : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                    }`}
                  >
                    {isAvailable ? 'SELECT ROOM' : 'UNAVAILABLE'}
                  </button>
                 )}
                 {isSelected && (
                   <div className="flex items-center justify-center gap-2 text-blue-600">
                     <FaCheckCircle className="text-xs sm:text-sm" />
                     <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest">SELECTED</span>
                   </div>
                 )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {isSelected && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="border-t-2 border-dashed border-blue-100 bg-blue-50/30 w-full"
          >
            <div className="p-5 sm:p-8 lg:p-12 w-full">
              <div className="mx-auto max-w-2xl space-y-8 sm:space-y-10 w-full">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-600 text-white text-xl shadow-lg shrink-0">
                    <FaBolt />
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Complete Reservation</h4>
                    <p className="text-[10px] sm:text-xs font-black text-slate-400 uppercase tracking-widest sm:tracking-[0.2em] truncate">Review your booking details below</p>
                  </div>
                </div>

                <div className="space-y-4 w-full">
                  <div className="flex items-center justify-between py-4 sm:py-6 border-b border-blue-100/50 w-full">
                    <span className="text-xs sm:text-sm font-black text-blue-600 uppercase tracking-widest">Selected Room Price</span>
                    <span className="text-3xl sm:text-4xl font-black text-slate-900">GHS {totalPrice.toLocaleString()}</span>
                  </div>
                </div>

                <div className="flex flex-col gap-4 w-full">
                  <motion.button
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    onClick={() => {
                      const reserveBtn = document.getElementById(`reserve-now-${room._id}`);
                      if (reserveBtn) reserveBtn.click();
                    }}
                    className="flex items-center justify-center gap-3 rounded-2xl bg-blue-600 py-6 text-xl font-black text-white shadow-2xl shadow-blue-500/20 transition-all hover:bg-blue-700 w-full"
                  >
                    Reserve Now
                    <FaArrowRight className="text-sm" />
                  </motion.button>
                  <button 
                    onClick={() => onSelect('')}
                    className="py-2 text-[10px] font-black text-slate-400 uppercase tracking-widest transition hover:text-red-500 text-center w-full"
                  >
                    Go Back & Change
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hidden trigger for reservation logic from parent */}
      <button 
        id={`reserve-now-${room._id}`} 
        className="hidden"
        onClick={() => {
          window.dispatchEvent(new CustomEvent('trigger-reservation', { detail: { roomId: room._id } }));
        }}
      />
    </motion.div>
  );
}
