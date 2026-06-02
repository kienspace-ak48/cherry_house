const express = require('express');
const router = express.Router();

const adminController = require('../controllers/admin.controller');
const adminPropertyController = require('../controllers/adminProperty.controller');
const adminBranchController = require('../controllers/adminBranch.controller');
const adminRoomController = require('../controllers/adminRoom.controller');
const adminGalleryController = require('../controllers/adminGallery.controller');
const { uploadImage } = require('../config/multer.config');

router.get('/login', adminController.loginPage);

router.get('/', adminController.dashboard);

router.get('/properties', adminPropertyController.list);
router.get('/properties/new', adminPropertyController.createForm);
router.post('/properties', adminPropertyController.create);
router.get('/properties/:id/edit', adminPropertyController.editForm);
router.post('/properties/:id', adminPropertyController.update);
router.post('/properties/:id/delete', adminPropertyController.remove);

router.get('/branches', adminBranchController.list);
router.get('/branches/new', adminBranchController.createForm);
router.post('/branches', adminBranchController.create);
router.get('/branches/:id/edit', adminBranchController.editForm);
router.post('/branches/:id', adminBranchController.update);
router.post('/branches/:id/delete', adminBranchController.remove);
router.get('/rooms', adminRoomController.list);
router.get('/rooms/new', adminRoomController.createForm);
router.post('/rooms', adminRoomController.create);
router.get('/rooms/:id/edit', adminRoomController.editForm);
router.post('/rooms/:id', adminRoomController.update);
router.post('/rooms/:id/delete', adminRoomController.remove);
router.get('/bookings', adminController.bookings);

router.get('/gallery', adminGalleryController.page);
router.get('/gallery/images', adminGalleryController.listImagesAjax);
router.get('/gallery/folders', adminGalleryController.listFoldersAjax);
router.post('/gallery/category/create', adminGalleryController.createFolderAjax);
router.delete('/gallery/folder-delete', adminGalleryController.deleteFolderAjax);
router.post(
  '/gallery/image-upload-ajax',
  (req, res, next) => {
    uploadImage.single('image')(req, res, (err) => {
      if (err) {
        return res.status(400).json({
          success: false,
          message: err.message || 'Upload failed',
        });
      }
      next();
    });
  },
  adminGalleryController.uploadImageAjax,
);
router.delete('/gallery/image-delete-ajax', adminGalleryController.deleteImageAjax);

module.exports = router;
