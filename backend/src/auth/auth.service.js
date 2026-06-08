const prisma = require('../config/prisma.config');
const adminAuthService = require('./adminAuth.service');
const { hashPassword, comparePassword } = require('../utils/hashPassword.util');
const tokenService = require('./token.service');
const { httpError } = require('../utils/http');

function sanitizeUser(user) {
  const { passwordHash, ...safe } = user;
  return safe;
}

async function registerClient(data) {
  const email = String(data.email || '').trim().toLowerCase();
  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    throw httpError('User already exists', 409);
  }

  const adminExists = await adminAuthService.findByEmail(email);
  if (adminExists) {
    throw httpError('Email reserved for admin account', 409);
  }

  const hashedPassword = await hashPassword(data.password);
  const user = await prisma.user.create({
    data: {
      email,
      passwordHash: hashedPassword,
      fullName: data.fullName,
      phone: data.phone,
      membershipTier: data.membershipTier,
      isActive: data.isActive ?? true,
      authProvider: 'local',
      emailVerified: true,
    },
  });
  return sanitizeUser(user);
}

async function loginClient(email, password) {
  const normalizedEmail = typeof email === 'string' ? email.trim().toLowerCase() : '';
  if (!normalizedEmail || !password) {
    throw httpError('email and password are required');
  }

  const adminAccount = await adminAuthService.findByEmail(normalizedEmail);
  if (adminAccount) {
    throw httpError('Tài khoản quản trị — vui lòng đăng nhập tại cổng admin', 403);
  }

  const user = await prisma.user.findUnique({
    where: { email: normalizedEmail },
  });
  if (!user || !user.passwordHash) {
    throw httpError('Invalid email or password', 401);
  }

  const isValid = await comparePassword(password, user.passwordHash);
  if (!isValid) {
    throw httpError('Invalid email or password', 401);
  }
  if (!user.isActive) {
    throw httpError('Account is disabled', 403);
  }

  const tokens = await tokenService.createClientSession(user);
  return {
    ...tokens,
    user: sanitizeUser(user),
  };
}

async function refreshClientSession(rawRefreshToken) {
  if (!rawRefreshToken) {
    throw httpError('refreshToken is required', 400);
  }

  const userId = await tokenService.rotateClientRefresh(rawRefreshToken);
  if (!userId) {
    throw httpError('Refresh token không hợp lệ hoặc đã hết hạn', 401);
  }

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user || !user.isActive) {
    throw httpError('User not found', 404);
  }

  const tokens = await tokenService.createClientSession(user);
  return {
    ...tokens,
    user: sanitizeUser(user),
  };
}

async function logoutClient(rawRefreshToken) {
  if (rawRefreshToken) {
    await tokenService.revokeClientRefresh(rawRefreshToken);
  }
  return { ok: true };
}

async function issueClientSession(user) {
  const tokens = await tokenService.createClientSession(user);
  return {
    ...tokens,
    user: sanitizeUser(user),
  };
}

module.exports = {
  registerClient,
  loginClient,
  refreshClientSession,
  logoutClient,
  issueClientSession,
  sanitizeUser,
};
