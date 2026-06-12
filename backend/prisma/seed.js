const path = require('path');

require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const { PrismaClient } = require('../src/generated/prisma');
const { createMariaDbAdapter } = require('../src/config/mariadb.config');
const {
  IMG,
  BRANCH_COUNTS,
  PROPERTIES,
  SAMPLE_ROOMS,
  ROOM_TYPES,
  AMENITIES,
  mapsSearchUrl,
} = require('./seed-data/test-catalog');

const { resetSeedData } = require('./reset-data');
const { hashPassword } = require('../src/utils/hashPassword.util');
const { buildDefaultTemplates } = require('../src/config/emailTemplate.defaults');
const catalogCountService = require('../src/services/catalogCount.service');
const { buildDefaultSettings: buildHomeHeroDefaults } = require('../src/services/homeHero.service');
const { buildDefaultSettings: buildHomePageDefaults } = require('../src/services/homePage.service');
const { buildDefaultSettings: buildChatBotDefaults } = require('../src/services/chatBotConfig.service');

const prisma = new PrismaClient({ adapter: createMariaDbAdapter() });

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
    fullName: 'NV Lễ tân Đà Lạt',
    role: 'staff',
    password: 'Staff@123',
    propertySlug: 'cherry-house-da-lat',
    branchKey: 'cherry-house-da-lat:dl-hxh',
  },
  {
    email: 'staff.sapa@cherryhouse.vn',
    fullName: 'NV Sa Pa',
    role: 'staff',
    password: 'Staff@123',
    propertySlug: 'cherry-house-sapa',
    branchKey: 'cherry-house-sapa:sp-cm',
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
    message: 'Cherry Đà Lạt còn phòng cuối tuần 15–16/6 không ạ?',
    status: 'new',
    createdAt: new Date('2026-06-01T09:15:00'),
  },
  {
    fullName: 'Trần Quốc Bảo',
    email: 'guest@cherryhouse.vn',
    phone: '0901234567',
    message: 'Nhóm 8 người đi Sa Pa tháng 5 — có ghép phòng tại Cầu Mây không?',
    status: 'read',
    readAt: new Date('2026-05-22T10:00:00'),
    createdAt: new Date('2026-05-21T14:30:00'),
  },
  {
    fullName: 'Lê Thị Hương',
    email: 'huong.le@company.vn',
    phone: null,
    message: 'Cảm ơn đã tư vấn villa Vũng Tàu. Mình đã book tháng 5.',
    status: 'replied',
    readAt: new Date('2026-05-18T09:00:00'),
    adminNote: 'Đã gọi lại — khách book VT-101 (tháng 5)',
    createdAt: new Date('2026-05-17T11:20:00'),
  },
  {
    fullName: 'Phạm Văn Đức',
    email: 'duc.pham@corp.vn',
    phone: '0919888777',
    message: 'Hỏi giá phòng Deluxe tại Cherry House Hà Nội Hoàn Kiếm.',
    status: 'read',
    readAt: new Date('2026-05-08T16:00:00'),
    createdAt: new Date('2026-05-08T08:45:00'),
  },
  {
    fullName: 'Spam Bot',
    email: 'spam@junk.mail',
    phone: '0000000000',
    message: 'Quảng cáo không liên quan…',
    status: 'archived',
    readAt: new Date('2026-05-02T08:00:00'),
    adminNote: 'Spam — lưu trữ',
    createdAt: new Date('2026-05-01T23:10:00'),
  },
];

function branchesForProperty(property, propertyIndex) {
  const count = BRANCH_COUNTS[propertyIndex] ?? property.branches.length;
  return property.branches.slice(0, count);
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

      const googleMapsUrl = mapsSearchUrl(branch.address, row.city);
      await prisma.branchMapPin.create({
        data: {
          branchId: saved.id,
          lat,
          lng,
          zoom: 15,
          label: saved.name,
          pinBadge: 'CH',
          pinInfo: branch.address,
          googleMapsUrl,
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
    'cherry-house-da-lat': ['wifi', 'parking', 'breakfast', 'ac'],
    'cherry-house-ha-noi': ['wifi', 'ac', 'kitchen', 'workspace'],
    'cherry-house-sapa': ['wifi', 'parking', 'breakfast', 'ac'],
    'cherry-villa-vung-tau': ['wifi', 'parking', 'pool', 'kitchen'],
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
    const { createdAt, ...data } = msg;
    await prisma.contactMessage.create({
      data: {
        ...data,
        ...(createdAt ? { createdAt } : {}),
      },
    });
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

  await prisma.promoPopupSettings.upsert({
    where: { id: 1 },
    update: {},
    create: {
      id: 1,
      isEnabled: false,
      selectionMode: 'manual',
      promoCodeId: null,
      discountTypeFilter: 'all',
      title: 'Ưu đãi Cherry House',
      message: null,
      ctaLabel: 'Sao chép mã',
      delaySec: 2,
      dismissHours: 24,
      showOnRoutesJson: JSON.stringify(['all']),
    },
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
    // --- Tháng 5/2026 (lịch sử) ---
    {
      propertySlug: 'cherry-house-da-lat',
      branchCode: 'dl-hxh',
      roomCode: 'HXH-103',
      userId: guest?.id,
      status: 'completed',
      payment: { method: 'momo', status: 'paid' },
      checkIn: '2026-05-05',
      checkOut: '2026-05-07',
      createdAt: '2026-05-01T10:00:00',
      paidAt: '2026-05-01T10:05:00',
    },
    {
      propertySlug: 'cherry-house-sapa',
      branchCode: 'sp-cm',
      roomCode: 'SPA-101',
      userId: standard?.id,
      status: 'completed',
      payment: { method: 'card', status: 'paid' },
      checkIn: '2026-05-12',
      checkOut: '2026-05-14',
      createdAt: '2026-05-08T14:00:00',
      paidAt: '2026-05-08T14:10:00',
    },
    {
      propertySlug: 'cherry-villa-vung-tau',
      branchCode: 'vt-sea',
      roomCode: 'VT-101',
      userId: guest?.id,
      status: 'completed',
      payment: { method: 'bank', status: 'paid' },
      checkIn: '2026-05-20',
      checkOut: '2026-05-22',
      promoCode: 'SAVE100K',
      createdAt: '2026-05-15T09:30:00',
      paidAt: '2026-05-15T09:45:00',
    },
    {
      propertySlug: 'cherry-house-ha-noi',
      branchCode: 'hn-hk',
      roomCode: 'HK-102',
      userId: null,
      status: 'no_show',
      payment: { method: 'momo', status: 'paid' },
      checkIn: '2026-05-18',
      checkOut: '2026-05-19',
      createdAt: '2026-05-10T11:00:00',
      paidAt: '2026-05-10T11:02:00',
    },
    {
      propertySlug: 'cherry-house-sapa',
      branchCode: 'sp-fan',
      roomCode: 'FAN-102',
      userId: standard?.id,
      status: 'cancelled',
      payment: null,
      checkIn: '2026-05-25',
      checkOut: '2026-05-27',
      createdAt: '2026-05-20T16:00:00',
    },
    {
      propertySlug: 'cherry-house-da-lat',
      branchCode: 'dl-dt',
      roomCode: 'DT-101',
      userId: guest?.id,
      status: 'cancelled',
      payment: { method: 'momo', status: 'refunded' },
      refundDemo: true,
      checkIn: '2026-05-28',
      checkOut: '2026-05-30',
      createdAt: '2026-05-22T08:00:00',
      paidAt: '2026-05-22T08:05:00',
    },
    // --- Tháng 6/2026 (hiện tại) ---
    {
      propertySlug: 'cherry-house-da-lat',
      branchCode: 'dl-hxh',
      roomCode: 'HXH-101',
      userId: guest?.id,
      status: 'confirmed',
      payment: { method: 'momo', status: 'paid' },
      checkIn: '2026-06-10',
      checkOut: '2026-06-12',
      promoCode: 'CHERRY10',
      createdAt: '2026-06-01T12:00:00',
      paidAt: '2026-06-01T12:03:00',
    },
    {
      propertySlug: 'cherry-house-sapa',
      branchCode: 'sp-cm',
      roomCode: 'SPA-102',
      userId: guest?.id,
      status: 'confirmed',
      payment: { method: 'card', status: 'paid' },
      checkIn: '2026-07-15',
      checkOut: '2026-07-17',
      createdAt: '2026-06-01T14:00:00',
      paidAt: '2026-06-01T14:05:00',
    },
    {
      propertySlug: 'cherry-house-da-lat',
      branchCode: 'dl-hxh',
      roomCode: 'HXH-102',
      userId: null,
      status: 'pending_payment',
      payment: { method: 'bank', status: 'pending' },
      checkIn: '2026-06-20',
      checkOut: '2026-06-21',
      createdAt: '2026-06-02T15:00:00',
    },
    {
      propertySlug: 'cherry-villa-vung-tau',
      branchCode: 'vt-sea',
      roomCode: 'VT-102',
      userId: standard?.id,
      status: 'checked_in',
      payment: { method: 'card', status: 'paid' },
      checkIn: '2026-06-01',
      checkOut: '2026-06-03',
      createdAt: '2026-05-28T10:00:00',
      paidAt: '2026-05-28T10:08:00',
    },
    {
      propertySlug: 'cherry-house-ha-noi',
      branchCode: 'hn-hk',
      roomCode: 'HK-101',
      userId: guest?.id,
      status: 'draft',
      payment: null,
      checkIn: '2026-06-25',
      checkOut: '2026-06-27',
      createdAt: '2026-06-03T09:00:00',
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
    let discount = 0;
    if (spec.promoCode === 'CHERRY10') discount = Math.round(subtotal * 0.1);
    if (spec.promoCode === 'SAVE100K') discount = 100_000;
    const total = Math.max(0, subtotal - discount);

    const guestUser = spec.userId
      ? [guest, standard].find((u) => u?.id === spec.userId)
      : null;

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
        guestName: guestUser?.fullName || 'Khách walk-in',
        guestPhone: guestUser?.phone || '0909000000',
        guestEmail: guestUser?.email || 'walkin@test.vn',
        specialNote: spec.status === 'confirmed' ? 'Muốn check-in sớm 13h (seed)' : null,
        pricePerNightVnd: dbRoom.priceVnd,
        subtotalVnd: subtotal,
        serviceFeeVnd: 0,
        discountVnd: discount,
        totalVnd: total,
        promoCode: spec.promoCode || null,
        status: spec.status,
        ...(spec.createdAt ? { createdAt: new Date(spec.createdAt) } : {}),
      },
    });

    let paymentRow = null;
    if (spec.payment) {
      const paidAt = spec.paidAt ? new Date(spec.paidAt) : null;
      paymentRow = await prisma.payment.create({
        data: {
          bookingId: booking.id,
          method: spec.payment.method,
          amountVnd: total,
          status: spec.payment.status,
          providerRef: ['paid', 'refunded'].includes(spec.payment.status)
            ? `seed-pay-${booking.id}`
            : null,
          paidAt: paidAt || (spec.payment.status === 'paid' ? new Date() : null),
        },
      });
    }

    if (spec.refundDemo && spec.userId && paymentRow?.status === 'refunded') {
      await prisma.bookingRefund.create({
        data: {
          bookingId: booking.id,
          userId: spec.userId,
          refundPercent: 100,
          refundAmountVnd: total,
          policyCode: 'before_24h_full',
          destination: 'wallet',
          status: 'completed',
          cancelledBy: 'user',
          hoursBeforeCheckIn: 120,
        },
      });
    }

    created += 1;
  }

  return created;
}

async function seedUserWallets(userByEmail) {
  const guest = userByEmail['guest@cherryhouse.vn'];
  if (!guest) return 0;

  const refundedBooking = await prisma.booking.findFirst({
    where: { bookingCode: 'CH-SEED-006', userId: guest.id, status: 'cancelled' },
    include: { payment: true },
  });

  const refundAmount = refundedBooking?.totalVnd ?? 0;
  const openingBalance = 500_000 + refundAmount;

  const wallet = await prisma.userWallet.upsert({
    where: { userId: guest.id },
    update: { balanceVnd: openingBalance },
    create: { userId: guest.id, balanceVnd: openingBalance },
  });

  await prisma.walletTransaction.deleteMany({ where: { userId: guest.id } });

  let balance = 0;
  if (refundAmount > 0 && refundedBooking) {
    balance = refundAmount;
    await prisma.walletTransaction.create({
      data: {
        userId: guest.id,
        amountVnd: refundAmount,
        balanceAfterVnd: balance,
        type: 'refund',
        bookingId: refundedBooking.id,
        note: `Hoàn tiền hủy ${refundedBooking.bookingCode}`,
      },
    });
  }

  const topUp = openingBalance - balance;
  if (topUp > 0) {
    balance += topUp;
    await prisma.walletTransaction.create({
      data: {
        userId: guest.id,
        amountVnd: topUp,
        balanceAfterVnd: balance,
        type: 'admin_adjust',
        note: 'Seed — số dư khởi tạo demo',
      },
    });
  }

  if (wallet.balanceVnd !== balance) {
    await prisma.userWallet.update({
      where: { userId: guest.id },
      data: { balanceVnd: balance },
    });
  }

  return 1;
}

async function main() {
  console.log('Cherry House seed — 4 cơ sở (Đà Lạt · Hà Nội · Sa Pa · Vũng Tàu)…');

  await resetSeedData(prisma);

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
  const walletCount = await seedUserWallets(userByEmail);

  const totalBranches = Object.keys(branchByKey).length;
  const totalRooms = SAMPLE_ROOMS.length;

  console.log(
    [
      'Seed completed:',
      `${PROPERTIES.length} cơ sở`,
      `${totalBranches} chi nhánh`,
      `${roomCount}/${totalRooms} phòng`,
      `${bookingCount} booking`,
      `${walletCount} wallet`,
      `${SAMPLE_USERS.length} users`,
      `${SAMPLE_ADMINS.length} admins`,
      'booking tháng 5+6',
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
