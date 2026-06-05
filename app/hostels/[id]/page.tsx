import { Metadata } from 'next';
import HostelDetailsClient from './HostelDetailsClient';
import { getSingleHostel, getHostelRooms } from '../../../src/services/hostelService';

interface PageProps {
  params: Promise<{ id: string }>;
}

/**
 * Generate Dynamic Metadata for individual hostel pages.
 * This ensures each hostel has a unique title and description for SEO.
 */
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  
  try {
    const hostel = await getSingleHostel(id);
    
    if (!hostel) {
      return {
        title: 'Hostel Not Found | Relaxly',
        description: 'The requested hostel could not be found on Relaxly.',
      };
    }

    const title = `${hostel.name} | ${hostel.location} Hostel Booking | Relaxly`;
    const description = `Book ${hostel.name} in ${hostel.location} through Relaxly. Verified accommodation, secure payments and student-friendly rooms. ${hostel.description?.substring(0, 100)}...`;
    const image = hostel.displayImage || (hostel.images && hostel.images[0]);

    return {
      title,
      description,
      openGraph: {
        title,
        description,
        url: `https://relaxlygh.com/hostels/${id}`,
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
 * Fetches data on the server for SEO and initial rendering speed.
 */
export default async function Page({ params }: PageProps) {
  const { id } = await params;
  
  let hostel = null;
  let rooms = [];

  try {
    // Fetch data in parallel on the server
    const [hostelData, roomsData] = await Promise.all([
      getSingleHostel(id),
      getHostelRooms(id),
    ]);
    
    hostel = hostelData;
    rooms = roomsData?.rooms || roomsData || [];
  } catch (error) {
    console.error('Error fetching hostel data on server:', error);
  }

  // Structured Data (JSON-LD) for LodgingBusiness
  const jsonLd = hostel ? {
    '@context': 'https://schema.org',
    '@type': 'LodgingBusiness',
    'name': hostel.name,
    'description': hostel.description,
    'image': hostel.images,
    'url': `https://relaxlygh.com/hostels/${id}`,
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
    ],
  } : null;

  return (
    <>
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}
      <HostelDetailsClient 
        id={id} 
        initialHostel={hostel} 
        initialRooms={rooms} 
      />
    </>
  );
}
