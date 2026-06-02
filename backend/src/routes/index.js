const apiRoute = require('./api.route');
const adminRoute = require('./admin.route');
const authRoute = require('./auth.route');
const testRoute = require('./test.route');
const authMiddleware = require('../middleware/auth.middleware');

function registerRoutes(app) {
  app.use('/test', testRoute);
  app.use('/api', apiRoute);
  app.use('/auth', authRoute);
  app.use('/admin', authMiddleware, adminRoute);
}

module.exports = registerRoutes;