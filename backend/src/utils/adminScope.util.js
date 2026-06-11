const { httpError } = require('./http');

/**
 * Phạm vi dữ liệu theo tài khoản admin đăng nhập.
 * staff → chỉ chi nhánh được gắn.
 */
function getAdminDataScope(admin) {
  if (!admin) return {};
  if (admin.role === 'staff' && admin.branchId) {
    return {
      branchId: Number(admin.branchId),
      propertyId: admin.propertyId ? Number(admin.propertyId) : undefined,
    };
  }
  return {};
}

function mergeScopeFilters(admin, filters = {}) {
  const scope = getAdminDataScope(admin);
  return {
    ...filters,
    ...(scope.branchId ? { branchId: scope.branchId } : {}),
    ...(scope.propertyId && !filters.branchId ? { propertyId: scope.propertyId } : {}),
  };
}

function scopeCatalogLists(admin, { properties = [], branches = [], rooms = [] } = {}) {
  const scope = getAdminDataScope(admin);
  let scopedBranches = branches;
  let scopedRooms = rooms;
  let scopedProperties = properties;

  if (scope.branchId) {
    scopedBranches = branches.filter((b) => b.id === scope.branchId);
    scopedRooms = rooms.filter((r) => r.branchId === scope.branchId);
    const propertyId = scopedBranches[0]?.propertyId ?? scope.propertyId;
    scopedProperties = propertyId
      ? properties.filter((p) => p.id === propertyId)
      : properties;
  } else if (scope.propertyId) {
    scopedBranches = branches.filter((b) => b.propertyId === scope.propertyId);
    scopedProperties = properties.filter((p) => p.id === scope.propertyId);
  }

  return {
    properties: scopedProperties,
    branches: scopedBranches,
    rooms: scopedRooms,
  };
}

function assertBookingInScope(admin, booking) {
  const scope = getAdminDataScope(admin);
  if (scope.branchId && Number(booking?.branchId) !== scope.branchId) {
    throw httpError('Bạn không có quyền truy cập booking này', 403);
  }
}

function assertRoomInScope(admin, room) {
  const scope = getAdminDataScope(admin);
  if (scope.branchId && Number(room?.branchId) !== scope.branchId) {
    throw httpError('Phòng không thuộc chi nhánh của bạn', 403);
  }
}

module.exports = {
  getAdminDataScope,
  mergeScopeFilters,
  scopeCatalogLists,
  assertBookingInScope,
  assertRoomInScope,
};
