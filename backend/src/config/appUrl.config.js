/** URL React app — redirect sau thanh toán */
function getClientAppUrl() {
  return String(process.env.CLIENT_APP_URL || 'http://localhost:5173').replace(/\/$/, '');
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
  getCheckoutPublicBaseUrl,
  buildCheckoutResultUrl,
};
