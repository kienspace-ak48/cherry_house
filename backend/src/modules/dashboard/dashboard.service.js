const prisma = require('../../config/prisma.config');

const VN_TZ = 'Asia/Ho_Chi_Minh';
const PENDING_STALE_HOURS = 2;

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

/** Khoảng 00:00–23:59:59.999 theo giờ VN cho trường DateTime */
function vnDayBounds(dateStr) {
  const start = new Date(`${dateStr}T00:00:00+07:00`);
  const end = new Date(`${dateStr}T23:59:59.999+07:00`);
  return { start, end };
}

function formatBookingBrief(booking) {
  return {
    id: booking.id,
    bookingCode: booking.bookingCode,
    guestName: booking.guestName,
    guestPhone: booking.guestPhone,
    propertyName: booking.propertyName,
    branchName: booking.branchName,
    roomCode: booking.roomCode,
    checkIn: booking.checkIn.toISOString().slice(0, 10),
    checkOut: booking.checkOut.toISOString().slice(0, 10),
    status: booking.status,
    totalVnd: booking.totalVnd,
    holdExpiresAt: booking.holdExpiresAt ? booking.holdExpiresAt.toISOString() : null,
    createdAt: booking.createdAt.toISOString(),
    paymentStatus: booking.payment?.status ?? null,
  };
}

function occupyingWhereForDate(dateStr) {
  const day = parseDateOnly(dateStr);
  const now = new Date();
  return {
    checkIn: { lte: day },
    checkOut: { gt: day },
    OR: [
      { status: 'confirmed' },
      {
        status: 'pending_payment',
        OR: [{ holdExpiresAt: null }, { holdExpiresAt: { gt: now } }],
      },
    ],
  };
}

async function countOccupiedRoomsOn(dateStr) {
  const rows = await prisma.booking.findMany({
    where: occupyingWhereForDate(dateStr),
    select: { roomId: true },
    distinct: ['roomId'],
  });
  return rows.length;
}

function bucketKeyForPeriod(date, period) {
  const d = new Date(date.toLocaleString('en-US', { timeZone: VN_TZ }));
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');

  if (period === 'month') return `${y}-${m}`;
  if (period === 'week') {
    const tmp = new Date(d);
    const dow = (tmp.getDay() + 6) % 7;
    tmp.setDate(tmp.getDate() - dow);
    return vnDateOnly(tmp);
  }
  return `${y}-${m}-${day}`;
}

function buildChartBuckets(period) {
  const buckets = [];
  const end = vnNow();

  if (period === 'day') {
    for (let i = 6; i >= 0; i -= 1) {
      const d = new Date(end);
      d.setDate(d.getDate() - i);
      const key = vnDateOnly(d);
      buckets.push({
        key,
        label: new Intl.DateTimeFormat('vi-VN', { weekday: 'short', day: 'numeric', month: 'short' }).format(d),
      });
    }
    return buckets;
  }

  if (period === 'week') {
    for (let i = 7; i >= 0; i -= 1) {
      const d = new Date(end);
      d.setDate(d.getDate() - i * 7);
      const dow = (d.getDay() + 6) % 7;
      d.setDate(d.getDate() - dow);
      const key = vnDateOnly(d);
      const weekEnd = new Date(d);
      weekEnd.setDate(weekEnd.getDate() + 6);
      buckets.push({
        key,
        label: `${new Intl.DateTimeFormat('vi-VN', { day: 'numeric', month: 'short' }).format(d)} – ${new Intl.DateTimeFormat('vi-VN', { day: 'numeric', month: 'short' }).format(weekEnd)}`,
      });
    }
    return buckets;
  }

  for (let i = 11; i >= 0; i -= 1) {
    const d = new Date(end.getFullYear(), end.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    buckets.push({
      key,
      label: new Intl.DateTimeFormat('vi-VN', { month: 'short', year: 'numeric' }).format(d),
    });
  }
  return buckets;
}

function chartRangeStart(period) {
  const end = vnNow();
  if (period === 'day') {
    const d = new Date(end);
    d.setDate(d.getDate() - 6);
    return vnDayBounds(vnDateOnly(d)).start;
  }
  if (period === 'week') {
    const d = new Date(end);
    d.setDate(d.getDate() - 7 * 7);
    return vnDayBounds(vnDateOnly(d)).start;
  }
  const d = new Date(end.getFullYear(), end.getMonth() - 11, 1);
  return new Date(`${vnDateOnly(d)}T00:00:00+07:00`);
}

async function buildBookingChart(period) {
  const buckets = buildChartBuckets(period);
  const bookingCounts = Object.fromEntries(buckets.map((b) => [b.key, 0]));
  const revenueCounts = Object.fromEntries(buckets.map((b) => [b.key, 0]));
  const rangeStart = chartRangeStart(period);

  const [bookings, payments] = await Promise.all([
    prisma.booking.findMany({
      where: { createdAt: { gte: rangeStart } },
      select: { createdAt: true },
    }),
    prisma.payment.findMany({
      where: { status: 'paid', paidAt: { gte: rangeStart } },
      select: { paidAt: true, amountVnd: true },
    }),
  ]);

  for (const b of bookings) {
    const key = bucketKeyForPeriod(b.createdAt, period);
    if (key in bookingCounts) bookingCounts[key] += 1;
  }

  for (const p of payments) {
    if (!p.paidAt) continue;
    const key = bucketKeyForPeriod(p.paidAt, period);
    if (key in revenueCounts) revenueCounts[key] += p.amountVnd;
  }

  return {
    period,
    labels: buckets.map((b) => b.label),
    bookings: buckets.map((b) => bookingCounts[b.key]),
    revenueVnd: buckets.map((b) => revenueCounts[b.key]),
  };
}

const BOOKING_STATUS_LABELS = {
  confirmed: 'Đã xác nhận',
  pending_payment: 'Chờ thanh toán',
  completed: 'Hoàn tất',
  checked_in: 'Đang lưu trú',
  cancelled: 'Đã hủy',
  no_show: 'Không đến',
  draft: 'Nháp',
};

const PAYMENT_METHOD_LABELS = {
  card: 'Thẻ / VNPay',
  momo: 'MoMo',
  bank: 'Chuyển khoản',
  wallet: 'Ví QR',
  cherry_wallet: 'Ví Cherry House',
};

async function buildBookingStatusChart(rangeStart) {
  const rows = await prisma.booking.groupBy({
    by: ['status'],
    where: { createdAt: { gte: rangeStart } },
    _count: { _all: true },
  });

  const order = [
    'confirmed',
    'pending_payment',
    'completed',
    'checked_in',
    'cancelled',
    'no_show',
    'draft',
  ];
  const byStatus = Object.fromEntries(rows.map((r) => [r.status, r._count._all]));

  const sorted = order
    .filter((s) => byStatus[s])
    .concat(rows.map((r) => r.status).filter((s) => !order.includes(s)));

  return {
    labels: sorted.map((s) => BOOKING_STATUS_LABELS[s] || s),
    values: sorted.map((s) => byStatus[s] || 0),
    statuses: sorted,
  };
}

async function buildPaymentMethodChart(rangeStart) {
  const payments = await prisma.payment.findMany({
    where: { status: 'paid', paidAt: { gte: rangeStart } },
    select: { method: true, amountVnd: true },
  });

  const totals = {};
  for (const p of payments) {
    totals[p.method] = (totals[p.method] || 0) + p.amountVnd;
  }

  const methods = Object.keys(totals).sort((a, b) => totals[b] - totals[a]);
  return {
    labels: methods.map((m) => PAYMENT_METHOD_LABELS[m] || m),
    revenueVnd: methods.map((m) => totals[m]),
    methods,
  };
}

async function buildOccupancyTrendChart(days = 14) {
  const totalRooms = await prisma.inventoryRoom.count({ where: { isActive: true } });
  const end = vnNow();
  const labels = [];
  const rates = [];

  for (let i = days - 1; i >= 0; i -= 1) {
    const d = new Date(end);
    d.setDate(d.getDate() - i);
    const dateStr = vnDateOnly(d);
    const occupied = await countOccupiedRoomsOn(dateStr);
    labels.push(
      new Intl.DateTimeFormat('vi-VN', { weekday: 'short', day: 'numeric', month: 'short' }).format(d),
    );
    rates.push(totalRooms ? Math.round((occupied / totalRooms) * 1000) / 10 : 0);
  }

  return { labels, rates, roomsTotal: totalRooms };
}

async function buildPropertyRevenueChart(rangeStart, limit = 6) {
  const bookings = await prisma.booking.findMany({
    where: {
      payment: { status: 'paid', paidAt: { gte: rangeStart } },
    },
    select: {
      propertyName: true,
      payment: { select: { amountVnd: true } },
    },
  });

  const totals = {};
  for (const b of bookings) {
    const name = b.propertyName || 'Khác';
    totals[name] = (totals[name] || 0) + (b.payment?.amountVnd || 0);
  }

  const sorted = Object.entries(totals)
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit);

  return {
    labels: sorted.map(([name]) => name),
    revenueVnd: sorted.map(([, v]) => v),
  };
}

async function buildWebsiteActivityChart() {
  const buckets = buildChartBuckets('week').slice(-8);
  const rangeStart = chartRangeStart('week');
  const contactCounts = Object.fromEntries(buckets.map((b) => [b.key, 0]));
  const userCounts = Object.fromEntries(buckets.map((b) => [b.key, 0]));

  const [contacts, users] = await Promise.all([
    prisma.contactMessage.findMany({
      where: { createdAt: { gte: rangeStart } },
      select: { createdAt: true },
    }),
    prisma.user.findMany({
      where: { createdAt: { gte: rangeStart } },
      select: { createdAt: true },
    }),
  ]);

  for (const c of contacts) {
    const key = bucketKeyForPeriod(c.createdAt, 'week');
    if (key in contactCounts) contactCounts[key] += 1;
  }
  for (const u of users) {
    const key = bucketKeyForPeriod(u.createdAt, 'week');
    if (key in userCounts) userCounts[key] += 1;
  }

  return {
    labels: buckets.map((b) => b.label),
    contactMessages: buckets.map((b) => contactCounts[b.key]),
    newUsers: buckets.map((b) => userCounts[b.key]),
  };
}

async function buildAnalyticsCharts(period) {
  const rangeStart = chartRangeStart(period);
  const [bookingStatus, paymentMethods, occupancyTrend, propertyRevenue, websiteActivity] =
    await Promise.all([
      buildBookingStatusChart(rangeStart),
      buildPaymentMethodChart(rangeStart),
      buildOccupancyTrendChart(14),
      buildPropertyRevenueChart(rangeStart),
      buildWebsiteActivityChart(),
    ]);

  return {
    period,
    bookingStatus,
    paymentMethods,
    occupancyTrend,
    propertyRevenue,
    websiteActivity,
  };
}

async function getDashboardOverview(chartPeriod = 'week') {
  const today = vnDateOnly();
  const todayBounds = vnDayBounds(today);
  const todayDate = parseDateOnly(today);
  const now = new Date();
  const staleBefore = new Date(now.getTime() - PENDING_STALE_HOURS * 60 * 60 * 1000);

  const period = ['day', 'week', 'month'].includes(chartPeriod) ? chartPeriod : 'week';

  const [
    catalog,
    bookingsToday,
    revenueTodayAgg,
    totalActiveRooms,
    occupiedToday,
    checkInsToday,
    checkOutsToday,
    overdueStays,
    stalePending,
    expiredHolds,
    chart,
    analytics,
  ] = await Promise.all([
    Promise.all([
      prisma.property.count({ where: { isActive: true } }),
      prisma.branch.count({ where: { isActive: true } }),
      prisma.inventoryRoom.count({ where: { isActive: true } }),
      prisma.booking.count(),
    ]),
    prisma.booking.count({
      where: { createdAt: { gte: todayBounds.start, lte: todayBounds.end } },
    }),
    prisma.payment.aggregate({
      where: {
        status: 'paid',
        paidAt: { gte: todayBounds.start, lte: todayBounds.end },
      },
      _sum: { amountVnd: true },
    }),
    prisma.inventoryRoom.count({ where: { isActive: true } }),
    countOccupiedRoomsOn(today),
    prisma.booking.findMany({
      where: {
        checkIn: todayDate,
        status: { in: ['confirmed', 'pending_payment'] },
      },
      include: { payment: { select: { status: true } } },
      orderBy: [{ propertyName: 'asc' }, { roomCode: 'asc' }],
    }),
    prisma.booking.findMany({
      where: {
        checkOut: todayDate,
        status: { in: ['confirmed', 'pending_payment'] },
      },
      include: { payment: { select: { status: true } } },
      orderBy: [{ propertyName: 'asc' }, { roomCode: 'asc' }],
    }),
    prisma.booking.findMany({
      where: {
        status: 'confirmed',
        checkOut: { lt: todayDate },
      },
      include: { payment: { select: { status: true } } },
      orderBy: { checkOut: 'asc' },
      take: 20,
    }),
    prisma.booking.findMany({
      where: {
        status: 'pending_payment',
        createdAt: { lt: staleBefore },
        OR: [{ holdExpiresAt: null }, { holdExpiresAt: { gt: now } }],
      },
      include: { payment: { select: { status: true } } },
      orderBy: { createdAt: 'asc' },
      take: 20,
    }),
    prisma.booking.findMany({
      where: {
        status: 'pending_payment',
        holdExpiresAt: { lt: now },
      },
      include: { payment: { select: { status: true } } },
      orderBy: { holdExpiresAt: 'desc' },
      take: 20,
    }),
    buildBookingChart(period),
    buildAnalyticsCharts(period),
  ]);

  const [propertiesCount, branchesCount, roomsCount, bookingsTotal] = catalog;
  const revenueToday = revenueTodayAgg._sum.amountVnd ?? 0;
  const availableToday = Math.max(0, totalActiveRooms - occupiedToday);

  const alerts = [];

  for (const b of overdueStays) {
    alerts.push({
      type: 'overdue_stay',
      severity: 'danger',
      title: 'Lưu trú quá hạn',
      message: `${b.roomCode} — checkout ${b.checkOut.toISOString().slice(0, 10)}, vẫn confirmed`,
      booking: formatBookingBrief(b),
    });
  }

  for (const b of expiredHolds) {
    alerts.push({
      type: 'expired_hold',
      severity: 'warning',
      title: 'Giữ chỗ hết hạn',
      message: `${b.bookingCode} — chưa thanh toán, hold đã hết`,
      booking: formatBookingBrief(b),
    });
  }

  for (const b of stalePending) {
    if (expiredHolds.some((x) => x.id === b.id)) continue;
    alerts.push({
      type: 'pending_stale',
      severity: 'warning',
      title: 'Chờ xác nhận lâu',
      message: `${b.bookingCode} — pending > ${PENDING_STALE_HOURS}h`,
      booking: formatBookingBrief(b),
    });
  }

  const recentProperties = await prisma.property.findMany({
    where: { isActive: true },
    orderBy: { createdAt: 'desc' },
    take: 5,
    select: {
      name: true,
      slug: true,
      city: true,
      kind: true,
      priceFromVnd: true,
      isActive: true,
    },
  });

  return {
    asOf: now.toISOString(),
    today,
    catalog: {
      properties: propertiesCount,
      branches: branchesCount,
      rooms: roomsCount,
      bookingsTotal,
    },
    todayStats: {
      bookingsCreated: bookingsToday,
      revenueVnd: revenueToday,
      roomsTotal: totalActiveRooms,
      roomsOccupied: occupiedToday,
      roomsAvailable: availableToday,
    },
    chart,
    analytics,
    movements: {
      checkInsToday: checkInsToday.map(formatBookingBrief),
      checkOutsToday: checkOutsToday.map(formatBookingBrief),
    },
    alerts,
    recentProperties,
  };
}

module.exports = {
  getDashboardOverview,
};
