/**
 * Smoke test refund policy + wallet ledger — node scripts/test-refund-policy.js
 */
require('dotenv').config({ path: require('../src/config/myPath.config').ENV_PATH });

const prisma = require('../src/config/prisma.config');
const {
  evaluateRefundPolicy,
  hoursBeforeCheckIn,
  getCheckInDeadline,
} = require('../src/modules/refund/refundPolicy.service');

function assert(cond, msg) {
  if (!cond) throw new Error(msg);
}

function runPolicyUnitTests() {
  const booking = {
    checkIn: new Date('2026-07-15'),
    totalVnd: 1_500_000,
    userId: 1,
  };

  const paid = { status: 'paid' };
  const pending = { status: 'pending' };

  const deadline = getCheckInDeadline(booking);
  assert(deadline.toISOString().includes('T07:00:00.000Z'), 'check-in deadline should be 14:00 +07');

  const far = evaluateRefundPolicy(
    booking,
    paid,
    new Date('2026-07-13T06:00:00+07:00'),
  );
  assert(far.policyCode === 'before_24h_full', '48h+ should be full refund');
  assert(far.percent === 100 && far.amountVnd === 1_500_000, 'full amount');
  assert(far.canRefundToWallet === true, 'logged-in user gets wallet');

  const near = evaluateRefundPolicy(
    booking,
    paid,
    new Date('2026-07-14T20:00:00+07:00'),
  );
  assert(near.policyCode === 'within_24h_none', '<24h should be no refund');
  assert(near.amountVnd === 0, 'zero refund');

  const unpaid = evaluateRefundPolicy(booking, pending, new Date('2026-07-10T10:00:00+07:00'));
  assert(unpaid.policyCode === 'not_paid', 'unpaid booking');

  const guestBooking = { ...booking, userId: null };
  const guestFar = evaluateRefundPolicy(guestBooking, paid, new Date('2026-07-13T06:00:00+07:00'));
  assert(guestFar.canRefundToWallet === false, 'guest without account');

  const hours = hoursBeforeCheckIn(booking, new Date('2026-07-15T10:00:00+07:00'));
  assert(hours > 0 && hours < 24, 'hours helper in 24h window');

  console.log('Policy unit tests: OK');
}

async function runSeedIntegrationChecks() {
  const guest = await prisma.user.findUnique({ where: { email: 'guest@cherryhouse.vn' } });
  assert(guest, 'guest user from seed');

  const wallet = await prisma.userWallet.findUnique({ where: { userId: guest.id } });
  assert(wallet && wallet.balanceVnd > 0, 'guest wallet has balance');

  const cancellable = await prisma.booking.findFirst({
    where: {
      userId: guest.id,
      status: 'confirmed',
      checkIn: { gt: new Date() },
    },
    include: { payment: true },
    orderBy: { checkIn: 'asc' },
  });
  assert(cancellable?.payment?.status === 'paid', 'cancellable paid booking for guest');

  const preview = evaluateRefundPolicy(cancellable, cancellable.payment);
  assert(
    preview.policyCode === 'before_24h_full' || preview.policyCode === 'within_24h_none',
    'preview policy valid',
  );

  const refunded = await prisma.booking.findFirst({
    where: { bookingCode: 'CH-SEED-006', status: 'cancelled' },
    include: { payment: true, refund: true },
  });
  if (refunded) {
    assert(refunded.payment?.status === 'refunded', 'seed cancelled booking payment refunded');
    assert(refunded.refund?.status === 'completed', 'seed booking refund record');
  }

  const txCount = await prisma.walletTransaction.count({ where: { userId: guest.id } });
  assert(txCount >= 1, 'wallet ledger entries');

  console.log('Seed integration checks: OK');
  console.log('Guest wallet balance:', wallet.balanceVnd.toLocaleString('vi-VN'), 'đ');
  if (cancellable) {
    console.log('Cancellable booking:', cancellable.bookingCode, '→', preview.policyCode);
  }
}

async function main() {
  runPolicyUnitTests();
  await runSeedIntegrationChecks();
  console.log('All refund/wallet tests passed.');
}

main()
  .catch((err) => {
    console.error('FAILED:', err.message || err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
