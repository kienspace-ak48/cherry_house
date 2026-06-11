import { Link } from 'react-router-dom';
import { LAYOUT_CONTAINER } from '../../constants/layoutContainer';
import { PROPERTY_KIND_LABELS } from '../../data/properties';
import { getDiscoveryHref } from '../../lib/bookingContext';
import { resolveMediaUrl } from '../../lib/resolveMediaUrl';

/**
 * @param {{
 *   eyebrow: string;
 *   title: string;
 *   description: string;
 *   items: import('../../types/homePage').HomeKindItem[];
 * }} props
 */
function HomeKindsSection({ eyebrow, title, description, items }) {
  if (!items?.length) return null;

  return (
    <section id="loai-hinh-luu-tru" className="scroll-mt-28 bg-[#1c1c19] py-14 text-white md:py-20">
      <div className={LAYOUT_CONTAINER}>
        <div className="mb-10 max-w-3xl">
          <p className="text-xs font-bold tracking-[0.2em] text-primary-container uppercase">{eyebrow}</p>
          <h2 className="mt-2 font-headline text-2xl font-extrabold leading-tight md:text-4xl">{title}</h2>
          <p className="mt-3 text-sm leading-relaxed text-white/70 md:text-base">{description}</p>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 md:gap-4">
          {items.map((item, index) => {
            const label = PROPERTY_KIND_LABELS[item.kind] || item.kind;
            return (
              <Link
                key={`${item.kind}-${index}`}
                to={getDiscoveryHref({ kind: item.kind })}
                className="group relative min-h-[220px] overflow-hidden rounded-2xl bg-neutral-800 shadow-lg transition-transform hover:-translate-y-0.5 md:min-h-[280px]"
              >
                {item.imageUrl ? (
                  <img
                    src={resolveMediaUrl(item.imageUrl)}
                    alt={label}
                    className="absolute inset-0 h-full w-full object-cover opacity-80 transition-transform duration-500 group-hover:scale-105"
                  />
                ) : null}
                <div
                  className="absolute inset-0 bg-linear-to-t from-black/90 via-black/45 to-black/20"
                  aria-hidden
                />
                {item.badge ? (
                  <span className="absolute top-3 left-3 rounded-full bg-primary px-2.5 py-1 text-[9px] font-bold tracking-wide text-white uppercase md:text-[10px]">
                    {item.badge}
                  </span>
                ) : null}
                <div className="absolute right-4 bottom-4 left-4">
                  <p className="font-headline text-base font-bold text-white md:text-lg">{label}</p>
                  {item.countLabel ? (
                    <p className="mt-1 text-xs text-white/75 md:text-sm">{item.countLabel}</p>
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

export default HomeKindsSection;
