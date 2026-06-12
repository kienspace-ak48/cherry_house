import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { fetchPromoPopup } from '../../api/promoPopupApi';

const DISMISS_KEY = 'cherry_promo_popup_dismiss';
const PENDING_PROMO_KEY = 'cherry_pending_promo';

function formatValidTo(iso) {
  if (!iso) return '';
  try {
    const d = new Date(`${iso}T12:00:00`);
    return new Intl.DateTimeFormat('vi-VN', { day: 'numeric', month: 'short', year: 'numeric' }).format(d);
  } catch {
    return iso;
  }
}

function isDismissed(code, dismissHours) {
  try {
    const raw = localStorage.getItem(DISMISS_KEY);
    if (!raw) return false;
    const parsed = JSON.parse(raw);
    if (parsed?.code !== code) return false;
    const until = Number(parsed?.until);
    return Number.isFinite(until) && Date.now() < until;
  } catch {
    return false;
  }
}

function setDismissed(code, dismissHours) {
  const until = Date.now() + dismissHours * 60 * 60 * 1000;
  localStorage.setItem(DISMISS_KEY, JSON.stringify({ code, until }));
}

function matchesRoute(pathname, showOnRoutes) {
  const routes = Array.isArray(showOnRoutes) ? showOnRoutes : ['all'];
  if (routes.includes('all')) return true;
  if (routes.includes('/') && pathname === '/') return true;
  if (routes.includes('/booking') && (pathname === '/booking' || pathname.startsWith('/booking/'))) {
    return true;
  }
  if (routes.includes('/checkout') && (pathname === '/checkout' || pathname.startsWith('/checkout/'))) {
    return true;
  }
  return routes.some((r) => r !== 'all' && (pathname === r || pathname.startsWith(`${r}/`)));
}

export default function PromoPopupModal() {
  const location = useLocation();
  const [config, setConfig] = useState(null);
  const [visible, setVisible] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let cancelled = false;
    let timer;

    setVisible(false);

    async function load() {
      try {
        const data = await fetchPromoPopup();
        if (cancelled) return;
        setConfig(data);

        if (!data?.enabled || !data?.promo?.code) {
          if (import.meta.env.DEV) {
            console.info('[PromoPopup] Ẩn — popup tắt hoặc chưa có mã hợp lệ', data);
          }
          return;
        }
        if (!matchesRoute(location.pathname, data.showOnRoutes)) {
          if (import.meta.env.DEV) {
            console.info(
              '[PromoPopup] Ẩn — trang',
              location.pathname,
              'không nằm trong',
              data.showOnRoutes,
            );
          }
          return;
        }
        if (isDismissed(data.promo.code, data.dismissHours ?? 24)) {
          if (import.meta.env.DEV) {
            console.info(
              '[PromoPopup] Ẩn — đã đóng trước đó (xóa localStorage key',
              DISMISS_KEY,
              'để thử lại)',
            );
          }
          return;
        }

        const delayMs = Math.max(0, Number(data.delaySec) || 0) * 1000;
        timer = window.setTimeout(() => {
          if (!cancelled) setVisible(true);
        }, delayMs);
      } catch (err) {
        if (import.meta.env.DEV) {
          console.warn('[PromoPopup] Không tải được cấu hình:', err);
        }
      }
    }

    load();
    return () => {
      cancelled = true;
      if (timer) window.clearTimeout(timer);
    };
  }, [location.pathname]);

  const handleClose = () => {
    if (config?.promo?.code) {
      setDismissed(config.promo.code, config.dismissHours ?? 24);
    }
    setVisible(false);
  };

  const handleCopy = async () => {
    const code = config?.promo?.code;
    if (!code) return;
    try {
      await navigator.clipboard.writeText(code);
      sessionStorage.setItem(PENDING_PROMO_KEY, code);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      sessionStorage.setItem(PENDING_PROMO_KEY, code);
      setCopied(true);
    }
  };

  if (!visible || !config?.promo) return null;

  const { promo } = config;

  return (
    <div
      className="fixed inset-0 z-[110] flex items-center justify-center bg-on-surface/50 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="promo-popup-title"
      onClick={handleClose}
    >
      <div
        className="relative w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative bg-primary px-6 py-5 pr-14 text-white">
          <button
            type="button"
            onClick={handleClose}
            className="absolute top-3 right-3 z-10 flex h-9 w-9 cursor-pointer items-center justify-center rounded-full text-white transition-colors hover:bg-white/15"
            aria-label="Đóng"
          >
            <span className="material-symbols-outlined text-xl">close</span>
          </button>
          <p className="text-[10px] font-bold tracking-[0.2em] uppercase opacity-90">Cherry House</p>
          <h2 id="promo-popup-title" className="mt-2 font-headline text-xl font-bold">
            {config.title}
          </h2>
        </div>

        <div className="px-6 py-5">
          <p className="text-sm leading-relaxed text-on-surface-variant">{config.message}</p>

          <div className="mt-4 rounded-xl border-2 border-dashed border-primary/30 bg-primary/5 px-4 py-4 text-center">
            <p className="text-[10px] font-bold tracking-wide text-on-surface-variant uppercase">Mã của bạn</p>
            <p className="mt-1 font-headline text-2xl font-extrabold tracking-wider text-primary">
              {promo.code}
            </p>
            <p className="mt-2 text-sm font-semibold text-on-surface">{promo.discountLabel}</p>
            {promo.validTo ? (
              <p className="mt-1 text-xs text-on-surface-variant">
                Hạn dùng đến {formatValidTo(promo.validTo)}
              </p>
            ) : null}
          </div>

          <div className="mt-5 flex flex-col gap-2 sm:flex-row">
            <button
              type="button"
              onClick={handleCopy}
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-bold text-white shadow-md shadow-primary/25 transition-all hover:brightness-110"
            >
              <span className="material-symbols-outlined text-lg">content_copy</span>
              {copied ? 'Đã sao chép!' : config.ctaLabel || 'Sao chép mã'}
            </button>
            <Link
              to="/booking"
              onClick={handleClose}
              className="inline-flex flex-1 items-center justify-center rounded-xl border border-primary/20 px-4 py-3 text-sm font-bold text-primary transition-colors hover:bg-primary/5"
            >
              Đặt phòng ngay
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export { PENDING_PROMO_KEY };
