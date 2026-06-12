const prisma = require('../../config/prisma.config');
const propertyRepository = require('../../repositories/property.repository');
const branchRepository = require('../../repositories/branch.repository');
const inventoryRoomRepository = require('../../repositories/inventoryRoom.repository');
const { httpError } = require('../../utils/http');
const { toDetailSlug } = require('./booking.constants');

const roomContextInclude = {
  branch: { include: { property: true } },
  roomType: true,
};

/**
 * Chặn đặt phòng khi cơ sở / chi nhánh / phòng đã ngừng hoạt động.
 * Loại phòng chỉ là nhãn — không chặn booking.
 * @param {import('../../generated/prisma').InventoryRoom & {
 *   branch?: { isActive?: boolean; property?: { isActive?: boolean } | null } | null;
 * }} room
 */
function assertRoomBookable(room) {
  if (!room) throw httpError('Room not found', 404);

  const property = room.branch?.property;
  const branch = room.branch;

  if (!property || property.isActive === false) {
    throw httpError('Cơ sở hiện không nhận đặt phòng.', 409);
  }
  if (!branch || branch.isActive === false) {
    throw httpError('Chi nhánh hiện không nhận đặt phòng.', 409);
  }
  if (!room.isActive) {
    throw httpError('Phòng hiện không hoạt động.', 409);
  }
}

/**
 * @param {{
 *   roomId?: number | string;
 *   propertySlug?: string;
 *   branchCode?: string;
 *   roomCode?: string;
 *   detailSlug?: string;
 * }} ref
 */
async function resolveRoomRef(ref = {}) {
  if (ref.roomId !== undefined && ref.roomId !== null && ref.roomId !== '') {
    const roomId = Number(ref.roomId);
    if (!Number.isInteger(roomId) || roomId < 1) {
      throw httpError('roomId must be a positive integer');
    }
    const room = await prisma.inventoryRoom.findUnique({
      where: { id: roomId },
      include: roomContextInclude,
    });
    if (!room) throw httpError('Room not found', 404);
    assertRoomBookable(room);
    return room;
  }

  const propertySlug =
    typeof ref.propertySlug === 'string' ? ref.propertySlug.trim() : '';
  const branchCode = typeof ref.branchCode === 'string' ? ref.branchCode.trim() : '';
  const roomCode = typeof ref.roomCode === 'string' ? ref.roomCode.trim() : '';
  const detailSlug = typeof ref.detailSlug === 'string' ? ref.detailSlug.trim() : '';

  if (!propertySlug || !branchCode) {
    throw httpError('propertySlug and branchCode are required when roomId is omitted');
  }
  if (!roomCode && !detailSlug) {
    throw httpError('roomCode or detailSlug is required when roomId is omitted');
  }

  const property = await propertyRepository.findBySlug(propertySlug);
  if (!property) throw httpError('Property not found', 404);

  const branch = await branchRepository.findByPropertyAndCode(property.id, branchCode);
  if (!branch) throw httpError('Branch not found', 404);

  if (roomCode) {
    const room = await inventoryRoomRepository.findByBranchAndCode(branch.id, roomCode);
    if (!room) throw httpError('Room not found', 404);
    const full = await prisma.inventoryRoom.findUnique({
      where: { id: room.id },
      include: roomContextInclude,
    });
    if (!full) throw httpError('Room not found', 404);
    assertRoomBookable(full);
    return full;
  }

  const rooms = await prisma.inventoryRoom.findMany({
    where: { branchId: branch.id },
    include: roomContextInclude,
  });
  const match = rooms.find((r) => toDetailSlug(r.code) === detailSlug);
  if (!match) throw httpError('Room not found', 404);

  assertRoomBookable(match);
  return match;
}

module.exports = { resolveRoomRef, assertRoomBookable, roomContextInclude };
