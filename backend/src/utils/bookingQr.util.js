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

const BOOKING_QR_EMAIL_CID = 'booking-qr';

/**
 * Chuyển data URL PNG thành attachment inline cho nodemailer (src="cid:booking-qr").
 * Gmail và nhiều client email chặn data: URL trong <img>.
 *
 * @param {string} dataUrl
 * @param {string} [cid]
 */
function buildQrInlineAttachment(dataUrl, cid = BOOKING_QR_EMAIL_CID) {
  const raw = String(dataUrl || '').trim();
  const match = raw.match(/^data:image\/png;base64,(.+)$/i);
  if (!match) return null;

  return {
    filename: 'booking-qr.png',
    content: Buffer.from(match[1], 'base64'),
    cid,
    contentType: 'image/png',
    contentDisposition: 'inline',
  };
}

module.exports = {
  BOOKING_QR_PREFIX,
  BOOKING_QR_EMAIL_CID,
  buildBookingQrPayload,
  parseBookingCodeFromScan,
  generateBookingQrDataUrl,
  buildQrInlineAttachment,
};
