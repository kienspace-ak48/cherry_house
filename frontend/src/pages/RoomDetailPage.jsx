import { useEffect, useMemo, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import roomApi from '../api/roomApi';
import BookingBreadcrumbs from '../components/booking/BookingBreadcrumbs';
import BookingProgress from '../components/booking/BookingProgress';
import BookingSearchBar from '../components/booking/BookingSearchBar';
import { LAYOUT_CONTAINER } from '../constants/layoutContainer';
import { resolveBranch } from '../data/properties';
import { usePageSeo } from '../hooks/usePageSeo';
import {
  CTA,
  buildUrl,
  formatContextSummary,
  getBookingStepHref,
  getDiscoveryHref,
  parseBookingContext,
} from '../lib/bookingContext';
import { resolveMediaUrl } from '../lib/resolveMediaUrl';
import { countStayNights, formatPriceVnd } from './booking/bookingData';

const STATUS_LABEL = {
  available: 'Sẵn sàng đặt',
  pending: 'Đang được giữ',
  booked: 'Đã kín phòng',
};

const FALLBACK_GALLERY =
  'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?auto=format&fit=crop&w=1400&q=80';

/**
 * @param {string[]} urls
 */
function normalizeGallery(urls) {
  const resolved = (urls || []).map(resolveMediaUrl).filter(Boolean);
  return resolved.length ? resolved : [FALLBACK_GALLERY];
}

/**
 * @param {import('../api/roomApi').default | null} _api
 * @param {Record<string, unknown>} row
 */
function mapDetailFromApi(row) {
  const gallery = normalizeGallery(
    Array.isArray(row.gallery) ? row.gallery.map(String) : row.image ? [String(row.image)] : [],
  );

  return {
    id: Number(row.id),
    slug: String(row.detailSlug ?? row.slug ?? ''),
    code: String(row.code ?? ''),
    badge: String(row.badge ?? row.roomTypeTitle ?? 'Chưa phân loại phòng'),
    title: String(row.title ?? row.code ?? 'Phòng'),
    subtitle: String(row.subtitle ?? row.code ?? ''),
    areaSqm: Number(row.areaSqm ?? 0),
    bedLabel: String(row.bedLabel ?? ''),
    capacityLabel: String(row.capacityLabel ?? ''),
    paragraphs: Array.isArray(row.paragraphs) ? row.paragraphs.map(String) : [],
    amenities: Array.isArray(row.amenities) ? row.amenities : [],
    policyBullets: Array.isArray(row.policyBullets) ? row.policyBullets.map(String) : [],
    checkIn: String(row.checkIn ?? '14:00'),
    checkOut: String(row.checkOut ?? '12:00'),
    priceVnd: Number(row.priceVnd ?? 0),
    maxAdults: Number(row.maxAdults ?? 2),
    status: /** @type {'available'|'pending'|'booked'} */ (row.status ?? 'available'),
    gallery,
    property: row.property ?? null,
    branch: row.branch ?? null,
    propertySlug: row.propertySlug ? String(row.propertySlug) : row.property?.slug ?? null,
    branchCode: row.branchCode ? String(row.branchCode) : row.branch?.code ?? null,
  };
}

/**
 * @param {{
 *   detail: ReturnType<typeof mapDetailFromApi>;
 *   context: import('../lib/bookingContext').BookingContext;
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
  checkoutHref,
  bookingBackHref,
  guests,
  setGuests,
  compact = false,
}) {
  const nights = countStayNights(context.checkIn, context.checkOut);
  const canBook = detail.status === 'available';
  const total = nights ? detail.priceVnd * nights : null;
  const status = detail.status;

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

      {detail.branch && detail.property && (
        <p className="mt-4 text-xs leading-relaxed text-on-surface-variant">
          <span className="font-semibold text-on-surface">{detail.branch.name}</span>
          {detail.property.city ? ` · ${detail.property.city}` : ''}
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
        {detail.policyBullets[0] ? (
          <li className="flex items-start gap-2">
            <span className="material-symbols-outlined mt-0.5 text-base text-primary">event_available</span>
            {detail.policyBullets[0]}
          </li>
        ) : null}
        <li className="flex items-start gap-2">
          <span className="material-symbols-outlined mt-0.5 text-base text-primary">support_agent</span>
          Host hỗ trợ 24/7 qua hotline & chat
        </li>
      </ul>
    </div>
  );
}

function RoomDetailSkeleton() {
  return (
    <div className={[LAYOUT_CONTAINER, 'pt-24 pb-28 animate-pulse'].join(' ')}>
      <div className="mb-8 h-80 rounded-3xl bg-surface-container" />
      <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
        <div className="space-y-4">
          <div className="h-8 w-2/3 rounded-lg bg-surface-container" />
          <div className="h-4 w-full rounded bg-surface-container" />
          <div className="h-4 w-5/6 rounded bg-surface-container" />
        </div>
        <div className="h-96 rounded-2xl bg-surface-container" />
      </div>
    </div>
  );
}

function RoomDetailPage() {
  const { slug } = useParams();
  const [searchParams] = useSearchParams();
  const context = useMemo(() => parseBookingContext(searchParams), [searchParams]);
  const [guests, setGuests] = useState('2-adults-0-children');
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [activeImage, setActiveImage] = useState(0);

  const inBookingFlow = Boolean(context.property && context.branch);

  const branchCtx = useMemo(() => {
    if (detail?.property && detail?.branch) {
      return {
        property: {
          slug: detail.property.slug,
          name: detail.property.name,
          city: detail.property.city,
        },
        branch: {
          id: detail.branch.code ?? detail.branch.id,
          name: detail.branch.name,
        },
      };
    }
    if (context.property && context.branch) {
      return resolveBranch(context.property, context.branch);
    }
    return null;
  }, [detail, context]);

  useEffect(() => {
    if (!slug) {
      setNotFound(true);
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setNotFound(false);

    const params = { detailSlug: slug };
    if (context.property) params.propertySlug = context.property;
    if (context.branch) params.branchCode = context.branch;

    roomApi
      .getDetail(params)
      .then((res) => {
        if (cancelled) return;
        if (!res?.success || !res.data) {
          setNotFound(true);
          setDetail(null);
          return;
        }
        const mapped = mapDetailFromApi(res.data);
        setDetail(mapped);
        setActiveImage(0);
      })
      .catch(() => {
        if (!cancelled) {
          setNotFound(true);
          setDetail(null);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [slug, context.property, context.branch]);

  const seoVars = useMemo(() => {
    if (!detail) return {};
    const roomDescription =
      detail.paragraphs[0] || `${detail.title} tại ${detail.property?.name || 'Cherry House'}`;
    return {
      roomName: detail.title,
      roomCode: detail.code,
      roomDescription: String(roomDescription).slice(0, 160),
      price: formatPriceVnd(detail.priceVnd),
      branchName: branchCtx?.branch.name || detail.branch?.name || '',
      propertyName: branchCtx?.property.name || detail.property?.name || '',
      city: branchCtx?.property.city || detail.property?.city || '',
    };
  }, [detail, branchCtx]);

  const seoBreadcrumbs = useMemo(() => {
    if (!detail) return [];
    if (branchCtx) {
      return [
        { name: 'Cơ sở lưu trú', path: '/properties' },
        { name: branchCtx.property.name, path: `/properties/${branchCtx.property.slug}` },
        {
          name: branchCtx.branch.name,
          path: `/properties/${branchCtx.property.slug}/branches/${branchCtx.branch.id}`,
        },
        { name: detail.title, path: `/room/${detail.slug}` },
      ];
    }
    return [{ name: detail.title, path: `/room/${detail.slug}` }];
  }, [detail, branchCtx]);

  usePageSeo(seoVars, seoBreadcrumbs);

  if (loading) return <RoomDetailSkeleton />;

  if (notFound || !detail) {
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

  const gallery = detail.gallery;
  const mainImage = gallery[activeImage] ?? gallery[0];
  const thumbImages = gallery.slice(0, 5);

  const checkoutHref = buildUrl('/checkout', context, {
    slug: detail.slug,
    guests,
  });
  const bookingBackHref = inBookingFlow
    ? buildUrl('/booking', context)
    : getDiscoveryHref(context, { focus: 'search' });
  const nights = countStayNights(context.checkIn, context.checkOut);
  const canBook = detail.status === 'available';
  const total = nights ? detail.priceVnd * nights : null;

  const stats = [
    { icon: 'square_foot', label: detail.areaSqm ? `${detail.areaSqm} m²` : '—' },
    { icon: 'bed', label: detail.bedLabel || '—' },
    {
      icon: 'group',
      label: detail.capacityLabel || `Tối đa ${detail.maxAdults ?? 2} người lớn`,
    },
    { icon: 'login', label: `Nhận phòng ${detail.checkIn}` },
    { icon: 'logout', label: `Trả phòng ${detail.checkOut}` },
  ];

  return (
    <div className="pb-28 lg:pb-16">
      <div className={[LAYOUT_CONTAINER, 'pt-24'].join(' ')}>
        {inBookingFlow ? (
          <BookingProgress current="rooms" context={context} extra={{ slug: detail.slug, guests }} />
        ) : null}

        {inBookingFlow && branchCtx ? (
          <BookingBreadcrumbs
            className="mb-4"
            items={[
              { label: 'Tìm kiếm', href: getBookingStepHref('search', context) },
              { label: 'Cơ sở', href: getBookingStepHref('property', context) },
              { label: branchCtx.property.name, href: getBookingStepHref('branch', context) },
              { label: branchCtx.branch.name, href: bookingBackHref },
              { label: detail.code, current: true },
            ]}
          />
        ) : null}

        {inBookingFlow && (
          <div className="mb-6">
            <BookingSearchBar variant="summary" initialContext={context} />
          </div>
        )}

        <section className="relative mb-8 overflow-hidden rounded-3xl bg-on-surface shadow-2xl shadow-black/20">
          <div className="relative aspect-[16/10] min-h-[280px] sm:min-h-[360px] lg:min-h-[480px]">
            <img
              src={mainImage}
              alt={detail.title}
              className="absolute inset-0 h-full w-full object-cover transition-opacity duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 p-6 sm:p-8 lg:p-10">
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-3 py-1 text-xs font-bold tracking-wide text-white uppercase backdrop-blur-sm">
                <span className="material-symbols-outlined text-base">verified</span>
                {detail.badge}
              </div>
              <h1 className="font-headline max-w-3xl text-3xl font-bold text-white sm:text-4xl lg:text-5xl">
                {detail.title}
              </h1>
              <p className="mt-2 text-sm font-semibold text-white/85 sm:text-base">
                Mã phòng <span className="text-white">{detail.code}</span>
                {detail.property?.name ? (
                  <>
                    {' '}
                    · {detail.property.name}
                    {detail.branch?.name ? ` — ${detail.branch.name}` : ''}
                  </>
                ) : null}
              </p>
            </div>
          </div>

          {thumbImages.length > 1 ? (
            <div className="flex gap-2 overflow-x-auto border-t border-white/10 bg-black/40 p-3 backdrop-blur-md">
              {thumbImages.map((src, i) => (
                <button
                  key={`${src}-${i}`}
                  type="button"
                  onClick={() => setActiveImage(i)}
                  className={[
                    'relative h-16 w-24 shrink-0 overflow-hidden rounded-xl border-2 transition-all sm:h-20 sm:w-28',
                    activeImage === i
                      ? 'border-primary ring-2 ring-primary/40'
                      : 'border-transparent opacity-70 hover:opacity-100',
                  ].join(' ')}
                  aria-label={`Ảnh ${i + 1}`}
                >
                  <img src={src} alt="" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          ) : null}
        </section>

        <div className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {stats.map((item) => (
            <div
              key={item.icon}
              className="flex items-center gap-3 rounded-2xl border border-primary/10 bg-primary/5 px-4 py-4"
            >
              <span className="material-symbols-outlined text-2xl text-primary">{item.icon}</span>
              <span className="text-sm font-semibold leading-snug text-on-surface">{item.label}</span>
            </div>
          ))}
        </div>

        {gallery.length > 1 ? (
          <section className="mb-10" aria-label="Ảnh tổng quan phòng">
            <h2 className="font-headline mb-4 text-lg font-bold text-on-surface">Ảnh tổng quan</h2>
            <div
              className={[
                'grid gap-3',
                gallery.length >= 4 ? 'grid-cols-2 md:grid-cols-4' : 'grid-cols-2 md:grid-cols-3',
              ].join(' ')}
            >
              {gallery.map((src, i) => (
                <button
                  key={`${src}-overview-${i}`}
                  type="button"
                  onClick={() => setActiveImage(i)}
                  className={[
                    'group relative overflow-hidden rounded-2xl',
                    i === 0 && gallery.length >= 3 ? 'col-span-2 row-span-2 aspect-[4/3]' : 'aspect-[4/3]',
                    activeImage === i ? 'ring-2 ring-primary ring-offset-2' : '',
                  ].join(' ')}
                >
                  <img
                    src={src}
                    alt={`${detail.title} — ảnh ${i + 1}`}
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  <span className="absolute right-2 bottom-2 rounded-full bg-black/50 px-2 py-0.5 text-[10px] font-bold text-white">
                    {i + 1}/{gallery.length}
                  </span>
                </button>
              ))}
            </div>
          </section>
        ) : null}

        <div className="grid gap-10 lg:grid-cols-[1fr_380px] lg:items-start lg:gap-12">
          <article>
            {detail.property && (
              <div className="mb-8 flex flex-wrap items-center gap-3 rounded-2xl border border-black/5 bg-white px-5 py-4 shadow-sm">
                <span className="material-symbols-outlined text-primary">location_on</span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-bold text-on-surface">{detail.property.name}</p>
                  <p className="text-xs text-on-surface-variant">
                    {detail.branch?.name}
                    {detail.property.city ? ` · ${detail.property.city}` : ''}
                  </p>
                </div>
                {detail.property.slug && (
                  <Link
                    to={`/properties/${detail.property.slug}`}
                    className="shrink-0 text-xs font-bold text-primary hover:underline"
                  >
                    Xem cơ sở
                  </Link>
                )}
              </div>
            )}

            <div className="space-y-4 text-base leading-relaxed text-on-surface-variant">
              {detail.paragraphs.map((p, i) => (
                <p key={i} className={i === 0 ? 'text-lg text-on-surface' : ''}>
                  {p}
                </p>
              ))}
            </div>

            <h2 className="font-headline mt-12 text-xl font-bold text-on-surface">Tiện nghi phòng</h2>
            <ul className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
              {detail.amenities.length ? (
                detail.amenities.map((am) => (
                  <li
                    key={am.label}
                    className="flex items-center gap-3 rounded-xl border border-black/5 bg-white px-4 py-3 shadow-sm transition-shadow hover:shadow-md"
                  >
                    <span className="material-symbols-outlined text-primary">{am.icon}</span>
                    <span className="text-sm font-medium text-on-surface">{am.label}</span>
                  </li>
                ))
              ) : (
                <li className="col-span-full text-sm text-on-surface-variant">
                  Tiện nghi sẽ được cập nhật từ loại phòng trong admin.
                </li>
              )}
            </ul>

            <div className="mt-12 rounded-2xl bg-surface-container/80 p-6 md:p-8">
              <h2 className="font-headline text-lg font-bold text-on-surface">Chính sách hủy phòng</h2>
              <p className="mt-3 text-sm text-on-surface-variant">
                Hủy trước <strong>24 giờ</strong> nhận phòng (14:00): hoàn <strong>100%</strong> vào ví Cherry House.
                Hủy trong vòng 24 giờ: không hoàn tiền. Ví dùng cho đặt phòng tiếp theo.
              </p>
              {detail.policyBullets.length ? (
                <ul className="mt-4 list-inside list-disc space-y-2 text-sm leading-relaxed text-on-surface-variant">
                  {detail.policyBullets.map((line, i) => (
                    <li key={i}>{line}</li>
                  ))}
                </ul>
              ) : (
                <p className="mt-4 text-sm text-on-surface-variant">
                  Liên hệ lễ tân để biết điều kiện hủy theo từng mùa.
                </p>
              )}
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
              {STATUS_LABEL[detail.status] ?? STATUS_LABEL.booked}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

export default RoomDetailPage;
