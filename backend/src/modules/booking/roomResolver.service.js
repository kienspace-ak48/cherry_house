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
    return prisma.inventoryRoom.findUnique({
      where: { id: room.id },
      include: roomContextInclude,
    });
  }

  const rooms = await prisma.inventoryRoom.findMany({
    where: { branchId: branch.id },
    include: roomContextInclude,
  });
  const match = rooms.find((r) => toDetailSlug(r.code) === detailSlug);
  if (!match) throw httpError('Room not found', 404);

  return match;
}

module.exports = { resolveRoomRef };
