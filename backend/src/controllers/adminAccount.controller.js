const adminAccountService = require('../services/adminAccount.service');
const branchService = require('../services/branch.service');
const propertyService = require('../services/property.service');
const { renderAdminPage } = require('../utils/adminRender');
const { parseId } = require('../utils/http');

function formatDateTime(value) {
  if (!value) return '—';
  return new Date(value).toLocaleString('vi-VN');
}

function buildAccountsListQuery(parts = {}) {
  const params = new URLSearchParams();
  Object.entries(parts).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      params.set(key, String(value));
    }
  });
  const qs = params.toString();
  return qs ? `?${qs}` : '';
}

function accountToForm(account) {
  return {
    fullName: account?.fullName || '',
    email: account?.email || '',
    avatarUrl: account?.avatarUrl || '',
    role: account?.role || 'staff',
    propertyId: account?.propertyId || '',
    isActive: account?.isActive !== false,
    password: '',
  };
}

async function loadFormContext() {
  const [properties, branches] = await Promise.all([
    propertyService.listProperties(),
    branchService.listBranches(),
  ]);
  return { properties, branches };
}

async function list(req, res) {
  try {
    const searchQ = req.query.q ? String(req.query.q).trim() : '';
    const filterRole = req.query.role ? String(req.query.role) : '';
    const filterBranchId = req.query.branchId ? String(req.query.branchId) : '';
    const filterActive = req.query.isActive !== undefined ? String(req.query.isActive) : '';

    const accounts = await adminAccountService.list({
      q: searchQ || undefined,
      role: filterRole || undefined,
      branchId: filterBranchId ? parseId(filterBranchId, 'branchId') : undefined,
      isActive: filterActive === '' ? undefined : filterActive === 'true',
    });

    const { branches } = await loadFormContext();
    const actor = req.admin || req.user;

    renderAdminPage(req, res, 'admin/accounts/index', {
      pageTitle: 'Tài khoản hệ thống',
      adminPage: 'accounts',
      breadcrumbs: [
        { label: 'Dashboard', href: '/admin' },
        { label: 'Tài khoản hệ thống' },
      ],
      accounts,
      branches,
      searchQ,
      filterRole,
      filterBranchId,
      filterActive,
      listQueryBase: {
        q: searchQ,
        role: filterRole,
        branchId: filterBranchId,
        isActive: filterActive,
      },
      adminRoles: adminAccountService.ADMIN_ROLES,
      assignableRoles: adminAccountService.assignableRoles(actor),
      roleLabel: adminAccountService.roleLabel,
      roleBadgeClass: adminAccountService.roleBadgeClass,
      canEditAccount: (target) => adminAccountService.canEditAccount(actor, target),
      formatDateTime,
      buildAccountsListQuery,
      flash: req.query.flash || null,
      msg: req.query.msg || null,
    });
  } catch (error) {
    renderAdminPage(req, res, 'admin/accounts/index', {
      pageTitle: 'Tài khoản hệ thống',
      adminPage: 'accounts',
      breadcrumbs: [
        { label: 'Dashboard', href: '/admin' },
        { label: 'Tài khoản hệ thống' },
      ],
      accounts: [],
      branches: [],
      searchQ: '',
      filterRole: '',
      filterBranchId: '',
      filterActive: '',
      listQueryBase: {},
      adminRoles: adminAccountService.ADMIN_ROLES,
      assignableRoles: [],
      roleLabel: adminAccountService.roleLabel,
      roleBadgeClass: adminAccountService.roleBadgeClass,
      canEditAccount: () => false,
      formatDateTime,
      buildAccountsListQuery,
      formError: error.message,
      flash: req.query.flash || null,
    });
  }
}

async function createForm(req, res) {
  const actor = req.admin || req.user;
  const { properties, branches } = await loadFormContext();

  renderAdminPage(req, res, 'admin/accounts/form', {
    pageTitle: 'Tạo tài khoản hệ thống',
    adminPage: 'accounts',
    breadcrumbs: [
      { label: 'Dashboard', href: '/admin' },
      { label: 'Tài khoản hệ thống', href: '/admin/accounts' },
      { label: 'Tạo mới' },
    ],
    mode: 'create',
    account: accountToForm({ role: 'staff', isActive: true }),
    properties,
    branches,
    assignableRoles: adminAccountService.assignableRoles(actor),
  });
}

async function create(req, res) {
  try {
    await adminAccountService.create(req.admin || req.user, req.body);
    res.redirect('/admin/accounts?flash=created');
  } catch (error) {
    const { properties, branches } = await loadFormContext();
    const actor = req.admin || req.user;
    renderAdminPage(req, res, 'admin/accounts/form', {
      pageTitle: 'Tạo tài khoản hệ thống',
      adminPage: 'accounts',
      breadcrumbs: [
        { label: 'Dashboard', href: '/admin' },
        { label: 'Tài khoản hệ thống', href: '/admin/accounts' },
        { label: 'Tạo mới' },
      ],
      mode: 'create',
      account: {
        fullName: req.body.fullName || '',
        email: req.body.email || '',
        avatarUrl: req.body.avatarUrl || '',
        role: req.body.role || 'staff',
        propertyId: req.body.propertyId || '',
        isActive: req.body.isActive === 'on',
        password: '',
      },
      properties,
      branches,
      assignableRoles: adminAccountService.assignableRoles(actor),
      formError: error.message,
    });
  }
}

async function editForm(req, res) {
  try {
    const account = await adminAccountService.getById(req.params.id);
    const actor = req.admin || req.user;
    if (!adminAccountService.canEditAccount(actor, account)) {
      return res.redirect('/admin/accounts?flash=forbidden');
    }

    const { properties, branches } = await loadFormContext();

    renderAdminPage(req, res, 'admin/accounts/form', {
      pageTitle: `Sửa ${account.fullName}`,
      adminPage: 'accounts',
      breadcrumbs: [
        { label: 'Dashboard', href: '/admin' },
        { label: 'Tài khoản hệ thống', href: '/admin/accounts' },
        { label: account.fullName },
      ],
      mode: 'edit',
      accountId: account.id,
      account: accountToForm(account),
      properties,
      branches,
      assignableRoles: adminAccountService.assignableRoles(actor),
    });
  } catch (error) {
    res.redirect(`/admin/accounts?flash=error&msg=${encodeURIComponent(error.message)}`);
  }
}

async function update(req, res) {
  try {
    await adminAccountService.update(req.admin || req.user, req.params.id, req.body);
    res.redirect('/admin/accounts?flash=updated');
  } catch (error) {
    const { properties, branches } = await loadFormContext();
    const actor = req.admin || req.user;
    let accountId = req.params.id;
    renderAdminPage(req, res, 'admin/accounts/form', {
      pageTitle: 'Sửa tài khoản',
      adminPage: 'accounts',
      breadcrumbs: [
        { label: 'Dashboard', href: '/admin' },
        { label: 'Tài khoản hệ thống', href: '/admin/accounts' },
        { label: 'Sửa' },
      ],
      mode: 'edit',
      accountId,
      account: {
        fullName: req.body.fullName || '',
        email: req.body.email || '',
        avatarUrl: req.body.avatarUrl || '',
        role: req.body.role || 'staff',
        propertyId: req.body.propertyId || '',
        isActive: req.body.isActive === 'on',
        password: '',
      },
      properties,
      branches,
      assignableRoles: adminAccountService.assignableRoles(actor),
      formError: error.message,
    });
  }
}

module.exports = {
  list,
  createForm,
  create,
  editForm,
  update,
};
