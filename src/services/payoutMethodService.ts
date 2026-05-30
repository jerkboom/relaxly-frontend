import API from '../lib/axios';

export interface PayoutMethod {
  type: 'momo' | 'bank';
  accountName: string;
  verified: boolean;
  recipientCode?: string;
  momo?: {
    network: 'MTN' | 'TELECEL' | 'AIRTELTIGO';
    phoneNumber: string;
  };
  bank?: {
    bankName: string;
    accountNumber: string;
  };
}

export const getMyPayoutMethod = async () => {
  const response = await API.get('/payout-method/me');
  return response.data;
};

export const setupPayoutMethod = async (data: any) => {
  const response = await API.post('/payout-method/setup', data);
  return response.data;
};

export const updatePayoutMethod = async (data: any) => {
  const response = await API.put('/payout-method/update', data);
  return response.data;
};

export const verifyPayoutMethod = async () => {
  const response = await API.post('/payout-method/verify');
  return response.data;
};

export const payoutMethodService = {
  getMyPayoutMethod,
  setupPayoutMethod,
  updatePayoutMethod,
  verifyPayoutMethod
};
