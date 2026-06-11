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
  LEGACY_PROPERTY_SLUGS,
} = require('./seed-data/test-catalog');

const { hashPassword } = require('../src/utils/hashPassword.util');
const { buildDefaultTemplates } = require('../src/config/emailTemplate.defaults');
const catalogCountService = require('../src/services/catalogCount.service');
const { buildDefaultSettings: buildHomeHeroDefaults } = require('../src/services/homeHero.service');
const { buildDefaultSettings: buildHomePageDefaults } = require('../src/services/homePage.service');
const { buildDefaultSettings: buildChatBotDefaults } = require('../src/services/chatBotConfig.service');

const adapter = new PrismaMariaDb(process.env.DATABASE_URL);
const prisma = new PrismaClient({ adapter });

const TEST_PASSWORD = 'Test@123';

const SAMPLE_ADMINS = [
  {
    email: 'admin@cherryhouse.vn',
    fullName: 'Cherry House Super Admin',
    role: 'super_admin',
    password: 'Admin@123',
    propertySlug: null,
    branchKey: null,
  },
  {
    email: 'manager@cherryhouse.vn',
    fullName: 'Quản lý CMS',
    role: 'admin',
    password: 'Admin@123',
    propertySlug: null,
    branchKey: null,
  },
  {
    email: 'staff.dalat@cherryhouse.vn',
    fullName: 'NV Lễ tân Đà Lạt Centro',
    role: 'staff',
    password: 'Staff@123',
    propertySlug: 'cherry-dalat-centro',
    branchKey: 'cherry-dalat-centro:dl-centro-hxh',
  },
  {
    email: 'staff.hanoi@cherryhouse.vn',
    fullName: 'NV Hà Nội',
    role: 'staff',
    password: 'Staff@123',
    propertySlug: 'cherry-house-ha-noi',
    branchKey: null,
  },
];

const SAMPLE_USERS = [
  {
    email: 'guest@cherryhouse.vn',
    fullName: 'Nguyễn Văn Khách',
    phone: '0901234567',
    membershipTier: 'gold',
    authProvider: 'local',
    emailVerified: true,
    isActive: true,
    bookingBanned: false,
  },
  {
    email: 'standard@test.vn',
    fullName: 'Trần Thị Standard',
    phone: '0912000001',
    membershipTier: 'standard',
    authProvider: 'local',
    emailVerified: true,
    isActive: true,
    bookingBanned: false,
  },
  {
    email: 'diamond@test.vn',
    fullName: 'Lê Văn Diamond',
    phone: '0912000002',
    membershipTier: 'diamond',
    authProvider: 'local',
    emailVerified: true,
    isActive: true,
    bookingBanned: false,
  },
  {
    email: 'banned@test.vn',
    fullName: 'Phạm Bị Cấm',
    phone: '0912000003',
    membershipTier: 'standard',
    authProvider: 'local',
    emailVerified: true,
    isActive: true,
    bookingBanned: true,
    bookingBanReason: 'No-show 3 lần liên tiếp (seed test)',
    bookingBannedAt: new Date('2026-01-15'),
  },
  {
    email: 'inactive@test.vn',
    fullName: 'Hoàng Không Active',
    phone: '0912000004',
    membershipTier: 'standard',
    authProvider: 'local',
    emailVerified: false,
    isActive: false,
    bookingBanned: false,
  },
  {
    email: 'google.user@test.vn',
    fullName: 'Google OAuth Demo',
    phone: null,
    membershipTier: 'standard',
    authProvider: 'google',
    googleId: 'google-seed-demo-001',
    emailVerified: true,
    isActive: true,
    bookingBanned: false,
  },
];

const SAMPLE_PROMOS = [
  {
    code: 'CHERRY10',
    discountType: 'percent',
    discountPercent: 10,
    discountAmountVnd: null,
    minSubtotalVnd: 0,
    description: 'Giảm 10% — đang hiệu lực',
    validFrom: new Date('2025-01-01'),
    validTo: new Date('2027-12-31'),
    maxUses: 1000,
    usedCount: 12,
    isActive: true,
  },
  {
    code: 'SAVE100K',
    discountType: 'fixed_amount',
    discountPercent: null,
    discountAmountVnd: 100_000,
    minSubtotalVnd: 500_000,
    description: 'Giảm 100k đơn từ 500k',
    validFrom: new Date('2025-01-01'),
    validTo: new Date('2027-12-31'),
    maxUses: 500,
    usedCount: 0,
    isActive: true,
  },
  {
    code: 'DALAT20',
    discountType: 'percent',
    discountPercent: 20,
    discountAmountVnd: null,
    minSubtotalVnd: 1_000_000,
    description: 'Ưu đãi Đà Lạt — đơn từ 1 triệu',
    validFrom: new Date('2026-01-01'),
    validTo: new Date('2026-12-31'),
    maxUses: 200,
    usedCount: 199,
    isActive: true,
  },
  {
    code: 'EXPIRED50',
    discountType: 'percent',
    discountPercent: 50,
    discountAmountVnd: null,
    minSubtotalVnd: 0,
    description: 'Mã hết hạn (test)',
    validFrom: new Date('2024-01-01'),
    validTo: new Date('2024-12-31'),
    maxUses: null,
    usedCount: 5,
    isActive: true,
  },
  {
    code: 'DISABLED',
    discountType: 'fixed_amount',
    discountPercent: null,
    discountAmountVnd: 50_000,
    minSubtotalVnd: 0,
    description: 'Mã tắt thủ công (test)',
    validFrom: new Date('2025-01-01'),
    validTo: new Date('2027-12-31'),
    maxUses: null,
    usedCount: 0,
    isActive: false,
  },
];

const CONTACT_MESSAGES = [
  {
    fullName: 'Nguyễn Minh Anh',
    email: 'minhanh@example.com',
    phone: '0988111222',
    message: 'Cho mình hỏi Cherry Đà Lạt Centro còn phòng cuối tuần 15–16/6 không ạ?',
    status: 'new',
  },
  {
    fullName: 'Trần Quốc Bảo',
    email: 'guest@cherryhouse.vn',
    phone: '0901234567',
    message: 'Mình muốn đặt nhóm 8 người tại Skyline Valley, có hỗ trợ ghép phòng không?',
    status: 'read',
    readAt: new Date('2026-05-28T10:00:00'),
  },
  {
    fullName: 'Lê Thị Hương',
    email: 'huong.le@company.vn',
    phone: null,
    message: 'Cảm ơn Cherry House đã phản hồi nhanh. Mình sẽ book qua website.',
    status: 'replied',
    readAt: new Date('2026-05-20T09:00:00'),
    adminNote: 'Đã gọi lại — khách book HXH-101',
  },
  {
    fullName: 'Spam Bot',
    email: 'spam@junk.mail',
    phone: '0000000000',
    message: 'Quảng cáo không liên quan…',
    status: 'archived',
    readAt: new Date('2026-04-01T08:00:00'),
    adminNote: 'Spam — lưu trữ',
  },
];

function branchesForProperty(property, propertyIndex) {
  const count = BRANCH_COUNTS[propertyIndex] ?? property.branches.length;
  return property.branches.slice(0, count);
}

async function wipeTransactionalAndLegacy() {
  await prisma.payment.deleteMany();
  await prisma.booking.deleteMany();
  await prisma.contactMessage.deleteMany();
  await prisma.roomTypeAmenity.deleteMany();

  const newSlugs = new Set(PROPERTIES.map((p) => p.slug));
  for (const slug of LEGACY_PROPERTY_SLUGS) {
    if (!newSlugs.has(slug)) {
      await prisma.property.deleteMany({ where: { slug } });
    }
  }

  for (const row of PROPERTIES) {
    await prisma.property.deleteMany({ where: { slug: row.slug } });
  }
}

async function seedProperties() {
  const propertyIds = {};

  for (let i = 0; i < PROPERTIES.length; i += 1) {
    const row = PROPERTIES[i];
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
      roomCount: 0,
      branchCount: 0,
      rating: row.rating,
      reviewCount: row.reviewCount,
      heroImageUrl: row.heroImageUrl,
      highlights: row.highlights,
      isActive: row.isActive !== false,
    };

    const saved = await prisma.property.create({ data });
    propertyIds[row.slug] = saved.id;
  }

  return propertyIds;
}

async function seedPropertyGalleries(propertyIds) {
  const galleryImages = [IMG.hero1, IMG.hero2, IMG.hero3];

  for (const row of PROPERTIES) {
    const propertyId = propertyIds[row.slug];
    if (!propertyId) continue;

    for (let i = 0; i < galleryImages.length; i += 1) {
      await prisma.propertyGallery.create({
        data: { propertyId, imageUrl: galleryImages[i], sortOrder: i },
      });
    }
  }
}

async function seedBranches(propertyIds) {
  const branchByKey = {};

  for (let i = 0; i < PROPERTIES.length; i += 1) {
    const row = PROPERTIES[i];
    const propertyId = propertyIds[row.slug];
    if (!propertyId) continue;

    const branches = branchesForProperty(row, i);

    for (const { lat, lng, roomQuota, roomCodePrefix, ...branch } of branches) {
      const saved = await prisma.branch.create({
        data: {
          propertyId,
          code: branch.code,
          name: branch.name,
          address: branch.address,
          tagline: branch.tagline,
          price: branch.price,
          roomCount: 0,
          imgUrl: branch.imgUrl,
          isActive: branch.isActive !== false,
        },
      });

      branchByKey[`${row.slug}:${branch.code}`] = saved;

      await prisma.branchMapPin.create({
        data: {
          branchId: saved.id,
          lat,
          lng,
          zoom: 15,
          label: saved.name,
          pinBadge: 'CH',
          pinInfo: saved.tagline,
          googleMapsUrl: `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`,
          embedUrl: null,
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
    const typeGallery = [IMG.room, IMG.hero1, IMG.hero2].filter(Boolean);
    for (let i = 0; i < typeGallery.length; i += 1) {
      await prisma.roomTypeGallery.create({
        data: { roomTypeId: saved.id, imageUrl: typeGallery[i], sortOrder: i },
      });
    }
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

  const propertyAmenityMap = {
    'cherry-dalat-centro': ['wifi', 'parking', 'breakfast', 'ac'],
    'cherry-dalat-pine-retreat': ['wifi', 'parking', 'breakfast', 'ac', 'kitchen'],
    'cherry-dalat-skyline': ['wifi', 'parking', 'breakfast', 'ac', 'pool'],
    'cherry-house-ha-noi': ['wifi', 'ac', 'kitchen', 'workspace'],
  };

  for (const [slug, icons] of Object.entries(propertyAmenityMap)) {
    const propertyId = propertyIds[slug];
    if (!propertyId) continue;
    for (const icon of icons) {
      const amenity = amenityByIcon[icon];
      if (!amenity) continue;
      await prisma.propertyAmenity.create({
        data: { propertyId, amenityId: amenity.id },
      });
    }
  }

  const roomTypeAmenityMap = {
    'standard-garden': ['wifi', 'ac', 'breakfast'],
    'deluxe-pine': ['wifi', 'ac', 'pool', 'breakfast', 'parking'],
    'suite-horizon': ['wifi', 'ac', 'breakfast', 'parking', 'workspace'],
    'penthouse-sky': ['wifi', 'ac', 'pool', 'kitchen', 'workspace'],
  };

  for (const [slug, icons] of Object.entries(roomTypeAmenityMap)) {
    const roomType = roomTypeBySlug[slug];
    if (!roomType) continue;
    for (const icon of icons) {
      const amenity = amenityByIcon[icon];
      if (!amenity) continue;
      await prisma.roomTypeAmenity.create({
        data: { roomTypeId: roomType.id, amenityId: amenity.id },
      });
    }
  }

  return amenityByIcon;
}

async function seedInventoryRooms(branchByKey, roomTypeBySlug) {
  let count = 0;

  for (const room of SAMPLE_ROOMS) {
    const branch = branchByKey[`${room.propertySlug}:${room.branchCode}`];
    const roomType = roomTypeBySlug[room.roomTypeSlug];
    if (!branch || !roomType) {
      console.warn(`Skip room ${room.code}: branch or room type not found`);
      continue;
    }

    const galleryImages = room.withGallery
      ? [IMG.room, IMG.hero1, IMG.hero2, IMG.hero3]
      : null;

    await prisma.inventoryRoom.create({
      data: {
        branchId: branch.id,
        roomTypeId: roomType.id,
        code: room.code,
        priceVnd: room.priceVnd,
        description: room.description,
        extraParagraphs: room.withGallery
          ? ['Phòng demo có gallery đầy đủ.', 'Dùng test UI chi tiết phòng.']
          : undefined,
        imageUrl: IMG.room,
        galleryImages,
        altText: room.altText,
        maxAdults: room.maxAdults,
        maxChildren: room.maxChildren,
        status: room.status,
        isActive: room.isActive !== false,
      },
    });
    count += 1;
  }

  return count;
}

async function syncAllCounts(propertyIds) {
  await Promise.all(
    Object.values(propertyIds).map((id) => catalogCountService.syncPropertyCounts(id)),
  );
}

async function seedAdmins(propertyIds, branchByKey) {
  for (const admin of SAMPLE_ADMINS) {
    const passwordHash = await hashPassword(admin.password);
    const propertyId = admin.propertySlug ? propertyIds[admin.propertySlug] : null;
    const branch = admin.branchKey ? branchByKey[admin.branchKey] : null;

    await prisma.admin.upsert({
      where: { email: admin.email },
      update: {
        fullName: admin.fullName,
        role: admin.role,
        passwordHash,
        propertyId: propertyId ?? null,
        branchId: branch?.id ?? null,
        isActive: true,
      },
      create: {
        email: admin.email,
        fullName: admin.fullName,
        role: admin.role,
        passwordHash,
        propertyId: propertyId ?? null,
        branchId: branch?.id ?? null,
        isActive: true,
      },
    });
  }
}

async function seedUsers() {
  const userByEmail = {};
  const passwordHash = await hashPassword(TEST_PASSWORD);

  for (const user of SAMPLE_USERS) {
    const { authProvider, googleId, ...rest } = user;
    const saved = await prisma.user.upsert({
      where: { email: user.email },
      update: {
        ...rest,
        authProvider,
        googleId: googleId ?? null,
        passwordHash: authProvider === 'google' ? null : passwordHash,
      },
      create: {
        ...rest,
        authProvider,
        googleId: googleId ?? null,
        passwordHash: authProvider === 'google' ? null : passwordHash,
      },
    });
    userByEmail[user.email] = saved;
  }

  return userByEmail;
}

async function seedPromos() {
  for (const promo of SAMPLE_PROMOS) {
    await prisma.promoCode.upsert({
      where: { code: promo.code },
      update: promo,
      create: promo,
    });
  }
}

async function seedEmailTemplates() {
  for (const tpl of buildDefaultTemplates()) {
    await prisma.emailTemplate.upsert({
      where: { templateKey: tpl.templateKey },
      update: {
        name: tpl.name,
        description: tpl.description,
        subject: tpl.subject,
        configJson: tpl.configJson,
        isEnabled: tpl.isEnabled,
      },
      create: tpl,
    });
  }
}

async function seedContactMessages() {
  for (const msg of CONTACT_MESSAGES) {
    await prisma.contactMessage.create({ data: msg });
  }
}

async function seedMediaLibrary() {
  const folders = [
    { name: 'hero', images: ['hero-dalat-1.jpg', 'hero-hanoi-1.jpg'] },
    { name: 'rooms', images: ['room-standard.jpg', 'room-deluxe.jpg', 'room-suite.jpg'] },
  ];

  for (const folder of folders) {
    const row = await prisma.mediaFolder.upsert({
      where: { name: folder.name },
      update: {},
      create: { name: folder.name },
    });

    await prisma.mediaImage.deleteMany({ where: { folderId: row.id } });
    for (const name of folder.images) {
      await prisma.mediaImage.create({
        data: {
          folderId: row.id,
          name,
          path: `/uploads/media/${folder.name}/${name}`,
          mimeType: 'image/jpeg',
          sizeBytes: 120_000,
        },
      });
    }
  }
}

async function seedSingletonCms() {
  const siteUrl = String(process.env.CLIENT_APP_URL || 'http://localhost:5173').replace(/\/$/, '');

  await prisma.seoGlobalSettings.upsert({
    where: { id: 1 },
    update: {},
    create: {
      id: 1,
      siteName: 'Cherry House',
      siteUrl,
      defaultTitle: 'Cherry House — Homestay & mini stay Việt Nam',
      defaultDescription:
        'Đặt phòng Cherry House tại Đà Lạt, Hà Nội và các thành phố — giá minh bạch, đồng bộ thương hiệu.',
      defaultKeywords: 'cherry house, homestay đà lạt, đặt phòng online',
      ogImageUrl: '/og_seo.png',
      themeColor: '#9f1239',
      organizationName: 'Cherry House',
      organizationEmail: 'contact@cherryhouse.vn',
      organizationAddress: 'Việt Nam',
      allowIndexing: true,
    },
  });

  const pageTemplates = [
    {
      pageKey: 'home',
      label: 'Trang chủ',
      titleTemplate: '{{siteName}} — Đặt homestay Việt Nam',
      descriptionTemplate: 'Tìm homestay, mini hotel và villa Cherry House theo thành phố.',
      sortOrder: 0,
    },
    {
      pageKey: 'properties',
      label: 'Danh sách cơ sở',
      titleTemplate: 'Cơ sở lưu trú | {{siteName}}',
      descriptionTemplate: 'Khám phá Cherry House theo địa điểm và loại hình lưu trú.',
      sortOrder: 1,
    },
    {
      pageKey: 'contact',
      label: 'Liên hệ',
      titleTemplate: 'Liên hệ | {{siteName}}',
      descriptionTemplate: 'Gửi tin nhắn cho đội ngũ Cherry House.',
      sortOrder: 2,
    },
  ];

  for (const tpl of pageTemplates) {
    await prisma.seoPageTemplate.upsert({
      where: { pageKey: tpl.pageKey },
      update: tpl,
      create: {
        ...tpl,
        robots: 'index, follow',
        isActive: true,
      },
    });
  }

  const heroDefaults = buildHomeHeroDefaults();
  await prisma.homeHeroSettings.upsert({
    where: { id: 1 },
    update: {},
    create: { id: 1, ...heroDefaults },
  });

  const homeDefaults = buildHomePageDefaults();
  await prisma.homePageSettings.upsert({
    where: { id: 1 },
    update: {},
    create: { id: 1, ...homeDefaults },
  });

  const chatDefaults = buildChatBotDefaults();
  await prisma.chatBotSettings.upsert({
    where: { id: 1 },
    update: {},
    create: { id: 1, ...chatDefaults },
  });
}

async function seedBookings(userByEmail, branchByKey, roomTypeBySlug) {
  const guest = userByEmail['guest@cherryhouse.vn'];
  const standard = userByEmail['standard@test.vn'];

  const findRoom = (propertySlug, branchCode, roomCode) =>
    SAMPLE_ROOMS.find(
      (r) => r.propertySlug === propertySlug && r.branchCode === branchCode && r.code === roomCode,
    );

  const roomSpecs = [
    {
      propertySlug: 'cherry-dalat-centro',
      branchCode: 'dl-centro-hxh',
      roomCode: 'HXH-101',
      userId: guest?.id,
      status: 'confirmed',
      payment: { method: 'momo', status: 'paid' },
      checkIn: '2026-06-10',
      checkOut: '2026-06-12',
      promoCode: 'CHERRY10',
    },
    {
      propertySlug: 'cherry-dalat-centro',
      branchCode: 'dl-centro-hxh',
      roomCode: 'HXH-102',
      userId: null,
      status: 'pending_payment',
      payment: { method: 'bank', status: 'pending' },
      checkIn: '2026-06-20',
      checkOut: '2026-06-21',
    },
    {
      propertySlug: 'cherry-dalat-skyline',
      branchCode: 'dl-sky-valley',
      roomCode: 'SKY-101',
      userId: standard?.id,
      status: 'checked_in',
      payment: { method: 'card', status: 'paid' },
      checkIn: '2026-05-30',
      checkOut: '2026-06-02',
    },
    {
      propertySlug: 'cherry-house-ha-noi',
      branchCode: 'hn-hoankiem',
      roomCode: 'HN-101',
      userId: guest?.id,
      status: 'completed',
      payment: { method: 'wallet', status: 'paid' },
      checkIn: '2026-04-01',
      checkOut: '2026-04-03',
    },
    {
      propertySlug: 'cherry-dalat-skyline',
      branchCode: 'dl-sky-valley',
      roomCode: 'SKY-102',
      userId: standard?.id,
      status: 'cancelled',
      payment: null,
      checkIn: '2026-07-01',
      checkOut: '2026-07-03',
    },
    {
      propertySlug: 'cherry-dalat-centro',
      branchCode: 'dl-centro-night',
      roomCode: 'CD-101',
      userId: null,
      status: 'no_show',
      payment: { method: 'momo', status: 'paid' },
      checkIn: '2026-03-15',
      checkOut: '2026-03-16',
    },
  ];

  let created = 0;

  for (let i = 0; i < roomSpecs.length; i += 1) {
    const spec = roomSpecs[i];
    const meta = findRoom(spec.propertySlug, spec.branchCode, spec.roomCode);
    const branch = branchByKey[`${spec.propertySlug}:${spec.branchCode}`];
    if (!meta || !branch) continue;

    const dbRoom = await prisma.inventoryRoom.findUnique({
      where: { branchId_code: { branchId: branch.id, code: spec.roomCode } },
      include: { branch: { include: { property: true } }, roomType: true },
    });
    if (!dbRoom) continue;

    const checkIn = new Date(spec.checkIn);
    const checkOut = new Date(spec.checkOut);
    const nights = Math.round((checkOut - checkIn) / (24 * 60 * 60 * 1000));
    const subtotal = dbRoom.priceVnd * nights;
    const discount = spec.promoCode === 'CHERRY10' ? Math.round(subtotal * 0.1) : 0;
    const total = subtotal - discount;

    const booking = await prisma.booking.create({
      data: {
        bookingCode: `CH-SEED-${String(i + 1).padStart(3, '0')}`,
        userId: spec.userId,
        roomId: dbRoom.id,
        propertyId: dbRoom.branch.propertyId,
        branchId: dbRoom.branchId,
        roomTypeId: dbRoom.roomTypeId,
        roomCode: dbRoom.code,
        propertyName: dbRoom.branch.property.name,
        branchName: dbRoom.branch.name,
        checkIn,
        checkOut,
        nights,
        adults: 2,
        children: 0,
        guestName: spec.userId ? guest?.fullName || 'Khách seed' : 'Khách walk-in',
        guestPhone: '0909000000',
        guestEmail: spec.userId ? guest?.email || 'guest@test.vn' : 'walkin@test.vn',
        specialNote: i === 0 ? 'Muốn check-in sớm 13h (seed)' : null,
        pricePerNightVnd: dbRoom.priceVnd,
        subtotalVnd: subtotal,
        serviceFeeVnd: 0,
        discountVnd: discount,
        totalVnd: total,
        promoCode: spec.promoCode || null,
        status: spec.status,
      },
    });

    if (spec.payment) {
      await prisma.payment.create({
        data: {
          bookingId: booking.id,
          method: spec.payment.method,
          amountVnd: total,
          status: spec.payment.status,
          providerRef: spec.payment.status === 'paid' ? `seed-pay-${booking.id}` : null,
          paidAt: spec.payment.status === 'paid' ? new Date() : null,
        },
      });
    }

    created += 1;
  }

  return created;
}

async function main() {
  console.log('Cherry House seed — bộ test 4 cơ sở (3 Đà Lạt + 1 Hà Nội)…');

  await wipeTransactionalAndLegacy();

  const propertyIds = await seedProperties();
  await seedPropertyGalleries(propertyIds);
  const branchByKey = await seedBranches(propertyIds);
  const roomTypeBySlug = await seedRoomTypes();
  await seedAmenities(propertyIds, roomTypeBySlug);
  const roomCount = await seedInventoryRooms(branchByKey, roomTypeBySlug);
  await syncAllCounts(propertyIds);

  await seedAdmins(propertyIds, branchByKey);
  const userByEmail = await seedUsers();
  await seedPromos();
  await seedEmailTemplates();
  await seedContactMessages();
  await seedMediaLibrary();
  await seedSingletonCms();
  const bookingCount = await seedBookings(userByEmail, branchByKey, roomTypeBySlug);

  const totalBranches = Object.keys(branchByKey).length;
  const totalRooms = SAMPLE_ROOMS.length;

  console.log(
    [
      'Seed completed:',
      `${PROPERTIES.length} cơ sở`,
      `${totalBranches} chi nhánh`,
      `${roomCount}/${totalRooms} phòng`,
      `${bookingCount} booking`,
      `${SAMPLE_USERS.length} users`,
      `${SAMPLE_ADMINS.length} admins`,
      `${SAMPLE_PROMOS.length} promo`,
      `${CONTACT_MESSAGES.length} contact messages`,
    ].join(' · '),
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
