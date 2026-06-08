const bookingService = require('./booking.service');
const { sendApiError } = require('../../utils/http');

async function list(req, res) {
  try {
    const data = await bookingService.list(req.query);
    res.json({ success: true, data });
  } catch (error) {
    sendApiError(res, error);
  }
}

async function listMine(req, res) {
  try {
    const data = await bookingService.listForUser(req.user);
    res.json({ success: true, data });
  } catch (error) {
    sendApiError(res, error);
  }
}

async function getById(req, res) {
  try {
    const item = await bookingService.getById(req.params.id);
    if (!item) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }
    res.json({ success: true, data: item });
  } catch (error) {
    sendApiError(res, error);
  }
}

async function create(req, res) {
  try {
    const item = await bookingService.create(req.body);
    res.status(201).json({ success: true, data: item });
  } catch (error) {
    sendApiError(res, error);
  }
}

async function patchStatus(req, res) {
  try {
    const item = await bookingService.patchStatus(req.params.id, req.body);
    res.json({ success: true, data: item });
  } catch (error) {
    sendApiError(res, error);
  }
}

async function update(req, res) {
  try {
    const item = await bookingService.update(req.params.id, req.body);
    res.json({ success: true, data: item });
  } catch (error) {
    sendApiError(res, error);
  }
}

async function checkAvailability(req, res) {
  try {
    const data = await bookingService.checkAvailability(req.body);
    res.json({ success: true, data });
  } catch (error) {
    sendApiError(res, error);
  }
}

async function getOccupancy(req, res) {
  try {
    const data = await bookingService.getBranchOccupancy(req.query);
    res.json({ success: true, data });
  } catch (error) {
    sendApiError(res, error);
  }
}

module.exports = {
  list,
  listMine,
  getById,
  create,
  update,
  patchStatus,
  checkAvailability,
  getOccupancy,
};
