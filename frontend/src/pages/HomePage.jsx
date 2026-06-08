import { useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import BookingSearchBar from '../components/booking/BookingSearchBar';
import { LAYOUT_CONTAINER } from '../constants/layoutContainer';
import { ACCOMMODATION_TYPE_CARDS, POPULAR_AREAS } from '../data/homeDiscovery';
import {
  PROPERTY_KIND_LABELS,
  countPropertiesByKind,
} from '../data/properties';
import { getDiscoveryHref, resolveSearchDestination } from '../lib/bookingContext';

const HERO_IMG =
  'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1920&q=80';

const HERO_QUICK_CITIES = ['Đà Lạt', 'Đà Nẵng', 'Vũng Tàu', 'Hội An', 'Phú Quốc'];

const TRUST_STATS = [
  { value: '10+', label: 'điểm đến', icon: 'map' },
  { value: 'Đặt trực tiếp', label: 'không qua sàn', icon: 'verified' },
  { value: '24/7', label: 'hỗ trợ đặt phòng', icon: 'support_agent' },
];

const WHY_ITEMS = [
  {
    icon: 'savings',
    title: 'Giá minh bạch',
    desc: 'Xem giá theo phòng, theo đêm — không phí ẩn từ sàn trung gian.',
  },
  {
    icon: 'domain',
    title: 'Nhiều chi nhánh',
    desc: 'Một cơ sở có thể có nhiều điểm — chọn đúng khu vực bạn muốn ở.',
  },
  {
    icon: 'bolt',
    title: 'Đặt nhanh',
    desc: 'Chọn địa điểm, ngày ở và phòng trống — hoàn tất trong vài bước.',
  },
];

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
      <section className="relative flex min-h-[max(620px,calc(100svh-4.25rem))] items-center justify-center md:min-h-[max(760px,calc(100svh-4.75rem))]">
        <div className="absolute inset-0 z-0 overflow-hidden">
          <img
            className="h-full w-full scale-105 object-cover animate-hero-zoom"
            alt="Cherry House — homestay và mini stay trên khắp Việt Nam"
            src={HERO_IMG}
          />
          <div className="hero-home-gradient absolute inset-0" aria-hidden />
          <div className="hero-home-glow absolute inset-0" aria-hidden />
        </div>

        <div className={[LAYOUT_CONTAINER, 'relative z-10 w-full py-12 text-center md:py-16'].join(' ')}>
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-4 py-1.5 text-xs font-bold tracking-wide text-white/95 uppercase backdrop-blur-sm">
            <span className="material-symbols-outlined text-base text-primary-container">favorite</span>
            Website chính thức Cherry House
          </div>

          <h1 className="mx-auto mb-5 max-w-4xl font-headline text-4xl leading-[1.1] font-extrabold text-white sm:text-5xl md:text-7xl">
            Trải nghiệm lưu trú
            <span className="mt-2 block font-normal italic text-white/95">ấm áp trên khắp Việt Nam</span>
          </h1>

          <p className="mx-auto mb-8 max-w-2xl text-base leading-relaxed text-white/88 md:text-lg">
            Homestay, mini stay và villa đồng bộ thương hiệu — tìm theo địa điểm, chọn chi nhánh phù hợp
            và đặt phòng trực tiếp.
          </p>

          <div className="relative z-20">
            <BookingSearchBar
              variant="hero"
              onSubmit={handleSearch}
              showKind={false}
              id="home-hero-search"
            />
          </div>

          <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
            <span className="text-xs font-semibold text-white/70">Phổ biến:</span>
            {HERO_QUICK_CITIES.map((city) => (
              <Link
                key={city}
                to={getDiscoveryHref({ city })}
                className="rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold text-white backdrop-blur-sm transition-colors hover:border-white/40 hover:bg-white/20"
              >
                {city}
              </Link>
            ))}
          </div>

          <div className="relative z-0 mx-auto mt-10 grid max-w-3xl grid-cols-1 gap-3 sm:grid-cols-3">
            {TRUST_STATS.map((item) => (
              <div
                key={item.label}
                className="flex items-center justify-center gap-2 rounded-2xl border border-white/15 bg-black/20 px-4 py-3 backdrop-blur-sm"
              >
                <span className="material-symbols-outlined text-xl text-primary-container">{item.icon}</span>
                <div className="text-left">
                  <p className="font-headline text-sm font-bold text-white">{item.value}</p>
                  <p className="text-[11px] text-white/75">{item.label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-b border-black/5 bg-white py-12 md:py-14">
        <div className={LAYOUT_CONTAINER}>
          <div className="mb-8 text-center">
            <h2 className="font-headline text-2xl font-extrabold text-on-surface md:text-3xl">
              Vì sao đặt trên Cherry House?
            </h2>
            <p className="mx-auto mt-2 max-w-xl text-sm text-on-surface-variant md:text-base">
              Trải nghiệm đặt phòng được thiết kế cho khách Việt — rõ ràng, nhanh và đúng thương hiệu.
            </p>
          </div>
          <div className="grid gap-5 md:grid-cols-3">
            {WHY_ITEMS.map((item) => (
              <div
                key={item.title}
                className="home-feature-card rounded-2xl border border-black/5 bg-surface-container-low p-6 text-center md:text-left"
              >
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary md:mx-0">
                  <span className="material-symbols-outlined text-2xl">{item.icon}</span>
                </div>
                <h3 className="font-headline text-lg font-bold text-on-surface">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-on-surface-variant">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="khu-vuc-pho-bien" className="scroll-mt-28 bg-white py-16 md:py-20">
        <div className={LAYOUT_CONTAINER}>
          <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="max-w-2xl">
              <p className="text-xs font-bold tracking-widest text-primary uppercase">Khám phá</p>
              <h2 className="mt-1 font-headline text-2xl font-extrabold text-on-surface md:text-3xl">
                Khu vực phổ biến
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-on-surface-variant md:text-base">
                Chọn điểm đến — xem cơ sở Cherry House và chi nhánh tương ứng.
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
                className="group relative min-w-[200px] shrink-0 snap-start overflow-hidden rounded-2xl shadow-md transition-shadow hover:shadow-xl sm:min-w-[220px] md:min-w-[calc(20%-16px)] md:flex-1"
                style={{ aspectRatio: '3/4' }}
              >
                <img
                  src={area.image}
                  alt={area.label}
                  className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div
                  className="absolute inset-0 bg-linear-to-t from-black/80 via-black/25 to-transparent"
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
          <p className="text-xs font-bold tracking-widest text-primary uppercase">Loại hình</p>
          <h2 className="mt-1 font-headline text-2xl font-extrabold text-on-surface md:text-3xl">
            Khám phá thêm loại hình lưu trú
          </h2>
          <p className="mt-2 max-w-2xl text-sm text-on-surface-variant md:text-base">
            Homestay ấm cúng, mini hotel tiện nghi hay villa riêng tư — cùng một hành trình đặt phòng.
          </p>

          <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-5">
            {ACCOMMODATION_TYPE_CARDS.map((card) => {
              const label = PROPERTY_KIND_LABELS[card.kind];
              const count = kindCounts[card.kind] ?? 0;
              return (
                <Link
                  key={card.kind}
                  to={kindHref(card.kind)}
                  className="group overflow-hidden rounded-2xl border border-black/5 bg-white shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-lg"
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
          <div className="relative mx-auto max-w-5xl overflow-hidden rounded-[2rem] bg-linear-to-br from-primary/8 via-white to-surface-container-high p-10 text-center md:rounded-[3rem] md:p-16">
            <div className="absolute -top-24 -right-24 size-64 rounded-full bg-primary/10 blur-3xl" aria-hidden />
            <div className="absolute -bottom-24 -left-24 size-64 rounded-full bg-primary/10 blur-3xl" aria-hidden />
            <div className="relative z-10 space-y-6">
              <h2 className="font-headline text-2xl leading-tight font-extrabold text-on-surface md:text-4xl">
                Ưu đãi khi đặt trực tiếp trên web
              </h2>
              <p className="mx-auto max-w-lg text-sm text-on-surface-variant md:text-base">
                Nhận tin mở cơ sở mới, mã giảm giá theo chi nhánh và gợi ý phòng trống theo mùa.
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
