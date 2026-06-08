import { useEffect, useMemo, useState } from 'react';
import { Link, Navigate, useNavigate, useSearchParams } from 'react-router-dom';
import bookingApi from '../../api/bookingApi';
import propertyApi from '../../api/propertyApi';
import roomApi from '../../api/roomApi';
import BookingBreadcrumbs from '../../components/booking/BookingBreadcrumbs';
import BookingProgress from '../../components/booking/BookingProgress';
import BookingSearchBar from '../../components/booking/BookingSearchBar';
import { LAYOUT_CONTAINER } from '../../constants/layoutContainer';
import BranchStep from '../../components/booking/BranchStep';
import PropertyDiscovery from '../../components/booking/PropertyDiscovery';
import { mapPropertyFromApi, mapRoomFromApi } from '../../lib/mapProperty';
import {
  CTA,
  buildUrl,
  getBookingStepHref,
  getBranchStepHref,
  getDiscoveryHref,
  getDiscoveryListHref,
  getRoomDetailHref,
  parseBookingContext,
  resolveSearchDestination,
} from '../../lib/bookingContext';
import {
  countByStatus,
  formatPriceVnd,
} from './bookingData';

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

function RoomCard({ room, onBook, detailHref }) {
  const badge = STATUS_BADGE_CLASS[room.status];
  const label = STATUS_LABEL[room.status];

  return (
    <article
      id={`room-${room.id}`}
      className="scroll-mt-32 overflow-hidden rounded-xl border border-black/5 bg-white shadow-sm transition-shadow hover:shadow-lg"
    >
      {detailHref ? (
        <Link to={detailHref} className="relative block aspect-4/3 overflow-hidden">
          <img className="h-full w-full object-cover transition-transform duration-300 hover:scale-[1.02]" src={room.image} alt={room.alt} />
          <span
            className={`absolute top-3 right-3 rounded-full px-3 py-1 text-xs font-bold shadow-md ${badge}`}
          >
            {label}
          </span>
        </Link>
      ) : (
        <div className="relative aspect-4/3 overflow-hidden">
          <img className="h-full w-full object-cover" src={room.image} alt={room.alt} />
          <span
            className={`absolute top-3 right-3 rounded-full px-3 py-1 text-xs font-bold shadow-md ${badge}`}
          >
            {label}
          </span>
        </div>
      )}
      <div className="p-5">
        <h3 className="font-headline text-lg font-bold text-on-surface">{room.code}</h3>
        <div className="mt-2 flex items-center gap-1.5 text-sm text-on-surface-variant">
          <span className="material-symbols-outlined text-lg text-on-surface-variant/80">person</span>
          <span>{room.capacityLabel}</span>
        </div>
        <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-on-surface-variant/90">
          {room.description}
        </p>
        <p className="mt-4 font-headline text-base font-bold text-primary">
          {formatPriceVnd(room.priceVnd)}
          <span className="text-xs font-semibold text-on-surface-variant"> / đêm</span>
        </p>
        <div className="mt-4 flex flex-col gap-2 sm:flex-row">
          {detailHref && (
            <Link
              to={detailHref}
              className="flex flex-1 items-center justify-center rounded-lg border-2 border-primary/20 bg-white py-3 text-sm font-bold text-primary transition-all hover:border-primary hover:bg-primary/5 active:scale-[0.98]"
            >
              {CTA.viewRoomDetail}
            </Link>
          )}
          {room.status === 'available' && (
            <button
              type="button"
              onClick={() => onBook?.(room)}
              className="flex flex-1 items-center justify-center rounded-lg bg-primary py-3 text-sm font-bold text-white shadow-md shadow-primary/20 transition-all hover:brightness-110 active:scale-[0.98]"
            >
              {CTA.bookRoom}
            </button>
          )}
          {room.status === 'pending' && (
            <button
              type="button"
              disabled
              className="flex flex-1 cursor-not-allowed items-center justify-center rounded-lg bg-surface-container py-3 text-sm font-bold text-on-surface-variant"
            >
              Đang được giữ
            </button>
          )}
          {room.status === 'booked' && (
            <button
              type="button"
              disabled
              className="flex flex-1 items-center justify-center rounded-lg border-2 border-primary/30 bg-white py-3 text-xs font-bold tracking-wider text-primary uppercase"
            >
              Không khả dụng
            </button>
          )}
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
  const context = useMemo(() => parseBookingContext(searchParams), [searchParams]);

  const [propertyOnly, setPropertyOnly] = useState(null);
  const [scopeRooms, setScopeRooms] = useState([]);
  const [catalogLoading, setCatalogLoading] = useState(false);
  const [catalogError, setCatalogError] = useState(null);

  const roomType = searchParams.get('type') || 'all';
  const priceTier = searchParams.get('price') || 'all';
  const statusFilter = searchParams.get('status') || 'all';

  useEffect(() => {
    if (!context.property) {
      setPropertyOnly(null);
      return undefined;
    }

    let cancelled = false;
    setCatalogLoading(true);
    setCatalogError(null);

    propertyApi.getBySlug(context.property)
      .then((res) => {
        if (cancelled) return;
        if (!res?.success || !res.data) {
          throw new Error(res?.message || 'Không tải được cơ sở');
        }
        setPropertyOnly(mapPropertyFromApi(res.data));
      })
      .catch((err) => {
        if (cancelled) return;
        setPropertyOnly(null);
        setCatalogError(err instanceof Error ? err.message : 'Lỗi tải cơ sở');
      })
      .finally(() => {
        if (!cancelled) setCatalogLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [context.property]);

  useEffect(() => {
    if (!context.property || !context.branch) {
      setScopeRooms([]);
      return undefined;
    }

    let cancelled = false;
    setCatalogLoading(true);
    setCatalogError(null);

    async function loadRooms() {
      try {
        const res = await roomApi.list({
          propertySlug: context.property,
          branchCode: context.branch,
          isActive: 'true',
        });
        if (cancelled) return;
        if (!res?.success) {
          throw new Error(res?.message || 'Không tải được phòng');
        }

        let rooms = (res.data ?? []).map(mapRoomFromApi);

        if (context.checkIn && context.checkOut) {
          try {
            const occ = await bookingApi.getOccupancy({
              propertySlug: context.property,
              branchCode: context.branch,
              from: context.checkIn,
              to: context.checkOut,
            });
            if (!cancelled && occ?.rooms?.length) {
              const bySlug = new Map(
                occ.rooms.map((r) => [r.detailSlug, r.occupancy]),
              );
              const byCode = new Map(occ.rooms.map((r) => [r.code, r.occupancy]));
              rooms = rooms.map((room) => {
                const occStatus = bySlug.get(room.detailSlug) ?? byCode.get(room.code);
                if (occStatus === 'held') return { ...room, status: 'pending' };
                if (occStatus === 'booked') return { ...room, status: 'booked' };
                if (occStatus === 'available') return { ...room, status: 'available' };
                return room;
              });
            }
          } catch {
            // Giữ trạng thái catalog nếu occupancy lỗi
          }
        }

        if (!cancelled) setScopeRooms(rooms);
      } catch (err) {
        if (cancelled) return;
        setScopeRooms([]);
        setCatalogError(err instanceof Error ? err.message : 'Lỗi tải phòng');
      } finally {
        if (!cancelled) setCatalogLoading(false);
      }
    }

    loadRooms();

    return () => {
      cancelled = true;
    };
  }, [context.property, context.branch, context.checkIn, context.checkOut]);

  const selectedBranchCtx = useMemo(() => {
    if (!propertyOnly || !context.branch) return null;
    const branch = propertyOnly.subBranches.find((b) => b.id === context.branch);
    if (!branch) return null;
    return { property: propertyOnly, branch };
  }, [propertyOnly, context.branch]);

  const canShowRooms = Boolean(context.property && context.branch);

  useEffect(() => {
    if (
      propertyOnly &&
      !context.branch &&
      propertyOnly.subBranches.length === 1
    ) {
      navigate(
        buildUrl('/booking', {
          ...context,
          property: propertyOnly.slug,
          branch: propertyOnly.subBranches[0].id,
        }),
        { replace: true },
      );
    }
  }, [propertyOnly, context, navigate]);

  useEffect(() => {
    const h = searchParams.get('highlight');
    if (!h) return;
    const id = requestAnimationFrame(() => {
      document.getElementById(`room-${h}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    });
    return () => cancelAnimationFrame(id);
  }, [searchParams]);

  const totals = useMemo(() => countByStatus(scopeRooms), [scopeRooms]);

  const filtered = useMemo(() => {
    return scopeRooms.filter((r) => {
      if (roomType !== 'all' && r.type !== roomType) return false;
      if (priceTier === 'under2m' && r.priceVnd >= 2000000) return false;
      if (priceTier === '2to35' && (r.priceVnd < 2000000 || r.priceVnd > 3500000)) return false;
      if (priceTier === 'over35' && r.priceVnd <= 3500000) return false;
      if (statusFilter === 'available' && r.status !== 'available') return false;
      if (statusFilter === 'booked' && r.status !== 'booked') return false;
      return true;
    });
  }, [scopeRooms, roomType, priceTier, statusFilter]);

  const patchParam = (key, value, emptyMeansAll = true) => {
    const next = new URLSearchParams(searchParams);
    if (emptyMeansAll && (value === 'all' || value === '')) next.delete(key);
    else next.set(key, value);
    setSearchParams(next, { replace: true });
  };

  const handleBook = (room) => {
    if (!room.detailSlug) return;
    navigate(
      buildUrl('/checkout', context, {
        slug: room.detailSlug,
      }),
    );
  };

  if (context.property && !context.branch) {
    if (catalogLoading && !propertyOnly) {
      return (
        <div className={[LAYOUT_CONTAINER, 'pt-24 pb-16 text-center text-sm text-on-surface-variant'].join(' ')}>
          Đang tải cơ sở từ API…
        </div>
      );
    }
    if (catalogError && !propertyOnly) {
      return (
        <div className={[LAYOUT_CONTAINER, 'pt-24 pb-16 text-center'].join(' ')}>
          <p className="font-semibold text-red-800">{catalogError}</p>
          <Link to={getDiscoveryListHref(context)} className="mt-4 inline-block text-sm font-bold text-primary hover:underline">
            Quay lại danh sách cơ sở
          </Link>
        </div>
      );
    }
    if (!propertyOnly) {
      return <Navigate to={getDiscoveryListHref(context)} replace />;
    }
    if (propertyOnly.subBranches.length > 1) {
      return (
        <BranchStep
          property={propertyOnly}
          context={context}
          onSearch={(ctx) => navigate(resolveSearchDestination(ctx))}
        />
      );
    }
    return null;
  }

  if (!canShowRooms) {
    return <PropertyDiscovery />;
  }

  const branchStepHref = getBranchStepHref(context);

  return (
    <div className={[LAYOUT_CONTAINER, 'pt-24 pb-16'].join(' ')}>
      <BookingProgress current="rooms" context={context} />

      <header className="mb-6 max-w-3xl md:mb-8">
        {selectedBranchCtx ? (
          <BookingBreadcrumbs
            className="mb-2"
            items={[
              { label: 'Tìm kiếm', href: getBookingStepHref('search', context) },
              { label: 'Cơ sở', href: getBookingStepHref('property', context) },
              {
                label: selectedBranchCtx.property.name,
                href: getBookingStepHref('branch', context),
              },
              { label: selectedBranchCtx.branch.name, href: branchStepHref },
              { label: 'Phòng', current: true },
            ]}
          />
        ) : null}
        <h1 className="font-headline text-2xl font-bold text-on-surface sm:text-3xl md:text-4xl">
          {selectedBranchCtx
            ? `Phòng tại ${selectedBranchCtx.branch.name}`
            : 'Danh sách phòng'}
        </h1>
      </header>

      <div className="mb-6">
        <BookingSearchBar variant="summary" initialContext={context} />
      </div>

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
          <select
            value={priceTier}
            onChange={(e) => patchParam('price', e.target.value)}
            className="w-full rounded-xl border border-black/10 bg-white px-3 py-3 text-sm font-medium text-on-surface"
          >
            <option value="all">Mọi mức giá</option>
            <option value="under2m">Dưới 2.000.000đ</option>
            <option value="2to35">2.000.000đ – 3.500.000đ</option>
            <option value="over35">Trên 3.500.000đ</option>
          </select>
        </div>
        <div className="min-w-0 flex-1 md:min-w-[220px]">
          <label className="mb-1.5 block text-[10px] font-bold tracking-wide text-gray-500 uppercase">
            Trạng thái
          </label>
          <div className="flex overflow-x-auto rounded-xl bg-black/5 p-1">
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
                  'shrink-0 rounded-lg px-3 py-2.5 text-center text-xs font-bold whitespace-nowrap sm:text-sm',
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
      </div>

      <div className="mb-6 flex flex-wrap gap-2 sm:mb-8 sm:gap-3">
        <StatPill dotClass="bg-room-available" label="Sẵn sàng" value={totals.available} />
        <StatPill dotClass="bg-room-pending" label="Đang chờ" value={totals.pending} />
        <StatPill dotClass="bg-room-booked" label="Đã đặt" value={totals.booked} />
      </div>

      {filtered.length === 0 ? (
        <p className="rounded-xl border border-dashed border-black/15 bg-white py-12 text-center text-sm text-on-surface-variant md:py-16">
          Không có phòng phù hợp bộ lọc tại chi nhánh này.
        </p>
      ) : (
        <div
          id="room-grid"
          className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
        >
          {filtered.map((room) => (
            <RoomCard
              key={room.id}
              room={room}
              onBook={handleBook}
              detailHref={room.detailSlug ? getRoomDetailHref(context, room.detailSlug) : null}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default BookingPage;
