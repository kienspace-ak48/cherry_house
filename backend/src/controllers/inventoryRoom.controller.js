const inventoryRoomService = require('../services/inventoryRoom.service');
const catalogService = require('../services/catalog.service');

async function list(req, res) {
  try {
    const data = await catalogService.listRooms(req.query);
    res.json({ success: true, data });
  } catch (error) {
    res.status(error.statusCode || 500).json({ success: false, message: error.message });
  }
}

async function getById(req, res) {
  try {
    const item = await catalogService.getRoomById(req.params.id);
    if (!item) {
      return res.status(404).json({ success: false, message: 'Inventory room not found' });
    }
    res.json({ success: true, data: item });
  } catch (error) {
    res.status(error.statusCode || 500).json({ success: false, message: error.message });
  }
}

async function create(req, res) {
  try {
    const item = await inventoryRoomService.create(req.body);
    res.status(201).json({ success: true, data: item });
  } catch (error) {
    res.status(error.statusCode || 500).json({ success: false, message: error.message });
  }
}

async function update(req, res) {
  try {
    const item = await inventoryRoomService.update(req.params.id, req.body);
    res.json({ success: true, data: item });
  } catch (error) {
    res.status(error.statusCode || 500).json({ success: false, message: error.message });
  }
}

async function remove(req, res) {
  try {
    await inventoryRoomService.remove(req.params.id);
    res.json({ success: true, message: 'Inventory room deleted' });
  } catch (error) {
    res.status(error.statusCode || 500).json({ success: false, message: error.message });
  }
}

module.exports = { list, getById, create, update, remove };
