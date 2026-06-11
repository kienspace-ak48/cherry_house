const homeHeroService = require('../services/homeHero.service');
const { renderAdminPage } = require('../utils/adminRender');

async function index(req, res) {
  try {
    const settings = await homeHeroService.getAdminSettings();
    renderAdminPage(req, res, 'admin/home-hero/index', {
      pageTitle: 'Hero trang chủ',
      adminPage: 'home-hero',
      breadcrumbs: [
        { label: 'Dashboard', href: '/admin' },
        { label: 'Hero trang chủ' },
      ],
      settings,
      flash: req.query.flash || null,
      msg: req.query.msg || null,
    });
  } catch (error) {
    const defaults = homeHeroService.buildDefaultSettings();
    renderAdminPage(req, res, 'admin/home-hero/index', {
      pageTitle: 'Hero trang chủ',
      adminPage: 'home-hero',
      breadcrumbs: [
        { label: 'Dashboard', href: '/admin' },
        { label: 'Hero trang chủ' },
      ],
      settings: {
        ...defaults,
        quickCities: JSON.parse(defaults.quickCitiesJson),
        slides: JSON.parse(defaults.slidesJson),
        quickCitiesText: JSON.parse(defaults.quickCitiesJson).join(', '),
      },
      flash: 'error',
      msg: error.message,
    });
  }
}

async function update(req, res) {
  try {
    await homeHeroService.updateSettings(req.body);
    res.redirect('/admin/home-hero?flash=saved');
  } catch (error) {
    res.redirect(
      `/admin/home-hero?flash=error&msg=${encodeURIComponent(error.message || 'Lưu thất bại')}`,
    );
  }
}

async function reset(req, res) {
  try {
    await homeHeroService.resetToDefaults();
    res.redirect('/admin/home-hero?flash=reset');
  } catch (error) {
    res.redirect(
      `/admin/home-hero?flash=error&msg=${encodeURIComponent(error.message || 'Reset thất bại')}`,
    );
  }
}

module.exports = {
  index,
  update,
  reset,
};
