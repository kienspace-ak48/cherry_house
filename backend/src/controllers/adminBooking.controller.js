const bookingService = require('../modules/booking/booking.service');
const propertyService = require('../services/property.service');
const branchService = require('../services/branch.service');
const inventoryRoomService = require('../services/inventoryRoom.service');
const { renderAdminPage } = require('../utils/adminRender');
const { parseId } = require('../utils/http');

const BOOKING_STATUSES = [
  { value: 'pending_payment', label: 'Chờ thanh toán' },
  { value: 'confirmed', label: 'Đã xác nhận' },
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

async function loadFormContext() {
  const [properties, branches, rooms] = await Promise.all([
    propertyService.listProperties(),
    branchService.listBranches(),
    inventoryRoomService.list({ isActive: true }),
  ]);
  return { properties, branches, rooms };
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

    const [bookings, properties, branches, rooms] = await Promise.all([
      bookingService.list({
        status: filterStatus || undefined,
        propertyId: filterPropertyId || undefined,
        branchId: filterBranchId || undefined,
        roomId: filterRoomId || undefined,
        userId: filterUserId || undefined,
        code: filterCode || undefined,
        q: searchQ || undefined,
        checkInFrom: checkInFrom || undefined,
        checkInTo: checkInTo || undefined,
      }),
      propertyService.listProperties(),
      branchService.listBranches(),
      inventoryRoomService.list({ isActive: true }),
    ]);

    const filterBranches = filterPropertyId
      ? branches.filter((b) => String(b.propertyId) === filterPropertyId)
      : branches;
    const filterRooms = filterBranchId
      ? rooms.filter((r) => String(r.branchId) === filterBranchId)
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
    };

    renderAdminPage(req, res, 'admin/bookings/index', {
      pageTitle: 'Đặt phòng',
      adminPage: 'bookings',
      breadcrumbs: [
        { label: 'Dashboard', href: '/admin' },
        { label: 'Đặt phòng' },
      ],
      bookings,
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
      bookingStatuses: BOOKING_STATUSES,
      statusLabel,
      statusBadgeClass,
      formatDateOnly,
      formatVnd,
      buildBookingsListQuery,
      listQueryBase,
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

    renderAdminPage(req, res, 'admin/bookings/detail', {
      pageTitle: `Booking ${booking.bookingCode}`,
      adminPage: 'bookings',
      breadcrumbs: [
        { label: 'Dashboard', href: '/admin' },
        { label: 'Đặt phòng', href: '/admin/bookings' },
        { label: booking.bookingCode },
      ],
      booking,
      bookingStatuses: BOOKING_STATUSES,
      statusLabel,
      statusBadgeClass,
      formatDateOnly,
      formatDateTime,
      formatVnd,
      flash: req.query.flash || null,
    });
  } catch (error) {
    res.redirect(`/admin/bookings?flash=error&msg=${encodeURIComponent(error.message)}`);
  }
}

async function createForm(req, res) {
  const { properties, branches, rooms } = await loadFormContext();
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
    const payload = parseBookingFormBody(req.body);
    const created = await bookingService.createAdmin(payload);
    res.redirect(`/admin/bookings/${created.id}?flash=created`);
  } catch (error) {
    const { properties, branches, rooms } = await loadFormContext();
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
    const booking = await bookingService.getById(req.params.id);
    if (!booking) {
      return res.redirect('/admin/bookings?flash=notfound');
    }
    const { properties, branches, rooms } = await loadFormContext();

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
    parseId(req.params.id);
    await bookingService.update(req.params.id, parseBookingFormBody(req.body));
    res.redirect(`/admin/bookings/${req.params.id}?flash=updated`);
  } catch (error) {
    const { properties, branches, rooms } = await loadFormContext();
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

async function patchStatus(req, res) {
  try {
    const id = req.params.id;
    await bookingService.patchStatus(id, { status: req.body.status });
    const redirectTo = req.body.redirect || `/admin/bookings/${id}`;
    res.redirect(`${redirectTo}?flash=status_updated`);
  } catch (error) {
    res.redirect(`/admin/bookings/${req.params.id}?flash=error&msg=${encodeURIComponent(error.message)}`);
  }
}

async function calendar(req, res) {
  try {
    const [properties, branches] = await Promise.all([
      propertyService.listProperties(),
      branchService.listBranches(),
    ]);

    const filterPropertyId = req.query.propertyId ? String(req.query.propertyId) : '';
    const filterBranchId = req.query.branchId ? String(req.query.branchId) : '';
    const from = req.query.from ? String(req.query.from) : '';
    const to = req.query.to ? String(req.query.to) : '';

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
  calendar,
  statusLabel,
  statusBadgeClass,
};
