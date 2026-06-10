import axios from 'axios';
import axiosClient from './axiosClient';
import {
  saveClientSession,
  clearClientSession,
  getClientToken,
  getClientRefreshToken,
} from '../lib/authStorage';
import { syncProfileContactFromUser } from '../data/profileContact';

const VITE_ENV = import.meta.env.VITE_ENV;
const API_BASE =
  VITE_ENV === 'development' ? import.meta.env.VITE_API_URL : '/api';

/** Gửi OTP đăng ký sau khi điền form */
export async function sendRegisterOtp(payload) {
  const { data } = await axiosClient.post('/auth/register/send-otp', payload);
  if (!data.success) throw new Error(data.message || 'Gửi OTP thất bại');
  return data.data;
}

/** Xác thực OTP và tạo tài khoản */
export async function verifyRegisterOtp(payload) {
  const { data } = await axiosClient.post('/auth/register/verify-otp', payload);
  if (!data.success) throw new Error(data.message || 'Xác thực thất bại');
  saveClientSession(data.data);
  if (data.data?.user) syncProfileContactFromUser(data.data.user);
  return data.data;
}

/** Đăng nhập email + mật khẩu */
export async function loginClient({ email, password }) {
  const { data } = await axiosClient.post('/auth/login', { email, password });
  if (!data.success) throw new Error(data.message || 'Đăng nhập thất bại');
  saveClientSession(data.data);
  if (data.data?.user) syncProfileContactFromUser(data.data.user);
  return data.data;
}

export async function fetchMe() {
  const { data } = await axiosClient.get('/auth/me');
  if (!data.success) throw new Error(data.message || 'Không tải được tài khoản');
  return data.data;
}

/** Đổi refresh token lấy access token mới */
export async function refreshClientSession() {
  const refreshToken = getClientRefreshToken();
  if (!refreshToken) {
    throw new Error('Missing refresh token');
  }

  const { data } = await axios.post(`${API_BASE}/auth/refresh`, { refreshToken });
  if (!data.success) throw new Error(data.message || 'Phiên đăng nhập hết hạn');
  saveClientSession(data.data);
  return data.data;
}

/** Lấy profile mới nhất từ server và cập nhật localStorage */
export async function refreshClientProfile() {
  const user = await fetchMe();
  const token = getClientToken();
  const refreshToken = getClientRefreshToken();
  if (token || refreshToken) {
    saveClientSession({ token, refreshToken, user });
  }
  syncProfileContactFromUser(user);
  return user;
}

export async function logoutClient() {
  const refreshToken = getClientRefreshToken();
  try {
    if (refreshToken) {
      await axiosClient.post('/auth/logout', { refreshToken });
    }
  } catch {
    // vẫn xóa local dù API lỗi
  }
  clearClientSession();
}

export function startGoogleRegister() {
  window.location.href = '/api/auth/google';
}
