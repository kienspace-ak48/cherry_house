import { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import AuthShell from '../../components/auth/AuthShell';
import RequiredMark from '../../components/auth/RequiredMark';
import { requestPasswordReset } from '../../api/authApi';
import { isClientLoggedIn } from '../../lib/authStorage';
import {
  buildLoginHref,
  getEffectiveAuthNextPath,
  navigateAfterAuth,
} from '../../lib/authRedirect';

export default function ForgotPasswordPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const nextPath = getEffectiveAuthNextPath(searchParams, { allowStash: true });
  const fromProfile = searchParams.get('from') === 'profile';
  const emailFromQuery = searchParams.get('email')?.trim() || '';
  const [email, setEmail] = useState(emailFromQuery);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');

  useEffect(() => {
    if (emailFromQuery) setEmail(emailFromQuery);
  }, [emailFromQuery]);

  useEffect(() => {
    if (fromProfile) return;
    if (isClientLoggedIn()) navigateAfterAuth(navigate, nextPath, { replace: true });
  }, [navigate, nextPath, fromProfile]);

  const inputClass =
    'w-full rounded-lg border border-outline-variant px-3 py-2.5 text-sm text-on-surface outline-none focus:ring-1 focus:ring-primary';

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setInfo('');
    setLoading(true);
    try {
      const result = await requestPasswordReset({ email: email.trim() });
      if (!result.expiresAt) {
        setInfo(
          result.message
            || 'Nếu email tồn tại trong hệ thống, bạn sẽ nhận được mã OTP trong hộp thư.',
        );
        return;
      }
      const params = new URLSearchParams({ email: result.email || email.trim() });
      if (fromProfile) params.set('from', 'profile');
      if (nextPath) params.set('next', nextPath);
      params.set('expiresAt', result.expiresAt);
      if (result.debugOtp) params.set('debugOtp', result.debugOtp);
      navigate(`/reset-password?${params.toString()}`);
    } catch (err) {
      setError(err.message || 'Không gửi được mã OTP');
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell
      title="Quên mật khẩu"
      subtitle="Nhập email đăng ký — chúng tôi gửi mã OTP để bạn đặt mật khẩu mới."
      footer={
        fromProfile ? (
          <Link to="/profile" className="text-primary hover:underline" state={{ openSection: 'password' }}>
            ← Quay lại tài khoản
          </Link>
        ) : (
          <Link to={buildLoginHref(nextPath)} className="text-primary hover:underline">
            ← Quay lại đăng nhập
          </Link>
        )
      }
    >
      {info ? (
        <div className="mb-4 rounded-lg border border-primary/20 bg-primary/5 px-4 py-3 text-sm text-on-surface">
          {info}
        </div>
      ) : null}

      {error ? (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      <form className="space-y-4" onSubmit={handleSubmit}>
        <div>
          <label className="mb-1.5 block text-xs font-semibold text-on-surface" htmlFor="email">
            Email đăng ký
            <RequiredMark />
          </label>
          <input
            id="email"
            type="email"
            className={inputClass}
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <p className="text-xs leading-relaxed text-on-surface-variant">
          Tài khoản đăng nhập bằng Google không dùng mật khẩu Cherry House — hãy chọn «Tiếp tục với
          Google» tại trang đăng nhập.
        </p>
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl bg-primary py-3 text-sm font-bold text-white shadow-md shadow-primary/25 transition-all hover:brightness-110 disabled:opacity-60"
        >
          {loading ? 'Đang gửi OTP...' : 'Gửi mã OTP'}
        </button>
      </form>
    </AuthShell>
  );
}
