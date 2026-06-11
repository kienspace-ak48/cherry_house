const mailService = require('./mail.service');
const { getClientAppUrl } = require('../config/appUrl.config');
const { generateBookingQrDataUrl } = require('../utils/bookingQr.util');

function formatDateVi(value) {
  if (!value) return '—';
  const d = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('vi-VN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  });
}

function formatVnd(amount) {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(Number(amount) || 0);
}

/**
 * Gửi email xác nhận sau khi booking đã confirmed (thanh toán thành công).
 * Không throw — lỗi gửi mail không được làm fail thanh toán.
 *
 * @param {object | null | undefined} booking
 */
async function sendBookingConfirmationEmail(booking) {
  if (!booking?.guestEmail) {
    return { sent: false, reason: 'no_email' };
  }
  if (booking.status !== 'confirmed') {
    return { sent: false, reason: 'not_confirmed' };
  }

  const guestLine =
    booking.children > 0
      ? `${booking.adults} người lớn, ${booking.children} trẻ em`
      : `${booking.adults} người lớn`;

  const resultUrl = `${getClientAppUrl()}/checkout/result?bookingCode=${encodeURIComponent(booking.bookingCode)}`;
  let qrCodeDataUrl = '';
  try {
    qrCodeDataUrl = await generateBookingQrDataUrl(booking.bookingCode);
  } catch (err) {
    console.warn('[bookingEmail] QR generation failed:', err?.message || err);
  }

  const result = await mailService.sendBookingConfirmation({
    to: booking.guestEmail,
    guestName: booking.guestName,
    bookingCode: booking.bookingCode,
    propertyName: booking.propertyName,
    branchName: booking.branchName,
    roomCode: booking.roomCode,
    checkIn: formatDateVi(booking.checkIn),
    checkOut: formatDateVi(booking.checkOut),
    nights: booking.nights,
    guestLine,
    guestPhone: booking.guestPhone,
    totalVnd: formatVnd(booking.totalVnd),
    pricePerNightVnd: formatVnd(booking.pricePerNightVnd),
    specialNote: booking.specialNote || '',
    resultUrl,
    qrCodeDataUrl,
  });

  return { sent: result.success, ...result };
}

/**
 * @param {object | null | undefined} booking
 * @param {{ refundAmountVnd?: number; policyLabel?: string; walletBalanceVnd?: number | null; message?: string }} cancelResult
 */
async function sendBookingCancellationEmail(booking, cancelResult = {}) {
  if (!booking?.guestEmail) {
    return { sent: false, reason: 'no_email' };
  }

  const refundLine =
    cancelResult.refundAmountVnd > 0
      ? `Số tiền hoàn vào ví Cherry House: ${formatVnd(cancelResult.refundAmountVnd)}.`
      : cancelResult.message || 'Không có khoản hoàn tiền cho lần hủy này.';

  const balanceLine =
    cancelResult.walletBalanceVnd != null
      ? `Số dư ví hiện tại: ${formatVnd(cancelResult.walletBalanceVnd)}.`
      : '';

  const text = [
    `Xin chào ${booking.guestName},`,
    '',
    `Booking ${booking.bookingCode} tại ${booking.propertyName} đã được hủy.`,
    refundLine,
    balanceLine,
    '',
    'Cảm ơn bạn đã sử dụng Cherry House.',
  ]
    .filter(Boolean)
    .join('\n');

  const result = await mailService.sendMail({
    to: booking.guestEmail,
    subject: `[Cherry House] Đã hủy đặt phòng ${booking.bookingCode}`,
    text,
  });

  return { sent: result.success, ...result };
}

module.exports = { sendBookingConfirmationEmail, sendBookingCancellationEmail };
