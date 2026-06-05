import { Metadata } from 'next';
import HomePageClient from './HomePageClient';

export const metadata: Metadata = {
  title: "Relaxly | Premium Student Accommodation in Ghana",
  description: "Find and book the best student hostels in Ghana. Verified accommodation near University of Ghana, KNUST, and more. Stay. Relax. Recharge.",
  alternates: {
    canonical: 'https://relaxlygh.com',
  },
  openGraph: {
    url: 'https://relaxlygh.com',
  }
};

export default function HomePage() {
  return <HomePageClient />;
}
