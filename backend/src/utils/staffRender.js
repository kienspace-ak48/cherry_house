function renderStaffPage(req, res, view, options = {}) {
  const { pageTitle, staffPage, breadcrumbs = [], ...rest } = options;
  const sessionUser = req.staff || req.user || {};

  res.render(view, {
    layout: 'layouts/staffLayout',
    pageTitle,
    staffPage,
    breadcrumbs,
    user: {
      email: sessionUser.email,
      fullName: sessionUser.fullName,
      role: sessionUser.role,
      propertyId: sessionUser.propertyId,
      propertyName: sessionUser.propertyName,
    },
    flash: null,
    msg: null,
    formError: null,
    ...rest,
  });
}

module.exports = { renderStaffPage };
