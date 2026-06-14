'use client';

import { useEffect } from 'react';

import dynamic from 'next/dynamic';

import { usePathname } from 'next/navigation';

import { disconnectSocket } from '../lib/socket';

import { useAuthStore } from '../store/authStore';

const NotificationCenter = dynamic(
  () =>
    import(
      '../components/notifications/NotificationCenter'
    ),
  { ssr: false }
);

const publicRoutes = new Set([
  '/',
  '/login',
  '/register',
  '/forgot-password',
  '/hostels',
  '/privacy-policy',
  '/terms-and-conditions',
  '/refund-policy',
]);

const publicRoutePrefixes = [
  '/hostels/',
  '/reset-password/',
  '/verify-email/',
];

export default function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const {
    hasHydrated,
    initializeAuth,
    token,
    user,
  } =
    useAuthStore();

  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  const isPublicRoute =
    publicRoutes.has(pathname) ||
    publicRoutePrefixes.some((prefix) =>
      pathname.startsWith(prefix)
    );

  const canUseRealtime =
    typeof window !== 'undefined' &&
    hasHydrated &&
    Boolean(token && user) &&
    !isPublicRoute;

  useEffect(() => {
    if (!canUseRealtime) {
      disconnectSocket();
    }
  }, [canUseRealtime]);

  return (
    <>
      {children}
      {canUseRealtime && (
        <NotificationCenter />
      )}
    </>
  );
}
