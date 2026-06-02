const roomTypeService = require('../services/roomType.service');

async function list(req, res) {
  try {
    const data = await roomTypeService.list(req.query);
    res.json({ success: true, data });
  } catch (error) {
    res.status(error.statusCode || 500).json({ success: false, message: error.message });
  }
}

async function getById(req, res) {
  try {
    const item = await roomTypeService.getById(req.params.id);
    if (!item) {
      return res.status(404).json({ success: false, message: 'Room type not found' });
    }
    res.json({ success: true, data: item });
  } catch (error) {
    res.status(error.statusCode || 500).json({ success: false, message: error.message });
  }
}

async function getBySlug(req, res) {
  try {
    const item = await roomTypeService.getBySlug(req.params.slug);
    if (!item) {
      return res.status(404).json({ success: false, message: 'Room type not found' });
    }
    res.json({ success: true, data: item });
  } catch (error) {
    res.status(error.statusCode || 500).json({ success: false, message: error.message });
  }
}

async function create(req, res) {
  try {
    const item = await roomTypeService.create(req.body);
    res.status(201).json({ success: true, data: item });
  } catch (error) {
    res.status(error.statusCode || 500).json({ success: false, message: error.message });
  }
}

async function update(req, res) {
  try {
    const item = await roomTypeService.update(req.params.id, req.body);
    res.json({ success: true, data: item });
  } catch (error) {
    res.status(error.statusCode || 500).json({ success: false, message: error.message });
  }
}

async function remove(req, res) {
  try {
    await roomTypeService.remove(req.params.id);
    res.json({ success: true, message: 'Room type deleted' });
  } catch (error) {
    res.status(error.statusCode || 500).json({ success: false, message: error.message });
  }
}

module.exports = { list, getById, getBySlug, create, update, remove };
