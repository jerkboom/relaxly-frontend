import { MetadataRoute } from 'next'

/**
 * Relaxly Sitemap Generator
 * 
 * This file generates the sitemap dynamically by fetching approved hostels
 * directly from the API. We use a standard 'fetch' here instead of the 
 * internal 'hostelService' to ensure server-side compatibility and avoid 
 * client-side dependencies like 'window', 'localStorage', or 'zustand' stores
 * which are imported by the default axios instance.
 */

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://relaxlygh.com'
  
  // Use the environment variable for the API URL, falling back to the known production API if necessary
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://api.relaxlygh.com/api'

  let hostels: any[] = []
  
  try {
    // Fetch hostels with a high limit to ensure all are included
    // We use a revalidate tag to ensure the sitemap isn't stale for too long
    const res = await fetch(`${apiUrl}/hostels?limit=100`, {
      next: { revalidate: 3600 } // Cache for 1 hour
    })

    if (res.ok) {
      const json = await res.json()
      
      // Extraction logic mirrored from hostelService.ts to handle various API response formats
      const data = json.data || json
      
      if (data.hostels && Array.isArray(data.hostels)) {
        hostels = data.hostels
      } else if (Array.isArray(data)) {
        hostels = data
      } else if (data.results && Array.isArray(data.results)) {
        hostels = data.results
      }
    }
  } catch (error) {
    // Fail gracefully by returning at least the static pages
    console.error('Sitemap dynamic fetch failed:', error)
  }

  // Map hostels to sitemap entries
  const hostelEntries: MetadataRoute.Sitemap = hostels.map((hostel: any) => ({
    url: `${baseUrl}/hostels/${hostel._id}`,
    lastModified: hostel.updatedAt ? new Date(hostel.updatedAt) : new Date(),
    changeFrequency: 'weekly',
    priority: 0.8,
  }))

  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/hostels`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
  ]

  return [...staticPages, ...hostelEntries]
}
