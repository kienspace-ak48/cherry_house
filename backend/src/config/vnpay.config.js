const { VNPay, ignoreLogger } = require('vnpay');

const vnpay = new VNPay({
  tmnCode: process.env.VNPAY_TMN_CODE,
  secureSecret: process.env.VNPAY_HASH_SECRET,
  vnpayHost: 'https://sandbox.vnpayment.vn',
  testMode: true,
  logger: ignoreLogger, // tắt log khi không cần
  hashAlgorithm: 'SHA512', // tùy chọn
});

module.exports = vnpay;