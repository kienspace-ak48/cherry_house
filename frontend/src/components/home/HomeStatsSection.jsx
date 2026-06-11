import { LAYOUT_CONTAINER } from '../../constants/layoutContainer';

/**
 * @param {{ stats: import('../../types/homePage').HomeStatItem[] }} props
 */
function HomeStatsSection({ stats }) {
  if (!stats?.length) return null;

  return (
    <section className="border-y border-black/5 bg-[#f5f0ea] py-10 md:py-12">
      <div className={LAYOUT_CONTAINER}>
        <div className="grid grid-cols-2 divide-x-0 divide-black/10 md:grid-cols-4 md:divide-x">
          {stats.map((stat, index) => (
            <div
              key={`${stat.value}-${index}`}
              className={[
                'px-4 py-2 text-center md:px-6',
                index > 0 ? 'border-t border-black/10 md:border-t-0' : '',
                index % 2 === 1 ? 'border-l border-black/10 md:border-l-0' : '',
              ].join(' ')}
            >
              <p className="font-headline text-3xl font-extrabold tracking-tight text-primary md:text-4xl">
                {stat.value}
              </p>
              <p className="mt-2 text-xs leading-snug text-on-surface-variant md:text-sm">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default HomeStatsSection;
