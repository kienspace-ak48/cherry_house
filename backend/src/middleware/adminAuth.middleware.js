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

/** Chỉ JWT typ=admin — bảo vệ /admin/* */
const adminAuthMiddleware = async (req, res, next) => {
  const token = getToken(req);
  if (!token) {
    if (req.baseUrl?.startsWith('/api') || req.originalUrl?.startsWith('/api')) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }
    return res.redirect('/auth/login');
  }

  try {
    const decoded = await verifyJWT(token);
    const payload = tokenService.normalizeJwtPayload(decoded);

    if (payload.typ !== 'admin') {
      if (req.originalUrl?.startsWith('/api')) {
        return res.status(403).json({ success: false, message: 'Admin access required' });
      }
      res.clearCookie(ADMIN_COOKIE, { path: '/' });
      return res.redirect('/auth/login');
    }

    const adminRecord = await adminRepository.findById(payload.id);
    if (!adminRecord || !adminRecord.isActive) {
      if (req.originalUrl?.startsWith('/api') || req.baseUrl?.startsWith('/api')) {
        return res.status(403).json({ success: false, message: 'Account disabled' });
      }
      res.clearCookie(ADMIN_COOKIE, { path: '/' });
      return res.redirect('/auth/login?session=disabled');
    }
    if (adminRecord.role === 'staff') {
      if (req.originalUrl?.startsWith('/api') || req.baseUrl?.startsWith('/api')) {
        return res.status(403).json({ success: false, message: 'Staff must use /staff portal' });
      }
      return res.redirect('/staff');
    }

    req.user = {
      id: adminRecord.id,
      email: adminRecord.email,
      fullName: adminRecord.fullName,
      avatar: adminRecord.avatarUrl || null,
      avatarUrl: adminRecord.avatarUrl || null,
      role: adminRecord.role,
      branchId: adminRecord.branchId,
      propertyId: adminRecord.propertyId ?? adminRecord.branch?.propertyId ?? null,
      branchName: adminRecord.branch?.name ?? null,
      propertyName: adminRecord.property?.name ?? adminRecord.branch?.property?.name ?? null,
      typ: 'admin',
    };
    req.admin = req.user;
    return next();
  } catch (error) {
    if (req.originalUrl?.startsWith('/api') || req.baseUrl?.startsWith('/api')) {
      return res.status(401).json({ success: false, message: 'Token expired or invalid' });
    }
    res.clearCookie(ADMIN_COOKIE, { path: '/' });
    return res.redirect('/auth/login?session=expired');
  }
};

module.exports = adminAuthMiddleware;
