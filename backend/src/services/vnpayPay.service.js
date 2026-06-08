const QRCode = require('qrcode');
const { ProductCode, VnpLocale, dateFormat } = require('vnpay');
const vnpay = require('../config/vnpay.config');
const { buildCheckoutResultUrl } = require('../config/appUrl.config');
const { resolveSepayPgTestBaseUrl } = require('../config/sepayPg.config');

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function resolveClientIp(req) {
  const forwarded = req?.headers?.['x-forwarded-for'];
  if (typeof forwarded === 'string' && forwarded.trim()) {
    return forwarded.split(',')[0].trim();
  }
  return req?.ip || req?.socket?.remoteAddress || '127.0.0.1';
}

function normalizeOrderInfo(text) {
  return String(text)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 255) || 'Thanh toan test Cherry House';
}

/**
 * @param {import('express').Request} req
 * @param {{ amount?: number; txnRef?: string; orderInfo?: string; expireMinutes?: number }} [options]
 */
function buildPaymentInput(req, options = {}) {
  const baseUrl = resolveSepayPgTestBaseUrl(req);
  const amount = Number.isFinite(options.amount) && options.amount > 0
    ? Math.round(options.amount)
    : 50_000;
  const txnRef = options.txnRef || `VN${Date.now()}`;
  const orderInfo = normalizeOrderInfo(
    options.orderInfo || `Thanh toan test ${txnRef}`,
  );
  const expireMinutes = Number.isFinite(options.expireMinutes) && options.expireMinutes > 0
    ? Math.round(options.expireMinutes)
    : 15;

  const start = new Date();
  const end = new Date(start.getTime() + expireMinutes * 60 * 1000);

  const fields = {
    vnp_Amount: amount,
    vnp_IpAddr: resolveClientIp(req),
    vnp_TxnRef: txnRef,
    vnp_OrderInfo: orderInfo,
    vnp_OrderType: ProductCode.Other,
    vnp_ReturnUrl: `${baseUrl}/test/vnpay/return`,
    vnp_Locale: VnpLocale.VN,
    vnp_CreateDate: dateFormat(start),
    vnp_ExpireDate: dateFormat(end),
  };

  return {
    baseUrl,
    amount,
    txnRef,
    orderInfo,
    expireMinutes,
    expireAt: end.toISOString(),
    fields,
    returnUrl: `${baseUrl}/test/vnpay/return`,
    ipnUrl: `${baseUrl}/test/vnpay/ipn`,
  };
}

function createPayment(req, options = {}) {
  const input = buildPaymentInput(req, {
    ...options,
    expireMinutes: options.expireMinutes ?? 24 * 60,
  });
  const paymentUrl = vnpay.buildPaymentUrl(input.fields);

  return {
    paymentUrl,
    txnRef: input.txnRef,
    amount: input.amount,
    orderInfo: input.orderInfo,
    returnUrl: input.returnUrl,
    ipnUrl: input.ipnUrl,
  };
}

/**
 * Merchant-hosted QR — gọi VNPay genqr, trả qrcontent để vẽ mã.
 * @param {import('express').Request} req
 * @param {{ amount?: number; txnRef?: string; orderInfo?: string; expireMinutes?: number }} [options]
 */
async function createQrPayment(req, options = {}) {
  const input = buildPaymentInput(req, {
    ...options,
    expireMinutes: options.expireMinutes ?? 15,
  });
  const result = await vnpay.generateQr(input.fields);
  const qrcontent = result.qrcontent || '';
  let qrDataUrl = '';

  if (qrcontent) {
    qrDataUrl = await QRCode.toDataURL(qrcontent, {
      width: 280,
      margin: 2,
      errorCorrectionLevel: 'M',
    });
  }

  return {
    code: result.code,
    message: result.message,
    qrcontent,
    qrDataUrl,
    txnRef: input.txnRef,
    amount: input.amount,
    orderInfo: input.orderInfo,
    expireMinutes: input.expireMinutes,
    expireAt: input.expireAt,
    returnUrl: input.returnUrl,
    ipnUrl: input.ipnUrl,
    ok: result.code === '00' && Boolean(qrcontent),
  };
}

function buildQrHtml(data) {
  const ok = data.ok;
  const qrImg = data.qrDataUrl
    ? `<img src="${data.qrDataUrl}" alt="VNPay QR" width="280" height="280" style="display:block;margin:12px auto;border-radius:8px;background:#fff;" />`
    : '<p class="bad">Không tạo được ảnh QR</p>';

  return `<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8" />
  <title>VNPay QR test</title>
  <style>
    body { font-family: system-ui, sans-serif; max-width: 420px; margin: 32px auto; padding: 0 16px 48px; text-align: center; }
    .card { border: 1px solid #e8e8e3; border-radius: 16px; padding: 20px; background: #fafaf8; }
    .bad { color: #a82e42; }
    .ok { color: #1b6b3a; }
    .meta { text-align: left; font-size: 13px; color: #555; margin-top: 16px; }
    a { color: #0066b3; }
    pre { text-align: left; background: #f0f0eb; padding: 10px; border-radius: 8px; font-size: 11px; word-break: break-all; max-height: 120px; overflow: auto; }
    .btn { display: inline-block; margin-top: 12px; padding: 10px 18px; border-radius: 999px; background: #0066b3; color: #fff; text-decoration: none; font-weight: 600; font-size: 13px; }
  </style>
</head>
<body>
  <h1>VNPay QR sandbox</h1>
  <div class="card">
    <p>Mã đơn: <strong>${escapeHtml(data.txnRef)}</strong></p>
    <p>Số tiền: <strong>${data.amount.toLocaleString('vi-VN')}đ</strong></p>
    <p class="${ok ? 'ok' : 'bad'}">${escapeHtml(data.message || (ok ? 'Tao QR thanh cong' : 'Tao QR that bai'))}</p>
    <p style="font-size:12px;color:#666;">Hết hạn sau ${data.expireMinutes} phút</p>
    ${qrImg}
    <p style="font-size:13px;">Mở app ngân hàng → Quét mã</p>
    <a class="btn" href="/test/vnpay/qr?amount=${data.amount}">Tạo QR mới</a>
  </div>
  <div class="meta">
    <p>IPN: <code>${escapeHtml(data.ipnUrl)}</code></p>
    <p><a href="/test/vnpay?amount=${data.amount}">Test redirect (không QR)</a></p>
  </div>
  <h2 style="font-size:14px;margin-top:20px;">qrcontent</h2>
  <pre>${escapeHtml(data.qrcontent || '(empty)')}</pre>
</body>
</html>`;
}

function buildCheckoutHtml(checkout) {
  return `<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8" />
  <title>VNPay test checkout</title>
  <style>
    body { font-family: system-ui, sans-serif; max-width: 520px; margin: 48px auto; padding: 0 16px; }
    a.btn { display: inline-block; background: #0066b3; color: #fff; text-decoration: none; border-radius: 999px; padding: 12px 24px; font-weight: 700; }
    pre { background: #f5f5f0; padding: 12px; border-radius: 8px; overflow: auto; font-size: 12px; word-break: break-all; }
    p.note { font-size: 13px; color: #555; }
  </style>
</head>
<body>
  <h1>VNPay sandbox test</h1>
  <p>Mã đơn: <strong>${escapeHtml(checkout.txnRef)}</strong></p>
  <p>Số tiền: <strong>${checkout.amount.toLocaleString('vi-VN')}đ</strong></p>
  <p><a class="btn" href="${escapeHtml(checkout.paymentUrl)}">Thanh toán thử VNPay</a></p>
  <p class="note">IPN URL (cấu hình trên VNPay merchant): <code>${escapeHtml(checkout.ipnUrl)}</code></p>
  <h2>Payment URL</h2>
  <pre>${escapeHtml(checkout.paymentUrl)}</pre>
</body>
</html>`;
}

function buildReturnHtml(result) {
  const ok = result.isSuccess && result.isVerified;
  return `<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8" />
  <title>VNPay return</title>
  <style>
    body { font-family: system-ui, sans-serif; max-width: 560px; margin: 48px auto; padding: 0 16px; }
    .ok { color: #1b6b3a; } .bad { color: #a82e42; }
    pre { background: #f5f5f0; padding: 12px; border-radius: 8px; overflow: auto; font-size: 12px; }
  </style>
</head>
<body>
  <h1 class="${ok ? 'ok' : 'bad'}">${escapeHtml(result.message || (ok ? 'Thanh toan thanh cong' : 'Thanh toan that bai'))}</h1>
  <p>Verified: <strong>${result.isVerified ? 'yes' : 'no'}</strong></p>
  <p>Mã đơn: <strong>${escapeHtml(String(result.vnp_TxnRef || ''))}</strong></p>
  <pre>${escapeHtml(JSON.stringify(result, null, 2))}</pre>
  <p><a href="/test/vnpay?amount=50000">Tạo đơn test mới</a></p>
</body>
</html>`;
}

/** Chỉ giữ tham số vnp_* — bookingCode/payment trong URL làm lệch checksum */
function pickVnpayQuery(query = {}) {
  const out = {};
  for (const [key, value] of Object.entries(query)) {
    if (key.startsWith('vnp_')) out[key] = value;
  }
  return out;
}

function verifyReturn(query) {
  return vnpay.verifyReturnUrl(pickVnpayQuery(query));
}

function verifyIpn(query) {
  return vnpay.verifyIpnCall(query);
}

function buildBookingPaymentFields(req, { bookingCode, amount, orderInfo, expireMinutes = 15 }) {
  const start = new Date();
  const end = new Date(start.getTime() + expireMinutes * 60 * 1000);

  return {
    vnp_Amount: amount,
    vnp_IpAddr: resolveClientIp(req),
    vnp_TxnRef: bookingCode,
    vnp_OrderInfo: orderInfo,
    vnp_OrderType: ProductCode.Other,
    vnp_ReturnUrl: buildCheckoutResultUrl(bookingCode),
    vnp_Locale: VnpLocale.VN,
    vnp_CreateDate: dateFormat(start),
    vnp_ExpireDate: dateFormat(end),
  };
}

/** Thẻ / redirect — checkout phòng */
function createBookingRedirectPayment(req, { bookingCode, amountVnd, orderInfo }) {
  const fields = buildBookingPaymentFields(req, {
    bookingCode,
    amount: amountVnd,
    orderInfo,
    expireMinutes: 24 * 60,
  });
  return {
    paymentUrl: vnpay.buildPaymentUrl(fields),
    txnRef: bookingCode,
  };
}

/** Ví / QR — checkout phòng */
async function createBookingQrPayment(req, { bookingCode, amountVnd, orderInfo }) {
  const fields = buildBookingPaymentFields(req, {
    bookingCode,
    amount: amountVnd,
    orderInfo,
    expireMinutes: 15,
  });
  const result = await vnpay.generateQr(fields);
  const qrcontent = result.qrcontent || '';
  let qrDataUrl = '';
  if (qrcontent) {
    qrDataUrl = await QRCode.toDataURL(qrcontent, {
      width: 280,
      margin: 2,
      errorCorrectionLevel: 'M',
    });
  }
  return {
    code: result.code,
    message: result.message,
    qrcontent,
    qrDataUrl,
    txnRef: bookingCode,
    ok: result.code === '00' && Boolean(qrcontent),
  };
}

module.exports = {
  createPayment,
  createQrPayment,
  createBookingRedirectPayment,
  createBookingQrPayment,
  buildCheckoutHtml,
  buildQrHtml,
  buildReturnHtml,
  pickVnpayQuery,
  verifyReturn,
  verifyIpn,
};
