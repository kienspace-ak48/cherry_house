const prisma = require('../config/prisma.config');

/**
 * @param {{ label?: string }} filters
 */
function findAll(filters = {}) {
  /** @type {import('../generated/prisma').Prisma.AmenityWhereInput} */
  const where = {};
  if (filters.label) where.label = { contains: filters.label };

  return prisma.amenity.findMany({
    where,
    orderBy: [{ label: 'asc' }],
  });
}

function findById(id) {
  return prisma.amenity.findUnique({ where: { id } });
}

function create(data) {
  return prisma.amenity.create({ data });
}

function update(id, data) {
  return prisma.amenity.update({ where: { id }, data });
}

function remove(id) {
  return prisma.amenity.delete({ where: { id } });
}

module.exports = { findAll, findById, create, update, remove };
