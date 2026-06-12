const prisma = require('../config/prisma.config');

async function getSettings() {
  return prisma.promoPopupSettings.findUnique({
    where: { id: 1 },
    include: { promoCode: true },
  });
}

async function upsertSettings(data) {
  return prisma.promoPopupSettings.upsert({
    where: { id: 1 },
    create: { id: 1, ...data },
    update: data,
  });
}

module.exports = {
  getSettings,
  upsertSettings,
};
