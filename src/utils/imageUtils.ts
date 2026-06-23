export const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?q=80&w=1200&auto=format&fit=crop';
export const PLACEHOLDER_IMAGE = 'https://placehold.co/600x400/e2e8f0/64748b?text=Image+Unavailable';

/**
 * Normalizes image inputs into a clean array of unique URLs
 */
export const normalizeImages = (images: any): string[] => {
  if (!images) return [];
  
  let normalized: string[] = [];
  
  // Handle arrays, potentially nested or containing comma-separated strings
  if (Array.isArray(images)) {
    normalized = images
      .flat(2) // Handle minor nesting
      .flatMap((img) => (typeof img === 'string' ? img.split(',') : img))
      .filter(Boolean)
      .map((s) => (typeof s === 'string' ? s.trim() : String(s)));
  } else if (typeof images === 'string') {
    normalized = images.split(',').map((s) => s.trim()).filter(Boolean);
  } else if (images && typeof images === 'object') {
    // If it's a single image object from some APIs
    const url = images.url || images.uri || images.src;
    if (url) normalized = [url];
  }

  // Final cleaning: absolute URLs/blobs/paths only, unique items
  const uniqueImages = Array.from(new Set(normalized)).filter(img => 
    typeof img === 'string' && (
      img.startsWith('http') || 
      img.startsWith('/') || 
      img.startsWith('blob:') || 
      img.startsWith('data:')
    )
  );

  return uniqueImages.length > 0 ? uniqueImages : [FALLBACK_IMAGE];
};

/**
 * Gets a single representative image for a hostel or room
 */
export const getFeaturedImage = (images: any, featuredImage?: string): string => {
  const normalized = normalizeImages(images);
  
  if (featuredImage && normalized.includes(featuredImage)) {
    return featuredImage;
  }
  
  return normalized[0] || FALLBACK_IMAGE;
};

/**
 * Sorts images so the featured one is first, preserving original order for the rest
 */
export const prioritizeFeatured = (images: any, featuredImage?: string): string[] => {
  const normalized = normalizeImages(images);
  if (!featuredImage || !normalized.includes(featuredImage)) return normalized;

  const otherImages = normalized.filter(img => img !== featuredImage);
  return [featuredImage, ...otherImages];
};

/**
 * Safely resolves an image URL with a fallback
 */
export const safeImage = (url?: string): string => {
  if (!url) return FALLBACK_IMAGE;
  if (url.startsWith('http') || url.startsWith('/') || url.startsWith('blob:') || url.startsWith('data:')) {
    return url;
  }
  return FALLBACK_IMAGE;
};

/**
 * Dynamically injects Cloudinary transformation parameters into image URLs.
 * Safely ignores local static paths, vector icons, blobs, and external fallbacks (like Unsplash/Google).
 */
export const getOptimizedImageUrl = (url: string | undefined, transformations: string): string => {
  if (!url) return FALLBACK_IMAGE;
  
  // Only modify Cloudinary URLs
  if (url.includes('res.cloudinary.com') && url.includes('/upload/')) {
    return url.replace('/upload/', `/upload/${transformations}/`);
  }
  
  return url;
};
