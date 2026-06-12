import { useEffect, useState } from 'react';
import RequiredMark from '../auth/RequiredMark';
import { confirmEmailChange, requestEmailChange } from '../../api/authApi';

const OTP_TTL_MS = 10 * 60 * 1000;

function formatCountdown(totalSeconds) {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

/**
 * @param {{
 *   open: boolean;
 *   currentEmail: string;
 *   authProvider?: string;
 *   onClose: () => void;
 *   onSuccess: (user: object) => void;
 * }} props
 */
export default function ChangeEmailModal({
  open,
  currentEmail,
  authProvider,
  onClose,
  onSuccess,
}) {
  const isGoogle = authProvider === 'google';
  const [step, setStep] = useState('form');
  const [newEmail, setNewEmail] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [debugOtp, setDebugOtp] = useState('');
  const [otpExpiresAt, setOtpExpiresAt] = useState(null);
  const [secondsLeft, setSecondsLeft] = useState(0);

  useEffect(() => {
    if (!open) return;
    setStep('form');
    setNewEmail('');
    setCurrentPassword('');
    setOtp('');
    setError('');
    setDebugOtp('');
    setOtpExpiresAt(null);
    setSecondsLeft(0);
  }, [open]);

  useEffect(() => {
    if (!open || step !== 'otp' || !otpExpiresAt) return undefined;
    const tick = () => {
      const left = Math.max(0, Math.floor((otpExpiresAt - Date.now()) / 1000));
      setSecondsLeft(left);
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [open, step, otpExpiresAt]);

  const otpExpired = step === 'otp' && secondsLeft === 0 && otpExpiresAt !== null;

  if (!open) return null;

  const inputClass =
    'w-full rounded-lg border border-outline-variant px-3 py-2.5 text-sm text-on-surface outline-none focus:ring-1 focus:ring-primary';

  async function handleRequest(e) {
    e.preventDefault();
    setError('');
    const trimmedEmail = newEmail.trim();
    if (!trimmedEmail) {
      setError('Vui lòng nhập email mới');
      return;
    }
    if (!isGoogle && !currentPassword) {
      setError('Vui lòng nhập mật khẩu hiện tại');
      return;
    }
    setLoading(true);
    try {
      const result = await requestEmailChange({
        newEmail: trimmedEmail,
        currentPassword: isGoogle ? undefined : currentPassword,
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
      setError(err.message || 'Không gửi được mã OTP');
    } finally {
      setLoading(false);
    }
  }

  async function handleConfirm(e) {
    e.preventDefault();
    if (otpExpired) {
      setError('Mã OTP đã hết hạn. Vui lòng gửi lại mã mới.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const user = await confirmEmailChange({ otp: otp.trim() });
      onSuccess(user);
      onClose();
    } catch (err) {
      setError(err.message || 'Mã OTP không đúng');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-[120] flex items-center justify-center bg-on-surface/50 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="change-email-title"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="border-b border-outline-variant/30 bg-surface-container-low/40 px-5 py-4">
          <button
            type="button"
            onClick={onClose}
            className="absolute top-3 right-3 flex h-9 w-9 cursor-pointer items-center justify-center rounded-full text-on-surface-variant transition-colors hover:bg-black/5"
            aria-label="Đóng"
          >
            <span className="material-symbols-outlined text-xl">close</span>
          </button>
          <h2 id="change-email-title" className="font-headline text-lg font-bold text-on-surface">
            {step === 'form' ? 'Đổi email đăng nhập' : 'Nhập mã OTP'}
          </h2>
          <p className="mt-1 text-xs text-on-surface-variant">
            {step === 'form'
              ? `Email hiện tại: ${currentEmail}`
              : `Mã đã gửi tới ${currentEmail}. Nhập OTP để xác nhận đổi sang ${newEmail.trim()}.`}
          </p>
        </div>

        <div className="px-5 py-4">
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
            <form className="space-y-4" onSubmit={handleRequest}>
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-on-surface" htmlFor="newEmail">
                  Email mới
                  <RequiredMark />
                </label>
                <input
                  id="newEmail"
                  type="email"
                  className={inputClass}
                  required
                  autoComplete="email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                />
              </div>
              {!isGoogle ? (
                <div>
                  <label
                    className="mb-1.5 block text-xs font-semibold text-on-surface"
                    htmlFor="currentPassword"
                  >
                    Mật khẩu hiện tại
                    <RequiredMark />
                  </label>
                  <input
                    id="currentPassword"
                    type="password"
                    className={inputClass}
                    required
                    autoComplete="current-password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                  />
                </div>
              ) : (
                <p className="text-xs leading-relaxed text-on-surface-variant">
                  Tài khoản Google — chỉ cần xác minh OTP gửi tới email hiện tại.
                </p>
              )}
              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl bg-primary py-3 text-sm font-bold text-white shadow-md shadow-primary/25 transition-all hover:brightness-110 disabled:opacity-60"
              >
                {loading ? 'Đang gửi OTP...' : 'Gửi mã xác thực'}
              </button>
            </form>
          ) : (
            <form className="space-y-4" onSubmit={handleConfirm}>
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
                <label className="mb-1.5 block text-xs font-semibold text-on-surface" htmlFor="changeEmailOtp">
                  Mã OTP (6 số)
                  <RequiredMark />
                </label>
                <input
                  id="changeEmailOtp"
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
                {loading ? 'Đang xác nhận...' : 'Xác nhận đổi email'}
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
                {otpExpired ? 'Gửi lại OTP' : 'Quay lại / gửi lại OTP'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
