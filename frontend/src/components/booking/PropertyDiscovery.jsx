import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import propertyApi from '../../api/propertyApi';
import BookingBreadcrumbs from './BookingBreadcrumbs';
import BookingProgress from './BookingProgress';
import BookingSearchBar from './BookingSearchBar';
import { LAYOUT_CONTAINER } from '../../constants/layoutContainer';
import {
  filterPropertyList,
  mapPropertyFromApi,
  propertyApiQueryFromContext,
} from '../../lib/mapProperty';
import { BookingPageLoading, awaitMinLoadingDelay } from './BookingLoading';
import {
  CTA,
  formatContextSummary,
  getBookingStepHref,
  getDiscoveryProgressStep,
  getPropertyContinueHref,
  hasDateRange,
  parseBookingContext,
  resolveSearchDestination,
  shouldAutoAdvanceProperty,
} from '../../lib/bookingContext';

function PropertyCard({ property, context }) {
  const continueHref = getPropertyContinueHref(property, context);

  return (
    <article className="group overflow-hidden rounded-2xl border border-black/5 bg-white shadow-sm transition-shadow hover:shadow-lg">
      <Link to={continueHref} className="block">
        <div className="relative aspect-[4/3] overflow-hidden">
          <img
            src={property.heroImage}
            alt={property.name}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <span className="absolute top-3 left-3 rounded-full bg-white/95 px-3 py-1 text-[10px] font-bold tracking-wide text-primary uppercase backdrop-blur">
            {property.kindLabel}
          </span>
          <span className="absolute top-3 right-3 flex items-center gap-1 rounded-full bg-on-surface/75 px-2.5 py-1 text-xs font-bold text-white backdrop-blur">
            <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>
              star
            </span>
            {property.rating}
          </span>
        </div>
        <div className="p-5">
          <h2 className="font-headline text-lg font-bold text-on-surface transition-colors group-hover:text-primary">
            {property.name}
          </h2>
          <p className="mt-1 flex items-center gap-1 text-sm text-on-surface-variant">
            <span className="material-symbols-outlined text-base text-primary">location_on</span>
            {property.city}, {property.region}
          </p>
          <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-on-surface-variant">
            {property.tagline}
          </p>
          <div className="mt-4 flex flex-wrap gap-2 text-xs text-on-surface-variant">
            <span className="inline-flex items-center gap-1 rounded-full bg-surface-container-low px-2.5 py-1">
              <span className="material-symbols-outlined text-sm">domain</span>
              {property.branchCount} chi nhánh
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-surface-container-low px-2.5 py-1">
              <span className="material-symbols-outlined text-sm">bed</span>
              {property.roomCount} phòng
            </span>
          </div>
          <span className="mt-5 inline-flex w-full items-center justify-center rounded-lg bg-primary px-5 py-2.5 text-sm font-bold text-white shadow-md shadow-primary/20 transition-all group-hover:brightness-110 sm:w-auto">
            {CTA.propertyPrimary}
          </span>
        </div>
      </Link>
    </article>
  );
}

export default function PropertyDiscovery() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const context = useMemo(() => parseBookingContext(searchParams), [searchParams]);
  const searchKey = searchParams.toString();

  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (searchParams.get('focus') === 'search') {
      requestAnimationFrame(() => {
        document.getElementById('booking-search')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    }
  }, [searchParams]);

  useEffect(() => {
    let cancelled = false;

    async function loadProperties() {
      const startedAt = Date.now();
      setLoading(true);
      setError(null);
      setProperties([]);
      try {
        const res = await propertyApi.list(
          propertyApiQueryFromContext({ city: context.city, kind: context.kind }),
        );
        if (cancelled) return;

        if (!res?.success) {
          throw new Error(res?.message || 'Không tải được danh sách cơ sở');
        }

        setProperties((res.data ?? []).map(mapPropertyFromApi));
      } catch (err) {
        if (cancelled) return;
        const message = err instanceof Error ? err.message : 'Lỗi kết nối API';
        setError(message);
        setProperties([]);
      } finally {
        if (!cancelled) {
          await awaitMinLoadingDelay(startedAt);
          if (!cancelled) setLoading(false);
        }
      }
    }

    loadProperties();
    return () => {
      cancelled = true;
    };
  }, [context.city, context.kind, searchKey]);

  const filtered = useMemo(() => {
    if (!context.q) return properties;
    return filterPropertyList(properties, { q: context.q });
  }, [properties, context.q]);

  const autoAdvance = !loading
    && !error
    && shouldAutoAdvanceProperty(filtered.length, searchParams);

  useEffect(() => {
    if (!autoAdvance) return;
    const property = filtered[0];
    navigate(getPropertyContinueHref(property, context), { replace: true });
  }, [autoAdvance, filtered, searchParams, context, navigate]);

  const handleSearch = (ctx) => {
    navigate(resolveSearchDestination(ctx));
  };

  const summary = formatContextSummary(context);

  if (autoAdvance) {
    return (
      <BookingPageLoading
        title="Đang tải"
        message="Đang mở cơ sở phù hợp…"
      />
    );
  }

  return (
    <div className="bg-surface pb-20">
      <section className="border-b border-black/5 bg-surface-container-low/80">
        <div className={[LAYOUT_CONTAINER, 'pt-24 pb-10 md:pt-28 md:pb-12'].join(' ')}>
          <BookingProgress current={getDiscoveryProgressStep(context)} context={context} />
          <BookingBreadcrumbs
            className="mb-4"
            items={
              getDiscoveryProgressStep(context) === 'search'
                ? [{ label: 'Tìm kiếm', current: true }]
                : [
                    { label: 'Tìm kiếm', href: getBookingStepHref('search', context) },
                    { label: 'Chọn cơ sở', current: true },
                  ]
            }
          />
          <p className="font-headline text-xs font-bold tracking-[0.2em] text-primary uppercase">
            Đặt phòng Cherry House
          </p>
          <h1 className="mt-3 font-headline text-3xl font-extrabold text-on-surface md:text-4xl">
            Đặt phòng
          </h1>

          <div className="mt-8">
            <BookingSearchBar
              variant="compact"
              initialContext={context}
              onSubmit={handleSearch}
              id="booking-search"
            />
          </div>
        </div>
      </section>

      <div className={[LAYOUT_CONTAINER, 'pt-10'].join(' ')}>
        {/* <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-800">
          <span className="material-symbols-outlined text-sm">cloud_done</span>
          Dữ liệu từ API · GET /api/catalog/properties
        </p> */}

        {!hasDateRange(context) ? (
          <p className="mb-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
            <span className="material-symbols-outlined align-middle text-base">info</span>
            {' '}
            Chọn <strong>ngày nhận – trả phòng</strong> ở bước Tìm kiếm để xem phòng trống chính xác ở các bước sau.
          </p>
        ) : null}

        {!loading && summary ? (
          <p className="mb-4 rounded-xl border border-primary/15 bg-primary/5 px-4 py-3 text-sm text-on-surface-variant">
            <span className="font-semibold text-on-surface">{summary}</span>
            <span className="mx-2">·</span>
            <span className="font-semibold text-on-surface">{filtered.length}</span> cơ sở phù hợp
          </p>
        ) : null}

        {!loading && !summary ? (
          <p className="mb-6 text-sm text-on-surface-variant">
            <span className="font-semibold text-on-surface">{filtered.length}</span> cơ sở
          </p>
        ) : null}

        {loading ? (
          <BookingPageLoading
            variant="embedded"
            title="Đang tải"
            message="Đang tải danh sách cơ sở từ hệ thống…"
          />
        ) : null}

        {!loading && error && (
          <div className="rounded-2xl border border-dashed border-red-200 bg-red-50 py-12 text-center">
            <p className="font-headline text-lg font-bold text-red-800">Không tải được dữ liệu</p>
            <p className="mt-2 text-sm text-red-700">{error}</p>
            <p className="mt-2 text-xs text-red-600/80">
              Kiểm tra MySQL đang chạy, backend ở port 8080, và đã seed DB (`npm run db:seed`).
            </p>
          </div>
        )}

        {!loading && !error && filtered.length === 0 && (
          <div className="rounded-2xl border border-dashed border-black/15 bg-white py-16 text-center">
            <span className="material-symbols-outlined text-4xl text-primary/50">travel_explore</span>
            <p className="mt-4 font-headline text-lg font-bold text-on-surface">Không tìm thấy cơ sở</p>
            <p className="mt-2 text-sm text-on-surface-variant">Thử đổi địa điểm, ngày hoặc loại hình.</p>
            <button
              type="button"
              className="mt-6 text-sm font-bold text-primary hover:underline"
              onClick={() => {
                setSearchParams({});
                navigate('/booking');
              }}
            >
              Xóa bộ lọc
            </button>
          </div>
        )}

        {!loading && !error && filtered.length > 0 && (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((property) => (
              <PropertyCard key={property.slug} property={property} context={context} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
