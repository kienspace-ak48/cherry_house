const prisma = require('../config/prisma.config');

const adminInclude = {
  branch: {
    select: {
      id: true,
      code: true,
      name: true,
      propertyId: true,
      property: { select: { id: true, name: true, city: true } },
    },
  },
  property: {
    select: { id: true, name: true, city: true, slug: true },
  },
};

function buildWhere(filters = {}) {
  /** @type {import('../generated/prisma').Prisma.AdminWhereInput} */
  const where = {};
  if (filters.role) where.role = filters.role;
  if (filters.branchId) where.branchId = filters.branchId;
  if (filters.propertyId) where.propertyId = filters.propertyId;
  if (filters.isActive !== undefined) where.isActive = filters.isActive;
  if (filters.q) {
    where.OR = [
      { fullName: { contains: filters.q } },
      { email: { contains: filters.q } },
    ];
  }
  return where;
}

function findAll(filters = {}) {
  return prisma.admin.findMany({
    where: buildWhere(filters),
    orderBy: [{ role: 'asc' }, { fullName: 'asc' }],
    include: adminInclude,
  });
}

function countAll(filters = {}) {
  return prisma.admin.count({ where: buildWhere(filters) });
}

function findById(id) {
  return prisma.admin.findUnique({
    where: { id },
    include: adminInclude,
  });
}

function findByEmail(email) {
  return prisma.admin.findUnique({
    where: { email },
    include: adminInclude,
  });
}

function create(data) {
  return prisma.admin.create({
    data,
    include: adminInclude,
  });
}

function update(id, data) {
  return prisma.admin.update({
    where: { id },
    data,
    include: adminInclude,
  });
}

module.exports = {
  findAll,
  countAll,
  findById,
  findByEmail,
  create,
  update,
  adminInclude,
};
