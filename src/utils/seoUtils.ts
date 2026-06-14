/**
 * Normalizes location names to fix common misspellings and formatting issues.
 * Ensures consistent SEO slugs and page titles.
 */
export const normalizeLocation = (location: any): string => {
  if (!location) return '';
  
  // Handle both string and structured location objects
  const locationString = typeof location === 'object' 
    ? (location.city || location.address || '') 
    : String(location);
  
  const loc = locationString.trim().toLowerCase();
  
  // Mapping of common misspellings/variations to canonical names
  const mapping: Record<string, string> = {
    'east logon': 'East Legon',
    'east-logon': 'East Legon',
    'east legon': 'East Legon',
    'madina accra': 'Madina',
    'madina-accra': 'Madina',
    'upsa': 'Legon',
    'legon-accra': 'Legon',
  };
  
  return mapping[loc] || locationString.trim();
};

/**
 * Utility to generate SEO-friendly slugs from strings.
 */
export const generateSlug = (text: any): string => {
  const normalized = normalizeLocation(text);
  return normalized
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')     // Replace spaces with -
    .replace(/[^\w\-]+/g, '') // Remove all non-word chars
    .replace(/\-\-+/g, '-')   // Replace multiple - with single -
    .replace(/^-+/, '')       // Trim - from start of text
    .replace(/-+$/, '');      // Trim - from end of text
};

/**
 * Generates a hybrid SEO URL for a hostel.
 * Format: [name]-[location]-[id]
 */
export const getHostelSeoUrl = (hostel: { _id: string; name: string; location?: any }): string => {
  const nameSlug = generateSlug(hostel.name);
  const locationSlug = hostel.location ? generateSlug(hostel.location) : '';
  const slugBase = locationSlug ? `${nameSlug}-${locationSlug}` : nameSlug;
  return `/hostels/${slugBase}-${hostel._id}`;
};

/**
 * Extracts the MongoDB ID from a hybrid SEO slug.
 * Matches a 24-character hex string at the end of the slug.
 */
export const extractIdFromSlug = (slug: string): string => {
  // MongoDB IDs are 24-char hex strings
  const matches = slug.match(/[a-f\d]{24}$/i);
  return matches ? matches[0] : slug;
};
