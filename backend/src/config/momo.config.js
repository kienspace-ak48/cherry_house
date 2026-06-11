function getMomoConfig() {
  const partnerCode = String(process.env.MOMO_PARTNER_CODE || '').trim();
  const accessKey = String(process.env.MOMO_ACCESS_KEY || '').trim();
  const secretKey = String(process.env.MOMO_SECRET_KEY || '').trim();
  const storeId = String(process.env.MOMO_STORE_ID || partnerCode).trim();
  const partnerName = String(process.env.MOMO_PARTNER_NAME || 'Cherry House').trim();
  const endpoint = String(
    process.env.MOMO_ENDPOINT
      || (process.env.MOMO_ENV === 'production'
        ? 'https://payment.momo.vn/v2/gateway/api/create'
        : 'https://test-payment.momo.vn/v2/gateway/api/create'),
  ).trim();

  const requestType = String(process.env.MOMO_REQUEST_TYPE || 'payWithATM').trim();

  return {
    partnerCode,
    accessKey,
    secretKey,
    storeId,
    partnerName,
    endpoint,
    requestType,
    lang: 'vi',
  };
}

function isMomoConfigured() {
  const c = getMomoConfig();
  return Boolean(c.partnerCode && c.accessKey && c.secretKey && c.endpoint);
}

module.exports = {
  getMomoConfig,
  isMomoConfigured,
};
