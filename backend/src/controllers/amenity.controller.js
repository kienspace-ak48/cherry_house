const amenityService = require('../services/amenity.service');

async function list(req, res) {
  try {
    const data = await amenityService.list(req.query);
    res.json({ success: true, data });
  } catch (error) {
    res.status(error.statusCode || 500).json({ success: false, message: error.message });
  }
}

async function getById(req, res) {
  try {
    const item = await amenityService.getById(req.params.id);
    if (!item) {
      return res.status(404).json({ success: false, message: 'Amenity not found' });
    }
    res.json({ success: true, data: item });
  } catch (error) {
    res.status(error.statusCode || 500).json({ success: false, message: error.message });
  }
}

async function create(req, res) {
  try {
    const item = await amenityService.create(req.body);
    res.status(201).json({ success: true, data: item });
  } catch (error) {
    res.status(error.statusCode || 500).json({ success: false, message: error.message });
  }
}

async function update(req, res) {
  try {
    const item = await amenityService.update(req.params.id, req.body);
    res.json({ success: true, data: item });
  } catch (error) {
    res.status(error.statusCode || 500).json({ success: false, message: error.message });
  }
}

async function remove(req, res) {
  try {
    await amenityService.remove(req.params.id);
    res.json({ success: true, message: 'Amenity deleted' });
  } catch (error) {
    res.status(error.statusCode || 500).json({ success: false, message: error.message });
  }
}

module.exports = { list, getById, create, update, remove };
