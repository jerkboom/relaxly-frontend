import type { Metadata } from "next";
import React from 'react';
import { Toaster } from 'react-hot-toast';
import AuthProvider from '../src/providers/AuthProvider';
import MaintenanceBanner from '../src/components/common/MaintenanceBanner';
import ClientStoreInitializer from '../src/components/common/ClientStoreInitializer';
import './globals.css';

export const metadata: Metadata = {
  metadataBase: new URL('https://relaxlygh.com'),
  title: {
    default: "Relaxly | Premium Student Accommodation in Ghana",
    template: "%s | Relaxly"
  },
  description: "Find and book the best student hostels in Ghana. Verified accommodation near University of Ghana, KNUST, and more. Stay. Relax. Recharge.",
  keywords: ["hostel", "student accommodation", "Ghana hostels", "University of Ghana hostels", "KNUST hostels", "rent room Ghana"],
  authors: [{ name: "Relaxly Team" }],
  creator: "Relaxly",
  publisher: "Relaxly",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  icons: {
    icon: "/favicon.ico",
    apple: "/logo.svg",
  },
  openGraph: {
    type: "website",
    locale: "en_GH",
    url: "https://relaxlygh.com",
    siteName: "Relaxly",
    title: "Relaxly | Premium Student Accommodation in Ghana",
    description: "Book verified student hostels near major universities in Ghana with ease and security.",
    images: [
      {
        url: "/images/relaxly-building.png",
        width: 1200,
        height: 630,
        alt: "Relaxly Student Accommodation",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Relaxly | Premium Student Accommodation in Ghana",
    description: "Find the perfect student hostel in Ghana. Verified listings, secure payments.",
    images: ["/images/relaxly-building.png"],
  },
  alternates: {
    canonical: "https://relaxlygh.com",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const organizationJsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "Relaxly",
    "url": "https://relaxlygh.com",
    "logo": "https://relaxlygh.com/logo.svg",
    "sameAs": [
      // Add social media URLs here when available
    ]
  };

  const websiteJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "Relaxly",
    "url": "https://relaxlygh.com",
    "potentialAction": {
      "@type": "SearchAction",
      "target": "https://relaxlygh.com/hostels?search={search_term_string}",
      "query-input": "required name=search_term_string"
    }
  };

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
        />
      </head>
      <body className="overflow-x-hidden">
        <ClientStoreInitializer />
        <AuthProvider>
          <MaintenanceBanner />
          {children}
          {/* <SystemStatus /> */}
          <Toaster position="top-right" />
        </AuthProvider>
      </body>
    </html>
  );
}
