const { verifyJWT } = require('../utils/generateJWT.util');
const tokenService = require('../auth/token.service');

function getToken(req) {
  const authHeader = req.headers.authorization;
  if (authHeader?.startsWith('Bearer ')) {
    return authHeader.split(' ')[1];
  }
  return null;
}

/** JWT khách (typ=client hoặc legacy không có typ) — API React */
const authMiddleware = async (req, res, next) => {
  const token = getToken(req);
  if (!token) {
    return res.status(401).json({ success: false, message: 'Unauthorized', code: 'AUTH_REQUIRED' });
  }

  try {
    const decoded = await verifyJWT(token);
    const payload = tokenService.normalizeJwtPayload(decoded);

    if (payload.typ === 'admin') {
      return res.status(403).json({ success: false, message: 'Client token required', code: 'WRONG_TOKEN_TYPE' });
    }

    req.user = {
      id: payload.id,
      email: payload.email,
      typ: payload.typ || 'client',
    };
    return next();
  } catch (error) {
    const isExpired = error?.name === 'TokenExpiredError';
    return res.status(401).json({
      success: false,
      message: isExpired ? 'Access token expired' : 'Unauthorized',
      code: isExpired ? 'ACCESS_TOKEN_EXPIRED' : 'INVALID_TOKEN',
    });
  }
};

module.exports = authMiddleware;
