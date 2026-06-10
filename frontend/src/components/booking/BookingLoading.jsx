import { LAYOUT_CONTAINER } from '../../constants/layoutContainer';

/** Tối thiểu hiển thị spinner — tránh nhấp nháy khi API trả về quá nhanh */
export const MIN_BOOKING_LOADING_MS = 550;

export function awaitMinLoadingDelay(startedAt, minMs = MIN_BOOKING_LOADING_MS) {
  const remaining = minMs - (Date.now() - startedAt);
  if (remaining <= 0) return Promise.resolve();
  return new Promise((resolve) => {
    window.setTimeout(resolve, remaining);
  });
}

export function LoadingRing({ size = 'lg', className = '' }) {
  const sizeClass =
    size === 'sm' ? 'app-loading-ring--sm' : size === 'md' ? 'app-loading-ring--md' : 'app-loading-ring--lg';

  return (
    <div className={['relative inline-flex items-center justify-center', className].join(' ')}>
      <div className={['app-loading-ring', sizeClass].join(' ')} aria-hidden />
      {size === 'lg' ? (
        <div
          className={[
            'app-loading-ring app-loading-ring--md app-loading-ring--reverse absolute',
          ].join(' ')}
          aria-hidden
        />
      ) : null}
    </div>
  );
}

export function BookingPageLoading({
  message = 'Đang tải dữ liệu…',
  title = 'Đang tải',
  variant = 'full',
}) {
  const wrapClass =
    variant === 'embedded'
      ? 'flex min-h-[min(50vh,400px)] items-center justify-center py-10'
      : [
          LAYOUT_CONTAINER,
          'flex min-h-[min(68vh,520px)] items-center justify-center pt-24 pb-16',
        ].join(' ');

  return (
    <div className={wrapClass}>
      <div
        className="flex w-full max-w-sm flex-col items-center rounded-3xl border border-black/5 bg-white px-8 py-14 text-center shadow-lg shadow-primary/5"
        role="status"
        aria-live="polite"
        aria-busy="true"
      >
        <LoadingRing size="lg" />
        <p className="mt-8 font-headline text-lg font-bold text-on-surface">{title}</p>
        <p className="mt-2 text-sm leading-relaxed text-on-surface-variant">{message}</p>
        <div className="mt-6 flex items-center gap-1.5" aria-hidden>
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary/70" />
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary/50 [animation-delay:150ms]" />
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary/30 [animation-delay:300ms]" />
        </div>
      </div>
    </div>
  );
}

export function BookingInlineLoading({ message }) {
  return (
    <p className="inline-flex items-center gap-3 rounded-xl border border-primary/15 bg-primary/5 px-4 py-3 text-sm text-on-surface-variant">
      <LoadingRing size="sm" />
      <span>{message}</span>
    </p>
  );
}

/** @deprecated Dùng BookingPageLoading — giữ export để tránh break import cũ */
export function PropertyListSkeleton() {
  return <BookingPageLoading message="Đang tải danh sách cơ sở…" title="Đang tải" />;
}

/** @deprecated Dùng BookingPageLoading */
export function RoomListSkeleton() {
  return <BookingPageLoading message="Đang tải danh sách phòng…" title="Đang tải" />;
}
