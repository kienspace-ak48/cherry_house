const express = require('express');
const paymentService = require('../services/payment.service');

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const data = await paymentService.list(req.query);
    res.json({ success: true, data });
  } catch (error) {
    res.status(error.statusCode || 500).json({ success: false, message: error.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const item = await paymentService.getById(req.params.id);
    if (!item) {
      return res.status(404).json({ success: false, message: 'Payment not found' });
    }
    res.json({ success: true, data: item });
  } catch (error) {
    res.status(error.statusCode || 500).json({ success: false, message: error.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const item = await paymentService.create(req.body);
    res.status(201).json({ success: true, data: item });
  } catch (error) {
    res.status(error.statusCode || 500).json({ success: false, message: error.message });
  }
});

router.patch('/:id/status', async (req, res) => {
  try {
    const item = await paymentService.patchStatus(req.params.id, req.body);
    res.json({ success: true, data: item });
  } catch (error) {
    res.status(error.statusCode || 500).json({ success: false, message: error.message });
  }
});

module.exports = router;
