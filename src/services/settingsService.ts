import API from '../lib/axios';

export const getPublicSettings = async () => {
  const response = await API.get('/auth/settings/public');
  return response.data?.data || response.data;
};
