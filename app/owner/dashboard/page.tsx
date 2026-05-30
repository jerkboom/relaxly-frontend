'use client';

import React, { useEffect, useState } from 'react';
import { 
  FaHome, 
  FaBed, 
  FaCalendarCheck, 
  FaChartLine, 
  FaBell,
  FaArrowRight,
  FaPlus,
  FaWallet
} from 'react-icons/fa';
import Link from 'next/link';
import { useSettingsStore } from '../../../src/store/settingsStore';
import { FaExclamationCircle } from 'react-icons/fa';
import { getOwnerDashboardStats } from '../../../src/services/hostelService';
import toast from 'react-hot-toast';

interface DashboardStats {
  totalHostels: number;
  totalRooms: number;
  totalBookings: number;
  occupancyRate: number;
  recentBookings: any[];
  unreadMessages: number;
  notificationsCount: number;
  totalRevenue?: number;
  liveBalance?: number;
  pendingPayouts?: number;
  paidPayouts?: number;
}

// Global ref to persist across re-mounts if needed, 
// but local ref is usually enough to stop rapid loops.
const lastFetch = { timestamp: 0 };

export default function OwnerDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const { maintenanceMode } = useSettingsStore();

  useEffect(() => {
    const fetchStats = async () => {
      // Cooldown of 30 seconds
      const now = Date.now();
      if (now - lastFetch.timestamp < 30000 && stats) {
        return;
      }

      try {
        lastFetch.timestamp = now;
        const data = await getOwnerDashboardStats();
        console.log('OWNER DASHBOARD DATA:', data);
        setStats(data?.data || data);
      } catch (error: any) {
        if (error.response?.status === 429) {
          console.warn('Dashboard stats request throttled (429)');
          return;
        }
        
        if (error.response?.status === 403) {
          // If dashboard access is forbidden, redirect to pending/status page
          toast.error('Access restricted. Checking your verification status...');
          return;
        }

        console.error('Failed to fetch dashboard stats:', error);
        toast.error('Could not load dashboard data');
      }
    };

    fetchStats();
  }, [stats]);

  const statCards = [
    { 
      label: 'Active Hostels', 
      value: stats?.totalHostels || 0, 
      icon: <FaHome />, 
      color: 'bg-blue-600 text-white',
      trend: '+2 this month'
    },
    { 
      label: 'Total Room Variants', 
      value: stats?.totalRooms || 0, 
      icon: <FaBed />, 
      color: 'bg-indigo-600 text-white',
      trend: 'Across all hostels'
    },
    { 
      label: 'New Bookings', 
      value: stats?.totalBookings || 0, 
      icon: <FaCalendarCheck />, 
      color: 'bg-emerald-600 text-white',
      trend: 'Last 30 days'
    },
    { 
      label: 'Occupancy Rate', 
      value: `${stats?.occupancyRate || 0}%`, 
      icon: <FaChartLine />, 
      color: 'bg-orange-600 text-white',
      trend: 'Average capacity'
    },
  ];

  return (
    <div className="space-y-10">
      {/* WELCOME SECTION */}
      <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">Marketplace Insights</h1>
          <p className="mt-2 text-slate-500 font-medium">Welcome back! Here's how your business is performing today.</p>
        </div>
        <div className="flex gap-4">
          <Link 
            href="/owner/hostels/create"
            className="flex items-center gap-2 rounded-2xl bg-blue-600 px-6 py-4 font-black text-white shadow-lg shadow-blue-200 transition hover:bg-blue-700 hover:scale-105 active:scale-95"
          >
            <FaPlus />
            <span>Add Hostel</span>
          </Link>
        </div>
      </div>

      {/* STATS GRID */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat, index) => (
          <div key={index} className="group relative overflow-hidden rounded-[2.5rem] bg-white p-8 shadow-sm transition-all hover:shadow-xl hover:-translate-y-1">
            <div className={`mb-6 flex h-14 w-14 items-center justify-center rounded-2xl text-2xl shadow-lg shadow-current/20 ${stat.color}`}>
              {stat.icon}
            </div>
            <div>
              <p className="text-xs font-black text-slate-400 uppercase tracking-widest">{stat.label}</p>
              <h3 className="mt-2 text-4xl font-black text-slate-900">{stat.value}</h3>
              <p className="mt-2 text-[10px] font-bold text-emerald-500 uppercase tracking-tighter">{stat.trend}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* RECENT BOOKINGS */}
        <div className="lg:col-span-2">
          <div className="rounded-[2rem] sm:rounded-[3rem] bg-white p-6 sm:p-10 shadow-sm">
            <div className="mb-8 sm:mb-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-2xl sm:text-3xl font-black text-slate-900">Recent Activity</h3>
                <p className="text-xs sm:text-sm font-medium text-slate-400 mt-1">Latest student reservations</p>
              </div>
              <Link href="/owner/bookings" className="w-fit flex items-center gap-2 rounded-xl bg-slate-50 px-4 py-2 text-xs font-black text-blue-600 transition hover:bg-blue-50">
                View All <FaArrowRight />
              </Link>
            </div>

            <div className="space-y-4 sm:space-y-6">
              {stats?.recentBookings && stats.recentBookings.length > 0 ? (
                stats.recentBookings.map((booking: any) => (
                  <div key={booking._id} className="group flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-[2rem] sm:rounded-3xl border border-slate-50 p-5 sm:p-6 transition-all hover:bg-slate-50 hover:border-blue-100">
                    <div className="flex items-center gap-4 sm:gap-6 min-w-0">
                      <div className="flex shrink-0 h-10 w-10 sm:h-14 sm:w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 text-lg sm:text-xl font-black text-slate-400 uppercase">
                        {booking.student?.name?.charAt(0) || 'S'}
                      </div>
                      <div className="min-w-0">
                        <p className="text-base sm:text-lg font-black text-slate-900 truncate">{booking.student?.name || 'Anonymous Student'}</p>
                        <div className="flex items-center gap-2 mt-0.5 sm:mt-1 flex-wrap">
                          <span className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase truncate max-w-[120px] sm:max-w-none">{booking.hostel?.name}</span>
                          <span className="h-1 w-1 rounded-full bg-slate-300 shrink-0" />
                          <span className="text-[10px] sm:text-xs font-black text-blue-600 truncate">{booking.room?.roomType || 'Standard'}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-left sm:text-right shrink-0 ml-14 sm:ml-0">
                      <p className="text-lg sm:text-xl font-black text-slate-900">GHS {booking.amount}</p>
                      <p className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase mt-0.5 sm:mt-1">
                        {new Date(booking.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                  <div className="mb-6 flex h-16 sm:h-20 w-16 sm:w-20 items-center justify-center rounded-full bg-slate-50 text-2xl sm:text-3xl text-slate-200">
                    <FaCalendarCheck />
                  </div>
                  <h4 className="text-xl font-black text-slate-300">No recent bookings</h4>
                  <p className="mt-2 text-sm font-medium text-slate-400">Share your hostel links to start getting bookings.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* SUMMARY & ALERTS */}
        <div className="space-y-8">
          {/* REVENUE CARD (Hypothetical) */}
          <div className="overflow-hidden rounded-[3rem] bg-slate-900 p-10 text-white shadow-xl">
            <div className="mb-8 flex items-center justify-between">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10 text-2xl text-white">
                <FaWallet />
              </div>
              <span className="rounded-full bg-emerald-500/20 px-4 py-1.5 text-[10px] font-black text-emerald-400 uppercase tracking-widest">Live Balance</span>
            </div>
            <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Total Earnings</p>
            <h3 className="mt-2 text-4xl sm:text-5xl font-black text-white break-all sm:break-normal">
              GHS {stats?.earnings !== undefined ? stats.earnings.toLocaleString(undefined, { minimumFractionDigits: 2 }) : '0.00'}
            </h3>
            <div className="mt-6 pt-6 border-t border-white/10">
              <div className="flex justify-between items-center">
                <span className="text-xs font-black text-slate-500 uppercase tracking-widest">Live Balance</span>
                <span className="text-xl font-black text-emerald-400">GHS {stats?.liveBalance !== undefined ? stats.liveBalance.toLocaleString(undefined, { minimumFractionDigits: 2 }) : '0.00'}</span>
              </div>
              <p className="mt-2 text-[10px] font-medium text-slate-500 leading-relaxed italic">Money currently owed to you after processed payouts.</p>
            </div>
          </div>

          {/* QUICK ACTIONS */}
          <div className="rounded-[3rem] bg-white p-10 shadow-sm border border-slate-50">
            <h4 className="text-2xl font-black text-slate-900 mb-8">Quick Actions</h4>
            
            <div className="space-y-4">
              <Link 
                href="/owner/hostels" 
                className="flex items-center justify-between group rounded-2xl bg-blue-50 p-6 transition-all hover:bg-blue-600 hover:text-white"
              >
                <div className="flex items-center gap-4">
                  <FaHome className="text-xl" />
                  <div>
                    <p className="font-black">Manage Hostels</p>
                    <p className="text-[10px] font-bold uppercase opacity-60">{stats?.totalHostels || 0} Listed Properties</p>
                  </div>
                </div>
                <FaArrowRight className="transition-transform group-hover:translate-x-2" />
              </Link>

              <button 
                className="w-full flex items-center justify-between group rounded-2xl bg-orange-50 p-6 transition-all hover:bg-orange-500 hover:text-white"
              >
                <div className="flex items-center gap-4">
                  <FaBell className="text-xl" />
                  <div>
                    <p className="font-black">Notifications</p>
                    <p className="text-[10px] font-bold uppercase opacity-60">{stats?.notificationsCount || 0} Pending Alerts</p>
                  </div>
                </div>
                <FaArrowRight className="transition-transform group-hover:translate-x-2" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
