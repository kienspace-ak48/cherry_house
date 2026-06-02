const prisma = require('../config/prisma.config');

/**
 * @param {{ roomTypeId?: number }} filters
 */
function findAll(filters = {}) {
  /** @type {import('../generated/prisma').Prisma.RoomTypeGalleryWhereInput} */
  const where = {};
  if (filters.roomTypeId) where.roomTypeId = filters.roomTypeId;

  return prisma.roomTypeGallery.findMany({
    where,
    orderBy: [{ roomTypeId: 'asc' }, { sortOrder: 'asc' }, { id: 'asc' }],
  });
}

function findById(id) {
  return prisma.roomTypeGallery.findUnique({ where: { id } });
}

function create(data) {
  return prisma.roomTypeGallery.create({ data });
}

function update(id, data) {
  return prisma.roomTypeGallery.update({ where: { id }, data });
}

function remove(id) {
  return prisma.roomTypeGallery.delete({ where: { id } });
}

module.exports = { findAll, findById, create, update, remove };
