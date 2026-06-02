const propertyService = require('../services/property.service');
const catalogService = require('../services/catalog.service');

async function list(req, res) {
  try {
    const data = await catalogService.listProperties(req.query);
    res.json({ success: true, data });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message,
    });
  }
}

async function getById(req, res) {
  try {
    const property = await catalogService.getPropertyById(req.params.id);
    if (!property) {
      return res.status(404).json({ success: false, message: 'Property not found' });
    }
    res.json({ success: true, data: property });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message,
    });
  }
}

async function getBySlug(req, res) {
  try {
    const property = await catalogService.getPropertyBySlug(req.params.slug);
    if (!property) {
      return res.status(404).json({ success: false, message: 'Property not found' });
    }
    res.json({ success: true, data: property });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message,
    });
  }
}

async function listBranches(req, res) {
  try {
    const data = await catalogService.listBranchesByProperty(req.params.id, req.query);
    res.json({ success: true, data });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message,
    });
  }
}

async function create(req, res) {
  try {
    const property = await propertyService.createProperty(req.body);
    res.status(201).json({ success: true, data: property });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message,
    });
  }
}

async function update(req, res) {
  try {
    const property = await propertyService.updateProperty(req.params.id, req.body);
    res.json({ success: true, data: property });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message,
    });
  }
}

async function remove(req, res) {
  try {
    await propertyService.deleteProperty(req.params.id);
    res.json({ success: true, message: 'Property deleted' });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message,
    });
  }
}

module.exports = {
  list,
  getById,
  getBySlug,
  listBranches,
  create,
  update,
  remove,
};
