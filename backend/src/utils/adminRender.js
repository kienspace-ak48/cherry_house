const PROPERTY_KINDS = [
  { value: 'homestay', label: 'Homestay' },
  { value: 'mini_hotel', label: 'Mini Hotel' },
  { value: 'villa', label: 'Villa' },
  { value: 'serviced_apartment', label: 'Căn hộ dịch vụ' },
];

function renderAdminPage(req, res, view, options = {}) {
  const { pageTitle, adminPage, breadcrumbs = [], ...rest } = options;
  const sessionUser = req.user || {};

  res.render(view, {
    layout: 'layouts/adminLayoutCoreui',
    pageTitle,
    adminPage,
    breadcrumbs,
    propertyKinds: PROPERTY_KINDS,
    user: {
      email: sessionUser.email,
      fullName: sessionUser.fullName,
      avatar: sessionUser.avatar || sessionUser.avatarUrl || null,
      role: sessionUser.role,
      branchId: sessionUser.branchId,
      branchName: sessionUser.branchName,
      propertyName: sessionUser.propertyName,
    },
    isSuperAdmin: sessionUser.role === 'super_admin',
    isAdminManager: sessionUser.role === 'super_admin' || sessionUser.role === 'admin',
    isStaff: sessionUser.role === 'staff',
    flash: null,
    msg: null,
    formError: null,
    ...rest,
  });
}

function kindLabel(kind) {
  return PROPERTY_KINDS.find((k) => k.value === kind)?.label || kind;
}

module.exports = { renderAdminPage, kindLabel, PROPERTY_KINDS };
