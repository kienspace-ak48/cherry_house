const { httpError } = require('./http');

/**
 * Phạm vi dữ liệu nhân viên — một tài khoản chỉ xem booking của một cơ sở (property).
 */
function getStaffDataScope(staff) {
  if (!staff || staff.role !== 'staff') return {};
  if (!staff.propertyId) return {};
  return { propertyId: Number(staff.propertyId) };
}

function mergeStaffScopeFilters(staff, filters = {}) {
  const scope = getStaffDataScope(staff);
  return {
    ...filters,
    ...(scope.propertyId ? { propertyId: scope.propertyId } : {}),
  };
}

function scopePropertyCatalog(staff, { properties = [], branches = [] } = {}) {
  const scope = getStaffDataScope(staff);
  if (!scope.propertyId) {
    return { properties, branches };
  }
  return {
    properties: properties.filter((p) => p.id === scope.propertyId),
    branches: branches.filter((b) => b.propertyId === scope.propertyId),
  };
}

function assertBookingInStaffScope(staff, booking) {
  const scope = getStaffDataScope(staff);
  if (scope.propertyId && Number(booking?.propertyId) !== scope.propertyId) {
    throw httpError('Bạn không có quyền truy cập booking này', 403);
  }
}

function assertBranchInStaffScope(staff, branch) {
  const scope = getStaffDataScope(staff);
  if (scope.propertyId && Number(branch?.propertyId) !== scope.propertyId) {
    throw httpError('Chi nhánh không thuộc cơ sở của bạn', 403);
  }
}

module.exports = {
  getStaffDataScope,
  mergeStaffScopeFilters,
  scopePropertyCatalog,
  assertBookingInStaffScope,
  assertBranchInStaffScope,
};
