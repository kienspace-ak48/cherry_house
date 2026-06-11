import { useCallback, useEffect, useRef, useState } from 'react';
import { LAYOUT_CONTAINER } from '../../constants/layoutContainer';

const AUTO_INTERVAL_SEC = 5;
const PAUSE_AFTER_INTERACTION_MS = 8000;

function StarRating({ rating }) {
  const stars = Math.min(5, Math.max(1, Number(rating) || 5));
  return (
    <div className="flex gap-0.5" aria-label={`${stars} sao`}>
      {Array.from({ length: 5 }, (_, i) => (
        <span
          key={i}
          className={`text-sm ${i < stars ? 'text-amber-400' : 'text-black/15'}`}
          aria-hidden
        >
          ★
        </span>
      ))}
    </div>
  );
}

/**
 * @param {{
 *   eyebrow: string;
 *   title: string;
 *   items: import('../../types/homePage').HomeReviewItem[];
 * }} props
 */
function HomeReviewsSection({ eyebrow, title, items }) {
  const scrollerRef = useRef(null);
  const cardRefs = useRef([]);
  const pausedRef = useRef(false);
  const resumeTimerRef = useRef(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [reduceMotion, setReduceMotion] = useState(false);

  const scrollToIndex = useCallback((index, behavior = 'smooth') => {
    const scroller = scrollerRef.current;
    const card = cardRefs.current[index];
    if (!scroller || !card) return;

    const left = card.getBoundingClientRect().left - scroller.getBoundingClientRect().left + scroller.scrollLeft;
    scroller.scrollTo({ left, behavior });
  }, []);

  const pauseAuto = useCallback((resumeAfterMs = PAUSE_AFTER_INTERACTION_MS) => {
    pausedRef.current = true;
    if (resumeTimerRef.current) window.clearTimeout(resumeTimerRef.current);
    resumeTimerRef.current = window.setTimeout(() => {
      pausedRef.current = false;
    }, resumeAfterMs);
  }, []);

  useEffect(() => {
    cardRefs.current = cardRefs.current.slice(0, items.length);
    setActiveIndex(0);
    scrollerRef.current?.scrollTo({ left: 0, behavior: 'auto' });
  }, [items]);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setReduceMotion(mq.matches);
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, []);

  useEffect(() => {
    const scroller = scrollerRef.current;
    if (!scroller || items.length <= 1) return undefined;

    const observer = new IntersectionObserver(
      (entries) => {
        let best = { index: -1, ratio: 0 };
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const index = Number(entry.target.getAttribute('data-review-index'));
          if (Number.isNaN(index)) return;
          if (entry.intersectionRatio > best.ratio) {
            best = { index, ratio: entry.intersectionRatio };
          }
        });
        if (best.index >= 0) setActiveIndex(best.index);
      },
      { root: scroller, threshold: [0.55, 0.75, 0.9] },
    );

    cardRefs.current.forEach((card) => {
      if (card) observer.observe(card);
    });

    return () => observer.disconnect();
  }, [items]);

  useEffect(() => {
    if (items.length <= 1 || reduceMotion) return undefined;

    const ms = AUTO_INTERVAL_SEC * 1000;
    const timer = window.setInterval(() => {
      if (pausedRef.current) return;
      setActiveIndex((prev) => {
        const next = (prev + 1) % items.length;
        scrollToIndex(next);
        return next;
      });
    }, ms);

    return () => window.clearInterval(timer);
  }, [items.length, reduceMotion, scrollToIndex]);

  useEffect(
    () => () => {
      if (resumeTimerRef.current) window.clearTimeout(resumeTimerRef.current);
    },
    [],
  );

  if (!items?.length) return null;

  const canAutoPlay = items.length > 1 && !reduceMotion;

  return (
    <section id="danh-gia-khach" className="scroll-mt-28 bg-[#fdf8f1] py-14 md:py-20">
      <div className={LAYOUT_CONTAINER}>
        <div className="mb-10 max-w-3xl">
          <p className="text-xs font-bold tracking-[0.2em] text-primary uppercase">{eyebrow}</p>
          <h2 className="mt-2 font-headline text-2xl font-extrabold leading-tight text-on-surface md:text-4xl">
            {title}
          </h2>
        </div>

        <div
          className="relative"
          onMouseEnter={() => {
            if (canAutoPlay) pausedRef.current = true;
          }}
          onMouseLeave={() => {
            if (canAutoPlay) pausedRef.current = false;
          }}
        >
          <div
            ref={scrollerRef}
            className="no-scrollbar -mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth px-4 pb-2 sm:-mx-6 sm:gap-5 sm:px-6 lg:-mx-8 lg:px-8 xl:-mx-12 xl:px-12"
            aria-label="Đánh giá khách — cuộn ngang"
            onPointerDown={() => pauseAuto()}
            onWheel={() => pauseAuto()}
            onTouchStart={() => pauseAuto()}
          >
            {items.map((item, index) => (
              <article
                key={`${item.name}-${index}`}
                ref={(el) => {
                  cardRefs.current[index] = el;
                }}
                data-review-index={index}
                data-review-card
                className="flex w-[min(88vw,22rem)] shrink-0 snap-start flex-col rounded-2xl border border-black/5 bg-white p-6 shadow-sm sm:w-80 md:p-7"
              >
                <StarRating rating={item.rating} />
                <blockquote className="mt-4 flex-1 text-sm leading-relaxed text-on-surface md:text-[15px]">
                  &ldquo;{item.quote}&rdquo;
                </blockquote>
                <footer className="mt-6 flex items-center gap-3 border-t border-black/5 pt-5">
                  <span
                    className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/10 font-headline text-xs font-bold text-primary"
                    aria-hidden
                  >
                    {item.initials || item.name?.slice(0, 2)?.toUpperCase()}
                  </span>
                  <div className="min-w-0">
                    <p className="font-headline text-sm font-bold text-on-surface">{item.name}</p>
                    {item.meta ? (
                      <p className="mt-0.5 text-xs text-on-surface-variant">{item.meta}</p>
                    ) : null}
                  </div>
                </footer>
              </article>
            ))}
          </div>

          {items.length > 1 ? (
            <div
              className="mt-5 flex items-center justify-center gap-2"
              role="tablist"
              aria-label="Chọn đánh giá"
            >
              {items.map((item, index) => {
                const isActive = index === activeIndex;
                return (
                  <button
                    key={`review-dot-${item.name}-${index}`}
                    type="button"
                    role="tab"
                    aria-selected={isActive}
                    aria-label={`Đánh giá ${index + 1}`}
                    onClick={() => {
                      pauseAuto();
                      setActiveIndex(index);
                      scrollToIndex(index);
                    }}
                    className={[
                      'rounded-full transition-all duration-300',
                      isActive
                        ? 'h-2.5 w-8 bg-primary shadow-sm'
                        : 'h-2.5 w-2.5 bg-primary/25 hover:bg-primary/40',
                    ].join(' ')}
                  />
                );
              })}
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}

export default HomeReviewsSection;
