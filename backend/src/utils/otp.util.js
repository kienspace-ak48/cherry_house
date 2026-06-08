const crypto = require('crypto');
const { hashPassword, comparePassword } = require('./hashPassword.util');

function generateOtpCode() {
  return String(crypto.randomInt(100000, 1000000));
}

async function hashOtp(code) {
  return hashPassword(String(code));
}

async function verifyOtp(code, otpHash) {
  return comparePassword(String(code), otpHash);
}

module.exports = { generateOtpCode, hashOtp, verifyOtp };
