const contactMessageRepository = require('../repositories/contactMessage.repository');
const { httpError, parseId } = require('../utils/http');
const { mapPrismaError } = require('../utils/crud');

const STATUSES = [
  { value: 'new', label: 'Mới', badge: 'primary' },
  { value: 'read', label: 'Đã đọc', badge: 'secondary' },
  { value: 'replied', label: 'Đã phản hồi', badge: 'success' },
  { value: 'archived', label: 'Lưu trữ', badge: 'dark' },
];

const STATUS_SET = new Set(STATUSES.map((s) => s.value));

function normalizeEmail(raw) {
  const email = typeof raw === 'string' ? raw.trim().toLowerCase() : '';
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw httpError('Email không hợp lệ', 400);
  }
  return email;
}

function parsePublicPayload(body = {}) {
  const fullName = typeof body.fullName === 'string'
    ? body.fullName.trim()
    : typeof body.name === 'string'
      ? body.name.trim()
      : '';
  const email = normalizeEmail(body.email);
  const phone = typeof body.phone === 'string' ? body.phone.trim() || null : null;
  const message = typeof body.message === 'string' ? body.message.trim() : '';

  if (!fullName || fullName.length < 2) {
    throw httpError('Họ tên là bắt buộc', 400);
  }
  if (!message || message.length < 10) {
    throw httpError('Nội dung tối thiểu 10 ký tự', 400);
  }
  if (message.length > 5000) {
    throw httpError('Nội dung quá dài', 400);
  }

  return { fullName, email, phone, message };
}

function parseStatus(raw) {
  const status = typeof raw === 'string' ? raw.trim() : '';
  if (!STATUS_SET.has(status)) {
    throw httpError('Trạng thái không hợp lệ', 400);
  }
  return status;
}

function parseListFilters(query = {}) {
  const filters = {};
  if (query.status && STATUS_SET.has(String(query.status))) {
    filters.status = String(query.status);
  }
  const q = typeof query.q === 'string' ? query.q.trim() : '';
  if (q) filters.q = q;
  return filters;
}

function statusMeta(status) {
  return STATUSES.find((s) => s.value === status) || { value: status, label: status, badge: 'secondary' };
}

async function submitFromPublic(body, meta = {}) {
  const payload = parsePublicPayload(body);
  try {
    return await contactMessageRepository.create({
      ...payload,
      ipAddress: meta.ipAddress || null,
      userAgent: meta.userAgent || null,
    });
  } catch (error) {
    mapPrismaError(error, 'Could not save contact message');
  }
}

async function getStatusCounts() {
  const entries = await Promise.all(
    STATUSES.map(async (s) => [s.value, await contactMessageRepository.countByStatus(s.value)]),
  );
  return Object.fromEntries(entries);
}

async function listForAdmin(query = {}) {
  const filters = parseListFilters(query);
  const [items, total, statusCounts] = await Promise.all([
    contactMessageRepository.findAll(filters),
    contactMessageRepository.countAll(filters),
    getStatusCounts(),
  ]);
  return {
    items,
    total,
    newCount: statusCounts.new || 0,
    statusCounts,
    filters,
  };
}

async function getById(idRaw) {
  const row = await contactMessageRepository.findById(parseId(idRaw, 'id'));
  if (!row) throw httpError('Không tìm thấy tin nhắn', 404);
  return row;
}

async function getByIdForAdmin(idRaw, { markRead = false } = {}) {
  const row = await getById(idRaw);
  if (!markRead || row.status !== 'new') return row;
  return contactMessageRepository.update(row.id, {
    status: 'read',
    readAt: row.readAt || new Date(),
  });
}

async function updateFromAdmin(idRaw, body = {}) {
  const id = parseId(idRaw, 'id');
  const existing = await contactMessageRepository.findById(id);
  if (!existing) throw httpError('Không tìm thấy tin nhắn', 404);

  const data = {};
  if (body.status !== undefined) {
    data.status = parseStatus(body.status);
    if (data.status === 'read' && !existing.readAt) {
      data.readAt = new Date();
    }
    if (data.status === 'new') {
      data.readAt = null;
    }
  }
  if (body.adminNote !== undefined) {
    data.adminNote = String(body.adminNote || '').trim() || null;
  }

  if (!Object.keys(data).length) {
    throw httpError('Không có thay đổi', 400);
  }

  try {
    return await contactMessageRepository.update(id, data);
  } catch (error) {
    mapPrismaError(error, 'Could not update contact message');
  }
}

async function remove(idRaw) {
  const id = parseId(idRaw, 'id');
  try {
    return await contactMessageRepository.remove(id);
  } catch (error) {
    mapPrismaError(error, 'Không tìm thấy tin nhắn');
  }
}

function buildMailReplyUrl(message) {
  const subject = encodeURIComponent(`Re: Liên hệ Cherry House — ${message.fullName}`);
  const body = encodeURIComponent(
    `Xin chào ${message.fullName},\n\nCảm ơn bạn đã liên hệ Cherry House.\n\n---\nTin gốc (${message.id}):\n${message.message}\n`,
  );
  return `mailto:${message.email}?subject=${subject}&body=${body}`;
}

module.exports = {
  STATUSES,
  statusMeta,
  buildMailReplyUrl,
  submitFromPublic,
  listForAdmin,
  getStatusCounts,
  getById,
  getByIdForAdmin,
  updateFromAdmin,
  remove,
};
