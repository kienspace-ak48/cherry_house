const userRepository = require('../repositories/user.repository');
const { httpError, parseId, parseOptionalBoolean } = require('../utils/http');
const { mapPrismaError } = require('../utils/crud');
const { hashPassword } = require('../utils/hashPassword.util');

const MEMBERSHIP_TIERS = new Set(['standard', 'gold', 'diamond']);
const AUTH_PROVIDERS = new Set(['local', 'google']);

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

function parseAuthProvider(raw) {
  const provider = typeof raw === 'string' ? raw.trim() : '';
  if (!AUTH_PROVIDERS.has(provider)) {
    throw httpError(`Invalid authProvider. Allowed: ${[...AUTH_PROVIDERS].join(', ')}`);
  }
  return provider;
}

function parseListFilters(query) {
  const filters = { isActive: parseOptionalBoolean(query.isActive) };
  if (query.membershipTier) filters.membershipTier = parseMembershipTier(String(query.membershipTier));
  if (query.email) filters.email = String(query.email).trim().toLowerCase();
  if (query.authProvider) filters.authProvider = parseAuthProvider(String(query.authProvider));
  if (query.bookingBanned !== undefined && query.bookingBanned !== '') {
    filters.bookingBanned = parseOptionalBoolean(query.bookingBanned);
  }
  const q = typeof query.q === 'string' ? query.q.trim() : '';
  if (q) filters.q = q;
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
  if (body.isActive !== undefined) {
    data.isActive = body.isActive === true || body.isActive === 'on' || body.isActive === '1';
  }
  if (body.emailVerified !== undefined) {
    data.emailVerified =
      body.emailVerified === true || body.emailVerified === 'on' || body.emailVerified === '1';
  }
  if (Object.keys(data).length === 0) throw httpError('No fields to update');
  return data;
}

function applyBookingBanFields(data, body, existingUser) {
  if (body.bookingBanned === undefined) return;

  const banned =
    body.bookingBanned === true || body.bookingBanned === 'on' || body.bookingBanned === '1';
  data.bookingBanned = banned;

  if (banned) {
    const reason =
      body.bookingBanReason !== undefined
        ? String(body.bookingBanReason).trim() || null
        : existingUser?.bookingBanReason ?? null;
    data.bookingBanReason = reason;
    if (!existingUser?.bookingBanned) {
      data.bookingBannedAt = new Date();
    }
  } else {
    data.bookingBanReason = null;
    data.bookingBannedAt = null;
  }
}

async function buildAdminUpdatePayload(body, existingUser = null) {
  const data = buildUpdatePayload(body);
  applyBookingBanFields(data, body, existingUser);

  const password = typeof body.password === 'string' ? body.password.trim() : '';
  if (password) {
    if (password.length < 6) throw httpError('Mật khẩu mới tối thiểu 6 ký tự');
    data.passwordHash = await hashPassword(password);
  }
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

async function adminUpdate(idRaw, body) {
  const id = parseId(idRaw);
  const existing = await userRepository.findById(id);
  if (!existing) throw httpError('User not found', 404);
  try {
    return await userRepository.update(id, await buildAdminUpdatePayload(body, existing));
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

module.exports = {
  list,
  getById,
  create,
  update,
  adminUpdate,
  remove,
  MEMBERSHIP_TIERS,
  AUTH_PROVIDERS,
};
