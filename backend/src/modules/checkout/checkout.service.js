const prisma = require('../../config/prisma.config');
const { httpError } = require('../../utils/http');
const { mapPrismaError } = require('../../utils/crud');
const { resolveRoomRef } = require('../booking/roomResolver.service');
const { checkAvailability, parseDateOnly, nightsBetween } = require('../booking/bookingAvailability.service');
const { DEFAULT_HOLD_MINUTES } = require('../booking/booking.constants');
const vnpayPayService = require('../../services/vnpayPay.service');
const momoPayService = require('../../services/momoPay.service');
// const sepayPgService = require('../../services/sepayPg.service'); // SePay tạm tắt
const bookingRepository = require('../booking/booking.repository');
const { assertUserCanBook } = require('../../services/userBookingGuard.service');
const { sendBookingConfirmationEmail } = require('../../services/bookingEmail.service');
const { generateBookingQrDataUrl } = require('../../utils/bookingQr.util');
const clientAuthService = require('../../auth/clientAuth.service');
const { calculateBookingPricing } = require('../../utils/pricing.util');

/** Tạm tắt SePay — bỏ `bank` khỏi set cho đến khi bật lại */
const PAYMENT_METHODS = new Set(['card', 'momo', 'wallet']);

function generateBookingCode() {
  const suffix = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `CH-${Date.now().toString(36).toUpperCase()}-${suffix}`;
}

function parsePaymentMethod(raw) {
  const method = typeof raw === 'string' ? raw.trim() : '';
  if (!PAYMENT_METHODS.has(method)) {
    throw httpError('paymentMethod must be card, momo or wallet');
  }
  return method;
}

function parseGuests(raw) {
  const key = typeof raw === 'string' ? raw.trim() : '';
  const match = /^(\d+)-adults?-(\d+)-children?$/i.exec(key);
  if (match) {
    return { adults: Number(match[1]), children: Number(match[2]) };
  }
  return { adults: 2, children: 0 };
}

function normalizeOrderInfo(text) {
  return String(text)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 255);
}


async function createBookingWithPayment({
  room,
  body,
  userId,
  pricing,
  paymentMethod,
}) {
  const checkIn = parseDateOnly(body.checkIn, 'checkIn');
  const checkOut = parseDateOnly(body.checkOut, 'checkOut');
  const nights = nightsBetween(checkIn, checkOut);
  const guests = parseGuests(body.guests);

  const bookingCode = generateBookingCode();
  const property = room.branch.property;

  const bookingData = {
    bookingCode,
    userId: userId ?? null,
    roomId: room.id,
    propertyId: property.id,
    branchId: room.branchId,
    roomTypeId: room.roomTypeId,
    roomCode: room.code,
    propertyName: property.name,
    branchName: room.branch.name,
    checkIn,
    checkOut,
    nights,
    adults: guests.adults,
    children: guests.children,
    guestName: body.guestName.trim(),
    guestPhone: body.guestPhone.trim(),
    guestEmail: body.guestEmail.trim(),
    specialNote: body.specialNote ? String(body.specialNote).trim() || null : null,
    pricePerNightVnd: pricing.pricePerNightVnd,
    subtotalVnd: pricing.subtotalVnd,
    serviceFeeVnd: pricing.serviceFeeVnd,
    discountVnd: pricing.discountVnd,
    totalVnd: pricing.totalVnd,
    promoCode: pricing.promoCode,
    status: 'pending_payment',
    holdExpiresAt: new Date(Date.now() + DEFAULT_HOLD_MINUTES * 60 * 1000),
  };

  try {
    return await prisma.$transaction(async (tx) => {
      const booking = await tx.booking.create({ data: bookingData });
      const payment = await tx.payment.create({
        data: {
          bookingId: booking.id,
          method: paymentMethod,
          amountVnd: pricing.totalVnd,
          status: 'pending',
          providerRef: bookingCode,
        },
      });
      return { booking, payment };
    });
  } catch (error) {
    mapPrismaError(error, 'Could not create booking');
  }
}

async function initiateProviderPayment(req, paymentMethod, booking, pricing) {
  const orderInfo = normalizeOrderInfo(
    `Cherry House dat phong ${booking.bookingCode}`,
  );

  if (paymentMethod === 'card') {
    const vnpay = vnpayPayService.createBookingRedirectPayment(req, {
      bookingCode: booking.bookingCode,
      amountVnd: pricing.totalVnd,
      orderInfo,
    });
    return {
      provider: 'vnpay',
      action: 'redirect',
      redirectUrl: vnpay.paymentUrl,
    };
  }

  if (paymentMethod === 'momo') {
    const momo = await momoPayService.createBookingPayment(req, {
      bookingCode: booking.bookingCode,
      amountVnd: pricing.totalVnd,
      orderInfo,
      guestEmail: booking.guestEmail,
      guestName: booking.guestName,
      guestPhone: booking.guestPhone,
    });
    return {
      provider: 'momo',
      action: 'redirect',
      redirectUrl: momo.payUrl,
    };
  }

  // SePay tạm tắt — bật lại khi cần chuyển khoản QR
  // if (paymentMethod === 'bank') {
  //   const sepay = sepayPgService.createBookingCheckout({
  //     bookingCode: booking.bookingCode,
  //     amountVnd: pricing.totalVnd,
  //     orderDescription: `Thanh toan phong ${booking.bookingCode}`,
  //     paymentMethod: 'BANK_TRANSFER',
  //   });
  //   return {
  //     provider: 'sepay',
  //     action: 'form',
  //     sepay: {
  //       checkoutUrl: sepay.checkoutUrl,
  //       fields: sepay.fields,
  //     },
  //   };
  // }

  const qr = await vnpayPayService.createBookingQrPayment(req, {
    bookingCode: booking.bookingCode,
    amountVnd: pricing.totalVnd,
    orderInfo,
  });
  if (!qr.ok) {
    throw httpError(qr.message || 'Could not create VNPay QR', 502);
  }
  return {
    provider: 'vnpay_qr',
    action: 'qr',
    qr: {
      dataUrl: qr.qrDataUrl,
      expireMinutes: 15,
    },
  };
}

/**
 * Tạo booking + khởi tạo thanh toán cho checkout phòng.
 */
async function startCheckout(req, body = {}) {
  const paymentMethod = parsePaymentMethod(body.paymentMethod);
  const propertySlug = String(body.propertySlug || '').trim();
  const branchCode = String(body.branchCode || '').trim();
  const detailSlug = String(body.detailSlug || '').trim();

  if (!propertySlug || !branchCode || !detailSlug) {
    throw httpError('propertySlug, branchCode and detailSlug are required');
  }
  if (!body.checkIn || !body.checkOut) {
    throw httpError('checkIn and checkOut are required');
  }

  let guestName = typeof body.guestName === 'string' ? body.guestName.trim() : '';
  let guestPhone = typeof body.guestPhone === 'string' ? body.guestPhone.trim() : '';
  let guestEmail = typeof body.guestEmail === 'string' ? body.guestEmail.trim() : '';

  const userId = req.user?.id ? Number(req.user.id) : null;
  if (Number.isInteger(userId) && userId > 0) {
    const account = await clientAuthService.getMe(userId);
    guestEmail = account.email || guestEmail;
    guestName = guestName || account.fullName || '';
    guestPhone = guestPhone || account.phone || '';
  }

  if (!guestName || !guestPhone || !guestEmail) {
    throw httpError('guestName, guestPhone and guestEmail are required');
  }

  const room = await resolveRoomRef({ propertySlug, branchCode, detailSlug });
  if (!room.isActive) throw httpError('Room is not available', 409);

  const availability = await checkAvailability({
    roomId: room.id,
    checkIn: body.checkIn,
    checkOut: body.checkOut,
  });
  if (!availability.available) {
    throw httpError(availability.message || 'Room is not available for selected dates', 409);
  }

  const nights = nightsBetween(
    parseDateOnly(body.checkIn, 'checkIn'),
    parseDateOnly(body.checkOut, 'checkOut'),
  );
  const promoCodeInput =
    typeof body.promoCode === 'string' ? body.promoCode.trim() : '';
  const pricing = await calculateBookingPricing(
    room.priceVnd,
    nights,
    promoCodeInput || null,
  );

  await assertUserCanBook({
    userId: Number.isInteger(userId) ? userId : null,
    guestEmail,
  });

  const { booking, payment } = await createBookingWithPayment({
    room,
    body: { ...body, guestName, guestPhone, guestEmail },
    userId: Number.isInteger(userId) ? userId : null,
    pricing,
    paymentMethod,
  });

  const providerPayload = await initiateProviderPayment(
    req,
    paymentMethod,
    booking,
    pricing,
  );

  return {
    bookingId: booking.id,
    bookingCode: booking.bookingCode,
    paymentId: payment.id,
    paymentMethod,
    amountVnd: pricing.totalVnd,
    nights,
    holdExpiresAt: booking.holdExpiresAt,
    room: {
      id: room.id,
      code: room.code,
      detailSlug: availability.room?.detailSlug,
    },
    pricing,
    ...providerPayload,
  };
}

async function getBookingStatus(bookingCodeRaw) {
  const bookingCode = String(bookingCodeRaw || '').trim();
  if (!bookingCode) throw httpError('bookingCode is required');

  const booking = await prisma.booking.findUnique({
    where: { bookingCode },
    include: {
      payment: true,
      room: { select: { id: true, code: true } },
      property: { select: { slug: true, name: true } },
      branch: { select: { code: true, name: true } },
    },
  });
  if (!booking) throw httpError('Booking not found', 404);

  let qrCodeDataUrl = null;
  if (booking.status === 'confirmed' || booking.payment?.status === 'paid') {
    try {
      qrCodeDataUrl = await generateBookingQrDataUrl(booking.bookingCode);
    } catch (_err) {
      qrCodeDataUrl = null;
    }
  }

  return {
    bookingCode: booking.bookingCode,
    status: booking.status,
    checkIn: booking.checkIn.toISOString().slice(0, 10),
    checkOut: booking.checkOut.toISOString().slice(0, 10),
    nights: booking.nights,
    totalVnd: booking.totalVnd,
    holdExpiresAt: booking.holdExpiresAt,
    guestName: booking.guestName,
    payment: booking.payment
      ? {
          id: booking.payment.id,
          method: booking.payment.method,
          status: booking.payment.status,
          amountVnd: booking.payment.amountVnd,
          paidAt: booking.payment.paidAt,
        }
      : null,
    room: booking.room,
    property: booking.property,
    branch: booking.branch,
    qrCodeDataUrl,
  };
}

async function verifyMomoReturn(query = {}) {
  const result = momoPayService.verifyCallback(query);

  if (result.isVerified && result.isSuccess && result.bookingCode) {
    await markBookingPaid(
      result.bookingCode,
      'momo',
      String(result.transId || result.requestId || ''),
    );
  }

  return result;
}

async function verifyVnpayReturn(query = {}) {
  const result = vnpayPayService.verifyReturn(query);
  const bookingCode = String(result.vnp_TxnRef || '').trim();

  if (result.isVerified && result.isSuccess && bookingCode) {
    await markBookingPaid(bookingCode, 'vnpay', String(result.vnp_TransactionNo || ''));
  }

  return {
    ...result,
    bookingCode,
  };
}

async function markBookingPaid(bookingCode, providerRef, providerDetail = '') {
  const booking = await prisma.booking.findUnique({
    where: { bookingCode },
    include: { payment: true },
  });
  if (!booking) return null;
  if (booking.status === 'confirmed') return booking;

  const ref = [providerRef, providerDetail].filter(Boolean).join(':');

  await prisma.$transaction(async (tx) => {
    await tx.booking.update({
      where: { id: booking.id },
      data: { status: 'confirmed' },
    });
    if (booking.payment) {
      await tx.payment.update({
        where: { id: booking.payment.id },
        data: {
          status: 'paid',
          paidAt: new Date(),
          providerRef: ref || booking.payment.providerRef,
        },
      });
    }
    if (booking.promoCode) {
      const affected = await tx.$executeRaw`
        UPDATE promo_codes
        SET used_count = used_count + 1
        WHERE code = ${booking.promoCode}
          AND (max_uses IS NULL OR used_count < max_uses)
      `;
      if (!affected) {
        console.warn(`[checkout] promo redeem race or exhausted: ${booking.promoCode}`);
      }
    }
  });

  const confirmed = await bookingRepository.findById(booking.id);

  sendBookingConfirmationEmail(confirmed).catch((err) => {
    console.error('[checkout] booking confirmation email failed:', err?.message || err);
  });

  return confirmed;
}

async function handleSepayIpn(payload = {}) {
  if (payload?.notification_type !== 'ORDER_PAID') {
    return { handled: false };
  }
  const bookingCode = payload?.order?.order_invoice_number;
  if (!bookingCode) return { handled: false };

  await markBookingPaid(String(bookingCode), 'sepay');
  return { handled: true, bookingCode };
}

async function handleMomoIpn(payload = {}) {
  const verify = momoPayService.verifyCallback(payload);
  if (!verify.isVerified || !verify.isSuccess) {
    return { verify, handled: false };
  }
  const bookingCode = String(verify.orderId || verify.bookingCode || '').trim();
  if (bookingCode) {
    await markBookingPaid(bookingCode, 'momo', String(verify.transId || verify.requestId || ''));
  }
  return { verify, handled: true, bookingCode };
}

async function handleVnpayIpn(query = {}) {
  const verify = vnpayPayService.verifyIpn(query);
  if (!verify.isVerified || !verify.isSuccess) {
    return { verify, handled: false };
  }
  const bookingCode = String(verify.vnp_TxnRef || '').trim();
  if (bookingCode) {
    await markBookingPaid(bookingCode, 'vnpay', String(verify.vnp_TransactionNo || ''));
  }
  return { verify, handled: true, bookingCode };
}

module.exports = {
  startCheckout,
  getBookingStatus,
  markBookingPaid,
  verifyMomoReturn,
  verifyVnpayReturn,
  handleSepayIpn,
  handleMomoIpn,
  handleVnpayIpn,
};
