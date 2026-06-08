const prisma = require('../../config/prisma.config');
const bookingRepository = require('./booking.repository');
const { httpError, parseId, parseOptionalId } = require('../../utils/http');
const { mapPrismaError } = require('../../utils/crud');
const {
  BOOKING_STATUSES,
  DEFAULT_HOLD_MINUTES,
} = require('./booking.constants');
const {
  checkAvailability,
  parseDateOnly,
  nightsBetween,
} = require('./bookingAvailability.service');
const { getBranchOccupancy } = require('./bookingOccupancy.service');
const { assertUserCanBook } = require('../../services/userBookingGuard.service');

function parseStatus(raw) {
  const status = typeof raw === 'string' ? raw.trim() : '';
  if (!BOOKING_STATUSES.has(status)) {
    throw httpError(`Invalid status. Allowed: ${[...BOOKING_STATUSES].join(', ')}`);
  }
  return status;
}

function generateBookingCode() {
  const suffix = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `CH-${Date.now().toString(36).toUpperCase()}-${suffix}`;
}

function parseListFilters(query) {
  const filters = {
    userId: parseOptionalId(query.userId, 'userId'),
    propertyId: parseOptionalId(query.propertyId, 'propertyId'),
    branchId: parseOptionalId(query.branchId, 'branchId'),
    roomId: parseOptionalId(query.roomId, 'roomId'),
    status: query.status ? parseStatus(String(query.status)) : undefined,
  };

  const codeRaw = query.bookingCode || query.code;
  if (codeRaw) filters.bookingCode = String(codeRaw).trim();

  const q = typeof query.q === 'string' ? query.q.trim() : '';
  if (q) filters.q = q;

  if (query.checkInFrom) filters.checkInFrom = parseDateOnly(query.checkInFrom, 'checkInFrom');
  if (query.checkInTo) filters.checkInTo = parseDateOnly(query.checkInTo, 'checkInTo');
  if (query.checkOutFrom) filters.checkOutFrom = parseDateOnly(query.checkOutFrom, 'checkOutFrom');
  if (query.checkOutTo) filters.checkOutTo = parseDateOnly(query.checkOutTo, 'checkOutTo');

  return filters;
}

async function resolveRoomContext(roomId) {
  const room = await prisma.inventoryRoom.findUnique({
    where: { id: roomId },
    include: {
      branch: { include: { property: true } },
      roomType: true,
    },
  });
  if (!room) throw httpError('Room not found', 404);
  if (!room.isActive) throw httpError('Room is not available', 400);
  return room;
}

function assertCreatePayload(body, room) {
  const checkIn = parseDateOnly(body.checkIn, 'checkIn');
  const checkOut = parseDateOnly(body.checkOut, 'checkOut');
  const nights = nightsBetween(checkIn, checkOut);

  const guestName = typeof body.guestName === 'string' ? body.guestName.trim() : '';
  const guestPhone = typeof body.guestPhone === 'string' ? body.guestPhone.trim() : '';
  const guestEmail = typeof body.guestEmail === 'string' ? body.guestEmail.trim() : '';
  if (!guestName) throw httpError('guestName is required');
  if (!guestPhone) throw httpError('guestPhone is required');
  if (!guestEmail) throw httpError('guestEmail is required');

  const adults = body.adults !== undefined ? Number(body.adults) : 2;
  const children = body.children !== undefined ? Number(body.children) : 0;
  if (!Number.isInteger(adults) || adults < 1) {
    throw httpError('adults must be a positive integer');
  }
  if (!Number.isInteger(children) || children < 0) {
    throw httpError('children must be a non-negative integer');
  }

  const pricePerNightVnd =
    body.pricePerNightVnd !== undefined ? Number(body.pricePerNightVnd) : room.priceVnd;
  if (!Number.isInteger(pricePerNightVnd) || pricePerNightVnd < 0) {
    throw httpError('pricePerNightVnd must be a non-negative integer');
  }

  const subtotalVnd = pricePerNightVnd * nights;
  const serviceFeeVnd =
    body.serviceFeeVnd !== undefined ? Number(body.serviceFeeVnd) : 0;
  const discountVnd = body.discountVnd !== undefined ? Number(body.discountVnd) : 0;
  if (!Number.isInteger(serviceFeeVnd) || serviceFeeVnd < 0) {
    throw httpError('serviceFeeVnd must be a non-negative integer');
  }
  if (!Number.isInteger(discountVnd) || discountVnd < 0) {
    throw httpError('discountVnd must be a non-negative integer');
  }
  const totalVnd = subtotalVnd + serviceFeeVnd - discountVnd;
  if (totalVnd < 0) throw httpError('totalVnd cannot be negative');

  const property = room.branch.property;
  const status = body.status !== undefined ? parseStatus(body.status) : 'pending_payment';

  let holdExpiresAt = null;
  if (body.holdExpiresAt !== undefined && body.holdExpiresAt !== null) {
    holdExpiresAt = parseDateOnly(body.holdExpiresAt, 'holdExpiresAt');
  } else if (status === 'pending_payment') {
    holdExpiresAt = new Date(Date.now() + DEFAULT_HOLD_MINUTES * 60 * 1000);
  }

  return {
    bookingCode: generateBookingCode(),
    userId:
      body.userId !== undefined && body.userId !== null && body.userId !== ''
        ? parseId(body.userId, 'userId')
        : null,
    roomId: room.id,
    propertyId: property.id,
    branchId: room.branchId,
    roomTypeId: room.roomTypeId,
    roomCode: room.code,
    propertyName: property.name,
    branchName: room.branch.name,
    checkIn,
    checkOut,
    nights,
    adults,
    children,
    guestName,
    guestPhone,
    guestEmail,
    specialNote:
      body.specialNote !== undefined && body.specialNote !== null
        ? String(body.specialNote).trim() || null
        : null,
    pricePerNightVnd,
    subtotalVnd,
    serviceFeeVnd,
    discountVnd,
    totalVnd,
    promoCode:
      body.promoCode !== undefined && body.promoCode !== null
        ? String(body.promoCode).trim().toUpperCase() || null
        : null,
    status,
    holdExpiresAt,
  };
}

function formatPayment(payment) {
  if (!payment) return null;
  return {
    id: payment.id,
    method: payment.method,
    status: payment.status,
    amountVnd: payment.amountVnd,
    paidAt: payment.paidAt,
    providerRef: payment.providerRef,
    createdAt: payment.createdAt,
    updatedAt: payment.updatedAt,
  };
}

function formatBookingRow(row) {
  return {
    id: row.id,
    bookingCode: row.bookingCode,
    status: row.status,
    checkIn: row.checkIn.toISOString().slice(0, 10),
    checkOut: row.checkOut.toISOString().slice(0, 10),
    nights: row.nights,
    adults: row.adults,
    children: row.children,
    guestName: row.guestName,
    guestPhone: row.guestPhone,
    guestEmail: row.guestEmail,
    totalVnd: row.totalVnd,
    propertyName: row.propertyName,
    branchName: row.branchName,
    roomCode: row.roomCode,
    roomId: row.roomId,
    propertyId: row.propertyId,
    branchId: row.branchId,
    property: row.property,
    branch: row.branch,
    room: row.room,
    holdExpiresAt: row.holdExpiresAt,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    payment: formatPayment(row.payment),
  };
}

function formatBookingDetail(row) {
  if (!row) return null;
  return {
    ...formatBookingRow(row),
    specialNote: row.specialNote,
    pricePerNightVnd: row.pricePerNightVnd,
    subtotalVnd: row.subtotalVnd,
    serviceFeeVnd: row.serviceFeeVnd,
    discountVnd: row.discountVnd,
    promoCode: row.promoCode,
    roomTypeId: row.roomTypeId,
    userId: row.userId,
    user: row.user
      ? {
          id: row.user.id,
          email: row.user.email,
          fullName: row.user.fullName,
        }
      : null,
  };
}

async function list(query = {}) {
  const rows = await bookingRepository.findAll(parseListFilters(query));
  return rows.map(formatBookingRow);
}

async function listForUser(userJwt) {
  const userId = Number(userJwt?.id);
  if (!Number.isInteger(userId) || userId < 1) {
    throw httpError('Unauthorized', 401);
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, email: true },
  });
  if (!user) throw httpError('User not found', 404);

  const rows = await bookingRepository.findForUser({
    userId: user.id,
    email: user.email,
  });
  return rows.map(formatBookingRow);
}

async function getById(idRaw) {
  const row = await bookingRepository.findById(parseId(idRaw));
  return formatBookingDetail(row);
}

async function getByIdRaw(idRaw) {
  return bookingRepository.findById(parseId(idRaw));
}

function isTruthyFlag(value) {
  return value === true || value === 'true' || value === 'on' || value === '1';
}

async function persistBooking(data, options = {}) {
  const { markPaid = false } = options;

  if (!markPaid) {
    try {
      return formatBookingDetail(await bookingRepository.create(data));
    } catch (error) {
      mapPrismaError(error, 'Booking not found');
    }
  }

  try {
    const row = await prisma.$transaction(async (tx) => {
      const booking = await tx.booking.create({ data });
      await tx.payment.create({
        data: {
          bookingId: booking.id,
          method: 'bank',
          amountVnd: data.totalVnd,
          status: 'paid',
          paidAt: new Date(),
          providerRef: `ADMIN-${booking.bookingCode}`,
        },
      });
      return tx.booking.findUnique({
        where: { id: booking.id },
        include: {
          payment: true,
          user: { select: { id: true, email: true, fullName: true } },
          room: { select: { id: true, code: true, branchId: true, roomTypeId: true } },
          property: { select: { id: true, slug: true, name: true } },
          branch: { select: { id: true, code: true, name: true } },
        },
      });
    });
    return formatBookingDetail(row);
  } catch (error) {
    mapPrismaError(error, 'Booking not found');
  }
}

async function create(body) {
  const roomId = parseId(body.roomId, 'roomId');
  const room = await resolveRoomContext(roomId);
  const data = assertCreatePayload(body, room);

  await assertUserCanBook({
    userId: data.userId,
    guestEmail: data.guestEmail,
  });

  const availability = await checkAvailability({
    roomId,
    checkIn: data.checkIn,
    checkOut: data.checkOut,
  });
  if (!availability.available) {
    throw httpError(availability.message || 'Room is not available for selected dates', 409);
  }

  return persistBooking(data, { markPaid: isTruthyFlag(body.markPaid) });
}

async function createAdmin(body) {
  const roomId = parseId(body.roomId, 'roomId');
  const room = await resolveRoomContext(roomId);
  const payload = { ...body };
  if (!payload.status) payload.status = 'confirmed';
  if (payload.status === 'confirmed') payload.holdExpiresAt = null;
  const data = assertCreatePayload(payload, room);

  const availability = await checkAvailability({
    roomId,
    checkIn: data.checkIn,
    checkOut: data.checkOut,
  });
  if (!availability.available) {
    throw httpError(availability.message || 'Room is not available for selected dates', 409);
  }

  return persistBooking(data, { markPaid: isTruthyFlag(body.markPaid) });
}

function assertUpdatePayload(body, existing, room) {
  const checkIn =
    body.checkIn !== undefined ? parseDateOnly(body.checkIn, 'checkIn') : existing.checkIn;
  const checkOut =
    body.checkOut !== undefined ? parseDateOnly(body.checkOut, 'checkOut') : existing.checkOut;
  const nights = nightsBetween(checkIn, checkOut);

  const guestName =
    body.guestName !== undefined
      ? String(body.guestName).trim()
      : existing.guestName;
  const guestPhone =
    body.guestPhone !== undefined
      ? String(body.guestPhone).trim()
      : existing.guestPhone;
  const guestEmail =
    body.guestEmail !== undefined
      ? String(body.guestEmail).trim()
      : existing.guestEmail;
  if (!guestName) throw httpError('guestName is required');
  if (!guestPhone) throw httpError('guestPhone is required');
  if (!guestEmail) throw httpError('guestEmail is required');

  const adults =
    body.adults !== undefined ? Number(body.adults) : existing.adults;
  const children =
    body.children !== undefined ? Number(body.children) : existing.children;
  if (!Number.isInteger(adults) || adults < 1) {
    throw httpError('adults must be a positive integer');
  }
  if (!Number.isInteger(children) || children < 0) {
    throw httpError('children must be a non-negative integer');
  }

  const pricePerNightVnd =
    body.pricePerNightVnd !== undefined
      ? Number(body.pricePerNightVnd)
      : existing.pricePerNightVnd;
  if (!Number.isInteger(pricePerNightVnd) || pricePerNightVnd < 0) {
    throw httpError('pricePerNightVnd must be a non-negative integer');
  }

  const serviceFeeVnd =
    body.serviceFeeVnd !== undefined ? Number(body.serviceFeeVnd) : existing.serviceFeeVnd;
  const discountVnd =
    body.discountVnd !== undefined ? Number(body.discountVnd) : existing.discountVnd;
  if (!Number.isInteger(serviceFeeVnd) || serviceFeeVnd < 0) {
    throw httpError('serviceFeeVnd must be a non-negative integer');
  }
  if (!Number.isInteger(discountVnd) || discountVnd < 0) {
    throw httpError('discountVnd must be a non-negative integer');
  }

  const subtotalVnd = pricePerNightVnd * nights;
  const totalVnd = subtotalVnd + serviceFeeVnd - discountVnd;
  if (totalVnd < 0) throw httpError('totalVnd cannot be negative');

  const status = body.status !== undefined ? parseStatus(body.status) : existing.status;
  const property = room.branch.property;

  let holdExpiresAt = existing.holdExpiresAt;
  if (status === 'pending_payment') {
    if (body.holdExpiresAt !== undefined && body.holdExpiresAt !== null && body.holdExpiresAt !== '') {
      holdExpiresAt = parseDateOnly(body.holdExpiresAt, 'holdExpiresAt');
    } else if (!holdExpiresAt || holdExpiresAt < new Date()) {
      holdExpiresAt = new Date(Date.now() + DEFAULT_HOLD_MINUTES * 60 * 1000);
    }
  } else {
    holdExpiresAt = null;
  }

  return {
    roomId: room.id,
    propertyId: property.id,
    branchId: room.branchId,
    roomTypeId: room.roomTypeId,
    roomCode: room.code,
    propertyName: property.name,
    branchName: room.branch.name,
    checkIn,
    checkOut,
    nights,
    adults,
    children,
    guestName,
    guestPhone,
    guestEmail,
    specialNote:
      body.specialNote !== undefined
        ? String(body.specialNote).trim() || null
        : existing.specialNote,
    pricePerNightVnd,
    subtotalVnd,
    serviceFeeVnd,
    discountVnd,
    totalVnd,
    promoCode:
      body.promoCode !== undefined
        ? String(body.promoCode).trim().toUpperCase() || null
        : existing.promoCode,
    status,
    holdExpiresAt,
  };
}

async function update(idRaw, body) {
  const id = parseId(idRaw);
  const existing = await bookingRepository.findById(id);
  if (!existing) throw httpError('Booking not found', 404);

  const roomId =
    body.roomId !== undefined ? parseId(body.roomId, 'roomId') : existing.roomId;
  const room = await resolveRoomContext(roomId);
  const data = assertUpdatePayload(body, existing, room);

  const availability = await checkAvailability({
    roomId,
    checkIn: data.checkIn,
    checkOut: data.checkOut,
    excludeBookingId: id,
  });
  if (!availability.available) {
    throw httpError(availability.message || 'Room is not available for selected dates', 409);
  }

  try {
    const row = await bookingRepository.update(id, data);
    if (isTruthyFlag(body.markPaid) && row.payment && row.payment.status !== 'paid') {
      await prisma.payment.update({
        where: { id: row.payment.id },
        data: { status: 'paid', paidAt: new Date(), amountVnd: data.totalVnd },
      });
      return formatBookingDetail(await bookingRepository.findById(id));
    }
    return formatBookingDetail(row);
  } catch (error) {
    mapPrismaError(error, 'Booking not found');
  }
}

async function patchStatus(idRaw, body) {
  const id = parseId(idRaw);
  if (body.status === undefined) throw httpError('status is required');
  const status = parseStatus(body.status);
  try {
    const row = await bookingRepository.updateStatus(id, status);
    return formatBookingDetail(row);
  } catch (error) {
    mapPrismaError(error, 'Booking not found');
  }
}

module.exports = {
  list,
  listForUser,
  getById,
  getByIdRaw,
  create,
  createAdmin,
  update,
  patchStatus,
  checkAvailability,
  getBranchOccupancy,
  formatBookingDetail,
  formatBookingRow,
};
