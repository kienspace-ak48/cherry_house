/**
 * Bộ seed test Cherry House — 4 cơ sở (3 Đà Lạt + 1 Hà Nội).
 * Chi nhánh 1–2/cơ sở · 10–20 phòng/cơ sở · giá VN thực tế.
 */

const IMG = {
  hero1: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80',
  hero2: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1200&q=80',
  hero3: 'https://images.unsplash.com/photo-1560448204-e02f11c45751?auto=format&fit=crop&w=1200&q=80',
  hero4: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=1200&q=80',
  room: 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?auto=format&fit=crop&w=1200&q=80',
};

/** Số chi nhánh seed mỗi cơ sở (theo thứ tự PROPERTIES) */
const BRANCH_COUNTS = [2, 1, 2, 1];

const PROPERTIES = [
  {
    slug: 'cherry-dalat-centro',
    name: 'Cherry House Đà Lạt Centro',
    city: 'Đà Lạt',
    region: 'Lâm Đồng',
    kind: 'homestay',
    tagline: 'Homestay trung tâm — gần chợ & hồ Xuân Hương',
    description:
      'Cherry House Đà Lạt Centro là cụm homestay ấm cúng giữa trung tâm thành phố ngàn hoa. Phù hợp couple trip và nghỉ cuối tuần.',
    address: 'P. 1, TP. Đà Lạt, Lâm Đồng',
    priceFromVnd: 750_000,
    rating: 4.8,
    reviewCount: 186,
    heroImageUrl: IMG.hero2,
    highlights: ['Gần hồ Xuân Hương', 'Bữa sáng địa phương', 'Sân vườn nhỏ'],
    isActive: true,
    targetRoomCount: 14,
    branches: [
      {
        code: 'dl-centro-hxh',
        name: 'Chi nhánh Hồ Xuân Hương',
        address: 'Đường Trần Phú, P. 1, Đà Lạt',
        tagline: 'Đi bộ 5 phút tới hồ',
        price: 750_000,
        roomQuota: 8,
        roomCodePrefix: 'HXH',
        lat: 11.9404,
        lng: 108.4583,
        imgUrl: IMG.hero2,
        isActive: true,
      },
      {
        code: 'dl-centro-night',
        name: 'Chi nhánh Chợ Đêm',
        address: 'Khu Hòa Bình, P. 1, Đà Lạt',
        tagline: 'Gần chợ đêm & quán cà phê',
        price: 820_000,
        roomQuota: 6,
        roomCodePrefix: 'CD',
        lat: 11.9452,
        lng: 108.4421,
        imgUrl: IMG.hero3,
        isActive: true,
      },
    ],
  },
  {
    slug: 'cherry-dalat-pine-retreat',
    name: 'Cherry Pine Retreat Đà Lạt',
    city: 'Đà Lạt',
    region: 'Lâm Đồng',
    kind: 'homestay',
    tagline: 'View đồi thông — yên tĩnh, riêng tư',
    description:
      'Khu homestay view rừng thông phía bắc Đà Lạt. Lý tưởng cho khách thích không gian xanh và không ồn ào.',
    address: 'Khu Đồi Thông, P. 10, TP. Đà Lạt',
    priceFromVnd: 890_000,
    rating: 4.7,
    reviewCount: 94,
    heroImageUrl: IMG.hero3,
    highlights: ['View thông', 'Ban công riêng', 'BBQ ngoài trời'],
    isActive: false,
    targetRoomCount: 12,
    branches: [
      {
        code: 'dl-pine-main',
        name: 'Cherry Pine Main',
        address: 'Khu Đồi Thông, P. 10',
        tagline: 'Homestay trong rừng thông',
        price: 890_000,
        roomQuota: 12,
        roomCodePrefix: 'PINE',
        lat: 11.9521,
        lng: 108.4412,
        imgUrl: IMG.hero3,
        isActive: true,
      },
    ],
  },
  {
    slug: 'cherry-dalat-skyline',
    name: 'Cherry Skyline Đà Lạt',
    city: 'Đà Lạt',
    region: 'Lâm Đồng',
    kind: 'mini_hotel',
    tagline: 'Mini hotel view thung lũng & trung tâm mới',
    description:
      'Cherry Skyline là mini hotel 2 tầng với phòng Deluxe/Suite, phục vụ khách công tác và gia đình nhỏ tại Đà Lạt.',
    address: 'P. 3 & P. 8, TP. Đà Lạt',
    priceFromVnd: 980_000,
    rating: 4.9,
    reviewCount: 241,
    heroImageUrl: IMG.hero1,
    highlights: ['Thang máy', 'Lobby cafe', 'Parking miễn phí'],
    isActive: true,
    targetRoomCount: 18,
    branches: [
      {
        code: 'dl-sky-valley',
        name: 'Skyline Valley',
        address: 'P. 8, Đà Lạt',
        tagline: 'View thung lũng sương mù',
        price: 980_000,
        roomQuota: 10,
        roomCodePrefix: 'SKY',
        lat: 11.9612,
        lng: 108.4522,
        imgUrl: IMG.hero1,
        isActive: true,
      },
      {
        code: 'dl-sky-urban',
        name: 'Skyline Urban',
        address: 'P. 3, Đà Lạt',
        tagline: 'Gần khu hành chính mới',
        price: 1_050_000,
        roomQuota: 8,
        roomCodePrefix: 'URB',
        lat: 11.9338,
        lng: 108.4375,
        imgUrl: IMG.hero2,
        isActive: false,
      },
    ],
  },
  {
    slug: 'cherry-house-ha-noi',
    name: 'Cherry House Hà Nội',
    city: 'Hà Nội',
    region: 'Hà Nội',
    kind: 'serviced_apartment',
    tagline: 'Căn hộ dịch vụ gần Hồ Gươm — city break & công tác',
    description:
      'Cherry House Hà Nội cung cấp căn hộ dịch vụ tiện nghi tại Hoàn Kiếm, phù hợp lưu trú ngắn và trung hạn.',
    address: 'P. Hàng Gai, Quận Hoàn Kiếm, Hà Nội',
    priceFromVnd: 850_000,
    rating: 4.6,
    reviewCount: 312,
    heroImageUrl: IMG.hero2,
    highlights: ['Gần Hồ Gươm', 'Bếp riêng', 'Workspace'],
    isActive: true,
    targetRoomCount: 11,
    branches: [
      {
        code: 'hn-hoankiem',
        name: 'Chi nhánh Hoàn Kiếm',
        address: 'P. Hàng Gai, Hoàn Kiếm',
        tagline: 'Đi bộ tới Hồ Gươm',
        price: 850_000,
        roomQuota: 11,
        roomCodePrefix: 'HN',
        lat: 21.0285,
        lng: 105.8542,
        imgUrl: IMG.hero2,
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
    paragraphs: ['Penthouse tầng cao — panorama Đà Lạt.'],
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

/** Slug cơ sở cũ (catalog 10 tỉnh) — xóa khi seed lại */
const LEGACY_PROPERTY_SLUGS = [
  'cherry-house-ha-noi',
  'cherry-house-sapa',
  'cherry-retreat-ninh-binh',
  'cherry-house-da-nang',
  'cherry-house-hoi-an',
  'cherry-apartment-hue',
  'cherry-house-nha-trang',
  'cherry-house-da-lat',
  'cherry-villa-vung-tau',
  'cherry-house-saigon',
  'cherry-villa-da-lat',
];

/**
 * Sinh phòng inventory theo quota từng chi nhánh.
 * Trạng thái: available / pending / booked · một số phòng isActive=false.
 */
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
          description: `Phòng ${code} — ${prop.city}, tầng ${floor}. View ${typeSlug.includes('pine') ? 'thông' : 'thành phố'}.`,
          altText: `${typeSlug} ${code}`,
          status,
          isActive: !(prop.slug === 'cherry-dalat-skyline' && i === branch.roomQuota),
          maxAdults: typeSlug === 'penthouse-sky' ? 4 : typeSlug === 'suite-horizon' ? 3 : 2,
          maxChildren: typeSlug === 'standard-garden' ? 0 : 1,
          withGallery: prop.slug === 'cherry-dalat-centro' && code === 'HXH-101',
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
};
