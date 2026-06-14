import API from '../lib/axios';

/**
 * Handles owner financial report exports for payouts.
 */
export const downloadPayoutReport = async (format: 'csv' | 'excel' | 'pdf', filters: any = {}) => {
  const params = new URLSearchParams();
  if (filters.status) params.append('status', filters.status);
  if (filters.startDate) params.append('startDate', filters.startDate);
  if (filters.endDate) params.append('endDate', filters.endDate);

  const response = await API.get(`/owner/reports/payouts/${format}?${params.toString()}`, {
    responseType: 'blob'
  });
  
  // Create download link
  const url = window.URL.createObjectURL(new Blob([response.data]));
  const link = document.createElement('a');
  link.href = url;
  
  let extension = format === 'csv' ? 'csv' : format === 'excel' ? 'xlsx' : 'pdf';
  const filename = `payout-report-${new Date().getTime()}.${extension}`;
  link.setAttribute('download', filename);
  
  document.body.appendChild(link);
  link.click();
  
  // Cleanup
  link.parentNode?.removeChild(link);
  window.URL.revokeObjectURL(url);
};

/**
 * Fetches earnings analytics data.
 */
export const getEarningsReport = async (filters: any = {}) => {
  const params = new URLSearchParams();
  if (filters.startDate) params.append('startDate', filters.startDate);
  if (filters.endDate) params.append('endDate', filters.endDate);

  const response = await API.get(`/owner/reports/earnings?${params.toString()}`);
  return response.data?.data || response.data;
};
