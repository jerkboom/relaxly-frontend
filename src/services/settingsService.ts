import API from '../lib/axios';

export const getPublicSettings = async () => {
  const response = await API.get('/auth/settings/public');
  return response.data?.data || response.data;
};

export const getPublicStats = async () => {
  const response = await API.get('/analytics/public-stats');
  return response.data?.data || response.data;
};
