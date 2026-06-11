const apiRoute = require('./api.route');
const adminRoute = require('./admin.route');
const staffRoute = require('./staff.route');
const authRoute = require('./auth.route');
const testRoute = require('./test.route');
const adminAuthMiddleware = require('../middleware/adminAuth.middleware');
const seoController = require('../controllers/seo.controller');

function registerRoutes(app) {
  app.get('/robots.txt', seoController.robots);
  app.get('/sitemap.xml', seoController.sitemap);

  app.use('/test', testRoute);
  app.use('/api', apiRoute);
  app.use('/auth', authRoute);
  app.use('/staff', staffRoute);
  app.use('/admin', adminAuthMiddleware, adminRoute);
}

module.exports = registerRoutes;