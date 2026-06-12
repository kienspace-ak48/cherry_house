import { useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import AuthShell from '../../components/auth/AuthShell';
import { startGoogleRegister } from '../../api/authApi';
import { isClientLoggedIn } from '../../lib/authStorage';
import {
  buildLoginHref,
  buildRegisterEmailHref,
  getEffectiveAuthNextPath,
  isCheckoutReturnPath,
  navigateAfterAuth,
  stashAuthNextPath,
} from '../../lib/authRedirect';

export default function RegisterPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const error = searchParams.get('error');
  const nextPath = getEffectiveAuthNextPath(searchParams, { allowStash: true });
  const returningToCheckout = isCheckoutReturnPath(nextPath);

  useEffect(() => {
    if (nextPath) stashAuthNextPath(nextPath);
  }, [nextPath]);

  useEffect(() => {
    if (isClientLoggedIn()) navigateAfterAuth(navigate, nextPath, { replace: true });
  }, [navigate, nextPath]);

  return (
    <AuthShell
      title="Tạo tài khoản"
      subtitle={
        returningToCheckout
          ? 'Tạo tài khoản để hoàn tất đặt phòng. Lựa chọn cơ sở và phòng của bạn vẫn được giữ.'
          : 'Chọn cách đăng ký để đặt phòng, theo dõi booking và nhận ưu đãi thành viên.'
      }
      footer={
        <>
          Đã có tài khoản?{' '}
          <Link to={buildLoginHref(nextPath)} className="font-bold text-primary hover:underline">
            Đăng nhập
          </Link>
        </>
      }
    >
      {error ? (
        <div className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      <div className="space-y-3">
        <Link
          to={buildRegisterEmailHref(nextPath)}
          className="flex w-full items-center gap-4 rounded-xl border border-outline-variant/40 bg-white px-5 py-4 text-left shadow-sm transition-all hover:border-primary/40 hover:shadow-md"
        >
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
            <span className="material-symbols-outlined">mail</span>
          </span>
          <span className="min-w-0 flex-1">
            <span className="block font-headline text-base font-bold text-on-surface">
              Đăng ký bằng Email
            </span>
            <span className="mt-0.5 block text-xs text-on-surface-variant">
              Điền thông tin → nhận mã OTP qua email để xác thực
            </span>
          </span>
          <span className="material-symbols-outlined shrink-0 text-on-surface-variant">chevron_right</span>
        </Link>

        <button
          type="button"
          onClick={() => startGoogleRegister(nextPath)}
          className="flex w-full items-center gap-4 rounded-xl border border-outline-variant/40 bg-white px-5 py-4 text-left shadow-sm transition-all hover:border-primary/40 hover:shadow-md"
        >
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-surface-container-low">
            <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden>
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
          </span>
          <span className="min-w-0 flex-1">
            <span className="block font-headline text-base font-bold text-on-surface">
              Đăng ký bằng Google
            </span>
            <span className="mt-0.5 block text-xs text-on-surface-variant">
              Một chạm — không cần mật khẩu, xác thực qua tài khoản Google
            </span>
          </span>
          <span className="material-symbols-outlined shrink-0 text-on-surface-variant">chevron_right</span>
        </button>
      </div>
    </AuthShell>
  );
}
