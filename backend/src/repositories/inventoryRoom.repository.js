const prisma = require('../config/prisma.config');

const roomInclude = {
  branch: {
    select: {
      id: true,
      code: true,
      name: true,
      propertyId: true,
      property: { select: { id: true, slug: true, name: true } },
    },
  },
  roomType: { select: { id: true, slug: true, title: true, category: true } },
};

const catalogRoomInclude = {
  branch: {
    select: {
      id: true,
      code: true,
      name: true,
      propertyId: true,
      property: { select: { id: true, slug: true, name: true, city: true } },
    },
  },
  roomType: {
    select: {
      id: true,
      slug: true,
      title: true,
      category: true,
      capacityLabel: true,
      bedLabel: true,
    },
  },
};

const catalogDetailRoomInclude = {
  branch: {
    select: {
      id: true,
      code: true,
      name: true,
      address: true,
      tagline: true,
      propertyId: true,
      property: {
        select: {
          id: true,
          slug: true,
          name: true,
          city: true,
          region: true,
          kind: true,
          rating: true,
          reviewCount: true,
        },
      },
      mapPin: true,
    },
  },
  roomType: {
    include: {
      gallery: { orderBy: [{ sortOrder: 'asc' }, { id: 'asc' }] },
      amenities: { include: { amenity: true } },
    },
  },
};

/**
 * @param {{ branchId?: number; roomTypeId?: number; status?: string; isActive?: boolean }} filters
 */
function findAll(filters = {}) {
  /** @type {import('../generated/prisma').Prisma.InventoryRoomWhereInput} */
  const where = {};
  if (filters.branchId) where.branchId = filters.branchId;
  if (filters.roomTypeId) where.roomTypeId = filters.roomTypeId;
  if (filters.status) where.status = filters.status;
  if (filters.isActive !== undefined) where.isActive = filters.isActive;

  return prisma.inventoryRoom.findMany({
    where,
    orderBy: [{ branchId: 'asc' }, { code: 'asc' }],
    include: roomInclude,
  });
}

function findAllForCatalog(filters = {}) {
  /** @type {import('../generated/prisma').Prisma.InventoryRoomWhereInput} */
  const where = {};
  if (filters.branchId) where.branchId = filters.branchId;
  if (filters.roomTypeId) where.roomTypeId = filters.roomTypeId;
  if (filters.status) where.status = filters.status;
  if (filters.isActive !== undefined) where.isActive = filters.isActive;

  return prisma.inventoryRoom.findMany({
    where,
    orderBy: [{ branchId: 'asc' }, { code: 'asc' }],
    include: catalogRoomInclude,
  });
}

function findByIdForCatalog(id) {
  return prisma.inventoryRoom.findUnique({
    where: { id },
    include: catalogRoomInclude,
  });
}

function findAllForCatalogDetail(filters = {}) {
  /** @type {import('../generated/prisma').Prisma.InventoryRoomWhereInput} */
  const where = {};
  if (filters.branchId) where.branchId = filters.branchId;
  if (filters.isActive !== undefined) where.isActive = filters.isActive;

  return prisma.inventoryRoom.findMany({
    where,
    orderBy: [{ branchId: 'asc' }, { code: 'asc' }],
    include: catalogDetailRoomInclude,
  });
}

function findByIdForCatalogDetail(id) {
  return prisma.inventoryRoom.findUnique({
    where: { id },
    include: catalogDetailRoomInclude,
  });
}

function findById(id) {
  return prisma.inventoryRoom.findUnique({
    where: { id },
    include: roomInclude,
  });
}

function findByBranchAndCode(branchId, code) {
  return prisma.inventoryRoom.findUnique({
    where: { branchId_code: { branchId, code } },
    include: roomInclude,
  });
}

function create(data) {
  return prisma.inventoryRoom.create({ data, include: roomInclude });
}

function update(id, data) {
  return prisma.inventoryRoom.update({ where: { id }, data, include: roomInclude });
}

function remove(id) {
  return prisma.inventoryRoom.delete({ where: { id } });
}

function countBookings(roomId) {
  return prisma.booking.count({ where: { roomId } });
}

async function countBookingsByRoomIds(roomIds) {
  if (!roomIds.length) return new Map();

  const rows = await prisma.booking.groupBy({
    by: ['roomId'],
    where: { roomId: { in: roomIds } },
    _count: { _all: true },
  });

  return new Map(rows.map((row) => [row.roomId, row._count._all]));
}

module.exports = {
  findAll,
  findAllForCatalog,
  findAllForCatalogDetail,
  findById,
  findByIdForCatalog,
  findByIdForCatalogDetail,
  findByBranchAndCode,
  create,
  update,
  remove,
  countBookings,
  countBookingsByRoomIds,
};
