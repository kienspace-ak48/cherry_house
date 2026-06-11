const prisma = require('../config/prisma.config');

/**
 * @param {{ isActive?: boolean; code?: string }} filters
 */
function findAll(filters = {}) {
  /** @type {import('../generated/prisma').Prisma.PromoCodeWhereInput} */
  const where = {};
  if (filters.isActive !== undefined) where.isActive = filters.isActive;
  if (filters.code) where.code = { contains: filters.code };

  return prisma.promoCode.findMany({
    where,
    orderBy: [{ code: 'asc' }],
  });
}

function findById(id) {
  return prisma.promoCode.findUnique({ where: { id } });
}

function findByCode(code) {
  return prisma.promoCode.findUnique({ where: { code } });
}

function create(data) {
  return prisma.promoCode.create({ data });
}

function update(id, data) {
  return prisma.promoCode.update({ where: { id }, data });
}

function remove(id) {
  return prisma.promoCode.delete({ where: { id } });
}

async function incrementUsedCountIfAvailable(code) {
  const affected = await prisma.$executeRaw`
    UPDATE promo_codes
    SET used_count = used_count + 1
    WHERE code = ${code}
      AND (max_uses IS NULL OR used_count < max_uses)
  `;
  if (!affected) return null;
  return prisma.promoCode.findUnique({ where: { code } });
}

module.exports = {
  findAll,
  findById,
  findByCode,
  create,
  update,
  remove,
  incrementUsedCountIfAvailable,
};
