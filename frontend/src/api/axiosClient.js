import axios from 'axios';
import { getClientToken } from '../lib/authStorage';

const VITE_ENV = import.meta.env.VITE_ENV;

const axiosClient = axios.create({
  baseURL: VITE_ENV === 'development' ? import.meta.env.VITE_API_URL : '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

axiosClient.interceptors.request.use((config) => {
  const token = getClientToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error.response?.data?.message;
    if (typeof message === 'string' && message.trim()) {
      return Promise.reject(new Error(message));
    }
    return Promise.reject(error);
  },
);

export default axiosClient;
