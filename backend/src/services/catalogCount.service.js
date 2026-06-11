const prisma = require('../config/prisma.config');
const { parseId } = require('../utils/http');

async function syncBranchRoomCount(branchIdRaw) {
  const branchId = parseId(branchIdRaw, 'branchId');
  const roomCount = await prisma.inventoryRoom.count({ where: { branchId } });
  await prisma.branch.update({ where: { id: branchId }, data: { roomCount } });
  return roomCount;
}

async function syncPropertyCounts(propertyIdRaw) {
  const propertyId = parseId(propertyIdRaw, 'propertyId');
  const [branchCount, roomCount] = await Promise.all([
    prisma.branch.count({ where: { propertyId } }),
    prisma.inventoryRoom.count({ where: { branch: { propertyId } } }),
  ]);
  await prisma.property.update({
    where: { id: propertyId },
    data: { branchCount, roomCount },
  });
  return { branchCount, roomCount };
}

async function syncAfterBranchChange(branchIdRaw, previousPropertyId = null) {
  const branchId = parseId(branchIdRaw, 'branchId');
  const branch = await prisma.branch.findUnique({
    where: { id: branchId },
    select: { propertyId: true },
  });
  if (!branch) return null;

  const roomCount = await syncBranchRoomCount(branchId);
  const propertyCounts = await syncPropertyCounts(branch.propertyId);

  if (previousPropertyId && previousPropertyId !== branch.propertyId) {
    await syncPropertyCounts(previousPropertyId);
  }

  return { roomCount, ...propertyCounts };
}

async function syncAfterRoomChange(branchIdRaw, previousBranchId = null) {
  const branchId = parseId(branchIdRaw, 'branchId');
  const branch = await prisma.branch.findUnique({
    where: { id: branchId },
    select: { propertyId: true },
  });
  if (!branch) return null;

  const roomCount = await syncBranchRoomCount(branchId);
  const propertyCounts = await syncPropertyCounts(branch.propertyId);

  if (previousBranchId && previousBranchId !== branchId) {
    const prevBranch = await prisma.branch.findUnique({
      where: { id: previousBranchId },
      select: { propertyId: true },
    });
    if (prevBranch) {
      await syncBranchRoomCount(previousBranchId);
      await syncPropertyCounts(prevBranch.propertyId);
    }
  }

  return { roomCount, ...propertyCounts };
}

module.exports = {
  syncBranchRoomCount,
  syncPropertyCounts,
  syncAfterBranchChange,
  syncAfterRoomChange,
};
