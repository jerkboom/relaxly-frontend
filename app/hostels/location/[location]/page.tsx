import { Metadata } from 'next';
import Link from 'next/link';
import { FaMapMarkerAlt, FaArrowLeft, FaBed } from 'react-icons/fa';
import { getHostels } from '../../../../src/services/hostelService';
import HostelCard from '../../../../src/components/home/HostelCard';
import { generateSlug, normalizeLocation } from '../../../../src/utils/seoUtils';
import { Hostel } from '../../../../src/types';

interface PageProps {
  params: Promise<{ location: string }>;
}

/**
 * Generate Dynamic Metadata for location-specific hostel pages.
 */
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { location: slug } = await params;
  
  // Try to make the slug look like a title (e.g., 'east-legon' -> 'East Legon')
  const locationName = slug
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

  const title = `Student Hostels in ${locationName} | Accommodation in Ghana | Relaxly`;
  const description = `Find and book the best student hostels in ${locationName}, Ghana. Verified accommodation with WiFi, security, and more. Browse listings in ${locationName} and reserve your room today.`;

  return {
    title,
    description,
    keywords: [`hostels in ${locationName}`, `${locationName} accommodation`, "student housing Ghana"],
    alternates: {
      canonical: `https://relaxlygh.com/hostels/location/${slug}`,
    },
    openGraph: {
      title,
      description,
      url: `https://relaxlygh.com/hostels/location/${slug}`,
      siteName: 'Relaxly',
      type: 'website',
    },
  };
}

/**
 * Server Component for Location-specific Hostels.
 */
export default async function LocationPage({ params }: PageProps) {
  const { location: slug } = await params;
  
  // Extract hostels for this location
  const response = await getHostels({ limit: 100 });
  const hostels: Hostel[] = response.hostels || [];
  
  // Filter hostels by slugified location to match the URL
  // We use normalizeLocation to ensure that even if the data has 'East Logon', 
  // it matches the 'east-legon' slug.
  const filteredHostels = hostels.filter(
    (hostel: Hostel) => generateSlug(hostel.location) === slug
  );

  const locationName = filteredHostels.length > 0 
    ? normalizeLocation(filteredHostels[0].location)
    : slug.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');

  // Breadcrumb Schema
  const breadcrumbJsonLd = {
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
        'name': locationName,
        'item': `https://relaxlygh.com/hostels/location/${slug}`
      }
    ]
  };

  return (
    <main className="min-h-screen bg-slate-50 py-12">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      
      <div className="mx-auto max-w-7xl px-4 md:px-6 lg:px-8">
        {/* Header Section */}
        <div className="mb-12">
          <Link 
            href="/hostels" 
            className="mb-6 inline-flex items-center gap-2 text-sm font-bold text-slate-500 transition hover:text-blue-600"
          >
            <FaArrowLeft />
            Back to all Hostels
          </Link>
          
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
            <div>
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-lg shadow-blue-200">
                  <FaMapMarkerAlt className="text-xl" />
                </div>
                <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight">
                  Hostels in <span className="text-blue-600">{locationName}</span>
                </h1>
              </div>
              <p className="text-lg text-slate-600 font-medium max-w-2xl">
                Discover {filteredHostels.length} verified student accommodations in the {locationName} area. 
                Find your perfect home near campus with all the amenities you need.
              </p>
            </div>
            
            <div className="rounded-2xl bg-white px-6 py-4 shadow-sm border border-slate-100">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Available Listings</p>
              <div className="flex items-center gap-2">
                <FaBed className="text-blue-600" />
                <span className="text-2xl font-black text-slate-900">{filteredHostels.length}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Listings Grid */}
        {filteredHostels.length > 0 ? (
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {filteredHostels.map((hostel: Hostel) => (
              <HostelCard key={hostel._id} hostel={hostel} />
            ))}
          </div>
        ) : (
          <div className="rounded-[3rem] bg-white p-20 text-center shadow-xl border border-slate-100">
            <div className="mx-auto mb-8 flex h-24 w-24 items-center justify-center rounded-full bg-slate-50 text-4xl text-slate-200">
              <FaMapMarkerAlt />
            </div>
            <h2 className="text-3xl font-black text-slate-900">No Hostels Found</h2>
            <p className="mt-4 text-lg text-slate-500 font-medium">
              We couldn&apos;t find any hostels in {locationName} at the moment.
            </p>
            <Link 
              href="/hostels" 
              className="mt-8 inline-block rounded-2xl bg-blue-600 px-8 py-4 font-bold text-white transition hover:scale-105 shadow-lg shadow-blue-200"
            >
              Browse All Locations
            </Link>
          </div>
        )}
      </div>
    </main>
  );
}
