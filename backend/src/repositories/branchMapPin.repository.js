const prisma = require('../config/prisma.config');

/**
 * @param {{ branchId?: number }} filters
 */
function findAll(filters = {}) {
  /** @type {import('../generated/prisma').Prisma.BranchMapPinWhereInput} */
  const where = {};
  if (filters.branchId) where.branchId = filters.branchId;

  return prisma.branchMapPin.findMany({
    where,
    orderBy: [{ branchId: 'asc' }],
    include: { branch: { select: { id: true, code: true, name: true, propertyId: true } } },
  });
}

function findById(id) {
  return prisma.branchMapPin.findUnique({
    where: { id },
    include: { branch: { select: { id: true, code: true, name: true, propertyId: true } } },
  });
}

function findByBranchId(branchId) {
  return prisma.branchMapPin.findUnique({
    where: { branchId },
    include: { branch: { select: { id: true, code: true, name: true, propertyId: true } } },
  });
}

function create(data) {
  return prisma.branchMapPin.create({
    data,
    include: { branch: { select: { id: true, code: true, name: true, propertyId: true } } },
  });
}

function update(id, data) {
  return prisma.branchMapPin.update({
    where: { id },
    data,
    include: { branch: { select: { id: true, code: true, name: true, propertyId: true } } },
  });
}

function remove(id) {
  return prisma.branchMapPin.delete({ where: { id } });
}

module.exports = { findAll, findById, findByBranchId, create, update, remove };
