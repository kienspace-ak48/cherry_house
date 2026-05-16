const prisma = require('../config/prisma.config');

function findAll() {
  return prisma.room.findMany({
    orderBy: { id: 'asc' },
  });
}

function findById(id) {
  return prisma.room.findUnique({
    where: { id },
  });
}

function create(data) {
  return prisma.room.create({
    data,
  });
}

function update(id, data) {
  return prisma.room.update({
    where: { id },
    data,
  });
}

function remove(id) {
  return prisma.room.delete({
    where: { id },
  });
}

module.exports = {
  findAll,
  findById,
  create,
  update,
  remove,
};
