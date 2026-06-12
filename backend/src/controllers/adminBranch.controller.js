const branchService = require('../services/branch.service');
const catalogCountService = require('../services/catalogCount.service');
const branchMapPinService = require('../services/branchMapPin.service');
const branchMapPinRepository = require('../repositories/branchMapPin.repository');
const propertyService = require('../services/property.service');
const { renderAdminPage, kindLabel } = require('../utils/adminRender');

function parseBranchFormBody(body) {
  const propertyId = Number.parseInt(body.propertyId, 10);
  const price = Number.parseInt(body.price, 10);

  return {
    propertyId: Number.isNaN(propertyId) ? undefined : propertyId,
    code: body.code,
    name: body.name,
    address: body.address,
    tagline: body.tagline || null,
    price: Number.isNaN(price) ? 0 : price,
    imgUrl: body.imgUrl || null,
    isActive: body.isActive === 'on' || body.isActive === true || body.isActive === '1',
  };
}

function parseMapPinFormBody(body) {
  const latRaw = body.mapLat;
  const lngRaw = body.mapLng;

  if (latRaw === '' || latRaw === undefined || lngRaw === '' || lngRaw === undefined) {
    return null;
  }

  const lat = Number(latRaw);
  const lng = Number(lngRaw);
  if (Number.isNaN(lat) || Number.isNaN(lng)) return null;

  let googleMapsUrl =
    typeof body.mapGoogleMapsUrl === 'string' ? body.mapGoogleMapsUrl.trim() : '';
  if (!googleMapsUrl) {
    googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
  }

  const zoom = Number.parseInt(body.mapZoom, 10);

  return {
    lat,
    lng,
    zoom: Number.isNaN(zoom) ? 15 : zoom,
    label: body.mapLabel || null,
    pinBadge: body.mapPinBadge || null,
    pinInfo: body.mapPinInfo || null,
    googleMapsUrl,
    embedUrl: body.mapEmbedUrl || null,
  };
}

function emptyBranch() {
  return {
    propertyId: '',
    code: '',
    name: '',
    address: '',
    tagline: '',
    price: 0,
    roomCount: 0,
    imgUrl: '',
    isActive: true,
  };
}

function emptyMapPin() {
  return {
    lat: '',
    lng: '',
    zoom: 15,
    label: '',
    pinBadge: '',
    pinInfo: '',
    googleMapsUrl: '',
    embedUrl: '',
  };
}

function mapPinFromBranch(branch) {
  const pin = branch?.mapPin;
  if (!pin) return emptyMapPin();
  return {
    lat: pin.lat != null ? String(pin.lat) : '',
    lng: pin.lng != null ? String(pin.lng) : '',
    zoom: pin.zoom ?? 15,
    label: pin.label || '',
    pinBadge: pin.pinBadge || '',
    pinInfo: pin.pinInfo || '',
    googleMapsUrl: pin.googleMapsUrl || '',
    embedUrl: pin.embedUrl || '',
  };
}

async function loadProperties() {
  return propertyService.listProperties();
}

async function saveMapPinForBranch(branchId, body) {
  const payload = parseMapPinFormBody(body);
  if (!payload) return;

  const existing = await branchMapPinRepository.findByBranchId(branchId);
  if (existing) {
    await branchMapPinService.update(existing.id, payload);
  } else {
    await branchMapPinService.create({ ...payload, branchId });
  }
}

function formatPriceVnd(price) {
  return Number(price || 0).toLocaleString('vi-VN');
}

/** Nhóm chi nhánh theo cơ sở — giữ thứ tự properties, kể cả cơ sở chưa có chi nhánh */
function groupBranchesByProperty(branches, properties) {
  const byPropertyId = new Map();
  for (const branch of branches) {
    const list = byPropertyId.get(branch.propertyId) || [];
    list.push(branch);
    byPropertyId.set(branch.propertyId, list);
  }

  return properties.map((property) => ({
    property,
    branches: byPropertyId.get(property.id) || [],
  }));
}

async function attachBookingCounts(branches) {
  const counts = await branchService.getBookingCountsByBranchIds(branches.map((b) => b.id));
  return branches.map((b) => ({
    ...b,
    bookingCount: counts.get(b.id) || 0,
  }));
}

async function list(req, res) {
  try {
    const filters = {};
    if (req.query.propertyId) filters.propertyId = req.query.propertyId;
    const [branches, properties] = await Promise.all([
      branchService.listBranches(filters),
      loadProperties(),
    ]);
    await Promise.all(branches.map((b) => catalogCountService.syncBranchRoomCount(b.id)));
    const refreshedBranches = await attachBookingCounts(await branchService.listBranches(filters));

    const filterPropertyId = req.query.propertyId ? String(req.query.propertyId) : '';
    const propertyGroups = groupBranchesByProperty(refreshedBranches, properties);
    const selectedProperty = filterPropertyId
      ? properties.find((p) => String(p.id) === filterPropertyId) || null
      : null;
    const visibleGroups = filterPropertyId
      ? propertyGroups.filter((g) => String(g.property.id) === filterPropertyId)
      : propertyGroups;

    renderAdminPage(req, res, 'admin/branches/index', {
      pageTitle: 'Chi nhánh',
      adminPage: 'branches',
      breadcrumbs: [
        { label: 'Dashboard', href: '/admin' },
        { label: 'Chi nhánh' },
      ],
      branches: refreshedBranches,
      properties,
      propertyGroups: visibleGroups,
      selectedProperty,
      filterPropertyId,
      formatPriceVnd,
      kindLabel,
      flash: req.query.flash || null,
      msg: req.query.msg || null,
    });
  } catch (error) {
    renderAdminPage(req, res, 'admin/branches/index', {
      pageTitle: 'Chi nhánh',
      adminPage: 'branches',
      breadcrumbs: [
        { label: 'Dashboard', href: '/admin' },
        { label: 'Chi nhánh' },
      ],
      branches: [],
      properties: [],
      propertyGroups: [],
      selectedProperty: null,
      filterPropertyId: '',
      formatPriceVnd,
      kindLabel,
      formError: error.message,
    });
  }
}

async function createForm(req, res) {
  const properties = await loadProperties();
  renderAdminPage(req, res, 'admin/branches/form', {
    pageTitle: 'Thêm chi nhánh',
    adminPage: 'branches',
    breadcrumbs: [
      { label: 'Dashboard', href: '/admin' },
      { label: 'Chi nhánh', href: '/admin/branches' },
      { label: 'Thêm mới' },
    ],
    mode: 'create',
    branch: emptyBranch(),
    mapPin: emptyMapPin(),
    properties,
    preselectPropertyId: req.query.propertyId || '',
  });
}

async function create(req, res) {
  try {
    const branch = await branchService.createBranch(parseBranchFormBody(req.body));
    await saveMapPinForBranch(branch.id, req.body);
    res.redirect('/admin/branches?flash=created');
  } catch (error) {
    const properties = await loadProperties();
    renderAdminPage(req, res, 'admin/branches/form', {
      pageTitle: 'Thêm chi nhánh',
      adminPage: 'branches',
      breadcrumbs: [
        { label: 'Dashboard', href: '/admin' },
        { label: 'Chi nhánh', href: '/admin/branches' },
        { label: 'Thêm mới' },
      ],
      mode: 'create',
      branch: parseBranchFormBody(req.body),
      mapPin: {
        lat: req.body.mapLat || '',
        lng: req.body.mapLng || '',
        zoom: req.body.mapZoom || 15,
        label: req.body.mapLabel || '',
        pinBadge: req.body.mapPinBadge || '',
        pinInfo: req.body.mapPinInfo || '',
        googleMapsUrl: req.body.mapGoogleMapsUrl || '',
        embedUrl: req.body.mapEmbedUrl || '',
      },
      properties,
      formError: error.message,
    });
  }
}

async function editForm(req, res) {
  try {
    const branch = await branchService.getBranchById(req.params.id);
    if (!branch) {
      return res.redirect('/admin/branches?flash=notfound');
    }
    await catalogCountService.syncBranchRoomCount(branch.id);
    const refreshed = await branchService.getBranchById(req.params.id);
    const properties = await loadProperties();
    renderAdminPage(req, res, 'admin/branches/form', {
      pageTitle: 'Sửa chi nhánh',
      adminPage: 'branches',
      breadcrumbs: [
        { label: 'Dashboard', href: '/admin' },
        { label: 'Chi nhánh', href: '/admin/branches' },
        { label: branch.name },
      ],
      mode: 'edit',
      branch: {
        ...refreshed,
        propertyId: refreshed.propertyId,
        price: Number(refreshed.price),
      },
      mapPin: mapPinFromBranch(refreshed),
      properties,
    });
  } catch (error) {
    res.redirect(`/admin/branches?flash=error&msg=${encodeURIComponent(error.message)}`);
  }
}

async function update(req, res) {
  try {
    await branchService.updateBranch(req.params.id, parseBranchFormBody(req.body));
    await saveMapPinForBranch(Number(req.params.id), req.body);
    res.redirect('/admin/branches?flash=updated');
  } catch (error) {
    const properties = await loadProperties();
    const body = parseBranchFormBody(req.body);
    renderAdminPage(req, res, 'admin/branches/form', {
      pageTitle: 'Sửa chi nhánh',
      adminPage: 'branches',
      breadcrumbs: [
        { label: 'Dashboard', href: '/admin' },
        { label: 'Chi nhánh', href: '/admin/branches' },
        { label: body.name || 'Sửa' },
      ],
      mode: 'edit',
      branch: { ...body, id: req.params.id },
      mapPin: {
        lat: req.body.mapLat || '',
        lng: req.body.mapLng || '',
        zoom: req.body.mapZoom || 15,
        label: req.body.mapLabel || '',
        pinBadge: req.body.mapPinBadge || '',
        pinInfo: req.body.mapPinInfo || '',
        googleMapsUrl: req.body.mapGoogleMapsUrl || '',
        embedUrl: req.body.mapEmbedUrl || '',
      },
      properties,
      formError: error.message,
    });
  }
}

async function remove(req, res) {
  try {
    await branchService.deleteBranch(req.params.id);
    res.redirect('/admin/branches?flash=deleted');
  } catch (error) {
    res.redirect(`/admin/branches?flash=error&msg=${encodeURIComponent(error.message)}`);
  }
}

async function deactivate(req, res) {
  try {
    await branchService.setBranchActive(req.params.id, false);
    res.redirect('/admin/branches?flash=deactivated');
  } catch (error) {
    res.redirect(`/admin/branches?flash=error&msg=${encodeURIComponent(error.message)}`);
  }
}

async function activate(req, res) {
  try {
    await branchService.setBranchActive(req.params.id, true);
    res.redirect('/admin/branches?flash=activated');
  } catch (error) {
    res.redirect(`/admin/branches?flash=error&msg=${encodeURIComponent(error.message)}`);
  }
}

module.exports = {
  list,
  createForm,
  create,
  editForm,
  update,
  remove,
  deactivate,
  activate,
};
