import { Metadata } from 'next';
import HostelDetailsClient from './HostelDetailsClient';
import { getSingleHostel, getHostelRooms, getHostels } from '../../../src/services/hostelService';
import { extractIdFromSlug, getHostelSeoUrl } from '../../../src/utils/seoUtils';
import { Hostel } from '../../../src/types';

interface PageProps {
  params: Promise<{ id: string }>;
}

/**
 * Generate Dynamic Metadata for individual hostel pages.
 */
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id: slugId } = await params;
  const id = extractIdFromSlug(slugId);
  
  try {
    const hostel = await getSingleHostel(id);
    
    if (!hostel) {
      return {
        title: 'Hostel Not Found | Relaxly',
        description: 'The requested hostel could not be found on Relaxly.',
      };
    }

    const title = `${hostel.name} in ${hostel.location} | Student Accommodation | Relaxly`;
    const description = `Book ${hostel.name} in ${hostel.location}. Verified student accommodation with WiFi, security, water and electricity. Compare rooms and reserve online.`;
    const image = hostel.displayImage || (hostel.images && hostel.images[0]);
    const seoUrl = getHostelSeoUrl(hostel);

    return {
      title,
      description,
      keywords: [`${hostel.name}`, `${hostel.location} hostel`, "student hostel", "Ghana accommodation"],
      alternates: {
        canonical: seoUrl,
      },
      openGraph: {
        title,
        description,
        url: `https://relaxlygh.com${seoUrl}`,
        siteName: 'Relaxly',
        images: image ? [{ url: image, width: 1200, height: 630, alt: hostel.name }] : [],
        type: 'website',
      },
      twitter: {
        card: 'summary_large_image',
        title,
        description,
        images: image ? [image] : [],
      },
    };
  } catch {
    return {
      title: 'Hostel Details | Relaxly',
    };
  }
}

/**
 * Server Component for Hostel Details Page.
 */
export default async function Page({ params }: PageProps) {
  const { id: slugId } = await params;
  const id = extractIdFromSlug(slugId);
  
  let hostel: any = null;
  let rooms: any[] = [];
  let relatedHostels: Hostel[] = [];

  try {
    const [hostelData, roomsData, allHostelsData] = await Promise.all([
      getSingleHostel(id),
      getHostelRooms(id),
      getHostels({ limit: 100 }),
    ]);
    
    hostel = hostelData;
    rooms = roomsData?.rooms || roomsData || [];
    
    // Simple related hostels logic: same location, excluding current hostel
    if (hostel) {
      relatedHostels = (allHostelsData.hostels || [])
        .filter((h: Hostel) => h.location === hostel.location && h._id !== id)
        .slice(0, 3);
    }
  } catch (error) {
    console.error('Error fetching hostel data on server:', error);
  }

  // Structured Data (JSON-LD)
  const lodgingBusinessJsonLd = hostel ? {
    '@context': 'https://schema.org',
    '@type': 'LodgingBusiness',
    'name': hostel.name,
    'description': hostel.description,
    'image': hostel.images,
    'url': `https://relaxlygh.com${getHostelSeoUrl(hostel)}`,
    'address': {
      '@type': 'PostalAddress',
      'addressLocality': hostel.location,
      'addressCountry': 'GH',
    },
    'priceRange': `GHS ${hostel.price}`,
    'amenityFeature': [
      { '@type': 'LocationFeatureSpecification', 'name': 'WiFi', 'value': hostel.wifi },
      { '@type': 'LocationFeatureSpecification', 'name': 'Air Conditioning', 'value': hostel.ac },
      { '@type': 'LocationFeatureSpecification', 'name': 'Security', 'value': hostel.security },
      { '@type': 'LocationFeatureSpecification', 'name': 'Water', 'value': hostel.water },
      { '@type': 'LocationFeatureSpecification', 'name': 'Electricity', 'value': hostel.electricity },
    ],
  } : null;

  const breadcrumbJsonLd = hostel ? {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    'itemListElement': [
      {
        '@type': 'ListItem',
        'position': 1,
        'name': 'Home',
        'item': 'https://relaxlygh.com'
      },
      {
        '@type': 'ListItem',
        'position': 2,
        'name': 'Hostels',
        'item': 'https://relaxlygh.com/hostels'
      },
      {
        '@type': 'ListItem',
        'position': 3,
        'name': hostel.location,
        'item': `https://relaxlygh.com/hostels/location/${hostel.location.toLowerCase().replace(/\s+/g, '-')}`
      },
      {
        '@type': 'ListItem',
        'position': 4,
        'name': hostel.name,
        'item': `https://relaxlygh.com${getHostelSeoUrl(hostel)}`
      }
    ]
  } : null;

  return (
    <>
      {lodgingBusinessJsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(lodgingBusinessJsonLd) }}
        />
      )}
      {breadcrumbJsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
        />
      )}
      <HostelDetailsClient 
        id={id} 
        initialHostel={hostel} 
        initialRooms={rooms} 
        relatedHostels={relatedHostels}
      />
    </>
  );
}
