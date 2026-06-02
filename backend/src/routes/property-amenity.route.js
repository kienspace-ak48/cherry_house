const express = require('express');
const propertyAmenityService = require('../services/propertyAmenity.service');

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const data = await propertyAmenityService.list(req.query);
    res.json({ success: true, data });
  } catch (error) {
    res.status(error.statusCode || 500).json({ success: false, message: error.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const data = await propertyAmenityService.link(req.body);
    res.status(201).json({ success: true, data });
  } catch (error) {
    res.status(error.statusCode || 500).json({ success: false, message: error.message });
  }
});

router.delete('/', async (req, res) => {
  try {
    await propertyAmenityService.unlink(req.body);
    res.json({ success: true, message: 'Property amenity unlinked' });
  } catch (error) {
    res.status(error.statusCode || 500).json({ success: false, message: error.message });
  }
});

module.exports = router;
