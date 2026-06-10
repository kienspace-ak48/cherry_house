const prisma = require('../config/prisma.config');

function getSettings() {
  return prisma.chatBotSettings.findUnique({ where: { id: 1 } });
}

function upsertSettings(data) {
  return prisma.chatBotSettings.upsert({
    where: { id: 1 },
    create: { id: 1, ...data },
    update: data,
  });
}

module.exports = {
  getSettings,
  upsertSettings,
};
