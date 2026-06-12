const propertyRepository = require('../repositories/property.repository');

const PROPERTY_KINDS = new Set([
  'homestay',
  'mini_hotel',
  'villa',
  'serviced_apartment',
]);

function httpError(message, statusCode = 400) {
  const err = new Error(message);
  err.statusCode = statusCode;
  return err;
}

function parseId(raw) {
  const id = Number.parseInt(raw, 10);
  if (!Number.isInteger(id) || id < 1) {
    throw httpError('Invalid property id');
  }
  return id;
}

function parseSlug(raw) {
  const slug = typeof raw === 'string' ? raw.trim() : '';
  if (!slug) {
    throw httpError('Invalid property slug');
  }
  return slug;
}

function parseOptionalBoolean(raw) {
  if (raw === undefined || raw === '') return undefined;
  if (raw === 'true' || raw === '1') return true;
  if (raw === 'false' || raw === '0') return false;
  throw httpError('Invalid isActive value (use true or false)');
}

function parseListFilters(query) {
  const filters = {};

  if (query.city) {
    filters.city = String(query.city).trim();
  }
  if (query.kind) {
    const kind = String(query.kind).trim();
    if (!PROPERTY_KINDS.has(kind)) {
      throw httpError(`Invalid kind. Allowed: ${[...PROPERTY_KINDS].join(', ')}`);
    }
    filters.kind = kind;
  }
  filters.isActive = parseOptionalBoolean(query.isActive);

  return filters;
}

function normalizeSlug(raw) {
  const slug = typeof raw === 'string' ? raw.trim().toLowerCase() : '';
  if (!slug || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
    throw httpError('Slug is required (lowercase letters, numbers, hyphens)');
  }
  return slug;
}

function assertCreatePayload(body) {
  const slug = normalizeSlug(body.slug);
  const name = typeof body.name === 'string' ? body.name.trim() : '';
  const city = typeof body.city === 'string' ? body.city.trim() : '';
  const region = typeof body.region === 'string' ? body.region.trim() : '';
  const kind = typeof body.kind === 'string' ? body.kind.trim() : '';
  const description =
    body.description !== undefined && body.description !== null
      ? String(body.description).trim()
      : '';
  const address = typeof body.address === 'string' ? body.address.trim() : '';

  if (!name) throw httpError('name is required');
  if (!city) throw httpError('city is required');
  if (!region) throw httpError('region is required');
  if (!PROPERTY_KINDS.has(kind)) {
    throw httpError(`kind is required. Allowed: ${[...PROPERTY_KINDS].join(', ')}`);
  }
  if (!description) throw httpError('description is required');
  if (!address) throw httpError('address is required');

  const priceFromVnd = Number(body.priceFromVnd);
  if (!Number.isInteger(priceFromVnd) || priceFromVnd < 0) {
    throw httpError('priceFromVnd must be a non-negative integer');
  }

  return {
    slug,
    name,
    city,
    region,
    kind,
    tagline:
      body.tagline !== undefined && body.tagline !== null
        ? String(body.tagline).trim() || null
        : null,
    description,
    address,
    priceFromVnd,
    roomCount: 0,
    branchCount: 0,
    rating: body.rating !== undefined ? Number(body.rating) : 0,
    reviewCount: Number.isInteger(body.reviewCount) ? body.reviewCount : 0,
    heroImageUrl:
      body.heroImageUrl !== undefined && body.heroImageUrl !== null
        ? String(body.heroImageUrl).trim() || null
        : null,
    highlights: Array.isArray(body.highlights) ? body.highlights : undefined,
    isActive: body.isActive !== undefined ? Boolean(body.isActive) : true,
  };
}

function buildUpdatePayload(body) {
  const data = {};

  if (body.slug !== undefined) data.slug = normalizeSlug(body.slug);
  if (body.name !== undefined) {
    const name = String(body.name).trim();
    if (!name) throw httpError('name cannot be empty');
    data.name = name;
  }
  if (body.city !== undefined) {
    const city = String(body.city).trim();
    if (!city) throw httpError('city cannot be empty');
    data.city = city;
  }
  if (body.region !== undefined) {
    const region = String(body.region).trim();
    if (!region) throw httpError('region cannot be empty');
    data.region = region;
  }
  if (body.kind !== undefined) {
    const kind = String(body.kind).trim();
    if (!PROPERTY_KINDS.has(kind)) {
      throw httpError(`Invalid kind. Allowed: ${[...PROPERTY_KINDS].join(', ')}`);
    }
    data.kind = kind;
  }
  if (body.tagline !== undefined) {
    data.tagline = body.tagline === null ? null : String(body.tagline).trim() || null;
  }
  if (body.description !== undefined) {
    const description = String(body.description).trim();
    if (!description) throw httpError('description cannot be empty');
    data.description = description;
  }
  if (body.address !== undefined) {
    const address = String(body.address).trim();
    if (!address) throw httpError('address cannot be empty');
    data.address = address;
  }
  if (body.priceFromVnd !== undefined) {
    const priceFromVnd = Number(body.priceFromVnd);
    if (!Number.isInteger(priceFromVnd) || priceFromVnd < 0) {
      throw httpError('priceFromVnd must be a non-negative integer');
    }
    data.priceFromVnd = priceFromVnd;
  }
  if (body.rating !== undefined) {
    const rating = Number(body.rating);
    if (Number.isNaN(rating) || rating < 0 || rating > 5) {
      throw httpError('rating must be between 0 and 5');
    }
    data.rating = rating;
  }
  if (body.reviewCount !== undefined) {
    if (!Number.isInteger(body.reviewCount) || body.reviewCount < 0) {
      throw httpError('reviewCount must be a non-negative integer');
    }
    data.reviewCount = body.reviewCount;
  }
  if (body.heroImageUrl !== undefined) {
    data.heroImageUrl =
      body.heroImageUrl === null ? null : String(body.heroImageUrl).trim() || null;
  }
  if (body.highlights !== undefined) {
    if (body.highlights !== null && !Array.isArray(body.highlights)) {
      throw httpError('highlights must be an array of strings');
    }
    data.highlights = body.highlights;
  }
  if (body.isActive !== undefined) {
    data.isActive = Boolean(body.isActive);
  }

  if (Object.keys(data).length === 0) {
    throw httpError('No fields to update');
  }

  return data;
}

async function listProperties(query = {}) {
  return propertyRepository.findAll(parseListFilters(query));
}

async function getPropertyById(idRaw) {
  return propertyRepository.findById(parseId(idRaw));
}

async function getPropertyBySlug(slugRaw) {
  return propertyRepository.findBySlug(parseSlug(slugRaw));
}

async function createProperty(body) {
  const data = assertCreatePayload(body);
  try {
    return await propertyRepository.create(data);
  } catch (error) {
    if (error?.code === 'P2002') {
      throw httpError('Slug already exists', 409);
    }
    throw error;
  }
}

async function updateProperty(idRaw, body) {
  const id = parseId(idRaw);
  const data = buildUpdatePayload(body);
  try {
    return await propertyRepository.update(id, data);
  } catch (error) {
    if (error?.code === 'P2025') {
      throw httpError('Property not found', 404);
    }
    if (error?.code === 'P2002') {
      throw httpError('Slug already exists', 409);
    }
    throw error;
  }
}

function bookingDeleteBlockedMessage(count) {
  return `Cơ sở có ${count} đặt phòng — không thể xóa. Hãy ngừng hoạt động thay vì xóa.`;
}

async function deleteProperty(idRaw) {
  const id = parseId(idRaw);
  const bookingCount = await propertyRepository.countBookings(id);
  if (bookingCount > 0) {
    throw httpError(bookingDeleteBlockedMessage(bookingCount), 409);
  }

  try {
    return await propertyRepository.remove(id);
  } catch (error) {
    if (error?.code === 'P2025') {
      throw httpError('Property not found', 404);
    }
    if (error?.code === 'P2003') {
      const count = await propertyRepository.countBookings(id);
      throw httpError(bookingDeleteBlockedMessage(count || 1), 409);
    }
    throw error;
  }
}

async function setPropertyActive(idRaw, isActive) {
  const id = parseId(idRaw);
  try {
    return await propertyRepository.update(id, { isActive: Boolean(isActive) });
  } catch (error) {
    if (error?.code === 'P2025') {
      throw httpError('Property not found', 404);
    }
    throw error;
  }
}

async function getBookingCountsByPropertyIds(propertyIds) {
  return propertyRepository.countBookingsByPropertyIds(propertyIds);
}

module.exports = {
  listProperties,
  getPropertyById,
  getPropertyBySlug,
  createProperty,
  updateProperty,
  deleteProperty,
  setPropertyActive,
  getBookingCountsByPropertyIds,
};
