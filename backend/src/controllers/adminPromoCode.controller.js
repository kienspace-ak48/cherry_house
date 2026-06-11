const promoCodeService = require('../services/promoCode.service');
const { renderAdminPage } = require('../utils/adminRender');

const DISCOUNT_TYPES = [
  { value: 'percent', label: 'Giảm theo %' },
  { value: 'fixed_amount', label: 'Giảm cố định (VND)' },
];

function emptyPromo() {
  return {
    code: '',
    discountType: 'percent',
    discountPercent: 10,
    discountAmountVnd: '',
    minSubtotalVnd: 0,
    description: '',
    validFrom: '',
    validTo: '',
    maxUses: '',
    usedCount: 0,
    isActive: true,
  };
}

function formatPriceVnd(amount) {
  return Number(amount || 0).toLocaleString('vi-VN');
}

function formatDateInput(date) {
  if (!date) return '';
  const d = date instanceof Date ? date : new Date(date);
  if (Number.isNaN(d.getTime())) return '';
  return d.toISOString().slice(0, 10);
}

function discountLabel(promo) {
  if (promo.discountType === 'fixed_amount') {
    return `-${formatPriceVnd(promo.discountAmountVnd)}đ`;
  }
  return `-${promo.discountPercent}%`;
}

async function list(req, res) {
  try {
    const promos = await promoCodeService.list(req.query);
    renderAdminPage(req, res, 'admin/promo-codes/index', {
      pageTitle: 'Mã giảm giá',
      adminPage: 'promo-codes',
      breadcrumbs: [
        { label: 'Dashboard', href: '/admin' },
        { label: 'Mã giảm giá' },
      ],
      promos,
      formatPriceVnd,
      discountLabel,
      formatDateInput,
      flash: req.query.flash || null,
      msg: req.query.msg || null,
    });
  } catch (error) {
    renderAdminPage(req, res, 'admin/promo-codes/index', {
      pageTitle: 'Mã giảm giá',
      adminPage: 'promo-codes',
      breadcrumbs: [
        { label: 'Dashboard', href: '/admin' },
        { label: 'Mã giảm giá' },
      ],
      promos: [],
      formatPriceVnd,
      discountLabel,
      formatDateInput,
      formError: error.message,
    });
  }
}

function createForm(req, res) {
  renderAdminPage(req, res, 'admin/promo-codes/form', {
    pageTitle: 'Thêm mã giảm giá',
    adminPage: 'promo-codes',
    breadcrumbs: [
      { label: 'Dashboard', href: '/admin' },
      { label: 'Mã giảm giá', href: '/admin/promo-codes' },
      { label: 'Thêm mới' },
    ],
    mode: 'create',
    promo: emptyPromo(),
    discountTypes: DISCOUNT_TYPES,
    formatDateInput,
  });
}

async function create(req, res) {
  try {
    await promoCodeService.createFromAdmin(req.body);
    res.redirect('/admin/promo-codes?flash=created');
  } catch (error) {
    renderAdminPage(req, res, 'admin/promo-codes/form', {
      pageTitle: 'Thêm mã giảm giá',
      adminPage: 'promo-codes',
      breadcrumbs: [
        { label: 'Dashboard', href: '/admin' },
        { label: 'Mã giảm giá', href: '/admin/promo-codes' },
        { label: 'Thêm mới' },
      ],
      mode: 'create',
      promo: { ...emptyPromo(), ...req.body },
      discountTypes: DISCOUNT_TYPES,
      formatDateInput,
      formError: error.message,
    });
  }
}

async function editForm(req, res) {
  try {
    const promo = await promoCodeService.getById(req.params.id);
    if (!promo) {
      return res.redirect('/admin/promo-codes?flash=notfound');
    }
    renderAdminPage(req, res, 'admin/promo-codes/form', {
      pageTitle: 'Sửa mã giảm giá',
      adminPage: 'promo-codes',
      breadcrumbs: [
        { label: 'Dashboard', href: '/admin' },
        { label: 'Mã giảm giá', href: '/admin/promo-codes' },
        { label: promo.code },
      ],
      mode: 'edit',
      promo,
      discountTypes: DISCOUNT_TYPES,
      formatDateInput,
    });
  } catch (error) {
    res.redirect(`/admin/promo-codes?flash=error&msg=${encodeURIComponent(error.message)}`);
  }
}

async function update(req, res) {
  try {
    await promoCodeService.updateFromAdmin(req.params.id, req.body);
    res.redirect('/admin/promo-codes?flash=updated');
  } catch (error) {
    const promo = await promoCodeService.getById(req.params.id).catch(() => null);
    renderAdminPage(req, res, 'admin/promo-codes/form', {
      pageTitle: 'Sửa mã giảm giá',
      adminPage: 'promo-codes',
      breadcrumbs: [
        { label: 'Dashboard', href: '/admin' },
        { label: 'Mã giảm giá', href: '/admin/promo-codes' },
        { label: promo?.code || 'Sửa' },
      ],
      mode: 'edit',
      promo: promo || { id: req.params.id, ...emptyPromo() },
      discountTypes: DISCOUNT_TYPES,
      formatDateInput,
      formError: error.message,
    });
  }
}

async function remove(req, res) {
  try {
    await promoCodeService.remove(req.params.id);
    res.redirect('/admin/promo-codes?flash=deleted');
  } catch (error) {
    res.redirect(`/admin/promo-codes?flash=error&msg=${encodeURIComponent(error.message)}`);
  }
}

module.exports = {
  list,
  createForm,
  create,
  editForm,
  update,
  remove,
  formatPriceVnd,
  discountLabel,
};
