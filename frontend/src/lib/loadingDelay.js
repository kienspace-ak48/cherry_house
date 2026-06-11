/** Delay tối thiểu overlay khi đổi trang (pathname) — không áp dụng cho /booking query steps */
export const MIN_ROUTE_TRANSITION_MS = 480;

export function getRouteTransitionMinMs() {
  if (typeof window === 'undefined') return 0;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return 0;
  return MIN_ROUTE_TRANSITION_MS;
}

export function awaitMinDelay(startedAt, minMs = getRouteTransitionMinMs()) {
  const remaining = minMs - (Date.now() - startedAt);
  if (remaining <= 0) return Promise.resolve();
  return new Promise((resolve) => {
    window.setTimeout(resolve, remaining);
  });
}
