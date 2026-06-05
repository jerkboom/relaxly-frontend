import { Metadata } from 'next';
import Link from 'next/link';
import { FaUniversity, FaArrowLeft, FaBed } from 'react-icons/fa';
import { getHostels } from '../../../src/services/hostelService';
import { getUniversities } from '../../../src/services/universityService';
import HostelCard from '../../../src/components/home/HostelCard';
import { generateSlug } from '../../../src/utils/seoUtils';
import { University } from '../../../src/types';

interface PageProps {
  params: Promise<{ slug: string }>;
}

/**
 * Generate Dynamic Metadata for university-specific pages.
 */
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  
  // Fetch universities to find the matching one
  const universitiesData = await getUniversities();
  const universities: University[] = universitiesData?.data || universitiesData || [];
  const university = universities.find(u => generateSlug(u.name) === slug);

  if (!university) {
    return {
      title: 'University Accommodation | Relaxly',
    };
  }

  const title = `Student Accommodation near ${university.name} | Relaxly`;
  const description = `Find the best student hostels and accommodation near ${university.name} in ${university.location}. Verified listings with WiFi, security, and student-friendly amenities.`;

  return {
    title,
    description,
    keywords: [`hostels near ${university.name}`, `${university.name} accommodation`, "student housing Ghana"],
    alternates: {
      canonical: `/universities/${slug}`,
    },
    openGraph: {
      title,
      description,
      url: `https://relaxlygh.com/universities/${slug}`,
      siteName: 'Relaxly',
      type: 'website',
    },
  };
}

/**
 * Server Component for University-specific Hostels.
 */
export default async function UniversityPage({ params }: PageProps) {
  const { slug } = await params;
  
  // Fetch data
  const universitiesData = await getUniversities();
  const universities: University[] = universitiesData?.data || universitiesData || [];
  const university = universities.find(u => generateSlug(u.name) === slug);

  if (!university) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="rounded-[3rem] bg-white p-16 text-center shadow-xl">
          <h1 className="text-5xl font-black text-slate-900">University Not Found</h1>
          <Link href="/hostels" className="mt-8 inline-block rounded-2xl bg-blue-600 px-8 py-4 font-bold text-white transition hover:scale-105">
            Back to Hostels
          </Link>
        </div>
      </main>
    );
  }

  // Fetch hostels for this university
  const { hostels } = await getHostels({ university: university._id, limit: 100 });

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
        'name': 'Universities',
        'item': 'https://relaxlygh.com/hostels' // Or a future university directory
      },
      {
        '@type': 'ListItem',
        'position': 3,
        'name': university.name,
        'item': `https://relaxlygh.com/universities/${slug}`
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
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-900 text-white shadow-lg">
                  <FaUniversity className="text-xl" />
                </div>
                <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight">
                   Near <span className="text-blue-600">{university.name}</span>
                </h1>
              </div>
              <p className="text-lg text-slate-600 font-medium max-w-2xl">
                Verified student accommodation options within easy commuting distance of {university.name}. 
                Filter by budget, amenities, and room types to find your home.
              </p>
            </div>
            
            <div className="rounded-2xl bg-white px-6 py-4 shadow-sm border border-slate-100">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Listings Found</p>
              <div className="flex items-center gap-2">
                <FaBed className="text-blue-600" />
                <span className="text-2xl font-black text-slate-900">{hostels.length}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Listings Grid */}
        {hostels.length > 0 ? (
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {hostels.map((hostel: any) => (
              <HostelCard key={hostel._id} hostel={hostel} />
            ))}
          </div>
        ) : (
          <div className="rounded-[3rem] bg-white p-20 text-center shadow-xl border border-slate-100">
            <div className="mx-auto mb-8 flex h-24 w-24 items-center justify-center rounded-full bg-slate-50 text-4xl text-slate-200">
              <FaUniversity />
            </div>
            <h2 className="text-3xl font-black text-slate-900">No Listings for this Campus</h2>
            <p className="mt-4 text-lg text-slate-500 font-medium">
              We don&apos;t have any hostels listed near {university.name} yet.
            </p>
            <Link 
              href="/hostels" 
              className="mt-8 inline-block rounded-2xl bg-blue-600 px-8 py-4 font-bold text-white transition hover:scale-105"
            >
              Search All Universities
            </Link>
          </div>
        )}
      </div>
    </main>
  );
}
