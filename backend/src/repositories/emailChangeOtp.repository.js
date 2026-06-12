const prisma = require('../config/prisma.config');

function upsertByUserId(data) {
  return prisma.emailChangeOtp.upsert({
    where: { userId: data.userId },
    update: data,
    create: data,
  });
}

function findByUserId(userId) {
  return prisma.emailChangeOtp.findUnique({ where: { userId } });
}

function removeByUserId(userId) {
  return prisma.emailChangeOtp.delete({ where: { userId } }).catch(() => null);
}

function incrementAttempts(id, attempts) {
  return prisma.emailChangeOtp.update({
    where: { id },
    data: { attempts },
  });
}

module.exports = {
  upsertByUserId,
  findByUserId,
  removeByUserId,
  incrementAttempts,
};
