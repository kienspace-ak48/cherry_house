const prisma = require('../config/prisma.config');

/**
 * @param {{ city?: string; kind?: string; isActive?: boolean }} filters
 */
function findAll(filters = {}) {
  return prisma.property.findMany({
    where: buildWhere(filters),
    orderBy: [{ city: 'asc' }, { name: 'asc' }],
  });
}

const catalogListInclude = {
  gallery: { orderBy: { sortOrder: 'asc' } },
  amenities: { include: { amenity: true } },
  branches: {
    where: { isActive: true },
    orderBy: { name: 'asc' },
    include: { mapPin: true },
  },
};

const catalogDetailInclude = {
  ...catalogListInclude,
  branches: {
    where: { isActive: true },
    orderBy: { name: 'asc' },
    include: { mapPin: true },
  },
};

function findAllForCatalog(filters = {}) {
  return prisma.property.findMany({
    where: buildWhere(filters),
    orderBy: [{ city: 'asc' }, { name: 'asc' }],
    include: catalogListInclude,
  });
}

function findByIdForCatalog(id) {
  return prisma.property.findUnique({
    where: { id },
    include: catalogDetailInclude,
  });
}

function findBySlugForCatalog(slug) {
  return prisma.property.findUnique({
    where: { slug },
    include: catalogDetailInclude,
  });
}

function buildWhere(filters) {
  /** @type {import('../generated/prisma').Prisma.PropertyWhereInput} */
  const where = {};
  if (filters.city) where.city = filters.city;
  if (filters.kind) where.kind = filters.kind;
  if (filters.isActive !== undefined) where.isActive = filters.isActive;
  return where;
}

function findById(id) {
  return prisma.property.findUnique({
    where: { id },
  });
}

function findBySlug(slug) {
  return prisma.property.findUnique({
    where: { slug },
  });
}

function create(data) {
  return prisma.property.create({ data });
}

function update(id, data) {
  return prisma.property.update({
    where: { id },
    data,
  });
}

function remove(id) {
  return prisma.property.delete({
    where: { id },
  });
}

module.exports = {
  findAll,
  findAllForCatalog,
  findById,
  findByIdForCatalog,
  findBySlug,
  findBySlugForCatalog,
  create,
  update,
  remove,
};
