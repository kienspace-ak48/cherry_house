import { Link } from 'react-router-dom';
import { LAYOUT_CONTAINER } from '../../constants/layoutContainer';
import { getDiscoveryHref } from '../../lib/bookingContext';
import { resolveMediaUrl } from '../../lib/resolveMediaUrl';

/**
 * @param {{
 *   eyebrow: string;
 *   title: string;
 *   seeAllLabel: string;
 *   seeAllHref: string;
 *   areas: import('../../types/homePage').HomeAreaItem[];
 * }} props
 */
function HomeAreasSection({ eyebrow, title, seeAllLabel, seeAllHref, areas }) {
  if (!areas?.length) return null;

  const areaHref = (area) => {
    if (area.comingSoon) return getDiscoveryHref();
    return getDiscoveryHref({ city: area.filterCity });
  };

  return (
    <section id="khu-vuc-pho-bien" className="scroll-mt-28 bg-white py-14 md:py-20">
      <div className={LAYOUT_CONTAINER}>
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-bold tracking-[0.2em] text-primary uppercase">{eyebrow}</p>
            <h2 className="mt-1 font-headline text-2xl font-extrabold text-on-surface md:text-3xl">
              {title}
            </h2>
          </div>
          <Link
            to={seeAllHref || '/booking'}
            className="inline-flex items-center gap-1 text-sm font-semibold text-primary transition-colors hover:text-primary-container"
          >
            {seeAllLabel}
            <span aria-hidden>→</span>
          </Link>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 md:gap-4">
          {areas.map((area, index) => {
            const featured = Boolean(area.isFeatured);
            return (
              <Link
                key={`${area.title}-${index}`}
                to={areaHref(area)}
                className={[
                  'group relative overflow-hidden rounded-2xl bg-neutral-800 shadow-md transition-shadow hover:shadow-xl',
                  featured ? 'col-span-2 min-h-[220px] md:min-h-[300px]' : 'min-h-[200px] md:min-h-[300px]',
                ].join(' ')}
              >
                {area.imageUrl ? (
                  <img
                    src={resolveMediaUrl(area.imageUrl)}
                    alt={area.title}
                    className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                ) : null}
                <div
                  className="absolute inset-0 bg-linear-to-t from-black/85 via-black/30 to-black/10"
                  aria-hidden
                />
                {area.priceFrom ? (
                  <span className="absolute top-3 right-3 rounded-full bg-primary px-2.5 py-1 text-[10px] font-bold tracking-wide text-white uppercase md:text-xs">
                    {area.priceFrom}
                  </span>
                ) : null}
                {area.comingSoon ? (
                  <span className="absolute top-3 left-3 rounded-full bg-white/90 px-2.5 py-1 text-[10px] font-bold text-on-surface uppercase">
                    Sắp mở
                  </span>
                ) : null}
                <div className="absolute right-4 bottom-4 left-4">
                  <p
                    className={[
                      'font-headline font-bold leading-tight text-white drop-shadow-sm',
                      featured ? 'text-xl md:text-2xl' : 'text-lg md:text-xl',
                    ].join(' ')}
                  >
                    {area.title}
                  </p>
                  {area.subtitle ? (
                    <p className="mt-1 text-xs text-white/80 md:text-sm">{area.subtitle}</p>
                  ) : null}
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export default HomeAreasSection;
