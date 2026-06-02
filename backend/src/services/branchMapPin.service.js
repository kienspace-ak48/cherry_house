const branchMapPinRepository = require('../repositories/branchMapPin.repository');
const { httpError, parseId, parseOptionalId } = require('../utils/http');
const { mapPrismaError } = require('../utils/crud');

function parseDecimal(raw, label) {
  const value = Number(raw);
  if (Number.isNaN(value)) throw httpError(`${label} must be a number`);
  return value;
}

function parseListFilters(query) {
  return { branchId: parseOptionalId(query.branchId, 'branchId') };
}

function assertCreatePayload(body) {
  const branchId = parseId(body.branchId, 'branchId');
  const lat = parseDecimal(body.lat, 'lat');
  const lng = parseDecimal(body.lng, 'lng');
  const googleMapsUrl =
    typeof body.googleMapsUrl === 'string' ? body.googleMapsUrl.trim() : '';
  if (!googleMapsUrl) throw httpError('googleMapsUrl is required');

  const zoom = body.zoom !== undefined ? Number(body.zoom) : 15;
  if (!Number.isInteger(zoom) || zoom < 1 || zoom > 22) {
    throw httpError('zoom must be an integer between 1 and 22');
  }

  return {
    branchId,
    lat,
    lng,
    zoom,
    label:
      body.label !== undefined && body.label !== null
        ? String(body.label).trim() || null
        : null,
    pinBadge:
      body.pinBadge !== undefined && body.pinBadge !== null
        ? String(body.pinBadge).trim() || null
        : null,
    pinInfo:
      body.pinInfo !== undefined && body.pinInfo !== null
        ? String(body.pinInfo).trim() || null
        : null,
    googleMapsUrl,
    embedUrl:
      body.embedUrl !== undefined && body.embedUrl !== null
        ? String(body.embedUrl).trim() || null
        : null,
  };
}

function buildUpdatePayload(body) {
  const data = {};
  if (body.branchId !== undefined) data.branchId = parseId(body.branchId, 'branchId');
  if (body.lat !== undefined) data.lat = parseDecimal(body.lat, 'lat');
  if (body.lng !== undefined) data.lng = parseDecimal(body.lng, 'lng');
  if (body.zoom !== undefined) {
    const zoom = Number(body.zoom);
    if (!Number.isInteger(zoom) || zoom < 1 || zoom > 22) {
      throw httpError('zoom must be an integer between 1 and 22');
    }
    data.zoom = zoom;
  }
  if (body.label !== undefined) {
    data.label = body.label === null ? null : String(body.label).trim() || null;
  }
  if (body.pinBadge !== undefined) {
    data.pinBadge = body.pinBadge === null ? null : String(body.pinBadge).trim() || null;
  }
  if (body.pinInfo !== undefined) {
    data.pinInfo = body.pinInfo === null ? null : String(body.pinInfo).trim() || null;
  }
  if (body.googleMapsUrl !== undefined) {
    const googleMapsUrl = String(body.googleMapsUrl).trim();
    if (!googleMapsUrl) throw httpError('googleMapsUrl cannot be empty');
    data.googleMapsUrl = googleMapsUrl;
  }
  if (body.embedUrl !== undefined) {
    data.embedUrl = body.embedUrl === null ? null : String(body.embedUrl).trim() || null;
  }
  if (Object.keys(data).length === 0) throw httpError('No fields to update');
  return data;
}

async function list(query = {}) {
  return branchMapPinRepository.findAll(parseListFilters(query));
}

async function getById(idRaw) {
  return branchMapPinRepository.findById(parseId(idRaw));
}

async function create(body) {
  try {
    return await branchMapPinRepository.create(assertCreatePayload(body));
  } catch (error) {
    mapPrismaError(error, 'Branch map pin not found');
  }
}

async function update(idRaw, body) {
  const id = parseId(idRaw);
  try {
    return await branchMapPinRepository.update(id, buildUpdatePayload(body));
  } catch (error) {
    mapPrismaError(error, 'Branch map pin not found');
  }
}

async function remove(idRaw) {
  const id = parseId(idRaw);
  try {
    return await branchMapPinRepository.remove(id);
  } catch (error) {
    mapPrismaError(error, 'Branch map pin not found');
  }
}

module.exports = { list, getById, create, update, remove };
