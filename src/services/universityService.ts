import API from '../lib/axios';

export const getUniversities =
  async () => {
    const response =
      await API.get('/universities');

    return response.data;
  };