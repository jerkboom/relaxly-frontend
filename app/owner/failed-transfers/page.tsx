'use client';

import React, { useEffect, useState } from 'react';
import { 
  FaArrowLeft, 
  FaExclamationTriangle, 
  FaWallet, 
  FaHistory, 
  FaPhoneAlt,
  FaRedo,
  FaCheckCircle,
  FaFileExcel,
  FaFileCsv,
  FaFilePdf
} from 'react-icons/fa';
import Link from 'next/link';
import { getPayoutHistory, Payout } from '../../../src/services/payoutService';
import { downloadPayoutReport } from '../../../src/services/reportService';
import PayoutDestinationInfo from '../../../src/components/owner/PayoutDestinationInfo';
import toast from 'react-hot-toast';

export default function FailedTransfersPage() {
  const [payouts, setPayouts] = useState<Payout[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await getPayoutHistory({ status: 'failed', limit: 50 });
        if (res.success) setPayouts(res.data.payouts);
      } catch (err) {
        toast.error('Failed to load error history');
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  const handleExport = async (format: 'csv' | 'excel' | 'pdf') => {
    try {
      toast.loading(`Preparing ${format.toUpperCase()} report...`, { id: 'export' });
      await downloadPayoutReport(format, { status: 'failed' });
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
                <span className="text-slate-900">Failed Transfers</span>
            </div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tight flex items-center gap-3">
              <FaExclamationTriangle className="text-rose-500" />
              Failed Transfers
            </h1>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 bg-white p-2 rounded-2xl shadow-sm border border-slate-50">
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

      <div className="grid gap-6">
        {loading ? (
          <div className="p-20 text-center text-slate-400 font-bold animate-pulse">Scanning error logs...</div>
        ) : payouts.length > 0 ? (
          payouts.map(p => (
            <div key={p._id} className="rounded-[2.5rem] bg-white p-8 shadow-sm border border-slate-50">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                <div className="flex items-center gap-8">
                  <div className="h-16 w-16 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center text-2xl shrink-0">
                    <FaWallet />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                    <div>
                      <p className="text-lg font-black text-slate-900">GHS {p.finalTransferAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Failed on {new Date(p.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</p>
                    </div>
                    <div className="border-l border-slate-100 pl-8">
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Attempted Destination</p>
                      <PayoutDestinationInfo payout={p} showReference={false} />
                    </div>
                  </div>
                </div>
                <button className="flex items-center gap-2 px-6 py-3 rounded-xl bg-blue-50 text-blue-600 text-xs font-black uppercase transition hover:bg-blue-100 shadow-sm shadow-blue-200">
                  <FaRedo /> Retry Transfer
                </button>
              </div>

              <div className="bg-rose-50 p-6 rounded-3xl border border-rose-100">
                 <p className="text-[10px] font-black text-rose-400 uppercase tracking-widest mb-1">Failure Reason</p>
                 <p className="text-sm font-bold text-rose-900 leading-relaxed">{p.failureReason || 'Generic payment provider error. Please verify account details.'}</p>
              </div>
            </div>
          ))
        ) : (
          <div className="rounded-[3rem] bg-white py-32 text-center shadow-sm">
            <div className="mx-auto mb-8 flex h-24 w-24 items-center justify-center rounded-full bg-emerald-50 text-4xl text-emerald-500">
              <FaCheckCircle />
            </div>
            <h2 className="text-3xl font-black text-slate-900">No failed transfers</h2>
            <p className="mt-4 text-slate-500 font-medium">All your payments are either paid or pending.</p>
          </div>
        )}
      </div>
    </div>
  );
}
