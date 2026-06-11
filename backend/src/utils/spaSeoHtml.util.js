const { escapeHtmlAttr } = require('./seoTemplate.util');

function ogImageMime(url) {
  const path = String(url || '').split('?')[0].toLowerCase();
  if (path.endsWith('.png')) return 'image/png';
  if (path.endsWith('.jpg') || path.endsWith('.jpeg')) return 'image/jpeg';
  if (path.endsWith('.gif')) return 'image/gif';
  if (path.endsWith('.webp')) return 'image/webp';
  return 'image/png';
}

/** Map meta SEO → giá trị thay cho placeholder trong index.html. */
function buildPlaceholderMap(meta) {
  const title = escapeHtmlAttr(meta.title);
  const description = escapeHtmlAttr(meta.description);
  const ogImage = escapeHtmlAttr(meta.ogImage);

  return {
    __TITLE__: title,
    __DESCRIPTION__: description,
    __KEYWORDS__: escapeHtmlAttr(meta.keywords || ''),
    __ROBOTS__: escapeHtmlAttr(meta.robots || 'index, follow'),
    __CANONICAL__: escapeHtmlAttr(meta.canonical),
    __OG_IMAGE__: ogImage,
    __OG_IMAGE_SECURE__: ogImage,
    __OG_IMAGE_TYPE__: ogImageMime(meta.ogImage),
    __SITE_NAME__: escapeHtmlAttr(meta.siteName || 'Cherry House'),
    __TWITTER_SITE__: escapeHtmlAttr(meta.twitterSite || ''),
  };
}

/** Thay __TITLE__, __OG_IMAGE__, … trong template index.html (crawler / first paint). */
function applySeoPlaceholders(html, meta) {
  if (!html || !meta) return html;

  const map = buildPlaceholderMap(meta);
  let output = html;

  Object.entries(map).forEach(([token, value]) => {
    output = output.split(token).join(value);
  });

  return output;
}

/** @deprecated alias — dùng applySeoPlaceholders */
const injectSpaSeoIntoHtml = applySeoPlaceholders;

module.exports = {
  applySeoPlaceholders,
  injectSpaSeoIntoHtml,
  buildPlaceholderMap,
};
