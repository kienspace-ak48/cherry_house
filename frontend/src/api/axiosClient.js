import axios from 'axios';
import {
  getClientToken,
  clearClientSession,
  saveClientSession,
  getClientRefreshToken,
} from '../lib/authStorage';

const VITE_ENV = import.meta.env.VITE_ENV;
const API_BASE =
  VITE_ENV === 'development' ? import.meta.env.VITE_API_URL : '/api';

const axiosClient = axios.create({
  baseURL: API_BASE,
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

let refreshPromise = null;

async function tryRefreshSession() {
  const refreshToken = getClientRefreshToken();
  if (!refreshToken) {
    throw new Error('No refresh token');
  }

  const { data } = await axios.post(`${API_BASE}/auth/refresh`, { refreshToken });
  if (!data?.success) {
    throw new Error(data?.message || 'Refresh failed');
  }
  saveClientSession(data.data);
  return data.data;
}

axiosClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;
    const status = error.response?.status;
    const code = error.response?.data?.code;
    const isAuthEndpoint =
      typeof original?.url === 'string'
      && (original.url.includes('/auth/refresh') || original.url.includes('/auth/login'));

    if (
      status === 401
      && !original?._retry
      && !isAuthEndpoint
      && (code === 'ACCESS_TOKEN_EXPIRED' || code === 'AUTH_REQUIRED' || !code)
      && getClientRefreshToken()
    ) {
      original._retry = true;
      try {
        if (!refreshPromise) {
          refreshPromise = tryRefreshSession().finally(() => {
            refreshPromise = null;
          });
        }
        await refreshPromise;
        const newToken = getClientToken();
        if (newToken) {
          original.headers.Authorization = `Bearer ${newToken}`;
        }
        return axiosClient(original);
      } catch {
        clearClientSession();
        if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/login')) {
          window.location.href = '/login?session=expired';
        }
      }
    }

    const message = error.response?.data?.message;
    if (typeof message === 'string' && message.trim()) {
      return Promise.reject(new Error(message));
    }
    return Promise.reject(error);
  },
);

export default axiosClient;
