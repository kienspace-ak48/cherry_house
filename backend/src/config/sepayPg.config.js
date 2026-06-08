const { SePayPgClient } = require('sepay-pg-node');

function getSepayPgEnv() {
  const raw = String(process.env.SEPAY_PG_ENV || 'sandbox').trim().toLowerCase();
  return raw === 'production' ? 'production' : 'sandbox';
}

function getSepayPgCredentials() {
  const merchantId = String(process.env.SEPAY_PG_MERCHANT_ID || '').trim();
  const secretKey = String(process.env.SEPAY_PG_SECRET_KEY || '').trim();
  if (!merchantId || !secretKey) {
    throw new Error('Thiếu SEPAY_PG_MERCHANT_ID hoặc SEPAY_PG_SECRET_KEY trong .env');
  }
  return { merchantId, secretKey };
}

function createSepayPgClient() {
  const { merchantId, secretKey } = getSepayPgCredentials();
  return new SePayPgClient({
    env: getSepayPgEnv(),
    merchant_id: merchantId,
    secret_key: secretKey,
  });
}

/** Base URL mặc định — localhost backend */
function getSepayPgTestBaseUrl() {
  const fromEnv = String(process.env.SEPAY_PG_TEST_BASE_URL || '').trim();
  if (fromEnv) return fromEnv.replace(/\/$/, '');
  const port = process.env.HTTP_PORT || 8080;
  return `http://localhost:${port}`;
}

/**
 * Ưu tiên: .env → host từ request (ngrok gửi X-Forwarded-Host) → localhost
 * @param {import('express').Request} [req]
 */
function resolveSepayPgTestBaseUrl(req) {
  const fromEnv = String(process.env.SEPAY_PG_TEST_BASE_URL || '').trim();
  if (fromEnv) return fromEnv.replace(/\/$/, '');

  if (req) {
    const forwardedHost = String(req.get('x-forwarded-host') || '').trim();
    const forwardedProto = String(req.get('x-forwarded-proto') || 'https').trim();
    if (forwardedHost) {
      return `${forwardedProto}://${forwardedHost}`.replace(/\/$/, '');
    }

    const host = String(req.get('host') || '').trim();
    if (host && !/^localhost(:\d+)?$/i.test(host) && !/^127\.0\.0\.1(:\d+)?$/.test(host)) {
      const proto = req.protocol === 'https' ? 'https' : 'http';
      return `${proto}://${host}`.replace(/\/$/, '');
    }
  }

  return getSepayPgTestBaseUrl();
}

module.exports = {
  createSepayPgClient,
  getSepayPgEnv,
  getSepayPgTestBaseUrl,
  resolveSepayPgTestBaseUrl,
};
