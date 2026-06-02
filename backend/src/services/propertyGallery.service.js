const propertyGalleryRepository = require('../repositories/propertyGallery.repository');
const { httpError, parseId, parseOptionalId } = require('../utils/http');
const { mapPrismaError } = require('../utils/crud');

function parseListFilters(query) {
  return { propertyId: parseOptionalId(query.propertyId, 'propertyId') };
}

function assertCreatePayload(body) {
  const propertyId = parseId(body.propertyId, 'propertyId');
  const imageUrl = typeof body.imageUrl === 'string' ? body.imageUrl.trim() : '';
  if (!imageUrl) throw httpError('imageUrl is required');

  const sortOrder = body.sortOrder !== undefined ? Number(body.sortOrder) : 0;
  if (!Number.isInteger(sortOrder) || sortOrder < 0) {
    throw httpError('sortOrder must be a non-negative integer');
  }

  return { propertyId, imageUrl, sortOrder };
}

function buildUpdatePayload(body) {
  const data = {};
  if (body.propertyId !== undefined) data.propertyId = parseId(body.propertyId, 'propertyId');
  if (body.imageUrl !== undefined) {
    const imageUrl = String(body.imageUrl).trim();
    if (!imageUrl) throw httpError('imageUrl cannot be empty');
    data.imageUrl = imageUrl;
  }
  if (body.sortOrder !== undefined) {
    const sortOrder = Number(body.sortOrder);
    if (!Number.isInteger(sortOrder) || sortOrder < 0) {
      throw httpError('sortOrder must be a non-negative integer');
    }
    data.sortOrder = sortOrder;
  }
  if (Object.keys(data).length === 0) throw httpError('No fields to update');
  return data;
}

async function list(query = {}) {
  return propertyGalleryRepository.findAll(parseListFilters(query));
}

async function getById(idRaw) {
  return propertyGalleryRepository.findById(parseId(idRaw));
}

async function create(body) {
  try {
    return await propertyGalleryRepository.create(assertCreatePayload(body));
  } catch (error) {
    mapPrismaError(error, 'Property gallery item not found');
  }
}

async function update(idRaw, body) {
  const id = parseId(idRaw);
  try {
    return await propertyGalleryRepository.update(id, buildUpdatePayload(body));
  } catch (error) {
    mapPrismaError(error, 'Property gallery item not found');
  }
}

async function remove(idRaw) {
  const id = parseId(idRaw);
  try {
    return await propertyGalleryRepository.remove(id);
  } catch (error) {
    mapPrismaError(error, 'Property gallery item not found');
  }
}

module.exports = { list, getById, create, update, remove };
