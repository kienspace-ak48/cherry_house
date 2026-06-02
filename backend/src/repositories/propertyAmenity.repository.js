const prisma = require('../config/prisma.config');

/**
 * @param {{ propertyId?: number; amenityId?: number }} filters
 */
function findAll(filters = {}) {
  /** @type {import('../generated/prisma').Prisma.PropertyAmenityWhereInput} */
  const where = {};
  if (filters.propertyId) where.propertyId = filters.propertyId;
  if (filters.amenityId) where.amenityId = filters.amenityId;

  return prisma.propertyAmenity.findMany({
    where,
    include: { amenity: true, property: { select: { id: true, slug: true, name: true } } },
    orderBy: [{ propertyId: 'asc' }, { amenityId: 'asc' }],
  });
}

function findPair(propertyId, amenityId) {
  return prisma.propertyAmenity.findUnique({
    where: { propertyId_amenityId: { propertyId, amenityId } },
    include: { amenity: true, property: { select: { id: true, slug: true, name: true } } },
  });
}

function link(data) {
  return prisma.propertyAmenity.create({
    data,
    include: { amenity: true, property: { select: { id: true, slug: true, name: true } } },
  });
}

function unlink(propertyId, amenityId) {
  return prisma.propertyAmenity.delete({
    where: { propertyId_amenityId: { propertyId, amenityId } },
  });
}

module.exports = { findAll, findPair, link, unlink };
