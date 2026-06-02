const prisma = require('../config/prisma.config');

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
function findAll(filters = {}) {
  /** @type {import('../generated/prisma').Prisma.BookingWhereInput} */
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

module.exports = { findAll, findById, create, updateStatus };
