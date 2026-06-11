import { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { LoadingRing } from './booking/BookingLoading';
import { awaitMinDelay } from '../lib/loadingDelay';

/**
 * Overlay loading khi đổi pathname (Home → Profile, Booking → Checkout…).
 * Không chạy khi chỉ đổi query trên cùng route (vd. các bước /booking?…).
 */
export default function RouteTransitionLoading() {
  const { pathname } = useLocation();
  const [visible, setVisible] = useState(false);
  const prevPathRef = useRef(pathname);
  const isFirstRender = useRef(true);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      prevPathRef.current = pathname;
      return undefined;
    }

    if (prevPathRef.current === pathname) return undefined;
    prevPathRef.current = pathname;

    let cancelled = false;
    const shownAt = Date.now();
    setVisible(true);

    (async () => {
      await awaitMinDelay(shownAt);
      if (!cancelled) setVisible(false);
    })();

    return () => {
      cancelled = true;
      setVisible(false);
    };
  }, [pathname]);

  if (!visible) return null;

  return (
    <div
      className="fixed inset-0 z-[98] flex items-center justify-center bg-surface/80 px-4 backdrop-blur-[3px]"
      role="status"
      aria-live="polite"
      aria-busy="true"
      aria-label="Đang chuyển trang"
    >
      <div className="flex max-w-xs flex-col items-center rounded-3xl border border-black/5 bg-white px-8 py-10 text-center shadow-xl shadow-primary/10">
        <LoadingRing size="lg" />
        <p className="mt-6 font-headline text-base font-bold text-on-surface">Đang tải</p>
        <p className="mt-1.5 text-sm text-on-surface-variant">Vui lòng đợi trong giây lát…</p>
      </div>
    </div>
  );
}
