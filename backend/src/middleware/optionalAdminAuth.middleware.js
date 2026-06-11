const { verifyJWT } = require('../utils/generateJWT.util');
const tokenService = require('../auth/token.service');
const adminRepository = require('../repositories/admin.repository');

const ADMIN_COOKIE = 'token';

function getToken(req) {
  const authHeader = req.headers.authorization;
  if (authHeader?.startsWith('Bearer ')) {
    return authHeader.split(' ')[1];
  }
  return req.cookies?.[ADMIN_COOKIE] || null;
}

/** Gắn req.admin nếu có cookie/token admin hợp lệ — không chặn request khi thiếu auth */
async function optionalAdminAuth(req, res, next) {
  const token = getToken(req);
  if (!token) return next();

  try {
    const decoded = await verifyJWT(token);
    const payload = tokenService.normalizeJwtPayload(decoded);
    if (payload.typ !== 'admin') return next();

    const adminRecord = await adminRepository.findById(payload.id);
    if (!adminRecord || !adminRecord.isActive) return next();

    req.user = {
      id: adminRecord.id,
      email: adminRecord.email,
      fullName: adminRecord.fullName,
      role: adminRecord.role,
      branchId: adminRecord.branchId,
      propertyId: adminRecord.propertyId ?? adminRecord.branch?.propertyId ?? null,
      branchName: adminRecord.branch?.name ?? null,
      propertyName: adminRecord.property?.name ?? adminRecord.branch?.property?.name ?? null,
      typ: 'admin',
    };
    req.admin = req.user;
  } catch (_error) {
    /* public API — bỏ qua token lỗi */
  }

  return next();
}

module.exports = optionalAdminAuth;
