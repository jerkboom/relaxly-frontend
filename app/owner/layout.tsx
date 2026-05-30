/**
 * ==================================================
 * Relaxly Frontend
 * File: app/owner/layout.tsx
 *
 * Purpose:
 * Root layout for the Hostel Owner workspace.
 * Provides a persistent sidebar navigation and authenticated header.
 *
 * Navigation Items:
 * - Dashboard: High-level metrics.
 * - My Hostels: Property management.
 * - Bookings: Reservation processing.
 * - Payout History: Financial settlements.
 * - Payout Settings: Bank/MoMo configuration.
 * - Profile: Account settings.
 *
 * Responsibility:
 * - Role-based authorization ('owner' only).
 * - Responsive sidebar (Drawer on mobile, fixed on desktop).
 * - Shared UI state (Active route highlighting).
 *
 * ==================================================
 */

'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  FaThLarge, 
  FaHome, 
  FaCalendarCheck, 
  FaComments, 
  FaUserCircle, 
  FaSignOutAlt,
  FaBars,
  FaTimes,
  FaQuestionCircle,
  FaWallet,
  FaHistory
} from 'react-icons/fa';
import ProtectedRoute from '../../src/components/auth/ProtectedRoute';
import { useAuthStore } from '../../src/store/authStore';

interface NavItemProps {
  href: string;
  icon: React.ReactNode;
  label: string;
  active: boolean;
  onClick?: () => void;
}

/**
 * Individual sidebar link with active state styling.
 */
const NavItem = ({ href, icon, label, active, onClick }: NavItemProps) => (
  <Link
    href={href}
    onClick={onClick}
    className={`flex items-center gap-3 px-6 py-4 transition-all duration-200 ${
      active 
        ? 'bg-blue-600 text-white font-bold shadow-lg shadow-blue-200/50' 
        : 'text-slate-600 hover:bg-slate-100'
    }`}
  >
    <span className="text-xl">{icon}</span>
    <span>{label}</span>
  </Link>
);

export default function OwnerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { user, logout } = useAuthStore();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  /** Main navigation configuration for the Owner dashboard. */
  const navigation = [
    { href: '/owner/dashboard', icon: <FaThLarge />, label: 'Dashboard' },
    { href: '/owner/hostels', icon: <FaHome />, label: 'My Hostels' },
    { href: '/owner/bookings', icon: <FaCalendarCheck />, label: 'Bookings' },
    { href: '/owner/payout-history', icon: <FaHistory />, label: 'Payout History' },
    { href: '/owner/payout-settings', icon: <FaWallet />, label: 'Payout Settings' },
    { href: '/owner/profile', icon: <FaUserCircle />, label: 'Profile' },
    { href: '/owner/help', icon: <FaQuestionCircle />, label: 'Help' },
  ];

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  return (
    <ProtectedRoute allowedRole="owner">
      <div className="flex min-h-screen bg-slate-50">
        {/* MOBILE SIDEBAR OVERLAY - Closes sidebar on click */}
        {isSidebarOpen && (
          <div 
            className="fixed inset-0 z-40 bg-black/50 lg:hidden backdrop-blur-sm"
            onClick={toggleSidebar}
          />
        )}

        {/* SIDEBAR - Persistent on Desktop, Drawer on Mobile */}
        <aside className={`
          fixed inset-y-0 left-0 z-50 w-72 bg-white shadow-xl transition-transform duration-300 lg:static lg:translate-x-0
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        `}>
          <div className="flex h-full flex-col">
            {/* BRANDING LOGO */}
            <div className="flex items-center justify-between px-8 py-8">
              <Link href="/owner/dashboard" className="flex items-center gap-2 text-3xl font-black text-blue-600">
                <img src="/logo.svg" alt="Relaxly Logo" className="h-8 w-8" />
                <span>Relaxly</span>
              </Link>
              <button onClick={toggleSidebar} className="text-2xl lg:hidden text-slate-400">
                <FaTimes />
              </button>
            </div>

            {/* PRIMARY NAVIGATION */}
            <nav className="flex-1">
              {navigation.map((item) => (
                <NavItem
                  key={item.href}
                  {...item}
                  active={pathname === item.href}
                  onClick={() => setIsSidebarOpen(false)}
                />
              ))}
            </nav>

            {/* USER FOOTER & LOGOUT */}
            <div className="border-t border-slate-100 p-6">
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-blue-600 font-bold">
                  {user?.name?.charAt(0)}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-bold text-slate-900 text-sm">{user?.name}</p>
                  <p className="truncate text-[10px] font-medium text-slate-500 uppercase tracking-tight">{user?.role}</p>
                </div>
              </div>
              <button
                onClick={logout}
                className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-red-600 transition hover:bg-red-50 font-black text-xs uppercase tracking-widest"
              >
                <FaSignOutAlt />
                <span>Logout Session</span>
              </button>
            </div>
          </div>
        </aside>

        {/* MAIN VIEWPORT */}
        <div className="flex flex-1 flex-col">
          {/* TOP HEADER - Mobile menu toggle and breadcrumbs */}
          <header className="flex h-20 items-center justify-between border-b border-slate-200 bg-white px-6 lg:px-10">
            <button onClick={toggleSidebar} className="text-2xl text-slate-600 lg:hidden">
              <FaBars />
            </button>
            
            <div className="hidden lg:block">
              <h2 className="text-xl font-black text-slate-900 tracking-tight">
                {navigation.find(n => n.href === pathname)?.label || 'Owner Panel'}
              </h2>
            </div>

            {/* QUICK ACTIONS */}
            <div className="flex items-center gap-4">
              <Link 
                href="/owner/hostels/create" 
                className="hidden rounded-xl bg-blue-600 px-5 py-2.5 text-xs font-black text-white uppercase tracking-widest transition hover:bg-blue-700 sm:block shadow-lg shadow-blue-200"
              >
                + Add Hostel
              </Link>
              <div className="h-10 w-10 rounded-full bg-slate-100 border-2 border-white shadow-sm" />
            </div>
          </header>

          {/* MAIN PAGE CONTENT */}
          <main className="flex-1 overflow-y-auto p-6 lg:p-10">
            {children}
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
}
