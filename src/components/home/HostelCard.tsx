/**
 * ==================================================
 * Relaxly Frontend
 * Component: HostelCard
 *
 * Responsibility:
 * Displays a summary preview of a hostel property.
 * Primary navigational element in search and discovery pages.
 *
 * Props:
 * - hostel: The complete hostel object including images and amenities.
 *
 * Behavior:
 * - Hover: Gentle lift animation and shadow intensification.
 * - Interaction: Clicking the entire card navigates to the detailed view.
 * - Features: Image preview, honest ratings ("New"), price overlay, distance/uni proximity, gender & room capacity indicators.
 *
 * ==================================================
 */
"use client";

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import {
  FaMapMarkerAlt,
  FaHeart,
  FaRegHeart,
  FaStar,
  FaUniversity,
  FaBed,
  FaTimes,
  FaChevronLeft,
  FaChevronRight,
} from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';

import { Hostel, Room } from '../../types';
import { getHostelSeoUrl } from '../../utils/seoUtils';
import { useWishlistStore } from '../../store/wishlistStore';
import { useAuthStore } from '../../store/authStore';
import { getOptimizedImageUrl } from '../../utils/imageUtils';


interface Props {
  hostel: Hostel;
}

export default function HostelCard({
  hostel,
}: Props) {
  const detailHref = getHostelSeoUrl(hostel);
  const { toggleWishlist, isSaved } = useWishlistStore();
  const { user } = useAuthStore();
  const saved = isSaved(hostel._id);

  const handleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(hostel._id);
  };

  // Helper to extract a clean short abbreviation for the university name
  const getShortUniName = (fullName: string) => {
    if (!fullName) return '';
    const name = fullName.toLowerCase();
    if (name.includes('ghana')) return 'UG';
    if (name.includes('professional')) return 'UPSA';
    if (name.includes('science')) return 'KNUST';
    if (name.includes('cape coast')) return 'UCC';
    if (name.includes('development')) return 'UDS';
    if (name.includes('energy')) return 'UENR';
    if (name.includes('education')) return 'UEW';
    if (name.includes('health')) return 'UHAS';
    
    return fullName.split('(')[1]?.split(')')[0] || fullName;
  };

  // Compute school proximity text dynamically
  const proximityText = (() => {
    if (hostel.nearestInstitution) {
      const uni = getShortUniName(hostel.nearestInstitution.name);
      return `${hostel.nearestInstitution.walkingMinutes} mins to ${uni}`;
    }
    if (hostel.nearestUniversity) {
      const uni = getShortUniName(hostel.nearestUniversity);
      if (uni === 'undefined' || uni === '') return '';
      return `${uni}`;
    }
    return '';
  })();

  // Get unique available room variants from backend roomSummary (cheapest first)
  const roomVariants = useMemo(() => {
    return hostel.roomSummary || [];
  }, [hostel.roomSummary]);

  const [selectedVariant, setSelectedVariant] = useState<{
    occupancyStyle: string;
    price: number;
    availableBeds: number;
  } | null>(null);

  // Default to the cheapest variant on mount/update
  useEffect(() => {
    if (roomVariants.length > 0) {
      setSelectedVariant(roomVariants[0]);
    } else {
      setSelectedVariant(null);
    }
  }, [roomVariants]);

  const displayedPrice = selectedVariant 
    ? selectedVariant.price 
    : hostel.price;

  const displayedBilling = hostel.pricingType || 'semester';

  // Retrieve room configuration: e.g. "4-in-1" or "Double"
  const roomStyle = (() => {
    if (selectedVariant) {
      return selectedVariant.occupancyStyle;
    }
    if (hostel.rooms && hostel.rooms.length > 0) {
      const firstRoom = hostel.rooms[0];
      return firstRoom.occupancyStyle || 'Single';
    }
    return '1-in-1'; // Default fallback
  })();



  const [activeImageIndex, setActiveImageIndex] = useState(0);

  const [isHovered, setIsHovered] = useState(false);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  const images = hostel.images || [];

  // Auto-rotate index every 5 seconds
  useEffect(() => {
    if (images.length <= 1 || isHovered || isLightboxOpen) {
      return;
    }

    const timer = setInterval(() => {
      setActiveImageIndex((prev) => (prev + 1) % images.length);
    }, 5000);

    return () => clearInterval(timer);
  }, [images.length, isHovered, isLightboxOpen]);

  const handleImageClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setLightboxIndex(activeImageIndex);
    setIsLightboxOpen(true);
  };

  const nextLightboxImage = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setLightboxIndex((prev) => (prev + 1) % images.length);
  };

  const prevLightboxImage = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setLightboxIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  // Keyboard navigation for lightbox
  useEffect(() => {
    if (!isLightboxOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') nextLightboxImage();
      if (e.key === 'ArrowLeft') prevLightboxImage();
      if (e.key === 'Escape') setIsLightboxOpen(false);
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isLightboxOpen, lightboxIndex, images.length]);

  return (
    <div 
      className="group overflow-hidden rounded-3xl bg-white shadow-sm hover:shadow-xl transition-all duration-500 hover:-translate-y-1.5 relative border border-slate-100 flex flex-col h-full"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Image Section (Clicking opens lightbox gallery instead of details page) */}
      <div 
        onClick={handleImageClick}
        className="relative aspect-[4/3] w-full overflow-hidden bg-slate-100 rounded-t-3xl cursor-zoom-in"
      >
        {images.length > 0 ? (
          <img
            src={getOptimizedImageUrl(images[activeImageIndex], 'w_400,h_300,c_fill,q_auto,f_auto')}
            alt={`${hostel.name} - view ${activeImageIndex + 1}`}
            loading="lazy"
            className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-700"
          />
        ) : (
          <div className="h-full w-full flex items-center justify-center text-slate-350 text-xs">
            No Image
          </div>
        )}
        
        {/* Wishlist Button Overlay */}
        <button 
          type="button"
          onClick={handleWishlist}
          className={`absolute top-4 left-4 z-20 h-9 w-9 flex items-center justify-center rounded-full backdrop-blur-md transition-all active:scale-90 ${
            saved ? 'bg-white text-rose-500 shadow-md' : 'bg-black/20 text-white hover:bg-white hover:text-slate-900 shadow-sm'
          }`}
        >
          {saved ? <FaHeart className="text-xs" /> : <FaRegHeart className="text-xs" />}
        </button>

        {/* Price Overlay */}
        <div className="absolute bottom-4 left-4 z-20 rounded-xl bg-black/60 px-3 py-1.5 text-[11px] font-black text-white backdrop-blur-sm shadow-md">
          GHS {displayedPrice} <span className="text-[9px] font-medium text-slate-300">/{displayedBilling || 'semester'}</span>
        </div>


        {/* Image Counter Overlay (1/4 style) */}
        {images.length > 1 && (
          <div className="absolute bottom-4 right-4 z-20 rounded-lg bg-black/55 px-2 py-1 text-[10px] font-black text-white backdrop-blur-sm shadow-md select-none">
            {activeImageIndex + 1} / {images.length}
          </div>
        )}

        {/* Slide Indicator Dots overlay */}
        {images.length > 1 && (
          <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 z-20 flex gap-1 justify-center items-center">
            {images.map((_, idx) => (
              <span 
                key={idx} 
                className={`h-1 rounded-full transition-all duration-300 ${
                  idx === activeImageIndex ? 'w-2.5 bg-white' : 'w-1 bg-white/50'
                }`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Details Section (Wraps entire card body) */}
      <Link href={detailHref} className="block flex-1 flex flex-col justify-between">
        <div className="px-4 py-3 flex-1 flex flex-col justify-between">
          <div>
            {/* Title */}
            <div className="mb-1">
              <h3 className="text-base font-black text-slate-800 line-clamp-1 group-hover:text-blue-600 transition-colors">
                {hostel.name}
              </h3>
            </div>

            {/* Location & University/Proximity */}
            <div className="mb-2.5 flex items-center gap-1.5 text-[11px] font-medium text-slate-500 flex-wrap">
              <span className="truncate text-slate-700 font-bold flex items-center gap-1">
                <FaMapMarkerAlt className="text-slate-400 shrink-0 text-[10px]" />
                {typeof hostel.location === 'object' 
                  ? `${hostel.location.address || hostel.location.city || ''}`
                  : hostel.location}
              </span>
              {proximityText && (
                <>
                  <span className="text-slate-300 select-none">•</span>
                  <span className="truncate text-slate-400 font-medium">{proximityText}</span>
                </>
              )}
            </div>
          </div>

          {/* Room Capacity & Gender Allowed */}
          <div className="flex items-center justify-between border-t border-slate-50 pt-2 text-[10px] font-black uppercase tracking-wider text-slate-500 flex-wrap gap-y-2">
            <div className="flex items-center gap-1.5 flex-wrap">
              {roomVariants.length > 0 ? (
                roomVariants.map((variant) => {
                  const isSelected = selectedVariant?.occupancyStyle === variant.occupancyStyle;
                  return (
                    <button
                      key={variant.occupancyStyle}
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setSelectedVariant(variant);
                      }}
                      className={`px-2 py-1 rounded-lg text-[9px] font-black tracking-wider border transition-all duration-200 active:scale-95 ${
                        isSelected
                          ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                          : 'bg-slate-50 text-slate-600 border-slate-200/60 hover:bg-slate-100 hover:text-slate-900'
                      }`}
                    >
                      {variant.occupancyStyle.toUpperCase()}
                    </button>
                  );
                })
              ) : (
                <span className="bg-slate-50 px-2 py-0.5 rounded text-[9px] font-black text-slate-600 flex items-center gap-1 border border-slate-100/50">
                  <FaBed className="text-slate-400 text-[11px]" /> {roomStyle.toUpperCase()}
                </span>
              )}
            </div>
            <span className={`px-2 py-0.5 rounded text-[9px] font-black tracking-wider border ${
              hostel.genderAllowed === 'Male' ? 'bg-blue-50 text-blue-600 border-blue-100' :
              hostel.genderAllowed === 'Female' ? 'bg-rose-50 text-rose-600 border-rose-100' :
              'bg-emerald-50 text-emerald-600 border-emerald-100'
            }`}>
              {hostel.genderAllowed === 'Male' ? 'Male' :
               hostel.genderAllowed === 'Female' ? 'Female' :
               'Mixed'}
            </span>
          </div>


          {/* Slim Premium Button CTA */}
          <div className="mt-2.5 pt-2 border-t border-slate-50">
            <div className="w-full h-9 rounded-xl bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white text-[11px] font-black tracking-wider uppercase transition-all duration-300 flex items-center justify-center gap-1.5 border border-blue-100/20 shadow-sm shadow-blue-50/10">
              <span>Explore Hostel</span>
              <span className="text-xs font-bold leading-none select-none">&rarr;</span>
            </div>
          </div>
        </div>
      </Link>

      {/* Lightbox Modal overlay */}
      <AnimatePresence>
        {isLightboxOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/95 p-4"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setIsLightboxOpen(false);
            }}
          >
            {/* Close Button */}
            <button 
              type="button"
              className="absolute top-6 right-6 z-[10000] text-3xl text-white/70 hover:text-white transition cursor-pointer p-2"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setIsLightboxOpen(false);
              }}
            >
              <FaTimes />
            </button>

            {/* Left navigation arrow */}
            {images.length > 1 && (
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  prevLightboxImage(e);
                }}
                className="absolute left-6 top-1/2 -translate-y-1/2 z-[10000] flex h-14 w-14 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition cursor-pointer"
              >
                <FaChevronLeft className="text-xl" />
              </button>
            )}

            {/* Main Lightbox Image */}
            <div 
              className="relative max-h-full max-w-full flex items-center justify-center p-4"
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={getOptimizedImageUrl(images[lightboxIndex], 'w_1200,q_auto,f_auto')}
                alt={`${hostel.name} view`}
                className="max-h-[80vh] max-w-full object-contain rounded-2xl shadow-2xl select-none"
              />

              {/* Counter details */}
              <div className="absolute -bottom-12 left-1/2 -translate-x-1/2 text-white/90 font-bold text-sm bg-black/40 px-4 py-1.5 rounded-full backdrop-blur-sm">
                {lightboxIndex + 1} / {images.length}
              </div>
            </div>

            {/* Right navigation arrow */}
            {images.length > 1 && (
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  nextLightboxImage(e);
                }}
                className="absolute right-6 top-1/2 -translate-y-1/2 z-[10000] flex h-14 w-14 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition cursor-pointer"
              >
                <FaChevronRight className="text-xl" />
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
