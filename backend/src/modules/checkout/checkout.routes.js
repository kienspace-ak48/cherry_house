const express = require('express');
const authMiddleware = require('../../middleware/auth.middleware');
const checkoutController = require('./checkout.controller');

const router = express.Router();

/** Tạo booking + khởi tạo thanh toán (VNPay / SePay / QR) */
router.post('/pay', authMiddleware, checkoutController.startPay);

/** Tra cứu trạng thái đơn sau thanh toán */
router.get('/status/:bookingCode', checkoutController.getStatus);

/** Xác thực redirect VNPay / MoMo (frontend gọi với query params) */
router.get('/verify/vnpay', checkoutController.verifyVnpay);
router.get('/verify/momo', checkoutController.verifyMomo);

/** IPN production — cấu hình trên cổng thanh toán */
router.post('/ipn/sepay', checkoutController.sepayIpn);
router.post('/ipn/momo', checkoutController.momoIpn);
router.get('/ipn/vnpay', checkoutController.vnpayIpn);
router.post('/ipn/vnpay', checkoutController.vnpayIpn);

module.exports = router;
