/** Trạng thái booking hợp lệ trong hệ thống */
const BOOKING_STATUSES = new Set([
  'draft',
  'pending_payment',
  'confirmed',
  'checked_in',
  'cancelled',
  'completed',
  'no_show',
]);

/** Trạng thái chiếm phòng — dùng cho kiểm tra overlap & occupancy */
const OCCUPYING_STATUSES = ['pending_payment', 'confirmed', 'checked_in'];

/** Giữ chỗ mặc định khi tạo booking chờ thanh toán (phút) */
const DEFAULT_HOLD_MINUTES = 15;

/** Giờ nhận phòng chuẩn (VN) — tính chính sách hoàn trước 24h */
const CHECK_IN_DEADLINE_HOUR = 14;

const VN_TZ = 'Asia/Ho_Chi_Minh';

function toDetailSlug(code) {
  return String(code).toLowerCase().replace(/[^a-z0-9]+/g, '-');
}

module.exports = {
  BOOKING_STATUSES,
  OCCUPYING_STATUSES,
  DEFAULT_HOLD_MINUTES,
  CHECK_IN_DEADLINE_HOUR,
  VN_TZ,
  toDetailSlug,
};
