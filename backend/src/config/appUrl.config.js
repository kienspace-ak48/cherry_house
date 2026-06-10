/** URL React app — redirect OAuth / thanh toán (Vite dev thường :5173) */
function getClientAppUrl() {
  return String(process.env.CLIENT_APP_URL || 'http://localhost:5173').replace(/\/$/, '');
}

/**
 * URL public cho SEO: canonical, sitemap, Open Graph.
 * - Production: CLIENT_APP_URL hoặc PUBLIC_SITE_URL (vd. https://kienvu.io.vn)
 * - Local build (Express serve client): http://localhost:8080 — không dùng :5173
 * - :5173 chỉ là Vite dev, không phải URL chính thức của site
 */
function getPublicSiteUrl(req) {
  const fromPublicEnv = String(process.env.PUBLIC_SITE_URL || '').trim().replace(/\/$/, '');
  if (fromPublicEnv) return fromPublicEnv;

  const clientUrl = getClientAppUrl();
  if (clientUrl && !/:5173(\/|$)/.test(clientUrl)) {
    return clientUrl;
  }

  if (req) {
    const forwardedHost = String(req.get('x-forwarded-host') || '').trim();
    const forwardedProto = String(req.get('x-forwarded-proto') || 'https').trim();
    if (forwardedHost) {
      return `${forwardedProto}://${forwardedHost}`.replace(/\/$/, '');
    }
    const host = String(req.get('host') || '').trim();
    if (host && !host.includes('5173')) {
      const proto = req.protocol === 'https' ? 'https' : 'http';
      return `${proto}://${host}`.replace(/\/$/, '');
    }
  }

  const port = process.env.HTTP_PORT || 8080;
  return `http://localhost:${port}`;
}

/**
 * Base URL public cho IPN/webhook (ngrok hoặc API server).
 * Ưu tiên CHECKOUT_PUBLIC_URL → SEPAY_PG_TEST_BASE_URL → localhost backend.
 */
function getCheckoutPublicBaseUrl(req) {
  const fromEnv =
    String(process.env.CHECKOUT_PUBLIC_URL || '').trim()
    || String(process.env.SEPAY_PG_TEST_BASE_URL || '').trim();
  if (fromEnv) return fromEnv.replace(/\/$/, '');

  if (req) {
    const forwardedHost = String(req.get('x-forwarded-host') || '').trim();
    const forwardedProto = String(req.get('x-forwarded-proto') || 'https').trim();
    if (forwardedHost) {
      return `${forwardedProto}://${forwardedHost}`.replace(/\/$/, '');
    }
    const host = String(req.get('host') || '').trim();
    if (host) {
      const proto = req.protocol === 'https' ? 'https' : 'http';
      return `${proto}://${host}`.replace(/\/$/, '');
    }
  }

  const port = process.env.HTTP_PORT || 8080;
  return `http://localhost:${port}`;
}

function buildCheckoutResultUrl(bookingCode, extra = {}) {
  const params = new URLSearchParams({ bookingCode, ...extra });
  return `${getClientAppUrl()}/checkout/result?${params.toString()}`;
}

module.exports = {
  getClientAppUrl,
  getPublicSiteUrl,
  getCheckoutPublicBaseUrl,
  buildCheckoutResultUrl,
};
