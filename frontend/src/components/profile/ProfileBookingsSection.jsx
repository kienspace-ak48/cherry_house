import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import bookingApi from '../../api/bookingApi';

const STATUS_META = {
  pending_payment: { label: 'Chờ thanh toán', tone: 'text-amber-700 bg-amber-50 border-amber-200' },
  confirmed: { label: 'Chưa check-in', tone: 'text-tertiary bg-tertiary/10 border-tertiary/30' },
  checked_in: { label: 'Đã check-in', tone: 'text-primary bg-primary/10 border-primary/20' },
  cancelled: { label: 'Đã hủy', tone: 'text-on-surface-variant bg-surface-container-low border-outline-variant/40' },
  completed: { label: 'Hoàn tất', tone: 'text-primary bg-primary/10 border-primary/20' },
  draft: { label: 'Nháp', tone: 'text-on-surface-variant bg-surface-container-low border-outline-variant/40' },
  no_show: { label: 'Không đến', tone: 'text-error bg-error/10 border-error/20' },
};

const FILTERS = [
  { id: 'all', label: 'Tất cả' },
  { id: 'upcoming', label: 'Sắp tới' },
  { id: 'past', label: 'Đã qua' },
  { id: 'pending', label: 'Chờ TT' },
];

const PAGE_SIZE = 10;

function fmtMoney(amountVnd) {
  return `${new Intl.NumberFormat('vi-VN').format(Math.round(amountVnd))}đ`;
}

function fmtDateRange(checkIn, checkOut) {
  const fmt = new Intl.DateTimeFormat('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
  return `${fmt.format(new Date(`${checkIn}T12:00:00`))} – ${fmt.format(new Date(`${checkOut}T12:00:00`))}`;
}

function paymentMethodLabel(method) {
  if (method === 'card') return 'Thẻ / VNPay';
  if (method === 'bank') return 'Chuyển khoản';
  if (method === 'wallet') return 'Ví / QR';
  if (method === 'momo') return 'MoMo';
  if (method === 'cherry_wallet') return 'Ví Cherry House';
  return method || '—';
}

function CancelBookingModal({ booking, preview, loading, error, onClose, onConfirm }) {
  if (!booking) return null;

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/40 p-4" role="dialog" aria-modal="true">
      <div className="w-full max-w-md rounded-xl bg-white p-5 shadow-xl">
        <h3 className="font-headline text-base font-bold text-on-surface">Hủy đặt phòng</h3>
        <p className="mt-2 text-sm text-on-surface-variant">
          Mã <strong>{booking.bookingCode}</strong> · {booking.propertyName}
        </p>
        {loading ? (
          <p className="mt-4 text-sm text-on-surface-variant">Đang kiểm tra chính sách…</p>
        ) : preview ? (
          <div className="mt-4 rounded-lg border border-outline-variant/40 bg-surface-container-low/50 p-3 text-sm">
            <p className="font-semibold text-on-surface">{preview.policy?.policyLabel || preview.policyLabel}</p>
            <p className="mt-1 text-on-surface-variant">{preview.policy?.message || preview.message}</p>
          </div>
        ) : null}
        {error ? <p className="mt-3 text-sm text-error">{error}</p> : null}
        <div className="mt-5 flex flex-wrap justify-end gap-2">
          <button
            type="button"
            className="rounded-lg border border-outline-variant/40 px-4 py-2 text-xs font-bold text-on-surface"
            onClick={onClose}
            disabled={loading}
          >
            Đóng
          </button>
          <button
            type="button"
            className="rounded-lg bg-error px-4 py-2 text-xs font-bold text-on-error shadow-sm transition-colors hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
            onClick={onConfirm}
            disabled={loading || !preview}
          >
            Xác nhận hủy
          </button>
        </div>
      </div>
    </div>
  );
}

function BookingCard({ booking, onCancelRequest }) {
  const status = STATUS_META[booking.status] || {
    label: booking.status,
    tone: 'text-on-surface-variant bg-surface-container-low border-outline-variant/40',
  };
  const paid = booking.payment?.status === 'paid' || booking.status === 'confirmed';

  return (
    <article className="rounded-xl border border-outline-variant/30 bg-white p-4 shadow-sm md:p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="font-headline text-sm font-bold text-on-surface">{booking.propertyName}</p>
          <p className="mt-0.5 text-xs text-on-surface-variant">
            {booking.branchName} · Phòng {booking.roomCode}
          </p>
        </div>
        <span
          className={[
            'shrink-0 rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide',
            status.tone,
          ].join(' ')}
        >
          {status.label}
        </span>
      </div>

      <dl className="mt-4 grid grid-cols-1 gap-2 text-xs sm:grid-cols-2">
        <div>
          <dt className="text-[10px] font-bold uppercase tracking-wide text-on-surface-variant/80">Mã đặt phòng</dt>
          <dd className="mt-0.5 font-semibold text-on-surface">{booking.bookingCode}</dd>
        </div>
        <div>
          <dt className="text-[10px] font-bold uppercase tracking-wide text-on-surface-variant/80">Tổng tiền</dt>
          <dd className="mt-0.5 font-semibold text-primary">{fmtMoney(booking.totalVnd)}</dd>
        </div>
        <div>
          <dt className="text-[10px] font-bold uppercase tracking-wide text-on-surface-variant/80">Nhận / Trả phòng</dt>
          <dd className="mt-0.5 text-on-surface">
            {fmtDateRange(booking.checkIn, booking.checkOut)}
            <span className="text-on-surface-variant"> ({booking.nights} đêm)</span>
          </dd>
        </div>
        <div>
          <dt className="text-[10px] font-bold uppercase tracking-wide text-on-surface-variant/80">Thanh toán</dt>
          <dd className="mt-0.5 text-on-surface">
            {paymentMethodLabel(booking.payment?.method)}
            {paid ? ' · Đã thanh toán' : ' · Chưa thanh toán'}
          </dd>
        </div>
      </dl>

      <div className="mt-4 flex flex-wrap gap-2">
        {booking.status === 'pending_payment' ? (
          <>
            <Link
              to={`/checkout/result?bookingCode=${encodeURIComponent(booking.bookingCode)}`}
              className="inline-flex items-center gap-1 rounded-lg bg-primary px-3 py-2 text-xs font-bold text-on-primary"
            >
              <span className="material-symbols-outlined text-[16px]">payments</span>
              Kiểm tra thanh toán
            </Link>
            <Link
              to="/booking"
              className="inline-flex items-center gap-1 rounded-lg border border-outline-variant/40 px-3 py-2 text-xs font-bold text-on-surface"
            >
              Đặt phòng mới
            </Link>
          </>
        ) : null}
        {paid ? (
          <Link
            to={`/checkout/result?bookingCode=${encodeURIComponent(booking.bookingCode)}`}
            className="inline-flex items-center gap-1 rounded-lg border border-tertiary/40 bg-tertiary/5 px-3 py-2 text-xs font-bold text-tertiary"
          >
            <span className="material-symbols-outlined text-[16px]">qr_code_2</span>
            Xem mã QR check-in
          </Link>
        ) : null}
        {['confirmed', 'pending_payment'].includes(booking.status) ? (
          <button
            type="button"
            onClick={() => onCancelRequest?.(booking)}
            className="inline-flex items-center gap-1 rounded-lg border border-error/35 bg-error-container px-3 py-2 text-xs font-bold text-error transition-colors hover:bg-error/10"
          >
            <span className="material-symbols-outlined text-[16px]">cancel</span>
            Hủy đặt phòng
          </button>
        ) : null}
      </div>
    </article>
  );
}

function BookingsPagination({ page, totalPages, total, pageSize, onPageChange, loading }) {
  if (totalPages <= 1) return null;

  const from = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, total);

  return (
    <div className="flex flex-col items-center justify-between gap-3 rounded-xl border border-outline-variant/30 bg-white px-4 py-3 shadow-sm sm:flex-row">
      <p className="text-xs text-on-surface-variant">
        Hiển thị <span className="font-semibold text-on-surface">{from}–{to}</span> /{' '}
        <span className="font-semibold text-on-surface">{total}</span> đơn
      </p>
      <div className="flex items-center gap-2">
        <button
          type="button"
          disabled={loading || page <= 1}
          onClick={() => onPageChange(page - 1)}
          className="inline-flex items-center gap-1 rounded-lg border border-outline-variant/40 px-3 py-1.5 text-xs font-bold text-on-surface transition-colors enabled:hover:bg-surface-container-low disabled:cursor-not-allowed disabled:opacity-40"
        >
          <span className="material-symbols-outlined text-[16px]">chevron_left</span>
          Trước
        </button>
        <span className="min-w-20 text-center text-xs font-semibold text-on-surface">
          {page} / {totalPages}
        </span>
        <button
          type="button"
          disabled={loading || page >= totalPages}
          onClick={() => onPageChange(page + 1)}
          className="inline-flex items-center gap-1 rounded-lg border border-outline-variant/40 px-3 py-1.5 text-xs font-bold text-on-surface transition-colors enabled:hover:bg-surface-container-low disabled:cursor-not-allowed disabled:opacity-40"
        >
          Sau
          <span className="material-symbols-outlined text-[16px]">chevron_right</span>
        </button>
      </div>
    </div>
  );
}

export default function ProfileBookingsSection() {
  const [filter, setFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [reloadKey, setReloadKey] = useState(0);
  const [cancelTarget, setCancelTarget] = useState(null);
  const [cancelPreview, setCancelPreview] = useState(null);
  const [cancelLoading, setCancelLoading] = useState(false);
  const [cancelError, setCancelError] = useState(null);
  const [state, setState] = useState({
    loading: true,
    items: [],
    total: 0,
    totalPages: 1,
    error: null,
  });

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setState((s) => ({ ...s, loading: true, error: null }));
      try {
        const data = await bookingApi.listMine({ page, pageSize: PAGE_SIZE, filter });
        if (!cancelled) {
          setState({
            loading: false,
            items: Array.isArray(data?.items) ? data.items : [],
            total: Number(data?.total) || 0,
            totalPages: Number(data?.totalPages) || 1,
            error: null,
          });
        }
      } catch (err) {
        if (!cancelled) {
          setState({
            loading: false,
            items: [],
            total: 0,
            totalPages: 1,
            error: err?.message || 'Không tải được lịch sử đặt phòng.',
          });
        }
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [filter, page, reloadKey]);

  async function handleCancelRequest(booking) {
    setCancelTarget(booking);
    setCancelPreview(null);
    setCancelError(null);
    setCancelLoading(true);
    try {
      const data = await bookingApi.cancelPreview(booking.id);
      setCancelPreview(data);
    } catch (err) {
      setCancelError(err?.message || 'Không tải được chính sách hủy.');
    } finally {
      setCancelLoading(false);
    }
  }

  async function handleConfirmCancel() {
    if (!cancelTarget) return;
    setCancelLoading(true);
    setCancelError(null);
    try {
      await bookingApi.cancel(cancelTarget.id);
      setCancelTarget(null);
      setCancelPreview(null);
      setReloadKey((k) => k + 1);
    } catch (err) {
      setCancelError(err?.message || 'Không hủy được đặt phòng.');
    } finally {
      setCancelLoading(false);
    }
  }

  function handleFilterChange(nextFilter) {
    setFilter(nextFilter);
    setPage(1);
  }

  return (
    <div className="space-y-4">
      <section className="rounded-xl border border-outline-variant/30 bg-white p-4 shadow-sm md:p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-headline text-base font-bold text-on-surface">Đặt chỗ của tôi</h2>
            <p className="mt-1 text-xs text-on-surface-variant">
              Các đơn gắn tài khoản hoặc email đăng ký của bạn.
            </p>
          </div>
          <Link
            to="/booking"
            className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-xs font-bold text-on-primary"
          >
            <span className="material-symbols-outlined text-[16px]">add</span>
            Đặt phòng mới
          </Link>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {FILTERS.map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => handleFilterChange(f.id)}
              className={[
                'rounded-full px-3 py-1.5 text-xs font-bold transition-colors',
                filter === f.id
                  ? 'bg-primary text-on-primary'
                  : 'bg-surface-container-low text-on-surface-variant hover:text-on-surface',
              ].join(' ')}
            >
              {f.label}
            </button>
          ))}
        </div>
      </section>

      {state.loading ? (
        <div className="flex justify-center py-16">
          <span className="material-symbols-outlined animate-spin text-4xl text-primary">progress_activity</span>
        </div>
      ) : null}

      {!state.loading && state.error ? (
        <section className="rounded-xl border border-error/30 bg-error/5 p-6 text-center">
          <p className="text-sm text-error">{state.error}</p>
        </section>
      ) : null}

      {!state.loading && !state.error && state.items.length === 0 ? (
        <section className="rounded-xl border border-dashed border-outline-variant/40 bg-white p-8 text-center">
          <span className="material-symbols-outlined text-4xl text-primary/60">event_busy</span>
          <p className="mt-3 font-headline text-sm font-bold text-on-surface">Chưa có đơn đặt phòng</p>
          <p className="mx-auto mt-2 max-w-sm text-xs text-on-surface-variant">
            {filter === 'all'
              ? 'Khi bạn hoàn tất checkout (đã đăng nhập), đơn sẽ hiện tại đây.'
              : 'Không có đơn nào trong bộ lọc này.'}
          </p>
          <Link
            to="/booking"
            className="mt-4 inline-flex rounded-lg bg-primary px-4 py-2 text-xs font-bold text-on-primary"
          >
            Khám phá cơ sở lưu trú
          </Link>
        </section>
      ) : null}

      {!state.loading && !state.error && state.items.length > 0 ? (
        <>
          <div className="space-y-3">
            {state.items.map((booking) => (
              <BookingCard key={booking.id} booking={booking} onCancelRequest={handleCancelRequest} />
            ))}
          </div>
          <BookingsPagination
            page={page}
            totalPages={state.totalPages}
            total={state.total}
            pageSize={PAGE_SIZE}
            loading={state.loading}
            onPageChange={setPage}
          />
        </>
      ) : null}

      <CancelBookingModal
        booking={cancelTarget}
        preview={cancelPreview}
        loading={cancelLoading}
        error={cancelError}
        onClose={() => {
          setCancelTarget(null);
          setCancelPreview(null);
          setCancelError(null);
        }}
        onConfirm={handleConfirmCancel}
      />
    </div>
  );
}
