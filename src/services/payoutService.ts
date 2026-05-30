import API from '../lib/axios';

export interface PayoutSummary {
  totalPaidOut: number;
  pendingPayouts: number;
  failedPayouts: number;
  lifetimeEarnings: number;
}

export interface Payout {
  _id: string;
  hostel: {
    _id: string;
    name: string;
  };
  booking: {
    _id: string;
    bookingCode: string;
    student: {
      name: string;
    };
  };
  amount: number;
  commissionAmount: number;
  paystackFee: number;
  finalTransferAmount: number;
  status: 'pending' | 'approved' | 'processing' | 'otp_pending' | 'paid' | 'failed' | 'otp_failed' | 'cancelled';
  payoutMethod?: {
    type: 'momo' | 'bank';
    accountName: string;
    accountNumber: string;
    bankCode?: string;
    provider?: string;
  };
  transferReference?: string;
  transferCode?: string;
  failureReason?: string;
  createdAt: string;
  processedAt?: string;
  currency: string;
}

export interface PayoutHistoryResponse {
  success: boolean;
  data: {
    summary: PayoutSummary;
    payouts: Payout[];
    pagination: {
      total: number;
      page: number;
      limit: number;
      pages: number;
    };
  };
}

export const getPayoutHistory = async (params: {
  status?: string;
  hostelId?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}): Promise<PayoutHistoryResponse> => {
  const response = await API.get('/payouts/my-history', { params });
  return response.data;
};
