const express = require('express');
const {
  IpnFailChecksum,
  IpnSuccess,
  IpnUnknownError,
} = require('vnpay');
const mailService = require('../services/mail.service');
const sepayPgService = require('../services/sepayPg.service');
const vnpayPayService = require('../services/vnpayPay.service');

const router = express.Router();

router.get('/send-mail', async (req, res) => {
  const dataSend = {
    to: 'kienvu.dev@gmail.com',
    subject: 'Test send mail',
    text: 'hello',
  };
  const result = await mailService.sendMail(dataSend);
  res.json(result);
});

/** JSON — xem URL + hidden fields SePay sinh ra (không redirect) */
router.get('/sepay-pg/fields', (req, res) => {
  try {
    const amount = Number(req.query.amount);
    const checkout = sepayPgService.createOneTimeCheckout({
      testBaseUrl: sepayPgService.resolveTestBaseUrl(req),
      orderInvoiceNumber: req.query.invoice || undefined,
      orderAmount: Number.isFinite(amount) && amount > 0 ? amount : undefined,
      paymentMethod: req.query.method || 'BANK_TRANSFER',
      orderDescription: req.query.description || undefined,
    });
    res.json({ success: true, data: checkout });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

/** Trang kết quả sau khi SePay redirect — chỉ test backend */
router.get('/sepay-pg/result', (req, res) => {
  const payment = String(req.query.payment || 'unknown').trim();
  const invoice = String(req.query.invoice || '').trim();
  res.type('html').send(
    sepayPgService.buildResultHtml({ payment, invoice }),
  );
});

/** HTML form — mở trình duyệt và bấm "Thanh toán thử" */
router.get('/sepay-pg', (req, res) => {
  try {
    const amount = Number(req.query.amount);
    const checkout = sepayPgService.createOneTimeCheckout({
      testBaseUrl: sepayPgService.resolveTestBaseUrl(req),
      orderInvoiceNumber: req.query.invoice || undefined,
      orderAmount: Number.isFinite(amount) && amount > 0 ? amount : undefined,
      paymentMethod: req.query.method || 'BANK_TRANSFER',
      orderDescription: req.query.description || undefined,
    });
    res.type('html').send(sepayPgService.buildCheckoutHtml(checkout));
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

/** Tra cứu đơn trên SePay sandbox (sau khi thanh toán / tạo đơn) */
router.get('/sepay-pg/order/:invoice', async (req, res) => {
  try {
    const data = await sepayPgService.retrieveOrder(req.params.invoice);
    res.json({ success: true, data });
  } catch (error) {
    res.status(error?.response?.status || 500).json({
      success: false,
      message: error?.response?.data?.message || error.message,
    });
  }
});

/**
 * IPN test — cấu hình URL này trong SePay sandbox:
 * Payment Gateway → Configuration → IPN
 * http://localhost:8080/test/sepay-pg/ipn  (cần ngrok nếu SePay gọi từ internet)
 */
router.post('/sepay-pg/ipn', (req, res) => {
  if (!sepayPgService.isIpnAuthorized(req)) {
    return res.status(401).json({ success: false, message: 'Unauthorized IPN' });
  }

  const payload = req.body;
  console.info(
    `[sepay-ipn] auth=${sepayPgService.getIpnAuthMode()}`,
    JSON.stringify(payload),
  );

  if (payload?.notification_type === 'ORDER_PAID') {
    const invoice = payload?.order?.order_invoice_number;
    console.info(`[sepay-ipn] ORDER_PAID invoice=${invoice}`);
    // TODO: cập nhật booking/payment trong DB tại đây
  }

  return res.status(200).json({ success: true });
});

/** JSON — URL thanh toán VNPay sandbox */
router.get('/vnpay/url', (req, res) => {
  try {
    const amount = Number(req.query.amount);
    const checkout = vnpayPayService.createPayment(req, {
      amount: Number.isFinite(amount) && amount > 0 ? amount : undefined,
      txnRef: req.query.txnRef || undefined,
      orderInfo: req.query.orderInfo || undefined,
    });
    res.json({ success: true, data: checkout });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

/** JSON — tạo QR VNPay (genqr) */
router.get('/vnpay/qr/json', async (req, res) => {
  try {
    const amount = Number(req.query.amount);
    const data = await vnpayPayService.createQrPayment(req, {
      amount: Number.isFinite(amount) && amount > 0 ? amount : undefined,
      txnRef: req.query.txnRef || undefined,
      orderInfo: req.query.orderInfo || undefined,
    });
    res.json({ success: data.ok, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

/** HTML — hiển thị mã QR quét bằng app ngân hàng */
router.get('/vnpay/qr', async (req, res) => {
  try {
    const amount = Number(req.query.amount);
    const data = await vnpayPayService.createQrPayment(req, {
      amount: Number.isFinite(amount) && amount > 0 ? amount : undefined,
      txnRef: req.query.txnRef || undefined,
      orderInfo: req.query.orderInfo || undefined,
    });
    res.type('html').send(vnpayPayService.buildQrHtml(data));
  } catch (error) {
    res.status(500).type('html').send(
      `<pre style="padding:24px;font-family:system-ui;">VNPay QR error: ${error.message}</pre>`,
    );
  }
});

/** HTML — bấm link chuyển sang cổng VNPay sandbox */
router.get('/vnpay', (req, res) => {
  try {
    const amount = Number(req.query.amount);
    const checkout = vnpayPayService.createPayment(req, {
      amount: Number.isFinite(amount) && amount > 0 ? amount : undefined,
      txnRef: req.query.txnRef || undefined,
      orderInfo: req.query.orderInfo || undefined,
    });
    res.type('html').send(vnpayPayService.buildCheckoutHtml(checkout));
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

/** Return URL — VNPay redirect trình duyệt về đây sau thanh toán */
router.get('/vnpay/return', (req, res) => {
  try {
    const result = vnpayPayService.verifyReturn(req.query);
    console.info('[vnpay-return]', JSON.stringify({
      txnRef: result.vnp_TxnRef,
      isSuccess: result.isSuccess,
      isVerified: result.isVerified,
      responseCode: result.vnp_ResponseCode,
      message: result.message,
    }));
    res.type('html').send(vnpayPayService.buildReturnHtml(result));
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * IPN URL — cấu hình trên VNPay merchant admin (sandbox):
 * https://sandbox.vnpayment.vn/merchantv2/
 */
function handleVnpayIpn(req, res) {
  try {
    const verify = vnpayPayService.verifyIpn(queryFromReq(req));

    console.info('[vnpay-ipn]', JSON.stringify({
      txnRef: verify.vnp_TxnRef,
      isSuccess: verify.isSuccess,
      isVerified: verify.isVerified,
      responseCode: verify.vnp_ResponseCode,
      amount: verify.vnp_Amount,
      message: verify.message,
    }));

    if (!verify.isVerified) {
      return res.json(IpnFailChecksum);
    }
    if (!verify.isSuccess) {
      return res.json(IpnUnknownError);
    }

    // TODO: cập nhật booking/payment trong DB tại đây
    return res.json(IpnSuccess);
  } catch (error) {
    console.error('[vnpay-ipn] error', error);
    return res.json(IpnUnknownError);
  }
}

router.get('/vnpay/ipn', handleVnpayIpn);
router.post('/vnpay/ipn', handleVnpayIpn);

function queryFromReq(req) {
  return Object.keys(req.query || {}).length ? req.query : req.body || {};
}

module.exports = router;
