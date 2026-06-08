const { renderAdminPage } = require('../utils/adminRender');

function loginPage(_req, res) {
  res.redirect('/auth/login');
}

function dashboard(req, res) {
  renderAdminPage(req, res, 'admin/dashboard', {
    pageTitle: 'Dashboard',
    adminPage: 'dashboard',
    breadcrumbs: [
      { label: 'Dashboard', href: '/admin' },
      { label: 'Tổng quan' },
    ],
  });
}

module.exports = {
  loginPage,
  dashboard,
};
