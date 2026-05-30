'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { 
  FaWallet, 
  FaHistory, 
  FaCheckCircle, 
  FaClock, 
  FaTimesCircle, 
  FaExclamationTriangle,
  FaSearch,
  FaFilter,
  FaChevronDown,
  FaArrowLeft,
  FaArrowRight,
  FaEye,
  FaBuilding,
  FaMoneyBillWave,
  FaRegCalendarAlt
} from 'react-icons/fa';
import Link from 'next/link';
import { getPayoutHistory, Payout, PayoutSummary } from '../../../src/services/payoutService';
import toast from 'react-hot-toast';

export default function PayoutHistoryPage() {
  const [payouts, setPayouts] = useState<Payout[]>([]);
  const [summary, setSummary] = useState<PayoutSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  
  // Filters
  const [status, setStatus] = useState('');
  const [hostelId, setHostelId] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const [selectedPayout, setSelectedPayout] = useState<Payout | null>(null);

  const fetchPayouts = useCallback(async () => {
    try {
      setLoading(true);
      const response = await getPayoutHistory({
        page,
        limit: 10,
        status: status || undefined,
        hostelId: hostelId || undefined,
        startDate: startDate || undefined,
        endDate: endDate || undefined
      });

      if (response.success) {
        setPayouts(response.data.payouts);
        setSummary(response.data.summary);
        setTotalPages(response.data.pagination.pages);
        setTotalItems(response.data.pagination.total);
      }
    } catch (error: any) {
      console.error('Failed to fetch payout history:', error);
      toast.error('Could not load payout history');
    } finally {
      setLoading(false);
    }
  }, [page, status, hostelId, startDate, endDate]);

  useEffect(() => {
    fetchPayouts();
  }, [fetchPayouts]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return <span className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-[10px] font-black uppercase">Completed</span>;
      case 'processing':
      case 'approved':
      case 'otp_pending':
        return <span className="bg-amber-100 text-amber-700 px-3 py-1 rounded-full text-[10px] font-black uppercase">Processing</span>;
      case 'failed':
      case 'otp_failed':
        return <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-[10px] font-black uppercase">Failed</span>;
      case 'cancelled':
        return <span className="bg-slate-100 text-slate-700 px-3 py-1 rounded-full text-[10px] font-black uppercase">Cancelled</span>;
      default:
        return <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-[10px] font-black uppercase">Pending</span>;
    }
  };

  const statCards = [
    { 
      label: 'Lifetime Earnings', 
      value: `GHS ${(summary?.lifetimeEarnings || 0).toLocaleString()}`, 
      icon: <FaMoneyBillWave />, 
      color: 'bg-blue-600 text-white',
      desc: 'Gross revenue earned'
    },
    { 
      label: 'Total Paid Out', 
      value: `GHS ${(summary?.totalPaidOut || 0).toLocaleString()}`, 
      icon: <FaCheckCircle />, 
      color: 'bg-emerald-600 text-white',
      desc: 'Transferred to your bank'
    },
    { 
      label: 'Pending Payouts', 
      value: `GHS ${(summary?.pendingPayouts || 0).toLocaleString()}`, 
      icon: <FaClock />, 
      color: 'bg-amber-600 text-white',
      desc: 'Awaiting processing'
    },
    { 
      label: 'Failed Transfers', 
      value: `GHS ${(summary?.failedPayouts || 0).toLocaleString()}`, 
      icon: <FaExclamationTriangle />, 
      color: 'bg-red-600 text-white',
      desc: 'Issues requiring attention'
    },
  ];

  return (
    <div className="space-y-10 pb-20">
      {/* HEADER */}
      <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight flex items-center gap-3">
            <FaHistory className="text-blue-600" />
            Payout History
          </h1>
          <p className="mt-2 text-slate-500 font-medium">Track all settlements and transfers from the platform.</p>
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
              <h3 className="mt-2 text-3xl font-black text-slate-900">{stat.value}</h3>
              <p className="mt-2 text-[10px] font-bold text-slate-400 uppercase tracking-tighter">{stat.desc}</p>
            </div>
          </div>
        ))}
      </div>

      {/* FILTERS */}
      <div className="rounded-[2rem] sm:rounded-[2.5rem] bg-white p-6 sm:p-8 shadow-sm border border-slate-50">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Status</label>
            <div className="relative">
              <select 
                value={status}
                onChange={(e) => { setStatus(e.target.value); setPage(1); }}
                className="w-full appearance-none rounded-2xl border-none bg-slate-50 px-6 py-4 font-bold text-slate-700 focus:ring-2 focus:ring-blue-500 transition-all outline-none"
              >
                <option value="">All Statuses</option>
                <option value="paid">Completed</option>
                <option value="processing">Processing</option>
                <option value="pending">Pending</option>
                <option value="failed">Failed</option>
                <option value="cancelled">Cancelled</option>
              </select>
              <FaChevronDown className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none text-xs" />
            </div>
          </div>
          
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Start Date</label>
            <input 
              type="date"
              value={startDate}
              onChange={(e) => { setStartDate(e.target.value); setPage(1); }}
              className="w-full rounded-2xl border-none bg-slate-50 px-6 py-4 font-bold text-slate-700 focus:ring-2 focus:ring-blue-500 transition-all outline-none"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">End Date</label>
            <input 
              type="date"
              value={endDate}
              onChange={(e) => { setEndDate(e.target.value); setPage(1); }}
              className="w-full rounded-2xl border-none bg-slate-50 px-6 py-4 font-bold text-slate-700 focus:ring-2 focus:ring-blue-500 transition-all outline-none"
            />
          </div>

          <div className="flex items-end">
            <button 
              onClick={() => { setStatus(''); setHostelId(''); setStartDate(''); setEndDate(''); setPage(1); }}
              className="w-full rounded-2xl bg-slate-100 px-6 py-4 font-black text-slate-600 transition hover:bg-slate-200"
            >
              Reset Filters
            </button>
          </div>
        </div>
      </div>

      {/* TABLE / CARDS VIEW */}
      <div className="rounded-[2.5rem] sm:rounded-[3rem] bg-white shadow-sm overflow-hidden border border-slate-50">
        {/* DESKTOP TABLE */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-slate-50 text-left">
                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Date</th>
                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Hostel / Booking</th>
                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Amount</th>
                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Status</th>
                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Reference</th>
                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan={6} className="px-8 py-6">
                      <div className="h-10 bg-slate-50 rounded-2xl w-full"></div>
                    </td>
                  </tr>
                ))
              ) : payouts.length > 0 ? (
                payouts.map((payout) => (
                  <tr key={payout._id} className="group hover:bg-slate-50/50 transition-colors">
                    <td className="px-8 py-6">
                      <p className="text-sm font-black text-slate-900">
                        {new Date(payout.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </p>
                      <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase">
                        {new Date(payout.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400">
                          <FaBuilding />
                        </div>
                        <div>
                          <p className="text-sm font-black text-slate-900">{payout.hostel?.name || 'Unknown Hostel'}</p>
                          <p className="text-[10px] font-bold text-blue-600 uppercase tracking-tighter">
                            {payout.booking?.bookingCode || 'N/A'} • {payout.booking?.student?.name}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <p className="text-lg font-black text-slate-900">GHS {payout.finalTransferAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
                      <p className="text-[10px] font-bold text-slate-400 uppercase mt-0.5">
                        Net Transfer
                      </p>
                    </td>
                    <td className="px-8 py-6 text-center">
                      {getStatusBadge(payout.status)}
                    </td>
                    <td className="px-8 py-6">
                      <p className="text-[10px] font-black text-slate-400 font-mono tracking-tighter break-all max-w-[120px]">
                        {payout.transferReference || payout._id.slice(-8).toUpperCase()}
                      </p>
                    </td>
                    <td className="px-8 py-6 text-center">
                      <button 
                        onClick={() => setSelectedPayout(payout)}
                        className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-600 transition hover:bg-blue-600 hover:text-white"
                      >
                        <FaEye />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-8 py-20 text-center">
                    <div className="flex flex-col items-center">
                      <div className="h-20 w-20 bg-slate-50 rounded-full flex items-center justify-center text-3xl text-slate-200 mb-6">
                        <FaWallet />
                      </div>
                      <h3 className="text-xl font-black text-slate-300">No payouts found</h3>
                      <p className="text-sm text-slate-400 font-medium mt-2">Try adjusting your filters or check back later.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* MOBILE CARDS VIEW */}
        <div className="block md:hidden divide-y divide-slate-50">
          {loading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="p-6 animate-pulse space-y-4">
                <div className="h-4 bg-slate-50 rounded w-1/4" />
                <div className="h-8 bg-slate-50 rounded w-full" />
                <div className="h-4 bg-slate-50 rounded w-1/2" />
              </div>
            ))
          ) : payouts.length > 0 ? (
            payouts.map((payout) => (
              <div key={payout._id} className="p-6 space-y-6">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
                      {new Date(payout.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </p>
                    <h4 className="text-sm font-black text-slate-900">{payout.hostel?.name}</h4>
                    <p className="text-[10px] font-bold text-blue-600 uppercase mt-0.5 tracking-tighter">
                      {payout.booking?.bookingCode || 'N/A'} • {payout.booking?.student?.name}
                    </p>
                  </div>
                  {getStatusBadge(payout.status)}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="rounded-2xl bg-slate-50 p-4">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-tight mb-1">Net Transfer</p>
                    <p className="text-lg font-black text-slate-900">GHS {payout.finalTransferAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
                  </div>
                  <div className="rounded-2xl bg-slate-50 p-4 overflow-hidden">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-tight mb-1">Reference</p>
                    <p className="text-[10px] font-bold text-slate-700 font-mono break-all leading-tight">
                      {payout.transferReference || payout._id.slice(-8).toUpperCase()}
                    </p>
                  </div>
                </div>

                <button 
                  onClick={() => setSelectedPayout(payout)}
                  className="w-full flex items-center justify-center gap-2 rounded-2xl bg-slate-900 py-4 font-black text-white text-sm shadow-lg shadow-slate-200"
                >
                  <FaEye /> View Details
                </button>
              </div>
            ))
          ) : (
            <div className="p-12 text-center">
              <div className="mx-auto h-16 w-16 bg-slate-50 rounded-full flex items-center justify-center text-2xl text-slate-200 mb-4">
                <FaWallet />
              </div>
              <h3 className="text-lg font-black text-slate-300">No payouts found</h3>
            </div>
          )}
        </div>

        {/* PAGINATION */}
        {totalPages > 1 && (
          <div className="flex flex-col sm:flex-row items-center justify-between border-t border-slate-50 px-8 py-6 gap-4">
            <p className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-widest text-center sm:text-left">
              Showing {payouts.length} of {totalItems} payouts
            </p>
            <div className="flex items-center gap-4">
              <button 
                disabled={page === 1}
                onClick={() => setPage(prev => prev - 1)}
                className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-600 transition hover:bg-blue-600 hover:text-white disabled:opacity-50 disabled:pointer-events-none"
              >
                <FaArrowLeft />
              </button>
              <span className="text-sm font-black text-slate-900 whitespace-nowrap">Page {page} of {totalPages}</span>
              <button 
                disabled={page === totalPages}
                onClick={() => setPage(prev => prev + 1)}
                className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-600 transition hover:bg-blue-600 hover:text-white disabled:opacity-50 disabled:pointer-events-none"
              >
                <FaArrowRight />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* DETAIL MODAL */}
      {selectedPayout && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-10">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setSelectedPayout(null)} />
          <div className="relative w-full max-w-2xl overflow-y-auto max-h-[90vh] rounded-[2rem] sm:rounded-[3rem] bg-white shadow-2xl custom-scrollbar">
            <div className="bg-slate-900 p-8 sm:p-10 text-white">
              <div className="flex items-center justify-between mb-8">
                <div className="h-10 w-10 sm:h-12 sm:w-12 bg-white/10 rounded-2xl flex items-center justify-center text-lg sm:text-xl">
                  <FaWallet />
                </div>
                <button onClick={() => setSelectedPayout(null)} className="text-white/40 hover:text-white transition-colors text-2xl">
                  <FaTimesCircle />
                </button>
              </div>
              <p className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-1">Payout Detail</p>
              <h2 className="text-2xl sm:text-4xl font-black break-all">
                {selectedPayout.transferReference || 'TRANS-' + selectedPayout._id.slice(-8).toUpperCase()}
              </h2>
              
              <div className="mt-8 flex flex-wrap gap-4">
                {getStatusBadge(selectedPayout.status)}
                <span className="bg-white/10 text-white px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">
                  {selectedPayout.currency || 'GHS'}
                </span>
              </div>
            </div>

            <div className="p-8 sm:p-10 space-y-8">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 block">Settlement Breakdown</label>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm font-medium text-slate-500">
                      <span>Gross Booking</span>
                      <span>GHS {(selectedPayout.amount + selectedPayout.commissionAmount).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                    </div>
                    <div className="flex justify-between text-sm font-medium text-red-500">
                      <span>Platform Commission</span>
                      <span>- GHS {selectedPayout.commissionAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                    </div>
                    <div className="pt-2 border-t border-slate-100 flex justify-between text-lg font-black text-slate-900">
                      <span>Final Transfer</span>
                      <span className="text-emerald-600">GHS {selectedPayout.finalTransferAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 block">Destination Details</label>
                  <div className="rounded-2xl bg-slate-50 p-4">
                    <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Transfer Code</p>
                    <p className="text-sm font-bold text-slate-700 font-mono break-all">{selectedPayout.transferCode || 'N/A'}</p>
                  </div>
                  <div className="rounded-2xl bg-slate-50 p-4">
                    <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Processed At</p>
                    <p className="text-sm font-bold text-slate-700">
                      {selectedPayout.processedAt ? new Date(selectedPayout.processedAt).toLocaleString() : 'Pending'}
                    </p>
                  </div>
                  {selectedPayout.payoutMethod && (
                    <div className="rounded-2xl bg-blue-50/50 p-4 border border-blue-100/50">
                      <p className="text-[10px] font-black text-blue-400 uppercase mb-1">Payment Destination</p>
                      <p className="text-sm font-black text-slate-700">
                        {selectedPayout.payoutMethod.type === 'momo' ? 'Mobile Money' : 'Bank Transfer'}
                      </p>
                      <p className="text-[10px] font-bold text-slate-500 uppercase mt-1 break-all">
                        {selectedPayout.payoutMethod.provider || selectedPayout.payoutMethod.bankCode} • {selectedPayout.payoutMethod.accountNumber}
                      </p>
                      <p className="text-[10px] font-bold text-slate-500 uppercase mt-0.5 truncate">
                        {selectedPayout.payoutMethod.accountName}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 block">Associated Booking</label>
                <div className="rounded-[2rem] border border-slate-100 p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 sm:h-12 sm:w-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center text-lg sm:text-xl shrink-0">
                      <FaRegCalendarAlt />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm sm:text-base font-black text-slate-900 truncate">{selectedPayout.booking?.bookingCode || 'Booking N/A'}</p>
                      <p className="text-xs font-medium text-slate-500 truncate">{selectedPayout.booking?.student?.name}</p>
                    </div>
                  </div>
                  <Link 
                    href={`/owner/bookings`} 
                    className="text-xs font-black text-blue-600 hover:underline w-fit"
                  >
                    View Booking
                  </Link>
                </div>
              </div>

              {selectedPayout.failureReason && (
                <div className="rounded-2xl bg-red-50 p-6 border border-red-100">
                  <p className="text-[10px] font-black text-red-600 uppercase mb-2 flex items-center gap-2">
                    <FaExclamationTriangle /> Failure Reason
                  </p>
                  <p className="text-sm font-bold text-red-700 leading-relaxed">{selectedPayout.failureReason}</p>
                </div>
              )}
            </div>

            <div className="p-8 sm:p-10 pt-0">
              <button 
                onClick={() => setSelectedPayout(null)}
                className="w-full rounded-2xl bg-slate-900 py-4 font-black text-white shadow-xl transition hover:bg-slate-800"
              >
                Close Details
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
