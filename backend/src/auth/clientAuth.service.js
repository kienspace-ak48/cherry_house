const prisma = require('../config/prisma.config');
const authService = require('./auth.service');
const adminAuthService = require('./adminAuth.service');
const registrationOtpRepository = require('../repositories/registrationOtp.repository');
const emailChangeOtpRepository = require('../repositories/emailChangeOtp.repository');
const passwordResetOtpRepository = require('../repositories/passwordResetOtp.repository');
const mailService = require('../services/mail.service');
const { hashPassword, comparePassword } = require('../utils/hashPassword.util');
const { generateOtpCode, hashOtp, verifyOtp } = require('../utils/otp.util');
const { httpError } = require('../utils/http');

const OTP_TTL_MS = 10 * 60 * 1000;
const MAX_OTP_ATTEMPTS = 5;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function normalizeEmail(email) {
  return String(email || '').trim().toLowerCase();
}

function isLocalhostUrl(url) {
  return /localhost|127\.0\.0\.1/i.test(String(url || ''));
}

/**
 * URL React sau OAuth. Prod: ưu tiên CLIENT_APP_URL; nếu thiếu/localhost thì suy từ Host (cùng domain VPS).
 * @param {import('express').Request} [req]
 */
function getFrontendUrl(req) {
  const fromEnv = String(process.env.CLIENT_APP_URL || '').trim().replace(/\/$/, '');
  const isProd = process.env.NODE_ENV === 'production';

  if (fromEnv && !(isProd && isLocalhostUrl(fromEnv))) {
    return fromEnv;
  }

  if (req) {
    const forwardedHost = String(req.get('x-forwarded-host') || '').trim();
    const host = forwardedHost || String(req.get('host') || '').trim();
    const proto = String(req.get('x-forwarded-proto') || (req.secure ? 'https' : 'http')).trim();
    if (host && !isLocalhostUrl(host)) {
      return `${proto}://${host}`.replace(/\/$/, '');
    }
  }

  return fromEnv || 'http://localhost:5173';
}

function getGoogleRedirectUri() {
  return process.env.GOOGLE_REDIRECT_URI || 'http://localhost:8080/api/auth/google/callback';
}

function assertGoogleConfigured() {
  if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
    throw httpError('Google đăng nhập chưa được cấu hình trên server', 503);
  }
}

async function sendRegisterOtp(body) {
  const email = normalizeEmail(body.email);
  const fullName = String(body.fullName || '').trim();
  const phone = String(body.phone || '').trim() || null;
  const password = String(body.password || '');

  if (!EMAIL_RE.test(email)) throw httpError('Email không hợp lệ');
  if (!fullName || fullName.length < 2) throw httpError('Họ tên phải có ít nhất 2 ký tự');
  if (!password || password.length < 6) throw httpError('Mật khẩu tối thiểu 6 ký tự');

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) throw httpError('Email đã được đăng ký', 409);
  const adminExists = await adminAuthService.findByEmail(email);
  if (adminExists) throw httpError('Email đã được sử dụng', 409);

  const otpCode = generateOtpCode();
  const otpHash = await hashOtp(otpCode);
  const passwordHash = await hashPassword(password);
  const expiresAt = new Date(Date.now() + OTP_TTL_MS);

  await registrationOtpRepository.upsert({
    email,
    otpHash,
    fullName,
    phone,
    passwordHash,
    expiresAt,
    attempts: 0,
  });

  const mailResult = await mailService.sendRegistrationOtp({
    to: email,
    fullName,
    otpCode,
  });

  const debugOtp = process.env.AUTH_DEBUG_OTP === 'true' ? otpCode : undefined;

  if (!mailResult.success && !debugOtp) {
    throw httpError('Không gửi được email OTP. Kiểm tra cấu hình GMAIL trên server.', 503);
  }

  return {
    email,
    expiresInMinutes: OTP_TTL_MS / 60000,
    expiresAt: expiresAt.toISOString(),
    message: 'Mã OTP đã gửi tới email của bạn',
    debugOtp,
  };
}

async function verifyRegisterOtp(body) {
  const email = normalizeEmail(body.email);
  const otp = String(body.otp || '').trim();

  if (!EMAIL_RE.test(email)) throw httpError('Email không hợp lệ');
  if (!/^\d{6}$/.test(otp)) throw httpError('Mã OTP phải gồm 6 chữ số');

  const record = await registrationOtpRepository.findByEmail(email);
  if (!record) throw httpError('Chưa có yêu cầu đăng ký cho email này. Vui lòng điền form lại.', 404);

  if (record.expiresAt < new Date()) {
    await registrationOtpRepository.removeByEmail(email);
    throw httpError('Mã OTP đã hết hạn. Vui lòng đăng ký lại.', 410);
  }

  if (record.attempts >= MAX_OTP_ATTEMPTS) {
    await registrationOtpRepository.removeByEmail(email);
    throw httpError('Nhập sai quá nhiều lần. Vui lòng đăng ký lại.', 429);
  }

  const valid = await verifyOtp(otp, record.otpHash);
  if (!valid) {
    await registrationOtpRepository.incrementAttempts(record.id, record.attempts + 1);
    throw httpError('Mã OTP không đúng', 400);
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    await registrationOtpRepository.removeByEmail(email);
    throw httpError('Email đã được đăng ký', 409);
  }

  const user = await prisma.user.create({
    data: {
      email,
      fullName: record.fullName,
      phone: record.phone,
      passwordHash: record.passwordHash,
      authProvider: 'local',
      emailVerified: true,
      isActive: true,
    },
  });

  await registrationOtpRepository.removeByEmail(email);
  return authService.issueClientSession(user);
}

async function loginClient(email, password) {
  return authService.loginClient(email, password);
}

async function refreshSession(refreshToken) {
  return authService.refreshClientSession(refreshToken);
}

async function logout(refreshToken) {
  return authService.logoutClient(refreshToken);
}

function getGoogleAuthUrl() {
  assertGoogleConfigured();
  const { OAuth2Client } = require('google-auth-library');
  const client = new OAuth2Client(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    getGoogleRedirectUri(),
  );
  return client.generateAuthUrl({
    access_type: 'offline',
    scope: ['openid', 'email', 'profile'],
    prompt: 'select_account',
  });
}

async function upsertUserFromGooglePayload(payload) {
  if (!payload?.email) throw httpError('Không lấy được email từ Google', 400);

  const email = normalizeEmail(payload.email);
  const googleId = payload.sub;
  const fullName = payload.name || email.split('@')[0];
  const avatarUrl = payload.picture || null;

  const googleProfile = {
    fullName,
    avatarUrl,
    googleId,
    authProvider: 'google',
    emailVerified: true,
  };

  let user = await prisma.user.findFirst({
    where: { OR: [{ googleId }, { email }] },
  });

  if (user) {
    user = await prisma.user.update({
      where: { id: user.id },
      data: googleProfile,
    });
  } else {
    user = await prisma.user.create({
      data: {
        email,
        ...googleProfile,
        isActive: true,
      },
    });
  }

  if (!user.isActive) throw httpError('Tài khoản đã bị vô hiệu hóa', 403);

  return authService.issueClientSession(user);
}

async function verifyGoogleIdToken(idToken) {
  assertGoogleConfigured();
  const { OAuth2Client } = require('google-auth-library');
  const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
  const ticket = await client.verifyIdToken({
    idToken,
    audience: process.env.GOOGLE_CLIENT_ID,
  });
  return ticket.getPayload();
}

async function handleGoogleCallback(code) {
  assertGoogleConfigured();
  const { OAuth2Client } = require('google-auth-library');
  const client = new OAuth2Client(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    getGoogleRedirectUri(),
  );

  const { tokens } = await client.getToken(code);
  if (!tokens.id_token) throw httpError('Google không trả id_token', 400);

  const payload = await verifyGoogleIdToken(tokens.id_token);
  return upsertUserFromGooglePayload(payload);
}

async function handleGoogleMobile(idToken) {
  if (!idToken) throw httpError('Thiếu idToken Google', 400);
  const payload = await verifyGoogleIdToken(idToken);
  return upsertUserFromGooglePayload(payload);
}

function formatClientUser(user) {
  const safe = authService.sanitizeUser(user);
  const profileMeta =
    safe.profileMeta && typeof safe.profileMeta === 'object' && !Array.isArray(safe.profileMeta)
      ? safe.profileMeta
      : null;
  return {
    ...safe,
    phone: safe.phone || null,
    profileMeta,
  };
}

async function getMe(userId) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user || !user.isActive) throw httpError('User not found', 404);
  return formatClientUser(user);
}

const PROFILE_META_KEYS = ['gender', 'birthDay', 'birthMonth', 'birthYear', 'city'];

function normalizePhone(raw) {
  const phone = String(raw || '').trim();
  if (!phone) return null;
  if (!/^[\d+\s().-]{8,20}$/.test(phone)) {
    throw httpError('Số điện thoại không hợp lệ');
  }
  return phone.replace(/\s+/g, ' ');
}

function parseProfileMeta(raw) {
  if (raw == null) return undefined;
  if (typeof raw !== 'object' || Array.isArray(raw)) {
    throw httpError('profileMeta phải là object');
  }
  /** @type {Record<string, string>} */
  const next = {};
  for (const key of PROFILE_META_KEYS) {
    if (raw[key] == null) continue;
    const value = String(raw[key]).trim();
    if (value) next[key] = value;
  }
  return Object.keys(next).length ? next : null;
}

async function updateMe(userId, body = {}) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user || !user.isActive) throw httpError('User not found', 404);

  if (body.email !== undefined) {
    throw httpError('Không thể đổi email tại đây', 400);
  }

  /** @type {Record<string, unknown>} */
  const data = {};

  if (body.fullName !== undefined) {
    const fullName = String(body.fullName || '').trim();
    if (fullName.length < 2) throw httpError('Họ tên phải có ít nhất 2 ký tự');
    data.fullName = fullName;
  }

  if (body.phone !== undefined) {
    data.phone = normalizePhone(body.phone);
  }

  if (body.profileMeta !== undefined) {
    data.profileMeta = parseProfileMeta(body.profileMeta);
  }

  if (!Object.keys(data).length) {
    throw httpError('Không có dữ liệu để cập nhật');
  }

  const updated = await prisma.user.update({
    where: { id: userId },
    data,
  });
  return formatClientUser(updated);
}

async function assertNewEmailAvailable(newEmail, currentUserId) {
  const existingUser = await prisma.user.findUnique({ where: { email: newEmail } });
  if (existingUser && existingUser.id !== currentUserId) {
    throw httpError('Email đã được sử dụng', 409);
  }
  const adminExists = await adminAuthService.findByEmail(newEmail);
  if (adminExists) throw httpError('Email đã được sử dụng', 409);
  const pendingReg = await registrationOtpRepository.findByEmail(newEmail);
  if (pendingReg) throw httpError('Email đang trong quá trình đăng ký', 409);
}

async function requestEmailChange(userId, body = {}) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user || !user.isActive) throw httpError('User not found', 404);

  const newEmail = normalizeEmail(body.newEmail);
  if (!EMAIL_RE.test(newEmail)) throw httpError('Email mới không hợp lệ');
  if (newEmail === normalizeEmail(user.email)) {
    throw httpError('Email mới phải khác email hiện tại', 400);
  }

  await assertNewEmailAvailable(newEmail, userId);

  const isLocal = user.authProvider === 'local' && user.passwordHash;
  if (isLocal) {
    const currentPassword = String(body.currentPassword || '');
    if (!currentPassword) throw httpError('Vui lòng nhập mật khẩu hiện tại', 400);
    const valid = await comparePassword(currentPassword, user.passwordHash);
    if (!valid) throw httpError('Mật khẩu hiện tại không đúng', 400);
  }

  const otpCode = generateOtpCode();
  const otpHash = await hashOtp(otpCode);
  const expiresAt = new Date(Date.now() + OTP_TTL_MS);

  await emailChangeOtpRepository.upsertByUserId({
    userId,
    newEmail,
    otpHash,
    expiresAt,
    attempts: 0,
  });

  const mailResult = await mailService.sendEmailChangeOtp({
    to: user.email,
    fullName: user.fullName,
    otpCode,
    newEmail,
  });

  const debugOtp = process.env.AUTH_DEBUG_OTP === 'true' ? otpCode : undefined;

  if (!mailResult.success && !debugOtp) {
    throw httpError('Không gửi được email OTP. Kiểm tra cấu hình GMAIL trên server.', 503);
  }

  return {
    currentEmail: user.email,
    newEmail,
    expiresInMinutes: OTP_TTL_MS / 60000,
    expiresAt: expiresAt.toISOString(),
    message: 'Mã OTP đã gửi tới email hiện tại của bạn',
    debugOtp,
  };
}

async function confirmEmailChange(userId, body = {}) {
  const otp = String(body.otp || '').trim();
  if (!/^\d{6}$/.test(otp)) throw httpError('Mã OTP phải gồm 6 chữ số');

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user || !user.isActive) throw httpError('User not found', 404);

  const record = await emailChangeOtpRepository.findByUserId(userId);
  if (!record) {
    throw httpError('Chưa có yêu cầu đổi email. Vui lòng bắt đầu lại.', 404);
  }

  if (record.expiresAt < new Date()) {
    await emailChangeOtpRepository.removeByUserId(userId);
    throw httpError('Mã OTP đã hết hạn. Vui lòng yêu cầu mã mới.', 410);
  }

  if (record.attempts >= MAX_OTP_ATTEMPTS) {
    await emailChangeOtpRepository.removeByUserId(userId);
    throw httpError('Nhập sai quá nhiều lần. Vui lòng yêu cầu mã mới.', 429);
  }

  const valid = await verifyOtp(otp, record.otpHash);
  if (!valid) {
    await emailChangeOtpRepository.incrementAttempts(record.id, record.attempts + 1);
    throw httpError('Mã OTP không đúng', 400);
  }

  const newEmail = normalizeEmail(record.newEmail);
  await assertNewEmailAvailable(newEmail, userId);

  const updated = await prisma.user.update({
    where: { id: userId },
    data: {
      email: newEmail,
      emailVerified: true,
    },
  });

  await emailChangeOtpRepository.removeByUserId(userId);
  return formatClientUser(updated);
}

const PASSWORD_RESET_GENERIC_MSG =
  'Nếu email tồn tại và là tài khoản đăng ký bằng email, mã OTP đã được gửi.';

async function requestPasswordReset(body = {}) {
  const email = normalizeEmail(body.email);
  if (!EMAIL_RE.test(email)) throw httpError('Email không hợp lệ');

  const user = await prisma.user.findUnique({ where: { email } });
  const canReset =
    user
    && user.isActive
    && user.authProvider === 'local'
    && user.passwordHash;

  if (!canReset) {
    return {
      email,
      message: PASSWORD_RESET_GENERIC_MSG,
    };
  }

  const otpCode = generateOtpCode();
  const otpHash = await hashOtp(otpCode);
  const expiresAt = new Date(Date.now() + OTP_TTL_MS);

  await passwordResetOtpRepository.upsert({
    email,
    otpHash,
    expiresAt,
    attempts: 0,
  });

  const mailResult = await mailService.sendPasswordResetOtp({
    to: email,
    fullName: user.fullName,
    otpCode,
  });

  const debugOtp = process.env.AUTH_DEBUG_OTP === 'true' ? otpCode : undefined;

  if (!mailResult.success && !debugOtp) {
    throw httpError('Không gửi được email OTP. Kiểm tra cấu hình GMAIL trên server.', 503);
  }

  return {
    email,
    expiresInMinutes: OTP_TTL_MS / 60000,
    expiresAt: expiresAt.toISOString(),
    message: PASSWORD_RESET_GENERIC_MSG,
    debugOtp,
  };
}

async function confirmPasswordReset(body = {}) {
  const email = normalizeEmail(body.email);
  const otp = String(body.otp || '').trim();
  const newPassword = String(body.newPassword || '');

  if (!EMAIL_RE.test(email)) throw httpError('Email không hợp lệ');
  if (!/^\d{6}$/.test(otp)) throw httpError('Mã OTP phải gồm 6 chữ số');
  if (!newPassword || newPassword.length < 6) {
    throw httpError('Mật khẩu mới tối thiểu 6 ký tự');
  }

  const record = await passwordResetOtpRepository.findByEmail(email);
  if (!record) {
    throw httpError('Chưa có yêu cầu đặt lại mật khẩu. Vui lòng gửi lại OTP.', 404);
  }

  if (record.expiresAt < new Date()) {
    await passwordResetOtpRepository.removeByEmail(email);
    throw httpError('Mã OTP đã hết hạn. Vui lòng yêu cầu mã mới.', 410);
  }

  if (record.attempts >= MAX_OTP_ATTEMPTS) {
    await passwordResetOtpRepository.removeByEmail(email);
    throw httpError('Nhập sai quá nhiều lần. Vui lòng yêu cầu mã mới.', 429);
  }

  const valid = await verifyOtp(otp, record.otpHash);
  if (!valid) {
    await passwordResetOtpRepository.incrementAttempts(record.id, record.attempts + 1);
    throw httpError('Mã OTP không đúng', 400);
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !user.isActive || user.authProvider !== 'local' || !user.passwordHash) {
    await passwordResetOtpRepository.removeByEmail(email);
    throw httpError('Không thể đặt lại mật khẩu cho tài khoản này', 400);
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { passwordHash: await hashPassword(newPassword) },
  });

  await passwordResetOtpRepository.removeByEmail(email);

  return {
    ok: true,
    message: 'Đã cập nhật mật khẩu. Bạn có thể đăng nhập.',
  };
}

async function changePassword(userId, body = {}) {
  const currentPassword = String(body.currentPassword || '');
  const newPassword = String(body.newPassword || '');

  if (!currentPassword || !newPassword) {
    throw httpError('currentPassword và newPassword là bắt buộc');
  }
  if (newPassword.length < 6) {
    throw httpError('Mật khẩu mới tối thiểu 6 ký tự');
  }

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user || !user.isActive) throw httpError('User not found', 404);
  if (user.authProvider !== 'local' || !user.passwordHash) {
    throw httpError('Tài khoản Google không đổi mật khẩu tại đây', 400);
  }

  const valid = await comparePassword(currentPassword, user.passwordHash);
  if (!valid) throw httpError('Mật khẩu hiện tại không đúng', 400);

  await prisma.user.update({
    where: { id: userId },
    data: { passwordHash: await hashPassword(newPassword) },
  });

  return { ok: true };
}

module.exports = {
  sendRegisterOtp,
  verifyRegisterOtp,
  loginClient,
  refreshSession,
  logout,
  getGoogleAuthUrl,
  handleGoogleCallback,
  handleGoogleMobile,
  getMe,
  updateMe,
  changePassword,
  requestEmailChange,
  confirmEmailChange,
  requestPasswordReset,
  confirmPasswordReset,
  getFrontendUrl,
};
