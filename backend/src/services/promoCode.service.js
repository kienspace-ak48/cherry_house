const promoCodeRepository = require('../repositories/promoCode.repository');
const { httpError, parseId, parseOptionalBoolean } = require('../utils/http');
const { mapPrismaError } = require('../utils/crud');

const DISCOUNT_TYPES = new Set(['percent', 'fixed_amount']);

function normalizeCode(raw) {
  const code = typeof raw === 'string' ? raw.trim().toUpperCase() : '';
  if (!code) throw httpError('code is required');
  return code;
}

function parseCode(raw) {
  const code = typeof raw === 'string' ? raw.trim() : '';
  if (!code) throw httpError('Invalid promo code');
  return code.toUpperCase();
}

function parseDate(raw, label) {
  const date = raw instanceof Date ? raw : new Date(raw);
  if (Number.isNaN(date.getTime())) throw httpError(`${label} must be a valid date`);
  return date;
}

function parseDiscountType(raw) {
  const type = typeof raw === 'string' ? raw.trim() : 'percent';
  if (!DISCOUNT_TYPES.has(type)) {
    throw httpError('discountType must be percent or fixed_amount');
  }
  return type;
}

function startOfToday() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

function isDateInRange(validFrom, validTo, today = startOfToday()) {
  const from = new Date(validFrom);
  const to = new Date(validTo);
  from.setHours(0, 0, 0, 0);
  to.setHours(23, 59, 59, 999);
  return today >= from && today <= to;
}

function computeDiscountVnd(promo, subtotalVnd) {
  const subtotal = Math.max(0, Math.round(subtotalVnd));
  if (promo.discountType === 'fixed_amount') {
    const amount = Number(promo.discountAmountVnd || 0);
    return Math.min(amount, subtotal);
  }
  const percent = Number(promo.discountPercent || 0);
  return Math.round((subtotal * percent) / 100);
}

function assertDiscountFields(discountType, body) {
  if (discountType === 'percent') {
    const discountPercent = Number(body.discountPercent);
    if (!Number.isInteger(discountPercent) || discountPercent < 1 || discountPercent > 100) {
      throw httpError('discountPercent must be an integer between 1 and 100');
    }
    return { discountPercent, discountAmountVnd: null };
  }

  const discountAmountVnd = Number(body.discountAmountVnd);
  if (!Number.isInteger(discountAmountVnd) || discountAmountVnd < 1) {
    throw httpError('discountAmountVnd must be a positive integer');
  }
  return { discountPercent: null, discountAmountVnd };
}

function parseListFilters(query) {
  const filters = { isActive: parseOptionalBoolean(query.isActive) };
  if (query.code) filters.code = String(query.code).trim().toUpperCase();
  return filters;
}

function assertCreatePayload(body) {
  const code = normalizeCode(body.code);
  const discountType = parseDiscountType(body.discountType);
  const { discountPercent, discountAmountVnd } = assertDiscountFields(discountType, body);

  const validFrom = parseDate(body.validFrom, 'validFrom');
  const validTo = parseDate(body.validTo, 'validTo');
  if (validTo < validFrom) throw httpError('validTo must be on or after validFrom');

  const maxUses =
    body.maxUses !== undefined && body.maxUses !== null && body.maxUses !== ''
      ? Number(body.maxUses)
      : null;
  if (maxUses !== null && (!Number.isInteger(maxUses) || maxUses < 1)) {
    throw httpError('maxUses must be a positive integer');
  }

  const minSubtotalVnd =
    body.minSubtotalVnd !== undefined && body.minSubtotalVnd !== null
      ? Number(body.minSubtotalVnd)
      : 0;
  if (!Number.isInteger(minSubtotalVnd) || minSubtotalVnd < 0) {
    throw httpError('minSubtotalVnd must be a non-negative integer');
  }

  const description =
    body.description !== undefined && body.description !== null
      ? String(body.description).trim() || null
      : null;

  return {
    code,
    discountType,
    discountPercent,
    discountAmountVnd,
    minSubtotalVnd,
    description,
    validFrom,
    validTo,
    maxUses,
    usedCount: Number.isInteger(body.usedCount) ? body.usedCount : 0,
    isActive: body.isActive !== undefined ? Boolean(body.isActive) : true,
  };
}

function buildUpdatePayload(body) {
  const data = {};
  if (body.code !== undefined) data.code = normalizeCode(body.code);

  const discountType =
    body.discountType !== undefined ? parseDiscountType(body.discountType) : undefined;

  if (discountType !== undefined) {
    data.discountType = discountType;
    const fields = assertDiscountFields(discountType, body);
    data.discountPercent = fields.discountPercent;
    data.discountAmountVnd = fields.discountAmountVnd;
  } else if (body.discountPercent !== undefined || body.discountAmountVnd !== undefined) {
    throw httpError('discountType is required when updating discount values');
  }

  if (body.validFrom !== undefined) data.validFrom = parseDate(body.validFrom, 'validFrom');
  if (body.validTo !== undefined) data.validTo = parseDate(body.validTo, 'validTo');
  if (body.minSubtotalVnd !== undefined) {
    const minSubtotalVnd = Number(body.minSubtotalVnd);
    if (!Number.isInteger(minSubtotalVnd) || minSubtotalVnd < 0) {
      throw httpError('minSubtotalVnd must be a non-negative integer');
    }
    data.minSubtotalVnd = minSubtotalVnd;
  }
  if (body.description !== undefined) {
    data.description = body.description === null ? null : String(body.description).trim() || null;
  }
  if (body.maxUses !== undefined) {
    if (body.maxUses === null || body.maxUses === '') {
      data.maxUses = null;
    } else {
      const maxUses = Number(body.maxUses);
      if (!Number.isInteger(maxUses) || maxUses < 1) {
        throw httpError('maxUses must be a positive integer');
      }
      data.maxUses = maxUses;
    }
  }
  if (body.usedCount !== undefined) {
    const usedCount = Number(body.usedCount);
    if (!Number.isInteger(usedCount) || usedCount < 0) {
      throw httpError('usedCount must be a non-negative integer');
    }
    data.usedCount = usedCount;
  }
  if (body.isActive !== undefined) data.isActive = Boolean(body.isActive);
  if (Object.keys(data).length === 0) throw httpError('No fields to update');
  return data;
}

function parseAdminFormBody(body) {
  const isActive = body.isActive === 'on' || body.isActive === true || body.isActive === '1';
  return assertCreatePayload({
    ...body,
    isActive,
  });
}

function parseAdminUpdateBody(body) {
  const data = buildUpdatePayload(body);
  if (body.isActive !== undefined) {
    data.isActive = body.isActive === 'on' || body.isActive === true || body.isActive === '1';
  }
  return data;
}

/**
 * @param {string} codeRaw
 * @param {number} subtotalVnd
 */
async function validateAndApply(codeRaw, subtotalVnd) {
  const code = parseCode(codeRaw);
  const subtotal = Math.max(0, Math.round(Number(subtotalVnd) || 0));

  const promo = await promoCodeRepository.findByCode(code);
  if (!promo) {
    throw httpError('Mã giảm giá không tồn tại hoặc không hợp lệ', 400);
  }
  if (!promo.isActive) {
    throw httpError('Mã giảm giá đã ngừng áp dụng', 400);
  }
  if (!isDateInRange(promo.validFrom, promo.validTo)) {
    throw httpError('Mã giảm giá đã hết hạn hoặc chưa có hiệu lực', 400);
  }
  if (promo.maxUses != null && promo.usedCount >= promo.maxUses) {
    throw httpError('Mã giảm giá đã hết lượt sử dụng', 400);
  }
  if (subtotal < (promo.minSubtotalVnd || 0)) {
    throw httpError(
      `Đơn tối thiểu ${Number(promo.minSubtotalVnd || 0).toLocaleString('vi-VN')}đ để dùng mã này`,
      400,
    );
  }

  const discountVnd = computeDiscountVnd(promo, subtotal);
  const totalVnd = Math.max(0, subtotal - discountVnd);

  return {
    id: promo.id,
    code: promo.code,
    discountType: promo.discountType,
    discountPercent: promo.discountPercent,
    discountAmountVnd: promo.discountAmountVnd,
    minSubtotalVnd: promo.minSubtotalVnd,
    description: promo.description,
    subtotalVnd: subtotal,
    discountVnd,
    totalVnd,
  };
}

async function list(query = {}) {
  return promoCodeRepository.findAll(parseListFilters(query));
}

async function getById(idRaw) {
  return promoCodeRepository.findById(parseId(idRaw));
}

async function getByCode(codeRaw) {
  return promoCodeRepository.findByCode(parseCode(codeRaw));
}

async function create(body) {
  try {
    return await promoCodeRepository.create(assertCreatePayload(body));
  } catch (error) {
    mapPrismaError(error, 'Promo code not found');
  }
}

async function createFromAdmin(body) {
  return create(parseAdminFormBody(body));
}

async function update(idRaw, body) {
  const id = parseId(idRaw);
  try {
    return await promoCodeRepository.update(id, buildUpdatePayload(body));
  } catch (error) {
    mapPrismaError(error, 'Promo code not found');
  }
}

async function updateFromAdmin(idRaw, body) {
  const id = parseId(idRaw);
  try {
    return await promoCodeRepository.update(id, parseAdminUpdateBody(body));
  } catch (error) {
    mapPrismaError(error, 'Promo code not found');
  }
}

async function remove(idRaw) {
  const id = parseId(idRaw);
  try {
    return await promoCodeRepository.remove(id);
  } catch (error) {
    mapPrismaError(error, 'Promo code not found');
  }
}

async function redeemByCode(codeRaw) {
  const code = parseCode(codeRaw);
  const updated = await promoCodeRepository.incrementUsedCountIfAvailable(code);
  if (!updated) {
    console.warn(`[promo] redeem skipped or race for code ${code}`);
  }
  return updated;
}

module.exports = {
  list,
  getById,
  getByCode,
  create,
  createFromAdmin,
  update,
  updateFromAdmin,
  remove,
  validateAndApply,
  redeemByCode,
  DISCOUNT_TYPES: [...DISCOUNT_TYPES],
};
