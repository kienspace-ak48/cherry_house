const express = require('express');
const authMiddleware = require('../../middleware/auth.middleware');
const optionalAdminAuth = require('../../middleware/optionalAdminAuth.middleware');
const bookingController = require('./booking.controller');

const router = express.Router();

router.post('/check-availability', bookingController.checkAvailability);
router.get('/occupancy', optionalAdminAuth, bookingController.getOccupancy);
router.get('/me', authMiddleware, bookingController.listMine);
router.get('/', bookingController.list);
router.get('/:id', bookingController.getById);
router.post('/', bookingController.create);
router.patch('/:id', bookingController.update);
router.patch('/:id/status', bookingController.patchStatus);

module.exports = router;
