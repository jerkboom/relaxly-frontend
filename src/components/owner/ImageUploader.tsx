'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { FaCloudUploadAlt, FaTimes, FaImage, FaSpinner, FaStar, FaRegStar } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import { uploadImages } from '@/src/services/hostelService';
import { prioritizeFeatured, normalizeImages } from '@/src/utils/imageUtils';
import toast from 'react-hot-toast';

interface ImageUploaderProps {
  onImagesUploaded: (urls: string[]) => void;
  maxImages?: number;
  existingImages?: string[];
}

export default function ImageUploader({ onImagesUploaded, maxImages = 10, existingImages = [] }: ImageUploaderProps) {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  useEffect(() => {
    // Only set previews from existing images on mount or if existing images change significantly
    // and we are not currently in an upload/select state
    if (existingImages.length > 0 && selectedFiles.length === 0) {
      setPreviews(normalizeImages(existingImages));
    }
  }, [existingImages, selectedFiles.length]);

  const handleFiles = useCallback((files: FileList | File[]) => {
    const fileArray = Array.from(files);
    
    // Filter for images only
    const imageFiles = fileArray.filter(file => file.type.startsWith('image/'));
    
    if (imageFiles.length !== fileArray.length) {
      toast.error('Only image files are allowed');
    }

    if (previews.length + imageFiles.length > maxImages) {
      toast.error(`You can only upload up to ${maxImages} images`);
      return;
    }

    const newFiles = [...selectedFiles, ...imageFiles];
    setSelectedFiles(newFiles);

    // Create previews
    const newPreviews = imageFiles.map(file => URL.createObjectURL(file));
    setPreviews(prev => [...prev, ...newPreviews]);
  }, [selectedFiles, previews, maxImages]);

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(true);
  };

  const onDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const removeImage = (index: number) => {
    const newPreviews = [...previews];
    const removedItem = newPreviews.splice(index, 1)[0];
    setPreviews(newPreviews);

    // Notify parent immediately for already uploaded images
    const existingOnly = newPreviews.filter(p => !p.startsWith('blob:'));
    onImagesUploaded(existingOnly);

    if (removedItem.startsWith('blob:')) {
      URL.revokeObjectURL(removedItem);
      // We'd ideally need to remove from selectedFiles too, but without a map
      // it's safer to just let the user re-upload what's left or just handle it on submit.
      // For now, if they remove a blob, we'll just clear the selected files to be safe
      // or implement a better mapping. Let's keep it simple: clearing blobs clears current selection.
      setSelectedFiles([]);
      toast('Current selection cleared. Please re-select if needed.');
    }
  };

  const setAsFeatured = (index: number) => {
    if (index === 0) return;
    const newPreviews = [...previews];
    const [featured] = newPreviews.splice(index, 1);
    newPreviews.unshift(featured);
    setPreviews(newPreviews);
    
    // Only notify parent if they are all uploaded images
    const allUploaded = newPreviews.every(p => !p.startsWith('blob:'));
    if (allUploaded) {
      onImagesUploaded(newPreviews);
    }
    toast.success('Main image updated');
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) return;

    setUploading(true);
    const formData = new FormData();
    selectedFiles.forEach(file => {
      formData.append('images', file);
    });

    try {
      const data = await uploadImages(formData);
      // Combine existing images (that are not blobs) with new ones
      const existingUrls = previews.filter(p => !p.startsWith('blob:'));
      const allImages = [...existingUrls, ...data.images];
      
      onImagesUploaded(allImages);
      setPreviews(allImages);
      setSelectedFiles([]);
      toast.success('Images uploaded successfully');
    } catch (error: any) {
      console.error('Upload failed:', error);
      toast.error(error.response?.data?.message || 'Failed to upload images');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        className={`relative flex flex-col items-center justify-center rounded-[2.5rem] border-4 border-dashed py-12 text-center transition-all ${
          dragActive ? 'border-blue-500 bg-blue-50' : 'border-slate-100 hover:border-blue-200'
        }`}
      >
        <input
          type="file"
          multiple
          accept="image/*"
          onChange={(e) => e.target.files && handleFiles(e.target.files)}
          className="absolute inset-0 cursor-pointer opacity-0"
          disabled={uploading}
        />
        
        <div className={`mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-blue-50 text-3xl text-blue-600 ${dragActive ? 'scale-110' : ''} transition-transform`}>
          <FaCloudUploadAlt />
        </div>
        <h3 className="text-xl font-bold text-slate-900">
          {dragActive ? 'Drop images here' : 'Drag & drop images'}
        </h3>
        <p className="mt-2 text-slate-500">or click to browse from your device</p>
        <p className="mt-1 text-xs text-slate-400">Supported: JPG, PNG, WEBP (Max {maxImages} images)</p>
      </div>

      {previews.length > 0 && (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-5">
          <AnimatePresence>
            {previews.map((preview, index) => (
              <motion.div
                key={preview}
                layout
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className={`group relative aspect-square overflow-hidden rounded-2xl bg-slate-100 ring-4 transition-all ${
                  index === 0 ? 'ring-blue-600' : 'ring-transparent'
                }`}
              >
                <img src={preview} alt="Preview" className="h-full w-full object-cover" />
                
                {index === 0 && (
                  <div className="absolute top-2 left-2 z-10 flex items-center gap-1 rounded-full bg-blue-600 px-2 py-1 text-[10px] font-bold text-white shadow-lg">
                    <FaStar className="text-yellow-300" />
                    <span>MAIN</span>
                  </div>
                )}

                {preview.startsWith('blob:') && (
                  <div className="absolute top-2 right-2 z-10 rounded-full bg-amber-500 px-2 py-1 text-[8px] font-black text-white shadow-lg">
                    PENDING UPLOAD
                  </div>
                )}

                <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
                  <div className="flex gap-2">
                    {index !== 0 && (
                      <button
                        type="button"
                        onClick={(e) => { e.preventDefault(); setAsFeatured(index); }}
                        className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-blue-600 transition hover:scale-110"
                        title="Set as main image"
                      >
                        <FaRegStar />
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={(e) => { e.preventDefault(); removeImage(index); }}
                      className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-red-500 transition hover:scale-110"
                      title="Remove image"
                    >
                      <FaTimes />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {selectedFiles.length > 0 && (
        <div className="flex justify-center">
          <button
            type="button"
            onClick={handleUpload}
            disabled={uploading}
            className="flex items-center gap-2 rounded-2xl bg-blue-600 px-8 py-4 font-black text-white shadow-lg shadow-blue-500/30 transition hover:bg-blue-700 hover:scale-105 active:scale-95 disabled:opacity-70 disabled:hover:scale-100"
          >
            {uploading ? <FaSpinner className="animate-spin" /> : <FaCloudUploadAlt />}
            <span>{uploading ? 'Processing...' : `Upload ${selectedFiles.length} New Images`}</span>
          </button>
        </div>
      )}
    </div>
  );
}
