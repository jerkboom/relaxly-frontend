'use client';

import { useEffect } from 'react';

import dynamic from 'next/dynamic';

import { usePathname } from 'next/navigation';

import { disconnectSocket } from '../lib/socket';

import { useAuthStore } from '../store/authStore';
import { useWishlistStore } from '../store/wishlistStore';

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
    hasHydrated: authHydrated,
    initializeAuth,
    token,
    user,
  } =
    useAuthStore();

  const {
    hasHydrated: wishlistHydrated,
    fetchWishlist,
    clearWishlist,
  } = useWishlistStore();

  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  useEffect(() => {
    if (authHydrated && wishlistHydrated) {
      if (user) {
        fetchWishlist();
      } else {
        clearWishlist();
      }
    }
  }, [authHydrated, wishlistHydrated, user, fetchWishlist, clearWishlist]);

  const isPublicRoute =
    publicRoutes.has(pathname) ||
    publicRoutePrefixes.some((prefix) =>
      pathname.startsWith(prefix)
    );

  const canUseRealtime =
    typeof window !== 'undefined' &&
    authHydrated &&
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
