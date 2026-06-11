const bookingService = require('../modules/booking/booking.service');
const { generateBookingQrDataUrl } = require('../utils/bookingQr.util');
const bookingCheckInService = require('../services/bookingCheckIn.service');
const bookingCancelService = require('../modules/refund/bookingCancel.service');
const { evaluateRefundPolicy, policyLabel, vnNow } = require('../modules/refund/refundPolicy.service');
const {
  mergeScopeFilters,
  scopeCatalogLists,
  assertBookingInScope,
  assertRoomInScope,
  getAdminDataScope,
} = require('../utils/adminScope.util');
const propertyService = require('../services/property.service');
const branchService = require('../services/branch.service');
const inventoryRoomService = require('../services/inventoryRoom.service');
const { renderAdminPage } = require('../utils/adminRender');
const { parseId } = require('../utils/http');

const BOOKING_PAGE_SIZE = 20;

const BOOKING_STATUSES = [
  { value: 'pending_payment', label: 'Chờ thanh toán' },
  { value: 'confirmed', label: 'Chưa check-in' },
  { value: 'checked_in', label: 'Đã check-in' },
  { value: 'completed', label: 'Hoàn tất' },
  { value: 'cancelled', label: 'Đã hủy' },
  { value: 'no_show', label: 'Không đến' },
  { value: 'draft', label: 'Nháp' },
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

function buildBookingsListQuery(parts = {}) {
  const params = new URLSearchParams();
  Object.entries(parts).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      params.set(key, String(value));
    }
  });
  const qs = params.toString();
  return qs ? `?${qs}` : '';
}

function defaultExportDateRange() {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return { from: `${y}-${m}-01`, to: `${y}-${m}-${d}` };
}

function buildExportQuery(parts = {}) {
  const defaults = defaultExportDateRange();
  return buildBookingsListQuery({
    from: parts.from || defaults.from,
    to: parts.to || defaults.to,
    ...parts,
  });
}

function parseBookingFormBody(body) {
  return {
    roomId: body.roomId || '',
    checkIn: body.checkIn || '',
    checkOut: body.checkOut || '',
    guestName: body.guestName || '',
    guestPhone: body.guestPhone || '',
    guestEmail: body.guestEmail || '',
    specialNote: body.specialNote || '',
    adults: body.adults !== undefined && body.adults !== '' ? Number(body.adults) : 2,
    children: body.children !== undefined && body.children !== '' ? Number(body.children) : 0,
    pricePerNightVnd:
      body.pricePerNightVnd !== undefined && body.pricePerNightVnd !== ''
        ? Number(body.pricePerNightVnd)
        : '',
    serviceFeeVnd:
      body.serviceFeeVnd !== undefined && body.serviceFeeVnd !== ''
        ? Number(body.serviceFeeVnd)
        : 0,
    discountVnd:
      body.discountVnd !== undefined && body.discountVnd !== ''
        ? Number(body.discountVnd)
        : 0,
    status: body.status || 'confirmed',
    markPaid: body.markPaid === 'on' || body.markPaid === true || body.markPaid === '1',
  };
}

function emptyBooking() {
  return {
    roomId: '',
    checkIn: '',
    checkOut: '',
    guestName: '',
    guestPhone: '',
    guestEmail: '',
    specialNote: '',
    adults: 2,
    children: 0,
    pricePerNightVnd: '',
    serviceFeeVnd: 0,
    discountVnd: 0,
    status: 'confirmed',
    markPaid: true,
  };
}

function bookingToForm(booking) {
  return {
    roomId: booking.roomId,
    checkIn: booking.checkIn,
    checkOut: booking.checkOut,
    guestName: booking.guestName,
    guestPhone: booking.guestPhone,
    guestEmail: booking.guestEmail,
    specialNote: booking.specialNote || '',
    adults: booking.adults,
    children: booking.children,
    pricePerNightVnd: booking.pricePerNightVnd,
    serviceFeeVnd: booking.serviceFeeVnd,
    discountVnd: booking.discountVnd,
    status: booking.status,
    markPaid: booking.payment?.status === 'paid',
  };
}

async function loadFormContext(admin) {
  const [properties, branches, rooms] = await Promise.all([
    propertyService.listProperties(),
    branchService.listBranches(),
    inventoryRoomService.list({ isActive: true }),
  ]);
  return scopeCatalogLists(admin, { properties, branches, rooms });
}

async function list(req, res) {
  try {
    const filterStatus = req.query.status ? String(req.query.status) : '';
    const filterPropertyId = req.query.propertyId ? String(req.query.propertyId) : '';
    const filterBranchId = req.query.branchId ? String(req.query.branchId) : '';
    const filterRoomId = req.query.roomId ? String(req.query.roomId) : '';
    const filterCode = req.query.code ? String(req.query.code).trim() : '';
    const filterUserId = req.query.userId ? String(req.query.userId) : '';
    const searchQ = req.query.q ? String(req.query.q).trim() : '';
    const checkInFrom = req.query.checkInFrom ? String(req.query.checkInFrom) : '';
    const checkInTo = req.query.checkInTo ? String(req.query.checkInTo) : '';
    const exportRange = defaultExportDateRange();
    const exportFrom = req.query.from ? String(req.query.from) : exportRange.from;
    const exportTo = req.query.to ? String(req.query.to) : exportRange.to;

    const listQuery = {
      status: filterStatus || undefined,
      propertyId: filterPropertyId || undefined,
      branchId: filterBranchId || undefined,
      roomId: filterRoomId || undefined,
      userId: filterUserId || undefined,
      code: filterCode || undefined,
      q: searchQ || undefined,
      checkInFrom: checkInFrom || undefined,
      checkInTo: checkInTo || undefined,
      page: req.query.page,
      pageSize: BOOKING_PAGE_SIZE,
    };

    const scopedQuery = mergeScopeFilters(req.admin || req.user, listQuery);

    const actor = req.admin || req.user;
    const [bookingPage, catalog] = await Promise.all([
      bookingService.listPage(scopedQuery),
      loadFormContext(actor),
    ]);
    const { properties, branches, rooms } = catalog;

    const bookings = bookingPage.items;

    const scope = getAdminDataScope(actor);
    const scopedBranches = branches;
    const filterBranches = filterPropertyId
      ? scopedBranches.filter((b) => String(b.propertyId) === filterPropertyId)
      : scopedBranches;
    const filterRooms = filterBranchId
      ? rooms.filter((r) => String(r.branchId) === filterBranchId)
      : scope.branchId
        ? rooms.filter((r) => r.branchId === scope.branchId)
        : rooms;

    const listQueryBase = {
      status: filterStatus,
      propertyId: filterPropertyId,
      branchId: filterBranchId,
      roomId: filterRoomId,
      userId: filterUserId,
      code: filterCode,
      q: searchQ,
      checkInFrom,
      checkInTo,
      from: exportFrom,
      to: exportTo,
    };

    renderAdminPage(req, res, 'admin/bookings/index', {
      pageTitle: 'Đặt phòng',
      adminPage: 'bookings',
      breadcrumbs: [
        { label: 'Dashboard', href: '/admin' },
        { label: 'Đặt phòng' },
      ],
      bookings,
      bookingTotal: bookingPage.total,
      page: bookingPage.page,
      totalPages: bookingPage.totalPages,
      pageSize: bookingPage.pageSize,
      properties,
      branches,
      rooms,
      filterBranches,
      filterRooms,
      filterStatus,
      filterPropertyId,
      filterBranchId,
      filterRoomId,
      filterCode,
      filterUserId,
      searchQ,
      checkInFrom,
      checkInTo,
      exportFrom,
      exportTo,
      bookingStatuses: BOOKING_STATUSES,
      statusLabel,
      statusBadgeClass,
      formatDateOnly,
      formatVnd,
      buildBookingsListQuery,
      listQueryBase,
      exportQuery: buildExportQuery(listQueryBase),
      flash: req.query.flash || null,
      msg: req.query.msg || null,
    });
  } catch (error) {
    renderAdminPage(req, res, 'admin/bookings/index', {
      pageTitle: 'Đặt phòng',
      adminPage: 'bookings',
      breadcrumbs: [
        { label: 'Dashboard', href: '/admin' },
        { label: 'Đặt phòng' },
      ],
      bookings: [],
      bookingTotal: 0,
      page: 1,
      totalPages: 1,
      pageSize: BOOKING_PAGE_SIZE,
      properties: [],
      branches: [],
      rooms: [],
      filterBranches: [],
      filterRooms: [],
      filterStatus: '',
      filterPropertyId: '',
      filterBranchId: '',
      filterRoomId: '',
      filterCode: '',
      filterUserId: '',
      searchQ: '',
      checkInFrom: '',
      checkInTo: '',
      bookingStatuses: BOOKING_STATUSES,
      statusLabel,
      statusBadgeClass,
      formatDateOnly,
      formatVnd,
      buildBookingsListQuery,
      listQueryBase: {},
      flash: req.query.flash || null,
      msg: req.query.msg || null,
      formError: error.message,
    });
  }
}

async function detail(req, res) {
  try {
    const booking = await bookingService.getById(req.params.id);
    if (!booking) {
      return res.redirect('/admin/bookings?flash=notfound');
    }
    assertBookingInScope(req.admin || req.user, booking);

    let bookingQrDataUrl = '';
    if (booking.status === 'confirmed' || booking.payment?.status === 'paid') {
      try {
        bookingQrDataUrl = await generateBookingQrDataUrl(booking.bookingCode);
      } catch (_err) {
        bookingQrDataUrl = '';
      }
    }

    const checkInRecord = await bookingCheckInService.getByBookingId(booking.id);
    let cancelPreview = null;
    if (bookingCancelService.CANCELLABLE_STATUSES.has(booking.status)) {
      try {
        const policy = evaluateRefundPolicy(booking, booking.payment, vnNow());
        cancelPreview = {
          ...policy,
          policyLabel: policyLabel(policy.policyCode),
          canCancel: true,
        };
      } catch (_err) {
        cancelPreview = null;
      }
    }

    renderAdminPage(req, res, 'admin/bookings/detail', {
      pageTitle: `Booking ${booking.bookingCode}`,
      adminPage: 'bookings',
      breadcrumbs: [
        { label: 'Dashboard', href: '/admin' },
        { label: 'Đặt phòng', href: '/admin/bookings' },
        { label: booking.bookingCode },
      ],
      booking,
      bookingQrDataUrl,
      checkInRecord,
      cancelPreview,
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
    res.redirect(`/admin/bookings?flash=error&msg=${encodeURIComponent(error.message)}`);
  }
}

async function createForm(req, res) {
  const { properties, branches, rooms } = await loadFormContext(req.admin || req.user);
  const prefill = emptyBooking();
  if (req.query.roomId) prefill.roomId = req.query.roomId;
  if (req.query.checkIn) prefill.checkIn = req.query.checkIn;
  if (req.query.checkOut) prefill.checkOut = req.query.checkOut;

  renderAdminPage(req, res, 'admin/bookings/form', {
    pageTitle: 'Tạo booking thủ công',
    adminPage: 'bookings',
    breadcrumbs: [
      { label: 'Dashboard', href: '/admin' },
      { label: 'Đặt phòng', href: '/admin/bookings' },
      { label: 'Tạo mới' },
    ],
    mode: 'create',
    booking: prefill,
    properties,
    branches,
    rooms,
    bookingStatuses: BOOKING_STATUSES,
    statusLabel,
    formatVnd,
  });
}

async function create(req, res) {
  try {
    const actor = req.admin || req.user;
    const payload = parseBookingFormBody(req.body);
    const { rooms } = await loadFormContext(actor);
    const room = rooms.find((r) => String(r.id) === String(payload.roomId));
    if (room) assertRoomInScope(actor, room);
    const created = await bookingService.createAdmin(payload);
    res.redirect(`/admin/bookings/${created.id}?flash=created`);
  } catch (error) {
    const { properties, branches, rooms } = await loadFormContext(req.admin || req.user);
    renderAdminPage(req, res, 'admin/bookings/form', {
      pageTitle: 'Tạo booking thủ công',
      adminPage: 'bookings',
      breadcrumbs: [
        { label: 'Dashboard', href: '/admin' },
        { label: 'Đặt phòng', href: '/admin/bookings' },
        { label: 'Tạo mới' },
      ],
      mode: 'create',
      booking: parseBookingFormBody(req.body),
      properties,
      branches,
      rooms,
      bookingStatuses: BOOKING_STATUSES,
      statusLabel,
      formatVnd,
      formError: error.message,
    });
  }
}

async function editForm(req, res) {
  try {
    const actor = req.admin || req.user;
    const booking = await bookingService.getById(req.params.id);
    if (!booking) {
      return res.redirect('/admin/bookings?flash=notfound');
    }
    assertBookingInScope(actor, booking);
    const { properties, branches, rooms } = await loadFormContext(actor);

    renderAdminPage(req, res, 'admin/bookings/form', {
      pageTitle: `Sửa ${booking.bookingCode}`,
      adminPage: 'bookings',
      breadcrumbs: [
        { label: 'Dashboard', href: '/admin' },
        { label: 'Đặt phòng', href: '/admin/bookings' },
        { label: booking.bookingCode, href: `/admin/bookings/${booking.id}` },
        { label: 'Sửa' },
      ],
      mode: 'edit',
      booking: bookingToForm(booking),
      bookingId: booking.id,
      bookingCode: booking.bookingCode,
      properties,
      branches,
      rooms,
      bookingStatuses: BOOKING_STATUSES,
      statusLabel,
      formatVnd,
    });
  } catch (error) {
    res.redirect(`/admin/bookings?flash=error&msg=${encodeURIComponent(error.message)}`);
  }
}

async function update(req, res) {
  try {
    const actor = req.admin || req.user;
    parseId(req.params.id);
    const existing = await bookingService.getById(req.params.id);
    if (!existing) {
      return res.redirect('/admin/bookings?flash=notfound');
    }
    assertBookingInScope(actor, existing);
    const payload = parseBookingFormBody(req.body);
    const { rooms } = await loadFormContext(actor);
    const room = rooms.find((r) => String(r.id) === String(payload.roomId));
    if (room) assertRoomInScope(actor, room);
    await bookingService.update(req.params.id, payload);
    res.redirect(`/admin/bookings/${req.params.id}?flash=updated`);
  } catch (error) {
    const { properties, branches, rooms } = await loadFormContext(req.admin || req.user);
    let bookingCode = '';
    try {
      const existing = await bookingService.getById(req.params.id);
      bookingCode = existing?.bookingCode || '';
    } catch (_err) {
      /* ignore */
    }
    renderAdminPage(req, res, 'admin/bookings/form', {
      pageTitle: bookingCode ? `Sửa ${bookingCode}` : 'Sửa booking',
      adminPage: 'bookings',
      breadcrumbs: [
        { label: 'Dashboard', href: '/admin' },
        { label: 'Đặt phòng', href: '/admin/bookings' },
        { label: 'Sửa' },
      ],
      mode: 'edit',
      booking: parseBookingFormBody(req.body),
      bookingId: req.params.id,
      bookingCode,
      properties,
      branches,
      rooms,
      bookingStatuses: BOOKING_STATUSES,
      statusLabel,
      formatVnd,
      formError: error.message,
    });
  }
}

async function cancelBooking(req, res) {
  try {
    const id = req.params.id;
    const result = await bookingCancelService.cancelBooking({
      bookingIdRaw: id,
      actor: req.admin || req.user,
      cancelledBy: 'admin',
    });
    const msg = result.refundAmountVnd > 0
      ? `Đã hủy — hoàn ${result.refundAmountVnd.toLocaleString('vi-VN')}đ vào ví`
      : 'Đã hủy booking';
    res.redirect(`/admin/bookings/${id}?flash=status_updated&msg=${encodeURIComponent(msg)}`);
  } catch (error) {
    res.redirect(`/admin/bookings/${req.params.id}?flash=error&msg=${encodeURIComponent(error.message)}`);
  }
}

async function patchStatus(req, res) {
  try {
    const id = req.params.id;
    const existing = await bookingService.getById(id);
    if (!existing) {
      return res.redirect('/admin/bookings?flash=notfound');
    }
    assertBookingInScope(req.admin || req.user, existing);
    await bookingService.patchStatus(id, { status: req.body.status });
    const redirectTo = req.body.redirect || `/admin/bookings/${id}`;
    res.redirect(`${redirectTo}?flash=status_updated`);
  } catch (error) {
    res.redirect(`/admin/bookings/${req.params.id}?flash=error&msg=${encodeURIComponent(error.message)}`);
  }
}

function todayIsoDate() {
  return new Date().toISOString().slice(0, 10);
}

async function reception(req, res) {
  try {
    const actor = req.admin || req.user;
    const scope = getAdminDataScope(actor);
    const today = todayIsoDate();

    const scopedToday = mergeScopeFilters(actor, {
      checkInFrom: today,
      checkInTo: today,
      status: 'confirmed',
      pageSize: 30,
    });
    const scopedDepartures = mergeScopeFilters(actor, {
      checkOutFrom: today,
      checkOutTo: today,
      status: 'confirmed',
      pageSize: 30,
    });

    const [arrivalsPage, departuresPage, catalog] = await Promise.all([
      bookingService.listPage(scopedToday),
      bookingService.listPage(scopedDepartures),
      loadFormContext(actor),
    ]);

    renderAdminPage(req, res, 'admin/bookings/reception', {
      pageTitle: 'Lễ tân',
      adminPage: 'bookings-reception',
      breadcrumbs: [
        { label: 'Dashboard', href: '/admin' },
        { label: 'Đặt phòng', href: '/admin/bookings' },
        { label: 'Lễ tân' },
      ],
      arrivals: arrivalsPage.items,
      departures: departuresPage.items,
      branchName: actor?.branchName || catalog.branches.find((b) => b.id === scope.branchId)?.name || '',
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
    renderAdminPage(req, res, 'admin/bookings/reception', {
      pageTitle: 'Lễ tân',
      adminPage: 'bookings-reception',
      breadcrumbs: [
        { label: 'Dashboard', href: '/admin' },
        { label: 'Đặt phòng', href: '/admin/bookings' },
        { label: 'Lễ tân' },
      ],
      arrivals: [],
      departures: [],
      branchName: '',
      bookingStatuses: BOOKING_STATUSES,
      statusLabel,
      statusBadgeClass,
      formatDateOnly,
      formatDateTime,
      formatVnd,
      flash: 'error',
      msg: error.message,
    });
  }
}

async function lookupAjax(req, res) {
  try {
    const q = String(req.query.q || '').trim();
    if (!q) {
      return res.json({ success: true, data: [] });
    }
    const scoped = mergeScopeFilters(req.admin || req.user, {});
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
    const id = req.params.id;
    const existing = await bookingService.getById(id);
    if (!existing) {
      return res.redirect('/admin/bookings/reception?flash=notfound');
    }
    assertBookingInScope(req.admin || req.user, existing);
    const staffId = req.admin?.id || req.user?.id || 'staff';
    await bookingService.confirmPaymentAtCounter(id, `STAFF-${staffId}`);
    const redirectTo = req.body.redirect || `/admin/bookings/${id}`;
    res.redirect(`${redirectTo}?flash=status_updated&msg=${encodeURIComponent('Đã xác nhận thanh toán tại quầy')}`);
  } catch (error) {
    const redirectTo = req.body.redirect || '/admin/bookings/reception';
    res.redirect(`${redirectTo}?flash=error&msg=${encodeURIComponent(error.message)}`);
  }
}

async function checkInGuest(req, res) {
  try {
    const id = req.params.id;
    const existing = await bookingService.getById(id);
    if (!existing) {
      return res.redirect('/admin/bookings?flash=notfound');
    }
    assertBookingInScope(req.admin || req.user, existing);
    const signatureDataUrl = typeof req.body.signatureDataUrl === 'string'
      ? req.body.signatureDataUrl.trim()
      : '';
    const actor = req.admin || req.user;
    await bookingService.checkInGuest(id, {
      signatureDataUrl,
      staffAdminId: actor?.id,
      staffName: actor?.fullName || actor?.email,
    });
    const redirectTo = req.body.redirect || `/admin/bookings/${id}`;
    res.redirect(`${redirectTo}?flash=status_updated&msg=${encodeURIComponent('Đã check-in khách')}`);
  } catch (error) {
    const redirectTo = req.body.redirect || `/admin/bookings/${req.params.id}`;
    res.redirect(`${redirectTo}?flash=error&msg=${encodeURIComponent(error.message)}`);
  }
}

async function checkOutGuest(req, res) {
  try {
    const id = req.params.id;
    const existing = await bookingService.getById(id);
    if (!existing) {
      return res.redirect('/admin/bookings?flash=notfound');
    }
    assertBookingInScope(req.admin || req.user, existing);
    await bookingService.checkOutGuest(id);
    const redirectTo = req.body.redirect || `/admin/bookings/${id}`;
    res.redirect(`${redirectTo}?flash=status_updated&msg=${encodeURIComponent('Đã check-out khách')}`);
  } catch (error) {
    const redirectTo = req.body.redirect || `/admin/bookings/${req.params.id}`;
    res.redirect(`${redirectTo}?flash=error&msg=${encodeURIComponent(error.message)}`);
  }
}

async function calendar(req, res) {
  try {
    const actor = req.admin || req.user;
    const { properties, branches } = await loadFormContext(actor);
    const scope = getAdminDataScope(actor);

    let filterPropertyId = req.query.propertyId ? String(req.query.propertyId) : '';
    let filterBranchId = req.query.branchId ? String(req.query.branchId) : '';
    const from = req.query.from ? String(req.query.from) : '';
    const to = req.query.to ? String(req.query.to) : '';

    if (scope.branchId) {
      filterBranchId = String(scope.branchId);
      filterPropertyId = String(scope.propertyId || properties[0]?.id || '');
    }

    const filterBranches = filterPropertyId
      ? branches.filter((b) => String(b.propertyId) === filterPropertyId)
      : branches;

    renderAdminPage(req, res, 'admin/bookings/calendar', {
      pageTitle: 'Lịch phòng',
      adminPage: 'bookings-calendar',
      breadcrumbs: [
        { label: 'Dashboard', href: '/admin' },
        { label: 'Đặt phòng', href: '/admin/bookings' },
        { label: 'Lịch phòng' },
      ],
      properties,
      branches: filterBranches,
      allBranches: branches,
      filterPropertyId,
      filterBranchId,
      from,
      to,
      statusLabel,
      statusBadgeClass,
      buildBookingsListQuery,
    });
  } catch (error) {
    renderAdminPage(req, res, 'admin/bookings/calendar', {
      pageTitle: 'Lịch phòng',
      adminPage: 'bookings-calendar',
      breadcrumbs: [
        { label: 'Dashboard', href: '/admin' },
        { label: 'Đặt phòng', href: '/admin/bookings' },
        { label: 'Lịch phòng' },
      ],
      properties: [],
      branches: [],
      allBranches: [],
      filterPropertyId: '',
      filterBranchId: '',
      from: '',
      to: '',
      statusLabel,
      statusBadgeClass,
      buildBookingsListQuery,
      formError: error.message,
    });
  }
}

module.exports = {
  list,
  detail,
  createForm,
  create,
  editForm,
  update,
  patchStatus,
  cancelBooking,
  reception,
  lookupAjax,
  markPaidCounter,
  checkInGuest,
  checkOutGuest,
  calendar,
  statusLabel,
  statusBadgeClass,
};
