const { verifyJWT } = require('../utils/generateJWT.util');
const tokenService = require('../auth/token.service');

function getToken(req) {
  const authHeader = req.headers.authorization;
  if (authHeader?.startsWith('Bearer ')) {
    return authHeader.split(' ')[1];
  }
  return null;
}

/** Gắn req.user nếu có access token khách hợp lệ */
async function optionalAuthMiddleware(req, res, next) {
  const token = getToken(req);
  if (!token) {
    return next();
  }
  try {
    const decoded = await verifyJWT(token);
    const payload = tokenService.normalizeJwtPayload(decoded);
    if (payload.typ === 'admin') {
      return next();
    }
    req.user = {
      id: payload.id,
      email: payload.email,
      typ: payload.typ || 'client',
    };
    return next();
  } catch {
    return next();
  }
}

module.exports = optionalAuthMiddleware;
