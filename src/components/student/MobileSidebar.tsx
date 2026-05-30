'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaHome, 
  FaCalendarAlt, 
  FaUserCircle, 
  FaSearch, 
  FaSignOutAlt, 
  FaTimes,
  FaArrowRight
} from 'react-icons/fa';
import { useAuthStore } from '../../store/authStore';

interface MobileSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const MobileSidebar: React.FC<MobileSidebarProps> = ({ isOpen, onClose }) => {
  const pathname = usePathname();
  const { user, logout } = useAuthStore();

  React.useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const navigation = [
    { href: '/student/dashboard', icon: <FaHome />, label: 'Dashboard' },
    { href: '/student/bookings', icon: <FaCalendarAlt />, label: 'My Bookings' },
    { href: '/hostels', icon: <FaSearch />, label: 'Browse Hostels' },
    { href: '/profile', icon: <FaUserCircle />, label: 'My Profile' },
  ];

  const handleLogout = () => {
    logout();
    onClose();
    window.location.href = '/login';
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-[60] bg-slate-900/60 backdrop-blur-sm lg:hidden"
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-y-0 left-0 z-[70] flex w-full max-w-[280px] flex-col bg-white shadow-2xl lg:hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-8">
              <Link href="/student/dashboard" onClick={onClose} className="flex items-center gap-2 text-2xl font-black text-blue-600">
                <img src="/logo.svg" alt="Relaxly Logo" className="h-8 w-8" />
                <span>Relaxly</span>
              </Link>
              <button
                onClick={onClose}
                className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-50 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
              >
                <FaTimes />
              </button>
            </div>

            {/* User Info */}
            <div className="px-6 py-8">
              <div className="flex items-center gap-4 rounded-[2rem] bg-slate-50 p-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-blue-600 text-xl text-white">
                  <FaUserCircle />
                </div>
                <div className="min-w-0">
                  <p className="truncate font-black text-slate-900">{user?.name || 'Student'}</p>
                  <p className="truncate text-xs font-bold text-slate-500">{user?.email}</p>
                </div>
              </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 space-y-2 px-4">
              {navigation.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={onClose}
                    className={`flex items-center justify-between rounded-2xl px-4 py-4 transition-all duration-200 ${
                      isActive
                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <span className="text-xl">{item.icon}</span>
                      <span className="font-bold">{item.label}</span>
                    </div>
                    {isActive && <FaArrowRight className="text-sm opacity-50" />}
                  </Link>
                );
              })}
            </nav>

            {/* Logout */}
            <div className="border-t border-slate-100 p-6">
              <button
                onClick={handleLogout}
                className="flex w-full items-center gap-4 rounded-2xl border-2 border-slate-100 px-6 py-4 font-bold text-red-600 transition hover:bg-red-50 hover:border-red-100"
              >
                <FaSignOutAlt className="text-xl" />
                <span>Logout</span>
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default MobileSidebar;
