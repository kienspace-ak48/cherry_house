const propertyRepository = require('../repositories/property.repository');
const branchRepository = require('../repositories/branch.repository');
const inventoryRoomRepository = require('../repositories/inventoryRoom.repository');
const branchService = require('../services/branch.service');
const { findProvinceByName } = require('../data/vietnam-provinces');
const { httpError, parseId, parseOptionalBoolean } = require('../utils/http');
const { toDetailSlug, toPublicProperty, toPublicBranch, toPublicRoom, toPublicRoomDetail } = require('../utils/catalog.mapper');

function parseSlug(raw) {
  const slug = typeof raw === 'string' ? raw.trim() : '';
  if (!slug) throw httpError('Invalid property slug');
  return slug;
}

function parsePublicListFilters(query) {
  const filters = { isActive: true };

  if (query.province) {
    filters.province = String(query.province).trim();
  } else if (query.city) {
    const city = String(query.city).trim();
    if (findProvinceByName(city)) filters.province = city;
    else filters.city = city;
  }
  if (query.kind) filters.kind = String(query.kind).trim();
  if (query.isActive !== undefined) {
    filters.isActive = parseOptionalBoolean(query.isActive);
  }

  return filters;
}

async function listProperties(query = {}) {
  const rows = await propertyRepository.findAllForCatalog(parsePublicListFilters(query));
  return rows.map((row) => toPublicProperty(row, {
    includeBranches: true,
    includeGallery: false,
    includeAmenities: false,
  }));
}

async function getPropertyBySlug(slugRaw) {
  const slug = parseSlug(slugRaw);
  const row = await propertyRepository.findBySlugForCatalog(slug);
  if (!row || row.isActive === false) {
    return null;
  }
  return toPublicProperty(row, {
    includeBranches: true,
    includeGallery: true,
    includeAmenities: true,
  });
}

async function getPropertyById(idRaw) {
  const id = parseId(idRaw);
  const row = await propertyRepository.findByIdForCatalog(id);
  if (!row || row.isActive === false) return null;
  return toPublicProperty(row, {
    includeBranches: true,
    includeGallery: true,
    includeAmenities: true,
  });
}

async function listBranchesByProperty(propertyIdRaw, query = {}) {
  const propertyId = parseId(propertyIdRaw, 'propertyId');
  const property = await propertyRepository.findById(propertyId);
  if (!property || property.isActive === false) {
    throw httpError('Property not found', 404);
  }

  const filters = { propertyId, isActive: true };
  if (query.isActive !== undefined) {
    filters.isActive = parseOptionalBoolean(query.isActive);
  }

  const rows = await branchRepository.findAllForCatalog(filters);
  return rows.map(toPublicBranch);
}

async function listBranches(query = {}) {
  const filters = { isActive: true };
  if (query.propertyId) filters.propertyId = parseId(query.propertyId, 'propertyId');
  if (query.isActive !== undefined) filters.isActive = parseOptionalBoolean(query.isActive);

  const rows = await branchRepository.findAllForCatalog(filters);
  return rows.map(toPublicBranch);
}

async function getBranchById(idRaw) {
  const id = parseId(idRaw);
  const row = await branchRepository.findByIdForCatalog(id);
  if (!row || row.isActive === false) return null;
  return toPublicBranch(row);
}

async function getBranchByPropertyAndCode(propertyIdRaw, codeRaw) {
  const branch = await branchService.getBranchByPropertyAndCode(propertyIdRaw, codeRaw);
  if (!branch || branch.isActive === false) return null;
  const row = await branchRepository.findByIdForCatalog(branch.id);
  return row ? toPublicBranch(row) : toPublicBranch(branch);
}

async function listRooms(query = {}) {
  const filters = { isActive: true };

  if (query.branchId) {
    const branchId = parseId(query.branchId, 'branchId');
    const branch = await branchRepository.findById(branchId);
    if (!branch || branch.isActive === false) return [];
    const property = await propertyRepository.findById(branch.propertyId);
    if (!property || property.isActive === false) return [];
    filters.branchId = branchId;
  }

  if (query.propertySlug && query.branchCode) {
    const property = await propertyRepository.findBySlugForCatalog(parseSlug(query.propertySlug));
    if (!property || property.isActive === false) return [];
    const branchCode = String(query.branchCode).trim().toLowerCase();
    const branch = await branchRepository.findByPropertyAndCode(property.id, branchCode);
    if (!branch || branch.isActive === false) return [];
    filters.branchId = branch.id;
  }

  if (query.roomTypeId) filters.roomTypeId = parseId(query.roomTypeId, 'roomTypeId');
  if (query.status) filters.status = String(query.status).trim();
  if (query.isActive !== undefined) filters.isActive = parseOptionalBoolean(query.isActive);

  const rows = await inventoryRoomRepository.findAllForCatalog(filters);
  return rows.map(toPublicRoom);
}

async function listRoomsByBranchId(branchIdRaw, query = {}) {
  return listRooms({ ...query, branchId: branchIdRaw });
}

async function getRoomById(idRaw) {
  const id = parseId(idRaw);
  const row = await inventoryRoomRepository.findByIdForCatalog(id);
  if (!row || row.isActive === false) return null;
  return toPublicRoom(row);
}

async function getRoomDetail(query = {}) {
  const detailSlug =
    typeof query.detailSlug === 'string' ? query.detailSlug.trim() : '';
  const propertySlug =
    typeof query.propertySlug === 'string' ? query.propertySlug.trim() : '';
  const branchCode =
    typeof query.branchCode === 'string' ? query.branchCode.trim().toLowerCase() : '';

  let row = null;

  if (query.roomId !== undefined && query.roomId !== null && query.roomId !== '') {
    row = await inventoryRoomRepository.findByIdForCatalogDetail(parseId(query.roomId, 'roomId'));
  } else if (propertySlug && branchCode && detailSlug) {
    const property = await propertyRepository.findBySlugForCatalog(parseSlug(propertySlug));
    if (!property || property.isActive === false) return null;
    const branch = await branchRepository.findByPropertyAndCode(property.id, branchCode);
    if (!branch || branch.isActive === false) return null;
    const rooms = await inventoryRoomRepository.findAllForCatalogDetail({
      branchId: branch.id,
      isActive: true,
    });
    row = rooms.find((r) => toDetailSlug(r.code) === detailSlug) ?? null;
  } else if (detailSlug) {
    const rooms = await inventoryRoomRepository.findAllForCatalogDetail({ isActive: true });
    row = rooms.find((r) => toDetailSlug(r.code) === detailSlug) ?? null;
  }

  if (!row || row.isActive === false) return null;
  return toPublicRoomDetail(row);
}

module.exports = {
  listProperties,
  getPropertyBySlug,
  getPropertyById,
  listBranchesByProperty,
  listBranches,
  getBranchById,
  getBranchByPropertyAndCode,
  listRooms,
  listRoomsByBranchId,
  getRoomById,
  getRoomDetail,
};
