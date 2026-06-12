const prisma = require('../../config/prisma.config');
const { OCCUPYING_STATUSES } = require('./booking.constants');

/** Prisma DateTime/@db.Date cần Date hoặc ISO đầy đủ — không dùng chuỗi YYYY-MM-DD. */
function toDateOnly(raw) {
  if (raw instanceof Date && !Number.isNaN(raw.getTime())) {
    return new Date(`${raw.toISOString().slice(0, 10)}T12:00:00`);
  }
  const str = typeof raw === 'string' ? raw.trim() : '';
  if (/^\d{4}-\d{2}-\d{2}$/.test(str)) {
    return new Date(`${str}T12:00:00`);
  }
  const parsed = new Date(raw);
  if (!Number.isNaN(parsed.getTime())) {
    return new Date(`${parsed.toISOString().slice(0, 10)}T12:00:00`);
  }
  return new Date(`${new Date().toISOString().slice(0, 10)}T12:00:00`);
}

const bookingInclude = {
  payment: true,
  refund: true,
  user: { select: { id: true, email: true, fullName: true } },
  room: { select: { id: true, code: true, branchId: true, roomTypeId: true } },
  property: { select: { id: true, slug: true, name: true } },
  branch: { select: { id: true, code: true, name: true } },
};

/**
 * @param {{ userId?: number; status?: string; propertyId?: number; branchId?: number }} filters
 */
function buildUserBookingWhere({ userId, email, filter, todayIso }) {
  const trimmedEmail = typeof email === 'string' ? email.trim() : '';
  /** @type {import('../../generated/prisma').Prisma.BookingWhereInput[]} */
  const or = [{ userId }];
  if (trimmedEmail) {
    or.push({ guestEmail: trimmedEmail });
  }

  /** @type {import('../../generated/prisma').Prisma.BookingWhereInput} */
  let where = { OR: or };
  const today = toDateOnly(todayIso || new Date().toISOString().slice(0, 10));

  if (filter === 'pending') {
    where = { AND: [where, { status: 'pending_payment' }] };
  } else if (filter === 'upcoming') {
    where = {
      AND: [where, { status: { not: 'cancelled' } }, { checkOut: { gte: today } }],
    };
  } else if (filter === 'past') {
    where = {
      AND: [
        where,
        {
          OR: [{ status: 'cancelled' }, { checkOut: { lt: today } }],
        },
      ],
    };
  }

  return where;
}

/**
 * Đơn của khách đăng nhập: theo userId hoặc email khách (đặt khi chưa gắn user).
 *
 * @param {{ userId: number; email?: string; filter?: string; todayIso?: string }} params
 * @param {{ skip?: number; take?: number }} [pagination]
 */
function findForUser({ userId, email, filter, todayIso }, pagination) {
  const query = {
    where: buildUserBookingWhere({ userId, email, filter, todayIso }),
    orderBy: [{ createdAt: 'desc' }],
    include: bookingInclude,
  };
  if (pagination?.skip != null) query.skip = pagination.skip;
  if (pagination?.take != null) query.take = pagination.take;
  return prisma.booking.findMany(query);
}

function countForUser({ userId, email, filter, todayIso }) {
  return prisma.booking.count({
    where: buildUserBookingWhere({ userId, email, filter, todayIso }),
  });
}

function buildWhere(filters = {}) {
  /** @type {import('../../generated/prisma').Prisma.BookingWhereInput} */
  const where = {};
  if (filters.userId) where.userId = filters.userId;
  if (filters.status) where.status = filters.status;
  if (filters.propertyId) where.propertyId = filters.propertyId;
  if (filters.branchId) where.branchId = filters.branchId;
  if (filters.roomId) where.roomId = filters.roomId;
  if (filters.exactBookingCode) {
    where.bookingCode = filters.exactBookingCode;
  } else if (filters.bookingCode) {
    where.bookingCode = { contains: filters.bookingCode };
  }
  if (filters.checkInFrom || filters.checkInTo) {
    where.checkIn = {};
    if (filters.checkInFrom) where.checkIn.gte = filters.checkInFrom;
    if (filters.checkInTo) where.checkIn.lte = filters.checkInTo;
  }
  if (filters.checkOutFrom || filters.checkOutTo) {
    where.checkOut = {};
    if (filters.checkOutFrom) where.checkOut.gte = filters.checkOutFrom;
    if (filters.checkOutTo) where.checkOut.lte = filters.checkOutTo;
  }
  if (filters.q) {
    where.OR = [
      { guestName: { contains: filters.q } },
      { guestEmail: { contains: filters.q } },
      { guestPhone: { contains: filters.q } },
      { bookingCode: { contains: filters.q } },
      { roomCode: { contains: filters.q } },
    ];
  }
  return where;
}

function findAll(filters = {}, pagination) {
  const query = {
    where: buildWhere(filters),
    orderBy: [{ createdAt: 'desc' }],
    include: bookingInclude,
  };
  if (pagination?.skip != null) query.skip = pagination.skip;
  if (pagination?.take != null) query.take = pagination.take;
  return prisma.booking.findMany(query);
}

function countAll(filters = {}) {
  return prisma.booking.count({ where: buildWhere(filters) });
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

function update(id, data) {
  return prisma.booking.update({
    where: { id },
    data,
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
  countForUser,
  buildUserBookingWhere,
  findAll,
  countAll,
  findById,
  create,
  update,
  updateStatus,
  findOverlappingActive,
  findActiveByBranch,
};
