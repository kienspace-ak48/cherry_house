import { useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import BookingSearchBar from '../components/booking/BookingSearchBar';
import { LAYOUT_CONTAINER } from '../constants/layoutContainer';
import { ACCOMMODATION_TYPE_CARDS, POPULAR_AREAS } from '../data/homeDiscovery';
import {
  PROPERTY_KIND_LABELS,
  countPropertiesByKind,
} from '../data/properties';
import { buildUrl, getDiscoveryHref, resolveSearchDestination } from '../lib/bookingContext';

const HERO_IMG =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuB46N4gVdqMtHJt5y5SfzRJ7LGlY14me9PiNAgF3Chaet_LX03hK5BdX1GUFDyspTd1Vh69BeDxCF1J_-Z8fNcyKqv-PPeuVSISenigGRv76VonFLP5i9lzkQ2Nw7Gr0TE2UhGXKNjZ9lwaroGdk-xko0snVoPidEyg16Cr2mKoML6WVyc_qwTLdug0M8NYVZIXicCvZPa0KLeATfwcDXbggz26e4dXmjEMxclfT9kEPX_OSM7P-_A2hF9YJjdGtgIyW-1jwo6T3Q';

function scrollCarousel(ref, direction) {
  const el = ref.current;
  if (!el) return;
  const delta = Math.round(el.clientWidth * 0.72) || 280;
  el.scrollBy({ left: direction * delta, behavior: 'smooth' });
}

function CarouselNavButton({ direction, onClick, label }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-black/10 bg-white text-on-surface shadow-md transition-all hover:border-primary hover:bg-primary hover:text-white"
    >
      <span className="material-symbols-outlined">{direction === 'prev' ? 'west' : 'east'}</span>
    </button>
  );
}

function HomePage() {
  const areasScrollerRef = useRef(null);
  const navigate = useNavigate();
  const kindCounts = countPropertiesByKind();

  const handleSearch = (ctx) => {
    navigate(resolveSearchDestination(ctx));
  };

  const areaHref = (area) => {
    if (area.comingSoon) return getDiscoveryHref();
    return getDiscoveryHref({ city: area.filterCity });
  };

  const kindHref = (kind) => getDiscoveryHref({ kind });

  return (
    <div className="bg-surface text-on-surface">
      <section className="relative flex min-h-[max(560px,calc(100svh-4.25rem))] items-center justify-center overflow-hidden md:min-h-[max(700px,calc(100svh-4.75rem))]">
        <div className="absolute inset-0 z-0">
          <img
            className="h-full w-full object-cover"
            alt="Cherry House — chuỗi homestay đa chi nhánh tại Việt Nam"
            src={HERO_IMG}
          />
          <div className="hero-home-gradient absolute inset-0" aria-hidden />
        </div>

        <div className={[LAYOUT_CONTAINER, 'relative z-10 text-center'].join(' ')}>
          <h1 className="mb-6 font-headline text-5xl leading-tight font-extrabold text-white md:text-7xl">
            Homestay &amp; Mini Stay <br />
            <span className="font-normal italic">Trên khắp Việt Nam</span>
          </h1>
          <p className="mx-auto mb-12 max-w-2xl text-lg text-white/90 md:text-xl">
            Website chính thức của chuỗi Cherry House — tìm cơ sở theo địa điểm, chọn chi nhánh và đặt
            trực tiếp, không qua sàn trung gian.
          </p>

          <BookingSearchBar
            variant="hero"
            onSubmit={handleSearch}
            showKind={false}
            id="home-hero-search"
          />
        </div>
      </section>

      <section id="khu-vuc-pho-bien" className="scroll-mt-28 bg-white py-16 md:py-20">
        <div className={LAYOUT_CONTAINER}>
          <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="max-w-2xl">
              <h2 className="font-headline text-2xl font-extrabold text-on-surface md:text-3xl">
                Khu vực phổ biến
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-on-surface-variant md:text-base">
                Những địa điểm lưu trú được khách Cherry House quan tâm — chọn khu vực để xem cơ sở và
                chi nhánh tương ứng.
              </p>
            </div>
            <div className="flex gap-2">
              <CarouselNavButton
                direction="prev"
                label="Cuộn khu vực sang trái"
                onClick={() => scrollCarousel(areasScrollerRef, -1)}
              />
              <CarouselNavButton
                direction="next"
                label="Cuộn khu vực sang phải"
                onClick={() => scrollCarousel(areasScrollerRef, 1)}
              />
            </div>
          </div>

          <div
            ref={areasScrollerRef}
            className="no-scrollbar flex snap-x snap-mandatory gap-4 overflow-x-auto pb-2 md:gap-5"
            tabIndex={0}
          >
            {POPULAR_AREAS.map((area) => (
              <Link
                key={area.city}
                to={areaHref(area)}
                className="group relative min-w-[200px] shrink-0 snap-start overflow-hidden rounded-2xl sm:min-w-[220px] md:min-w-[calc(20%-16px)] md:flex-1"
                style={{ aspectRatio: '3/4' }}
              >
                <img
                  src={area.image}
                  alt={area.label}
                  className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div
                  className="absolute inset-0 bg-linear-to-t from-black/75 via-black/20 to-transparent"
                  aria-hidden
                />
                {area.comingSoon ? (
                  <span className="absolute top-3 right-3 rounded-full bg-white/90 px-2.5 py-1 text-[10px] font-bold text-on-surface uppercase">
                    Sắp mở
                  </span>
                ) : null}
                <p className="absolute right-4 bottom-4 left-4 font-headline text-lg font-bold leading-snug text-white drop-shadow-sm md:text-xl">
                  {area.label}
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section id="loai-hinh-luu-tru" className="scroll-mt-28 bg-surface-container-low py-16 md:py-20">
        <div className={LAYOUT_CONTAINER}>
          <h2 className="font-headline text-2xl font-extrabold text-on-surface md:text-3xl">
            Khám phá thêm loại hình lưu trú
          </h2>
          <p className="mt-2 max-w-2xl text-sm text-on-surface-variant md:text-base">
            Cherry House vận hành nhiều loại hình trong cùng thương hiệu — chọn theo nhu cầu chuyến đi
            của bạn.
          </p>

          <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-5">
            {ACCOMMODATION_TYPE_CARDS.map((card) => {
              const label = PROPERTY_KIND_LABELS[card.kind];
              const count = kindCounts[card.kind] ?? 0;
              return (
                <Link
                  key={card.kind}
                  to={kindHref(card.kind)}
                  className="group overflow-hidden rounded-2xl border border-black/5 bg-white shadow-sm transition-shadow hover:shadow-md"
                >
                  <div className="aspect-[4/3] overflow-hidden">
                    <img
                      src={card.image}
                      alt={label}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>
                  <div className="p-4 md:p-5">
                    <h3 className="font-headline text-lg font-bold text-on-surface group-hover:text-primary">
                      {label}
                    </h3>
                    <p className="mt-1 text-sm text-on-surface-variant">
                      {count > 0 ? (
                        <>
                          <span className="font-semibold text-on-surface">{count}</span> cơ sở {label}
                        </>
                      ) : (
                        <>Sắp có thêm cơ sở {label}</>
                      )}
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      <section className="py-16 md:py-20">
        <div className={LAYOUT_CONTAINER}>
          <div className="relative mx-auto max-w-5xl overflow-hidden rounded-[2rem] bg-surface-container-high p-10 text-center md:rounded-[3rem] md:p-16">
            <div className="absolute -top-24 -right-24 size-64 rounded-full bg-primary/5 blur-3xl" aria-hidden />
            <div className="absolute -bottom-24 -left-24 size-64 rounded-full bg-primary/5 blur-3xl" aria-hidden />
            <div className="relative z-10 space-y-6">
              <h2 className="font-headline text-2xl leading-tight font-extrabold text-on-surface md:text-4xl">
                Ưu đãi khi đặt trực tiếp trên web
              </h2>
              <p className="mx-auto max-w-lg text-sm text-on-surface-variant md:text-base">
                Nhận tin mở cơ sở mới, mã giảm giá theo chi nhánh và gợi ý phòng trống theo mùa — chỉ
                dành cho khách đặt qua Cherry House.
              </p>
              <form
                className="mx-auto flex max-w-md flex-col gap-3 md:flex-row"
                onSubmit={(e) => e.preventDefault()}
              >
                <input
                  className="flex-1 rounded-full border border-outline-variant/30 bg-white px-6 py-3.5 outline-none focus:border-transparent focus:ring-2 focus:ring-primary"
                  placeholder="Email của bạn"
                  type="email"
                  name="newsletter-email"
                  autoComplete="email"
                />
                <button
                  type="submit"
                  className="rounded-full bg-primary px-8 py-3.5 font-headline text-sm font-bold tracking-widest text-on-primary uppercase shadow-lg transition-all hover:bg-primary-container"
                >
                  Đăng ký
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default HomePage;
