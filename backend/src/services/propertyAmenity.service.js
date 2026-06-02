const propertyAmenityRepository = require('../repositories/propertyAmenity.repository');
const { httpError, parseId, parseOptionalId } = require('../utils/http');
const { mapPrismaError } = require('../utils/crud');

function parseListFilters(query) {
  const propertyId = parseOptionalId(query.propertyId, 'propertyId');
  if (!propertyId) throw httpError('propertyId query parameter is required');
  return { propertyId, amenityId: parseOptionalId(query.amenityId, 'amenityId') };
}

function assertLinkPayload(body) {
  return {
    propertyId: parseId(body.propertyId, 'propertyId'),
    amenityId: parseId(body.amenityId, 'amenityId'),
  };
}

function assertUnlinkPayload(body) {
  return assertLinkPayload(body);
}

async function list(query = {}) {
  return propertyAmenityRepository.findAll(parseListFilters(query));
}

async function link(body) {
  try {
    return await propertyAmenityRepository.link(assertLinkPayload(body));
  } catch (error) {
    mapPrismaError(error, 'Property amenity link not found');
  }
}

async function unlink(body) {
  const { propertyId, amenityId } = assertUnlinkPayload(body);
  try {
    return await propertyAmenityRepository.unlink(propertyId, amenityId);
  } catch (error) {
    mapPrismaError(error, 'Property amenity link not found');
  }
}

module.exports = { list, link, unlink };
