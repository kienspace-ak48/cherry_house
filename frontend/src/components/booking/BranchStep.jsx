import { Link } from 'react-router-dom';
import BranchMap from './BranchMap';
import BookingProgress from './BookingProgress';
import BookingSearchBar from './BookingSearchBar';
import { LAYOUT_CONTAINER } from '../../constants/layoutContainer';
import { formatPriceFrom, propertyBranchesPath } from '../../data/properties';
import BookingBreadcrumbs from './BookingBreadcrumbs';
import {
  CTA,
  buildUrl,
  getBookingStepHref,
  getDiscoveryListHref,
} from '../../lib/bookingContext';

function branchLabel(name) {
  return name.replace(/^Chi nhánh /, '').replace(/^Cherry House /, '');
}

/**
 * @param {{ property: NonNullable<ReturnType<typeof import('../../data/properties').resolveProperty>>; context: import('../../lib/bookingContext').BookingContext; onSearch: (ctx: import('../../lib/bookingContext').BookingContext) => void }} props
 */
export default function BranchStep({ property, context, onSearch }) {
  if (!property) return null;

  const comparePath = buildUrl(propertyBranchesPath(property.slug), context);
  const singleBranch = property.subBranches.length === 1;

  return (
    <div className="bg-surface pb-20">
      <section className="border-b border-black/5 bg-surface-container-low/80">
        <div className={[LAYOUT_CONTAINER, 'pt-24 pb-10 md:pt-28 md:pb-12'].join(' ')}>
          <BookingProgress current="branch" context={context} />
          <BookingBreadcrumbs
            className="mb-4"
            items={[
              { label: 'Tìm kiếm', href: getBookingStepHref('search', context) },
              { label: 'Cơ sở', href: getBookingStepHref('property', context) },
              { label: property.name, current: true },
            ]}
          />
          <h1 className="font-headline text-3xl font-extrabold text-on-surface md:text-4xl">
            Chọn chi nhánh
          </h1>
          <p className="mt-2 text-base text-on-surface-variant">{property.name}</p>

          <div className="mt-8">
            <BookingSearchBar
              variant="compact"
              initialContext={context}
              onSubmit={onSearch}
              id="booking-search"
            />
          </div>
        </div>
      </section>

      <div className={[LAYOUT_CONTAINER, 'pt-10'].join(' ')}>
        <div className="rounded-2xl border border-black/5 bg-white p-5 shadow-lg md:p-6">
          <div className="mb-6">
            <p className="text-xs font-bold tracking-wide text-on-surface-variant uppercase">Giá từ</p>
            <p className="font-headline text-2xl font-extrabold text-primary">
              {formatPriceFrom(property.priceFromVnd)}
              <span className="text-sm font-bold text-on-surface-variant"> / đêm</span>
            </p>
          </div>

          <h2 className="font-headline text-sm font-bold tracking-wide text-on-surface uppercase">
            {singleBranch ? 'Chi nhánh' : 'Chọn chi nhánh để xem phòng'}
          </h2>
          <div className="mt-3 flex flex-wrap gap-2">
            {property.subBranches.map((b) => (
              <Link
                key={b.id}
                to={buildUrl('/booking', { ...context, property: property.slug, branch: b.id })}
                className={[
                  'rounded-full border px-4 py-2 text-sm font-semibold transition-all hover:brightness-105 active:scale-[0.98]',
                  context.branch === b.id || singleBranch
                    ? 'border-primary bg-primary text-white shadow-md hover:brightness-110'
                    : 'border-black/10 bg-surface-container-low text-on-surface hover:border-primary hover:bg-primary/5 hover:text-primary',
                ].join(' ')}
              >
                {branchLabel(b.name)}
              </Link>
            ))}
          </div>
          {!singleBranch && (
            <p className="mt-4 text-xs">
              <Link
                to={comparePath}
                className="text-on-surface-variant underline-offset-2 hover:text-primary hover:underline"
              >
                {CTA.compareBranches}
              </Link>
            </p>
          )}

          <BranchMap property={property} context={context} activeBranchId={context.branch} />
        </div>
      </div>
    </div>
  );
}
