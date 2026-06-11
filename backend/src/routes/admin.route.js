const express = require('express');
const router = express.Router();

const adminController = require('../controllers/admin.controller');
const adminPropertyController = require('../controllers/adminProperty.controller');
const adminBranchController = require('../controllers/adminBranch.controller');
const adminRoomController = require('../controllers/adminRoom.controller');
const adminRoomTypeController = require('../controllers/adminRoomType.controller');
const adminBookingController = require('../controllers/adminBooking.controller');
const adminUserController = require('../controllers/adminUser.controller');
const adminGalleryController = require('../controllers/adminGallery.controller');
const adminBackupController = require('../controllers/adminBackup.controller');
const adminSeoController = require('../controllers/adminSeo.controller');
const adminChatBotController = require('../controllers/adminChatBot.controller');
const adminHomepageController = require('../controllers/adminHomepage.controller');
const adminPromoCodeController = require('../controllers/adminPromoCode.controller');
const adminEmailTemplateController = require('../controllers/adminEmailTemplate.controller');
const adminCustomerEmailController = require('../controllers/adminCustomerEmail.controller');
const adminContactMessageController = require('../controllers/adminContactMessage.controller');
const requireSuperAdmin = require('../middleware/requireSuperAdmin.middleware');
const requireAdminManager = require('../middleware/requireAdminManager.middleware');
const adminAccountController = require('../controllers/adminAccount.controller');
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

router.get('/promo-codes', adminPromoCodeController.list);
router.get('/promo-codes/new', adminPromoCodeController.createForm);
router.post('/promo-codes', adminPromoCodeController.create);
router.get('/promo-codes/:id/edit', adminPromoCodeController.editForm);
router.post('/promo-codes/:id', adminPromoCodeController.update);
router.post('/promo-codes/:id/delete', adminPromoCodeController.remove);

router.get('/room-types', adminRoomTypeController.list);
router.get('/room-types/new', adminRoomTypeController.createForm);
router.post('/room-types', adminRoomTypeController.create);
router.get('/room-types/:id/edit', adminRoomTypeController.editForm);
router.post('/room-types/:id', adminRoomTypeController.update);
router.post('/room-types/:id/delete', adminRoomTypeController.remove);
router.get('/bookings/calendar', adminBookingController.calendar);
router.get('/bookings/reception', adminBookingController.reception);
router.get('/bookings/lookup', adminBookingController.lookupAjax);
router.get('/bookings/new', adminBookingController.createForm);
router.post('/bookings', adminBookingController.create);
router.get('/bookings/:id/edit', adminBookingController.editForm);
router.post('/bookings/:id/mark-paid', adminBookingController.markPaidCounter);
router.post('/bookings/:id/check-in', adminBookingController.checkInGuest);
router.post('/bookings/:id/check-out', adminBookingController.checkOutGuest);
router.post('/bookings/:id/status', adminBookingController.patchStatus);
router.post('/bookings/:id', adminBookingController.update);
router.get('/bookings/:id', adminBookingController.detail);
router.get('/bookings', adminBookingController.list);

router.get('/contact-messages', adminContactMessageController.list);
router.get('/contact-messages/:id', adminContactMessageController.detail);
router.post('/contact-messages/:id/delete', adminContactMessageController.remove);
router.post('/contact-messages/:id', adminContactMessageController.update);

router.get('/users/:id/edit', adminUserController.editForm);
router.post('/users/:id/delete', requireSuperAdmin, adminUserController.remove);
router.post('/users/:id', adminUserController.update);
router.get('/users/:id', adminUserController.detail);
router.get('/users', adminUserController.list);

router.get('/customer-emails', requireAdminManager, adminCustomerEmailController.index);
router.post('/customer-emails/send', requireAdminManager, adminCustomerEmailController.sendAjax);

router.get('/accounts', requireAdminManager, adminAccountController.list);
router.get('/accounts/new', requireAdminManager, adminAccountController.createForm);
router.post('/accounts', requireAdminManager, adminAccountController.create);
router.get('/accounts/:id/edit', requireAdminManager, adminAccountController.editForm);
router.post('/accounts/:id', requireAdminManager, adminAccountController.update);

router.get('/backups', requireSuperAdmin, adminBackupController.index);
router.post('/backups/create', requireSuperAdmin, adminBackupController.create);
router.get('/backups/download/:filename', requireSuperAdmin, adminBackupController.download);
router.post('/backups/delete/:filename', requireSuperAdmin, adminBackupController.remove);

router.get('/seo', adminSeoController.index);
router.post('/seo/global', adminSeoController.updateGlobal);
router.post('/seo/pages/:pageKey', adminSeoController.updatePage);

router.get('/email-templates', adminEmailTemplateController.index);
router.get('/email-templates/:key/preview', adminEmailTemplateController.previewAjax);
router.post('/email-templates/:key/reset', adminEmailTemplateController.reset);
router.post('/email-templates/:key', adminEmailTemplateController.update);
router.get('/email-templates/:key', adminEmailTemplateController.editForm);

router.get('/chatbot', adminChatBotController.index);
router.post('/chatbot', adminChatBotController.update);
router.post('/chatbot/reset', adminChatBotController.reset);

router.get('/homepage', adminHomepageController.index);
router.post('/homepage', adminHomepageController.update);
router.post('/homepage/reset', adminHomepageController.reset);

router.get('/home-hero', (_req, res) => res.redirect('/admin/homepage#hero'));
router.post('/home-hero', adminHomepageController.update);
router.get('/home-page', (_req, res) => res.redirect('/admin/homepage#content'));
router.post('/home-page', adminHomepageController.update);

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
