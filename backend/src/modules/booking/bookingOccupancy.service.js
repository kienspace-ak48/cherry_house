const prisma = require('../../config/prisma.config');
const propertyRepository = require('../../repositories/property.repository');
const branchRepository = require('../../repositories/branch.repository');
const bookingRepository = require('./booking.repository');
const { httpError } = require('../../utils/http');
const { toDetailSlug } = require('./booking.constants');
const { parseDateOnly } = require('./bookingAvailability.service');

function formatDateOnly(date) {
  return date.toISOString().slice(0, 10);
}

function pickPrimaryBooking(bookings) {
  if (!bookings.length) return null;
  const confirmed = bookings.find((b) => b.status === 'confirmed' || b.status === 'checked_in');
  return confirmed ?? bookings[0];
}

function deriveOccupancy(room, bookingsByRoomId) {
  if (!room.isActive) return 'inactive';
  const active = bookingsByRoomId.get(room.id) ?? [];
  if (!active.length) return 'available';
  const primary = pickPrimaryBooking(active);
  if (primary?.status === 'confirmed' || primary?.status === 'checked_in') return 'booked';
  return 'held';
}

/**
 * Trạng thái giữ chỗ / đặt phòng theo chi nhánh — đọc real-time từ DB.
 *
 * @param {object} query
 */
async function getBranchOccupancy(query = {}) {
  let propertyId = query.propertyId ? Number(query.propertyId) : undefined;
  let branchId = query.branchId ? Number(query.branchId) : undefined;

  const propertySlug =
    typeof query.propertySlug === 'string' ? query.propertySlug.trim() : '';
  const branchCode = typeof query.branchCode === 'string' ? query.branchCode.trim() : '';

  if (propertySlug) {
    const property = await propertyRepository.findBySlug(propertySlug);
    if (!property) throw httpError('Property not found', 404);
    propertyId = property.id;
  }

  if (branchCode && propertyId) {
    const branch = await branchRepository.findByPropertyAndCode(propertyId, branchCode);
    if (!branch) throw httpError('Branch not found', 404);
    branchId = branch.id;
  }

  if (!branchId || !Number.isInteger(branchId) || branchId < 1) {
    throw httpError('branchId or (propertySlug + branchCode) is required');
  }

  let from;
  let to;
  if (query.from && query.to) {
    from = parseDateOnly(query.from, 'from');
    to = parseDateOnly(query.to, 'to');
    if (to <= from) throw httpError('to must be after from');
  }

  const branch = await prisma.branch.findUnique({
    where: { id: branchId },
    include: { property: { select: { id: true, slug: true, name: true } } },
  });
  if (!branch) throw httpError('Branch not found', 404);

  const [rooms, activeBookings] = await Promise.all([
    prisma.inventoryRoom.findMany({
      where: { branchId },
      orderBy: [{ code: 'asc' }],
      select: {
        id: true,
        code: true,
        status: true,
        isActive: true,
        priceVnd: true,
      },
    }),
    bookingRepository.findActiveByBranch({ branchId, from, to }),
  ]);

  const bookingsByRoomId = new Map();
  for (const booking of activeBookings) {
    const list = bookingsByRoomId.get(booking.roomId) ?? [];
    list.push(booking);
    bookingsByRoomId.set(booking.roomId, list);
  }

  const roomRows = rooms.map((room) => {
    const roomBookings = bookingsByRoomId.get(room.id) ?? [];
    const primary = pickPrimaryBooking(roomBookings);
    const occupancy = deriveOccupancy(room, bookingsByRoomId);

    return {
      roomId: room.id,
      code: room.code,
      detailSlug: toDetailSlug(room.code),
      inventoryStatus: room.status,
      isActive: room.isActive,
      priceVnd: room.priceVnd,
      occupancy,
      activeBooking: primary
        ? {
            bookingId: primary.id,
            bookingCode: primary.bookingCode,
            checkIn: formatDateOnly(primary.checkIn),
            checkOut: formatDateOnly(primary.checkOut),
            status: primary.status,
            holdExpiresAt: primary.holdExpiresAt
              ? primary.holdExpiresAt.toISOString()
              : null,
            guestName: primary.guestName,
          }
        : null,
    };
  });

  const summary = {
    totalRooms: rooms.length,
    available: roomRows.filter((r) => r.occupancy === 'available').length,
    held: roomRows.filter((r) => r.occupancy === 'held').length,
    booked: roomRows.filter((r) => r.occupancy === 'booked').length,
    inactive: roomRows.filter((r) => r.occupancy === 'inactive').length,
  };

  return {
    propertyId: branch.propertyId,
    propertySlug: branch.property?.slug ?? null,
    propertyName: branch.property?.name ?? null,
    branchId: branch.id,
    branchCode: branch.code,
    branchName: branch.name,
    asOf: new Date().toISOString(),
    summary,
    rooms: roomRows,
    activeBookings: activeBookings.map((b) => ({
      bookingId: b.id,
      bookingCode: b.bookingCode,
      roomId: b.roomId,
      roomCode: b.roomCode,
      checkIn: formatDateOnly(b.checkIn),
      checkOut: formatDateOnly(b.checkOut),
      status: b.status,
      holdExpiresAt: b.holdExpiresAt ? b.holdExpiresAt.toISOString() : null,
      guestName: b.guestName,
    })),
  };
}

module.exports = { getBranchOccupancy };
