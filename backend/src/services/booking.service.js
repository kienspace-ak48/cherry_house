const prisma = require('../config/prisma.config');
const bookingRepository = require('../repositories/booking.repository');
const { httpError, parseId, parseOptionalId } = require('../utils/http');
const { mapPrismaError } = require('../utils/crud');

const BOOKING_STATUSES = new Set([
  'draft',
  'pending_payment',
  'confirmed',
  'cancelled',
  'completed',
  'no_show',
]);

function parseStatus(raw) {
  const status = typeof raw === 'string' ? raw.trim() : '';
  if (!BOOKING_STATUSES.has(status)) {
    throw httpError(`Invalid status. Allowed: ${[...BOOKING_STATUSES].join(', ')}`);
  }
  return status;
}

function parseDateOnly(raw, label) {
  const date = raw instanceof Date ? raw : new Date(raw);
  if (Number.isNaN(date.getTime())) throw httpError(`${label} must be a valid date`);
  return date;
}

function nightsBetween(checkIn, checkOut) {
  const ms = checkOut.getTime() - checkIn.getTime();
  const nights = Math.round(ms / (1000 * 60 * 60 * 24));
  if (nights < 1) throw httpError('checkOut must be after checkIn');
  return nights;
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
    status: body.status !== undefined ? parseStatus(body.status) : 'pending_payment',
    holdExpiresAt:
      body.holdExpiresAt !== undefined && body.holdExpiresAt !== null
        ? parseDateOnly(body.holdExpiresAt, 'holdExpiresAt')
        : null,
  };
}

async function list(query = {}) {
  return bookingRepository.findAll(parseListFilters(query));
}

async function getById(idRaw) {
  return bookingRepository.findById(parseId(idRaw));
}

async function create(body) {
  const roomId = parseId(body.roomId, 'roomId');
  const room = await resolveRoomContext(roomId);
  const data = assertCreatePayload(body, room);
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

module.exports = { list, getById, create, patchStatus };
