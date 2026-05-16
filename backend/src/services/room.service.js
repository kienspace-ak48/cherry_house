const roomRepository = require('../repositories/room.repository');

function parseId(raw) {
  const id = Number.parseInt(raw, 10);
  if (!Number.isInteger(id) || id < 1) {
    const err = new Error('Invalid room id');
    err.statusCode = 400;
    throw err;
  }
  return id;
}

function assertCreatePayload(body) {
  const name = typeof body.name === 'string' ? body.name.trim() : '';
  if (!name) {
    const err = new Error('Name is required');
    err.statusCode = 400;
    throw err;
  }
  const description =
    body.description !== undefined && body.description !== null
      ? String(body.description).trim()
      : '';
  return { name, description };
}

function buildUpdatePayload(body) {
  const data = {};
  if (body.name !== undefined) {
    const name = typeof body.name === 'string' ? body.name.trim() : '';
    if (!name) {
      const err = new Error('Name cannot be empty');
      err.statusCode = 400;
      throw err;
    }
    data.name = name;
  }
  if (body.description !== undefined) {
    data.description =
      body.description === null ? '' : String(body.description).trim();
  }
  if (Object.keys(data).length === 0) {
    const err = new Error('No fields to update');
    err.statusCode = 400;
    throw err;
  }
  return data;
}

async function listRooms() {
  return roomRepository.findAll();
}

async function getRoomById(roomIdRaw) {
  const id = parseId(roomIdRaw);
  const room = await roomRepository.findById(id);
  return room;
}

async function createRoom(body) {
  const data = assertCreatePayload(body);
  return roomRepository.create(data);
}

async function updateRoom(roomIdRaw, body) {
  const id = parseId(roomIdRaw);
  const data = buildUpdatePayload(body);
  return roomRepository.update(id, data);
}

async function deleteRoom(roomIdRaw) {
  const id = parseId(roomIdRaw);
  return roomRepository.remove(id);
}

module.exports = {
  listRooms,
  getRoomById,
  createRoom,
  updateRoom,
  deleteRoom,
};
