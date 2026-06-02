const branchService = require('../services/branch.service');
const catalogService = require('../services/catalog.service');

async function list(req, res) {
  try {
    const data = await catalogService.listBranches(req.query);
    res.json({ success: true, data });
  } catch (error) {
    res.status(error.statusCode || 500).json({ success: false, message: error.message });
  }
}

async function getById(req, res) {
  try {
    const branch = await catalogService.getBranchById(req.params.id);
    if (!branch) {
      return res.status(404).json({ success: false, message: 'Branch not found' });
    }
    res.json({ success: true, data: branch });
  } catch (error) {
    res.status(error.statusCode || 500).json({ success: false, message: error.message });
  }
}

async function getByPropertyAndCode(req, res) {
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
    res.status(error.statusCode || 500).json({ success: false, message: error.message });
  }
}

async function create(req, res) {
  try {
    const branch = await branchService.createBranch(req.body);
    res.status(201).json({ success: true, data: branch });
  } catch (error) {
    res.status(error.statusCode || 500).json({ success: false, message: error.message });
  }
}

async function update(req, res) {
  try {
    const branch = await branchService.updateBranch(req.params.id, req.body);
    res.json({ success: true, data: branch });
  } catch (error) {
    res.status(error.statusCode || 500).json({ success: false, message: error.message });
  }
}

async function remove(req, res) {
  try {
    await branchService.deleteBranch(req.params.id);
    res.json({ success: true, message: 'Branch deleted' });
  } catch (error) {
    res.status(error.statusCode || 500).json({ success: false, message: error.message });
  }
}

module.exports = {
  list,
  getById,
  getByPropertyAndCode,
  create,
  update,
  remove,
};
