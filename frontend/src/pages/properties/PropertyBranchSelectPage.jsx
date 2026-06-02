import { useMemo } from 'react';
import { Link, Navigate, useParams, useSearchParams } from 'react-router-dom';
import { LAYOUT_CONTAINER } from '../../constants/layoutContainer';
import { formatPriceFrom, resolveProperty } from '../../data/properties';
import {
  CTA,
  buildUrl,
  getDiscoveryHref,
  parseBookingContext,
} from '../../lib/bookingContext';
import { countRoomsByBranch } from '../booking/bookingData';

function BranchCard({ property, branch, context }) {
  const roomCount = countRoomsByBranch(branch.id);
  const image = branch.image ?? property.heroImage;
  const priceFrom = branch.priceFromVnd ?? property.priceFromVnd;
  const detailUrl = buildUrl(`/properties/${property.slug}/branches/${branch.id}`, context);
  const bookingUrl = buildUrl('/booking', {
    ...context,
    property: property.slug,
    branch: branch.id,
  });

  return (
    <article className="group overflow-hidden rounded-2xl border border-black/5 bg-white shadow-sm transition-shadow hover:shadow-lg">
      <Link to={detailUrl} className="relative block aspect-[16/10] overflow-hidden">
        <img
          src={image}
          alt={branch.name}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-linear-to-t from-black/60 to-transparent" aria-hidden />
        <p className="absolute right-4 bottom-4 left-4 font-headline text-lg font-bold text-white md:text-xl">
          {branch.name}
        </p>
      </Link>
      <div className="p-5">
        <p className="flex items-start gap-2 text-sm text-on-surface-variant">
          <span className="material-symbols-outlined shrink-0 text-base text-primary">location_on</span>
          {branch.address}
        </p>
        {branch.tagline ? (
          <p className="mt-2 text-sm leading-relaxed text-on-surface-variant">{branch.tagline}</p>
        ) : null}
        <div className="mt-4 flex flex-wrap gap-2 text-xs">
          <span className="rounded-full bg-surface-container-low px-2.5 py-1 font-semibold text-on-surface">
            {roomCount} phòng demo
          </span>
          <span className="rounded-full bg-primary/10 px-2.5 py-1 font-semibold text-primary">
            Từ {formatPriceFrom(priceFrom)}/đêm
          </span>
        </div>
        <div className="mt-5 flex flex-col gap-2 sm:flex-row">
          <Link
            to={detailUrl}
            className="text-center text-sm font-bold text-primary hover:underline sm:text-left"
          >
            {CTA.branchDetail}
          </Link>
          <Link
            to={bookingUrl}
            className="rounded-lg bg-primary px-5 py-2.5 text-center text-sm font-bold text-white shadow-md shadow-primary/20 hover:brightness-110"
          >
            {CTA.viewRooms}
          </Link>
        </div>
      </div>
    </article>
  );
}

export default function PropertyBranchSelectPage() {
  const { propertySlug } = useParams();
  const [searchParams] = useSearchParams();
  const property = resolveProperty(propertySlug);
  const context = useMemo(() => parseBookingContext(searchParams), [searchParams]);

  if (!property) {
    return (
      <div className={[LAYOUT_CONTAINER, 'py-28 text-center'].join(' ')}>
        <h1 className="font-headline text-2xl font-bold">Không tìm thấy cơ sở</h1>
        <Link to={getDiscoveryHref(context)} className="mt-6 inline-block font-bold text-primary hover:underline">
          Quay lại danh sách
        </Link>
      </div>
    );
  }

  if (property.subBranches.length === 1) {
    const only = property.subBranches[0];
    return (
      <Navigate
        to={buildUrl('/booking', { ...context, property: property.slug, branch: only.id })}
        replace
      />
    );
  }

  const propertyDetailUrl = buildUrl(`/properties/${property.slug}`, context);

  return (
    <div className="bg-surface pb-20">
      <div className={[LAYOUT_CONTAINER, 'pt-24 md:pt-28'].join(' ')}>
        <nav className="mb-6 text-sm text-on-surface-variant">
          <Link to={getDiscoveryHref(context)} className="hover:text-primary">
            Cơ sở lưu trú
          </Link>
          <span className="mx-2">/</span>
          <Link to={propertyDetailUrl} className="hover:text-primary">
            {property.name}
          </Link>
          <span className="mx-2">/</span>
          <span className="font-semibold text-on-surface">Chọn chi nhánh</span>
        </nav>

        <h1 className="font-headline text-3xl font-extrabold text-on-surface md:text-4xl">
          Chọn chi nhánh để đặt phòng
        </h1>
        <p className="mt-3 max-w-2xl text-base leading-relaxed text-on-surface-variant">
          <strong className="text-on-surface">{property.name}</strong> có {property.subBranches.length}{' '}
          chi nhánh tại {property.city}. Mỗi chi nhánh có danh sách phòng và giá riêng.
        </p>

        <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {property.subBranches.map((branch) => (
            <BranchCard key={branch.id} property={property} branch={branch} context={context} />
          ))}
        </div>
      </div>
    </div>
  );
}
