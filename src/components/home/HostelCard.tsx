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
 * - Interaction: Clicking the card or button navigates to the detailed view.
 * - Features: Inline image gallery for quick preview.
 *
 * ==================================================
 */

import Link from 'next/link';
import {
  FaBed,
  FaMapMarkerAlt,
  FaShieldAlt,
  FaWifi,
} from 'react-icons/fa';

import { Hostel } from '../../types';
import ImageGallery from '../common/ImageGallery';
import { getHostelSeoUrl } from '../../utils/seoUtils';

interface Props {
  hostel: Hostel;
}

export default function HostelCard({
  hostel,
}: Props) {
  const detailHref = getHostelSeoUrl(hostel);

  return (
    <div className="group overflow-hidden rounded-3xl bg-white shadow-lg transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl">
      {/* Clickable Area for Image and Info */}
      <Link href={detailHref} className="block">
        <div className="relative h-64 overflow-hidden bg-slate-100">
          <ImageGallery 
            images={hostel.images || []} 
            alt={hostel.name} 
            showThumbnails={false}
            height="h-full"
            className="h-full"
          />
          {/* 
            Transparent overlay with z-[2] to intercept clicks from the gallery's internal lightbox logic (which is z-1).
            This ensures clicking the image navigates to details page as requested.
            Gallery arrows have z-10, so they remain interactive.
          */}
          <div className="absolute inset-0 z-[2]" />
          
          <div className="absolute top-4 right-4 z-20 rounded-2xl bg-white/95 px-4 py-2 text-sm font-black text-blue-600 shadow-sm backdrop-blur-sm">
            GHS {hostel.price}
          </div>
        </div>

        <div className="p-6 pb-2">
          <h3 className="mb-2 text-2xl font-black text-slate-900 truncate group-hover:text-blue-600 transition-colors">
            {hostel.name}
          </h3>

          <div className="mb-4 flex items-center gap-2 text-sm font-medium text-slate-500">
            <FaMapMarkerAlt className="text-blue-600 shrink-0" />
            <span className="truncate">{hostel.location}</span>
          </div>

          <div className="mb-6 flex flex-wrap gap-2">
            {hostel.wifi && (
              <div className="flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1 text-[10px] font-bold text-blue-600 uppercase">
                <FaWifi />
                <span>WiFi</span>
              </div>
            )}
            {hostel.security && (
              <div className="flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-[10px] font-bold text-emerald-600 uppercase">
                <FaShieldAlt />
                <span>Secure</span>
              </div>
            )}
            <div className="flex items-center gap-1.5 rounded-full bg-slate-50 px-3 py-1 text-[10px] font-bold text-slate-600 uppercase">
              <FaBed />
              <span>{hostel.totalRooms} Rooms</span>
            </div>
          </div>
        </div>
      </Link>

      {/* Button Area */}
      <div className="px-6 pb-6">
        <Link href={detailHref}>
          <button className="w-full rounded-2xl bg-slate-900 py-4 font-black text-white transition-all hover:bg-blue-600 hover:shadow-lg active:scale-[0.98]">
            Explore Hostel
          </button>
        </Link>
      </div>
    </div>
  );
}
