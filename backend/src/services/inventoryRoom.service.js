const inventoryRoomRepository = require('../repositories/inventoryRoom.repository');
const catalogCountService = require('./catalogCount.service');
const { httpError, parseId, parseOptionalBoolean, parseOptionalId } = require('../utils/http');
const { mapPrismaError } = require('../utils/crud');

const ROOM_STATUSES = new Set(['available', 'pending', 'booked']);
const MAX_GALLERY_IMAGES = 5;

function parseStringList(raw) {
  if (Array.isArray(raw)) {
    return raw.map((s) => String(s).trim()).filter(Boolean);
  }
  if (typeof raw === 'string' && raw.trim()) {
    return raw.split('\n').map((s) => s.trim()).filter(Boolean);
  }
  return [];
}

function parseGalleryImages(body) {
  const urls = parseStringList(body.galleryImageUrl).slice(0, MAX_GALLERY_IMAGES);
  return urls.length ? urls : null;
}

function parseExtraParagraphs(body) {
  const lines = parseStringList(body.extraParagraph).filter(Boolean);
  return lines.length ? lines : null;
}

function parseStatus(raw) {
  const status = typeof raw === 'string' ? raw.trim() : '';
  if (!ROOM_STATUSES.has(status)) {
    throw httpError(`Invalid status. Allowed: ${[...ROOM_STATUSES].join(', ')}`);
  }
  return status;
}

function normalizeCode(raw) {
  const code = typeof raw === 'string' ? raw.trim().toUpperCase() : '';
  if (!code) throw httpError('code is required');
  return code;
}

function parseListFilters(query) {
  const filters = {
    branchId: parseOptionalId(query.branchId, 'branchId'),
    roomTypeId: parseOptionalId(query.roomTypeId, 'roomTypeId'),
    isActive: parseOptionalBoolean(query.isActive),
  };
  if (query.status) filters.status = parseStatus(String(query.status));
  return filters;
}

function assertCreatePayload(body) {
  const branchId = parseId(body.branchId, 'branchId');
  const roomTypeId = parseId(body.roomTypeId, 'roomTypeId');
  const code = normalizeCode(body.code);
  const description =
    body.description !== undefined && body.description !== null
      ? String(body.description).trim()
      : '';
  if (!description) throw httpError('description is required');

  const priceVnd = Number(body.priceVnd);
  if (!Number.isInteger(priceVnd) || priceVnd < 0) {
    throw httpError('priceVnd must be a non-negative integer');
  }

  const maxAdults = body.maxAdults !== undefined ? Number(body.maxAdults) : 2;
  const maxChildren = body.maxChildren !== undefined ? Number(body.maxChildren) : 0;
  if (!Number.isInteger(maxAdults) || maxAdults < 1) {
    throw httpError('maxAdults must be a positive integer');
  }
  if (!Number.isInteger(maxChildren) || maxChildren < 0) {
    throw httpError('maxChildren must be a non-negative integer');
  }

  return {
    branchId,
    roomTypeId,
    code,
    priceVnd,
    description,
    imageUrl:
      body.imageUrl !== undefined && body.imageUrl !== null
        ? String(body.imageUrl).trim() || null
        : null,
    galleryImages: parseGalleryImages(body),
    extraParagraphs: parseExtraParagraphs(body),
    altText:
      body.altText !== undefined && body.altText !== null
        ? String(body.altText).trim() || null
        : null,
    maxAdults,
    maxChildren,
    status: body.status !== undefined ? parseStatus(body.status) : 'available',
    isActive: body.isActive !== undefined ? Boolean(body.isActive) : true,
  };
}

function buildUpdatePayload(body) {
  const data = {};
  if (body.branchId !== undefined) data.branchId = parseId(body.branchId, 'branchId');
  if (body.roomTypeId !== undefined) data.roomTypeId = parseId(body.roomTypeId, 'roomTypeId');
  if (body.code !== undefined) data.code = normalizeCode(body.code);
  if (body.priceVnd !== undefined) {
    const priceVnd = Number(body.priceVnd);
    if (!Number.isInteger(priceVnd) || priceVnd < 0) {
      throw httpError('priceVnd must be a non-negative integer');
    }
    data.priceVnd = priceVnd;
  }
  if (body.description !== undefined) {
    const description = String(body.description).trim();
    if (!description) throw httpError('description cannot be empty');
    data.description = description;
  }
  if (body.imageUrl !== undefined) {
    data.imageUrl = body.imageUrl === null ? null : String(body.imageUrl).trim() || null;
  }
  if (body.galleryImageUrl !== undefined) {
    data.galleryImages = parseGalleryImages(body);
  }
  if (body.extraParagraph !== undefined) {
    data.extraParagraphs = parseExtraParagraphs(body);
  }
  if (body.altText !== undefined) {
    data.altText = body.altText === null ? null : String(body.altText).trim() || null;
  }
  if (body.maxAdults !== undefined) {
    const maxAdults = Number(body.maxAdults);
    if (!Number.isInteger(maxAdults) || maxAdults < 1) {
      throw httpError('maxAdults must be a positive integer');
    }
    data.maxAdults = maxAdults;
  }
  if (body.maxChildren !== undefined) {
    const maxChildren = Number(body.maxChildren);
    if (!Number.isInteger(maxChildren) || maxChildren < 0) {
      throw httpError('maxChildren must be a non-negative integer');
    }
    data.maxChildren = maxChildren;
  }
  if (body.status !== undefined) data.status = parseStatus(body.status);
  if (body.isActive !== undefined) data.isActive = Boolean(body.isActive);
  if (Object.keys(data).length === 0) throw httpError('No fields to update');
  return data;
}

async function list(query = {}) {
  return inventoryRoomRepository.findAll(parseListFilters(query));
}

async function getById(idRaw) {
  return inventoryRoomRepository.findById(parseId(idRaw));
}

async function create(body) {
  const payload = assertCreatePayload(body);
  try {
    const room = await inventoryRoomRepository.create(payload);
    await catalogCountService.syncAfterRoomChange(room.branchId);
    return room;
  } catch (error) {
    mapPrismaError(error, 'Inventory room not found');
  }
}

async function update(idRaw, body) {
  const id = parseId(idRaw);
  const existing = await inventoryRoomRepository.findById(id);
  if (!existing) throw httpError('Inventory room not found', 404);
  try {
    const room = await inventoryRoomRepository.update(id, buildUpdatePayload(body));
    await catalogCountService.syncAfterRoomChange(room.branchId, existing.branchId);
    return room;
  } catch (error) {
    mapPrismaError(error, 'Inventory room not found');
  }
}

function bookingDeleteBlockedMessage(count, code) {
  const label = code ? `Phòng ${code}` : 'Phòng';
  return `${label} có ${count} đặt phòng — không thể xóa. Hãy ngừng hoạt động thay vì xóa.`;
}

async function remove(idRaw) {
  const id = parseId(idRaw);
  const existing = await inventoryRoomRepository.findById(id);
  if (!existing) throw httpError('Inventory room not found', 404);

  const bookingCount = await inventoryRoomRepository.countBookings(id);
  if (bookingCount > 0) {
    throw httpError(bookingDeleteBlockedMessage(bookingCount, existing.code), 409);
  }

  try {
    await inventoryRoomRepository.remove(id);
    await catalogCountService.syncAfterRoomChange(existing.branchId);
  } catch (error) {
    if (error?.code === 'P2003') {
      const count = await inventoryRoomRepository.countBookings(id);
      throw httpError(bookingDeleteBlockedMessage(count || 1, existing.code), 409);
    }
    mapPrismaError(error, 'Inventory room not found');
  }
}

async function setRoomActive(idRaw, isActive) {
  const id = parseId(idRaw);
  const existing = await inventoryRoomRepository.findById(id);
  if (!existing) throw httpError('Inventory room not found', 404);
  try {
    return await inventoryRoomRepository.update(id, { isActive: Boolean(isActive) });
  } catch (error) {
    mapPrismaError(error, 'Inventory room not found');
  }
}

async function getBookingCountsByRoomIds(roomIds) {
  return inventoryRoomRepository.countBookingsByRoomIds(roomIds);
}

module.exports = {
  list,
  getById,
  create,
  update,
  remove,
  setRoomActive,
  getBookingCountsByRoomIds,
};
