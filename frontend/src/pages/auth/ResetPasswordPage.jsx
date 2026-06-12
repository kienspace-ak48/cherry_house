import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import AuthShell from '../../components/auth/AuthShell';
import RequiredMark from '../../components/auth/RequiredMark';
import { confirmPasswordReset } from '../../api/authApi';
import { isClientLoggedIn } from '../../lib/authStorage';
import {
  buildLoginHref,
  getEffectiveAuthNextPath,
  navigateAfterAuth,
} from '../../lib/authRedirect';

const OTP_TTL_MS = 10 * 60 * 1000;

function formatCountdown(totalSeconds) {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const nextPath = getEffectiveAuthNextPath(searchParams, { allowStash: true });
  const email = useMemo(() => searchParams.get('email')?.trim() || '', [searchParams]);
  const fromProfile = searchParams.get('from') === 'profile';
  const debugOtpFromUrl = searchParams.get('debugOtp') || '';

  const [otp, setOtp] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [otpExpiresAt, setOtpExpiresAt] = useState(null);
  const [secondsLeft, setSecondsLeft] = useState(0);

  useEffect(() => {
    if (fromProfile) return;
    if (isClientLoggedIn()) navigateAfterAuth(navigate, nextPath, { replace: true });
  }, [navigate, nextPath, fromProfile]);

  useEffect(() => {
    if (!email) {
      navigate('/forgot-password', { replace: true });
      return;
    }
    const raw = searchParams.get('expiresAt');
    const expiresAt = raw ? new Date(raw).getTime() : Date.now() + OTP_TTL_MS;
    if (!Number.isNaN(expiresAt)) {
      setOtpExpiresAt(expiresAt);
      setSecondsLeft(Math.max(0, Math.floor((expiresAt - Date.now()) / 1000)));
    }
  }, [email, navigate, searchParams]);

  useEffect(() => {
    if (!otpExpiresAt) return undefined;
    const tick = () => {
      const left = Math.max(0, Math.floor((otpExpiresAt - Date.now()) / 1000));
      setSecondsLeft(left);
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [otpExpiresAt]);

  const otpExpired = secondsLeft === 0 && otpExpiresAt !== null;

  const inputClass =
    'w-full rounded-lg border border-outline-variant px-3 py-2.5 text-sm text-on-surface outline-none focus:ring-1 focus:ring-primary';

  async function handleSubmit(e) {
    e.preventDefault();
    if (otpExpired) {
      setError('Mã OTP đã hết hạn. Vui lòng gửi lại mã mới.');
      return;
    }
    if (password.length < 6) {
      setError('Mật khẩu tối thiểu 6 ký tự');
      return;
    }
    if (password !== confirmPassword) {
      setError('Mật khẩu nhập lại không khớp');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await confirmPasswordReset({
        email,
        otp: otp.trim(),
        newPassword: password,
      });
      if (fromProfile) {
        navigate('/profile', {
          replace: true,
          state: { openSection: 'password', passwordResetOk: true },
        });
        return;
      }
      navigate(buildLoginHref(nextPath), { replace: true, state: { passwordReset: true } });
    } catch (err) {
      setError(err.message || 'Không đặt lại được mật khẩu');
    } finally {
      setLoading(false);
    }
  }

  if (!email) return null;

  return (
    <AuthShell
      title="Đặt mật khẩu mới"
      subtitle={`Nhập mã OTP đã gửi tới ${email} và chọn mật khẩu mới.`}
      footer={
        <Link
          to={
            fromProfile && email
              ? `/forgot-password?from=profile&email=${encodeURIComponent(email)}`
              : '/forgot-password'
          }
          className="text-primary hover:underline"
        >
          ← Gửi lại OTP
        </Link>
      }
    >
      {error ? (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      {debugOtpFromUrl ? (
        <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          <strong>Dev mode:</strong> OTP = <code className="font-mono font-bold">{debugOtpFromUrl}</code>
        </div>
      ) : null}

      <form className="space-y-4" onSubmit={handleSubmit}>
        <div
          className={[
            'flex items-center justify-between rounded-xl border px-4 py-3',
            otpExpired
              ? 'border-red-200 bg-red-50 text-red-700'
              : secondsLeft <= 60
                ? 'border-amber-200 bg-amber-50 text-amber-900'
                : 'border-primary/20 bg-primary/5 text-on-surface',
          ].join(' ')}
        >
          <span className="flex items-center gap-2 text-sm font-medium">
            <span className="material-symbols-outlined text-[18px]">schedule</span>
            {otpExpired ? 'Mã OTP đã hết hạn' : 'Thời gian còn lại'}
          </span>
          <span className="font-mono text-lg font-bold tabular-nums tracking-wider">
            {formatCountdown(secondsLeft)}
          </span>
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-semibold text-on-surface" htmlFor="otp">
            Mã OTP (6 số)
            <RequiredMark />
          </label>
          <input
            id="otp"
            inputMode="numeric"
            pattern="\d{6}"
            maxLength={6}
            className={`${inputClass} text-center text-2xl font-bold tracking-[0.4em]`}
            required
            value={otp}
            onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
          />
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-semibold text-on-surface" htmlFor="password">
            Mật khẩu mới
            <RequiredMark />
          </label>
          <input
            id="password"
            type="password"
            className={inputClass}
            required
            minLength={6}
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-semibold text-on-surface" htmlFor="confirmPassword">
            Nhập lại mật khẩu mới
            <RequiredMark />
          </label>
          <input
            id="confirmPassword"
            type="password"
            className={inputClass}
            required
            minLength={6}
            autoComplete="new-password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
        </div>

        <button
          type="submit"
          disabled={loading || otp.length !== 6 || otpExpired}
          className="w-full rounded-xl bg-primary py-3 text-sm font-bold text-white shadow-md shadow-primary/25 transition-all hover:brightness-110 disabled:opacity-60"
        >
          {loading ? 'Đang cập nhật...' : 'Cập nhật mật khẩu'}
        </button>
      </form>
    </AuthShell>
  );
}
