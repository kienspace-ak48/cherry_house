const prisma = require('../config/prisma.config');

function findAll() {
  return prisma.mediaFolder.findMany({
    orderBy: [{ name: 'asc' }, { id: 'asc' }],
  });
}

function findById(id) {
  return prisma.mediaFolder.findUnique({ where: { id } });
}

function create(data) {
  return prisma.mediaFolder.create({ data });
}

function remove(id) {
  return prisma.mediaFolder.delete({ where: { id } });
}

module.exports = { findAll, findById, create, remove };
