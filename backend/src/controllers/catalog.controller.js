const catalogService = require('../services/catalog.service');
const { sendApiError } = require('../utils/http');

async function listProperties(req, res) {
  try {
    const data = await catalogService.listProperties(req.query);
    res.json({ success: true, data });
  } catch (error) {
    sendApiError(res, error);
  }
}

async function getPropertyBySlug(req, res) {
  try {
    const property = await catalogService.getPropertyBySlug(req.params.slug);
    if (!property) {
      return res.status(404).json({ success: false, message: 'Property not found' });
    }
    res.json({ success: true, data: property });
  } catch (error) {
    sendApiError(res, error);
  }
}

async function getPropertyById(req, res) {
  try {
    const property = await catalogService.getPropertyById(req.params.id);
    if (!property) {
      return res.status(404).json({ success: false, message: 'Property not found' });
    }
    res.json({ success: true, data: property });
  } catch (error) {
    sendApiError(res, error);
  }
}

async function listPropertyBranches(req, res) {
  try {
    const data = await catalogService.listBranchesByProperty(req.params.id, req.query);
    res.json({ success: true, data });
  } catch (error) {
    sendApiError(res, error);
  }
}

async function listBranches(req, res) {
  try {
    const data = await catalogService.listBranches(req.query);
    res.json({ success: true, data });
  } catch (error) {
    sendApiError(res, error);
  }
}

async function getBranchById(req, res) {
  try {
    const branch = await catalogService.getBranchById(req.params.id);
    if (!branch) {
      return res.status(404).json({ success: false, message: 'Branch not found' });
    }
    res.json({ success: true, data: branch });
  } catch (error) {
    sendApiError(res, error);
  }
}

async function getBranchByPropertyAndCode(req, res) {
  try {
    const branch = await catalogService.getBranchByPropertyAndCode(
      req.params.propertyId,
      req.params.code,
    );
    if (!branch) {
      return res.status(404).json({ success: false, message: 'Branch not found' });
    }
    res.json({ success: true, data: branch });
  } catch (error) {
    sendApiError(res, error);
  }
}

async function listRooms(req, res) {
  try {
    const data = await catalogService.listRooms(req.query);
    res.json({ success: true, data });
  } catch (error) {
    sendApiError(res, error);
  }
}

async function listBranchRooms(req, res) {
  try {
    const data = await catalogService.listRoomsByBranchId(req.params.branchId, req.query);
    res.json({ success: true, data });
  } catch (error) {
    sendApiError(res, error);
  }
}

async function getRoomById(req, res) {
  try {
    const room = await catalogService.getRoomById(req.params.id);
    if (!room) {
      return res.status(404).json({ success: false, message: 'Room not found' });
    }
    res.json({ success: true, data: room });
  } catch (error) {
    sendApiError(res, error);
  }
}

async function getRoomDetail(req, res) {
  try {
    const room = await catalogService.getRoomDetail(req.query);
    if (!room) {
      return res.status(404).json({ success: false, message: 'Room not found' });
    }
    res.json({ success: true, data: room });
  } catch (error) {
    sendApiError(res, error);
  }
}

module.exports = {
  listProperties,
  getPropertyBySlug,
  getPropertyById,
  listPropertyBranches,
  listBranches,
  getBranchById,
  getBranchByPropertyAndCode,
  listRooms,
  listBranchRooms,
  getRoomById,
  getRoomDetail,
};
