const prisma = require('../config/prisma.config');
const { httpError, parseId } = require('../utils/http');

const DEFAULT_TX_PAGE_SIZE = 20;

async function getOrCreateWallet(userId) {
  const id = parseId(userId, 'userId');
  let wallet = await prisma.userWallet.findUnique({ where: { userId: id } });
  if (!wallet) {
    wallet = await prisma.userWallet.create({
      data: { userId: id, balanceVnd: 0 },
    });
  }
  return wallet;
}

async function getBalance(userId) {
  const wallet = await getOrCreateWallet(userId);
  return wallet.balanceVnd;
}

async function getWalletSummary(userId, recentLimit = 10) {
  const id = parseId(userId, 'userId');
  const wallet = await getOrCreateWallet(id);
  const recent = await prisma.walletTransaction.findMany({
    where: { userId: id },
    orderBy: [{ createdAt: 'desc' }],
    take: recentLimit,
    include: {
      booking: { select: { bookingCode: true, propertyName: true } },
    },
  });
  return {
    balanceVnd: wallet.balanceVnd,
    updatedAt: wallet.updatedAt,
    recentTransactions: recent.map(formatTransaction),
  };
}

function formatTransaction(row) {
  return {
    id: row.id,
    amountVnd: row.amountVnd,
    balanceAfterVnd: row.balanceAfterVnd,
    type: row.type,
    bookingId: row.bookingId,
    bookingCode: row.booking?.bookingCode ?? null,
    propertyName: row.booking?.propertyName ?? null,
    note: row.note,
    createdAt: row.createdAt,
  };
}

async function listTransactions(userId, query = {}) {
  const id = parseId(userId, 'userId');
  const page = Math.max(1, Number(query.page) || 1);
  const pageSize = Math.min(50, Math.max(1, Number(query.pageSize) || DEFAULT_TX_PAGE_SIZE));
  const skip = (page - 1) * pageSize;

  const [items, total] = await Promise.all([
    prisma.walletTransaction.findMany({
      where: { userId: id },
      orderBy: [{ createdAt: 'desc' }],
      skip,
      take: pageSize,
      include: {
        booking: { select: { bookingCode: true, propertyName: true } },
      },
    }),
    prisma.walletTransaction.count({ where: { userId: id } }),
  ]);

  return {
    items: items.map(formatTransaction),
    total,
    page,
    pageSize,
    totalPages: Math.max(1, Math.ceil(total / pageSize)),
  };
}

/**
 * Credit wallet inside an existing Prisma transaction.
 * @param {import('../generated/prisma').Prisma.TransactionClient} tx
 */
async function creditInTransaction(tx, { userId, amountVnd, type, bookingId, note }) {
  const id = parseId(userId, 'userId');
  const amount = Math.round(amountVnd);
  if (!Number.isInteger(amount) || amount <= 0) {
    throw httpError('amountVnd must be a positive integer', 400);
  }

  let wallet = await tx.userWallet.findUnique({ where: { userId: id } });
  if (!wallet) {
    wallet = await tx.userWallet.create({ data: { userId: id, balanceVnd: 0 } });
  }

  const balanceAfterVnd = wallet.balanceVnd + amount;
  await tx.userWallet.update({
    where: { id: wallet.id },
    data: { balanceVnd: balanceAfterVnd },
  });

  const txn = await tx.walletTransaction.create({
    data: {
      userId: id,
      amountVnd: amount,
      balanceAfterVnd,
      type,
      bookingId: bookingId ?? null,
      note: note ?? null,
    },
  });

  return { wallet: { ...wallet, balanceVnd: balanceAfterVnd }, transaction: txn };
}

/**
 * Debit wallet inside an existing Prisma transaction.
 * @param {import('../generated/prisma').Prisma.TransactionClient} tx
 */
async function debitInTransaction(tx, { userId, amountVnd, type, bookingId, note }) {
  const id = parseId(userId, 'userId');
  const amount = Math.round(amountVnd);
  if (!Number.isInteger(amount) || amount <= 0) {
    throw httpError('amountVnd must be a positive integer', 400);
  }

  const wallet = await tx.userWallet.findUnique({ where: { userId: id } });
  if (!wallet || wallet.balanceVnd < amount) {
    throw httpError('Số dư ví không đủ', 409);
  }

  const balanceAfterVnd = wallet.balanceVnd - amount;
  await tx.userWallet.update({
    where: { id: wallet.id },
    data: { balanceVnd: balanceAfterVnd },
  });

  const txn = await tx.walletTransaction.create({
    data: {
      userId: id,
      amountVnd: -amount,
      balanceAfterVnd,
      type,
      bookingId: bookingId ?? null,
      note: note ?? null,
    },
  });

  return { wallet: { ...wallet, balanceVnd: balanceAfterVnd }, transaction: txn };
}

async function adminAdjust(userId, amountVnd, note, adminEmail) {
  const id = parseId(userId, 'userId');
  const amount = Math.round(amountVnd);
  if (!Number.isInteger(amount) || amount === 0) {
    throw httpError('amountVnd must be a non-zero integer', 400);
  }

  return prisma.$transaction(async (tx) => {
    if (amount > 0) {
      return creditInTransaction(tx, {
        userId: id,
        amountVnd: amount,
        type: 'admin_adjust',
        note: note || `Điều chỉ bởi ${adminEmail || 'admin'}`,
      });
    }
    return debitInTransaction(tx, {
      userId: id,
      amountVnd: Math.abs(amount),
      type: 'admin_adjust',
      note: note || `Điều chỉ bởi ${adminEmail || 'admin'}`,
    });
  });
}

module.exports = {
  getOrCreateWallet,
  getBalance,
  getWalletSummary,
  listTransactions,
  creditInTransaction,
  debitInTransaction,
  adminAdjust,
  formatTransaction,
};
