'use client';

import {
  useEffect,
} from 'react';

import {
  useRouter,
  usePathname,
} from 'next/navigation';

import {
  useAuthStore,
} from '../../store/authStore';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRole?: string;
}

export default function ProtectedRoute({
  children,
  allowedRole,
}: ProtectedRouteProps) {
  const router = useRouter();
  const pathname = usePathname();

  const {
    user,
    token,
    hasHydrated,
  } =
    useAuthStore();

  useEffect(() => {
    if (hasHydrated) {
      if (!user || !token) {
        if (pathname !== '/login') {
          router.replace('/login');
        }
        return;
      }

      // 1. Check Email Verification First
      if (user.isEmailVerified === false) {
        if (pathname !== '/verify-email-pending') {
          router.replace('/verify-email-pending');
        }
        return;
      }

      // 2. Role-based status checks
      const userRole = user.role;
      const status = (user.verificationStatus || '');

      if (userRole === 'owner') {
        if (status === 'pending') {
          if (pathname !== '/owner/pending-approval') {
            router.replace('/owner/pending-approval');
          }
          return;
        } else if (status === 'rejected') {
          if (pathname !== '/owner/rejected') {
            router.replace('/owner/rejected');
          }
          return;
        } else if (status === 'suspended') {
          if (pathname !== '/suspended') {
            router.replace('/suspended');
          }
          return;
        }
      }

      // 3. Role-based permission checks
      if (userRole === 'admin') {
        return;
      }

      if (allowedRole && userRole !== allowedRole) {
        if (userRole === 'owner') {
          router.replace('/owner/dashboard');
        } else if (userRole === 'student') {
          router.replace('/student/dashboard');
        } else {
          router.replace('/');
        }
      }

    }
  }, [
    hasHydrated,
    router,
    pathname,
    token,
    user,
    allowedRole,
  ]);

  if (!hasHydrated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-100 border-t-blue-600" />
      </div>
    );
  }

  if (!user || !token) {
    return null;
  }

  return <>{children}</>;
}
