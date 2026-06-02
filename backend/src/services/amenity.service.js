const amenityRepository = require('../repositories/amenity.repository');
const { httpError, parseId } = require('../utils/http');
const { mapPrismaError } = require('../utils/crud');

function parseListFilters(query) {
  const filters = {};
  if (query.label) filters.label = String(query.label).trim();
  return filters;
}

function assertCreatePayload(body) {
  const icon = typeof body.icon === 'string' ? body.icon.trim() : '';
  const label = typeof body.label === 'string' ? body.label.trim() : '';
  if (!icon) throw httpError('icon is required');
  if (!label) throw httpError('label is required');
  return { icon, label };
}

function buildUpdatePayload(body) {
  const data = {};
  if (body.icon !== undefined) {
    const icon = String(body.icon).trim();
    if (!icon) throw httpError('icon cannot be empty');
    data.icon = icon;
  }
  if (body.label !== undefined) {
    const label = String(body.label).trim();
    if (!label) throw httpError('label cannot be empty');
    data.label = label;
  }
  if (Object.keys(data).length === 0) throw httpError('No fields to update');
  return data;
}

async function list(query = {}) {
  return amenityRepository.findAll(parseListFilters(query));
}

async function getById(idRaw) {
  return amenityRepository.findById(parseId(idRaw));
}

async function create(body) {
  try {
    return await amenityRepository.create(assertCreatePayload(body));
  } catch (error) {
    mapPrismaError(error, 'Amenity not found');
  }
}

async function update(idRaw, body) {
  const id = parseId(idRaw);
  try {
    return await amenityRepository.update(id, buildUpdatePayload(body));
  } catch (error) {
    mapPrismaError(error, 'Amenity not found');
  }
}

async function remove(idRaw) {
  const id = parseId(idRaw);
  try {
    return await amenityRepository.remove(id);
  } catch (error) {
    mapPrismaError(error, 'Amenity not found');
  }
}

module.exports = { list, getById, create, update, remove };
