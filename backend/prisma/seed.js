const path = require('path');

require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const { PrismaClient } = require('../src/generated/prisma');
const { PrismaMariaDb } = require('@prisma/adapter-mariadb');
const {
  IMG,
  BRANCH_COUNTS,
  PROPERTIES,
  SAMPLE_ROOMS,
  ROOM_TYPES,
  AMENITIES,
} = require('./seed-data/vietnam-catalog');

const { hashPassword } = require('../src/utils/hashPassword.util');

const adapter = new PrismaMariaDb(process.env.DATABASE_URL);
const prisma = new PrismaClient({ adapter });

const SAMPLE_ADMIN = {
  email: 'admin@cherryhouse.vn',
  fullName: 'Cherry House Admin',
  role: 'super_admin',
  password: 'Admin@123',
};

const SAMPLE_USER = {
  email: 'guest@cherryhouse.vn',
  fullName: 'Nguyễn Văn Khách',
  phone: '0901234567',
  membershipTier: 'gold',
};

const SAMPLE_PROMO = {
  code: 'CHERRY10',
  discountPercent: 10,
  validFrom: new Date('2025-01-01'),
  validTo: new Date('2027-12-31'),
  maxUses: 1000,
};

function branchesForProperty(property, propertyIndex) {
  const count = BRANCH_COUNTS[propertyIndex] ?? 1;
  return property.branches.slice(0, count);
}

async function seedProperties() {
  const propertyIds = {};

  for (let i = 0; i < PROPERTIES.length; i++) {
    const row = PROPERTIES[i];
    const branches = branchesForProperty(row, i);
    const branchCount = branches.length;
    const roomCount = branches.reduce((sum, b) => sum + (b.roomCount || 0), 0);

    const data = {
      slug: row.slug,
      name: row.name,
      city: row.city,
      region: row.region,
      kind: row.kind,
      tagline: row.tagline,
      description: row.description,
      address: row.address,
      priceFromVnd: row.priceFromVnd,
      roomCount,
      branchCount,
      rating: row.rating,
      reviewCount: row.reviewCount,
      heroImageUrl: row.heroImageUrl,
      highlights: row.highlights,
      isActive: true,
    };

    await prisma.property.upsert({
      where: { slug: row.slug },
      update: data,
      create: data,
    });

    const saved = await prisma.property.findUnique({ where: { slug: row.slug } });
    if (saved) propertyIds[row.slug] = saved.id;
  }

  return propertyIds;
}

async function seedPropertyGalleries(propertyIds) {
  const galleryImages = [IMG.hero1, IMG.hero2, IMG.hero3];

  for (const row of PROPERTIES) {
    const propertyId = propertyIds[row.slug];
    if (!propertyId) continue;

    await prisma.propertyGallery.deleteMany({ where: { propertyId } });
    for (let i = 0; i < galleryImages.length; i++) {
      await prisma.propertyGallery.create({
        data: { propertyId, imageUrl: galleryImages[i], sortOrder: i },
      });
    }
  }
}

async function seedBranches(propertyIds) {
  const branchByKey = {};

  for (let i = 0; i < PROPERTIES.length; i++) {
    const row = PROPERTIES[i];
    const propertyId = propertyIds[row.slug];
    if (!propertyId) continue;

    const branches = branchesForProperty(row, i);

    for (const { lat, lng, ...branch } of branches) {
      const saved = await prisma.branch.upsert({
        where: { propertyId_code: { propertyId, code: branch.code } },
        update: { ...branch, propertyId, isActive: true },
        create: { ...branch, propertyId, isActive: true },
      });

      branchByKey[`${row.slug}:${branch.code}`] = saved;

      await prisma.branchMapPin.upsert({
        where: { branchId: saved.id },
        update: {
          lat,
          lng,
          zoom: 15,
          label: saved.name,
          pinBadge: 'CH',
          pinInfo: saved.tagline,
          googleMapsUrl: `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`,
          embedUrl: null,
        },
        create: {
          branchId: saved.id,
          lat,
          lng,
          zoom: 15,
          label: saved.name,
          pinBadge: 'CH',
          pinInfo: saved.tagline,
          googleMapsUrl: `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`,
        },
      });
    }
  }

  return branchByKey;
}

async function seedRoomTypes() {
  const roomTypeBySlug = {};

  for (const rt of ROOM_TYPES) {
    const saved = await prisma.roomType.upsert({
      where: { slug: rt.slug },
      update: rt,
      create: rt,
    });
    roomTypeBySlug[rt.slug] = saved;

    await prisma.roomTypeGallery.deleteMany({ where: { roomTypeId: saved.id } });
    await prisma.roomTypeGallery.create({
      data: {
        roomTypeId: saved.id,
        imageUrl: IMG.room,
        sortOrder: 0,
      },
    });
  }

  return roomTypeBySlug;
}

async function seedAmenities(propertyIds, roomTypeBySlug) {
  const amenityByIcon = {};

  for (const a of AMENITIES) {
    let row = await prisma.amenity.findFirst({ where: { icon: a.icon } });
    if (!row) row = await prisma.amenity.create({ data: a });
    amenityByIcon[a.icon] = row;
  }

  const defaultAmenityIcons = ['wifi', 'parking', 'breakfast', 'ac'];
  for (const slug of Object.keys(propertyIds)) {
    const propertyId = propertyIds[slug];
    for (const icon of defaultAmenityIcons) {
      const amenity = amenityByIcon[icon];
      if (!amenity) continue;
      await prisma.propertyAmenity.upsert({
        where: { propertyId_amenityId: { propertyId, amenityId: amenity.id } },
        update: {},
        create: { propertyId, amenityId: amenity.id },
      });
    }
  }

  const standardType = roomTypeBySlug['standard-garden'];
  if (standardType) {
    for (const icon of ['wifi', 'ac']) {
      const amenity = amenityByIcon[icon];
      await prisma.roomTypeAmenity.upsert({
        where: {
          roomTypeId_amenityId: { roomTypeId: standardType.id, amenityId: amenity.id },
        },
        update: {},
        create: { roomTypeId: standardType.id, amenityId: amenity.id },
      });
    }
  }

  return amenityByIcon;
}

async function seedSampleRooms(branchByKey, roomTypeBySlug) {
  let count = 0;

  for (const room of SAMPLE_ROOMS) {
    const branch = branchByKey[`${room.propertySlug}:${room.branchCode}`];
    const roomType = roomTypeBySlug[room.roomTypeSlug];
    if (!branch || !roomType) {
      console.warn(`Skip room ${room.code}: branch or room type not found`);
      continue;
    }

    await prisma.inventoryRoom.upsert({
      where: { branchId_code: { branchId: branch.id, code: room.code } },
      update: {
        roomTypeId: roomType.id,
        priceVnd: room.priceVnd,
        description: room.description,
        imageUrl: IMG.room,
        altText: room.altText,
        maxAdults: 2,
        maxChildren: 1,
        status: room.status,
        isActive: true,
      },
      create: {
        branchId: branch.id,
        roomTypeId: roomType.id,
        code: room.code,
        priceVnd: room.priceVnd,
        description: room.description,
        imageUrl: IMG.room,
        altText: room.altText,
        maxAdults: 2,
        maxChildren: 1,
        status: room.status,
        isActive: true,
      },
    });
    count += 1;
  }

  return count;
}

/** Slug cũ (seed trước) — xóa để tránh trùng dữ liệu lạc */
const LEGACY_PROPERTY_SLUGS = ['cherry-villa-da-lat'];

async function removeLegacyProperties() {
  for (const slug of LEGACY_PROPERTY_SLUGS) {
    await prisma.property.deleteMany({ where: { slug } });
  }
}

async function main() {
  await removeLegacyProperties();
  const propertyIds = await seedProperties();
  await seedPropertyGalleries(propertyIds);
  const branchByKey = await seedBranches(propertyIds);
  const roomTypeBySlug = await seedRoomTypes();
  await seedAmenities(propertyIds, roomTypeBySlug);
  const roomCount = await seedSampleRooms(branchByKey, roomTypeBySlug);

  const totalBranches = Object.keys(branchByKey).length;

  const adminPasswordHash = await hashPassword(SAMPLE_ADMIN.password);
  await prisma.admin.upsert({
    where: { email: SAMPLE_ADMIN.email },
    update: {
      fullName: SAMPLE_ADMIN.fullName,
      role: SAMPLE_ADMIN.role,
      passwordHash: adminPasswordHash,
      isActive: true,
    },
    create: {
      email: SAMPLE_ADMIN.email,
      fullName: SAMPLE_ADMIN.fullName,
      role: SAMPLE_ADMIN.role,
      passwordHash: adminPasswordHash,
      isActive: true,
    },
  });

  await prisma.user.upsert({
    where: { email: SAMPLE_USER.email },
    update: SAMPLE_USER,
    create: SAMPLE_USER,
  });

  await prisma.promoCode.upsert({
    where: { code: SAMPLE_PROMO.code },
    update: SAMPLE_PROMO,
    create: SAMPLE_PROMO,
  });

  console.log(
    `Seed completed: ${PROPERTIES.length} cơ sở, ${totalBranches} chi nhánh, ${roomCount} phòng mẫu, admin, user, promo.`,
  );
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
