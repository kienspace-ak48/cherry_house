const prisma = require('../config/prisma.config');

const VPS_SETUP_HINT =
  'Trên VPS chạy: cd backend && npm install && npm run db:migrate && pm2 restart server';

function getDelegate() {
  return prisma?.homeHeroSettings ?? null;
}

function isMissingTableError(err) {
  return err?.code === 'P2021' || err?.code === 'P1014';
}

async function getSettings() {
  const delegate = getDelegate();
  if (!delegate) return null;

  try {
    return await delegate.findUnique({ where: { id: 1 } });
  } catch (err) {
    if (isMissingTableError(err)) return null;
    throw err;
  }
}

async function upsertSettings(data) {
  const delegate = getDelegate();
  if (!delegate) {
    const err = new Error(`Prisma client chưa có model homeHeroSettings. ${VPS_SETUP_HINT}`);
    err.code = 'HOME_HERO_PRISMA_NOT_GENERATED';
    throw err;
  }

  try {
    return await delegate.upsert({
      where: { id: 1 },
      create: { id: 1, ...data },
      update: data,
    });
  } catch (err) {
    if (isMissingTableError(err)) {
      const tableErr = new Error(`Bảng home_hero_settings chưa tồn tại. ${VPS_SETUP_HINT}`);
      tableErr.code = 'HOME_HERO_TABLE_MISSING';
      throw tableErr;
    }
    throw err;
  }
}

module.exports = {
  getSettings,
  upsertSettings,
};
