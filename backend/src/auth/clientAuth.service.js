const prisma = require('../config/prisma.config');
const authService = require('./auth.service');
const adminAuthService = require('./adminAuth.service');
const registrationOtpRepository = require('../repositories/registrationOtp.repository');
const mailService = require('../services/mail.service');
const { hashPassword } = require('../utils/hashPassword.util');
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

async function getMe(userId) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user || !user.isActive) throw httpError('User not found', 404);
  return authService.sanitizeUser(user);
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
  getFrontendUrl,
};
