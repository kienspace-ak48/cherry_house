import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import AuthShell from '../../components/auth/AuthShell';
import { saveClientSession } from '../../lib/authStorage';

export default function AuthCallbackPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [error, setError] = useState('');

  useEffect(() => {
    const token = searchParams.get('token');
    const refreshToken = searchParams.get('refreshToken') || '';
    const userRaw = searchParams.get('user');
    const err = searchParams.get('error');

    if (err) {
      setError(err);
      return;
    }
    if (!token || !userRaw) {
      setError('Thiếu thông tin đăng nhập từ Google');
      return;
    }
    try {
      const user = JSON.parse(userRaw);
      saveClientSession({ token, refreshToken: refreshToken || undefined, user });
      navigate('/profile', { replace: true });
    } catch {
      setError('Dữ liệu đăng nhập không hợp lệ');
    }
  }, [navigate, searchParams]);

  return (
    <AuthShell title="Đang đăng nhập..." subtitle="Vui lòng đợi trong giây lát.">
      {error ? (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      ) : (
        <div className="flex flex-col items-center gap-3 py-6 text-on-surface-variant">
          <span className="material-symbols-outlined animate-spin text-4xl text-primary">progress_activity</span>
          <p className="text-sm">Hoàn tất xác thực Google...</p>
        </div>
      )}
    </AuthShell>
  );
}
