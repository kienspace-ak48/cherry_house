const prisma = require('../config/prisma.config');

function findValidByHash(tokenHash) {
  const now = new Date();
  return prisma.refreshToken.findFirst({
    where: {
      tokenHash,
      revokedAt: null,
      expiresAt: { gt: now },
    },
  });
}

function create(data) {
  return prisma.refreshToken.create({ data });
}

function revokeById(id) {
  return prisma.refreshToken.update({
    where: { id },
    data: { revokedAt: new Date() },
  });
}

function revokeAllForUser(userId) {
  return prisma.refreshToken.updateMany({
    where: { userId, revokedAt: null },
    data: { revokedAt: new Date() },
  });
}

function revokeAllForAdmin(adminId) {
  return prisma.refreshToken.updateMany({
    where: { adminId, revokedAt: null },
    data: { revokedAt: new Date() },
  });
}

module.exports = {
  findValidByHash,
  create,
  revokeById,
  revokeAllForUser,
  revokeAllForAdmin,
};
