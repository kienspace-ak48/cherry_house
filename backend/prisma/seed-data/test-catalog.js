/**
 * Bộ seed test Cherry House — 4 cơ sở (mỗi tỉnh/thành 1 cơ sở).
 * Đà Lạt · Hà Nội · Sa Pa · Vũng Tàu — chi nhánh 1–2/cơ sở · 10–20 phòng · giá VN.
 */

const IMG = {
  hero1: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80',
  hero2: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1200&q=80',
  hero3: 'https://images.unsplash.com/photo-1560448204-e02f11c45751?auto=format&fit=crop&w=1200&q=80',
  hero4: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=1200&q=80',
  room: 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?auto=format&fit=crop&w=1200&q=80',
};

/** Số chi nhánh seed mỗi cơ sở (theo thứ tự PROPERTIES) */
const BRANCH_COUNTS = [2, 2, 2, 1];

function mapsSearchUrl(address, city) {
  const q = encodeURIComponent(`${address}, ${city}, Việt Nam`);
  return `https://www.google.com/maps/search/?api=1&query=${q}`;
}

const PROPERTIES = [
  {
    slug: 'cherry-house-da-lat',
    name: 'Cherry House Đà Lạt',
    city: 'Đà Lạt',
    region: 'Lâm Đồng',
    kind: 'homestay',
    tagline: 'Homestay giữa thành phố ngàn hoa',
    description:
      'Cherry House Đà Lạt — homestay ấm cúng gần hồ Xuân Hương và khu Đồi Thông. Phù hợp nghỉ cuối tuần và couple trip.',
    address: 'TP. Đà Lạt, Lâm Đồng',
    priceFromVnd: 750_000,
    rating: 4.8,
    reviewCount: 328,
    heroImageUrl: IMG.hero2,
    highlights: ['Gần hồ Xuân Hương', 'Khí hậu mát', 'Bữa sáng địa phương'],
    isActive: true,
    targetRoomCount: 15,
    branches: [
      {
        code: 'dl-hxh',
        name: 'Chi nhánh Hồ Xuân Hương',
        address: '01 Trần Phú, Phường 1, TP. Đà Lạt, Lâm Đồng',
        tagline: 'Đi bộ 5 phút tới hồ Xuân Hương',
        price: 750_000,
        roomQuota: 8,
        roomCodePrefix: 'HXH',
        lat: 11.940419,
        lng: 108.458313,
        imgUrl: IMG.hero2,
        isActive: true,
      },
      {
        code: 'dl-dt',
        name: 'Chi nhánh Đồi Thông',
        address: '192 Huỳnh Thúc Kháng, Phường 10, TP. Đà Lạt, Lâm Đồng',
        tagline: 'View rừng thông, yên tĩnh',
        price: 890_000,
        roomQuota: 7,
        roomCodePrefix: 'DT',
        lat: 11.951912,
        lng: 108.441024,
        imgUrl: IMG.hero3,
        isActive: true,
      },
    ],
  },
  {
    slug: 'cherry-house-ha-noi',
    name: 'Cherry House Hà Nội',
    city: 'Hà Nội',
    region: 'Hà Nội',
    kind: 'serviced_apartment',
    tagline: 'Căn hộ dịch vụ gần Hồ Gươm & Tây Hồ',
    description:
      'Cherry House Hà Nội — căn hộ dịch vụ tiện nghi tại Hoàn Kiếm và Tây Hồ, phù hợp công tác và city break.',
    address: 'Quận Hoàn Kiếm & Tây Hồ, Hà Nội',
    priceFromVnd: 850_000,
    rating: 4.6,
    reviewCount: 412,
    heroImageUrl: IMG.hero2,
    highlights: ['Gần Hồ Gươm', 'Bếp riêng', 'Workspace'],
    isActive: true,
    targetRoomCount: 12,
    branches: [
      {
        code: 'hn-hk',
        name: 'Chi nhánh Hoàn Kiếm',
        address: '15 Hàng Gai, Phường Hàng Gai, Quận Hoàn Kiếm, Hà Nội',
        tagline: 'Đi bộ tới Hồ Hoàn Kiếm',
        price: 850_000,
        roomQuota: 7,
        roomCodePrefix: 'HK',
        lat: 21.028511,
        lng: 105.854244,
        imgUrl: IMG.hero2,
        isActive: true,
      },
      {
        code: 'hn-th',
        name: 'Chi nhánh Tây Hồ',
        address: '6 Xuân Diệu, Phường Quảng An, Quận Tây Hồ, Hà Nội',
        tagline: 'View hồ Tây buổi sáng',
        price: 980_000,
        roomQuota: 5,
        roomCodePrefix: 'TH',
        lat: 21.066278,
        lng: 105.818756,
        imgUrl: IMG.hero1,
        isActive: false,
      },
    ],
  },
  {
    slug: 'cherry-house-sapa',
    name: 'Cherry House Sa Pa',
    city: 'Sa Pa',
    region: 'Lào Cai',
    kind: 'homestay',
    tagline: 'View Fansipan — homestay giữa núi rừng Tây Bắc',
    description:
      'Cherry House Sa Pa nằm gần trung tâm thị trấn và khu Fansipan Legend. Lý tưởng cho trek và nghỉ cuối tuần miền núi.',
    address: 'TT. Sa Pa, Huyện Sa Pa, Lào Cai',
    priceFromVnd: 680_000,
    rating: 4.7,
    reviewCount: 198,
    heroImageUrl: IMG.hero3,
    highlights: ['View thung lũng', 'Gần Cầu Mây', 'Bữa sáng địa phương'],
    isActive: true,
    targetRoomCount: 14,
    branches: [
      {
        code: 'sp-cm',
        name: 'Cherry Sa Pa Cầu Mây',
        address: '33 Cầu Mây, TT. Sa Pa, Huyện Sa Pa, Lào Cai',
        tagline: 'Gần chợ & quảng trường Sa Pa',
        price: 680_000,
        roomQuota: 8,
        roomCodePrefix: 'SPA',
        lat: 22.336358,
        lng: 103.843789,
        imgUrl: IMG.hero3,
        isActive: true,
      },
      {
        code: 'sp-fan',
        name: 'Cherry Fansipan View',
        address: '51 Fansipan, TT. Sa Pa, Huyện Sa Pa, Lào Cai',
        tagline: 'View Fansipan Legend',
        price: 820_000,
        roomQuota: 6,
        roomCodePrefix: 'FAN',
        lat: 22.328912,
        lng: 103.840128,
        imgUrl: IMG.hero4,
        isActive: true,
      },
    ],
  },
  {
    slug: 'cherry-villa-vung-tau',
    name: 'Cherry Villa Vũng Tàu',
    city: 'Vũng Tàu',
    region: 'Bà Rịa - Vũng Tàu',
    kind: 'villa',
    tagline: 'Villa view biển Bãi Sau — BBQ & hồ bơi riêng',
    description:
      'Cherry Villa Vũng Tàu — nguyên căn và phòng villa ven biển Bãi Sau, phù hợp nhóm bạn và gia đình cuối tuần biển.',
    address: '118 Thùy Vân, Phường 8, TP. Vũng Tàu, Bà Rịa - Vũng Tàu',
    priceFromVnd: 2_400_000,
    rating: 4.9,
    reviewCount: 87,
    heroImageUrl: IMG.hero4,
    highlights: ['View biển Bãi Sau', 'Hồ bơi riêng', 'BBQ ngoài trời'],
    isActive: true,
    targetRoomCount: 10,
    branches: [
      {
        code: 'vt-sea',
        name: 'Villa Bãi Sau',
        address: '118 Thùy Vân, Phường 8, TP. Vũng Tàu, Bà Rịa - Vũng Tàu',
        tagline: 'Panorama biển Đông',
        price: 2_400_000,
        roomQuota: 10,
        roomCodePrefix: 'VT',
        lat: 10.346012,
        lng: 107.084318,
        imgUrl: IMG.hero4,
        isActive: true,
      },
    ],
  },
];

const ROOM_TYPES = [
  {
    slug: 'standard-garden',
    badge: 'Phổ thông',
    title: 'Standard Garden View',
    category: 'Standard',
    areaSqm: 22,
    bedLabel: '1 giường đôi',
    capacityLabel: '2 người lớn',
    basePriceVnd: 750_000,
    paragraphs: ['Phòng tiêu chuẩn view vườn hoặc phố.', 'Phù hợp cặp đôi hoặc solo.'],
    policyBullets: ['Check-in 14:00', 'Check-out 12:00', 'Không hút thuốc'],
    isActive: true,
  },
  {
    slug: 'deluxe-pine',
    badge: 'Cao cấp',
    title: 'Deluxe Pine View',
    category: 'Deluxe',
    areaSqm: 32,
    bedLabel: '1 giường king',
    capacityLabel: '2 người lớn + 1 trẻ em',
    basePriceVnd: 1_050_000,
    paragraphs: ['Phòng deluxe rộng hơn, view thông hoặc thung lũng.'],
    policyBullets: ['Check-in 14:00', 'Miễn phí bãi đỗ xe'],
    isActive: true,
  },
  {
    slug: 'suite-horizon',
    badge: 'Suite',
    title: 'Suite Horizon',
    category: 'Suite',
    areaSqm: 45,
    bedLabel: '1 giường king + sofa bed',
    capacityLabel: '3 người lớn + 1 trẻ em',
    basePriceVnd: 1_450_000,
    paragraphs: ['Suite có khu khách riêng và ban công rộng.'],
    policyBullets: ['Check-in 14:00', 'Late check-out theo yêu cầu'],
    isActive: true,
  },
  {
    slug: 'penthouse-sky',
    badge: 'Penthouse',
    title: 'Penthouse Skyline',
    category: 'Penthouse',
    areaSqm: 68,
    bedLabel: '2 phòng ngủ',
    capacityLabel: '4 người lớn',
    basePriceVnd: 2_800_000,
    paragraphs: ['Penthouse tầng cao — panorama.'],
    policyBullets: ['Check-in 15:00', 'Butler on-call (demo)'],
    isActive: false,
  },
];

const AMENITIES = [
  { icon: 'wifi', label: 'Wi-Fi miễn phí' },
  { icon: 'parking', label: 'Bãi đỗ xe' },
  { icon: 'breakfast', label: 'Bữa sáng' },
  { icon: 'ac', label: 'Điều hòa' },
  { icon: 'pool', label: 'Hồ bơi' },
  { icon: 'kitchen', label: 'Bếp riêng' },
  { icon: 'workspace', label: 'Bàn làm việc' },
];

const ROOM_TYPE_SLUGS = ROOM_TYPES.map((rt) => rt.slug);

/** Slug cơ sở cũ — xóa khi seed lại */
const LEGACY_PROPERTY_SLUGS = [
  'cherry-dalat-centro',
  'cherry-dalat-pine-retreat',
  'cherry-dalat-skyline',
  'cherry-house-sapa',
  'cherry-retreat-ninh-binh',
  'cherry-house-da-nang',
  'cherry-house-hoi-an',
  'cherry-apartment-hue',
  'cherry-house-nha-trang',
  'cherry-house-saigon',
  'cherry-villa-da-lat',
];

function generateInventoryRooms() {
  const rooms = [];
  const typePrices = {
    'standard-garden': 0,
    'deluxe-pine': 200_000,
    'suite-horizon': 450_000,
    'penthouse-sky': 1_200_000,
  };

  for (const prop of PROPERTIES) {
    for (const branch of prop.branches) {
      for (let i = 1; i <= branch.roomQuota; i += 1) {
        const floor = Math.ceil(i / 4);
        const roomNum = floor * 100 + ((i - 1) % 4) + 1;
        const code = `${branch.roomCodePrefix}-${roomNum}`;
        const typeSlug = ROOM_TYPE_SLUGS[i % ROOM_TYPE_SLUGS.length];
        const priceVnd = branch.price + (typePrices[typeSlug] || 0) + (i % 3) * 30_000;
        let status = 'available';
        if (i % 11 === 0) status = 'booked';
        else if (i % 7 === 0) status = 'pending';

        rooms.push({
          propertySlug: prop.slug,
          branchCode: branch.code,
          code,
          roomTypeSlug: typeSlug,
          priceVnd,
          description: `Phòng ${code} — ${prop.city}, tầng ${floor}.`,
          altText: `${typeSlug} ${code}`,
          status,
          isActive: !(prop.slug === 'cherry-house-ha-noi' && branch.code === 'hn-th' && i === branch.roomQuota),
          maxAdults: typeSlug === 'penthouse-sky' ? 4 : typeSlug === 'suite-horizon' ? 3 : 2,
          maxChildren: typeSlug === 'standard-garden' ? 0 : 1,
          withGallery: prop.slug === 'cherry-house-da-lat' && code === 'HXH-101',
        });
      }
    }
  }

  return rooms;
}

const SAMPLE_ROOMS = generateInventoryRooms();

module.exports = {
  IMG,
  BRANCH_COUNTS,
  PROPERTIES,
  SAMPLE_ROOMS,
  ROOM_TYPES,
  AMENITIES,
  LEGACY_PROPERTY_SLUGS,
  generateInventoryRooms,
  mapsSearchUrl,
};
