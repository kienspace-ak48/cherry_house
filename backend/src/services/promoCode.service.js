const promoCodeRepository = require('../repositories/promoCode.repository');
const { httpError, parseId, parseOptionalBoolean } = require('../utils/http');
const { mapPrismaError } = require('../utils/crud');

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

function parseListFilters(query) {
  const filters = { isActive: parseOptionalBoolean(query.isActive) };
  if (query.code) filters.code = String(query.code).trim().toUpperCase();
  return filters;
}

function assertCreatePayload(body) {
  const code = normalizeCode(body.code);
  const discountPercent = Number(body.discountPercent);
  if (!Number.isInteger(discountPercent) || discountPercent < 1 || discountPercent > 100) {
    throw httpError('discountPercent must be an integer between 1 and 100');
  }

  const validFrom = parseDate(body.validFrom, 'validFrom');
  const validTo = parseDate(body.validTo, 'validTo');
  if (validTo < validFrom) throw httpError('validTo must be on or after validFrom');

  const maxUses =
    body.maxUses !== undefined && body.maxUses !== null ? Number(body.maxUses) : null;
  if (maxUses !== null && (!Number.isInteger(maxUses) || maxUses < 1)) {
    throw httpError('maxUses must be a positive integer');
  }

  return {
    code,
    discountPercent,
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
  if (body.discountPercent !== undefined) {
    const discountPercent = Number(body.discountPercent);
    if (!Number.isInteger(discountPercent) || discountPercent < 1 || discountPercent > 100) {
      throw httpError('discountPercent must be an integer between 1 and 100');
    }
    data.discountPercent = discountPercent;
  }
  if (body.validFrom !== undefined) data.validFrom = parseDate(body.validFrom, 'validFrom');
  if (body.validTo !== undefined) data.validTo = parseDate(body.validTo, 'validTo');
  if (body.maxUses !== undefined) {
    if (body.maxUses === null) {
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

async function update(idRaw, body) {
  const id = parseId(idRaw);
  try {
    return await promoCodeRepository.update(id, buildUpdatePayload(body));
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

module.exports = { list, getById, getByCode, create, update, remove };
