const prisma = require('../config/prisma.config');
const { comparePassword } = require('../utils/hashPassword.util');
const { httpError } = require('../utils/http');
const tokenService = require('./token.service');

function sanitizeAdmin(admin) {
  const { passwordHash, ...safe } = admin;
  return safe;
}

async function findByEmail(email) {
  const normalized = typeof email === 'string' ? email.trim().toLowerCase() : '';
  if (!normalized) return null;
  return prisma.admin.findUnique({ where: { email: normalized } });
}

async function loginAdmin(email, password) {
  const normalizedEmail = typeof email === 'string' ? email.trim().toLowerCase() : '';
  if (!normalizedEmail || !password) {
    throw httpError('email and password are required');
  }

  const admin = await findByEmail(normalizedEmail);
  if (!admin) {
    throw httpError('Invalid email or password', 401);
  }

  const valid = await comparePassword(password, admin.passwordHash);
  if (!valid) {
    throw httpError('Invalid email or password', 401);
  }
  if (!admin.isActive) {
    throw httpError('Account is disabled', 403);
  }
  if (admin.role === 'staff') {
    throw httpError('Nhân viên đăng nhập tại /staff/login', 403);
  }

  const tokens = await tokenService.createAdminSession(admin);
  return {
    ...tokens,
    admin: sanitizeAdmin(admin),
    user: sanitizeAdmin(admin),
  };
}

/** Cookie login SSR — chỉ access token trong cookie */
async function loginAdminForCookie(email, password) {
  const normalizedEmail = typeof email === 'string' ? email.trim().toLowerCase() : '';
  if (!normalizedEmail || !password) {
    throw httpError('email and password are required');
  }

  const admin = await findByEmail(normalizedEmail);
  if (!admin) {
    throw httpError('Invalid email or password', 401);
  }

  const valid = await comparePassword(password, admin.passwordHash);
  if (!valid) {
    throw httpError('Invalid email or password', 401);
  }
  if (!admin.isActive) {
    throw httpError('Account is disabled', 403);
  }
  if (admin.role === 'staff') {
    throw httpError('Nhân viên đăng nhập tại /staff/login', 403);
  }

  const tokens = await tokenService.createAdminAccessOnly(admin);
  return { admin: sanitizeAdmin(admin), ...tokens };
}

/** Cookie login portal nhân viên — chỉ role staff + propertyId */
async function loginStaffForCookie(email, password) {
  const normalizedEmail = typeof email === 'string' ? email.trim().toLowerCase() : '';
  if (!normalizedEmail || !password) {
    throw httpError('email and password are required');
  }

  const admin = await prisma.admin.findUnique({
    where: { email: normalizedEmail },
    include: { property: { select: { id: true, name: true } } },
  });
  if (!admin) {
    throw httpError('Invalid email or password', 401);
  }

  const valid = await comparePassword(password, admin.passwordHash);
  if (!valid) {
    throw httpError('Invalid email or password', 401);
  }
  if (!admin.isActive) {
    throw httpError('Account is disabled', 403);
  }
  if (admin.role !== 'staff') {
    throw httpError('Tài khoản quản trị đăng nhập tại /auth/login', 403);
  }
  if (!admin.propertyId) {
    throw httpError('Tài khoản nhân viên chưa được gắn cơ sở. Liên hệ quản trị viên.', 403);
  }

  const tokens = await tokenService.createAdminAccessOnly(admin);
  return { admin: sanitizeAdmin(admin), ...tokens };
}

async function getAdminById(id) {
  const adminId = Number(id);
  if (!Number.isInteger(adminId)) return null;
  const admin = await prisma.admin.findUnique({ where: { id: adminId } });
  if (!admin || !admin.isActive) return null;
  return sanitizeAdmin(admin);
}

module.exports = {
  loginAdmin,
  loginAdminForCookie,
  loginStaffForCookie,
  getAdminById,
  sanitizeAdmin,
  findByEmail,
};
