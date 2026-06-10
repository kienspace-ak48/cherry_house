import { useEffect } from 'react';
import { useSeo } from './SeoContext';

function upsertMeta(attrName, attrValue, content) {
  if (!content) return;
  let el = document.head.querySelector(`meta[${attrName}="${attrValue}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attrName, attrValue);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

function upsertLink(rel, href) {
  if (!href) return;
  let el = document.head.querySelector(`link[rel="${rel}"]`);
  if (!el) {
    el = document.createElement('link');
    el.setAttribute('rel', rel);
    document.head.appendChild(el);
  }
  el.setAttribute('href', href);
}

function upsertJsonLd(blocks) {
  document.querySelectorAll('script[data-seo-jsonld="1"]').forEach((node) => node.remove());
  blocks.forEach((block, index) => {
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.setAttribute('data-seo-jsonld', '1');
    script.setAttribute('data-seo-jsonld-index', String(index));
    script.textContent = JSON.stringify(block);
    document.head.appendChild(script);
  });
}

export default function PageSeo() {
  const {
    title,
    description,
    keywords,
    robots,
    canonical,
    ogImage,
    global,
    jsonLd,
  } = useSeo();

  const jsonLdKey = JSON.stringify(jsonLd);

  useEffect(() => {
    document.documentElement.lang = 'vi';
    document.title = title;

    upsertMeta('name', 'description', description);
    upsertMeta('name', 'robots', robots);
    upsertMeta('name', 'theme-color', global.themeColor);

    if (keywords) upsertMeta('name', 'keywords', keywords);
    else {
      document.head.querySelector('meta[name="keywords"]')?.remove();
    }

    upsertLink('canonical', canonical);

    upsertMeta('property', 'og:type', 'website');
    upsertMeta('property', 'og:site_name', global.siteName);
    upsertMeta('property', 'og:title', title);
    upsertMeta('property', 'og:description', description);
    upsertMeta('property', 'og:url', canonical);
    upsertMeta('property', 'og:locale', 'vi_VN');
    if (ogImage) upsertMeta('property', 'og:image', ogImage);

    upsertMeta('name', 'twitter:card', 'summary_large_image');
    upsertMeta('name', 'twitter:title', title);
    upsertMeta('name', 'twitter:description', description);
    if (ogImage) upsertMeta('name', 'twitter:image', ogImage);
    if (global.twitterSite) upsertMeta('name', 'twitter:site', global.twitterSite);
    else document.head.querySelector('meta[name="twitter:site"]')?.remove();

    upsertJsonLd(JSON.parse(jsonLdKey));
  }, [title, description, keywords, robots, canonical, ogImage, global.siteName, global.themeColor, global.twitterSite, jsonLdKey]);

  return null;
}
