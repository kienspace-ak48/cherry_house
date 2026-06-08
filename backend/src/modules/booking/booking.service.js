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
  return {
    userId: parseOptionalId(query.userId, 'userId'),
    propertyId: parseOptionalId(query.propertyId, 'propertyId'),
    branchId: parseOptionalId(query.branchId, 'branchId'),
    status: query.status ? parseStatus(String(query.status)) : undefined,
  };
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
    totalVnd: row.totalVnd,
    propertyName: row.propertyName,
    branchName: row.branchName,
    roomCode: row.roomCode,
    property: row.property,
    branch: row.branch,
    holdExpiresAt: row.holdExpiresAt,
    createdAt: row.createdAt,
    payment: row.payment
      ? {
          id: row.payment.id,
          method: row.payment.method,
          status: row.payment.status,
          amountVnd: row.payment.amountVnd,
          paidAt: row.payment.paidAt,
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
  return bookingRepository.findById(parseId(idRaw));
}

async function create(body) {
  const roomId = parseId(body.roomId, 'roomId');
  const room = await resolveRoomContext(roomId);
  const data = assertCreatePayload(body, room);

  const availability = await checkAvailability({
    roomId,
    checkIn: data.checkIn,
    checkOut: data.checkOut,
  });
  if (!availability.available) {
    throw httpError(availability.message || 'Room is not available for selected dates', 409);
  }

  try {
    return await bookingRepository.create(data);
  } catch (error) {
    mapPrismaError(error, 'Booking not found');
  }
}

async function patchStatus(idRaw, body) {
  const id = parseId(idRaw);
  if (body.status === undefined) throw httpError('status is required');
  const status = parseStatus(body.status);
  try {
    return await bookingRepository.updateStatus(id, status);
  } catch (error) {
    mapPrismaError(error, 'Booking not found');
  }
}

module.exports = {
  list,
  listForUser,
  getById,
  create,
  patchStatus,
  checkAvailability,
  getBranchOccupancy,
};
