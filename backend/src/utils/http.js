function httpError(message, statusCode = 400) {
  const err = new Error(message);
  err.statusCode = statusCode;
  return err;
}

function isDbConnectionError(error) {
  const message = String(error?.message || '').toLowerCase();
  const code = String(error?.code || '').toUpperCase();

  return (
    code === 'ECONNREFUSED'
    || code === 'ETIMEDOUT'
    || code === 'ENOTFOUND'
    || code === 'PROTOCOL_CONNECTION_LOST'
    || message.includes('pool timeout')
    || message.includes("can't reach database")
    || message.includes('connection refused')
    || message.includes('connect econnrefused')
    || message.includes('econnrefused')
    || message.includes('access denied for user')
  );
}

function resolveApiErrorStatus(error) {
  if (error?.statusCode) return error.statusCode;
  if (isDbConnectionError(error)) return 503;
  return 500;
}

function resolveApiErrorMessage(error) {
  if (isDbConnectionError(error)) {
    return 'Không kết nối được MySQL. Hãy bật MySQL Server (Workbench/service) rồi thử lại.';
  }
  return error?.message || 'Internal server error';
}

function sendApiError(res, error) {
  const statusCode = resolveApiErrorStatus(error);
  const payload = {
    success: false,
    message: resolveApiErrorMessage(error),
  };

  if (isDbConnectionError(error)) {
    payload.code = 'DB_UNAVAILABLE';
  }

  res.status(statusCode).json(payload);
}

function parseId(raw, label = 'id') {
  const id = Number.parseInt(raw, 10);
  if (!Number.isInteger(id) || id < 1) {
    throw httpError(`Invalid ${label}`);
  }
  return id;
}

function parseOptionalBoolean(raw) {
  if (raw === undefined || raw === '') return undefined;
  if (raw === 'true' || raw === '1') return true;
  if (raw === 'false' || raw === '0') return false;
  throw httpError('Invalid isActive value (use true or false)');
}

function parseOptionalId(raw, label = 'id') {
  if (raw === undefined || raw === '') return undefined;
  return parseId(raw, label);
}

module.exports = {
  httpError,
  isDbConnectionError,
  resolveApiErrorStatus,
  resolveApiErrorMessage,
  sendApiError,
  parseId,
  parseOptionalBoolean,
  parseOptionalId,
};
