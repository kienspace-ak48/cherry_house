const branchRepository = require('../repositories/branch.repository');
const catalogCountService = require('./catalogCount.service');
const { httpError, parseId, parseOptionalBoolean, parseOptionalId } = require('../utils/http');

function normalizeCode(raw) {
  const code = typeof raw === 'string' ? raw.trim().toLowerCase() : '';
  if (!code || !/^[a-z0-9]+(?:[-_][a-z0-9]+)*$/.test(code)) {
    throw httpError('code is required (letters, numbers, hyphen, underscore)');
  }
  return code;
}

function parseListFilters(query) {
  return {
    propertyId: parseOptionalId(query.propertyId, 'propertyId'),
    code: query.code ? String(query.code).trim().toLowerCase() : undefined,
    isActive: parseOptionalBoolean(query.isActive),
  };
}

function assertCreatePayload(body) {
  const propertyId = parseId(body.propertyId, 'propertyId');
  const code = normalizeCode(body.code);
  const name = typeof body.name === 'string' ? body.name.trim() : '';
  const address = typeof body.address === 'string' ? body.address.trim() : '';

  if (!name) throw httpError('name is required');
  if (!address) throw httpError('address is required');

  const priceRaw = body.price ?? body.priceFromVnd;
  const price = Number(priceRaw);
  if (Number.isNaN(price) || price < 0) {
    throw httpError('price must be a non-negative number');
  }

  return {
    propertyId,
    code,
    name,
    address,
    tagline:
      body.tagline !== undefined && body.tagline !== null
        ? String(body.tagline).trim() || null
        : null,
    price,
    roomCount: 0,
    imgUrl:
      body.imgUrl !== undefined && body.imgUrl !== null
        ? String(body.imgUrl).trim() || null
        : body.img_url !== undefined && body.img_url !== null
          ? String(body.img_url).trim() || null
          : null,
    isActive: body.isActive !== undefined ? Boolean(body.isActive) : true,
  };
}

function buildUpdatePayload(body) {
  const data = {};

  if (body.propertyId !== undefined) data.propertyId = parseId(body.propertyId, 'propertyId');
  if (body.code !== undefined) data.code = normalizeCode(body.code);
  if (body.name !== undefined) {
    const name = String(body.name).trim();
    if (!name) throw httpError('name cannot be empty');
    data.name = name;
  }
  if (body.address !== undefined) {
    const address = String(body.address).trim();
    if (!address) throw httpError('address cannot be empty');
    data.address = address;
  }
  if (body.tagline !== undefined) {
    data.tagline = body.tagline === null ? null : String(body.tagline).trim() || null;
  }
  if (body.price !== undefined || body.priceFromVnd !== undefined) {
    const price = Number(body.price ?? body.priceFromVnd);
    if (Number.isNaN(price) || price < 0) throw httpError('price must be a non-negative number');
    data.price = price;
  }
  if (body.imgUrl !== undefined || body.img_url !== undefined) {
    const raw = body.imgUrl ?? body.img_url;
    data.imgUrl = raw === null ? null : String(raw).trim() || null;
  }
  if (body.isActive !== undefined) data.isActive = Boolean(body.isActive);

  if (Object.keys(data).length === 0) throw httpError('No fields to update');
  return data;
}

function mapPrismaError(error) {
  if (error?.code === 'P2025') throw httpError('Branch not found', 404);
  if (error?.code === 'P2002') throw httpError('Branch code already exists for this property', 409);
  if (error?.code === 'P2003') throw httpError('Property not found', 404);
  throw error;
}

async function listBranches(query = {}) {
  return branchRepository.findAll(parseListFilters(query));
}

async function getBranchById(idRaw) {
  return branchRepository.findById(parseId(idRaw));
}

async function getBranchByPropertyAndCode(propertyIdRaw, codeRaw) {
  const propertyId = parseId(propertyIdRaw, 'propertyId');
  const code = normalizeCode(codeRaw);
  return branchRepository.findByPropertyAndCode(propertyId, code);
}

async function createBranch(body) {
  try {
    const branch = await branchRepository.create(assertCreatePayload(body));
    await catalogCountService.syncAfterBranchChange(branch.id);
    return branchRepository.findById(branch.id);
  } catch (error) {
    mapPrismaError(error);
  }
}

async function updateBranch(idRaw, body) {
  const id = parseId(idRaw);
  const existing = await branchRepository.findById(id);
  if (!existing) throw httpError('Branch not found', 404);
  try {
    const branch = await branchRepository.update(id, buildUpdatePayload(body));
    await catalogCountService.syncAfterBranchChange(branch.id, existing.propertyId);
    return branchRepository.findById(branch.id);
  } catch (error) {
    mapPrismaError(error);
  }
}

async function deleteBranch(idRaw) {
  const id = parseId(idRaw);
  const existing = await branchRepository.findById(id);
  if (!existing) throw httpError('Branch not found', 404);
  try {
    await branchRepository.remove(id);
    await catalogCountService.syncPropertyCounts(existing.propertyId);
  } catch (error) {
    mapPrismaError(error);
  }
}

module.exports = {
  listBranches,
  getBranchById,
  getBranchByPropertyAndCode,
  createBranch,
  updateBranch,
  deleteBranch,
};
