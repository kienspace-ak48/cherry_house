const fs = require('fs/promises');
const path = require('path');
const { BOOKING_SIGNATURE_UPLOAD_PATH } = require('../config/myPath.config');
const { httpError } = require('./http');

const SIGNATURE_PUBLIC_PREFIX = 'uploads/bookings/signatures';

async function ensureSignatureDir() {
  await fs.mkdir(BOOKING_SIGNATURE_UPLOAD_PATH, { recursive: true });
}

/**
 * @param {number} bookingId
 * @param {string} dataUrl — data:image/png;base64,...
 * @returns {Promise<string>} public path, e.g. uploads/bookings/signatures/16_xxx.png
 */
async function saveBookingSignatureFromDataUrl(bookingId, dataUrl) {
  const raw = String(dataUrl || '').trim();
  const match = raw.match(/^data:image\/png;base64,(.+)$/i);
  if (!match) {
    throw httpError('Chữ ký không hợp lệ — vui lòng ký lại', 400);
  }

  const buffer = Buffer.from(match[1], 'base64');
  if (!buffer.length || buffer.length > 2 * 1024 * 1024) {
    throw httpError('Ảnh chữ ký quá lớn hoặc trống', 400);
  }

  await ensureSignatureDir();
  const fileName = `${bookingId}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}.png`;
  const absolutePath = path.join(BOOKING_SIGNATURE_UPLOAD_PATH, fileName);
  const publicPath = `${SIGNATURE_PUBLIC_PREFIX}/${fileName}`;

  await fs.writeFile(absolutePath, buffer);
  return publicPath;
}

function toSignaturePublicUrl(publicPath) {
  if (!publicPath) return '';
  return publicPath.startsWith('/') ? publicPath : `/${publicPath}`;
}

module.exports = {
  SIGNATURE_PUBLIC_PREFIX,
  saveBookingSignatureFromDataUrl,
  toSignaturePublicUrl,
};
