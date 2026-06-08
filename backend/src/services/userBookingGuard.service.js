const prisma = require('../config/prisma.config');
const { httpError } = require('../utils/http');

const DEFAULT_BAN_MESSAGE =
  'Tài khoản của bạn đang bị cấm đặt phòng. Vui lòng liên hệ Cherry House để được hỗ trợ.';

function banMessage(reason) {
  const trimmed = typeof reason === 'string' ? reason.trim() : '';
  return trimmed || DEFAULT_BAN_MESSAGE;
}

/**
 * Chặn checkout/booking nếu user hoặc email khách trùng tài khoản bị cấm đặt phòng.
 *
 * @param {{ userId?: number | null; guestEmail?: string | null }} params
 */
async function assertUserCanBook({ userId, guestEmail }) {
  const email = typeof guestEmail === 'string' ? guestEmail.trim().toLowerCase() : '';

  if (userId && Number.isInteger(userId) && userId > 0) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        isActive: true,
        bookingBanned: true,
        bookingBanReason: true,
      },
    });
    if (!user) throw httpError('User not found', 404);
    if (!user.isActive) throw httpError('Tài khoản đã bị vô hiệu hóa', 403);
    if (user.bookingBanned) {
      throw httpError(banMessage(user.bookingBanReason), 403);
    }
    return;
  }

  if (email) {
    const byEmail = await prisma.user.findUnique({
      where: { email },
      select: {
        bookingBanned: true,
        bookingBanReason: true,
        isActive: true,
      },
    });
    if (byEmail?.isActive === false) {
      throw httpError('Tài khoản email này đã bị vô hiệu hóa', 403);
    }
    if (byEmail?.bookingBanned) {
      throw httpError(banMessage(byEmail.bookingBanReason), 403);
    }
  }
}

module.exports = {
  assertUserCanBook,
  DEFAULT_BAN_MESSAGE,
};
