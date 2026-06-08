const prisma = require('../config/prisma.config');

function upsert(data) {
  return prisma.registrationOtp.upsert({
    where: { email: data.email },
    update: data,
    create: data,
  });
}

function findByEmail(email) {
  return prisma.registrationOtp.findUnique({ where: { email } });
}

function removeByEmail(email) {
  return prisma.registrationOtp.delete({ where: { email } }).catch(() => null);
}

function incrementAttempts(id, attempts) {
  return prisma.registrationOtp.update({
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
