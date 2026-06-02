const roomTypeAmenityRepository = require('../repositories/roomTypeAmenity.repository');
const { httpError, parseId, parseOptionalId } = require('../utils/http');
const { mapPrismaError } = require('../utils/crud');

function parseListFilters(query) {
  const roomTypeId = parseOptionalId(query.roomTypeId, 'roomTypeId');
  if (!roomTypeId) throw httpError('roomTypeId query parameter is required');
  return { roomTypeId, amenityId: parseOptionalId(query.amenityId, 'amenityId') };
}

function assertLinkPayload(body) {
  return {
    roomTypeId: parseId(body.roomTypeId, 'roomTypeId'),
    amenityId: parseId(body.amenityId, 'amenityId'),
  };
}

async function list(query = {}) {
  return roomTypeAmenityRepository.findAll(parseListFilters(query));
}

async function link(body) {
  try {
    return await roomTypeAmenityRepository.link(assertLinkPayload(body));
  } catch (error) {
    mapPrismaError(error, 'Room type amenity link not found');
  }
}

async function unlink(body) {
  const { roomTypeId, amenityId } = assertLinkPayload(body);
  try {
    return await roomTypeAmenityRepository.unlink(roomTypeId, amenityId);
  } catch (error) {
    mapPrismaError(error, 'Room type amenity link not found');
  }
}

module.exports = { list, link, unlink };
