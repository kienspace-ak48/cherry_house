const crypto = require('crypto');
const { getMomoConfig, isMomoConfigured } = require('../config/momo.config');
const { buildCheckoutResultUrl, getCheckoutPublicBaseUrl } = require('../config/appUrl.config');
const { httpError } = require('../utils/http');

function assertMomoConfigured() {
  if (!isMomoConfigured()) {
    throw httpError(
      'MoMo chưa được cấu hình (MOMO_PARTNER_CODE, MOMO_ACCESS_KEY, MOMO_SECRET_KEY)',
      503,
    );
  }
}

function signRaw(secretKey, rawSignature) {
  return crypto.createHmac('sha256', secretKey).update(rawSignature).digest('hex');
}

function normalizeOrderInfo(text) {
  return String(text)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 255) || 'Thanh toan Cherry House';
}

function buildIpnUrl(req) {
  return `${getCheckoutPublicBaseUrl(req)}/api/checkout/ipn/momo`;
}

function buildCreateSignature(config, fields) {
  const raw = [
    `accessKey=${fields.accessKey}`,
    `amount=${fields.amount}`,
    `extraData=${fields.extraData}`,
    `ipnUrl=${fields.ipnUrl}`,
    `orderId=${fields.orderId}`,
    `orderInfo=${fields.orderInfo}`,
    `partnerCode=${fields.partnerCode}`,
    `redirectUrl=${fields.redirectUrl}`,
    `requestId=${fields.requestId}`,
    `requestType=${fields.requestType}`,
  ].join('&');
  return signRaw(config.secretKey, raw);
}

function buildCallbackSignature(config, payload) {
  const raw = [
    `accessKey=${config.accessKey}`,
    `amount=${payload.amount}`,
    `extraData=${payload.extraData || ''}`,
    `message=${payload.message || ''}`,
    `orderId=${payload.orderId}`,
    `orderInfo=${payload.orderInfo || ''}`,
    `orderType=${payload.orderType || ''}`,
    `partnerCode=${payload.partnerCode}`,
    `payType=${payload.payType || ''}`,
    `requestId=${payload.requestId}`,
    `responseTime=${payload.responseTime}`,
    `resultCode=${payload.resultCode}`,
    `transId=${payload.transId || ''}`,
  ].join('&');
  return signRaw(config.secretKey, raw);
}

function pickCallbackPayload(input = {}) {
  return {
    partnerCode: String(input.partnerCode || ''),
    orderId: String(input.orderId || ''),
    requestId: String(input.requestId || ''),
    amount: String(input.amount ?? ''),
    orderInfo: String(input.orderInfo || ''),
    orderType: String(input.orderType || ''),
    transId: String(input.transId || ''),
    resultCode: String(input.resultCode ?? ''),
    message: String(input.message || ''),
    payType: String(input.payType || ''),
    responseTime: String(input.responseTime || ''),
    extraData: String(input.extraData || ''),
    signature: String(input.signature || ''),
  };
}

function verifyCallback(input = {}) {
  const config = getMomoConfig();
  const payload = pickCallbackPayload(input);
  const expected = buildCallbackSignature(config, payload);
  const isVerified = Boolean(payload.signature) && payload.signature === expected;
  const isSuccess = isVerified && Number(payload.resultCode) === 0;

  return {
    ...payload,
    isVerified,
    isSuccess,
    bookingCode: payload.orderId,
  };
}

/**
 * Tạo link thanh toán MoMo — redirect sang form nhập thẻ trên cổng MoMo.
 * requestType: payWithATM (ATM Napas) | payWithCC (Visa/MC/JCB) | captureWallet (ví/QR)
 * @param {import('express').Request} req
 * @param {{ bookingCode: string; amountVnd: number; orderInfo?: string; requestType?: string; guestEmail?: string; guestName?: string; guestPhone?: string }} params
 */
async function createBookingPayment(req, {
  bookingCode,
  amountVnd,
  orderInfo,
  requestType,
  guestEmail,
  guestName,
  guestPhone,
}) {
  assertMomoConfigured();
  const config = getMomoConfig();
  const resolvedRequestType = requestType || config.requestType || 'payWithATM';

  const orderId = String(bookingCode).trim();
  const requestId = `${orderId}-${Date.now()}`;
  const amount = String(Math.round(amountVnd));
  const orderInfoText = normalizeOrderInfo(orderInfo || `Cherry House ${orderId}`);
  const redirectUrl = buildCheckoutResultUrl(orderId, { provider: 'momo' });
  const ipnUrl = buildIpnUrl(req);
  const extraData = '';

  const signature = buildCreateSignature(config, {
    accessKey: config.accessKey,
    amount,
    extraData,
    ipnUrl,
    orderId,
    orderInfo: orderInfoText,
    partnerCode: config.partnerCode,
    redirectUrl,
    requestId,
    requestType: resolvedRequestType,
  });

  const body = {
    partnerCode: config.partnerCode,
    partnerName: config.partnerName,
    storeId: config.storeId,
    requestId,
    amount,
    orderId,
    orderInfo: orderInfoText,
    redirectUrl,
    ipnUrl,
    lang: config.lang,
    requestType: resolvedRequestType,
    autoCapture: true,
    extraData,
    signature,
  };

  if (resolvedRequestType === 'payWithCC') {
    const email = String(guestEmail || '').trim();
    if (!email) {
      throw httpError('Email khách hàng bắt buộc khi thanh toán thẻ quốc tế qua MoMo', 400);
    }
    body.userInfo = {
      email,
      name: String(guestName || '').trim() || undefined,
      phoneNumber: String(guestPhone || '').trim() || undefined,
    };
  }

  const res = await fetch(config.endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok || Number(data.resultCode) !== 0 || !data.payUrl) {
    const msg = data.message || data.localMessage || 'Không tạo được link thanh toán MoMo';
    throw httpError(msg, 502);
  }

  return {
    payUrl: data.payUrl,
    orderId,
    requestId,
    deeplink: data.deeplink || null,
    qrCodeUrl: data.qrCodeUrl || null,
  };
}

module.exports = {
  createBookingPayment,
  verifyCallback,
  buildIpnUrl,
  isMomoConfigured,
};
