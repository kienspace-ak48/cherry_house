const prisma = require('../config/prisma.config');

const contactSelect = {
  id: true,
  fullName: true,
  email: true,
  phone: true,
  message: true,
  status: true,
  adminNote: true,
  readAt: true,
  ipAddress: true,
  userAgent: true,
  createdAt: true,
  updatedAt: true,
};

function buildWhere(filters = {}) {
  /** @type {import('../generated/prisma').Prisma.ContactMessageWhereInput} */
  const where = {};
  if (filters.status) where.status = filters.status;
  if (filters.q) {
    where.OR = [
      { fullName: { contains: filters.q } },
      { email: { contains: filters.q } },
      { phone: { contains: filters.q } },
      { message: { contains: filters.q } },
    ];
  }
  return where;
}

function findAll(filters = {}) {
  return prisma.contactMessage.findMany({
    where: buildWhere(filters),
    select: contactSelect,
    orderBy: [{ createdAt: 'desc' }],
  });
}

function countAll(filters = {}) {
  return prisma.contactMessage.count({ where: buildWhere(filters) });
}

function countByStatus(status) {
  return prisma.contactMessage.count({ where: { status } });
}

function findById(id) {
  return prisma.contactMessage.findUnique({
    where: { id },
    select: contactSelect,
  });
}

function create(data) {
  return prisma.contactMessage.create({
    data,
    select: contactSelect,
  });
}

function update(id, data) {
  return prisma.contactMessage.update({
    where: { id },
    data,
    select: contactSelect,
  });
}

function remove(id) {
  return prisma.contactMessage.delete({
    where: { id },
    select: contactSelect,
  });
}

module.exports = {
  findAll,
  countAll,
  countByStatus,
  findById,
  create,
  update,
  remove,
  contactSelect,
};
