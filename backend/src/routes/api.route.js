const express = require('express');

const propertyRoute = require('./property.route');

const branchRoute = require('./branch.route');

const propertyGalleryRoute = require('./property-gallery.route');

const branchMapPinRoute = require('./branch-map-pin.route');

const roomTypeRoute = require('./room-type.route');

const roomTypeGalleryRoute = require('./room-type-gallery.route');

const amenityRoute = require('./amenity.route');

const propertyAmenityRoute = require('./property-amenity.route');

const roomTypeAmenityRoute = require('./room-type-amenity.route');

const inventoryRoomRoute = require('./inventory-room.route');

const userRoute = require('./user.route');
const authMiddleware = require('../middleware/auth.middleware');

const promoCodeRoute = require('./promo-code.route');

const bookingRoute = require('./booking.route');

const paymentRoute = require('./payment.route');
const checkoutRoute = require('../modules/checkout/checkout.routes');
const dashboardRoute = require('../modules/dashboard/dashboard.routes');
const catalogRoute = require('./catalog.route');
const clientAuthRoute = require('./clientAuth.route');
const seoRoute = require('./seo.route');
const chatBotRoute = require('./chatBot.route');
const prisma = require('../config/prisma.config');
const { isDbConnectionError } = require('../utils/http');

const router = express.Router();

router.get('/health', async (_req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({
      success: true,
      message: 'API and database are healthy',
      database: 'connected',
    });
  } catch (error) {
    res.status(isDbConnectionError(error) ? 503 : 500).json({
      success: false,
      message: isDbConnectionError(error)
        ? 'Không kết nối được MySQL. Hãy bật MySQL Server (Workbench/service) rồi thử lại.'
        : error.message,
      database: 'disconnected',
      code: isDbConnectionError(error) ? 'DB_UNAVAILABLE' : 'HEALTH_CHECK_FAILED',
    });
  }
});



router.get('/tests', (req, res) => {
  res.json({ success: true, message: 'API is running' });
});

/** Auth khách (React) — đăng ký OTP, Google, đăng nhập */
router.use('/auth', clientAuthRoute);

/** SEO config công khai cho React */
router.use('/seo', seoRoute);

/** Chat AI — Gemini + catalog/booking tools */
router.use('/chat', chatBotRoute);

/** Catalog public API — format chuẩn cho React (ưu tiên dùng prefix /catalog) */
router.use('/catalog', catalogRoute);

router.use('/properties', propertyRoute);

router.use('/property-gallery', propertyGalleryRoute);

router.use('/branches', branchRoute);

router.use('/branch-map-pins', branchMapPinRoute);

router.use('/room-types', roomTypeRoute);

router.use('/room-type-gallery', roomTypeGalleryRoute);

router.use('/amenities', amenityRoute);

router.use('/property-amenities', propertyAmenityRoute);

router.use('/room-type-amenities', roomTypeAmenityRoute);

router.use('/rooms', inventoryRoomRoute);

router.use('/users', userRoute);

router.use('/promo-codes', promoCodeRoute);

router.use('/bookings', bookingRoute);

router.use('/checkout', checkoutRoute);

router.use('/admin/dashboard', dashboardRoute);

router.use('/payments', paymentRoute);



module.exports = router;

