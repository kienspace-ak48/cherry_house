const prisma = require('../../config/prisma.config');
const { OCCUPYING_STATUSES } = require('./booking.constants');

const bookingInclude = {
  payment: true,
  user: { select: { id: true, email: true, fullName: true } },
  room: { select: { id: true, code: true, branchId: true, roomTypeId: true } },
  property: { select: { id: true, slug: true, name: true } },
  branch: { select: { id: true, code: true, name: true } },
};

/**
 * @param {{ userId?: number; status?: string; propertyId?: number; branchId?: number }} filters
 */
/**
 * Đơn của khách đăng nhập: theo userId hoặc email khách (đặt khi chưa gắn user).
 *
 * @param {{ userId: number; email?: string }} params
 */
function findForUser({ userId, email }) {
  const trimmedEmail = typeof email === 'string' ? email.trim() : '';
  /** @type {import('../../generated/prisma').Prisma.BookingWhereInput[]} */
  const or = [{ userId }];
  if (trimmedEmail) {
    or.push({ guestEmail: trimmedEmail });
  }

  return prisma.booking.findMany({
    where: { OR: or },
    orderBy: [{ createdAt: 'desc' }],
    include: bookingInclude,
  });
}

function findAll(filters = {}) {
  /** @type {import('../../generated/prisma').Prisma.BookingWhereInput} */
  const where = {};
  if (filters.userId) where.userId = filters.userId;
  if (filters.status) where.status = filters.status;
  if (filters.propertyId) where.propertyId = filters.propertyId;
  if (filters.branchId) where.branchId = filters.branchId;

  return prisma.booking.findMany({
    where,
    orderBy: [{ createdAt: 'desc' }],
    include: bookingInclude,
  });
}

function findById(id) {
  return prisma.booking.findUnique({
    where: { id },
    include: bookingInclude,
  });
}

function create(data) {
  return prisma.booking.create({ data, include: bookingInclude });
}

function updateStatus(id, status) {
  return prisma.booking.update({
    where: { id },
    data: { status },
    include: bookingInclude,
  });
}

/**
 * Booking đang chiếm phòng trong khoảng ngày (overlap).
 * pending_payment chỉ tính khi hold chưa hết hạn.
 *
 * @param {{ roomId: number; checkIn: Date; checkOut: Date; excludeBookingId?: number }} params
 */
function findOverlappingActive({ roomId, checkIn, checkOut, excludeBookingId }) {
  const now = new Date();

  /** @type {import('../../generated/prisma').Prisma.BookingWhereInput} */
  const where = {
    roomId,
    status: { in: OCCUPYING_STATUSES },
    checkIn: { lt: checkOut },
    checkOut: { gt: checkIn },
    OR: [
      { status: 'confirmed' },
      {
        status: 'pending_payment',
        OR: [{ holdExpiresAt: null }, { holdExpiresAt: { gt: now } }],
      },
    ],
  };

  if (excludeBookingId) {
    where.id = { not: excludeBookingId };
  }

  return prisma.booking.findMany({
    where,
    select: {
      id: true,
      bookingCode: true,
      checkIn: true,
      checkOut: true,
      status: true,
      holdExpiresAt: true,
      guestName: true,
    },
    orderBy: { checkIn: 'asc' },
  });
}

/**
 * Tất cả booking đang chiếm phòng tại chi nhánh (real-time từ DB).
 *
 * @param {{ branchId: number; from?: Date; to?: Date }} params
 */
function findActiveByBranch({ branchId, from, to }) {
  const now = new Date();

  /** @type {import('../../generated/prisma').Prisma.BookingWhereInput} */
  const where = {
    branchId,
    status: { in: OCCUPYING_STATUSES },
    OR: [
      { status: 'confirmed' },
      {
        status: 'pending_payment',
        OR: [{ holdExpiresAt: null }, { holdExpiresAt: { gt: now } }],
      },
    ],
  };

  if (from && to) {
    where.checkIn = { lt: to };
    where.checkOut = { gt: from };
  }

  return prisma.booking.findMany({
    where,
    select: {
      id: true,
      bookingCode: true,
      roomId: true,
      roomCode: true,
      checkIn: true,
      checkOut: true,
      status: true,
      holdExpiresAt: true,
      nights: true,
      guestName: true,
    },
    orderBy: [{ checkIn: 'asc' }, { roomCode: 'asc' }],
  });
}

module.exports = {
  findForUser,
  findAll,
  findById,
  create,
  updateStatus,
  findOverlappingActive,
  findActiveByBranch,
};
