const prisma = require('../config/prisma.config');

function findAll(filters = {}) {
  /** @type {import('../generated/prisma').Prisma.MediaImageWhereInput} */
  const where = {};
  if (filters.folderId) where.folderId = filters.folderId;

  return prisma.mediaImage.findMany({
    where,
    orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
  });
}

function findByPath(path) {
  return prisma.mediaImage.findUnique({ where: { path } });
}

function findByFolderId(folderId) {
  return prisma.mediaImage.findMany({ where: { folderId } });
}

function create(data) {
  return prisma.mediaImage.create({ data });
}

function removeByPath(path) {
  return prisma.mediaImage.delete({ where: { path } });
}

function removeManyByFolderId(folderId) {
  return prisma.mediaImage.deleteMany({ where: { folderId } });
}

module.exports = {
  findAll,
  findByPath,
  findByFolderId,
  create,
  removeByPath,
  removeManyByFolderId,
};
