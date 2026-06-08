const {
  createSepayPgClient,
  getSepayPgEnv,
  resolveSepayPgTestBaseUrl,
} = require('../config/sepayPg.config');
const { buildCheckoutResultUrl } = require('../config/appUrl.config');

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/**
 * @param {{
 *   orderInvoiceNumber?: string;
 *   orderAmount?: number;
 *   paymentMethod?: 'BANK_TRANSFER' | 'CARD' | 'NAPAS_BANK_TRANSFER';
 *   orderDescription?: string;
 *   successUrl?: string;
 *   errorUrl?: string;
 *   cancelUrl?: string;
 *   testBaseUrl?: string;
 * }} [options]
 */
function buildTestResultUrl(baseUrl, payment, orderInvoiceNumber) {
  const params = new URLSearchParams({ payment, invoice: orderInvoiceNumber });
  return `${baseUrl}/test/sepay-pg/result?${params.toString()}`;
}

function createOneTimeCheckout(options = {}) {
  const client = createSepayPgClient();
  const testBaseUrl = options.testBaseUrl || resolveSepayPgTestBaseUrl();

  const orderInvoiceNumber =
    options.orderInvoiceNumber || `CH-TEST-${Date.now()}`;
  const orderAmount = Number.isFinite(options.orderAmount) && options.orderAmount > 0
    ? Math.round(options.orderAmount)
    : 10_000;

  const checkoutUrl = client.checkout.initCheckoutUrl();
  const fields = client.checkout.initOneTimePaymentFields({
    operation: 'PURCHASE',
    payment_method: options.paymentMethod || 'BANK_TRANSFER',
    order_invoice_number: orderInvoiceNumber,
    order_amount: orderAmount,
    currency: 'VND',
    order_description: options.orderDescription || `Thanh toán thử ${orderInvoiceNumber}`,
    success_url:
      options.successUrl || buildTestResultUrl(testBaseUrl, 'success', orderInvoiceNumber),
    error_url:
      options.errorUrl || buildTestResultUrl(testBaseUrl, 'error', orderInvoiceNumber),
    cancel_url:
      options.cancelUrl || buildTestResultUrl(testBaseUrl, 'cancel', orderInvoiceNumber),
  });

  return {
    env: getSepayPgEnv(),
    checkoutUrl,
    fields,
    orderInvoiceNumber,
    orderAmount,
  };
}

function buildCheckoutHtml(checkout) {
  const inputs = Object.keys(checkout.fields)
    .map(
      (name) =>
        `<input type="hidden" name="${escapeHtml(name)}" value="${escapeHtml(checkout.fields[name])}" />`,
    )
    .join('\n');

  return `<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8" />
  <title>SePay test checkout</title>
  <style>
    body { font-family: system-ui, sans-serif; max-width: 520px; margin: 48px auto; padding: 0 16px; }
    button { background: #a82e42; color: #fff; border: 0; border-radius: 999px; padding: 12px 24px; font-weight: 700; cursor: pointer; }
    pre { background: #f5f5f0; padding: 12px; border-radius: 8px; overflow: auto; font-size: 12px; }
  </style>
</head>
<body>
  <h1>SePay sandbox test</h1>
  <p>Mã đơn: <strong>${escapeHtml(checkout.orderInvoiceNumber)}</strong></p>
  <p>Số tiền: <strong>${checkout.orderAmount.toLocaleString('vi-VN')}đ</strong></p>
  <form action="${escapeHtml(checkout.checkoutUrl)}" method="POST">
    ${inputs}
    <button type="submit">Thanh toán thử (BANK_TRANSFER)</button>
  </form>
  <h2>Debug fields</h2>
  <pre>${escapeHtml(JSON.stringify(checkout.fields, null, 2))}</pre>
</body>
</html>`;
}

function getIpnAuthMode() {
  const raw = String(process.env.SEPAY_PG_IPN_AUTH || 'none').trim().toLowerCase();
  return raw === 'secret_key' ? 'secret_key' : 'none';
}

/** Khớp cấu hình SePay: 「Không có」 hoặc SECRET_KEY (header X-Secret-Key) */
function isIpnAuthorized(req) {
  const mode = getIpnAuthMode();
  if (mode === 'none') return true;

  const expected = String(process.env.SEPAY_PG_SECRET_KEY || '').trim();
  if (!expected) return false;
  return String(req?.get?.('X-Secret-Key') || '').trim() === expected;
}

async function retrieveOrder(orderInvoiceNumber) {
  const client = createSepayPgClient();
  return client.order.retrieve(orderInvoiceNumber);
}

function buildResultHtml({ payment, invoice }) {
  const labels = {
    success: 'Thanh toán thành công (redirect từ SePay)',
    error: 'Thanh toán lỗi (redirect từ SePay)',
    cancel: 'Đã hủy thanh toán (redirect từ SePay)',
  };
  const title = labels[payment] || `Kết quả: ${payment}`;
  const orderLink = invoice
    ? `/test/sepay-pg/order/${encodeURIComponent(invoice)}`
    : null;

  return `<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8" />
  <title>SePay test result</title>
  <style>
    body { font-family: system-ui, sans-serif; max-width: 520px; margin: 48px auto; padding: 0 16px; }
    a { color: #a82e42; }
    .ok { color: #1b6b3a; }
    .bad { color: #a82e42; }
  </style>
</head>
<body>
  <h1 class="${payment === 'success' ? 'ok' : 'bad'}">${escapeHtml(title)}</h1>
  ${invoice ? `<p>Mã đơn: <strong>${escapeHtml(invoice)}</strong></p>` : ''}
  ${orderLink ? `<p><a href="${orderLink}">Tra cứu đơn trên SePay API</a></p>` : ''}
  <p><a href="/test/sepay-pg?amount=50000">Tạo đơn test mới</a></p>
</body>
</html>`;
}

function resolveTestBaseUrl(req) {
  return resolveSepayPgTestBaseUrl(req);
}

/** Checkout phòng — SePay chuyển khoản / QR */
function createBookingCheckout({
  bookingCode,
  amountVnd,
  orderDescription,
  paymentMethod = 'BANK_TRANSFER',
}) {
  const client = createSepayPgClient();
  const checkoutUrl = client.checkout.initCheckoutUrl();
  const fields = client.checkout.initOneTimePaymentFields({
    operation: 'PURCHASE',
    payment_method: paymentMethod,
    order_invoice_number: bookingCode,
    order_amount: amountVnd,
    currency: 'VND',
    order_description: orderDescription,
    success_url: buildCheckoutResultUrl(bookingCode, { payment: 'success' }),
    error_url: buildCheckoutResultUrl(bookingCode, { payment: 'error' }),
    cancel_url: buildCheckoutResultUrl(bookingCode, { payment: 'cancel' }),
  });

  return { checkoutUrl, fields };
}

module.exports = {
  createOneTimeCheckout,
  createBookingCheckout,
  buildCheckoutHtml,
  buildResultHtml,
  isIpnAuthorized,
  getIpnAuthMode,
  retrieveOrder,
  resolveTestBaseUrl,
};
