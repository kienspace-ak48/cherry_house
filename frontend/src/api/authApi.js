import axios from 'axios';
import { saveClientSession, clearClientSession } from '../lib/authStorage';

const authHttp = axios.create({
  baseURL: '',
  headers: { 'Content-Type': 'application/json' },
});

/** POST /auth/login — lưu token vào localStorage (React client) */
export async function loginClient({ email, password }) {
  const { data: json } = await authHttp.post('/auth/login', { email, password });
  if (!json.success) {
    throw new Error(json.message || 'Đăng nhập thất bại');
  }
  saveClientSession(json.data);
  return json.data;
}

export function logoutClient() {
  clearClientSession();
}
