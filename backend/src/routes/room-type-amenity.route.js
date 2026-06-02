const express = require('express');
const roomTypeAmenityService = require('../services/roomTypeAmenity.service');

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const data = await roomTypeAmenityService.list(req.query);
    res.json({ success: true, data });
  } catch (error) {
    res.status(error.statusCode || 500).json({ success: false, message: error.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const data = await roomTypeAmenityService.link(req.body);
    res.status(201).json({ success: true, data });
  } catch (error) {
    res.status(error.statusCode || 500).json({ success: false, message: error.message });
  }
});

router.delete('/', async (req, res) => {
  try {
    await roomTypeAmenityService.unlink(req.body);
    res.json({ success: true, message: 'Room type amenity unlinked' });
  } catch (error) {
    res.status(error.statusCode || 500).json({ success: false, message: error.message });
  }
});

module.exports = router;
