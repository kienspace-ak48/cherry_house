import { LAYOUT_CONTAINER } from '../../constants/layoutContainer';

/**
 * @param {{
 *   eyebrow: string;
 *   title: string;
 *   description: string;
 *   items: import('../../types/homePage').HomeWhyItem[];
 * }} props
 */
function HomeWhySection({ eyebrow, title, description, items }) {
  if (!items?.length) return null;

  return (
    <section className="bg-surface py-14 md:py-20">
      <div className={LAYOUT_CONTAINER}>
        <div className="mb-10 max-w-3xl">
          <p className="text-xs font-bold tracking-[0.2em] text-primary uppercase">{eyebrow}</p>
          <h2 className="mt-2 font-headline text-3xl font-extrabold leading-tight text-on-surface md:text-4xl">
            {title}
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-on-surface-variant md:text-base">
            {description}
          </p>
        </div>

        <div className="overflow-hidden rounded-2xl border border-black/10 bg-white shadow-sm">
          <div className="grid divide-y divide-black/10 md:grid-cols-3 md:divide-x md:divide-y-0">
            {items.map((item, index) => (
              <div key={`${item.number}-${index}`} className="px-6 py-8 md:px-8 md:py-10">
                <p className="font-headline text-5xl font-extrabold leading-none text-primary/20 md:text-6xl">
                  {item.number}
                </p>
                <h3 className="mt-4 font-headline text-lg font-bold text-on-surface md:text-xl">
                  {item.title}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-on-surface-variant">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export default HomeWhySection;
