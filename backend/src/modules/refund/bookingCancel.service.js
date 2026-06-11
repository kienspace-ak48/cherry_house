const prisma = require('../../config/prisma.config');
const bookingRepository = require('../booking/booking.repository');
const { httpError, parseId } = require('../../utils/http');
const { assertBookingInScope } = require('../../utils/adminScope.util');
const { evaluateRefundPolicy, vnNow, policyLabel } = require('./refundPolicy.service');
const userWalletService = require('../../services/userWallet.service');
const { sendBookingCancellationEmail } = require('../../services/bookingEmail.service');

const CANCELLABLE_STATUSES = new Set(['confirmed', 'pending_payment']);

function assertUserOwnsBooking(user, booking) {
  const userId = Number(user?.id);
  if (!Number.isInteger(userId) || userId < 1) {
    throw httpError('Unauthorized', 401);
  }
  if (Number(booking.userId) !== userId) {
    const email = typeof user?.email === 'string' ? user.email.trim().toLowerCase() : '';
    const guestEmail = typeof booking.guestEmail === 'string'
      ? booking.guestEmail.trim().toLowerCase()
      : '';
    if (!email || email !== guestEmail) {
      throw httpError('Bạn không có quyền hủy booking này', 403);
    }
  }
}

async function loadBookingForCancel(bookingId) {
  const row = await bookingRepository.findById(bookingId);
  if (!row) throw httpError('Booking not found', 404);
  return row;
}

async function getCancelPreview(bookingIdRaw, actor, cancelledBy = 'user') {
  const bookingId = parseId(bookingIdRaw);
  const booking = await loadBookingForCancel(bookingId);

  if (cancelledBy === 'user') {
    assertUserOwnsBooking(actor, booking);
  } else {
    assertBookingInScope(actor, booking);
  }

  if (!CANCELLABLE_STATUSES.has(booking.status)) {
    throw httpError(`Không thể hủy booking ở trạng thái "${booking.status}"`, 409);
  }

  const policy = evaluateRefundPolicy(booking, booking.payment, vnNow());

  return {
    bookingId: booking.id,
    bookingCode: booking.bookingCode,
    status: booking.status,
    checkIn: booking.checkIn,
    totalVnd: booking.totalVnd,
    paymentStatus: booking.payment?.status ?? null,
    cancelledBy,
    policy: {
      ...policy,
      policyLabel: policyLabel(policy.policyCode),
    },
    canCancel: true,
  };
}

async function cancelBooking({ bookingIdRaw, actor, cancelledBy = 'user' }) {
  const bookingId = parseId(bookingIdRaw);
  const preview = await getCancelPreview(bookingId, actor, cancelledBy);
  const booking = await loadBookingForCancel(bookingId);
  const policy = preview.policy;
  const now = vnNow();

  const result = await prisma.$transaction(async (tx) => {
    const fresh = await tx.booking.findUnique({
      where: { id: bookingId },
      include: { payment: true, refund: true },
    });
    if (!fresh) throw httpError('Booking not found', 404);
    if (fresh.status === 'cancelled') throw httpError('Booking đã được hủy', 409);
    if (!CANCELLABLE_STATUSES.has(fresh.status)) {
      throw httpError(`Không thể hủy booking ở trạng thái "${fresh.status}"`, 409);
    }

    await tx.booking.update({
      where: { id: bookingId },
      data: { status: 'cancelled' },
    });

    let walletBalanceVnd = null;
    let refundStatus = 'skipped';
    let refundAmountVnd = 0;

    const livePolicy = evaluateRefundPolicy(fresh, fresh.payment, now);

    if (fresh.payment?.status === 'paid' && livePolicy.amountVnd > 0 && fresh.userId) {
      const { wallet } = await userWalletService.creditInTransaction(tx, {
        userId: fresh.userId,
        amountVnd: livePolicy.amountVnd,
        type: 'refund',
        bookingId: fresh.id,
        note: `Hoàn tiền hủy ${fresh.bookingCode}`,
      });
      walletBalanceVnd = wallet.balanceVnd;
      refundAmountVnd = livePolicy.amountVnd;
      refundStatus = 'completed';

      await tx.payment.update({
        where: { id: fresh.payment.id },
        data: { status: 'refunded' },
      });
    } else if (fresh.payment?.status === 'pending') {
      await tx.payment.update({
        where: { id: fresh.payment.id },
        data: { status: 'failed' },
      });
    }

    await tx.bookingRefund.create({
      data: {
        bookingId: fresh.id,
        userId: fresh.userId,
        refundPercent: livePolicy.percent,
        refundAmountVnd,
        policyCode: livePolicy.policyCode,
        destination: 'wallet',
        status: refundStatus,
        cancelledBy,
        hoursBeforeCheckIn: livePolicy.hoursBeforeCheckIn,
      },
    });

    return {
      bookingId: fresh.id,
      bookingCode: fresh.bookingCode,
      refundAmountVnd,
      refundStatus,
      policyCode: livePolicy.policyCode,
      policyLabel: policyLabel(livePolicy.policyCode),
      walletBalanceVnd,
      message: livePolicy.message,
    };
  });

  const updated = await bookingRepository.findById(bookingId);
  sendBookingCancellationEmail(updated, result).catch((err) => {
    console.error('[bookingCancel] cancellation email failed:', err?.message || err);
  });

  return {
    ...result,
    booking: updated,
    policy,
  };
}

module.exports = {
  getCancelPreview,
  cancelBooking,
  CANCELLABLE_STATUSES,
};
