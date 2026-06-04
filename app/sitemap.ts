import { MetadataRoute } from 'next'
import { getHostels } from '../src/services/hostelService'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://relaxlygh.com'

  // Fetch all hostels for the sitemap
  // We fetch a large limit to ensure we get all approved hostels
  let hostels: any[] = []
  try {
    const response = await getHostels({ limit: 100 })
    hostels = response.hostels || []
  } catch (error) {
    console.error('Sitemap generation error:', error)
  }

  const hostelEntries = hostels.map((hostel) => ({
    url: `${baseUrl}/hostels/${hostel._id}`,
    lastModified: new Date(hostel.updatedAt || new Date()),
    priority: 0.8,
  }))

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/hostels`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/login`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/register`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    ...hostelEntries,
  ]
}
