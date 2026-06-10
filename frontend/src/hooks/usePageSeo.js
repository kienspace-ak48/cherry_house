import { useEffect, useMemo } from 'react';
import { useSeo } from '../seo/SeoContext';

/**
 * Gắn biến SEO động cho trang (property, branch, room…).
 * @param {Record<string, string | number | null | undefined>} vars
 * @param {Array<{ name: string; path?: string }>} [breadcrumbs]
 */
export function usePageSeo(vars = {}, breadcrumbs = []) {
  const { setSeoVars, setSeoBreadcrumbs } = useSeo();
  const varsKey = useMemo(() => JSON.stringify(vars), [vars]);
  const crumbsKey = useMemo(() => JSON.stringify(breadcrumbs), [breadcrumbs]);

  useEffect(() => {
    const parsed = JSON.parse(varsKey);
    if (parsed && Object.keys(parsed).length) {
      setSeoVars(parsed);
    }
  }, [setSeoVars, varsKey]);

  useEffect(() => {
    const parsed = JSON.parse(crumbsKey);
    if (parsed?.length) {
      setSeoBreadcrumbs(parsed);
    }
  }, [setSeoBreadcrumbs, crumbsKey]);
}
