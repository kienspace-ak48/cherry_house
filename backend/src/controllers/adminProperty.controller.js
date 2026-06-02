const propertyService = require('../services/property.service');
const { renderAdminPage, kindLabel } = require('../utils/adminRender');

function parsePropertyFormBody(body) {
  const highlightsRaw = typeof body.highlights === 'string' ? body.highlights : '';
  const highlights = highlightsRaw.trim()
    ? highlightsRaw.split('\n').map((s) => s.trim()).filter(Boolean)
    : [];

  const priceFromVnd = Number.parseInt(body.priceFromVnd, 10);
  const roomCount = Number.parseInt(body.roomCount, 10);
  const branchCount = Number.parseInt(body.branchCount, 10);
  const reviewCount = Number.parseInt(body.reviewCount, 10);
  const rating = Number.parseFloat(body.rating);

  return {
    slug: body.slug,
    name: body.name,
    city: body.city,
    region: body.region,
    kind: body.kind,
    tagline: body.tagline || null,
    description: body.description,
    address: body.address,
    priceFromVnd: Number.isNaN(priceFromVnd) ? 0 : priceFromVnd,
    roomCount: Number.isNaN(roomCount) ? 0 : roomCount,
    branchCount: Number.isNaN(branchCount) ? 0 : branchCount,
    rating: Number.isNaN(rating) ? 0 : rating,
    reviewCount: Number.isNaN(reviewCount) ? 0 : reviewCount,
    heroImageUrl: body.heroImageUrl || null,
    highlights,
    isActive: body.isActive === 'on' || body.isActive === true || body.isActive === '1',
  };
}

function emptyProperty() {
  return {
    slug: '',
    name: '',
    city: '',
    region: '',
    kind: 'homestay',
    tagline: '',
    description: '',
    address: '',
    priceFromVnd: 0,
    roomCount: 0,
    branchCount: 0,
    rating: 0,
    reviewCount: 0,
    heroImageUrl: '',
    highlights: [],
    isActive: true,
  };
}

function formatHighlightsForTextarea(highlights) {
  if (!highlights) return '';
  if (Array.isArray(highlights)) return highlights.join('\n');
  return '';
}

async function list(req, res) {
  try {
    const properties = await propertyService.listProperties(req.query);
    renderAdminPage(req, res, 'admin/properties/index', {
      pageTitle: 'Cơ sở lưu trú',
      adminPage: 'properties',
      breadcrumbs: [
        { label: 'Dashboard', href: '/admin' },
        { label: 'Cơ sở lưu trú' },
      ],
      properties,
      kindLabel,
      flash: req.query.flash || null,
      msg: req.query.msg || null,
    });
  } catch (error) {
    renderAdminPage(req, res, 'admin/properties/index', {
      pageTitle: 'Cơ sở lưu trú',
      adminPage: 'properties',
      breadcrumbs: [
        { label: 'Dashboard', href: '/admin' },
        { label: 'Cơ sở lưu trú' },
      ],
      properties: [],
      kindLabel,
      formError: error.message,
    });
  }
}

function createForm(req, res) {
  renderAdminPage(req, res, 'admin/properties/form', {
    pageTitle: 'Thêm cơ sở',
    adminPage: 'properties',
    breadcrumbs: [
      { label: 'Dashboard', href: '/admin' },
      { label: 'Cơ sở lưu trú', href: '/admin/properties' },
      { label: 'Thêm mới' },
    ],
    mode: 'create',
    property: emptyProperty(),
    highlightsText: '',
  });
}

async function create(req, res) {
  try {
    await propertyService.createProperty(parsePropertyFormBody(req.body));
    res.redirect('/admin/properties?flash=created');
  } catch (error) {
    const body = parsePropertyFormBody(req.body);
    renderAdminPage(req, res, 'admin/properties/form', {
      pageTitle: 'Thêm cơ sở',
      adminPage: 'properties',
      breadcrumbs: [
        { label: 'Dashboard', href: '/admin' },
        { label: 'Cơ sở lưu trú', href: '/admin/properties' },
        { label: 'Thêm mới' },
      ],
      mode: 'create',
      property: body,
      highlightsText: req.body.highlights || '',
      formError: error.message,
    });
  }
}

async function editForm(req, res) {
  try {
    const property = await propertyService.getPropertyById(req.params.id);
    if (!property) {
      return res.redirect('/admin/properties?flash=notfound');
    }
    renderAdminPage(req, res, 'admin/properties/form', {
      pageTitle: 'Sửa cơ sở',
      adminPage: 'properties',
      breadcrumbs: [
        { label: 'Dashboard', href: '/admin' },
        { label: 'Cơ sở lưu trú', href: '/admin/properties' },
        { label: property.name },
      ],
      mode: 'edit',
      property,
      highlightsText: formatHighlightsForTextarea(property.highlights),
    });
  } catch (error) {
    res.redirect(`/admin/properties?flash=error&msg=${encodeURIComponent(error.message)}`);
  }
}

async function update(req, res) {
  try {
    await propertyService.updateProperty(req.params.id, parsePropertyFormBody(req.body));
    res.redirect('/admin/properties?flash=updated');
  } catch (error) {
    const body = parsePropertyFormBody(req.body);
    renderAdminPage(req, res, 'admin/properties/form', {
      pageTitle: 'Sửa cơ sở',
      adminPage: 'properties',
      breadcrumbs: [
        { label: 'Dashboard', href: '/admin' },
        { label: 'Cơ sở lưu trú', href: '/admin/properties' },
        { label: body.name || 'Sửa' },
      ],
      mode: 'edit',
      property: { ...body, id: req.params.id },
      highlightsText: req.body.highlights || '',
      formError: error.message,
    });
  }
}

async function remove(req, res) {
  try {
    await propertyService.deleteProperty(req.params.id);
    res.redirect('/admin/properties?flash=deleted');
  } catch (error) {
    res.redirect(`/admin/properties?flash=error&msg=${encodeURIComponent(error.message)}`);
  }
}

module.exports = {
  list,
  createForm,
  create,
  editForm,
  update,
  remove,
};
