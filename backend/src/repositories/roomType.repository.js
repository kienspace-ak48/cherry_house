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

function findById(id) {
  return prisma.roomType.findUnique({ where: { id } });
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

module.exports = { findAll, findById, findBySlug, create, update, remove };
