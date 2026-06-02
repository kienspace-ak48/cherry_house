const roomTypeGalleryService = require('../services/roomTypeGallery.service');

async function list(req, res) {
  try {
    const data = await roomTypeGalleryService.list(req.query);
    res.json({ success: true, data });
  } catch (error) {
    res.status(error.statusCode || 500).json({ success: false, message: error.message });
  }
}

async function getById(req, res) {
  try {
    const item = await roomTypeGalleryService.getById(req.params.id);
    if (!item) {
      return res.status(404).json({ success: false, message: 'Room type gallery item not found' });
    }
    res.json({ success: true, data: item });
  } catch (error) {
    res.status(error.statusCode || 500).json({ success: false, message: error.message });
  }
}

async function create(req, res) {
  try {
    const item = await roomTypeGalleryService.create(req.body);
    res.status(201).json({ success: true, data: item });
  } catch (error) {
    res.status(error.statusCode || 500).json({ success: false, message: error.message });
  }
}

async function update(req, res) {
  try {
    const item = await roomTypeGalleryService.update(req.params.id, req.body);
    res.json({ success: true, data: item });
  } catch (error) {
    res.status(error.statusCode || 500).json({ success: false, message: error.message });
  }
}

async function remove(req, res) {
  try {
    await roomTypeGalleryService.remove(req.params.id);
    res.json({ success: true, message: 'Room type gallery item deleted' });
  } catch (error) {
    res.status(error.statusCode || 500).json({ success: false, message: error.message });
  }
}

module.exports = { list, getById, create, update, remove };
