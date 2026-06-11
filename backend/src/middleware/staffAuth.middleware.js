const { verifyJWT } = require('../utils/generateJWT.util');
const tokenService = require('../auth/token.service');
const adminRepository = require('../repositories/admin.repository');

const STAFF_COOKIE = 'token';

function getToken(req) {
  const authHeader = req.headers.authorization;
  if (authHeader?.startsWith('Bearer ')) {
    return authHeader.split(' ')[1];
  }
  return req.cookies?.[STAFF_COOKIE] || null;
}

function buildStaffUser(adminRecord) {
  return {
    id: adminRecord.id,
    email: adminRecord.email,
    fullName: adminRecord.fullName,
    role: adminRecord.role,
    propertyId: adminRecord.propertyId,
    propertyName: adminRecord.property?.name ?? null,
    typ: 'admin',
  };
}

/** Chỉ nhân viên (staff) — bảo vệ /staff/* */
const staffAuthMiddleware = async (req, res, next) => {
  const token = getToken(req);
  if (!token) {
    return res.redirect('/staff/login');
  }

  try {
    const decoded = await verifyJWT(token);
    const payload = tokenService.normalizeJwtPayload(decoded);

    if (payload.typ !== 'admin') {
      res.clearCookie(STAFF_COOKIE, { path: '/' });
      return res.redirect('/staff/login?session=invalid');
    }

    const adminRecord = await adminRepository.findById(payload.id);
    if (!adminRecord || !adminRecord.isActive || adminRecord.role !== 'staff') {
      res.clearCookie(STAFF_COOKIE, { path: '/' });
      return res.redirect('/staff/login?session=invalid');
    }
    if (!adminRecord.propertyId) {
      res.clearCookie(STAFF_COOKIE, { path: '/' });
      return res.redirect('/staff/login?session=disabled');
    }

    const staffUser = buildStaffUser(adminRecord);
    req.user = staffUser;
    req.staff = staffUser;
    req.admin = staffUser;
    return next();
  } catch (_error) {
    res.clearCookie(STAFF_COOKIE, { path: '/' });
    return res.redirect('/staff/login?session=expired');
  }
};

module.exports = staffAuthMiddleware;
