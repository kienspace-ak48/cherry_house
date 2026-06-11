const adminRepository = require('../repositories/admin.repository');
const { hashPassword } = require('../utils/hashPassword.util');
const { httpError, parseId } = require('../utils/http');
const { mapPrismaError } = require('../utils/crud');

const ADMIN_ROLES = [
  { value: 'super_admin', label: 'Super Admin', description: 'Toàn quyền hệ thống' },
  { value: 'admin', label: 'Admin', description: 'Quản trị toàn hệ thống (trừ backup & super admin)' },
  { value: 'staff', label: 'Nhân viên', description: 'Portal /staff — chỉ xem booking của một cơ sở' },
];

function roleLabel(role) {
  return ADMIN_ROLES.find((r) => r.value === role)?.label || role;
}

function roleBadgeClass(role) {
  const map = { super_admin: 'danger', admin: 'primary', staff: 'info' };
  return map[role] || 'secondary';
}

function canManageAccounts(actor) {
  return actor?.role === 'super_admin' || actor?.role === 'admin';
}

function canAssignRole(actor, targetRole) {
  if (actor?.role === 'super_admin') return true;
  if (actor?.role === 'admin') return targetRole === 'staff';
  return false;
}

function canEditAccount(actor, target) {
  if (!actor || !target) return false;
  if (actor.role === 'super_admin') return true;
  if (actor.role === 'admin') return target.role === 'staff';
  return false;
}

function sanitizeAdmin(admin) {
  if (!admin) return null;
  const { passwordHash, ...safe } = admin;
  return safe;
}

function formatAdminRow(admin) {
  const safe = sanitizeAdmin(admin);
  return {
    ...safe,
    roleLabel: roleLabel(safe.role),
    branchLabel: safe.property
      ? safe.property.name
      : safe.branch
        ? `${safe.branch.property?.name || '—'} · ${safe.branch.name}`
        : null,
  };
}

function parseRole(raw) {
  const role = typeof raw === 'string' ? raw.trim() : '';
  if (!ADMIN_ROLES.some((r) => r.value === role)) {
    throw httpError('Invalid role');
  }
  return role;
}

function parsePropertyId(raw, role) {
  if (role !== 'staff') return null;
  const propertyId = parseId(raw, 'propertyId');
  if (!propertyId) throw httpError('Cơ sở lưu trú bắt buộc với tài khoản nhân viên');
  return propertyId;
}

function parseAccountPayload(body, { requirePassword = false } = {}) {
  const fullName = typeof body.fullName === 'string' ? body.fullName.trim() : '';
  const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
  const password = typeof body.password === 'string' ? body.password : '';
  const role = parseRole(body.role || 'staff');
  const propertyId = parsePropertyId(body.propertyId, role);
  const isActive = body.isActive === 'on' || body.isActive === true || body.isActive === '1';

  if (!fullName) throw httpError('Họ tên là bắt buộc');
  if (!email) throw httpError('Email là bắt buộc');
  if (requirePassword && (!password || password.length < 6)) {
    throw httpError('Mật khẩu tối thiểu 6 ký tự');
  }
  if (password && password.length < 6) {
    throw httpError('Mật khẩu tối thiểu 6 ký tự');
  }

  const avatarUrl =
    body.avatarUrl !== undefined
      ? (typeof body.avatarUrl === 'string' ? body.avatarUrl.trim() || null : null)
      : undefined;

  return { fullName, email, password, role, propertyId, isActive, avatarUrl };
}

async function list(filters = {}) {
  const rows = await adminRepository.findAll(filters);
  return rows.map(formatAdminRow);
}

async function getById(id) {
  const admin = await adminRepository.findById(parseId(id, 'id'));
  if (!admin) throw httpError('Account not found', 404);
  return formatAdminRow(admin);
}

async function create(actor, body) {
  if (!canManageAccounts(actor)) throw httpError('Forbidden', 403);

  const payload = parseAccountPayload(body, { requirePassword: true });
  if (!canAssignRole(actor, payload.role)) {
    throw httpError('Bạn không có quyền gán vai trò này', 403);
  }

  const existing = await adminRepository.findByEmail(payload.email);
  if (existing) throw httpError('Email đã được sử dụng', 409);

  const passwordHash = await hashPassword(payload.password);

  try {
    const created = await adminRepository.create({
      email: payload.email,
      fullName: payload.fullName,
      avatarUrl: payload.avatarUrl ?? null,
      role: payload.role,
      propertyId: payload.propertyId,
      branchId: null,
      isActive: payload.isActive,
      passwordHash,
    });
    return formatAdminRow(created);
  } catch (error) {
    mapPrismaError(error, 'Could not create account');
  }
}

async function update(actor, id, body) {
  if (!canManageAccounts(actor)) throw httpError('Forbidden', 403);

  const adminId = parseId(id, 'id');
  const existing = await adminRepository.findById(adminId);
  if (!existing) throw httpError('Account not found', 404);

  if (!canEditAccount(actor, existing)) {
    throw httpError('Bạn không có quyền sửa tài khoản này', 403);
  }

  const payload = parseAccountPayload(body);
  if (!canAssignRole(actor, payload.role)) {
    throw httpError('Bạn không có quyền gán vai trò này', 403);
  }

  if (payload.email !== existing.email) {
    const dup = await adminRepository.findByEmail(payload.email);
    if (dup && dup.id !== adminId) throw httpError('Email đã được sử dụng', 409);
  }

  if (actor.id === adminId && !payload.isActive) {
    throw httpError('Không thể khóa chính tài khoản của bạn');
  }

  /** @type {import('../generated/prisma').Prisma.AdminUpdateInput} */
  const data = {
    email: payload.email,
    fullName: payload.fullName,
    role: payload.role,
    propertyId: payload.role === 'staff' ? payload.propertyId : null,
    branchId: null,
    isActive: payload.isActive,
  };

  if (payload.avatarUrl !== undefined) {
    data.avatarUrl = payload.avatarUrl;
  }

  if (payload.password) {
    data.passwordHash = await hashPassword(payload.password);
  }

  try {
    const updated = await adminRepository.update(adminId, data);
    return formatAdminRow(updated);
  } catch (error) {
    mapPrismaError(error, 'Could not update account');
  }
}

function assignableRoles(actor) {
  if (actor?.role === 'super_admin') {
    return ADMIN_ROLES;
  }
  if (actor?.role === 'admin') {
    return ADMIN_ROLES.filter((r) => r.value === 'staff');
  }
  return [];
}

module.exports = {
  ADMIN_ROLES,
  roleLabel,
  roleBadgeClass,
  canManageAccounts,
  canEditAccount,
  assignableRoles,
  list,
  getById,
  create,
  update,
  formatAdminRow,
};
