import axios from 'axios';
import toast from 'react-hot-toast';

import { useAuthStore } from '../store/authStore';

const API = axios.create({
  baseURL:
    process.env.NEXT_PUBLIC_API_URL ||
    'http://localhost:5000/api',

  headers: {
    'Content-Type': 'application/json',
  },
});

API.interceptors.request.use((config) => {
  if (typeof window === 'undefined') {
    return config;
  }

  const authStorage =
    window.localStorage.getItem(
      'auth-storage'
    );

  if (!authStorage) {
    return config;
  }

  try {
    const parsed = JSON.parse(authStorage);

    const token = parsed?.state?.token;

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  } catch (e) {
    console.error(
      'Auth storage parse error:',
      e
    );
  }

  return config;
});

API.interceptors.response.use(
  (response) => response,

  (error) => {
    if (typeof window !== 'undefined') {
      if (error?.response?.status === 401) {
        if (
          !window.location.pathname.startsWith(
            '/login'
          )
        ) {
          useAuthStore
            .getState()
            .logout();

          window.location.assign(
            '/login'
          );
        }
      } else if (error?.response?.status === 429) {
        toast.error(
          "Whoa there! You're moving too fast. Please wait a minute and try again.",
          { id: 'rate-limit-toast' } // Use an ID to prevent toast spam
        );
      }
    }

    return Promise.reject(error);
  }
);

export default API;