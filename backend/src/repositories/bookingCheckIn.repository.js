const prisma = require('../config/prisma.config');

function formatRow(row) {
  if (!row) return null;
  return {
    id: row.id,
    bookingId: row.bookingId,
    userId: row.userId,
    guestName: row.guestName,
    guestPhone: row.guestPhone,
    guestEmail: row.guestEmail,
    bookingCode: row.bookingCode,
    propertyName: row.propertyName,
    branchName: row.branchName,
    roomCode: row.roomCode,
    signaturePath: row.signaturePath,
    checkedInAt: row.checkedInAt,
    checkedInByAdminId: row.checkedInByAdminId,
    staffName: row.staffName,
    admin: row.admin
      ? { id: row.admin.id, fullName: row.admin.fullName, email: row.admin.email }
      : null,
    booking: row.booking
      ? {
          id: row.booking.id,
          status: row.booking.status,
          checkIn: row.booking.checkIn,
          checkOut: row.booking.checkOut,
        }
      : null,
  };
}

function findByBookingId(bookingId) {
  return prisma.bookingCheckIn.findUnique({
    where: { bookingId },
    include: {
      admin: { select: { id: true, fullName: true, email: true } },
    },
  }).then(formatRow);
}

function create(data) {
  return prisma.bookingCheckIn.create({
    data,
    include: {
      admin: { select: { id: true, fullName: true, email: true } },
    },
  }).then(formatRow);
}

function findForGuest({ userId, guestEmail, take = 20 }) {
  const email = typeof guestEmail === 'string' ? guestEmail.trim() : '';
  /** @type {import('../generated/prisma').Prisma.BookingCheckInWhereInput} */
  const where = {};
  if (userId) {
    where.OR = [{ userId }];
    if (email) where.OR.push({ guestEmail: email });
  } else if (email) {
    where.guestEmail = email;
  } else {
    return Promise.resolve([]);
  }

  return prisma.bookingCheckIn.findMany({
    where,
    orderBy: { checkedInAt: 'desc' },
    take,
    include: {
      admin: { select: { id: true, fullName: true, email: true } },
      booking: { select: { id: true, status: true, checkIn: true, checkOut: true } },
    },
  }).then((rows) => rows.map(formatRow));
}

module.exports = {
  findByBookingId,
  create,
  findForGuest,
};
