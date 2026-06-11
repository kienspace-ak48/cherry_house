const bookingService = require('../modules/booking/booking.service');
const propertyService = require('../services/property.service');
const branchService = require('../services/branch.service');
const { renderStaffPage } = require('../utils/staffRender');
const {
  mergeStaffScopeFilters,
  scopePropertyCatalog,
  assertBookingInStaffScope,
  assertBranchInStaffScope,
} = require('../utils/staffScope.util');
const { generateBookingQrDataUrl } = require('../utils/bookingQr.util');
const bookingCheckInService = require('../services/bookingCheckIn.service');

const BOOKING_PAGE_SIZE = 20;

const BOOKING_STATUSES = [
  { value: 'pending_payment', label: 'Chờ thanh toán' },
  { value: 'confirmed', label: 'Chưa check-in' },
  { value: 'checked_in', label: 'Đã check-in' },
  { value: 'completed', label: 'Hoàn tất' },
  { value: 'cancelled', label: 'Đã hủy' },
  { value: 'no_show', label: 'Không đến' },
];

function statusLabel(status) {
  return BOOKING_STATUSES.find((s) => s.value === status)?.label || status;
}

function statusBadgeClass(status) {
  const map = {
    pending_payment: 'warning',
    confirmed: 'success',
    checked_in: 'primary',
    completed: 'info',
    cancelled: 'danger',
    no_show: 'secondary',
    draft: 'secondary',
  };
  return map[status] || 'secondary';
}

function formatDateOnly(value) {
  if (!value) return '—';
  const str = typeof value === 'string' ? value : value.toISOString().slice(0, 10);
  return new Date(`${str}T12:00:00`).toLocaleDateString('vi-VN');
}

function formatDateTime(value) {
  if (!value) return '—';
  return new Date(value).toLocaleString('vi-VN');
}

function formatVnd(amount) {
  return Number(amount || 0).toLocaleString('vi-VN') + ' ₫';
}

function todayIsoDate() {
  return new Date().toISOString().slice(0, 10);
}

async function loadCatalog(staff) {
  const [properties, branches] = await Promise.all([
    propertyService.listProperties(),
    branchService.listBranches(),
  ]);
  return scopePropertyCatalog(staff, { properties, branches });
}

async function list(req, res) {
  try {
    const staff = req.staff;
    const searchQ = req.query.q ? String(req.query.q).trim() : '';
    const filterStatus = req.query.status ? String(req.query.status) : '';
    const filterBranchId = req.query.branchId ? String(req.query.branchId) : '';
    const filterCode = req.query.code ? String(req.query.code).trim() : '';

    const listQuery = mergeStaffScopeFilters(staff, {
      status: filterStatus || undefined,
      branchId: filterBranchId || undefined,
      code: filterCode || undefined,
      q: searchQ || undefined,
      page: req.query.page,
      pageSize: BOOKING_PAGE_SIZE,
    });

    const [bookingPage, catalog] = await Promise.all([
      bookingService.listPage(listQuery),
      loadCatalog(staff),
    ]);

    renderStaffPage(req, res, 'staff/bookings/index', {
      pageTitle: 'Đặt phòng',
      staffPage: 'bookings',
      bookings: bookingPage.items,
      bookingTotal: bookingPage.total,
      page: bookingPage.page,
      totalPages: bookingPage.totalPages,
      branches: catalog.branches,
      filterStatus,
      filterBranchId,
      filterCode,
      searchQ,
      bookingStatuses: BOOKING_STATUSES,
      statusLabel,
      statusBadgeClass,
      formatDateOnly,
      formatVnd,
      flash: req.query.flash || null,
      msg: req.query.msg || null,
    });
  } catch (error) {
    renderStaffPage(req, res, 'staff/bookings/index', {
      pageTitle: 'Đặt phòng',
      staffPage: 'bookings',
      bookings: [],
      bookingTotal: 0,
      page: 1,
      totalPages: 1,
      branches: [],
      filterStatus: '',
      filterBranchId: '',
      filterCode: '',
      searchQ: '',
      bookingStatuses: BOOKING_STATUSES,
      statusLabel,
      statusBadgeClass,
      formatDateOnly,
      formatVnd,
      formError: error.message,
    });
  }
}

async function detail(req, res) {
  try {
    const booking = await bookingService.getById(req.params.id);
    if (!booking) {
      return res.redirect('/staff/bookings?flash=notfound');
    }
    assertBookingInStaffScope(req.staff, booking);

    let bookingQrDataUrl = '';
    if (['confirmed', 'checked_in'].includes(booking.status) || booking.payment?.status === 'paid') {
      try {
        bookingQrDataUrl = await generateBookingQrDataUrl(booking.bookingCode);
      } catch (_err) {
        bookingQrDataUrl = '';
      }
    }

    const checkInRecord = await bookingCheckInService.getByBookingId(booking.id);

    renderStaffPage(req, res, 'staff/bookings/detail', {
      pageTitle: booking.bookingCode,
      staffPage: 'bookings',
      booking,
      bookingQrDataUrl,
      checkInRecord,
      bookingStatuses: BOOKING_STATUSES,
      statusLabel,
      statusBadgeClass,
      formatDateOnly,
      formatDateTime,
      formatVnd,
      flash: req.query.flash || null,
      msg: req.query.msg || null,
    });
  } catch (error) {
    res.redirect(`/staff/bookings?flash=error&msg=${encodeURIComponent(error.message)}`);
  }
}

async function reception(req, res) {
  try {
    const staff = req.staff;
    const today = todayIsoDate();

    const [arrivalsPage, departuresPage, catalog] = await Promise.all([
      bookingService.listPage(mergeStaffScopeFilters(staff, {
        checkInFrom: today,
        checkInTo: today,
        status: 'confirmed',
        pageSize: 30,
      })),
      bookingService.listPage(mergeStaffScopeFilters(staff, {
        checkOutFrom: today,
        checkOutTo: today,
        status: 'checked_in',
        pageSize: 30,
      })),
      loadCatalog(staff),
    ]);

    renderStaffPage(req, res, 'staff/bookings/reception', {
      pageTitle: 'Lễ tân',
      staffPage: 'reception',
      arrivals: arrivalsPage.items,
      departures: departuresPage.items,
      propertyName: staff.propertyName || catalog.properties[0]?.name || '',
      bookingStatuses: BOOKING_STATUSES,
      statusLabel,
      statusBadgeClass,
      formatDateOnly,
      formatVnd,
      flash: req.query.flash || null,
      msg: req.query.msg || null,
    });
  } catch (error) {
    renderStaffPage(req, res, 'staff/bookings/reception', {
      pageTitle: 'Lễ tân',
      staffPage: 'reception',
      arrivals: [],
      departures: [],
      propertyName: req.staff?.propertyName || '',
      bookingStatuses: BOOKING_STATUSES,
      statusLabel,
      statusBadgeClass,
      formatDateOnly,
      formatVnd,
      flash: 'error',
      msg: error.message,
    });
  }
}

async function lookupAjax(req, res) {
  try {
    const q = String(req.query.q || '').trim();
    if (!q) return res.json({ success: true, data: [] });
    const scoped = mergeStaffScopeFilters(req.staff, {});
    const items = await bookingService.lookupForStaff(q, scoped);
    return res.json({ success: true, data: items });
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message,
    });
  }
}

async function markPaidCounter(req, res) {
  try {
    const existing = await bookingService.getById(req.params.id);
    if (!existing) return res.redirect('/staff/reception?flash=notfound');
    assertBookingInStaffScope(req.staff, existing);
    const staffId = req.staff?.id || 'staff';
    await bookingService.confirmPaymentAtCounter(req.params.id, `STAFF-${staffId}`);
    const redirectTo = req.body.redirect || `/staff/bookings/${req.params.id}`;
    res.redirect(`${redirectTo}?flash=ok&msg=${encodeURIComponent('Đã xác nhận thanh toán')}`);
  } catch (error) {
    const redirectTo = req.body.redirect || '/staff/reception';
    res.redirect(`${redirectTo}?flash=error&msg=${encodeURIComponent(error.message)}`);
  }
}

async function checkInGuest(req, res) {
  try {
    const existing = await bookingService.getById(req.params.id);
    if (!existing) return res.redirect('/staff/reception?flash=notfound');
    assertBookingInStaffScope(req.staff, existing);
    const signatureDataUrl = typeof req.body.signatureDataUrl === 'string'
      ? req.body.signatureDataUrl.trim()
      : '';
    await bookingService.checkInGuest(req.params.id, {
      signatureDataUrl,
      staffAdminId: req.staff?.id,
      staffName: req.staff?.fullName || req.staff?.email,
    });
    const redirectTo = req.body.redirect || `/staff/bookings/${req.params.id}`;
    res.redirect(`${redirectTo}?flash=ok&msg=${encodeURIComponent('Đã check-in khách')}`);
  } catch (error) {
    const redirectTo = req.body.redirect || '/staff/reception';
    res.redirect(`${redirectTo}?flash=error&msg=${encodeURIComponent(error.message)}`);
  }
}

async function checkOutGuest(req, res) {
  try {
    const existing = await bookingService.getById(req.params.id);
    if (!existing) return res.redirect('/staff/reception?flash=notfound');
    assertBookingInStaffScope(req.staff, existing);
    await bookingService.checkOutGuest(req.params.id);
    const redirectTo = req.body.redirect || `/staff/bookings/${req.params.id}`;
    res.redirect(`${redirectTo}?flash=ok&msg=${encodeURIComponent('Đã check-out khách')}`);
  } catch (error) {
    const redirectTo = req.body.redirect || '/staff/reception';
    res.redirect(`${redirectTo}?flash=error&msg=${encodeURIComponent(error.message)}`);
  }
}

async function calendar(req, res) {
  try {
    const staff = req.staff;
    const catalog = await loadCatalog(staff);
    const { properties, branches } = catalog;

    let filterPropertyId = String(staff.propertyId || properties[0]?.id || '');
    let filterBranchId = req.query.branchId ? String(req.query.branchId) : '';
    const from = req.query.from ? String(req.query.from) : '';
    const to = req.query.to ? String(req.query.to) : '';

    renderStaffPage(req, res, 'staff/bookings/calendar', {
      pageTitle: 'Lịch phòng',
      staffPage: 'calendar',
      properties,
      branches,
      allBranches: branches,
      filterPropertyId,
      filterBranchId,
      from,
      to,
      statusLabel,
      statusBadgeClass,
    });
  } catch (error) {
    renderStaffPage(req, res, 'staff/bookings/calendar', {
      pageTitle: 'Lịch phòng',
      staffPage: 'calendar',
      properties: [],
      branches: [],
      allBranches: [],
      filterPropertyId: '',
      filterBranchId: '',
      from: '',
      to: '',
      statusLabel,
      statusBadgeClass,
      formError: error.message,
    });
  }
}

module.exports = {
  list,
  detail,
  reception,
  lookupAjax,
  markPaidCounter,
  checkInGuest,
  checkOutGuest,
  calendar,
};
