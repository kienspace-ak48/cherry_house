import { useMemo } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { usePageSeo } from '../../hooks/usePageSeo';
import { LAYOUT_CONTAINER } from '../../constants/layoutContainer';
import {
  formatPriceFrom,
  propertyBranchesPath,
  resolveBranch,
} from '../../data/properties';
import {
  CTA,
  buildUrl,
  getDiscoveryHref,
  parseBookingContext,
} from '../../lib/bookingContext';
import { countByStatus, countRoomsByBranch, filterRoomsByPropertyBranch } from '../booking/bookingData';

export default function BranchDetailPage() {
  const { propertySlug, branchId } = useParams();
  const [searchParams] = useSearchParams();
  const context = useMemo(() => parseBookingContext(searchParams), [searchParams]);
  const resolved = resolveBranch(propertySlug, branchId);

  const seoVars = useMemo(
    () => (resolved
      ? {
          propertyName: resolved.property.name,
          branchName: resolved.branch.name,
          city: resolved.property.city,
          region: resolved.property.region,
          tagline: resolved.branch.tagline || resolved.property.tagline || '',
        }
      : {}),
    [resolved],
  );
  const seoBreadcrumbs = useMemo(
    () => (resolved
      ? [
          { name: 'Cơ sở lưu trú', path: '/properties' },
          { name: resolved.property.name, path: `/properties/${resolved.property.slug}` },
          {
            name: resolved.branch.name,
            path: `/properties/${resolved.property.slug}/branches/${resolved.branch.id}`,
          },
        ]
      : []),
    [resolved],
  );
  usePageSeo(seoVars, seoBreadcrumbs);

  if (!resolved) {
    return (
      <div className={[LAYOUT_CONTAINER, 'py-28 text-center'].join(' ')}>
        <h1 className="font-headline text-2xl font-bold">Không tìm thấy chi nhánh</h1>
        <Link to={getDiscoveryHref(context)} className="mt-6 inline-block font-bold text-primary hover:underline">
          Xem cơ sở lưu trú
        </Link>
      </div>
    );
  }

  const { property, branch } = resolved;
  const image = branch.image ?? property.heroImage;
  const priceFrom = branch.priceFromVnd ?? property.priceFromVnd;
  const rooms = filterRoomsByPropertyBranch(property.slug, branch.id);
  const stats = countByStatus(rooms);
  const roomCount = branch.roomCount ?? countRoomsByBranch(branch.id);
  const branchesPath = buildUrl(propertyBranchesPath(property.slug), context);
  const bookingUrl = buildUrl('/booking', {
    ...context,
    property: property.slug,
    branch: branch.id,
  });

  return (
    <div className="bg-surface pb-24">
      <div className="relative h-[min(40vh,360px)] w-full overflow-hidden">
        <img src={image} alt={branch.name} className="h-full w-full object-cover" />
        <div className="hero-home-gradient absolute inset-0" aria-hidden />
        <div className={[LAYOUT_CONTAINER, 'absolute inset-x-0 bottom-0 pb-8'].join(' ')}>
          <Link
            to={branchesPath}
            className="mb-3 inline-flex items-center gap-1 text-sm font-semibold text-white/90 hover:text-white"
          >
            <span className="material-symbols-outlined text-lg">arrow_back</span>
            {CTA.changeBranch}
          </Link>
          <p className="text-xs font-bold tracking-widest text-white/80 uppercase">{property.name}</p>
          <h1 className="font-headline text-3xl font-extrabold text-white md:text-4xl">{branch.name}</h1>
          <p className="mt-2 flex items-center gap-1 text-sm text-white/90">
            <span className="material-symbols-outlined text-base">location_on</span>
            {branch.address} · {property.city}
          </p>
        </div>
      </div>

      <div className={[LAYOUT_CONTAINER, '-mt-5 relative z-10'].join(' ')}>
        <div className="rounded-2xl border border-black/5 bg-white p-5 shadow-lg md:flex md:items-center md:justify-between md:p-6">
          <div>
            <p className="text-xs font-bold tracking-wide text-on-surface-variant uppercase">Giá từ</p>
            <p className="font-headline text-2xl font-extrabold text-primary">
              {formatPriceFrom(priceFrom)}
              <span className="text-sm font-bold text-on-surface-variant"> / đêm</span>
            </p>
            <p className="mt-1 text-sm text-on-surface-variant">
              {roomCount} phòng · {stats.available} trống (demo)
            </p>
          </div>
          <Link
            to={bookingUrl}
            className="mt-4 inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-8 py-3.5 text-sm font-bold text-white shadow-md shadow-primary/25 hover:brightness-110 md:mt-0"
          >
            <span className="material-symbols-outlined">bed</span>
            {CTA.viewRooms}
          </Link>
        </div>

        {branch.tagline ? (
          <p className="mt-8 max-w-2xl text-base leading-relaxed text-on-surface-variant">{branch.tagline}</p>
        ) : null}

        <section className="mt-10">
          <h2 className="font-headline text-lg font-bold text-on-surface">Phòng tại chi nhánh (xem trước)</h2>
          <p className="mt-1 text-sm text-on-surface-variant">
            {rooms.length} phòng trong dữ liệu demo — bấm nút trên để lọc và đặt.
          </p>
          {rooms.length === 0 ? (
            <p className="mt-4 rounded-xl border border-dashed border-black/15 bg-white py-8 text-center text-sm text-on-surface-variant">
              Chưa có phòng demo cho chi nhánh này.
            </p>
          ) : (
            <ul className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {rooms.slice(0, 6).map((r) => (
                <li
                  key={r.id}
                  className="rounded-xl border border-black/5 bg-white px-4 py-3 text-sm shadow-sm"
                >
                  <span className="font-headline font-bold text-on-surface">{r.code}</span>
                  <span className="mx-2 text-on-surface-variant/50">·</span>
                  <span className="text-on-surface-variant">{r.type}</span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
