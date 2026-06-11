function httpError(message, statusCode = 400) {
  const err = new Error(message);
  err.statusCode = statusCode;
  return err;
}

function collectDbErrorText(error) {
  const parts = [];
  let current = error;
  let depth = 0;
  while (current && depth < 6) {
    if (current.message) parts.push(String(current.message));
    if (current.code) parts.push(String(current.code));
    current = current.cause;
    depth += 1;
  }
  return parts.join(' | ').toLowerCase();
}

function isDbConnectionError(error) {
  const blob = collectDbErrorText(error);
  const code = String(error?.code || '').toUpperCase();

  return (
    code === 'ECONNREFUSED'
    || code === 'ETIMEDOUT'
    || code === 'ENOTFOUND'
    || code === 'PROTOCOL_CONNECTION_LOST'
    || code === 'ER_ACCESS_DENIED_ERROR'
    || code === 'ER_BAD_DB_ERROR'
    || blob.includes('pool timeout')
    || blob.includes("can't reach database")
    || blob.includes('connection refused')
    || blob.includes('econnrefused')
    || blob.includes('access denied for user')
    || blob.includes('unknown database')
    || blob.includes('rsa public key')
    || blob.includes('allowpublickeyretrieval')
    || blob.includes('enotfound')
  );
}

function formatDbErrorDetail(error) {
  const parts = [];
  let current = error;
  let depth = 0;
  while (current && depth < 6) {
    const msg = current.message || current.originalMessage;
    if (msg && !parts.includes(msg)) parts.push(String(msg));
    current = current.cause;
    depth += 1;
  }
  return parts.join(' → ') || String(error);
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
  if (raw === true || raw === 'true' || raw === '1') return true;
  if (raw === false || raw === 'false' || raw === '0') return false;
  throw httpError('Invalid isActive value (use true or false)');
}

function parseOptionalId(raw, label = 'id') {
  if (raw === undefined || raw === '') return undefined;
  return parseId(raw, label);
}

module.exports = {
  httpError,
  isDbConnectionError,
  formatDbErrorDetail,
  resolveApiErrorStatus,
  resolveApiErrorMessage,
  sendApiError,
  parseId,
  parseOptionalBoolean,
  parseOptionalId,
};
