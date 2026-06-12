const prisma = require('../config/prisma.config');

function upsert(data) {
  return prisma.passwordResetOtp.upsert({
    where: { email: data.email },
    update: data,
    create: data,
  });
}

function findByEmail(email) {
  return prisma.passwordResetOtp.findUnique({ where: { email } });
}

function removeByEmail(email) {
  return prisma.passwordResetOtp.delete({ where: { email } }).catch(() => null);
}

function incrementAttempts(id, attempts) {
  return prisma.passwordResetOtp.update({
    where: { id },
    data: { attempts },
  });
}

module.exports = {
  upsert,
  findByEmail,
  removeByEmail,
  incrementAttempts,
};
