const prisma = require('../config/prisma.config');

const paymentInclude = {
  booking: {
    select: {
      id: true,
      bookingCode: true,
      status: true,
      totalVnd: true,
      guestName: true,
      guestEmail: true,
    },
  },
};

/**
 * @param {{ bookingId?: number; status?: string; method?: string }} filters
 */
function findAll(filters = {}) {
  /** @type {import('../generated/prisma').Prisma.PaymentWhereInput} */
  const where = {};
  if (filters.bookingId) where.bookingId = filters.bookingId;
  if (filters.status) where.status = filters.status;
  if (filters.method) where.method = filters.method;

  return prisma.payment.findMany({
    where,
    orderBy: [{ createdAt: 'desc' }],
    include: paymentInclude,
  });
}

function findById(id) {
  return prisma.payment.findUnique({
    where: { id },
    include: paymentInclude,
  });
}

function create(data) {
  return prisma.payment.create({ data, include: paymentInclude });
}

function updateStatus(id, data) {
  return prisma.payment.update({
    where: { id },
    data,
    include: paymentInclude,
  });
}

module.exports = { findAll, findById, create, updateStatus };
