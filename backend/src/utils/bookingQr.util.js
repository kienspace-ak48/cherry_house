const QRCode = require('qrcode');

const BOOKING_QR_PREFIX = 'CHERRY:';

/**
 * Nội dung mã QR — staff quét sẽ parse booking code.
 * @param {string} bookingCode
 */
function buildBookingQrPayload(bookingCode) {
  return `${BOOKING_QR_PREFIX}${String(bookingCode || '').trim()}`;
}

/**
 * Trích mã đặt phòng từ chuỗi quét QR hoặc nhập tay.
 * @param {string} raw
 */
function parseBookingCodeFromScan(raw) {
  const text = String(raw || '').trim();
  if (!text) return '';
  if (text.startsWith(BOOKING_QR_PREFIX)) {
    return text.slice(BOOKING_QR_PREFIX.length).trim();
  }
  return text;
}

/**
 * @param {string} bookingCode
 * @returns {Promise<string>} data URL image/png
 */
async function generateBookingQrDataUrl(bookingCode) {
  const payload = buildBookingQrPayload(bookingCode);
  if (!payload || payload === BOOKING_QR_PREFIX) return '';
  return QRCode.toDataURL(payload, {
    errorCorrectionLevel: 'M',
    margin: 2,
    width: 280,
    color: { dark: '#5c1a28', light: '#ffffff' },
  });
}

module.exports = {
  BOOKING_QR_PREFIX,
  buildBookingQrPayload,
  parseBookingCodeFromScan,
  generateBookingQrDataUrl,
};
