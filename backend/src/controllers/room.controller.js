const roomService = require('../services/room.service');

function isNotFoundPrismaError(error) {
  return error?.code === 'P2025';
}

async function list(req, res) {
  try {
    const data = await roomService.listRooms();
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}

async function getById(req, res) {
  try {
    const room = await roomService.getRoomById(req.params.id);
    if (!room) {
      return res
        .status(404)
        .json({ success: false, message: 'Room not found' });
    }
    res.json({ success: true, data: room });
  } catch (error) {
    const status = error.statusCode || 500;
    if (status === 500 && isNotFoundPrismaError(error)) {
      return res
        .status(404)
        .json({ success: false, message: 'Room not found' });
    }
    res.status(status).json({ success: false, message: error.message });
  }
}

async function create(req, res) {
  try {
    const roomData = {name: "Room 002", description: "Room 002 description"};
    const room = await roomService.createRoom(roomData);
    res.status(201).json({ success: true, data: room });
  } catch (error) {
    const status = error.statusCode || 500;
    res.status(status).json({ success: false, message: error.message });
  }
}

async function update(req, res) {
  try {
    const room = await roomService.updateRoom(req.params.id, req.body);
    res.json({ success: true, data: room });
  } catch (error) {
    const status = error.statusCode || 500;
    if (status === 500 && isNotFoundPrismaError(error)) {
      return res
        .status(404)
        .json({ success: false, message: 'Room not found' });
    }
    res.status(status).json({ success: false, message: error.message });
  }
}

async function remove(req, res) {
  try {
    await roomService.deleteRoom(req.params.id);
    res.json({ success: true, message: 'Room deleted' });
  } catch (error) {
    const status = error.statusCode || 500;
    if (status === 500 && isNotFoundPrismaError(error)) {
      return res
        .status(404)
        .json({ success: false, message: 'Room not found' });
    }
    res.status(status).json({ success: false, message: error.message });
  }
}

module.exports = {
  list,
  getById,
  create,
  update,
  remove,
};
