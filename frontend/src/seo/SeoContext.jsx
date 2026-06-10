import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { fetchSeoConfig } from '../api/seoApi';
import { buildJsonLdBlocks } from './buildJsonLd';
import { resolvePageKeyFromPath } from './routePageKey';
import { buildCanonicalUrl, resolveTemplate, toAbsoluteUrl } from './resolveTemplate';

/** @type {import('./types').SeoPublicConfig | null} */
const FALLBACK_CONFIG = {
  global: {
    siteName: 'Cherry House',
    siteUrl: '',
    defaultTitle: 'Cherry House — Đặt homestay & mini stay Việt Nam',
    defaultDescription:
      'Homestay, mini stay và villa đồng bộ thương hiệu Cherry House. Tìm theo địa điểm, chọn chi nhánh và đặt phòng trực tuyến.',
    defaultKeywords: 'cherry house, homestay việt nam, đặt phòng online',
    ogImageUrl: '/favicon.svg',
    twitterSite: '',
    themeColor: '#9f1239',
    organization: {
      name: 'Cherry House',
      description: 'Hệ thống homestay và mini stay trên khắp Việt Nam.',
      phone: '',
      email: '',
      address: 'Việt Nam',
    },
    allowIndexing: true,
  },
  pages: [],
};

const SeoRuntimeContext = createContext(null);

export function SeoProvider({ children }) {
  const location = useLocation();
  const [config, setConfig] = useState(FALLBACK_CONFIG);
  const [vars, setVars] = useState({});
  const [breadcrumbs, setBreadcrumbs] = useState([]);

  useEffect(() => {
    let cancelled = false;
    fetchSeoConfig()
      .then((data) => {
        if (!cancelled && data) setConfig(data);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    setVars({});
    setBreadcrumbs([]);
  }, [location.pathname]);

  const setSeoVars = useCallback((patch) => {
    setVars((prev) => ({ ...prev, ...patch }));
  }, []);

  const setSeoBreadcrumbs = useCallback((items) => {
    setBreadcrumbs(Array.isArray(items) ? items : []);
  }, []);

  const resolved = useMemo(() => {
    const global = config?.global || FALLBACK_CONFIG.global;
    const pageKey = resolvePageKeyFromPath(location.pathname);
    const pageTemplate = config?.pages?.find((p) => p.pageKey === pageKey && p.isActive) || null;

    const mergedVars = {
      siteName: global.siteName,
      ...vars,
    };

    const title = pageTemplate
      ? resolveTemplate(pageTemplate.titleTemplate, mergedVars)
      : global.defaultTitle;
    const description = pageTemplate
      ? resolveTemplate(pageTemplate.descriptionTemplate, mergedVars)
      : global.defaultDescription;
    const keywords = pageTemplate?.keywordsTemplate
      ? resolveTemplate(pageTemplate.keywordsTemplate, mergedVars)
      : global.defaultKeywords;
    const robots = pageTemplate?.robots || (global.allowIndexing ? 'index, follow' : 'noindex, nofollow');

    const siteBase = global.siteUrl
      || (typeof window !== 'undefined' && !window.location.port.includes('5173')
        ? window.location.origin
        : 'http://localhost:8080');

    const canonical = buildCanonicalUrl(location.pathname, siteBase);

    const ogImage = toAbsoluteUrl(
      pageTemplate?.ogImageUrl || global.ogImageUrl || '/favicon/android-chrome-512x512.png',
      siteBase,
    );

    const jsonLd = buildJsonLdBlocks({
      pageKey,
      global,
      vars: mergedVars,
      canonical,
      breadcrumbs,
    });

    return {
      pageKey,
      title: title || global.defaultTitle,
      description: description || global.defaultDescription,
      keywords,
      robots,
      canonical,
      ogImage,
      global,
      jsonLd,
    };
  }, [config, location.pathname, location.search, vars, breadcrumbs]);

  const value = useMemo(
    () => ({
      ...resolved,
      setSeoVars,
      setSeoBreadcrumbs,
    }),
    [resolved, setSeoVars, setSeoBreadcrumbs],
  );

  return (
    <SeoRuntimeContext.Provider value={value}>
      {children}
    </SeoRuntimeContext.Provider>
  );
}

export function useSeo() {
  const ctx = useContext(SeoRuntimeContext);
  if (!ctx) {
    throw new Error('useSeo must be used within SeoProvider');
  }
  return ctx;
}
