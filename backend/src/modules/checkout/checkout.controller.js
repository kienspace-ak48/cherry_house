const {
  IpnFailChecksum,
  IpnSuccess,
  IpnUnknownError,
} = require('vnpay');
const checkoutService = require('./checkout.service');
const sepayPgService = require('../../services/sepayPg.service');
const { sendApiError } = require('../../utils/http');

async function startPay(req, res) {
  try {
    const data = await checkoutService.startCheckout(req, req.body);
    res.status(201).json({ success: true, data });
  } catch (error) {
    sendApiError(res, error);
  }
}

async function getStatus(req, res) {
  try {
    const data = await checkoutService.getBookingStatus(req.params.bookingCode);
    res.json({ success: true, data });
  } catch (error) {
    sendApiError(res, error);
  }
}

async function verifyVnpay(req, res) {
  try {
    const data = await checkoutService.verifyVnpayReturn(req.query);
    res.json({ success: true, data });
  } catch (error) {
    sendApiError(res, error);
  }
}

async function sepayIpn(req, res) {
  if (!sepayPgService.isIpnAuthorized(req)) {
    return res.status(401).json({ success: false, message: 'Unauthorized IPN' });
  }
  try {
    const result = await checkoutService.handleSepayIpn(req.body);
    console.info('[checkout-sepay-ipn]', JSON.stringify(req.body));
    return res.status(200).json({ success: true, ...result });
  } catch (error) {
    console.error('[checkout-sepay-ipn]', error);
    return res.status(500).json({ success: false });
  }
}

function queryFromReq(req) {
  return Object.keys(req.query || {}).length ? req.query : req.body || {};
}

async function vnpayIpn(req, res) {
  try {
    const { verify, handled } = await checkoutService.handleVnpayIpn(queryFromReq(req));
    console.info('[checkout-vnpay-ipn]', JSON.stringify({
      txnRef: verify.vnp_TxnRef,
      handled,
      isSuccess: verify.isSuccess,
    }));

    if (!verify.isVerified) return res.json(IpnFailChecksum);
    if (!verify.isSuccess) return res.json(IpnUnknownError);
    if (handled) return res.json(IpnSuccess);
    return res.json(IpnUnknownError);
  } catch (error) {
    console.error('[checkout-vnpay-ipn]', error);
    return res.json(IpnUnknownError);
  }
}

module.exports = {
  startPay,
  getStatus,
  verifyVnpay,
  sepayIpn,
  vnpayIpn,
};
