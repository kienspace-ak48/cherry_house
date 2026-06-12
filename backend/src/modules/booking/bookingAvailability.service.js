const bookingRepository = require('./booking.repository');
const { resolveRoomRef } = require('./roomResolver.service');
const { httpError } = require('../../utils/http');
const { toDetailSlug } = require('./booking.constants');

function parseDateOnly(raw, label) {
  if (typeof raw === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(raw.trim())) {
    const date = new Date(`${raw.trim()}T12:00:00`);
    if (Number.isNaN(date.getTime())) throw httpError(`${label} must be a valid date`);
    return date;
  }
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

function formatDateOnly(date) {
  return date.toISOString().slice(0, 10);
}

function mapConflict(booking) {
  return {
    bookingId: booking.id,
    bookingCode: booking.bookingCode,
    checkIn: formatDateOnly(booking.checkIn),
    checkOut: formatDateOnly(booking.checkOut),
    status: booking.status,
    holdExpiresAt: booking.holdExpiresAt ? booking.holdExpiresAt.toISOString() : null,
  };
}

/**
 * Kiểm tra phòng còn trống trong khoảng ngày (real-time từ bookings DB).
 *
 * @param {object} body
 */
async function checkAvailability(body = {}) {
  const checkIn = parseDateOnly(body.checkIn, 'checkIn');
  const checkOut = parseDateOnly(body.checkOut, 'checkOut');
  const nights = nightsBetween(checkIn, checkOut);

  const room = await resolveRoomRef({
    roomId: body.roomId,
    propertySlug: body.propertySlug,
    branchCode: body.branchCode,
    roomCode: body.roomCode,
    detailSlug: body.detailSlug,
  });

  const excludeBookingId =
    body.excludeBookingId !== undefined && body.excludeBookingId !== null && body.excludeBookingId !== ''
      ? Number(body.excludeBookingId)
      : undefined;

  if (excludeBookingId !== undefined && (!Number.isInteger(excludeBookingId) || excludeBookingId < 1)) {
    throw httpError('excludeBookingId must be a positive integer');
  }

  const inventoryBlocked = room.status === 'booked';
  const conflicts = await bookingRepository.findOverlappingActive({
    roomId: room.id,
    checkIn,
    checkOut,
    excludeBookingId,
  });

  const available = !inventoryBlocked && conflicts.length === 0;

  let message = null;
  if (room.status === 'booked') {
    message = 'Phòng đang được đánh dấu là đã đặt.';
  } else if (conflicts.length > 0) {
    message = 'Phòng đã có đặt chỗ trong khoảng ngày này.';
  }

  return {
    available,
    nights,
    checkIn: formatDateOnly(checkIn),
    checkOut: formatDateOnly(checkOut),
    message,
    room: {
      id: room.id,
      code: room.code,
      detailSlug: toDetailSlug(room.code),
      priceVnd: room.priceVnd,
      status: room.status,
      isActive: room.isActive,
      propertySlug: room.branch?.property?.slug ?? null,
      branchCode: room.branch?.code ?? null,
    },
    conflicts: conflicts.map(mapConflict),
  };
}

module.exports = { checkAvailability, parseDateOnly, nightsBetween };
