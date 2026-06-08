const jwt = require('jsonwebtoken');

const secret = process.env.JWT_SECRET;

async function generateJWT(payload, expiresInOverride) {
  const expiresIn =
    expiresInOverride
    || process.env.JWT_ACCESS_EXPIRES_IN
    || process.env.JWT_EXPIRES_IN
    || '15m';
  const token = await jwt.sign(payload, secret, { expiresIn });
  return token;
}

async function verifyJWT(token) {
  const decoded = await jwt.verify(token, secret);
  return decoded;
}

module.exports = {
  generateJWT,
  verifyJWT,
};
