const prisma = require('../config/prisma.config');

function getGlobalSettings() {
  return prisma.seoGlobalSettings.findUnique({ where: { id: 1 } });
}

function upsertGlobalSettings(data) {
  return prisma.seoGlobalSettings.upsert({
    where: { id: 1 },
    create: { id: 1, ...data },
    update: data,
  });
}

/** Cập nhật một phần — không dùng upsert (tránh thiếu field bắt buộc khi create). */
function patchGlobalSettings(data) {
  return prisma.seoGlobalSettings.update({
    where: { id: 1 },
    data,
  });
}

function listPageTemplates() {
  return prisma.seoPageTemplate.findMany({
    orderBy: [{ sortOrder: 'asc' }, { id: 'asc' }],
  });
}

function getPageTemplateByKey(pageKey) {
  return prisma.seoPageTemplate.findUnique({ where: { pageKey } });
}

function upsertPageTemplate(pageKey, data) {
  return prisma.seoPageTemplate.upsert({
    where: { pageKey },
    create: { pageKey, ...data },
    update: data,
  });
}

function createManyPageTemplates(rows) {
  return prisma.seoPageTemplate.createMany({ data: rows, skipDuplicates: true });
}

module.exports = {
  getGlobalSettings,
  upsertGlobalSettings,
  patchGlobalSettings,
  listPageTemplates,
  getPageTemplateByKey,
  upsertPageTemplate,
  createManyPageTemplates,
};
