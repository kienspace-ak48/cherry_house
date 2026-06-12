const promoPopupService = require('../services/promoPopup.service');
const promoCodeService = require('../services/promoCode.service');
const { renderAdminPage } = require('../utils/adminRender');

function parseShowOnRoutesForForm(settings) {
  const routes = (() => {
    try {
      return JSON.parse(settings?.showOnRoutesJson || '["all"]');
    } catch {
      return ['all'];
    }
  })();

  return {
    routeAll: routes.includes('all'),
    routeHome: routes.includes('/') || routes.includes('all'),
    routeBooking: routes.includes('/booking') || routes.includes('all'),
    routeCheckout: routes.includes('/checkout') || routes.includes('all'),
  };
}

async function index(req, res) {
  try {
    const [settings, promos, clientStatus] = await Promise.all([
      promoPopupService.getAdminSettings(),
      promoCodeService.list({ isActive: true }),
      promoPopupService.getClientStatus(),
    ]);

    renderAdminPage(req, res, 'admin/promo-popup/index', {
      pageTitle: 'Popup voucher',
      adminPage: 'promo-popup',
      breadcrumbs: [
        { label: 'Dashboard', href: '/admin' },
        { label: 'Mã giảm giá', href: '/admin/promo-codes' },
        { label: 'Popup voucher' },
      ],
      settings,
      promos,
      routeFlags: parseShowOnRoutesForForm(settings),
      clientStatus,
      flash: req.query.flash || null,
      msg: req.query.msg || null,
    });
  } catch (error) {
    renderAdminPage(req, res, 'admin/promo-popup/index', {
      pageTitle: 'Popup voucher',
      adminPage: 'promo-popup',
      breadcrumbs: [
        { label: 'Dashboard', href: '/admin' },
        { label: 'Popup voucher' },
      ],
      settings: promoPopupService.buildDefaultSettings(),
      promos: [],
      routeFlags: { routeAll: true, routeHome: true, routeBooking: true, routeCheckout: true },
      flash: 'error',
      msg: error.message,
    });
  }
}

async function update(req, res) {
  try {
    await promoPopupService.updateSettings(req.body);
    res.redirect('/admin/promo-popup?flash=saved');
  } catch (error) {
    res.redirect(
      `/admin/promo-popup?flash=error&msg=${encodeURIComponent(error.message || 'Lưu thất bại')}`,
    );
  }
}

module.exports = {
  index,
  update,
};
