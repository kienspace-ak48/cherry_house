const propertyService = require('../services/property.service');
const branchService = require('../services/branch.service');
const { scopeCatalogLists, getAdminDataScope } = require('../utils/adminScope.util');
const { renderAdminPage } = require('../utils/adminRender');
const {
  EXPORT_SHEETS,
  defaultDateRange,
} = require('../modules/analyticsExport/analyticsExport.service');

async function index(req, res) {
  const actor = req.admin || req.user;
  const defaults = defaultDateRange();
  const [properties, branches] = await Promise.all([
    propertyService.listProperties(),
    branchService.listBranches(),
  ]);
  const catalog = scopeCatalogLists(actor, { properties, branches, rooms: [] });
  const scope = getAdminDataScope(actor);

  const filterPropertyId = req.query.propertyId
    ? String(req.query.propertyId)
    : scope.propertyId
      ? String(scope.propertyId)
      : '';
  const filterBranchId = req.query.branchId
    ? String(req.query.branchId)
    : scope.branchId
      ? String(scope.branchId)
      : '';

  const selectedSheets = new Set();
  if (req.query.sheets) {
    const raw = String(req.query.sheets).split(',');
    for (const id of raw) {
      if (EXPORT_SHEETS.some((s) => s.id === id)) selectedSheets.add(id);
    }
  }
  if (!selectedSheets.size) {
    for (const sheet of EXPORT_SHEETS) selectedSheets.add(sheet.id);
  }

  const filterBranches = filterPropertyId
    ? catalog.branches.filter((b) => String(b.propertyId) === filterPropertyId)
    : catalog.branches;

  renderAdminPage(req, res, 'admin/exports/index', {
    pageTitle: 'Xuất analytics',
    adminPage: 'exports',
    breadcrumbs: [
      { label: 'Dashboard', href: '/admin' },
      { label: 'Xuất analytics' },
    ],
    exportSheets: EXPORT_SHEETS,
    selectedSheets: [...selectedSheets],
    properties: catalog.properties,
    filterBranches,
    filterPropertyId,
    filterBranchId,
    exportFrom: req.query.from ? String(req.query.from) : defaults.from,
    exportTo: req.query.to ? String(req.query.to) : defaults.to,
    scopeLocked: Boolean(scope.branchId),
    flash: req.query.flash || null,
    msg: req.query.msg || null,
  });
}

module.exports = { index };
