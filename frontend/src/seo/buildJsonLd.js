import { buildCanonicalUrl, toAbsoluteUrl } from './resolveTemplate';

/**
 * @param {{
 *   pageKey: string | null;
 *   global: import('./types').SeoGlobalConfig;
 *   vars: Record<string, string>;
 *   canonical: string;
 *   breadcrumbs?: Array<{ name: string; path?: string }>;
 * }} input
 */
export function buildJsonLdBlocks(input) {
  const { pageKey, global, vars, canonical, breadcrumbs = [] } = input;
  const blocks = [];
  const org = global.organization || {};
  const siteUrl = global.siteUrl || '';

  const organization = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: org.name || global.siteName,
    description: org.description || global.defaultDescription,
    url: siteUrl || canonical,
    ...(org.email ? { email: org.email } : {}),
    ...(org.phone ? { telephone: org.phone } : {}),
    ...(org.address ? { address: org.address } : {}),
    ...(global.ogImageUrl ? { logo: toAbsoluteUrl(global.ogImageUrl, siteUrl) } : {}),
  };
  blocks.push(organization);

  if (pageKey === 'home') {
    blocks.push({
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: global.siteName,
      url: siteUrl || canonical,
      description: global.defaultDescription,
      potentialAction: {
        '@type': 'SearchAction',
        target: `${siteUrl || ''}/properties?q={search_term_string}`,
        'query-input': 'required name=search_term_string',
      },
    });
  }

  if (breadcrumbs.length > 1) {
    blocks.push({
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: breadcrumbs.map((item, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        name: item.name,
        ...(item.path ? { item: buildCanonicalUrl(item.path, siteUrl) } : {}),
      })),
    });
  }

  if (['property', 'branch', 'branch_select'].includes(pageKey || '')) {
    blocks.push({
      '@context': 'https://schema.org',
      '@type': 'LodgingBusiness',
      name: vars.branchName || vars.propertyName || global.siteName,
      description: vars.tagline || global.defaultDescription,
      url: canonical,
      ...(vars.city ? { address: { '@type': 'PostalAddress', addressLocality: vars.city, addressCountry: 'VN' } } : {}),
      ...(global.ogImageUrl ? { image: toAbsoluteUrl(global.ogImageUrl, siteUrl) } : {}),
    });
  }

  if (pageKey === 'room' && vars.roomName) {
    blocks.push({
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: vars.roomName,
      description: vars.roomDescription || global.defaultDescription,
      sku: vars.roomCode || undefined,
      offers: vars.price
        ? {
            '@type': 'Offer',
            priceCurrency: 'VND',
            price: String(vars.price).replace(/[^\d]/g, '') || undefined,
            availability: 'https://schema.org/InStock',
            url: canonical,
          }
        : undefined,
    });
  }

  return blocks.filter(Boolean);
}
