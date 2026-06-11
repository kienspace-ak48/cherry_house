const { CHECK_IN_DEADLINE_HOUR, VN_TZ } = require('../booking/booking.constants');

const REFUND_WINDOW_HOURS = 24;

function vnNow() {
  return new Date(new Date().toLocaleString('en-US', { timeZone: VN_TZ }));
}

function isoDateOnly(value) {
  if (!value) return '';
  if (value instanceof Date) return value.toISOString().slice(0, 10);
  return String(value).slice(0, 10);
}

function getCheckInDeadline(booking) {
  const dateStr = isoDateOnly(booking.checkIn);
  return new Date(`${dateStr}T${String(CHECK_IN_DEADLINE_HOUR).padStart(2, '0')}:00:00+07:00`);
}

function hoursBeforeCheckIn(booking, now = vnNow()) {
  const deadline = getCheckInDeadline(booking);
  return (deadline.getTime() - now.getTime()) / (60 * 60 * 1000);
}

/**
 * @param {object} booking
 * @param {object | null | undefined} payment
 * @param {Date} [now]
 */
function evaluateRefundPolicy(booking, payment, now = vnNow()) {
  const hours = hoursBeforeCheckIn(booking, now);
  const roundedHours = Math.round(hours * 100) / 100;

  if (!payment || payment.status !== 'paid') {
    return {
      percent: 0,
      amountVnd: 0,
      policyCode: 'not_paid',
      hoursBeforeCheckIn: roundedHours,
      canRefundToWallet: false,
      message: 'Booking chưa thanh toán — hủy không hoàn tiền.',
    };
  }

  if (hours >= REFUND_WINDOW_HOURS) {
    return {
      percent: 100,
      amountVnd: booking.totalVnd,
      policyCode: 'before_24h_full',
      hoursBeforeCheckIn: roundedHours,
      canRefundToWallet: Boolean(booking.userId),
      message: booking.userId
        ? `Hoàn 100% (${booking.totalVnd.toLocaleString('vi-VN')}đ) vào ví Cherry House.`
        : 'Hoàn 100% nhưng cần tài khoản đăng nhập để nhận vào ví.',
    };
  }

  return {
    percent: 0,
    amountVnd: 0,
    policyCode: 'within_24h_none',
    hoursBeforeCheckIn: roundedHours,
    canRefundToWallet: false,
    message: 'Hủy trong vòng 24 giờ trước nhận phòng — không hoàn tiền.',
  };
}

function policyLabel(policyCode) {
  const map = {
    before_24h_full: 'Hoàn 100% vào ví (trước 24h)',
    within_24h_none: 'Không hoàn tiền (trong 24h)',
    not_paid: 'Chưa thanh toán',
    admin_override: 'Admin điều chỉnh',
  };
  return map[policyCode] || policyCode;
}

module.exports = {
  REFUND_WINDOW_HOURS,
  vnNow,
  getCheckInDeadline,
  hoursBeforeCheckIn,
  evaluateRefundPolicy,
  policyLabel,
};
