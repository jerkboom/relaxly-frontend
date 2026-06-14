import React from 'react';
import { FaPhoneAlt, FaBuilding, FaUser, FaInfoCircle } from 'react-icons/fa';
import { Payout } from '../../services/payoutService';

interface Props {
  payout: Payout;
  showReference?: boolean;
}

const PayoutDestinationInfo: React.FC<Props> = ({ payout, showReference = true }) => {
  // Use new snapshot fields if available, otherwise fallback to payoutMethod object
  const method = payout.transferMethod || payout.payoutMethod?.type;
  const provider = payout.provider || payout.payoutMethod?.provider || (method === 'bank' ? 'Bank' : 'Mobile Money');
  const accountNumber = payout.accountNumber || payout.payoutMethod?.accountNumber;
  const accountName = payout.accountName || payout.payoutMethod?.accountName;
  const bankName = payout.bankName || payout.payoutMethod?.provider || provider;

  if (!accountNumber) {
    return (
      <div className="flex items-center gap-2 text-slate-400">
        <FaInfoCircle className="text-xs" />
        <span className="text-[10px] font-bold uppercase tracking-tight italic">Destination details unavailable</span>
      </div>
    );
  }

  return (
    <div className="space-y-1.5">
      <div className="flex flex-col">
        <span className="text-sm font-black text-slate-900 flex items-center gap-1.5">
          {method === 'momo' ? <FaPhoneAlt className="text-[10px] text-blue-500" /> : <FaBuilding className="text-[10px] text-blue-500" />}
          {method === 'momo' ? `${provider} Mobile Money` : bankName}
        </span>
        <span className="text-xs font-bold text-slate-600 font-mono tracking-tight">{accountNumber}</span>
        {accountName && (
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter flex items-center gap-1 mt-0.5">
            <FaUser className="text-[8px]" /> {accountName}
          </span>
        )}
      </div>
      
      {showReference && (
        <div className="pt-1.5 border-t border-slate-50">
          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Reference</p>
          <p className="text-[10px] font-bold text-slate-400 font-mono break-all leading-tight">
            {payout.transferReference || payout._id.slice(-8).toUpperCase()}
          </p>
        </div>
      )}
    </div>
  );
};

export default PayoutDestinationInfo;
