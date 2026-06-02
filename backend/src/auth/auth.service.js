const prisma = require('../config/prisma.config');
const { hashPassword, comparePassword } = require('../utils/hashPassword.util');
const { generateJWT } = require('../utils/generateJWT.util');
const { httpError } = require('../utils/http');

const ADMIN_ROLES = new Set(['admin', 'super_admin']);

function assertAdminUser(user) {
  if (!user) throw httpError('User not found', 404);
  if (!user.isActive) throw httpError('Account is disabled', 403);
  if (!ADMIN_ROLES.has(user.role)) {
    throw httpError('Not an admin account', 403);
  }
}

function sanitizeUser(user) {
  const { passwordHash, ...safe } = user;
  return safe;
}

async function register(data) {
  const existingUser = await prisma.user.findUnique({
    where: { email: data.email },
  });
  if (existingUser) {
    throw httpError('User already exists', 409);
  }
  const hashedPassword = await hashPassword(data.password);
  const user = await prisma.user.create({
    data: {
      email: data.email,
      passwordHash: hashedPassword,
      fullName: data.fullName,
      phone: data.phone,
      membershipTier: data.membershipTier,
      isActive: data.isActive,
      role: data.role,
    },
  });
  return sanitizeUser(user);
}

async function login(email, password) {
  const normalizedEmail = typeof email === 'string' ? email.trim().toLowerCase() : '';
  if (!normalizedEmail || !password) {
    throw httpError('email and password are required');
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

  return user;
}

async function issueToken(user) {
  const token = await generateJWT({
    id: user.id,
    email: user.email,
    role: user.role,
  });
  return { user: sanitizeUser(user), token };
}

/** Login client (React) — trả JWT, client tự lưu localStorage */
async function loginClient(email, password) {
  const user = await login(email, password);
  return issueToken(user);
}

/** Login admin — trả JWT, admin panel lưu localStorage riêng */
async function loginAdmin(email, password) {
  const user = await login(email, password);
  assertAdminUser(user);
  return issueToken(user);
}

module.exports = {
  register,
  login,
  loginClient,
  loginAdmin,
  sanitizeUser,
};
