const promoCodeService = require('../services/promoCode.service');

async function list(req, res) {
  try {
    const data = await promoCodeService.list(req.query);
    res.json({ success: true, data });
  } catch (error) {
    res.status(error.statusCode || 500).json({ success: false, message: error.message });
  }
}

async function getById(req, res) {
  try {
    const item = await promoCodeService.getById(req.params.id);
    if (!item) {
      return res.status(404).json({ success: false, message: 'Promo code not found' });
    }
    res.json({ success: true, data: item });
  } catch (error) {
    res.status(error.statusCode || 500).json({ success: false, message: error.message });
  }
}

async function getByCode(req, res) {
  try {
    const item = await promoCodeService.getByCode(req.params.code);
    if (!item) {
      return res.status(404).json({ success: false, message: 'Promo code not found' });
    }
    res.json({ success: true, data: item });
  } catch (error) {
    res.status(error.statusCode || 500).json({ success: false, message: error.message });
  }
}

async function create(req, res) {
  try {
    const item = await promoCodeService.create(req.body);
    res.status(201).json({ success: true, data: item });
  } catch (error) {
    res.status(error.statusCode || 500).json({ success: false, message: error.message });
  }
}

async function update(req, res) {
  try {
    const item = await promoCodeService.update(req.params.id, req.body);
    res.json({ success: true, data: item });
  } catch (error) {
    res.status(error.statusCode || 500).json({ success: false, message: error.message });
  }
}

async function remove(req, res) {
  try {
    await promoCodeService.remove(req.params.id);
    res.json({ success: true, message: 'Promo code deleted' });
  } catch (error) {
    res.status(error.statusCode || 500).json({ success: false, message: error.message });
  }
}

module.exports = { list, getById, getByCode, create, update, remove };
