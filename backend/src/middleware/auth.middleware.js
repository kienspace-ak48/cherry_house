const CNAME = 'auth.middleware.js ';
const { verifyJWT } = require('../utils/generateJWT.util');

function getToken(req) {
  const authHeader = req.headers.authorization;
  if (authHeader?.startsWith('Bearer ')) {
    return authHeader.split(' ')[1];
  }
  return req.cookies?.token || null;
}

const authMiddleware = async (req, res, next) => {
  const token = getToken(req);
  if (!token) {
    if (req.baseUrl.startsWith('/api')) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }
    res.redirect('/auth/login');
    return;
  }
  try {
    const decoded = await verifyJWT(token);
    req.user = decoded;
    next();
  } catch (error) {
    // if (req.baseUrl.startsWith('/api')) {
    //   return res.status(401).json({ success: false, message: 'Unauthorized' });
    // }
    res.redirect('/auth/login');
    return;
  }
};

module.exports = authMiddleware;
