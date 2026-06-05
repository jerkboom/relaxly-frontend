import { Metadata } from 'next';
import HostelsPageClient from './HostelsPageClient';

export const metadata: Metadata = {
  title: "Explore Student Hostels in Ghana | Verified Accommodation | Relaxly",
  description: "Browse the best student hostels in Ghana. Filter by university, location, price, and amenities. Verified listings with secure booking and direct owner contact.",
  alternates: {
    canonical: 'https://relaxlygh.com/hostels',
  },
  openGraph: {
    title: "Explore Student Hostels in Ghana | Relaxly",
    description: "Browse verified student hostels near major universities in Ghana.",
    url: 'https://relaxlygh.com/hostels',
  }
};

export default function HostelsPage() {
  return <HostelsPageClient />;
}
