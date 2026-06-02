const prisma = require('../config/prisma.config');

const userSelect = {
  id: true,
  email: true,
  fullName: true,
  phone: true,
  membershipTier: true,
  isActive: true,
  createdAt: true,
  updatedAt: true,
};

/**
 * @param {{ membershipTier?: string; isActive?: boolean; email?: string }} filters
 */
function findAll(filters = {}) {
  /** @type {import('../generated/prisma').Prisma.UserWhereInput} */
  const where = {};
  if (filters.membershipTier) where.membershipTier = filters.membershipTier;
  if (filters.isActive !== undefined) where.isActive = filters.isActive;
  if (filters.email) where.email = { contains: filters.email };

  return prisma.user.findMany({
    where,
    select: userSelect,
    orderBy: [{ fullName: 'asc' }],
  });
}

function findById(id) {
  return prisma.user.findUnique({ where: { id }, select: userSelect });
}

function findByEmail(email) {
  return prisma.user.findUnique({ where: { email }, select: userSelect });
}

function create(data) {
  return prisma.user.create({ data, select: userSelect });
  
}

function update(id, data) {
  return prisma.user.update({ where: { id }, data, select: userSelect });
}

function remove(id) {
  return prisma.user.delete({ where: { id }, select: userSelect });
}

module.exports = { findAll, findById, findByEmail, create, update, remove };
