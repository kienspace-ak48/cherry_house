/**
 * Dữ liệu demo cơ sở lưu trú — chuỗi Cherry House đa tỉnh / đa chi nhánh.
 * @typedef {'homestay'|'mini_hotel'|'villa'|'serviced_apartment'} PropertyKind
 * @typedef {{ id: string, name: string, address: string, tagline?: string, roomCount?: number, priceFromVnd?: number, image?: string }} SubBranch
 * @typedef {{ icon: string, label: string }} Amenity
 * @typedef {{ author: string, rating: number, text: string, date: string }} Review
 * @typedef {{
 *   slug: string;
 *   name: string;
 *   city: string;
 *   region: string;
 *   kind: PropertyKind;
 *   kindLabel: string;
 *   tagline: string;
 *   description: string;
 *   address: string;
 *   priceFromVnd: number;
 *   roomCount: number;
 *   branchCount: number;
 *   rating: number;
 *   reviewCount: number;
 *   heroImage: string;
 *   gallery: string[];
 *   amenities: Amenity[];
 *   subBranches: SubBranch[];
 *   reviews: Review[];
 *   highlights: string[];
 * }} PropertyRecord
 */

export const PROPERTY_KIND_LABELS = {
  homestay: 'Homestay',
  mini_hotel: 'Mini Hotel',
  villa: 'Villa',
  serviced_apartment: 'Serviced Apartment',
};

const IMG = {
  dalat:
    'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80',
  dalat2:
    'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1200&q=80',
  vungtau:
    'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=1200&q=80',
  danang:
    'https://images.unsplash.com/photo-1611892440504-42a792e54d34?auto=format&fit=crop&w=1200&q=80',
  homestay:
    'https://images.unsplash.com/photo-1560448204-e02f11c45751?auto=format&fit=crop&w=1200&q=80',
  villa:
    'https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=1200&q=80',
};

/** @type {PropertyRecord[]} */
export const PROPERTIES = [
  {
    slug: 'cherry-house-da-lat',
    name: 'Cherry House Đà Lạt',
    city: 'Đà Lạt',
    region: 'Lâm Đồng',
    kind: 'homestay',
    kindLabel: PROPERTY_KIND_LABELS.homestay,
    tagline: 'Ba chi nhánh giữa thành phố ngàn hoa — gần hồ, đồi thông và trung tâm',
    description:
      'Cherry House Đà Lạt là cụm homestay & mini stay dưới cùng thương hiệu Cherry House, rải khắp các khu vực được khách yêu thích nhất. Mỗi chi nhánh giữ phong cách ấm áp, gỗ và ánh sáng dịu, phù hợp nghỉ dưỡng cuối tuần hoặc làm việc từ xa vài ngày.',
    address: 'Nhiều điểm tại TP. Đà Lạt, Lâm Đồng',
    priceFromVnd: 890_000,
    roomCount: 42,
    branchCount: 3,
    rating: 4.8,
    reviewCount: 328,
    heroImage: IMG.dalat,
    gallery: [IMG.dalat, IMG.dalat2, IMG.homestay, IMG.villa],
    amenities: [
      { icon: 'wifi', label: 'Wi-Fi tốc độ cao' },
      { icon: 'local_parking', label: 'Bãi xe / chỗ đỗ xe máy' },
      { icon: 'coffee', label: 'Bếp nhỏ / góc pha chế' },
      { icon: 'yard', label: 'Sân vườn / ban công' },
      { icon: 'pets', label: 'Thú cưng (một số phòng)' },
      { icon: 'support_agent', label: 'Host hỗ trợ 24/7' },
    ],
    subBranches: [
      {
        id: 'dl-hxh',
        name: 'Chi nhánh Hồ Xuân Hương',
        address: 'Gần Hồ Xuân Hương, P.1',
        tagline: 'Yên tĩnh, gần hồ — phù hợp cặp đôi',
        roomCount: 14,
        priceFromVnd: 890_000,
        image: IMG.dalat2,
      },
      {
        id: 'dl-dt',
        name: 'Chi nhánh Đồi Thông',
        address: 'Khu Đồi Thông, view rừng thông',
        tagline: 'View rừng thông, không khí mát',
        roomCount: 16,
        priceFromVnd: 990_000,
        image: IMG.homestay,
      },
      {
        id: 'dl-tt',
        name: 'Chi nhánh Trung Tâm',
        address: 'Gần chợ Đà Lạt, tiện di chuyển',
        tagline: 'Gần chợ & quán cà phê, thuận tiện di chuyển',
        roomCount: 12,
        priceFromVnd: 950_000,
        image: IMG.dalat,
      },
    ],
    highlights: [
      '3 chi nhánh trong cùng thành phố',
      'Nhiều loại phòng: Standard, Deluxe, Family, Dorm',
      'Check-in linh hoạt, self check-in một số căn',
    ],
    reviews: [
      {
        author: 'Minh Anh',
        rating: 5,
        text: 'Ở chi nhánh Hồ Xuân Hương rất yên, sáng sớm đi bộ quanh hồ tiện. Phòng sạch, host phản hồi nhanh.',
        date: '2025-11-12',
      },
      {
        author: 'Tuấn K.',
        rating: 5,
        text: 'Gia đình 4 người chọn Deluxe Family ở Đồi Thông — không gian rộng, view đẹp.',
        date: '2025-10-03',
      },
    ],
  },
  {
    slug: 'cherry-house-vung-tau',
    name: 'Cherry House Vũng Tàu',
    city: 'Vũng Tàu',
    region: 'Bà Rịa - Vũng Tàu',
    kind: 'mini_hotel',
    kindLabel: PROPERTY_KIND_LABELS.mini_hotel,
    tagline: 'Mini hotel gần biển — phòng gọn, tiện nghi đủ dùng cho kỳ nghỉ ngắn',
    description:
      'Cherry House Vũng Tàu hướng tới khách muốn tránh OTA, đặt trực tiếp trên website thương hiệu với giá minh bạch. Các tầng phòng được đánh số rõ ràng, có view biển hoặc phố tùy hạng.',
    address: 'Khu vực Bãi Sau / Thùy Vân, Vũng Tàu',
    priceFromVnd: 1_190_000,
    roomCount: 28,
    branchCount: 1,
    rating: 4.6,
    reviewCount: 156,
    heroImage: IMG.vungtau,
    gallery: [IMG.vungtau, IMG.dalat2, IMG.homestay],
    amenities: [
      { icon: 'beach_access', label: 'Gần bãi biển (5–10 phút)' },
      { icon: 'ac_unit', label: 'Điều hòa từng phòng' },
      { icon: 'elevator', label: 'Thang máy' },
      { icon: 'room_service', label: 'Đặt đồ ăn sáng' },
      { icon: 'local_laundry_service', label: 'Giặt ủi' },
    ],
    subBranches: [
      {
        id: 'vt-main',
        name: 'Cherry House Vũng Tàu — Bãi Sau',
        address: 'Đường Thùy Vân, P.8',
        tagline: 'Gần biển Bãi Sau, mini hotel tập trung',
        roomCount: 28,
        priceFromVnd: 1_190_000,
        image: IMG.vungtau,
      },
    ],
    highlights: ['Một cơ sở tập trung, dễ quản lý booking', 'View biển ở hạng Deluxe trở lên'],
    reviews: [
      {
        author: 'Lan Phương',
        rating: 4,
        text: 'Đặt trực tiếp web rẻ hơn app OTA. Phòng Standard hơi nhỏ nhưng sạch, gần biển.',
        date: '2026-01-20',
      },
    ],
  },
  {
    slug: 'cherry-house-da-nang',
    name: 'Cherry House Đà Nẵng',
    city: 'Đà Nẵng',
    region: 'Đà Nẵng',
    kind: 'serviced_apartment',
    kindLabel: PROPERTY_KIND_LABELS.serviced_apartment,
    tagline: 'Căn hộ dịch vụ ven biển — lưu trú dài ngày hoặc gia đình cần bếp riêng',
    description:
      'Cherry House Đà Nẵng là dòng Serviced Apartment với bếp, máy giặt và không gian sinh hoạt tách biệt. Phù hợp khách công tác dài ngày, gia đình có trẻ nhỏ hoặc nhóm bạn.',
    address: 'Khu ven biển Mỹ Khê / An Thượng',
    priceFromVnd: 1_490_000,
    roomCount: 18,
    branchCount: 2,
    rating: 4.7,
    reviewCount: 94,
    heroImage: IMG.danang,
    gallery: [IMG.danang, IMG.villa, IMG.homestay],
    amenities: [
      { icon: 'kitchen', label: 'Bếp đầy đủ dụng cụ' },
      { icon: 'local_laundry_service', label: 'Máy giặt trong căn' },
      { icon: 'pool', label: 'Hồ bơi chung khu' },
      { icon: 'fitness_center', label: 'Gym khu dân cư' },
      { icon: 'wifi', label: 'Wi-Fi ổn định làm việc' },
    ],
    subBranches: [
      {
        id: 'dn-mk',
        name: 'Cherry Apartment Mỹ Khê',
        address: 'Gần bãi Mỹ Khê',
        tagline: 'Ven biển Mỹ Khê, view sáng',
        roomCount: 10,
        priceFromVnd: 1_490_000,
        image: IMG.danang,
      },
      {
        id: 'dn-at',
        name: 'Cherry Apartment An Thượng',
        address: 'Khu An Thượng, sáng tạo',
        tagline: 'Khu An Thượng sôi động, quán cà phê & coworking',
        roomCount: 8,
        priceFromVnd: 1_390_000,
        image: IMG.homestay,
      },
    ],
    highlights: ['Căn 1–3 phòng ngủ', 'Ưu đãi tuần / tháng (liên hệ)'],
    reviews: [
      {
        author: 'Hoàng D.',
        rating: 5,
        text: 'Ở 10 ngày làm remote, bếp + giặt tiện hơn khách sạn nhiều.',
        date: '2026-02-08',
      },
    ],
  },
  {
    slug: 'cherry-villa-da-lat',
    name: 'Cherry Villa Đà Lạt',
    city: 'Đà Lạt',
    region: 'Lâm Đồng',
    kind: 'villa',
    kindLabel: PROPERTY_KIND_LABELS.villa,
    tagline: 'Villa riêng tư cho nhóm — sân vườn, BBQ và view đồi',
    description:
      'Cherry Villa là hạng cao cấp trong hệ sinh thái Cherry House tại Đà Lạt: nguyên căn villa, phù hợp tiệc nhỏ, team building hoặc kỳ nghỉ nhóm bạn. Đặt qua cùng website, không qua sàn trung gian.',
    address: 'Khu vực đồi phía Nam, Đà Lạt',
    priceFromVnd: 4_500_000,
    roomCount: 6,
    branchCount: 1,
    rating: 4.9,
    reviewCount: 41,
    heroImage: IMG.villa,
    gallery: [IMG.villa, IMG.dalat, IMG.dalat2],
    amenities: [
      { icon: 'deck', label: 'Sân BBQ / tiệc ngoài trời' },
      { icon: 'hot_tub', label: 'Bồn tắm / jacuzzi' },
      { icon: 'garage', label: 'Chỗ đậu 2–3 xe' },
      { icon: 'family_restroom', label: 'Tối đa 10–12 khách' },
    ],
    subBranches: [
      {
        id: 'dl-villa',
        name: 'Cherry Villa — Đồi Nam',
        address: 'Nguyên căn, check-in riêng',
        tagline: 'Nguyên villa, sân BBQ & view đồi',
        roomCount: 6,
        priceFromVnd: 4_500_000,
        image: IMG.villa,
      },
    ],
    highlights: ['Nguyên villa', 'Phù hợp nhóm 8–12 người'],
    reviews: [
      {
        author: 'Nhóm Weeken',
        rating: 5,
        text: 'Team 10 người ở villa 2 đêm, BBQ tối rất ổn. Book trực tiếp web có host hỗ trợ menu.',
        date: '2025-12-28',
      },
    ],
  },
];

/** @type {string[]} */
export const PROPERTY_CITIES = [...new Set(PROPERTIES.map((p) => p.city))];

/**
 * @param {string | undefined} slug
 * @returns {PropertyRecord | null}
 */
export function resolveProperty(slug) {
  if (!slug) return null;
  return PROPERTIES.find((p) => p.slug === slug) ?? null;
}

/**
 * @param {string | undefined} propertySlug
 * @param {string | undefined} branchId
 * @returns {{ property: PropertyRecord, branch: SubBranch } | null}
 */
export function resolveBranch(propertySlug, branchId) {
  const property = resolveProperty(propertySlug);
  if (!property || !branchId) return null;
  const branch = property.subBranches.find((b) => b.id === branchId);
  if (!branch) return null;
  return { property, branch };
}

/** @param {string} propertySlug */
export function propertyBranchesPath(propertySlug) {
  return `/properties/${propertySlug}/branches`;
}

/**
 * @param {string} propertySlug
 * @param {string} branchId
 * @param {Record<string, string>} [extra]
 */
export function branchBookingPath(propertySlug, branchId, extra = {}) {
  const params = new URLSearchParams({ property: propertySlug, branch: branchId, ...extra });
  return `/booking?${params.toString()}`;
}

/**
 * @param {string} vnd
 */
export function formatPriceFrom(vnd) {
  if (vnd >= 1_000_000) {
    const m = vnd / 1_000_000;
    return `${m % 1 === 0 ? m.toFixed(0) : m.toFixed(1).replace('.0', '')}tr`;
  }
  return `${new Intl.NumberFormat('vi-VN').format(vnd)}đ`;
}

/** @returns {Record<PropertyKind, number>} */
export function countPropertiesByKind() {
  /** @type {Record<PropertyKind, number>} */
  const counts = {
    homestay: 0,
    mini_hotel: 0,
    villa: 0,
    serviced_apartment: 0,
  };
  for (const p of PROPERTIES) counts[p.kind] += 1;
  return counts;
}

/** @returns {Record<string, number>} */
export function countPropertiesByCity() {
  /** @type {Record<string, number>} */
  const counts = {};
  for (const p of PROPERTIES) counts[p.city] = (counts[p.city] ?? 0) + 1;
  return counts;
}
