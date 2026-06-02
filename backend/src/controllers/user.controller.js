const userService = require('../services/user.service');

async function list(req, res) {
  try {
    const data = await userService.list(req.query);
    res.json({ success: true, data });
  } catch (error) {
    res.status(error.statusCode || 500).json({ success: false, message: error.message });
  }
}

async function getById(req, res) {
  try {
    const item = await userService.getById(req.params.id);
    if (!item) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    res.json({ success: true, data: item });
  } catch (error) {
    res.status(error.statusCode || 500).json({ success: false, message: error.message });
  }
}

async function create(req, res) {
  try {
    const dataTemp={
      email: 'admin@gmail.com',
      passwordHash: '123',
      fullName: 'admin',
      phone: '1234567890',
      membershipTier: 'standard',
      isActive: true,
    }
    const item = await userService.create(dataTemp);//req.body
    res.status(201).json({ success: true, data: item });
  } catch (error) {
    res.status(error.statusCode || 500).json({ success: false, message: error.message });
  }
}

async function update(req, res) {
  try {
    const item = await userService.update(req.params.id, req.body);
    res.json({ success: true, data: item });
  } catch (error) {
    res.status(error.statusCode || 500).json({ success: false, message: error.message });
  }
}

async function remove(req, res) {
  try {
    await userService.remove(req.params.id);
    res.json({ success: true, message: 'User deleted' });
  } catch (error) {
    res.status(error.statusCode || 500).json({ success: false, message: error.message });
  }
}

module.exports = { list, getById, create, update, remove };
