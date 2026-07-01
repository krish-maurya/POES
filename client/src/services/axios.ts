import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios';
import { toast } from 'react-toastify';
import { API_BASE_URL } from '@/constants';
import { useAuthStore } from '@/store';
import { getErrorMessage } from '@/utils/errors';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    const status = error.response?.status;

    if (status === 401) {
      useAuthStore.getState().logout();
      toast.error('Session expired. Please log in again.');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
      return Promise.reject(error);
    }

    if (status === 403) {
      toast.error('You do not have permission to perform this action.');
      return Promise.reject(error);
    }

    if (status === 404) {
      toast.error('The requested resource was not found.');
      return Promise.reject(error);
    }

    if (status && status >= 500) {
      toast.error('Server error. Please try again later.');
      return Promise.reject(error);
    }

    if (status === 400) {
      toast.error(getErrorMessage(error));
      return Promise.reject(error);
    }

    toast.error(getErrorMessage(error));
    return Promise.reject(error);
  },
);

export default api;
