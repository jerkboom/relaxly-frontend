'use client';

import React, { useEffect, useState } from 'react';
import { 
  FaArrowLeft, 
  FaChartLine, 
  FaWallet, 
  FaHistory, 
  FaBuilding, 
  FaUserGraduate,
  FaFileExcel,
  FaFileCsv,
  FaFilePdf,
  FaFilter,
  FaRegCalendarAlt,
  FaChevronDown,
  FaCheckCircle
} from 'react-icons/fa';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { downloadPayoutReport, getEarningsReport } from '../../../src/services/reportService';
import toast from 'react-hot-toast';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer
} from 'recharts';
import { subDays, format } from 'date-fns';

export default function OwnerEarningsPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState<'csv' | 'excel' | 'pdf' | null>(null);
  
  // Filter States
  const [dateRange, setDateRange] = useState('all'); 
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const fetchEarnings = async () => {
    try {
      setLoading(true);
      
      let start = startDate;
      let end = endDate;

      if (dateRange !== 'custom' && dateRange !== 'all') {
        start = format(subDays(new Date(), parseInt(dateRange)), 'yyyy-MM-dd');
        end = format(new Date(), 'yyyy-MM-dd');
      } else if (dateRange === 'all') {
        start = '';
        end = '';
      }

      const report = await getEarningsReport({ startDate: start, endDate: end });
      setData(report);
    } catch (error) {
      console.error('Failed to fetch earnings:', error);
      toast.error('Could not load analytics data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEarnings();
  }, [dateRange, startDate, endDate]);

  const handleExport = async (formatType: 'csv' | 'excel' | 'pdf') => {
    try {
      setExporting(formatType);
      toast.loading(`Preparing ${formatType.toUpperCase()} report...`, { id: 'export' });
      await downloadPayoutReport(formatType, { startDate, endDate });
      toast.success(`${formatType.toUpperCase()} report downloaded!`, { id: 'export' });
    } catch (error) {
      toast.error('Export failed', { id: 'export' });
    } finally {
      setExporting(null);
    }
  };

  if (loading && !data) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-10 pb-24">
      {/* BREADCRUMBS & HEADER */}
      <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-4">
          <Link href="/owner/payout-history" className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-slate-600 shadow-sm transition hover:bg-slate-50 hover:text-blue-600">
            <FaArrowLeft />
          </Link>
          <div>
             <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
                <Link href="/owner/payout-history" className="hover:text-blue-600">Payout History</Link>
                <span>/</span>
                <span className="text-slate-900">Earnings Analytics</span>
             </div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tight flex items-center gap-3">
              <FaChartLine className="text-blue-600" />
              Lifetime Earnings
            </h1>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 bg-white p-2 rounded-2xl shadow-sm border border-slate-50">
          <button 
            disabled={exporting !== null}
            onClick={() => handleExport('excel')} 
            className="h-10 px-4 flex items-center gap-2 rounded-xl bg-emerald-50 text-emerald-600 text-[10px] font-black uppercase transition hover:bg-emerald-100"
          >
            <FaFileExcel /> Excel
          </button>
          <button 
            disabled={exporting !== null}
            onClick={() => handleExport('csv')} 
            className="h-10 px-4 flex items-center gap-2 rounded-xl bg-blue-50 text-blue-600 text-[10px] font-black uppercase transition hover:bg-blue-100"
          >
            <FaFileCsv /> CSV
          </button>
          <button 
            disabled={exporting !== null}
            onClick={() => handleExport('pdf')} 
            className="h-10 px-4 flex items-center gap-2 rounded-xl bg-rose-50 text-rose-600 text-[10px] font-black uppercase transition hover:bg-rose-100"
          >
            <FaFilePdf /> Statement
          </button>
        </div>
      </div>

      {/* FILTERS BAR */}
      <div className="flex flex-wrap items-center gap-4 bg-white p-6 rounded-[2rem] border border-slate-50 shadow-sm">
         <div className="flex items-center gap-2 text-xs font-black text-slate-400 uppercase tracking-widest mr-2">
            <FaFilter className="text-blue-600" /> Period:
         </div>
         
         {[
           { label: '7 Days', value: '7' },
           { label: '30 Days', value: '30' },
           { label: '90 Days', value: '90' },
           { label: 'All Time', value: 'all' },
           { label: 'Custom', value: 'custom' },
         ].map(opt => (
           <button
             key={opt.value}
             onClick={() => setDateRange(opt.value)}
             className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase transition-all ${
               dateRange === opt.value ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' : 'bg-slate-50 text-slate-500 hover:bg-slate-100'
             }`}
           >
             {opt.label}
           </button>
         ))}

         {dateRange === 'custom' && (
           <div className="flex items-center gap-3 ml-auto animate-in fade-in slide-in-from-right-4">
              <input 
                type="date" 
                value={startDate} 
                onChange={e => setStartDate(e.target.value)}
                className="rounded-xl border-none bg-slate-50 px-4 py-2 text-xs font-bold outline-none ring-2 ring-transparent focus:ring-blue-600/20" 
              />
              <span className="text-slate-300 font-bold">to</span>
              <input 
                type="date" 
                value={endDate} 
                onChange={e => setEndDate(e.target.value)}
                className="rounded-xl border-none bg-slate-50 px-4 py-2 text-xs font-bold outline-none ring-2 ring-transparent focus:ring-blue-600/20" 
              />
           </div>
         )}
      </div>

      {/* KEY METRICS */}
      <div className="grid gap-6 sm:grid-cols-3">
         <div className="rounded-[2.5rem] bg-slate-900 p-10 text-white shadow-xl relative overflow-hidden">
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-2">Total Gross Revenue</p>
            <h2 className="text-5xl font-black mb-1 tracking-tighter">GHS {data?.totalRevenue?.toLocaleString(undefined, { minimumFractionDigits: 2 })}</h2>
            <p className="text-emerald-400 text-xs font-bold">Lifetime processed payments</p>
         </div>

         <div className="rounded-[2.5rem] bg-white p-10 shadow-sm border border-slate-100">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Paid Bookings</p>
            <h2 className="text-5xl font-black text-slate-900 mb-1 tracking-tighter">{data?.paidBookings || 0}</h2>
            <p className="text-slate-400 text-xs font-medium">Successful reservations</p>
         </div>

         <div className="rounded-[2.5rem] bg-white p-10 shadow-sm border border-slate-100">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Avg. Booking Value</p>
            <h2 className="text-5xl font-black text-slate-900 mb-1 tracking-tighter">GHS {data?.averageBookingValue?.toLocaleString(undefined, { maximumFractionDigits: 0 })}</h2>
            <p className="text-slate-400 text-xs font-medium">Mean revenue per student</p>
         </div>
      </div>

      {/* CHARTS ROW */}
      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="rounded-[3rem] bg-white p-10 shadow-sm border border-slate-100 h-full">
            <div className="mb-10 flex items-center justify-between">
              <div>
                <h3 className="text-2xl font-black text-slate-900 tracking-tight">Revenue Trend</h3>
                <p className="text-sm font-medium text-slate-400">Monthly gross income performance</p>
              </div>
            </div>
            
            <div className="h-[400px] w-full">
              {data?.monthlyRevenue?.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={data.monthlyRevenue}>
                    <defs>
                      <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#2563eb" stopOpacity={0.1}/>
                        <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis 
                      dataKey="name" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fontSize: 10, fontWeight: 700, fill: '#94a3b8' }} 
                      dy={15}
                    />
                    <YAxis 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fontSize: 10, fontWeight: 700, fill: '#94a3b8' }} 
                    />
                    <Tooltip 
                      contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', padding: '15px' }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="revenue" 
                      stroke="#2563eb" 
                      strokeWidth={4}
                      fillOpacity={1} 
                      fill="url(#colorRev)" 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex h-full flex-col items-center justify-center text-slate-300">
                   <FaChartLine className="text-6xl opacity-20 mb-4" />
                   <p className="font-black uppercase tracking-widest text-xs">No trend data for this period</p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-8">
           {/* HOSTEL PERFORMANCE */}
           <div className="rounded-[3rem] bg-white p-10 shadow-sm border border-slate-100">
              <h3 className="text-xl font-black text-slate-900 mb-8">Hostel Breakdown</h3>
              <div className="space-y-6">
                 {data?.hostelBreakdown?.map((hostel: any, i: number) => (
                   <div key={hostel.name} className="group flex items-center justify-between gap-4">
                      <div className="flex items-center gap-4 min-w-0">
                         <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl font-black text-xs ${
                           i === 0 ? 'bg-amber-100 text-amber-600' : 'bg-slate-50 text-slate-400'
                         }`}>
                           {i + 1}
                         </div>
                         <div className="min-w-0">
                            <p className="text-sm font-black text-slate-800 truncate">{hostel.name}</p>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">{hostel.count} Bookings</p>
                         </div>
                      </div>
                      <div className="text-right">
                         <p className="text-sm font-black text-slate-900">GHS {hostel.revenue.toLocaleString()}</p>
                         <div className="mt-1 h-1 w-20 overflow-hidden rounded-full bg-slate-50">
                            <motion.div 
                              initial={{ width: 0 }}
                              animate={{ width: `${(hostel.revenue / (data.totalRevenue || 1)) * 100}%` }}
                              className="h-full bg-blue-600"
                            />
                         </div>
                      </div>
                   </div>
                 ))}
                 {!data?.hostelBreakdown?.length && <p className="text-center text-slate-300 py-10 font-bold uppercase text-[10px]">No hostel data</p>}
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}
