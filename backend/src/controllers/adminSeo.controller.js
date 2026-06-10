const seoService = require('../services/seo.service');
const { getClientAppUrl, getPublicSiteUrl } = require('../config/appUrl.config');
const { renderAdminPage } = require('../utils/adminRender');

async function index(req, res) {
  try {
    const { global, pages } = await seoService.getAdminBundle(req);
    const editKey = typeof req.query.page === 'string' ? req.query.page.trim() : '';
    const editingPage = editKey
      ? pages.find((p) => p.pageKey === editKey) || null
      : null;

    renderAdminPage(req, res, 'admin/seo/index', {
      pageTitle: 'SEO & Meta',
      adminPage: 'seo',
      breadcrumbs: [
        { label: 'Dashboard', href: '/admin' },
        { label: 'SEO & Meta' },
      ],
      globalSettings: global,
      pages,
      editingPage,
      editKey,
      flash: req.query.flash || null,
      msg: req.query.msg || null,
      formError: null,
      suggestedSiteUrl: getPublicSiteUrl(req),
      clientAppUrl: getClientAppUrl(),
      placeholders: [
        '{{siteName}}',
        '{{propertyName}}',
        '{{city}}',
        '{{region}}',
        '{{tagline}}',
        '{{priceFrom}}',
        '{{branchName}}',
        '{{roomName}}',
        '{{roomCode}}',
        '{{roomDescription}}',
        '{{price}}',
      ],
    });
  } catch (error) {
    renderAdminPage(req, res, 'admin/seo/index', {
      pageTitle: 'SEO & Meta',
      adminPage: 'seo',
      breadcrumbs: [
        { label: 'Dashboard', href: '/admin' },
        { label: 'SEO & Meta' },
      ],
      globalSettings: seoService.buildDefaultGlobal(req),
      suggestedSiteUrl: getPublicSiteUrl(req),
      clientAppUrl: getClientAppUrl(),
      pages: [],
      editingPage: null,
      editKey: '',
      flash: 'error',
      msg: error.message,
      formError: error.message,
      placeholders: [],
    });
  }
}

async function updateGlobal(req, res) {
  try {
    await seoService.updateGlobalSettings(req.body, req);
    res.redirect('/admin/seo?flash=global_saved');
  } catch (error) {
    res.redirect(
      `/admin/seo?flash=error&msg=${encodeURIComponent(error.message || 'Lưu thất bại')}`,
    );
  }
}

async function updatePage(req, res) {
  const pageKey = String(req.params.pageKey || '').trim();
  try {
    await seoService.updatePageTemplate(pageKey, req.body);
    res.redirect(`/admin/seo?page=${encodeURIComponent(pageKey)}&flash=page_saved`);
  } catch (error) {
    res.redirect(
      `/admin/seo?page=${encodeURIComponent(pageKey)}&flash=error&msg=${encodeURIComponent(error.message || 'Lưu thất bại')}`,
    );
  }
}

module.exports = {
  index,
  updateGlobal,
  updatePage,
};
