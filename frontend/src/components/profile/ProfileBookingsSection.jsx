import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import bookingApi from '../../api/bookingApi';

const STATUS_META = {
  pending_payment: { label: 'Chờ thanh toán', tone: 'text-amber-700 bg-amber-50 border-amber-200' },
  confirmed: { label: 'Đã xác nhận', tone: 'text-tertiary bg-tertiary/10 border-tertiary/30' },
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
  return method || '—';
}

function classifyBooking(booking, todayIso) {
  if (booking.status === 'pending_payment') return 'pending';
  if (booking.status === 'cancelled') return 'past';
  if (booking.checkOut >= todayIso) return 'upcoming';
  return 'past';
}

function BookingCard({ booking }) {
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

      {booking.status === 'pending_payment' ? (
        <div className="mt-4 flex flex-wrap gap-2">
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
        </div>
      ) : null}
    </article>
  );
}

export default function ProfileBookingsSection() {
  const [filter, setFilter] = useState('all');
  const [state, setState] = useState({ loading: true, items: [], error: null });

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setState((s) => ({ ...s, loading: true, error: null }));
      try {
        const items = await bookingApi.listMine();
        if (!cancelled) {
          setState({ loading: false, items: Array.isArray(items) ? items : [], error: null });
        }
      } catch (err) {
        if (!cancelled) {
          setState({
            loading: false,
            items: [],
            error: err?.message || 'Không tải được lịch sử đặt phòng.',
          });
        }
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const todayIso = new Date().toISOString().slice(0, 10);

  const filtered = useMemo(() => {
    if (filter === 'all') return state.items;
    return state.items.filter((b) => classifyBooking(b, todayIso) === filter);
  }, [filter, state.items, todayIso]);

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
              onClick={() => setFilter(f.id)}
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

      {!state.loading && !state.error && filtered.length === 0 ? (
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

      {!state.loading && !state.error && filtered.length > 0 ? (
        <div className="space-y-3">
          {filtered.map((booking) => (
            <BookingCard key={booking.id} booking={booking} />
          ))}
        </div>
      ) : null}
    </div>
  );
}
