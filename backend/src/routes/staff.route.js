const express = require('express');
const staffAuthMiddleware = require('../middleware/staffAuth.middleware');
const staffAuthController = require('../auth/staffAuth.controller');
const staffBookingController = require('../controllers/staffBooking.controller');

const router = express.Router();

router.get('/login', staffAuthController.loginForm);
router.post('/login', staffAuthController.login);
router.post('/logout', staffAuthController.logout);

router.use(staffAuthMiddleware);

router.get('/', (_req, res) => res.redirect('/staff/reception'));
router.get('/reception', staffBookingController.reception);
router.get('/bookings/lookup', staffBookingController.lookupAjax);
router.get('/bookings/calendar', staffBookingController.calendar);
router.post('/bookings/:id/mark-paid', staffBookingController.markPaidCounter);
router.post('/bookings/:id/check-in', staffBookingController.checkInGuest);
router.post('/bookings/:id/check-out', staffBookingController.checkOutGuest);
router.get('/bookings/:id', staffBookingController.detail);
router.get('/bookings', staffBookingController.list);

module.exports = router;
