import type { Metadata } from "next";
import React from 'react';
import { Toaster } from 'react-hot-toast';
import AuthProvider from '../src/providers/AuthProvider';
import MaintenanceBanner from '../src/components/common/MaintenanceBanner';
import SystemStatus from '../src/components/common/SystemStatus';
import ClientStoreInitializer from '../src/components/common/ClientStoreInitializer';
import './globals.css';

export const metadata: Metadata = {
  title: "Relaxly",
  description: "Stay. Relax. Recharge.",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="overflow-x-hidden">
        <ClientStoreInitializer />
        <AuthProvider>
          <MaintenanceBanner />
          {children}
          <SystemStatus />
          <Toaster position="top-right" />
        </AuthProvider>
      </body>
    </html>
  );
}
