import React from 'react';
import { FaShieldAlt } from 'react-icons/fa';

interface PaymentBreakdownProps {
  roomPrice?: number;
  bookingFee?: number;
  serviceFeePercent?: number;
  totalPaid?: number;
  discount?: number;
  loading?: boolean;
  currency?: string;
}

/**
 * PaymentBreakdown Component
 * 
 * Displays a clean breakdown of the payment for students before checkout.
 * Only exposes public-facing fields.
 */
const PaymentBreakdown: React.FC<PaymentBreakdownProps> = ({
  roomPrice,
  bookingFee,
  serviceFeePercent,
  totalPaid,
  discount,
  loading = false,
  currency = 'GHS',
}) => {
  const formatter = new Intl.NumberFormat('en-GH', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
  });

  if (loading) {
    return (
      <div className="animate-pulse space-y-4 rounded-[2rem] bg-white p-8 shadow-lg ring-8 ring-slate-100">
        <div className="h-6 w-1/2 rounded bg-slate-200" />
        <div className="space-y-3">
          <div className="h-4 w-full rounded bg-slate-100" />
          <div className="h-4 w-full rounded bg-slate-100" />
        </div>
        <div className="mt-6 h-10 w-full rounded bg-slate-200" />
      </div>
    );
  }

  if (
    roomPrice === undefined ||
    bookingFee === undefined ||
    totalPaid === undefined
  ) {
    return (
      <div className="rounded-[2.5rem] bg-white p-8 text-center shadow-2xl shadow-slate-200/50 ring-1 ring-slate-100/50 sm:p-10">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-3xl bg-blue-50 text-blue-600">
          <FaShieldAlt className="text-2xl" />
        </div>
        <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">
          Booking Summary
        </p>
        <p className="mt-4 text-base font-medium leading-relaxed text-slate-500">
          Complete the initial step to view your full payment breakdown.
        </p>
      </div>
    );
  }

  return (
    <div className="group overflow-hidden rounded-[2.5rem] bg-white shadow-2xl shadow-slate-200/60 ring-1 ring-slate-100/50 transition-all duration-500 hover:shadow-blue-500/5">
      {/* Top Header Section with subtle gradient */}
      <div className="bg-gradient-to-br from-white to-slate-50/50 p-8 pb-4 sm:p-10 sm:pb-6">
        <h2 className="text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">Payment Summary</h2>
        <p className="mt-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Transaction Details</p>
      </div>

      <div className="px-8 pb-8 pt-0 sm:px-10 sm:pb-10">
        <div className="space-y-6">
          {/* Room Price */}
          <div className="flex items-center justify-between border-b border-slate-100 pb-5 transition-colors group-hover:border-blue-100">
            <div className="flex flex-col">
              <span className="text-sm font-bold text-slate-600">
                Base Room Rate
              </span>
              <span className="text-[9px] font-black uppercase tracking-widest text-slate-300">Standard pricing applied</span>
            </div>
            <span className="text-xl font-black text-slate-900">
              {formatter.format(roomPrice)}
            </span>
          </div>

          {/* Booking Fee */}
          <div className="flex items-center justify-between border-b border-slate-100 pb-5 transition-colors group-hover:border-blue-100">
            <div className="flex flex-col">
              <span className="text-sm font-bold text-slate-600">
                Service & Processing
              </span>
              <span className="text-[9px] font-black uppercase tracking-widest text-slate-300">
                {serviceFeePercent !== undefined ? `${serviceFeePercent}% Platform Fee` : 'Secure platform fee'}
              </span>
            </div>
            <span className="text-xl font-black text-emerald-600">
              {formatter.format(bookingFee)}
            </span>
          </div>

          {/* Discount (Optional) */}
          {discount !== undefined && discount > 0 && (
            <div className="flex items-center justify-between border-b border-slate-100 pb-5">
              <div className="flex flex-col">
                <span className="text-sm font-bold text-slate-600">
                  Special Discount
                </span>
                <span className="text-[9px] font-black uppercase tracking-widest text-rose-300">Applied successfully</span>
              </div>
              <span className="text-xl font-black text-rose-500">
                -{formatter.format(discount)}
              </span>
            </div>
          )}

          {/* Total Payable */}
          <div className="mt-10 overflow-hidden rounded-[2rem] bg-slate-900 p-8 text-white shadow-2xl shadow-slate-900/20 transition-all duration-500 group-hover:bg-blue-600 group-hover:shadow-blue-600/20">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 group-hover:text-blue-200">
                  Total Amount
                </h3>
                <p className="mt-1 text-[11px] font-medium text-slate-500 group-hover:text-blue-100">Final price, no hidden fees</p>
              </div>
              <div className="text-right">
                <span className="text-4xl font-black tracking-tighter text-white">
                  {formatter.format(totalPaid)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Informational Note */}
        <div className="mt-10 flex items-center justify-center gap-3 rounded-2xl bg-blue-50/50 px-4 py-4 text-blue-700 ring-1 ring-blue-100/50 transition-all group-hover:bg-blue-100/30">
          <FaShieldAlt className="text-lg animate-pulse" />
          <span className="text-[10px] font-black uppercase tracking-widest">Securely processed by Paystack</span>
        </div>
      </div>
    </div>
  );
};

export default PaymentBreakdown;
