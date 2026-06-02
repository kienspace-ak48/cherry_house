const roomTypeRepository = require('../repositories/roomType.repository');
const { httpError, parseId, parseOptionalBoolean } = require('../utils/http');
const { mapPrismaError } = require('../utils/crud');

const ROOM_CATEGORIES = new Set(['Standard', 'Deluxe', 'Suite', 'Penthouse']);

function normalizeSlug(raw) {
  const slug = typeof raw === 'string' ? raw.trim().toLowerCase() : '';
  if (!slug || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
    throw httpError('slug is required (lowercase letters, numbers, hyphens)');
  }
  return slug;
}

function parseSlug(raw) {
  const slug = typeof raw === 'string' ? raw.trim() : '';
  if (!slug) throw httpError('Invalid room type slug');
  return slug;
}

function parseCategory(raw) {
  const category = typeof raw === 'string' ? raw.trim() : '';
  if (!ROOM_CATEGORIES.has(category)) {
    throw httpError(`Invalid category. Allowed: ${[...ROOM_CATEGORIES].join(', ')}`);
  }
  return category;
}

function parseListFilters(query) {
  const filters = { isActive: parseOptionalBoolean(query.isActive) };
  if (query.category) filters.category = parseCategory(String(query.category));
  return filters;
}

function assertCreatePayload(body) {
  const slug = normalizeSlug(body.slug);
  const badge = typeof body.badge === 'string' ? body.badge.trim() : '';
  const title = typeof body.title === 'string' ? body.title.trim() : '';
  const category = parseCategory(body.category);
  const bedLabel = typeof body.bedLabel === 'string' ? body.bedLabel.trim() : '';
  const capacityLabel =
    typeof body.capacityLabel === 'string' ? body.capacityLabel.trim() : '';

  if (!badge) throw httpError('badge is required');
  if (!title) throw httpError('title is required');
  if (!bedLabel) throw httpError('bedLabel is required');
  if (!capacityLabel) throw httpError('capacityLabel is required');

  const areaSqm = Number(body.areaSqm);
  const basePriceVnd = Number(body.basePriceVnd);
  if (!Number.isInteger(areaSqm) || areaSqm < 1) {
    throw httpError('areaSqm must be a positive integer');
  }
  if (!Number.isInteger(basePriceVnd) || basePriceVnd < 0) {
    throw httpError('basePriceVnd must be a non-negative integer');
  }

  return {
    slug,
    badge,
    title,
    category,
    areaSqm,
    bedLabel,
    capacityLabel,
    basePriceVnd,
    checkInTime:
      body.checkInTime !== undefined ? String(body.checkInTime).trim() : '14:00',
    checkOutTime:
      body.checkOutTime !== undefined ? String(body.checkOutTime).trim() : '12:00',
    paragraphs: Array.isArray(body.paragraphs) ? body.paragraphs : undefined,
    policyBullets: Array.isArray(body.policyBullets) ? body.policyBullets : undefined,
    isActive: body.isActive !== undefined ? Boolean(body.isActive) : true,
  };
}

function buildUpdatePayload(body) {
  const data = {};
  if (body.slug !== undefined) data.slug = normalizeSlug(body.slug);
  if (body.badge !== undefined) {
    const badge = String(body.badge).trim();
    if (!badge) throw httpError('badge cannot be empty');
    data.badge = badge;
  }
  if (body.title !== undefined) {
    const title = String(body.title).trim();
    if (!title) throw httpError('title cannot be empty');
    data.title = title;
  }
  if (body.category !== undefined) data.category = parseCategory(body.category);
  if (body.areaSqm !== undefined) {
    const areaSqm = Number(body.areaSqm);
    if (!Number.isInteger(areaSqm) || areaSqm < 1) {
      throw httpError('areaSqm must be a positive integer');
    }
    data.areaSqm = areaSqm;
  }
  if (body.bedLabel !== undefined) {
    const bedLabel = String(body.bedLabel).trim();
    if (!bedLabel) throw httpError('bedLabel cannot be empty');
    data.bedLabel = bedLabel;
  }
  if (body.capacityLabel !== undefined) {
    const capacityLabel = String(body.capacityLabel).trim();
    if (!capacityLabel) throw httpError('capacityLabel cannot be empty');
    data.capacityLabel = capacityLabel;
  }
  if (body.basePriceVnd !== undefined) {
    const basePriceVnd = Number(body.basePriceVnd);
    if (!Number.isInteger(basePriceVnd) || basePriceVnd < 0) {
      throw httpError('basePriceVnd must be a non-negative integer');
    }
    data.basePriceVnd = basePriceVnd;
  }
  if (body.checkInTime !== undefined) data.checkInTime = String(body.checkInTime).trim();
  if (body.checkOutTime !== undefined) data.checkOutTime = String(body.checkOutTime).trim();
  if (body.paragraphs !== undefined) {
    if (body.paragraphs !== null && !Array.isArray(body.paragraphs)) {
      throw httpError('paragraphs must be an array');
    }
    data.paragraphs = body.paragraphs;
  }
  if (body.policyBullets !== undefined) {
    if (body.policyBullets !== null && !Array.isArray(body.policyBullets)) {
      throw httpError('policyBullets must be an array');
    }
    data.policyBullets = body.policyBullets;
  }
  if (body.isActive !== undefined) data.isActive = Boolean(body.isActive);
  if (Object.keys(data).length === 0) throw httpError('No fields to update');
  return data;
}

async function list(query = {}) {
  return roomTypeRepository.findAll(parseListFilters(query));
}

async function getById(idRaw) {
  return roomTypeRepository.findById(parseId(idRaw));
}

async function getBySlug(slugRaw) {
  return roomTypeRepository.findBySlug(parseSlug(slugRaw));
}

async function create(body) {
  try {
    return await roomTypeRepository.create(assertCreatePayload(body));
  } catch (error) {
    mapPrismaError(error, 'Room type not found');
  }
}

async function update(idRaw, body) {
  const id = parseId(idRaw);
  try {
    return await roomTypeRepository.update(id, buildUpdatePayload(body));
  } catch (error) {
    mapPrismaError(error, 'Room type not found');
  }
}

async function remove(idRaw) {
  const id = parseId(idRaw);
  try {
    return await roomTypeRepository.remove(id);
  } catch (error) {
    mapPrismaError(error, 'Room type not found');
  }
}

module.exports = { list, getById, getBySlug, create, update, remove };
