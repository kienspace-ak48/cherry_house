const homeHeroService = require('../services/homeHero.service');
const homePageService = require('../services/homePage.service');
const { renderAdminPage } = require('../utils/adminRender');

function fallbackHero() {
  const defaults = homeHeroService.buildDefaultSettings();
  return {
    ...defaults,
    quickCities: JSON.parse(defaults.quickCitiesJson),
    slides: JSON.parse(defaults.slidesJson),
    quickCitiesText: JSON.parse(defaults.quickCitiesJson).join(', '),
  };
}

function fallbackPage() {
  const defaults = homePageService.buildDefaultSettings();
  return {
    statsEnabled: true,
    stats: JSON.parse(defaults.statsJson),
    whyEnabled: true,
    whyEyebrow: defaults.whyEyebrow,
    whyTitle: defaults.whyTitle,
    whyDescription: defaults.whyDescription,
    whyItems: JSON.parse(defaults.whyItemsJson),
    areasEnabled: true,
    areasEyebrow: defaults.areasEyebrow,
    areasTitle: defaults.areasTitle,
    areasSeeAllLabel: defaults.areasSeeAllLabel,
    areasSeeAllHref: defaults.areasSeeAllHref,
    areas: homePageService.buildDefaultAreas(),
    kindsEnabled: true,
    kindsEyebrow: defaults.kindsEyebrow,
    kindsTitle: defaults.kindsTitle,
    kindsDescription: defaults.kindsDescription,
    kinds: homePageService.buildDefaultKinds(),
    reviewsEnabled: true,
    reviewsEyebrow: defaults.reviewsEyebrow,
    reviewsTitle: defaults.reviewsTitle,
    reviews: homePageService.buildDefaultReviews(),
    newsletterEnabled: true,
    newsletterTitle: defaults.newsletterTitle,
    newsletterDescription: defaults.newsletterDescription,
    newsletterPlaceholder: defaults.newsletterPlaceholder,
    newsletterButtonLabel: defaults.newsletterButtonLabel,
    newsletterSuccessMessage: defaults.newsletterSuccessMessage,
  };
}

async function index(req, res) {
  try {
    const [hero, page] = await Promise.all([
      homeHeroService.getAdminSettings(),
      homePageService.getAdminSettings(),
    ]);
    renderAdminPage(req, res, 'admin/homepage/index', {
      pageTitle: 'Trang chủ',
      adminPage: 'homepage',
      breadcrumbs: [
        { label: 'Dashboard', href: '/admin' },
        { label: 'Trang chủ' },
      ],
      hero,
      page,
      flash: req.query.flash || null,
      msg: req.query.msg || null,
    });
  } catch (error) {
    renderAdminPage(req, res, 'admin/homepage/index', {
      pageTitle: 'Trang chủ',
      adminPage: 'homepage',
      breadcrumbs: [
        { label: 'Dashboard', href: '/admin' },
        { label: 'Trang chủ' },
      ],
      hero: fallbackHero(),
      page: fallbackPage(),
      flash: 'error',
      msg: error.message,
    });
  }
}

async function update(req, res) {
  try {
    await homeHeroService.updateSettings(req.body);
    await homePageService.updateSettings(req.body);
    res.redirect('/admin/homepage?flash=saved');
  } catch (error) {
    res.redirect(
      `/admin/homepage?flash=error&msg=${encodeURIComponent(error.message || 'Lưu thất bại')}`,
    );
  }
}

async function reset(req, res) {
  try {
    await Promise.all([homeHeroService.resetToDefaults(), homePageService.resetToDefaults()]);
    res.redirect('/admin/homepage?flash=reset');
  } catch (error) {
    res.redirect(
      `/admin/homepage?flash=error&msg=${encodeURIComponent(error.message || 'Reset thất bại')}`,
    );
  }
}

module.exports = {
  index,
  update,
  reset,
};
