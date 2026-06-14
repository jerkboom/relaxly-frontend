'use client';

import React, { useEffect, useState } from 'react';
import { 
  FaArrowLeft, 
  FaCheckCircle, 
  FaWallet, 
  FaFileExcel,
  FaFileCsv,
  FaFilePdf,
  FaBuilding,
  FaRegCalendarAlt
} from 'react-icons/fa';
import Link from 'next/link';
import { getPayoutHistory, Payout } from '../../../src/services/payoutService';
import { downloadPayoutReport } from '../../../src/services/reportService';
import PayoutDestinationInfo from '../../../src/components/owner/PayoutDestinationInfo';
import toast from 'react-hot-toast';

export default function PaidTransfersPage() {
  const [payouts, setPayouts] = useState<Payout[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await getPayoutHistory({ status: 'paid', limit: 50 });
        if (res.success) setPayouts(res.data.payouts);
      } catch (err) {
        toast.error('Failed to load transfers');
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  const handleExport = async (format: 'csv' | 'excel' | 'pdf') => {
    try {
      toast.loading(`Preparing ${format.toUpperCase()} report...`, { id: 'export' });
      await downloadPayoutReport(format, { status: 'paid' });
      toast.success(`${format.toUpperCase()} report downloaded!`, { id: 'export' });
    } catch (error) {
      toast.error('Export failed', { id: 'export' });
    }
  };

  return (
    <div className="space-y-10 pb-20">
      <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-4">
          <Link href="/owner/payout-history" className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-slate-600 shadow-sm transition hover:bg-slate-50 hover:text-blue-600">
            <FaArrowLeft />
          </Link>
          <div>
            <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
                <Link href="/owner/payout-history" className="hover:text-blue-600">Payout History</Link>
                <span>/</span>
                <span className="text-slate-900">Completed Payouts</span>
            </div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tight flex items-center gap-3">
              <FaCheckCircle className="text-emerald-500" />
              Completed Payouts
            </h1>
          </div>
        </div>

        <div className="flex gap-2 bg-white p-2 rounded-2xl shadow-sm border border-slate-50">
          <button onClick={() => handleExport('excel')} className="h-10 px-4 flex items-center gap-2 rounded-xl bg-emerald-50 text-emerald-600 text-[10px] font-black uppercase transition hover:bg-emerald-100">
            <FaFileExcel /> Excel
          </button>
          <button onClick={() => handleExport('csv')} className="h-10 px-4 flex items-center gap-2 rounded-xl bg-blue-50 text-blue-600 text-[10px] font-black uppercase transition hover:bg-blue-100">
            <FaFileCsv /> CSV
          </button>
          <button onClick={() => handleExport('pdf')} className="h-10 px-4 flex items-center gap-2 rounded-xl bg-rose-50 text-rose-600 text-[10px] font-black uppercase transition hover:bg-rose-100">
            <FaFilePdf /> Statement
          </button>
        </div>
      </div>

      <div className="rounded-[3rem] bg-white shadow-sm border border-slate-50 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
                <tr className="border-b border-slate-50 text-left bg-slate-50/50">
                  <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Date</th>
                  <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Destination Detail</th>
                  <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Settled Amount</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                <tr className="animate-pulse"><td colSpan={3} className="p-10 text-center text-slate-400">Loading history...</td></tr>
              ) : payouts.length > 0 ? (
                payouts.map(p => (
                  <tr key={p._id}>
                    <td className="px-10 py-6 font-bold text-slate-900">{new Date(p.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</td>
                    <td className="px-10 py-6">
                        <PayoutDestinationInfo payout={p} />
                    </td>
                    <td className="px-10 py-6 text-right font-black text-lg text-emerald-600">GHS {p.finalTransferAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan={3} className="p-20 text-center text-slate-400 font-bold">No completed payouts recorded.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
