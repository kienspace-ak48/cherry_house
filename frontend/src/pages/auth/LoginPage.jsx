import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import AuthShell from '../../components/auth/AuthShell';
import { loginClient, startGoogleRegister } from '../../api/authApi';
import { isClientLoggedIn } from '../../lib/authStorage';
import {
  buildRegisterHref,
  getEffectiveAuthNextPath,
  isCheckoutReturnPath,
  navigateAfterAuth,
  stashAuthNextPath,
} from '../../lib/authRedirect';

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const passwordResetOk = location.state?.passwordReset === true;
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const sessionExpired = searchParams.get('session') === 'expired';
  const nextPath = getEffectiveAuthNextPath(searchParams, { allowStash: true });
  const returningToCheckout = isCheckoutReturnPath(nextPath);

  useEffect(() => {
    if (nextPath) stashAuthNextPath(nextPath);
  }, [nextPath]);

  useEffect(() => {
    if (isClientLoggedIn()) navigateAfterAuth(navigate, nextPath, { replace: true });
  }, [navigate, nextPath]);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await loginClient({ email: email.trim(), password });
      navigateAfterAuth(navigate, nextPath, { replace: true });
    } catch (err) {
      setError(err.message || 'Đăng nhập thất bại');
    } finally {
      setLoading(false);
    }
  }

  const inputClass =
    'w-full rounded-lg border border-outline-variant px-3 py-2.5 text-sm text-on-surface outline-none focus:ring-1 focus:ring-primary';

  return (
    <AuthShell
      title="Đăng nhập"
      subtitle={
        returningToCheckout
          ? 'Đăng nhập để tiếp tục đặt phòng. Cơ sở, phòng và ngày bạn đã chọn vẫn được giữ trong liên kết.'
          : 'Truy cập tài khoản Cherry House để quản lý đặt phòng và thông tin cá nhân.'
      }
      footer={
        <>
          Chưa có tài khoản?{' '}
          <Link to={buildRegisterHref(nextPath)} className="font-bold text-primary hover:underline">
            Đăng ký ngay
          </Link>
        </>
      }
    >
      {passwordResetOk ? (
        <div className="mb-4 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          Đã đặt lại mật khẩu thành công. Vui lòng đăng nhập bằng mật khẩu mới.
        </div>
      ) : null}

      {sessionExpired ? (
        <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.
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
            Email
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
        <div>
          <div className="mb-1.5 flex items-center justify-between gap-2">
            <label className="text-xs font-semibold text-on-surface" htmlFor="password">
              Mật khẩu
            </label>
            <Link
              to={nextPath ? `/forgot-password?next=${encodeURIComponent(nextPath)}` : '/forgot-password'}
              className="text-xs font-semibold text-primary hover:underline"
            >
              Quên mật khẩu?
            </Link>
          </div>
          <input
            id="password"
            type="password"
            className={inputClass}
            required
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl bg-primary py-3 text-sm font-bold text-white shadow-md shadow-primary/25 transition-all hover:brightness-110 disabled:opacity-60"
        >
          {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
        </button>
      </form>

      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-outline-variant/40" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-white px-2 text-on-surface-variant">hoặc</span>
        </div>
      </div>

      <button
        type="button"
        onClick={() => startGoogleRegister(nextPath)}
        className="flex w-full items-center justify-center gap-2 rounded-xl border border-outline-variant/50 bg-white py-3 text-sm font-bold text-on-surface shadow-sm transition-all hover:border-primary/30 hover:shadow-md"
      >
        <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden>
          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
        </svg>
        Tiếp tục với Google
      </button>
    </AuthShell>
  );
}
