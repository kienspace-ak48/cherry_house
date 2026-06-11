function resolveTemplate(template, vars = {}) {
  const base = typeof template === 'string' ? template : '';
  if (!base) return '';

  return base
    .replace(/\{\{\s*([a-zA-Z0-9_]+)\s*\}\}/g, (_match, key) => {
      const value = vars[key];
      if (value === null || value === undefined) return '';
      return String(value).trim();
    })
    .replace(/\s{2,}/g, ' ')
    .trim();
}

function buildCanonicalUrl(path, siteUrl = '') {
  const base = String(siteUrl || '').replace(/\/$/, '');
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  if (!base) return normalizedPath;
  return `${base}${normalizedPath}`;
}

function toAbsoluteUrl(url, siteUrl = '') {
  const raw = String(url || '').trim();
  if (!raw) return '';
  if (/^https?:\/\//i.test(raw)) return raw;
  const base = String(siteUrl || '').replace(/\/$/, '');
  if (!base) return raw;
  return `${base}${raw.startsWith('/') ? raw : `/${raw}`}`;
}

function escapeHtmlAttr(value) {
  return String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;');
}

module.exports = {
  resolveTemplate,
  buildCanonicalUrl,
  toAbsoluteUrl,
  escapeHtmlAttr,
};
