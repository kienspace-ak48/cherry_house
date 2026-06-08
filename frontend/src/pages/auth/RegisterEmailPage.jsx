import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthShell from '../../components/auth/AuthShell';
import { sendRegisterOtp, verifyRegisterOtp } from '../../api/authApi';
import { isClientLoggedIn } from '../../lib/authStorage';

const INITIAL_FORM = {
  fullName: '',
  email: '',
  phone: '',
  password: '',
  confirmPassword: '',
};

const OTP_TTL_MS = 10 * 60 * 1000;

function formatCountdown(totalSeconds) {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

export default function RegisterEmailPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState('form');
  const [form, setForm] = useState(INITIAL_FORM);
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [debugOtp, setDebugOtp] = useState('');
  const [otpExpiresAt, setOtpExpiresAt] = useState(null);
  const [secondsLeft, setSecondsLeft] = useState(0);

  useEffect(() => {
    if (isClientLoggedIn()) navigate('/profile', { replace: true });
  }, [navigate]);

  useEffect(() => {
    if (step !== 'otp' || !otpExpiresAt) return undefined;
    const tick = () => {
      const left = Math.max(0, Math.floor((otpExpiresAt - Date.now()) / 1000));
      setSecondsLeft(left);
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [step, otpExpiresAt]);

  const otpExpired = step === 'otp' && secondsLeft === 0 && otpExpiresAt !== null;

  async function handleSendOtp(e) {
    e.preventDefault();
    setError('');
    if (form.password.length < 6) {
      setError('Mật khẩu tối thiểu 6 ký tự');
      return;
    }
    if (form.password !== form.confirmPassword) {
      setError('Mật khẩu nhập lại không khớp');
      return;
    }
    setLoading(true);
    try {
      const result = await sendRegisterOtp({
        fullName: form.fullName.trim(),
        email: form.email.trim(),
        phone: form.phone.trim() || undefined,
        password: form.password,
      });
      if (result.debugOtp) setDebugOtp(result.debugOtp);
      const expiresAt = result.expiresAt
        ? new Date(result.expiresAt).getTime()
        : Date.now() + OTP_TTL_MS;
      setOtpExpiresAt(expiresAt);
      setSecondsLeft(Math.max(0, Math.floor((expiresAt - Date.now()) / 1000)));
      setOtp('');
      setStep('otp');
    } catch (err) {
      setError(err.message || 'Gửi OTP thất bại');
    } finally {
      setLoading(false);
    }
  }

  async function handleVerifyOtp(e) {
    e.preventDefault();
    if (otpExpired) {
      setError('Mã OTP đã hết hạn. Vui lòng gửi lại mã mới.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await verifyRegisterOtp({
        email: form.email.trim(),
        otp: otp.trim(),
      });
      navigate('/profile', { replace: true });
    } catch (err) {
      setError(err.message || 'Mã OTP không đúng');
    } finally {
      setLoading(false);
    }
  }

  const inputClass =
    'w-full rounded-lg border border-outline-variant px-3 py-2.5 text-sm text-on-surface outline-none focus:ring-1 focus:ring-primary';

  return (
    <AuthShell
      title={step === 'form' ? 'Đăng ký bằng Email' : 'Nhập mã OTP'}
      subtitle={
        step === 'form'
          ? 'Email dùng để xác thực bạn không phải bot. Chúng tôi gửi mã 6 số sau khi bạn gửi form.'
          : `Mã đã gửi tới ${form.email}.`
      }
      footer={
        <>
          <Link to="/register" className="text-primary hover:underline">
            ← Quay lại chọn hình thức
          </Link>
        </>
      }
    >
      {error ? (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      {debugOtp ? (
        <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          <strong>Dev mode:</strong> OTP = <code className="font-mono font-bold">{debugOtp}</code>
        </div>
      ) : null}

      {step === 'form' ? (
        <form className="space-y-4" onSubmit={handleSendOtp}>
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-on-surface" htmlFor="fullName">
              Họ và tên
            </label>
            <input
              id="fullName"
              className={inputClass}
              required
              minLength={2}
              value={form.fullName}
              onChange={(e) => setForm((f) => ({ ...f, fullName: e.target.value }))}
            />
          </div>
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
              value={form.email}
              onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-on-surface" htmlFor="phone">
              Số điện thoại <span className="font-normal text-on-surface-variant">(tuỳ chọn)</span>
            </label>
            <input
              id="phone"
              type="tel"
              className={inputClass}
              autoComplete="tel"
              value={form.phone}
              onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-on-surface" htmlFor="password">
              Mật khẩu
            </label>
            <input
              id="password"
              type="password"
              className={inputClass}
              required
              minLength={6}
              autoComplete="new-password"
              value={form.password}
              onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-on-surface" htmlFor="confirmPassword">
              Nhập lại mật khẩu
            </label>
            <input
              id="confirmPassword"
              type="password"
              className={inputClass}
              required
              autoComplete="new-password"
              value={form.confirmPassword}
              onChange={(e) => setForm((f) => ({ ...f, confirmPassword: e.target.value }))}
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-primary py-3 text-sm font-bold text-white shadow-md shadow-primary/25 transition-all hover:brightness-110 disabled:opacity-60"
          >
            {loading ? 'Đang gửi OTP...' : 'Gửi mã xác thực'}
          </button>
        </form>
      ) : (
        <form className="space-y-4" onSubmit={handleVerifyOtp}>
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
          <button
            type="submit"
            disabled={loading || otp.length !== 6 || otpExpired}
            className="w-full rounded-xl bg-primary py-3 text-sm font-bold text-white shadow-md shadow-primary/25 transition-all hover:brightness-110 disabled:opacity-60"
          >
            {loading ? 'Đang xác thực...' : 'Hoàn tất đăng ký'}
          </button>
          <button
            type="button"
            className="w-full text-sm font-semibold text-primary hover:underline"
            onClick={() => {
              setStep('form');
              setOtp('');
              setOtpExpiresAt(null);
              setSecondsLeft(0);
              setError('');
            }}
          >
            {otpExpired ? 'Gửi lại OTP' : 'Sửa thông tin / gửi lại OTP'}
          </button>
        </form>
      )}
    </AuthShell>
  );
}
