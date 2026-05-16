import { useEffect, useMemo } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { LAYOUT_CONTAINER } from '../../constants/layoutContainer';
import { MOCK_ROOMS, formatPriceVnd, countByStatus } from './bookingData';

const STATUS_LABEL = {
  available: 'Sẵn sàng',
  pending: 'Đang chờ',
  booked: 'Đã đặt',
};

const STATUS_BADGE_CLASS = {
  available: 'bg-room-available text-white',
  pending: 'bg-room-pending text-on-surface',
  booked: 'bg-room-booked text-white',
};

function RoomCard({ room, onBook }) {
  const badge = STATUS_BADGE_CLASS[room.status];
  const label = STATUS_LABEL[room.status];
  const detailTo = `/room/${room.detailSlug}`;

  return (
    <article
      id={`room-${room.id}`}
      className="scroll-mt-32 overflow-hidden rounded-xl border border-black/5 bg-white shadow-sm transition-shadow hover:shadow-lg"
    >
      <Link to={detailTo} className="relative block aspect-4/3 overflow-hidden">
        <img
          className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
          src={room.image}
          alt={room.alt}
        />
        <span
          className={`absolute top-3 right-3 rounded-full px-3 py-1 text-xs font-bold shadow-md ${badge}`}
        >
          {label}
        </span>
      </Link>
      <div className="p-5">
        <Link to={detailTo}>
          <h3 className="font-headline text-lg font-bold text-on-surface hover:text-primary">
            {room.code}
          </h3>
        </Link>
        <div className="mt-2 flex items-center gap-1.5 text-sm text-on-surface-variant">
          <span className="material-symbols-outlined text-lg text-on-surface-variant/80">
            person
          </span>
          <span>{room.capacityLabel}</span>
        </div>
        <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-on-surface-variant/90">
          {room.description}
        </p>
        <p className="mt-4 font-headline text-base font-bold text-primary">
          {formatPriceVnd(room.priceVnd)}
        </p>
        <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <Link
            to={detailTo}
            className="order-2 text-center text-sm font-bold text-primary underline-offset-4 hover:underline sm:order-1 sm:text-left"
          >
            Xem chi tiết
          </Link>
          <div className="order-1 sm:order-2 sm:min-w-[140px]">
            {room.status === 'available' && (
              <button
                type="button"
                onClick={() => onBook?.(room)}
                className="w-full rounded-lg bg-primary py-3 text-sm font-bold text-white shadow-md shadow-primary/20 transition-all hover:brightness-110 active:scale-[0.98]"
              >
                Đặt ngay
              </button>
            )}
            {room.status === 'pending' && (
              <button
                type="button"
                disabled
                className="w-full cursor-not-allowed rounded-lg bg-surface-container py-3 text-sm font-bold text-on-surface-variant"
              >
                Đang được giữ
              </button>
            )}
            {room.status === 'booked' && (
              <button
                type="button"
                disabled
                className="w-full rounded-lg border-2 border-primary bg-white py-3 text-xs font-bold tracking-wider text-primary uppercase"
              >
                Không khả dụng
              </button>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}

function StatPill({ dotClass, label, value }) {
  return (
    <div className="inline-flex items-center gap-2 rounded-full border border-black/5 bg-white px-4 py-2 text-sm shadow-sm">
      <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${dotClass}`} aria-hidden />
      <span className="font-semibold text-on-surface">
        {value} {label}
      </span>
    </div>
  );
}

function BookingPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const roomType = searchParams.get('type') || 'all';
  const priceTier = searchParams.get('price') || 'all';
  const statusFilter = searchParams.get('status') || 'all';

  const patchParam = (key, value, emptyMeansAll = true) => {
    const next = new URLSearchParams(searchParams);
    if (emptyMeansAll && (value === 'all' || value === '')) next.delete(key);
    else next.set(key, value);
    setSearchParams(next, { replace: true });
  };

  useEffect(() => {
    const h = searchParams.get('highlight');
    if (!h) return;
    const id = requestAnimationFrame(() => {
      document.getElementById(`room-${h}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    });
    return () => cancelAnimationFrame(id);
  }, [searchParams]);

  const totals = useMemo(() => countByStatus(MOCK_ROOMS), []);

  const filtered = useMemo(() => {
    return MOCK_ROOMS.filter((r) => {
      if (roomType !== 'all' && r.type !== roomType) return false;
      if (priceTier === 'under2m' && r.priceVnd >= 2000000) return false;
      if (priceTier === '2to35' && (r.priceVnd < 2000000 || r.priceVnd > 3500000)) return false;
      if (priceTier === 'over35' && r.priceVnd <= 3500000) return false;
      if (statusFilter === 'available' && r.status !== 'available') return false;
      if (statusFilter === 'booked' && r.status !== 'booked') return false;
      return true;
    });
  }, [roomType, priceTier, statusFilter]);

  const handleBook = (room) => {
    const q = new URLSearchParams({ slug: room.detailSlug });
    navigate(`/checkout?${q.toString()}`);
  };

  return (
    <div className={[LAYOUT_CONTAINER, 'pt-24 pb-16'].join(' ')}>
      <header className="mb-8 max-w-3xl md:mb-10">
        <h1 className="font-headline text-2xl font-bold text-on-surface sm:text-3xl md:text-4xl">
          Bảng Trạng Thái Phòng
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-on-surface-variant md:mt-4 md:text-base">
          Quản lý hệ thống phòng, theo dõi phòng trống, đang chờ xác nhận hoặc đã đặt theo thời
          gian thực.
        </p>
      </header>

      <div className="mb-8 flex flex-col gap-4 rounded-2xl border border-black/5 bg-hero-filter p-4 md:flex-row md:flex-wrap md:items-end">
        <div className="min-w-0 flex-1 md:min-w-[160px]">
          <label className="mb-1.5 block text-[10px] font-bold tracking-wide text-gray-500 uppercase">
            Loại phòng
          </label>
          <select
            value={roomType}
            onChange={(e) => patchParam('type', e.target.value)}
            className="w-full rounded-xl border border-black/10 bg-white px-3 py-3 text-sm font-medium text-on-surface"
          >
            <option value="all">Tất cả các loại</option>
            <option value="Standard">Standard</option>
            <option value="Deluxe">Deluxe</option>
            <option value="Suite">Suite</option>
            <option value="Penthouse">Penthouse</option>
          </select>
        </div>
        <div className="min-w-0 flex-1 md:min-w-[160px]">
          <label className="mb-1.5 block text-[10px] font-bold tracking-wide text-gray-500 uppercase">
            Khoảng giá
          </label>
          <div className="flex items-center gap-2 rounded-xl border border-black/10 bg-white px-3 py-2.5">
            <span className="material-symbols-outlined shrink-0 text-primary">credit_card</span>
            <select
              value={priceTier}
              onChange={(e) => patchParam('price', e.target.value)}
              className="min-w-0 flex-1 border-none bg-transparent py-1 text-sm font-medium text-on-surface"
            >
              <option value="all">Mọi mức giá</option>
              <option value="under2m">Dưới 2.000.000đ</option>
              <option value="2to35">2.000.000đ – 3.500.000đ</option>
              <option value="over35">Trên 3.500.000đ</option>
            </select>
          </div>
        </div>
        <div className="min-w-0 flex-1 md:min-w-[220px]">
          <label className="mb-1.5 block text-[10px] font-bold tracking-wide text-gray-500 uppercase">
            Trạng thái
          </label>
          <div className="flex overflow-x-auto rounded-xl bg-black/5 p-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {[
              { id: 'all', label: 'Tất cả' },
              { id: 'available', label: 'Trống' },
              { id: 'booked', label: 'Đã đặt' },
            ].map((seg) => (
              <button
                key={seg.id}
                type="button"
                onClick={() => patchParam('status', seg.id)}
                className={[
                  'shrink-0 rounded-lg px-3 py-2.5 text-center text-xs font-bold whitespace-nowrap transition-all sm:text-sm',
                  statusFilter === seg.id
                    ? 'bg-primary text-white shadow-sm'
                    : 'text-on-surface-variant hover:text-on-surface',
                ].join(' ')}
              >
                {seg.label}
              </button>
            ))}
          </div>
        </div>
        <button
          type="button"
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3.5 font-bold text-white shadow-md shadow-primary/25 transition-all hover:brightness-110 md:w-auto md:shrink-0"
          onClick={() =>
            document.getElementById('room-grid')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
          }
        >
          <span className="material-symbols-outlined text-xl">filter_alt</span>
          Lọc kết quả
        </button>
      </div>

      <div className="mb-6 flex flex-wrap gap-2 sm:mb-8 sm:gap-3">
        <StatPill dotClass="bg-room-available" label="Sẵn sàng" value={totals.available} />
        <StatPill dotClass="bg-room-pending" label="Đang chờ" value={totals.pending} />
        <StatPill dotClass="bg-room-booked" label="Đã đặt" value={totals.booked} />
      </div>

      {filtered.length === 0 ? (
        <p className="rounded-xl border border-dashed border-black/15 bg-white py-12 text-center text-sm text-on-surface-variant md:py-16">
          Không có phòng phù hợp bộ lọc.
        </p>
      ) : (
        <div
          id="room-grid"
          className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
        >
          {filtered.map((room) => (
            <RoomCard key={room.id} room={room} onBook={handleBook} />
          ))}
        </div>
      )}
    </div>
  );
}

export default BookingPage;
