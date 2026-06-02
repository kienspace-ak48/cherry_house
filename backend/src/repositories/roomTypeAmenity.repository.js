const prisma = require('../config/prisma.config');

/**
 * @param {{ roomTypeId?: number; amenityId?: number }} filters
 */
function findAll(filters = {}) {
  /** @type {import('../generated/prisma').Prisma.RoomTypeAmenityWhereInput} */
  const where = {};
  if (filters.roomTypeId) where.roomTypeId = filters.roomTypeId;
  if (filters.amenityId) where.amenityId = filters.amenityId;

  return prisma.roomTypeAmenity.findMany({
    where,
    include: { amenity: true, roomType: { select: { id: true, slug: true, title: true } } },
    orderBy: [{ roomTypeId: 'asc' }, { amenityId: 'asc' }],
  });
}

function findPair(roomTypeId, amenityId) {
  return prisma.roomTypeAmenity.findUnique({
    where: { roomTypeId_amenityId: { roomTypeId, amenityId } },
    include: { amenity: true, roomType: { select: { id: true, slug: true, title: true } } },
  });
}

function link(data) {
  return prisma.roomTypeAmenity.create({
    data,
    include: { amenity: true, roomType: { select: { id: true, slug: true, title: true } } },
  });
}

function unlink(roomTypeId, amenityId) {
  return prisma.roomTypeAmenity.delete({
    where: { roomTypeId_amenityId: { roomTypeId, amenityId } },
  });
}

module.exports = { findAll, findPair, link, unlink };
