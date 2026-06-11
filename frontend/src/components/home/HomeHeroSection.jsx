import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import BookingSearchBar from '../booking/BookingSearchBar';
import { LAYOUT_CONTAINER } from '../../constants/layoutContainer';
import { getDiscoveryHref } from '../../lib/bookingContext';
import { resolveMediaUrl } from '../../lib/resolveMediaUrl';

const TRUST_STATS = [
  { value: '10+', label: 'điểm đến', icon: 'map' },
  { value: 'Đặt trực tiếp', label: 'không qua sàn', icon: 'verified' },
  { value: '24/7', label: 'hỗ trợ đặt phòng', icon: 'support_agent' },
];

/**
 * @param {{
 *   slides: import('../../types/homeHero').HomeHeroSlide[];
 *   quickCities: string[];
 *   intervalSec?: number;
 *   onSearch: (ctx: unknown) => void;
 * }} props
 */
function HomeHeroSection({ slides, quickCities, intervalSec = 6, onSearch }) {
  const safeSlides = slides?.length ? slides : [];
  const [activeIndex, setActiveIndex] = useState(0);
  const copyStackRef = useRef(null);
  const [copyStackHeight, setCopyStackHeight] = useState(null);

  const goToSlide = useCallback((index) => {
    if (!safeSlides.length) return;
    setActiveIndex(((index % safeSlides.length) + safeSlides.length) % safeSlides.length);
  }, [safeSlides.length]);

  useEffect(() => {
    setActiveIndex(0);
  }, [slides]);

  useEffect(() => {
    if (safeSlides.length <= 1) return undefined;

    const ms = Math.min(30, Math.max(3, intervalSec || 6)) * 1000;
    const timer = window.setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % safeSlides.length);
    }, ms);

    return () => window.clearInterval(timer);
  }, [safeSlides.length, intervalSec]);

  useEffect(() => {
    safeSlides.forEach((slide) => {
      const url = resolveMediaUrl(slide?.imageUrl);
      if (!url) return;
      const img = new Image();
      img.src = url;
    });
  }, [safeSlides]);

  useLayoutEffect(() => {
    const stack = copyStackRef.current;
    if (!stack) return undefined;

    const measure = () => {
      const panels = stack.querySelectorAll('[data-hero-copy-panel]');
      let max = 0;
      panels.forEach((panel) => {
        max = Math.max(max, panel.scrollHeight);
      });
      setCopyStackHeight(max > 0 ? max : null);
    };

    measure();

    const observer = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(measure) : null;
    stack.querySelectorAll('[data-hero-copy-panel]').forEach((panel) => observer?.observe(panel));
    window.addEventListener('resize', measure);

    return () => {
      observer?.disconnect();
      window.removeEventListener('resize', measure);
    };
  }, [safeSlides]);

  if (!safeSlides.length) return null;

  return (
    <section className="relative flex min-h-[max(620px,calc(100svh-4.25rem))] items-center justify-center md:min-h-[max(760px,calc(100svh-4.75rem))]">
      <div className="absolute inset-0 z-0 overflow-hidden" aria-hidden>
        {safeSlides.map((slide, index) => {
          const isActive = index === activeIndex;
          return (
            <div
              key={`${slide.imageUrl}-${index}`}
              className={[
                'absolute inset-0 transition-opacity duration-[1400ms] ease-in-out',
                isActive ? 'z-[2] opacity-100' : 'z-[1] opacity-0',
              ].join(' ')}
            >
              {slide.imageUrl ? (
                <img
                  className={[
                    'h-full w-full object-cover',
                    isActive ? 'scale-105 animate-hero-zoom' : 'scale-105',
                  ].join(' ')}
                  alt={slide.alt || ''}
                  src={resolveMediaUrl(slide.imageUrl)}
                  loading="eager"
                  decoding="async"
                  fetchPriority={index === 0 ? 'high' : 'low'}
                />
              ) : null}
            </div>
          );
        })}
        <div className="hero-home-gradient absolute inset-0" />
        <div className="hero-home-glow absolute inset-0" />
      </div>

      <div className={[LAYOUT_CONTAINER, 'relative z-10 w-full py-12 text-center md:py-16'].join(' ')}>
        <div
          ref={copyStackRef}
          className="hero-slide-copy-stack relative mx-auto w-full max-w-4xl min-h-[12rem] sm:min-h-[14rem] md:min-h-[18rem]"
          style={copyStackHeight ? { minHeight: `${copyStackHeight}px` } : undefined}
          aria-live="polite"
        >
          {safeSlides.map((slide, index) => {
            const isActive = index === activeIndex;
            return (
              <div
                key={`hero-copy-${index}`}
                data-hero-copy-panel
                className={[
                  'absolute inset-x-0 top-0 flex flex-col items-center text-center transition-opacity duration-700 ease-in-out',
                  isActive ? 'z-[1] opacity-100' : 'z-0 opacity-0 pointer-events-none',
                ].join(' ')}
                aria-hidden={!isActive}
              >
                {slide.badge ? (
                  <div className="mb-5 inline-flex min-h-[2rem] items-center gap-2 rounded-full border border-white/25 bg-white/10 px-4 py-1.5 text-xs font-bold tracking-wide text-white/95 uppercase backdrop-blur-sm">
                    <span className="material-symbols-outlined text-base text-primary-container">favorite</span>
                    {slide.badge}
                  </div>
                ) : (
                  <div className="mb-5 min-h-[2rem]" aria-hidden />
                )}

                <h1 className="mx-auto mb-5 max-w-4xl font-headline text-4xl leading-[1.1] font-extrabold text-white sm:text-5xl md:text-7xl">
                  {slide.titleLine1}
                  {slide.titleLine2 ? (
                    <span className="mt-2 block font-normal italic text-white/95">{slide.titleLine2}</span>
                  ) : null}
                </h1>

                {slide.description ? (
                  <p className="mx-auto max-w-2xl text-base leading-relaxed text-white/88 md:text-lg">
                    {slide.description}
                  </p>
                ) : (
                  <p className="mx-auto max-w-2xl text-base leading-relaxed text-transparent md:text-lg" aria-hidden>
                    &nbsp;
                  </p>
                )}
              </div>
            );
          })}
        </div>

        {safeSlides.length > 1 ? (
          <div
            className="mb-8 flex items-center justify-center gap-2"
            role="tablist"
            aria-label="Chọn slide banner"
          >
            {safeSlides.map((slide, index) => {
              const isActive = index === activeIndex;
              return (
                <button
                  key={`dot-${slide.imageUrl}-${index}`}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  aria-label={`Slide ${index + 1}`}
                  onClick={() => goToSlide(index)}
                  className={[
                    'rounded-full transition-all duration-300',
                    isActive
                      ? 'h-2.5 w-8 bg-white shadow-md'
                      : 'h-2.5 w-2.5 bg-white/45 hover:bg-white/70',
                  ].join(' ')}
                />
              );
            })}
          </div>
        ) : (
          <div className="mb-8" />
        )}

        <div className="relative z-20">
          <BookingSearchBar
            variant="hero"
            onSubmit={onSearch}
            showKind={false}
            id="home-hero-search"
          />
        </div>

        <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
          <span className="text-xs font-semibold text-white/70">Phổ biến:</span>
          {quickCities.map((city) => (
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
  );
}

export default HomeHeroSection;
