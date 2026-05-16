const apiRoute = require('./api.route');

function registerRoutes(app) {
  app.use('/api', apiRoute);
}

module.exports = registerRoutes;