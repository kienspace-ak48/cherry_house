const apiRoute = require('./api.route');
const adminRoute = require('./admin.route');
const authRoute = require('./auth.route');
const testRoute = require('./test.route');
const adminAuthMiddleware = require('../middleware/adminAuth.middleware');

function registerRoutes(app) {
  app.use('/test', testRoute);
  app.use('/api', apiRoute);
  app.use('/auth', authRoute);
  app.use('/admin', adminAuthMiddleware, adminRoute);
}

module.exports = registerRoutes;