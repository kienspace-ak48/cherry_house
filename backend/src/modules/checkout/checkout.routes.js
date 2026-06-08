const express = require('express');
const optionalAuth = require('../../middleware/optionalAuth.middleware');
const checkoutController = require('./checkout.controller');

const router = express.Router();

/** Tạo booking + khởi tạo thanh toán (VNPay / SePay / QR) */
router.post('/pay', optionalAuth, checkoutController.startPay);

/** Tra cứu trạng thái đơn sau thanh toán */
router.get('/status/:bookingCode', checkoutController.getStatus);

/** Xác thực redirect VNPay (frontend gọi với query params) */
router.get('/verify/vnpay', checkoutController.verifyVnpay);

/** IPN production — cấu hình trên cổng thanh toán */
router.post('/ipn/sepay', checkoutController.sepayIpn);
router.get('/ipn/vnpay', checkoutController.vnpayIpn);
router.post('/ipn/vnpay', checkoutController.vnpayIpn);

module.exports = router;
