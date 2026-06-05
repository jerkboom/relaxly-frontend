import { MetadataRoute } from 'next'
import { generateSlug, getHostelSeoUrl } from '../src/utils/seoUtils'

/**
 * Relaxly Enterprise Sitemap Generator
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://relaxlygh.com'
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://api.relaxlygh.com/api'

  let hostels: { _id: string; name: string; location: string; updatedAt?: string }[] = []
  let universities: { _id: string; name: string }[] = []
  
  try {
    // Fetch Hostels and Universities in parallel
    const [hostelsRes, universitiesRes] = await Promise.all([
      fetch(`${apiUrl}/hostels?limit=100`, { next: { revalidate: 3600 } }),
      fetch(`${apiUrl}/universities`, { next: { revalidate: 3600 } })
    ])

    if (hostelsRes.ok) {
      const json = await hostelsRes.json()
      const data = json.data || json
      hostels = data.hostels || data.results || (Array.isArray(data) ? data : [])
    }

    if (universitiesRes.ok) {
      const json = await universitiesRes.json()
      universities = json.data || json || []
    }
  } catch (error) {
    console.error('Sitemap dynamic fetch failed:', error)
  }

  // 1. Hostel Detail Pages (SEO-friendly slugs)
  const hostelEntries: MetadataRoute.Sitemap = hostels.map((hostel) => ({
    url: `${baseUrl}${getHostelSeoUrl(hostel)}`,
    lastModified: hostel.updatedAt ? new Date(hostel.updatedAt) : new Date(),
    changeFrequency: 'weekly',
    priority: 0.8,
  }))

  // 2. Dynamic Location Pages (Extracted from hostel data)
  // Using generateSlug here ensures that normalized locations (e.g. East Logon -> east-legon)
  // are consolidated and unique.
  const uniqueLocationSlugs = Array.from(new Set(hostels.map((h) => generateSlug(h.location)).filter(Boolean)))
  const locationEntries: MetadataRoute.Sitemap = uniqueLocationSlugs.map((slug) => ({
    url: `${baseUrl}/hostels/location/${slug}`,
    lastModified: new Date(),
    changeFrequency: 'daily',
    priority: 0.7,
  }))

  // 3. University Pages
  const universityEntries: MetadataRoute.Sitemap = universities.map((uni) => ({
    url: `${baseUrl}/universities/${generateSlug(uni.name)}`,
    lastModified: new Date(),
    changeFrequency: 'daily',
    priority: 0.7,
  }))

  // 4. Static Core Pages
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

  return [
    ...staticPages,
    ...locationEntries,
    ...universityEntries,
    ...hostelEntries
  ]
}
