import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

function getScrollBehavior() {
  if (typeof window === 'undefined') return 'auto';
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth';
}

export default function ScrollToTop() {
  const { pathname, search, hash } = useLocation();

  useEffect(() => {
    const scrollBehavior = getScrollBehavior();
    if (hash) {
      const id = decodeURIComponent(hash.slice(1));
      let cancelled = false;

      function scrollToHashTarget() {
        if (cancelled) return true;
        const target = document.getElementById(id);
        if (target) {
          target.scrollIntoView({ block: 'start', behavior: scrollBehavior });
          return true;
        }
        return false;
      }

      if (!scrollToHashTarget()) {
        requestAnimationFrame(() => {
          scrollToHashTarget();
        });
      }
      return () => {
        cancelled = true;
      };
    }

    window.scrollTo({ top: 0, left: 0, behavior: scrollBehavior });
    return undefined;
  }, [pathname, search, hash]);

  return null;
}
