const userRepository = require('../repositories/user.repository');
const { httpError, parseId, parseOptionalBoolean } = require('../utils/http');
const { mapPrismaError } = require('../utils/crud');

const MEMBERSHIP_TIERS = new Set(['standard', 'gold', 'diamond']);

function parseMembershipTier(raw) {
  const tier = typeof raw === 'string' ? raw.trim() : '';
  if (!MEMBERSHIP_TIERS.has(tier)) {
    throw httpError(`Invalid membershipTier. Allowed: ${[...MEMBERSHIP_TIERS].join(', ')}`);
  }
  return tier;
}

function normalizeEmail(raw) {
  const email = typeof raw === 'string' ? raw.trim().toLowerCase() : '';
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw httpError('email is required and must be valid');
  }
  return email;
}

function parseListFilters(query) {
  const filters = { isActive: parseOptionalBoolean(query.isActive) };
  if (query.membershipTier) filters.membershipTier = parseMembershipTier(String(query.membershipTier));
  if (query.email) filters.email = String(query.email).trim().toLowerCase();
  return filters;
}

function assertCreatePayload(body) {
  const email = normalizeEmail(body.email);
  const fullName = typeof body.fullName === 'string' ? body.fullName.trim() : '';
  if (!fullName) throw httpError('fullName is required');

  return {
    email,
    passwordHash:
      body.passwordHash !== undefined && body.passwordHash !== null
        ? String(body.passwordHash)
        : null,
    fullName,
    phone:
      body.phone !== undefined && body.phone !== null
        ? String(body.phone).trim() || null
        : null,
    membershipTier:
      body.membershipTier !== undefined
        ? parseMembershipTier(body.membershipTier)
        : 'standard',
    isActive: body.isActive !== undefined ? Boolean(body.isActive) : true,
  };
}

function buildUpdatePayload(body) {
  const data = {};
  if (body.email !== undefined) data.email = normalizeEmail(body.email);
  if (body.passwordHash !== undefined) {
    data.passwordHash = body.passwordHash === null ? null : String(body.passwordHash);
  }
  if (body.fullName !== undefined) {
    const fullName = String(body.fullName).trim();
    if (!fullName) throw httpError('fullName cannot be empty');
    data.fullName = fullName;
  }
  if (body.phone !== undefined) {
    data.phone = body.phone === null ? null : String(body.phone).trim() || null;
  }
  if (body.membershipTier !== undefined) {
    data.membershipTier = parseMembershipTier(body.membershipTier);
  }
  if (body.isActive !== undefined) data.isActive = Boolean(body.isActive);
  if (Object.keys(data).length === 0) throw httpError('No fields to update');
  return data;
}

async function list(query = {}) {
  return userRepository.findAll(parseListFilters(query));
}

async function getById(idRaw) {
  return userRepository.findById(parseId(idRaw));
}

async function create(body) {
  try {
    return await userRepository.create(assertCreatePayload(body));
  } catch (error) {
    mapPrismaError(error, 'User not found');
  }
}

async function update(idRaw, body) {
  const id = parseId(idRaw);
  try {
    return await userRepository.update(id, buildUpdatePayload(body));
  } catch (error) {
    mapPrismaError(error, 'User not found');
  }
}

async function remove(idRaw) {
  const id = parseId(idRaw);
  try {
    return await userRepository.remove(id);
  } catch (error) {
    mapPrismaError(error, 'User not found');
  }
}

module.exports = { list, getById, create, update, remove };
