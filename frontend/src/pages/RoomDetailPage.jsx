import { useMemo, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import BookingProgress from '../components/booking/BookingProgress';
import BookingSearchBar from '../components/booking/BookingSearchBar';
import { LAYOUT_CONTAINER } from '../constants/layoutContainer';
import { resolveBranch } from '../data/properties';
import { resolveRoomDetail } from '../data/roomDetails';
import {
  CTA,
  buildUrl,
  formatContextSummary,
  getBranchStepHref,
  getDiscoveryHref,
  parseBookingContext,
} from '../lib/bookingContext';
import {
  countStayNights,
  findRoomByDetailSlug,
  formatPriceVnd,
} from './booking/bookingData';

const STATUS_LABEL = {
  available: 'Sẵn sàng đặt',
  pending: 'Đang được giữ',
  booked: 'Đã kín phòng',
};

/**
 * @param {{
 *   detail: import('../data/roomDetails').RoomDetailRecord;
 *   context: import('../lib/bookingContext').BookingContext;
 *   listingRoom: ReturnType<typeof findRoomByDetailSlug>;
 *   checkoutHref: string;
 *   bookingBackHref: string;
 *   guests: string;
 *   setGuests: (v: string) => void;
 *   compact?: boolean;
 * }} props
 */
function RoomBookingPanel({
  detail,
  context,
  listingRoom,
  checkoutHref,
  bookingBackHref,
  guests,
  setGuests,
  compact = false,
}) {
  const nights = countStayNights(context.checkIn, context.checkOut);
  const canBook = !listingRoom || listingRoom.status === 'available';
  const total = nights ? detail.priceVnd * nights : null;
  const status = listingRoom?.status ?? 'available';
  const branchCtx = resolveBranch(context.property, context.branch);

  return (
    <div
      className={[
        'rounded-2xl border border-black/5 bg-white shadow-xl shadow-black/5',
        compact ? 'p-4' : 'p-6',
      ].join(' ')}
    >
      {canBook ? (
        <p className="inline-flex items-center gap-1.5 rounded-full bg-room-available/10 px-3 py-1 text-xs font-bold text-room-available">
          <span className="h-2 w-2 rounded-full bg-room-available" aria-hidden />
          {STATUS_LABEL.available}
        </p>
      ) : (
        <p className="inline-flex items-center gap-1.5 rounded-full bg-surface-container px-3 py-1 text-xs font-bold text-on-surface-variant">
          {STATUS_LABEL[status] ?? STATUS_LABEL.booked}
        </p>
      )}

      <p className="mt-4 font-headline text-lg font-bold text-primary">
        {formatPriceVnd(detail.priceVnd)}
        <span className="text-sm font-semibold text-on-surface-variant"> / đêm</span>
      </p>

      {nights && total && (
        <div className="mt-3 rounded-xl bg-primary/5 px-4 py-3">
          <p className="text-xs font-semibold text-on-surface-variant">
            {nights} đêm · {formatContextSummary(context)}
          </p>
          <p className="mt-1 font-headline text-xl font-extrabold text-on-surface">
            Tổng {formatPriceVnd(total)}
          </p>
          <p className="mt-1 text-[11px] text-on-surface-variant">Chưa gồm thuế & phí dịch vụ</p>
        </div>
      )}

      {branchCtx && (
        <p className="mt-4 text-xs leading-relaxed text-on-surface-variant">
          <span className="font-semibold text-on-surface">{branchCtx.branch.name}</span>
          {branchCtx.property.city ? ` · ${branchCtx.property.city}` : ''}
        </p>
      )}

      <form className="mt-5 space-y-3" onSubmit={(e) => e.preventDefault()}>
        <div>
          <label className="mb-1.5 block text-[10px] font-bold tracking-widest text-on-surface-variant uppercase">
            Ngày nhận phòng
          </label>
          <div className="flex items-center gap-2 rounded-xl bg-surface-container px-3 py-3">
            <span className="material-symbols-outlined text-primary">calendar_today</span>
            <input
              type="date"
              readOnly
              value={context.checkIn ?? ''}
              className="w-full bg-transparent text-sm font-medium"
            />
          </div>
        </div>
        <div>
          <label className="mb-1.5 block text-[10px] font-bold tracking-widest text-on-surface-variant uppercase">
            Ngày trả phòng
          </label>
          <div className="flex items-center gap-2 rounded-xl bg-surface-container px-3 py-3">
            <span className="material-symbols-outlined text-primary">event</span>
            <input
              type="date"
              readOnly
              value={context.checkOut ?? ''}
              className="w-full bg-transparent text-sm font-medium"
            />
          </div>
        </div>
        <div>
          <label className="mb-1.5 block text-[10px] font-bold tracking-widest text-on-surface-variant uppercase">
            Khách
          </label>
          <div className="flex items-center gap-2 rounded-xl bg-surface-container px-3 py-3">
            <span className="material-symbols-outlined text-primary">group</span>
            <select
              value={guests}
              onChange={(e) => setGuests(e.target.value)}
              className="w-full bg-transparent text-sm font-medium"
            >
              <option value="2-adults-0-children">2 người lớn, 0 trẻ em</option>
              <option value="2-adults-1-child">2 người lớn, 1 trẻ em</option>
              <option value="1-adult-0-children">1 người lớn</option>
            </select>
          </div>
        </div>

        {canBook ? (
          <Link
            to={checkoutHref}
            className="flex w-full items-center justify-center rounded-xl bg-primary py-4 text-center text-sm font-bold text-white shadow-lg shadow-primary/25 transition-all hover:brightness-110 active:scale-[0.98]"
          >
            {CTA.bookRoom}
          </Link>
        ) : (
          <button
            type="button"
            disabled
            className="w-full cursor-not-allowed rounded-xl bg-surface-container py-4 text-sm font-bold text-on-surface-variant"
          >
            {STATUS_LABEL[status] ?? 'Không thể đặt'}
          </button>
        )}

        <Link
          to={bookingBackHref}
          className="block text-center text-xs font-semibold text-primary hover:underline"
        >
          Quay lại danh sách phòng
        </Link>
      </form>

      <ul className="mt-5 space-y-2 border-t border-black/5 pt-4 text-xs text-on-surface-variant">
        <li className="flex items-start gap-2">
          <span className="material-symbols-outlined mt-0.5 text-base text-primary">verified</span>
          Giá tốt nhất khi đặt trực tiếp với Cherry House
        </li>
        <li className="flex items-start gap-2">
          <span className="material-symbols-outlined mt-0.5 text-base text-primary">event_available</span>
          {detail.policyBullets[0]}
        </li>
        <li className="flex items-start gap-2">
          <span className="material-symbols-outlined mt-0.5 text-base text-primary">support_agent</span>
          Host hỗ trợ 24/7 qua hotline & chat
        </li>
      </ul>
    </div>
  );
}

function RoomDetailPage() {
  const { slug } = useParams();
  const [searchParams] = useSearchParams();
  const context = useMemo(() => parseBookingContext(searchParams), [searchParams]);
  const detail = slug ? resolveRoomDetail(slug) : null;
  const listingRoom = slug ? findRoomByDetailSlug(slug) : null;
  const [guests, setGuests] = useState('2-adults-0-children');

  const inBookingFlow = Boolean(context.property && context.branch);
  const branchCtx = resolveBranch(context.property, context.branch);

  if (!detail) {
    return (
      <div className={[LAYOUT_CONTAINER, 'pt-28 pb-24 text-center'].join(' ')}>
        <div className="mx-auto max-w-lg">
          <h1 className="font-headline text-2xl font-bold text-on-surface">Không tìm thấy phòng</h1>
          <p className="mt-4 text-on-surface-variant">Slug không hợp lệ hoặc phòng đã gỡ.</p>
          <Link
            to={getDiscoveryHref()}
            className="mt-8 inline-block rounded-full bg-primary px-8 py-3 font-bold text-white hover:brightness-110"
          >
            Chọn cơ sở lưu trú
          </Link>
        </div>
      </div>
    );
  }

  const [main, ...rest] = detail.gallery;
  const [a, b, c] = [rest[0], rest[1], rest[2]].map((u) => u || main);

  const checkoutHref = buildUrl('/checkout', context, {
    slug: detail.slug,
    guests,
  });
  const bookingBackHref = inBookingFlow
    ? buildUrl('/booking', context)
    : getDiscoveryHref(context, { focus: 'search' });
  const nights = countStayNights(context.checkIn, context.checkOut);
  const canBook = !listingRoom || listingRoom.status === 'available';
  const total = nights ? detail.priceVnd * nights : null;

  return (
    <div className="pb-28 lg:pb-16">
      <div className={[LAYOUT_CONTAINER, 'pt-24'].join(' ')}>
        {inBookingFlow && <BookingProgress current="rooms" />}

        {inBookingFlow && branchCtx && (
          <nav className="mb-4 text-sm text-on-surface-variant">
            <Link to={getDiscoveryHref(context)} className="hover:text-primary">
              Cơ sở
            </Link>
            <span className="mx-2">/</span>
            <Link to={getBranchStepHref(context)} className="hover:text-primary">
              {branchCtx.property.name}
            </Link>
            <span className="mx-2">/</span>
            <Link to={bookingBackHref} className="hover:text-primary">
              Phòng
            </Link>
            <span className="mx-2">/</span>
            <span className="font-semibold text-on-surface">
              {listingRoom?.code ?? detail.title}
            </span>
          </nav>
        )}

        {inBookingFlow && (
          <div className="mb-6">
            <BookingSearchBar variant="summary" initialContext={context} />
          </div>
        )}

        <div className="mb-10 flex snap-x snap-mandatory gap-3 overflow-x-auto pb-2 md:grid md:grid-cols-2 md:gap-3 md:overflow-visible md:pb-0 lg:grid-cols-[1.15fr_1fr] lg:grid-rows-[minmax(0,1fr)_minmax(0,1fr)]">
          <div className="min-w-[85vw] shrink-0 snap-center md:min-w-0 lg:row-span-2">
            <img
              src={main}
              alt=""
              className="h-72 w-full rounded-2xl object-cover sm:h-80 md:h-full md:min-h-[320px] lg:min-h-[420px]"
            />
          </div>
          <div className="hidden min-w-0 grid-cols-2 gap-3 md:grid">
            <img src={a} alt="" className="h-40 w-full rounded-2xl object-cover lg:h-48" />
            <img src={b} alt="" className="h-40 w-full rounded-2xl object-cover lg:h-48" />
          </div>
          <div className="hidden md:col-span-1 md:col-start-2 md:row-start-2 md:block lg:col-start-2">
            <img src={c} alt="" className="h-36 w-full rounded-2xl object-cover lg:h-44" />
          </div>
        </div>

        <div className="-mt-4 mb-10 flex snap-x gap-2 overflow-x-auto pb-2 md:hidden">
          {[a, b, c].map((src, i) => (
            <img
              key={i}
              src={src}
              alt=""
              className="h-24 w-32 shrink-0 snap-start rounded-xl object-cover"
            />
          ))}
        </div>

        <div className="grid gap-10 lg:grid-cols-[1fr_380px] lg:items-start lg:gap-12">
          <article>
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-bold tracking-wide text-primary uppercase">
              <span className="material-symbols-outlined text-base">verified</span>
              {detail.badge}
            </div>
            <h1 className="font-headline text-3xl font-bold text-on-surface md:text-4xl lg:text-5xl">
              {detail.title}
            </h1>

            <div className="mt-6 flex flex-wrap gap-4 border-b border-black/10 pb-6 text-sm text-on-surface-variant">
              <span className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">square_foot</span>
                {detail.areaSqm} m²
              </span>
              <span className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">bed</span>
                {detail.bedLabel}
              </span>
              <span className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">group</span>
                {detail.capacityLabel}
              </span>
            </div>

            <div className="mt-6 space-y-4 text-base leading-relaxed text-on-surface-variant">
              {detail.paragraphs.map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </div>

            <h2 className="font-headline mt-12 text-xl font-bold text-on-surface">Tiện nghi phòng</h2>
            <ul className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
              {detail.amenities.map((am) => (
                <li
                  key={am.label}
                  className="flex items-center gap-3 rounded-xl border border-black/5 bg-white px-4 py-3 shadow-sm"
                >
                  <span className="material-symbols-outlined text-primary">{am.icon}</span>
                  <span className="text-sm font-medium text-on-surface">{am.label}</span>
                </li>
              ))}
            </ul>

            <div className="mt-12 rounded-2xl bg-surface-container/80 p-6 md:p-8">
              <h2 className="font-headline text-lg font-bold text-on-surface">Chính sách hủy phòng</h2>
              <ul className="mt-4 list-inside list-disc space-y-2 text-sm leading-relaxed text-on-surface-variant">
                {detail.policyBullets.map((line, i) => (
                  <li key={i}>{line}</li>
                ))}
              </ul>
              <p className="mt-4 text-sm font-semibold text-on-surface">
                Nhận phòng từ {detail.checkIn} · Trả phòng trước {detail.checkOut}
              </p>
            </div>
          </article>

          <aside className="hidden lg:block">
            <div className="sticky top-28">
              <RoomBookingPanel
                detail={detail}
                context={context}
                listingRoom={listingRoom}
                checkoutHref={checkoutHref}
                bookingBackHref={bookingBackHref}
                guests={guests}
                setGuests={setGuests}
              />
            </div>
          </aside>
        </div>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-black/10 bg-white/95 px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur-md lg:hidden">
        <div className={[LAYOUT_CONTAINER, 'flex items-center justify-between gap-3'].join(' ')}>
          <div className="min-w-0">
            {total ? (
              <>
                <p className="text-xs text-on-surface-variant">
                  {nights} đêm · {formatPriceVnd(detail.priceVnd)}/đêm
                </p>
                <p className="font-headline text-sm font-bold text-primary">{formatPriceVnd(total)}</p>
              </>
            ) : (
              <>
                <p className="text-xs text-on-surface-variant">Từ</p>
                <p className="font-headline text-sm font-bold text-primary">
                  {formatPriceVnd(detail.priceVnd)}/đêm
                </p>
              </>
            )}
          </div>
          {canBook ? (
            <Link
              to={checkoutHref}
              className="shrink-0 rounded-xl bg-primary px-6 py-3 text-sm font-bold text-white shadow-md hover:brightness-110 active:scale-[0.98]"
            >
              {CTA.bookRoom}
            </Link>
          ) : (
            <span className="shrink-0 rounded-xl bg-surface-container px-4 py-3 text-xs font-bold text-on-surface-variant">
              {STATUS_LABEL[listingRoom?.status ?? 'booked']}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

export default RoomDetailPage;
