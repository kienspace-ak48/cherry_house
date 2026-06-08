const crypto = require('crypto');
const { generateJWT } = require('../utils/generateJWT.util');
const refreshTokenRepository = require('../repositories/refreshToken.repository');

const ACCESS_EXPIRES =
  process.env.JWT_ACCESS_EXPIRES_IN || process.env.JWT_EXPIRES_IN || '15m';
const REFRESH_EXPIRES_DAYS = Number(process.env.JWT_REFRESH_EXPIRES_DAYS || 7);

function hashToken(raw) {
  return crypto.createHash('sha256').update(String(raw)).digest('hex');
}

function generateRefreshTokenRaw() {
  return crypto.randomBytes(32).toString('hex');
}

function refreshExpiresAt() {
  return new Date(Date.now() + REFRESH_EXPIRES_DAYS * 24 * 60 * 60 * 1000);
}

async function issueClientAccessToken(user) {
  return generateJWT(
    {
      sub: user.id,
      id: user.id,
      email: user.email,
      typ: 'client',
    },
    ACCESS_EXPIRES,
  );
}

async function issueAdminAccessToken(admin) {
  return generateJWT(
    {
      sub: admin.id,
      id: admin.id,
      email: admin.email,
      role: admin.role,
      typ: 'admin',
    },
    ACCESS_EXPIRES,
  );
}

async function persistClientRefreshToken(userId, rawRefresh) {
  await refreshTokenRepository.create({
    tokenHash: hashToken(rawRefresh),
    subjectType: 'client',
    userId,
    expiresAt: refreshExpiresAt(),
  });
}

async function persistAdminRefreshToken(adminId, rawRefresh) {
  await refreshTokenRepository.create({
    tokenHash: hashToken(rawRefresh),
    subjectType: 'admin',
    adminId,
    expiresAt: refreshExpiresAt(),
  });
}

/** Tạo cặp access + refresh cho khách */
async function createClientSession(user) {
  const accessToken = await issueClientAccessToken(user);
  const refreshToken = generateRefreshTokenRaw();
  await persistClientRefreshToken(user.id, refreshToken);
  return {
    accessToken,
    refreshToken,
    token: accessToken,
    expiresIn: ACCESS_EXPIRES,
  };
}

/** Tạo cặp access + refresh cho admin (JSON API) */
async function createAdminSession(admin) {
  const accessToken = await issueAdminAccessToken(admin);
  const refreshToken = generateRefreshTokenRaw();
  await persistAdminRefreshToken(admin.id, refreshToken);
  return {
    accessToken,
    refreshToken,
    token: accessToken,
    expiresIn: ACCESS_EXPIRES,
  };
}

/** Chỉ access token cho admin cookie SSR (không lưu refresh trong cookie flow cũ) */
async function createAdminAccessOnly(admin) {
  const accessToken = await issueAdminAccessToken(admin);
  return { accessToken, token: accessToken, expiresIn: ACCESS_EXPIRES };
}

async function rotateClientRefresh(rawRefresh) {
  const record = await refreshTokenRepository.findValidByHash(hashToken(rawRefresh));
  if (!record || record.subjectType !== 'client' || !record.userId) {
    return null;
  }
  await refreshTokenRepository.revokeById(record.id);
  return record.userId;
}

async function revokeClientRefresh(rawRefresh) {
  const record = await refreshTokenRepository.findValidByHash(hashToken(rawRefresh));
  if (record?.subjectType === 'client') {
    await refreshTokenRepository.revokeById(record.id);
    return true;
  }
  return false;
}

function normalizeJwtPayload(decoded) {
  return {
    id: decoded.sub ?? decoded.id,
    email: decoded.email,
    role: decoded.role,
    typ: decoded.typ,
  };
}

module.exports = {
  hashToken,
  createClientSession,
  createAdminSession,
  createAdminAccessOnly,
  rotateClientRefresh,
  revokeClientRefresh,
  normalizeJwtPayload,
  ACCESS_EXPIRES,
  REFRESH_EXPIRES_DAYS,
};
