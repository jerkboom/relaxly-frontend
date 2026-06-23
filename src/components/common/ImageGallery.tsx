'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { FaChevronLeft, FaChevronRight, FaExpand, FaTimes } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import { prioritizeFeatured, FALLBACK_IMAGE, safeImage, getOptimizedImageUrl } from '@/src/utils/imageUtils';

interface ImageGalleryProps {
  images: string[] | any;
  alt: string;
  showThumbnails?: boolean;
  className?: string;
  height?: string;
  featuredImage?: string;
  layout?: 'carousel' | 'grid';
}

export default function ImageGallery({ 
  images = [], 
  alt, 
  showThumbnails = true,
  className = "",
  height = "h-[300px] md:h-[450px] lg:h-[550px]",
  featuredImage,
  layout = 'grid'
}: ImageGalleryProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  // Avoid hydration mismatch
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Normalize and prioritize images
  const displayImages = useMemo(() => {
    const imgs = prioritizeFeatured(images, featuredImage);
    return imgs.length > 0 ? imgs : [FALLBACK_IMAGE];
  }, [images, featuredImage]);

  const nextImage = useCallback((e?: React.MouseEvent | any) => {
    e?.stopPropagation();
    setDirection(1);
    setCurrentIndex((prev) => (prev + 1) % displayImages.length);
  }, [displayImages.length]);

  const prevImage = useCallback((e?: React.MouseEvent | any) => {
    e?.stopPropagation();
    setDirection(-1);
    setCurrentIndex((prev) => (prev - 1 + displayImages.length) % displayImages.length);
  }, [displayImages.length]);

  const selectImage = (index: number) => {
    setDirection(index > currentIndex ? 1 : -1);
    setCurrentIndex(index);
  };

  const variants = {
    enter: (direction: number) => ({
      x: direction > 0 ? '100%' : '-100%',
      opacity: 0
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1
    },
    exit: (direction: number) => ({
      zIndex: 0,
      x: direction < 0 ? '100%' : '-100%',
      opacity: 0
    })
  };

  const swipeConfidenceThreshold = 10000;
  const swipePower = (offset: number, velocity: number) => {
    return Math.abs(offset) * velocity;
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isLightboxOpen) {
        if (e.key === 'ArrowRight') nextImage();
        if (e.key === 'ArrowLeft') prevImage();
        if (e.key === 'Escape') setIsLightboxOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isLightboxOpen, nextImage, prevImage]);

  if (!isMounted) return <div className={`${height} rounded-[2rem] bg-slate-100 animate-pulse`} />;

  return (
    <div className={`space-y-6 ${className}`}>
      {/* DESKTOP GRID LAYOUT */}
      {layout === 'grid' && (
        <div className={`hidden lg:grid grid-cols-4 gap-4 ${height} overflow-hidden rounded-[3rem] shadow-2xl bg-slate-100`}>
          {/* Main Image (75% width) */}
          <div 
            className="col-span-3 relative h-full group cursor-zoom-in overflow-hidden"
            onClick={() => setIsLightboxOpen(true)}
          >
            <img
              src={getOptimizedImageUrl(safeImage(displayImages[0]), 'w_1200,q_auto,f_auto')}
              alt={`${alt} - Main`}
              className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
              onError={(e) => { (e.target as HTMLImageElement).src = FALLBACK_IMAGE; }}
            />
            <div className="absolute inset-0 bg-black/0 transition-colors group-hover:bg-black/10" />
          </div>

          {/* Side Images (25% width) */}
          <div className="col-span-1 grid grid-rows-2 gap-4 h-full">
            {[1, 2].map((idx) => (
              <div 
                key={idx}
                className="relative h-full group cursor-zoom-in overflow-hidden bg-slate-200"
                onClick={() => {
                  setCurrentIndex(idx % displayImages.length);
                  setIsLightboxOpen(true);
                }}
              >
                <img
                  src={getOptimizedImageUrl(safeImage(displayImages[idx % displayImages.length] || displayImages[0]), 'w_600,h_400,c_fill,q_auto,f_auto')}
                  alt={`${alt} - ${idx}`}
                  loading="lazy"
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                  onError={(e) => { (e.target as HTMLImageElement).src = FALLBACK_IMAGE; }}
                />
                <div className="absolute inset-0 bg-black/0 transition-colors group-hover:bg-black/10" />
                {idx === 2 && displayImages.length > 3 && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-[2px]">
                    <span className="text-2xl font-black text-white">+{displayImages.length - 3}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MOBILE CAROUSEL LAYOUT */}
      <div 
        className={`group relative w-full overflow-hidden rounded-[2rem] md:rounded-[3rem] shadow-2xl ${height} bg-slate-100 ${layout === 'grid' ? 'lg:hidden' : ''}`}
      >
        <AnimatePresence initial={false} custom={direction} mode="popLayout">
          <motion.img
            key={currentIndex}
            src={getOptimizedImageUrl(safeImage(displayImages[currentIndex]), 'w_1200,q_auto,f_auto')}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{
              x: { type: "spring", stiffness: 300, damping: 30 },
              opacity: { duration: 0.2 }
            }}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={1}
            onDragEnd={(e, { offset, velocity }) => {
              const swipe = swipePower(offset.x, velocity.x);

              if (swipe < -swipeConfidenceThreshold) {
                nextImage();
              } else if (swipe > swipeConfidenceThreshold) {
                prevImage();
              }
            }}
            alt={`${alt} - Image ${currentIndex + 1}`}
            className="absolute inset-0 h-full w-full cursor-zoom-in object-cover touch-none"
            onClick={() => setIsLightboxOpen(true)}
            onError={(e) => { (e.target as HTMLImageElement).src = FALLBACK_IMAGE; }}
          />
        </AnimatePresence>

        {/* Navigation Arrows */}
        {displayImages.length > 1 && (
          <>
            <button
              onClick={prevImage}
              className="absolute left-4 top-1/2 z-10 hidden h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/30 text-white backdrop-blur-md transition-all hover:bg-white/50 hover:text-slate-900 md:flex md:opacity-0 md:group-hover:opacity-100"
            >
              <FaChevronLeft className="text-xl" />
            </button>
            <button
              onClick={nextImage}
              className="absolute right-4 top-1/2 z-10 hidden h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/30 text-white backdrop-blur-md transition-all hover:bg-white/50 hover:text-slate-900 md:flex md:opacity-0 md:group-hover:opacity-100"
            >
              <FaChevronRight className="text-xl" />
            </button>
          </>
        )}

        {/* Counter & Expand */}
        <div className="absolute bottom-6 right-6 flex items-center gap-3">
          <div className="rounded-2xl bg-black/40 px-4 py-2 text-sm font-black text-white backdrop-blur-md">
            {currentIndex + 1} / {displayImages.length}
          </div>
          <button 
            onClick={() => setIsLightboxOpen(true)}
            className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/20 text-white backdrop-blur-md transition hover:bg-white/40"
          >
            <FaExpand />
          </button>
        </div>
      </div>

      {/* Thumbnails */}
      {showThumbnails && displayImages.length > 1 && (
        <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
          {displayImages.map((img, idx) => (
            <button
              key={`${img}-${idx}`}
              onClick={() => selectImage(idx)}
              className={`relative h-20 w-32 shrink-0 overflow-hidden rounded-2xl border-4 transition-all duration-300 ${
                currentIndex === idx ? 'border-blue-600 scale-105 shadow-lg z-10' : 'border-transparent opacity-60 hover:opacity-100'
              }`}
            >
              <img 
                src={getOptimizedImageUrl(safeImage(img), 'w_150,h_100,c_fill,q_auto,f_auto')} 
                alt={`Thumbnail ${idx + 1}`} 
                loading="lazy"
                className="h-full w-full object-cover" 
                onError={(e) => { (e.target as HTMLImageElement).src = FALLBACK_IMAGE; }} 
              />
            </button>
          ))}
        </div>
      )}

      {/* Lightbox Modal */}
      <AnimatePresence>
        {isLightboxOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 p-4 md:p-10"
            onClick={() => setIsLightboxOpen(false)}
          >
            <button 
              className="absolute top-8 right-8 z-[110] text-3xl text-white/70 transition hover:text-white"
              onClick={() => setIsLightboxOpen(false)}
            >
              <FaTimes />
            </button>

            <div className="relative h-full w-full max-w-7xl flex items-center justify-center" onClick={(e) => e.stopPropagation()}>
              <motion.img
                key={`lightbox-${currentIndex}`}
                src={getOptimizedImageUrl(safeImage(displayImages[currentIndex]), 'w_1200,q_auto,f_auto')}
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="max-h-full max-w-full object-contain shadow-2xl"
                onError={(e) => { (e.target as HTMLImageElement).src = FALLBACK_IMAGE; }}
                drag="x"
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={1}
                onDragEnd={(e, { offset, velocity }) => {
                  const swipe = swipePower(offset.x, velocity.x);

                  if (swipe < -swipeConfidenceThreshold) {
                    nextImage();
                  } else if (swipe > swipeConfidenceThreshold) {
                    prevImage();
                  }
                }}
              />

              {displayImages.length > 1 && (
                <>
                  <button
                    onClick={prevImage}
                    className="absolute left-4 top-1/2 z-10 flex h-16 w-16 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20"
                  >
                    <FaChevronLeft className="text-3xl" />
                  </button>
                  <button
                    onClick={nextImage}
                    className="absolute right-4 top-1/2 z-10 flex h-16 w-16 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20"
                  >
                    <FaChevronRight className="text-3xl" />
                  </button>
                </>
              )}

              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-black/50 px-6 py-2 text-white font-black">
                {currentIndex + 1} / {displayImages.length}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
