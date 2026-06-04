import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: 'https://relaxlygh.com',
      lastModified: new Date(),
      priority: 1,
    },
    {
      url: 'https://relaxlygh.com/hostels',
      lastModified: new Date(),
      priority: 0.9,
    },
    {
      url: 'https://relaxlygh.com/login',
      lastModified: new Date(),
      priority: 0.7,
    },
    {
      url: 'https://relaxlygh.com/register',
      lastModified: new Date(),
      priority: 0.7,
    },
  ]
}
