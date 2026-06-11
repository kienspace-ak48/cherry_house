const ExcelJS = require('exceljs');
const prisma = require('../../config/prisma.config');
const { mergeScopeFilters } = require('../../utils/adminScope.util');
const { httpError } = require('../../utils/http');

const VN_TZ = 'Asia/Ho_Chi_Minh';
const MAX_RANGE_DAYS = 365;
const MAX_BOOKING_ROWS = 50000;

const EXPORT_SHEETS = [
  { id: 'tong_quan', label: 'Tổng quan', description: 'KPI doanh thu, AOV, ADR, công suất theo chi nhánh' },
  { id: 'bookings', label: 'Bookings', description: 'Chi tiết từng đặt phòng trong kỳ' },
  { id: 'thanh_toan', label: 'Thanh toán', description: 'Giao dịch thanh toán (paid/pending/failed)' },
  { id: 'cong_suat', label: 'Công suất', description: 'Occupancy theo ngày × chi nhánh' },
  { id: 'check_in', label: 'Check-in', description: 'Lịch sử check-in và booking chưa check-in' },
  { id: 'khach_hang', label: 'Khách hàng', description: 'CRM — thống kê khách có booking trong kỳ' },
  { id: 'ma_khuyen_mai', label: 'Mã khuyến mãi', description: 'Cấu hình promo và usage trong kỳ' },
  { id: 'lien_he', label: 'Liên hệ', description: 'Tin nhắn form liên hệ trong kỳ' },
];

const VALID_SHEET_IDS = new Set(EXPORT_SHEETS.map((s) => s.id));

const SHEETS_NEEDING_BOOKINGS = new Set([
  'tong_quan',
  'bookings',
  'thanh_toan',
  'khach_hang',
  'ma_khuyen_mai',
]);

function vnNow() {
  return new Date(new Date().toLocaleString('en-US', { timeZone: VN_TZ }));
}

function vnDateOnly(date = vnNow()) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function parseDateOnly(str) {
  return new Date(`${str}T12:00:00.000Z`);
}

function vnDayBounds(dateStr) {
  const start = new Date(`${dateStr}T00:00:00+07:00`);
  const end = new Date(`${dateStr}T23:59:59.999+07:00`);
  return { start, end };
}

function defaultDateRange() {
  const end = vnNow();
  const start = new Date(end.getFullYear(), end.getMonth(), 1);
  return { from: vnDateOnly(start), to: vnDateOnly(end) };
}

function daysBetweenInclusive(fromStr, toStr) {
  const from = parseDateOnly(fromStr);
  const to = parseDateOnly(toStr);
  const ms = to.getTime() - from.getTime();
  return Math.floor(ms / (24 * 60 * 60 * 1000)) + 1;
}

function eachDateInRange(fromStr, toStr) {
  const dates = [];
  const cur = parseDateOnly(fromStr);
  const end = parseDateOnly(toStr);
  while (cur <= end) {
    dates.push(cur.toISOString().slice(0, 10));
    cur.setUTCDate(cur.getUTCDate() + 1);
  }
  return dates;
}

function parseOptionalId(value) {
  if (value === undefined || value === null || value === '') return undefined;
  const n = Number(value);
  return Number.isInteger(n) && n > 0 ? n : undefined;
}

function parseExportParams(query = {}, admin) {
  const defaults = defaultDateRange();
  const from = query.from ? String(query.from).trim() : defaults.from;
  const to = query.to ? String(query.to).trim() : defaults.to;

  if (!/^\d{4}-\d{2}-\d{2}$/.test(from) || !/^\d{4}-\d{2}-\d{2}$/.test(to)) {
    throw httpError('from và to phải có định dạng YYYY-MM-DD', 400);
  }
  if (parseDateOnly(to) < parseDateOnly(from)) {
    throw httpError('to phải sau hoặc bằng from', 400);
  }
  if (daysBetweenInclusive(from, to) > MAX_RANGE_DAYS) {
    throw httpError(`Khoảng ngày tối đa ${MAX_RANGE_DAYS} ngày`, 400);
  }

  const filters = {
    from,
    to,
    createdAtFrom: vnDayBounds(from).start,
    createdAtTo: vnDayBounds(to).end,
    propertyId: parseOptionalId(query.propertyId),
    branchId: parseOptionalId(query.branchId),
    roomId: parseOptionalId(query.roomId),
    userId: parseOptionalId(query.userId),
    status: query.status ? String(query.status) : undefined,
    bookingCode: query.code || query.bookingCode ? String(query.code || query.bookingCode).trim() : undefined,
    q: query.q ? String(query.q).trim() : undefined,
    checkInFrom: query.checkInFrom ? parseDateOnly(String(query.checkInFrom)) : undefined,
    checkInTo: query.checkInTo ? parseDateOnly(String(query.checkInTo)) : undefined,
  };

  return mergeScopeFilters(admin, filters);
}

function parseSelectedSheets(query = {}) {
  let raw = query.sheets;
  if (raw === undefined || raw === null || raw === '') {
    return new Set(EXPORT_SHEETS.map((s) => s.id));
  }
  if (typeof raw === 'string') {
    raw = raw.split(',').map((s) => s.trim()).filter(Boolean);
  }
  if (!Array.isArray(raw)) raw = [String(raw)];
  const selected = new Set(raw.filter((id) => VALID_SHEET_IDS.has(id)));
  if (!selected.size) {
    throw httpError('Chọn ít nhất một loại sheet để xuất', 400);
  }
  return selected;
}

function buildBookingWhere(filters) {
  /** @type {import('../../generated/prisma').Prisma.BookingWhereInput} */
  const where = {
    createdAt: { gte: filters.createdAtFrom, lte: filters.createdAtTo },
  };
  if (filters.userId) where.userId = filters.userId;
  if (filters.status) where.status = filters.status;
  if (filters.propertyId) where.propertyId = filters.propertyId;
  if (filters.branchId) where.branchId = filters.branchId;
  if (filters.roomId) where.roomId = filters.roomId;
  if (filters.bookingCode) where.bookingCode = { contains: filters.bookingCode };
  if (filters.checkInFrom || filters.checkInTo) {
    where.checkIn = {};
    if (filters.checkInFrom) where.checkIn.gte = filters.checkInFrom;
    if (filters.checkInTo) where.checkIn.lte = filters.checkInTo;
  }
  if (filters.q) {
    where.OR = [
      { guestName: { contains: filters.q } },
      { guestEmail: { contains: filters.q } },
      { guestPhone: { contains: filters.q } },
      { bookingCode: { contains: filters.q } },
      { roomCode: { contains: filters.q } },
    ];
  }
  return where;
}

function buildScopeWhere(filters) {
  /** @type {import('../../generated/prisma').Prisma.BookingWhereInput} */
  const where = {};
  if (filters.propertyId) where.propertyId = filters.propertyId;
  if (filters.branchId) where.branchId = filters.branchId;
  return where;
}

function isBookingOccupyingOnDate(booking, dateStr, now = new Date()) {
  const day = parseDateOnly(dateStr);
  const checkIn = booking.checkIn instanceof Date ? booking.checkIn : parseDateOnly(booking.checkIn);
  const checkOut = booking.checkOut instanceof Date ? booking.checkOut : parseDateOnly(booking.checkOut);
  if (checkIn > day || checkOut <= day) return false;
  if (booking.status === 'confirmed' || booking.status === 'checked_in') return true;
  if (booking.status === 'pending_payment') {
    return !booking.holdExpiresAt || new Date(booking.holdExpiresAt) > now;
  }
  return false;
}

async function loadOccupancyContext(filters) {
  const branches = await prisma.branch.findMany({
    where: {
      isActive: true,
      ...(filters.propertyId ? { propertyId: filters.propertyId } : {}),
      ...(filters.branchId ? { id: filters.branchId } : {}),
    },
    include: { property: { select: { name: true } } },
    orderBy: [{ propertyId: 'asc' }, { name: 'asc' }],
  });

  const branchIds = branches.map((b) => b.id);
  const roomCountByBranch = new Map();
  if (branchIds.length) {
    const roomCounts = await prisma.inventoryRoom.groupBy({
      by: ['branchId'],
      where: { branchId: { in: branchIds }, isActive: true },
      _count: { id: true },
    });
    for (const row of roomCounts) {
      roomCountByBranch.set(row.branchId, row._count.id);
    }
  }

  const rangeStart = parseDateOnly(filters.from);
  const rangeEnd = parseDateOnly(filters.to);
  const scopeWhere = buildScopeWhere(filters);

  const [occupyingBookings, movementBookings] = await Promise.all([
    prisma.booking.findMany({
      where: {
        ...scopeWhere,
        checkIn: { lte: rangeEnd },
        checkOut: { gt: rangeStart },
        OR: [
          { status: { in: ['confirmed', 'checked_in'] } },
          { status: 'pending_payment' },
        ],
      },
      select: {
        branchId: true,
        roomId: true,
        checkIn: true,
        checkOut: true,
        status: true,
        holdExpiresAt: true,
      },
    }),
    prisma.booking.findMany({
      where: {
        ...scopeWhere,
        OR: [
          { checkIn: { gte: rangeStart, lte: rangeEnd } },
          { checkOut: { gte: rangeStart, lte: rangeEnd } },
        ],
      },
      select: { branchId: true, checkIn: true, checkOut: true, status: true },
    }),
  ]);

  return { branches, roomCountByBranch, occupyingBookings, movementBookings };
}

function countOccupiedRooms(branchId, dateStr, occupyingBookings, now) {
  const roomIds = new Set();
  for (const booking of occupyingBookings) {
    if (booking.branchId !== branchId) continue;
    if (isBookingOccupyingOnDate(booking, dateStr, now)) roomIds.add(booking.roomId);
  }
  return roomIds.size;
}

function countMovements(branchId, dateStr, movementBookings, field) {
  let count = 0;
  for (const booking of movementBookings) {
    if (booking.branchId !== branchId) continue;
    const value = isoDate(booking[field]);
    if (value !== dateStr) continue;
    if (field === 'checkIn') {
      if (['confirmed', 'pending_payment', 'checked_in'].includes(booking.status)) count += 1;
    } else if (['confirmed', 'checked_in', 'completed'].includes(booking.status)) {
      count += 1;
    }
  }
  return count;
}

function isoDate(value) {
  if (!value) return '';
  if (value instanceof Date) return value.toISOString().slice(0, 10);
  return String(value).slice(0, 10);
}

function isoDateTime(value) {
  if (!value) return '';
  return new Date(value).toISOString();
}

function addDataSheet(workbook, sheetName, headers, rows) {
  const sheet = workbook.addWorksheet(sheetName);
  const headerRow = sheet.addRow(headers);
  headerRow.font = { bold: true };
  headerRow.eachCell((cell) => {
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE8EEF7' },
    };
  });
  for (const row of rows) {
    sheet.addRow(row);
  }
  sheet.views = [{ state: 'frozen', ySplit: 1 }];
  sheet.columns.forEach((col) => {
    col.width = Math.min(40, Math.max(12, (col.header || '').length + 2));
  });
  return sheet;
}

async function fetchBookings(filters) {
  const where = buildBookingWhere(filters);
  const count = await prisma.booking.count({ where });
  if (count > MAX_BOOKING_ROWS) {
    throw httpError(`Quá nhiều booking (${count}). Thu hẹp khoảng ngày hoặc bộ lọc.`, 400);
  }
  return prisma.booking.findMany({
    where,
    orderBy: [{ createdAt: 'desc' }],
    include: {
      payment: true,
      checkInRecord: true,
    },
  });
}

function mapBookingRows(bookings) {
  return bookings.map((b) => [
    b.bookingCode,
    b.id,
    isoDateTime(b.createdAt),
    isoDateTime(b.updatedAt),
    b.guestName,
    b.guestPhone,
    b.guestEmail,
    b.userId ?? '',
    b.adults,
    b.children,
    b.specialNote || '',
    b.propertyName,
    b.branchName,
    b.roomCode,
    isoDate(b.checkIn),
    isoDate(b.checkOut),
    b.nights,
    b.pricePerNightVnd,
    b.subtotalVnd,
    b.serviceFeeVnd,
    b.discountVnd,
    b.totalVnd,
    b.promoCode || '',
    b.status,
    b.holdExpiresAt ? isoDateTime(b.holdExpiresAt) : '',
    b.payment?.status || '',
    b.payment?.method || '',
    b.payment?.amountVnd ?? '',
    b.payment?.paidAt ? isoDateTime(b.payment.paidAt) : '',
    b.payment?.providerRef || '',
    b.checkInRecord?.checkedInAt ? isoDateTime(b.checkInRecord.checkedInAt) : '',
    b.checkInRecord?.staffName || '',
  ]);
}

function mapPaymentRows(bookings) {
  return bookings
    .filter((b) => b.payment)
    .map((b) => [
      b.bookingCode,
      b.guestName,
      b.propertyName,
      b.branchName,
      b.payment.method,
      b.payment.status,
      b.payment.amountVnd,
      b.payment.paidAt ? isoDateTime(b.payment.paidAt) : '',
      b.payment.providerRef || '',
      isoDateTime(b.payment.createdAt),
    ]);
}

async function buildSummaryRows(filters, bookings) {
  const { branches, roomCountByBranch, occupyingBookings } = await loadOccupancyContext(filters);

  if (!branches.length) {
    return [['—', '—', 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]];
  }

  const now = new Date();
  const rows = [];
  for (const branch of branches) {
    const branchBookings = bookings.filter((b) => b.branchId === branch.id);
    const totalCreated = branchBookings.length;
    const paidBookings = branchBookings.filter((b) => b.payment?.status === 'paid');
    const revenueVnd = paidBookings.reduce((s, b) => s + (b.payment?.amountVnd || 0), 0);
    const cancelled = branchBookings.filter((b) => b.status === 'cancelled').length;
    const noShow = branchBookings.filter((b) => b.status === 'no_show').length;
    const promoUsed = branchBookings.filter((b) => b.promoCode).length;
    const roomNightsSold = paidBookings.reduce((s, b) => s + b.nights, 0);
    const subtotalSum = paidBookings.reduce((s, b) => s + b.subtotalVnd, 0);
    const nightsSum = paidBookings.reduce((s, b) => s + b.nights, 0);
    const aov = paidBookings.length ? Math.round(revenueVnd / paidBookings.length) : 0;
    const adr = nightsSum ? Math.round(subtotalSum / nightsSum) : 0;
    const cancelRate = totalCreated ? cancelled / totalCreated : 0;

    const roomCount = roomCountByBranch.get(branch.id) || 0;
    const dayCount = daysBetweenInclusive(filters.from, filters.to);
    let occupiedRoomNights = 0;
    for (const dateStr of eachDateInRange(filters.from, filters.to)) {
      occupiedRoomNights += countOccupiedRooms(branch.id, dateStr, occupyingBookings, now);
    }
    const capacity = roomCount * dayCount;
    const avgOccupancy = capacity ? occupiedRoomNights / capacity : 0;

    const paymentsInPeriod = branchBookings.filter((b) => b.payment);
    const paidCount = paymentsInPeriod.filter((b) => b.payment.status === 'paid').length;
    const failedCount = paymentsInPeriod.filter((b) => b.payment.status === 'failed').length;
    const pendingCount = paymentsInPeriod.filter((b) => b.payment.status === 'pending').length;
    const conversionDenom = paidCount + failedCount + pendingCount;
    const paymentConversion = conversionDenom ? paidCount / conversionDenom : 0;

    rows.push([
      branch.property.name,
      branch.name,
      totalCreated,
      paidBookings.length,
      revenueVnd,
      aov,
      adr,
      cancelRate,
      noShow,
      paymentConversion,
      roomNightsSold,
      avgOccupancy,
      promoUsed,
    ]);
  }

  return rows;
}

async function buildOccupancyRows(filters) {
  const { branches, roomCountByBranch, occupyingBookings, movementBookings } =
    await loadOccupancyContext(filters);
  const now = new Date();
  const rows = [];

  for (const dateStr of eachDateInRange(filters.from, filters.to)) {
    for (const branch of branches) {
      const roomsTotal = roomCountByBranch.get(branch.id) || 0;
      const roomsOccupied = countOccupiedRooms(branch.id, dateStr, occupyingBookings, now);
      const occupancyRate = roomsTotal ? roomsOccupied / roomsTotal : 0;
      rows.push([
        dateStr,
        branch.property.name,
        branch.name,
        roomsTotal,
        roomsOccupied,
        occupancyRate,
        countMovements(branch.id, dateStr, movementBookings, 'checkIn'),
        countMovements(branch.id, dateStr, movementBookings, 'checkOut'),
      ]);
    }
  }
  return rows;
}

async function fetchCheckInRows(filters) {
  const scopeWhere = buildScopeWhere(filters);
  const bounds = { gte: filters.createdAtFrom, lte: filters.createdAtTo };

  const checkIns = await prisma.bookingCheckIn.findMany({
    where: {
      checkedInAt: bounds,
      booking: scopeWhere,
    },
    orderBy: [{ checkedInAt: 'desc' }],
  });

  const checkInBookingIds = new Set(checkIns.map((c) => c.bookingId));

  const pendingCheckIn = await prisma.booking.findMany({
    where: {
      ...scopeWhere,
      status: 'confirmed',
      checkIn: {
        gte: parseDateOnly(filters.from),
        lte: parseDateOnly(filters.to),
      },
      id: { notIn: [...checkInBookingIds] },
    },
    orderBy: [{ checkIn: 'asc' }],
  });

  const rows = checkIns.map((c) => [
    c.bookingCode,
    c.guestName,
    c.guestPhone,
    c.guestEmail,
    c.propertyName,
    c.branchName,
    c.roomCode,
    isoDateTime(c.checkedInAt),
    c.staffName || '',
    c.checkedInByAdminId ?? '',
    c.signaturePath,
    'Đã check-in',
  ]);

  for (const b of pendingCheckIn) {
    rows.push([
      b.bookingCode,
      b.guestName,
      b.guestPhone,
      b.guestEmail,
      b.propertyName,
      b.branchName,
      b.roomCode,
      '',
      '',
      '',
      '',
      'Chưa check-in',
    ]);
  }
  return rows;
}

async function fetchGuestRows(filters, bookings) {
  const userIds = [...new Set(bookings.map((b) => b.userId).filter(Boolean))];
  if (!userIds.length) return [];

  const users = await prisma.user.findMany({
    where: { id: { in: userIds } },
    orderBy: [{ createdAt: 'desc' }],
  });

  return users.map((u) => {
    const userBookings = bookings.filter((b) => b.userId === u.id);
    const paidBookings = userBookings.filter((b) => b.payment?.status === 'paid');
    const totalSpent = paidBookings.reduce((s, b) => s + (b.payment?.amountVnd || 0), 0);
    const nightsSum = paidBookings.reduce((s, b) => s + b.nights, 0);
    const avgNights = paidBookings.length ? nightsSum / paidBookings.length : 0;
    const lastBooking = userBookings[0];
    const favMap = new Map();
    for (const b of userBookings) {
      favMap.set(b.propertyName, (favMap.get(b.propertyName) || 0) + 1);
    }
    let favoriteProperty = '';
    let maxCount = 0;
    for (const [name, count] of favMap) {
      if (count > maxCount) {
        maxCount = count;
        favoriteProperty = name;
      }
    }

    return [
      u.id,
      u.email,
      u.fullName,
      u.phone || '',
      u.membershipTier,
      u.authProvider,
      u.emailVerified ? 1 : 0,
      u.isActive ? 1 : 0,
      u.bookingBanned ? 1 : 0,
      u.bookingBanReason || '',
      isoDateTime(u.createdAt),
      userBookings.length,
      paidBookings.length,
      totalSpent,
      lastBooking ? isoDateTime(lastBooking.createdAt) : '',
      avgNights,
      favoriteProperty,
    ];
  });
}

async function fetchPromoRows(filters, bookings) {
  const promos = await prisma.promoCode.findMany({ orderBy: [{ code: 'asc' }] });
  const usageByCode = new Map();

  for (const b of bookings) {
    if (!b.promoCode || b.payment?.status !== 'paid') continue;
    const prev = usageByCode.get(b.promoCode) || { count: 0, discountVnd: 0, revenueVnd: 0 };
    prev.count += 1;
    prev.discountVnd += b.discountVnd;
    prev.revenueVnd += b.totalVnd;
    usageByCode.set(b.promoCode, prev);
  }

  return promos.map((p) => {
    const usage = usageByCode.get(p.code) || { count: 0, discountVnd: 0, revenueVnd: 0 };
    return [
      p.code,
      p.discountType,
      p.discountPercent ?? '',
      p.discountAmountVnd ?? '',
      p.minSubtotalVnd,
      isoDate(p.validFrom),
      isoDate(p.validTo),
      p.maxUses ?? '',
      p.usedCount,
      p.isActive ? 1 : 0,
      usage.count,
      usage.discountVnd,
      usage.revenueVnd,
    ];
  });
}

async function fetchContactRows(filters) {
  const messages = await prisma.contactMessage.findMany({
    where: {
      createdAt: { gte: filters.createdAtFrom, lte: filters.createdAtTo },
    },
    orderBy: [{ createdAt: 'desc' }],
  });

  return messages.map((m) => [
    m.fullName,
    m.email,
    m.phone || '',
    m.message,
    m.status,
    m.adminNote || '',
    m.readAt ? isoDateTime(m.readAt) : '',
    isoDateTime(m.createdAt),
  ]);
}

function addGuideSheet(workbook, filters, selectedSheets) {
  const guide = workbook.addWorksheet('Huong_dan');
  guide.addRow(['Sheet', 'Mô tả']);
  for (const sheet of EXPORT_SHEETS) {
    if (!selectedSheets.has(sheet.id)) continue;
    guide.addRow([sheet.label, sheet.description]);
  }
  guide.addRow([]);
  guide.addRow(['Khoảng ngày', `${filters.from} → ${filters.to}`]);
  guide.addRow(['Timezone', VN_TZ]);
}

async function buildAnalyticsWorkbook(query, admin) {
  const filters = parseExportParams(query, admin);
  const selectedSheets = parseSelectedSheets(query);

  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'Cherry House';
  workbook.created = new Date();

  const needsBookings = [...selectedSheets].some((id) => SHEETS_NEEDING_BOOKINGS.has(id));
  const bookings = needsBookings ? await fetchBookings(filters) : [];

  if (selectedSheets.has('tong_quan')) {
  addDataSheet(workbook, 'Tong_quan', [
    'Cơ sở',
    'Chi nhánh',
    'Booking tạo mới',
    'Booking đã thanh toán',
    'Doanh thu (VND)',
    'AOV (VND)',
    'ADR (VND)',
    'Tỷ lệ hủy',
    'No-show',
    'Tỷ lệ thanh toán thành công',
    'Đêm phòng bán',
    'Công suất TB',
    'Promo được dùng',
  ], await buildSummaryRows(filters, bookings));
  }

  if (selectedSheets.has('bookings')) {
  addDataSheet(workbook, 'Bookings', [
    'Mã booking',
    'ID',
    'Ngày tạo',
    'Cập nhật',
    'Tên khách',
    'SĐT',
    'Email',
    'User ID',
    'Người lớn',
    'Trẻ em',
    'Ghi chú',
    'Cơ sở',
    'Chi nhánh',
    'Mã phòng',
    'Check-in',
    'Check-out',
    'Số đêm',
    'Giá/đêm (VND)',
    'Tạm tính (VND)',
    'Phí dịch vụ (VND)',
    'Giảm giá (VND)',
    'Tổng (VND)',
    'Mã promo',
    'Trạng thái',
    'Hold hết hạn',
    'TT thanh toán',
    'Phương thức',
    'Số tiền TT (VND)',
    'Ngày thanh toán',
    'Mã giao dịch',
    'Thời điểm check-in',
    'Nhân viên check-in',
  ], mapBookingRows(bookings));
  }

  if (selectedSheets.has('thanh_toan')) {
  addDataSheet(workbook, 'Thanh_toan', [
    'Mã booking',
    'Tên khách',
    'Cơ sở',
    'Chi nhánh',
    'Phương thức',
    'Trạng thái',
    'Số tiền (VND)',
    'Ngày thanh toán',
    'Mã giao dịch',
    'Ngày tạo',
  ], mapPaymentRows(bookings));
  }

  if (selectedSheets.has('cong_suat')) {
  addDataSheet(workbook, 'Cong_suat', [
    'Ngày',
    'Cơ sở',
    'Chi nhánh',
    'Tổng phòng',
    'Phòng occupied',
    'Tỷ lệ công suất',
    'Check-in',
    'Check-out',
  ], await buildOccupancyRows(filters));
  }

  if (selectedSheets.has('check_in')) {
  addDataSheet(workbook, 'Check_in', [
    'Mã booking',
    'Tên khách',
    'SĐT',
    'Email',
    'Cơ sở',
    'Chi nhánh',
    'Mã phòng',
    'Thời điểm check-in',
    'Nhân viên',
    'Admin ID',
    'Đường dẫn chữ ký',
    'Ghi chú',
  ], await fetchCheckInRows(filters));
  }

  if (selectedSheets.has('khach_hang')) {
  addDataSheet(workbook, 'Khach_hang', [
    'ID',
    'Email',
    'Họ tên',
    'SĐT',
    'Hạng',
    'Đăng nhập',
    'Email xác thực',
    'Đang hoạt động',
    'Bị cấm đặt',
    'Lý do cấm',
    'Ngày đăng ký',
    'Tổng booking (kỳ)',
    'Booking paid (kỳ)',
    'Tổng chi (VND)',
    'Booking gần nhất',
    'TB đêm/booking',
    'Cơ sở ưa thích',
  ], await fetchGuestRows(filters, bookings));
  }

  if (selectedSheets.has('ma_khuyen_mai')) {
  addDataSheet(workbook, 'Ma_khuyen_mai', [
    'Mã',
    'Loại giảm',
    '% giảm',
    'Giảm cố định (VND)',
    'Đơn tối thiểu (VND)',
    'Từ ngày',
    'Đến ngày',
    'Giới hạn lượt',
    'Đã dùng (all-time)',
    'Đang bật',
    'Lượt dùng (kỳ)',
    'Tổng giảm (kỳ)',
    'Doanh thu sau giảm (kỳ)',
  ], await fetchPromoRows(filters, bookings));
  }

  if (selectedSheets.has('lien_he')) {
  addDataSheet(workbook, 'Lien_he', [
    'Họ tên',
    'Email',
    'SĐT',
    'Nội dung',
    'Trạng thái',
    'Ghi chú admin',
    'Đã đọc lúc',
    'Ngày gửi',
  ], await fetchContactRows(filters));
  }

  addGuideSheet(workbook, filters, selectedSheets);

  return { workbook, filters, selectedSheets };
}

async function exportAnalyticsBuffer(query, admin) {
  const { workbook, filters } = await buildAnalyticsWorkbook(query, admin);
  const buffer = await workbook.xlsx.writeBuffer();
  const filename = `cherry-analytics_${filters.from}_${filters.to}.xlsx`;
  return { buffer, filename };
}

module.exports = {
  EXPORT_SHEETS,
  parseExportParams,
  parseSelectedSheets,
  buildAnalyticsWorkbook,
  exportAnalyticsBuffer,
  defaultDateRange,
};
