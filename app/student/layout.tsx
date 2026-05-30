'use client';

import React, { useState, createContext, useContext } from 'react';
import MobileSidebar from '../../src/components/student/MobileSidebar';
import ProtectedRoute from '../../src/components/auth/ProtectedRoute';

interface NavContextType {
  openSidebar: () => void;
}

const NavContext = createContext<NavContextType>({
  openSidebar: () => {},
});

export const useNav = () => useContext(NavContext);

export default function StudentLayout({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const openSidebar = () => setIsSidebarOpen(true);
  const closeSidebar = () => setIsSidebarOpen(false);

  return (
    <ProtectedRoute>
      <NavContext.Provider value={{ openSidebar }}>
        <div className="min-h-screen bg-slate-50">
          <MobileSidebar isOpen={isSidebarOpen} onClose={closeSidebar} />
          {children}
        </div>
      </NavContext.Provider>
    </ProtectedRoute>
  );
}
