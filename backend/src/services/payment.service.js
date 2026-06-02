const paymentRepository = require('../repositories/payment.repository');
const { httpError, parseId, parseOptionalId } = require('../utils/http');
const { mapPrismaError } = require('../utils/crud');

const PAYMENT_METHODS = new Set(['card', 'bank', 'wallet']);
const PAYMENT_STATUSES = new Set(['pending', 'paid', 'failed', 'refunded']);

function parseMethod(raw) {
  const method = typeof raw === 'string' ? raw.trim() : '';
  if (!PAYMENT_METHODS.has(method)) {
    throw httpError(`Invalid method. Allowed: ${[...PAYMENT_METHODS].join(', ')}`);
  }
  return method;
}

function parseStatus(raw) {
  const status = typeof raw === 'string' ? raw.trim() : '';
  if (!PAYMENT_STATUSES.has(status)) {
    throw httpError(`Invalid status. Allowed: ${[...PAYMENT_STATUSES].join(', ')}`);
  }
  return status;
}

function parseListFilters(query) {
  const filters = {
    bookingId: parseOptionalId(query.bookingId, 'bookingId'),
  };
  if (query.status) filters.status = parseStatus(String(query.status));
  if (query.method) filters.method = parseMethod(String(query.method));
  return filters;
}

function assertCreatePayload(body) {
  const bookingId = parseId(body.bookingId, 'bookingId');
  const method = parseMethod(body.method);
  const amountVnd = Number(body.amountVnd);
  if (!Number.isInteger(amountVnd) || amountVnd < 0) {
    throw httpError('amountVnd must be a non-negative integer');
  }

  return {
    bookingId,
    method,
    amountVnd,
    status: body.status !== undefined ? parseStatus(body.status) : 'pending',
    providerRef:
      body.providerRef !== undefined && body.providerRef !== null
        ? String(body.providerRef).trim() || null
        : null,
    paidAt:
      body.paidAt !== undefined && body.paidAt !== null
        ? new Date(body.paidAt)
        : null,
  };
}

function buildPatchStatusPayload(body) {
  const data = {};
  if (body.status !== undefined) data.status = parseStatus(body.status);
  if (body.providerRef !== undefined) {
    data.providerRef =
      body.providerRef === null ? null : String(body.providerRef).trim() || null;
  }
  if (body.paidAt !== undefined) {
    data.paidAt = body.paidAt === null ? null : new Date(body.paidAt);
  }
  if (Object.keys(data).length === 0) throw httpError('No fields to update');
  if (data.status === 'paid' && data.paidAt === undefined) {
    data.paidAt = new Date();
  }
  return data;
}

async function list(query = {}) {
  return paymentRepository.findAll(parseListFilters(query));
}

async function getById(idRaw) {
  return paymentRepository.findById(parseId(idRaw));
}

async function create(body) {
  try {
    return await paymentRepository.create(assertCreatePayload(body));
  } catch (error) {
    mapPrismaError(error, 'Payment not found');
  }
}

async function patchStatus(idRaw, body) {
  const id = parseId(idRaw);
  try {
    return await paymentRepository.updateStatus(id, buildPatchStatusPayload(body));
  } catch (error) {
    mapPrismaError(error, 'Payment not found');
  }
}

module.exports = { list, getById, create, patchStatus };
