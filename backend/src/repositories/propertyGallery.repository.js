const prisma = require('../config/prisma.config');

/**
 * @param {{ propertyId?: number }} filters
 */
function findAll(filters = {}) {
  /** @type {import('../generated/prisma').Prisma.PropertyGalleryWhereInput} */
  const where = {};
  if (filters.propertyId) where.propertyId = filters.propertyId;

  return prisma.propertyGallery.findMany({
    where,
    orderBy: [{ propertyId: 'asc' }, { sortOrder: 'asc' }, { id: 'asc' }],
  });
}

function findById(id) {
  return prisma.propertyGallery.findUnique({ where: { id } });
}

function create(data) {
  return prisma.propertyGallery.create({ data });
}

function update(id, data) {
  return prisma.propertyGallery.update({ where: { id }, data });
}

function remove(id) {
  return prisma.propertyGallery.delete({ where: { id } });
}

module.exports = { findAll, findById, create, update, remove };
