const prisma = require('../config/prisma.config');

/**
 * @param {{ propertyId?: number; code?: string; isActive?: boolean }} filters
 */
function findAll(filters = {}) {
  /** @type {import('../generated/prisma').Prisma.BranchWhereInput} */
  const where = {};

  if (filters.propertyId) where.propertyId = filters.propertyId;
  if (filters.code) where.code = filters.code;
  if (filters.isActive !== undefined) where.isActive = filters.isActive;

  return prisma.branch.findMany({
    where,
    orderBy: [{ propertyId: 'asc' }, { name: 'asc' }],
    include: { property: { select: { id: true, slug: true, name: true, city: true } } },
  });
}

function findAllForCatalog(filters = {}) {
  /** @type {import('../generated/prisma').Prisma.BranchWhereInput} */
  const where = {};
  if (filters.propertyId) where.propertyId = filters.propertyId;
  if (filters.code) where.code = filters.code;
  if (filters.isActive !== undefined) where.isActive = filters.isActive;

  return prisma.branch.findMany({
    where,
    orderBy: [{ propertyId: 'asc' }, { name: 'asc' }],
    include: {
      property: { select: { id: true, slug: true, name: true, city: true } },
      mapPin: true,
    },
  });
}

function findByIdForCatalog(id) {
  return prisma.branch.findUnique({
    where: { id },
    include: {
      property: { select: { id: true, slug: true, name: true, city: true, region: true } },
      mapPin: true,
    },
  });
}

function findById(id) {
  return prisma.branch.findUnique({
    where: { id },
    include: {
      property: { select: { id: true, slug: true, name: true, city: true } },
      mapPin: true,
    },
  });
}

function findByPropertyAndCode(propertyId, code) {
  return prisma.branch.findFirst({
    where: { propertyId, code },
    include: { property: { select: { id: true, slug: true, name: true, city: true } } },
  });
}

function create(data) {
  return prisma.branch.create({
    data,
    include: { property: { select: { id: true, slug: true, name: true, city: true } } },
  });
}

function update(id, data) {
  return prisma.branch.update({
    where: { id },
    data,
    include: { property: { select: { id: true, slug: true, name: true, city: true } } },
  });
}

function remove(id) {
  return prisma.branch.delete({ where: { id } });
}

function countBookings(branchId) {
  return prisma.booking.count({ where: { branchId } });
}

async function countBookingsByBranchIds(branchIds) {
  if (!branchIds.length) return new Map();

  const rows = await prisma.booking.groupBy({
    by: ['branchId'],
    where: { branchId: { in: branchIds } },
    _count: { _all: true },
  });

  return new Map(rows.map((row) => [row.branchId, row._count._all]));
}

module.exports = {
  findAll,
  findAllForCatalog,
  findById,
  findByIdForCatalog,
  findByPropertyAndCode,
  create,
  update,
  remove,
  countBookings,
  countBookingsByBranchIds,
};
