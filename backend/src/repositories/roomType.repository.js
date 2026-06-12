const prisma = require('../config/prisma.config');

/**
 * @param {{ category?: string; isActive?: boolean }} filters
 */
function findAll(filters = {}) {
  /** @type {import('../generated/prisma').Prisma.RoomTypeWhereInput} */
  const where = {};
  if (filters.category) where.category = filters.category;
  if (filters.isActive !== undefined) where.isActive = filters.isActive;

  return prisma.roomType.findMany({
    where,
    orderBy: [{ category: 'asc' }, { title: 'asc' }],
  });
}

function findAllForAdminCatalog() {
  return prisma.roomType.findMany({
    orderBy: [{ category: 'asc' }, { title: 'asc' }],
    include: {
      gallery: { orderBy: [{ sortOrder: 'asc' }, { id: 'asc' }] },
      amenities: { include: { amenity: true } },
    },
  });
}

function findById(id) {
  return prisma.roomType.findUnique({ where: { id } });
}

function findByIdWithRelations(id) {
  return prisma.roomType.findUnique({
    where: { id },
    include: {
      gallery: { orderBy: [{ sortOrder: 'asc' }, { id: 'asc' }] },
      amenities: { include: { amenity: true } },
      _count: { select: { rooms: true } },
    },
  });
}

function findBySlug(slug) {
  return prisma.roomType.findUnique({ where: { slug } });
}

function create(data) {
  return prisma.roomType.create({ data });
}

function update(id, data) {
  return prisma.roomType.update({ where: { id }, data });
}

function remove(id) {
  return prisma.roomType.delete({ where: { id } });
}

function countRooms(roomTypeId) {
  return prisma.inventoryRoom.count({ where: { roomTypeId } });
}

async function countRoomsByRoomTypeIds(roomTypeIds) {
  if (!roomTypeIds.length) return new Map();

  const rows = await prisma.inventoryRoom.groupBy({
    by: ['roomTypeId'],
    where: { roomTypeId: { in: roomTypeIds } },
    _count: { _all: true },
  });

  return new Map(rows.map((row) => [row.roomTypeId, row._count._all]));
}

module.exports = {
  findAll,
  findAllForAdminCatalog,
  findById,
  findByIdWithRelations,
  findBySlug,
  create,
  update,
  remove,
  countRooms,
  countRoomsByRoomTypeIds,
};
