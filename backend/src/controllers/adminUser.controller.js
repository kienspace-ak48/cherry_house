const userService = require('../services/user.service');
const bookingService = require('../modules/booking/booking.service');
const promoCodeService = require('../services/promoCode.service');
const customerEmailService = require('../services/customerEmail.service');
const { getClientAppUrl } = require('../config/appUrl.config');
const { renderAdminPage } = require('../utils/adminRender');

const MEMBERSHIP_TIERS = [
  { value: 'standard', label: 'Standard' },
  { value: 'gold', label: 'Gold' },
  { value: 'diamond', label: 'Diamond' },
];

const AUTH_PROVIDERS = [
  { value: 'local', label: 'Email / mật khẩu' },
  { value: 'google', label: 'Google' },
];

function tierLabel(tier) {
  return MEMBERSHIP_TIERS.find((t) => t.value === tier)?.label || tier;
}

function authProviderLabel(provider) {
  return AUTH_PROVIDERS.find((p) => p.value === provider)?.label || provider;
}

function formatDateTime(value) {
  if (!value) return '—';
  return new Date(value).toLocaleString('vi-VN');
}

function formatVnd(amount) {
  return Number(amount || 0).toLocaleString('vi-VN') + ' ₫';
}

function buildUsersListQuery(parts = {}) {
  const params = new URLSearchParams();
  Object.entries(parts).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      params.set(key, String(value));
    }
  });
  const qs = params.toString();
  return qs ? `?${qs}` : '';
}

function parseUserFormBody(body) {
  return {
    fullName: body.fullName || '',
    email: body.email || '',
    phone: body.phone || '',
    avatarUrl: body.avatarUrl || '',
    membershipTier: body.membershipTier || 'standard',
    isActive: body.isActive === 'on' || body.isActive === true || body.isActive === '1',
    emailVerified:
      body.emailVerified === 'on' || body.emailVerified === true || body.emailVerified === '1',
    bookingBanned:
      body.bookingBanned === 'on' || body.bookingBanned === true || body.bookingBanned === '1',
    bookingBanReason: body.bookingBanReason || '',
    password: body.password || '',
  };
}

function userToForm(user) {
  return {
    fullName: user.fullName,
    email: user.email,
    phone: user.phone || '',
    avatarUrl: user.avatarUrl || '',
    membershipTier: user.membershipTier,
    isActive: user.isActive,
    emailVerified: user.emailVerified,
    bookingBanned: user.bookingBanned,
    bookingBanReason: user.bookingBanReason || '',
    password: '',
  };
}

async function loadEmailBulkContext(actor) {
  const canSend = actor?.role === 'super_admin' || actor?.role === 'admin';
  if (!canSend) {
    return { promos: [], defaultCtaUrl: '' };
  }
  const promos = await promoCodeService.list({ isActive: true });
  return {
    promos,
    defaultCtaUrl: `${getClientAppUrl()}/booking`,
    formatDiscountText: customerEmailService.formatDiscountText,
    formatDateVi: customerEmailService.formatDateVi,
  };
}

async function list(req, res) {
  try {
    const searchQ = req.query.q ? String(req.query.q).trim() : '';
    const filterTier = req.query.membershipTier ? String(req.query.membershipTier) : '';
    const filterProvider = req.query.authProvider ? String(req.query.authProvider) : '';
    const filterActive = req.query.isActive !== undefined ? String(req.query.isActive) : '';
    const filterBookingBanned =
      req.query.bookingBanned !== undefined ? String(req.query.bookingBanned) : '';

    const users = await userService.list({
      q: searchQ || undefined,
      membershipTier: filterTier || undefined,
      authProvider: filterProvider || undefined,
      isActive: filterActive === '' ? undefined : filterActive,
      bookingBanned: filterBookingBanned === '' ? undefined : filterBookingBanned,
    });

    const listQueryBase = {
      q: searchQ,
      membershipTier: filterTier,
      authProvider: filterProvider,
      isActive: filterActive,
      bookingBanned: filterBookingBanned,
    };

    const emailBulk = await loadEmailBulkContext(req.admin || req.user);

    renderAdminPage(req, res, 'admin/users/index', {
      pageTitle: 'Khách hàng',
      adminPage: 'users',
      breadcrumbs: [
        { label: 'Dashboard', href: '/admin' },
        { label: 'Khách hàng' },
      ],
      users,
      promos: emailBulk.promos,
      defaultCtaUrl: emailBulk.defaultCtaUrl,
      formatDiscountText: emailBulk.formatDiscountText,
      formatDateVi: emailBulk.formatDateVi,
      searchQ,
      filterTier,
      filterProvider,
      filterActive,
      filterBookingBanned,
      membershipTiers: MEMBERSHIP_TIERS,
      authProviders: AUTH_PROVIDERS,
      tierLabel,
      authProviderLabel,
      formatDateTime,
      buildUsersListQuery,
      listQueryBase,
      flash: req.query.flash || null,
      msg: req.query.msg || null,
    });
  } catch (error) {
    renderAdminPage(req, res, 'admin/users/index', {
      pageTitle: 'Khách hàng',
      adminPage: 'users',
      breadcrumbs: [
        { label: 'Dashboard', href: '/admin' },
        { label: 'Khách hàng' },
      ],
      users: [],
      searchQ: '',
      filterTier: '',
      filterProvider: '',
      filterActive: '',
      filterBookingBanned: '',
      membershipTiers: MEMBERSHIP_TIERS,
      authProviders: AUTH_PROVIDERS,
      tierLabel,
      authProviderLabel,
      formatDateTime,
      buildUsersListQuery,
      listQueryBase: {},
      formError: error.message,
    });
  }
}

async function detail(req, res) {
  try {
    const user = await userService.getById(req.params.id);
    if (!user) {
      return res.redirect('/admin/users?flash=notfound');
    }

    const bookings = await bookingService.list({ userId: user.id });

    renderAdminPage(req, res, 'admin/users/detail', {
      pageTitle: user.fullName,
      adminPage: 'users',
      breadcrumbs: [
        { label: 'Dashboard', href: '/admin' },
        { label: 'Khách hàng', href: '/admin/users' },
        { label: user.fullName },
      ],
      user,
      bookings,
      membershipTiers: MEMBERSHIP_TIERS,
      authProviders: AUTH_PROVIDERS,
      tierLabel,
      authProviderLabel,
      formatDateTime,
      formatVnd,
      flash: req.query.flash || null,
    });
  } catch (error) {
    res.redirect(`/admin/users?flash=error&msg=${encodeURIComponent(error.message)}`);
  }
}

async function editForm(req, res) {
  try {
    const user = await userService.getById(req.params.id);
    if (!user) {
      return res.redirect('/admin/users?flash=notfound');
    }

    renderAdminPage(req, res, 'admin/users/form', {
      pageTitle: `Sửa ${user.fullName}`,
      adminPage: 'users',
      breadcrumbs: [
        { label: 'Dashboard', href: '/admin' },
        { label: 'Khách hàng', href: '/admin/users' },
        { label: user.fullName, href: `/admin/users/${user.id}` },
        { label: 'Sửa' },
      ],
      user,
      form: userToForm(user),
      membershipTiers: MEMBERSHIP_TIERS,
      authProviders: AUTH_PROVIDERS,
      authProviderLabel,
      tierLabel,
      flash: req.query.flash || null,
      msg: req.query.msg || null,
    });
  } catch (error) {
    res.redirect(`/admin/users?flash=error&msg=${encodeURIComponent(error.message)}`);
  }
}

async function update(req, res) {
  try {
    await userService.adminUpdate(req.params.id, parseUserFormBody(req.body));
    res.redirect(`/admin/users/${req.params.id}?flash=updated`);
  } catch (error) {
    let user = null;
    try {
      user = await userService.getById(req.params.id);
    } catch (_err) {
      /* ignore */
    }
    renderAdminPage(req, res, 'admin/users/form', {
      pageTitle: user ? `Sửa ${user.fullName}` : 'Sửa khách hàng',
      adminPage: 'users',
      breadcrumbs: [
        { label: 'Dashboard', href: '/admin' },
        { label: 'Khách hàng', href: '/admin/users' },
        { label: 'Sửa' },
      ],
      user,
      form: parseUserFormBody(req.body),
      membershipTiers: MEMBERSHIP_TIERS,
      authProviders: AUTH_PROVIDERS,
      authProviderLabel,
      tierLabel,
      formError: error.message,
    });
  }
}

async function remove(req, res) {
  try {
    const actor = req.admin || req.user;
    if (actor?.role !== 'super_admin') {
      return res.redirect('/admin/users?flash=forbidden');
    }
    await userService.adminRemove(req.params.id);
    res.redirect('/admin/users?flash=deleted');
  } catch (error) {
    res.redirect(`/admin/users/${req.params.id}/edit?flash=error&msg=${encodeURIComponent(error.message)}`);
  }
}

module.exports = {
  list,
  detail,
  editForm,
  update,
  remove,
};
