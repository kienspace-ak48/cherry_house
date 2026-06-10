/**
 * Thay {{key}} trong mẫu SEO bằng giá trị thực.
 * @param {string | null | undefined} template
 * @param {Record<string, string | number | null | undefined>} vars
 */
export function resolveTemplate(template, vars = {}) {
  const base = typeof template === 'string' ? template : '';
  if (!base) return '';

  return base.replace(/\{\{\s*([a-zA-Z0-9_]+)\s*\}\}/g, (_match, key) => {
    const value = vars[key];
    if (value === null || value === undefined) return '';
    return String(value).trim();
  }).replace(/\s{2,}/g, ' ').trim();
}

/**
 * @param {string} path
 * @param {string} [siteUrl]
 */
export function buildCanonicalUrl(path, siteUrl = '') {
  const base = String(siteUrl || '').replace(/\/$/, '');
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  if (!base) return normalizedPath;
  return `${base}${normalizedPath}`;
}

/**
 * @param {string} url
 */
export function toAbsoluteUrl(url, siteUrl = '') {
  const raw = String(url || '').trim();
  if (!raw) return '';
  if (/^https?:\/\//i.test(raw)) return raw;
  const base = String(siteUrl || '').replace(/\/$/, '');
  if (!base) return raw;
  return `${base}${raw.startsWith('/') ? raw : `/${raw}`}`;
}
