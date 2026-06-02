/**
 * ═══════════════════════════════════════════════════════════════════
 *  GHIM BẢN ĐỒ CHI NHÁNH — chỉnh tại file này
 * ═══════════════════════════════════════════════════════════════════
 *
 * 1. Mở Google Maps → tìm địa chỉ chi nhánh
 * 2. Chuột phải lên ghim → copy tọa độ (lat, lng)
 * 3. Nút Chia sẻ → Sao chép liên kết → dán vào googleMapsUrl
 * 4. (Tuỳ chọn) embedUrl: Chia sẻ → Nhúng bản đồ → copy src iframe
 *
 * Key = branch.id (trùng id trong properties.js)
 *
 * @typedef {{
 *   lat: number;
 *   lng: number;
 *   zoom?: number;
 *   label?: string;
 *   pinBadge?: string; // text trên ghim — mặc định lấy giá từ properties.js
 *   pinInfo?: string; // mô tả ngắn trên ghim / popup — mặc định tagline chi nhánh
 *   googleMapsUrl: string;
 *   embedUrl?: string;
 * }} BranchMapPin
 */

/** @type {Record<string, BranchMapPin>} */
export const BRANCH_MAP_PINS = {
  'dl-hxh': {
    lat: 11.9451,
    lng: 108.4419,
    zoom: 16,
    label: 'Hồ Xuân Hương',
    pinInfo: 'Gần hồ · yên tĩnh',
    googleMapsUrl:
      'https://www.google.com/maps/search/?api=1&query=11.9451,108.4419&query_place_id=Hồ+Xuân+Hương+Đà+Lạt',
  },
  'dl-dt': {
    lat: 11.9264,
    lng: 108.4452,
    zoom: 15,
    label: 'Đồi Thông',
    pinBadge: '990k',
    pinInfo: 'View rừng thông',
    googleMapsUrl:
      'https://www.google.com/maps/search/?api=1&query=11.9264,108.4452',
  },
  'dl-tt': {
    lat: 11.9404,
    lng: 108.438,
    zoom: 16,
    label: 'Trung Tâm',
    pinInfo: 'Gần chợ · tiện di chuyển',
    googleMapsUrl:
      'https://www.google.com/maps/search/?api=1&query=Chợ+Đà+Lạt',
  },
  'vt-main': {
    lat: 10.3459,
    lng: 107.0843,
    zoom: 16,
    label: 'Bãi Sau',
    googleMapsUrl:
      'https://www.google.com/maps/search/?api=1&query=Thùy+Vân+Vũng+Tàu',
  },
  'dn-mk': {
    lat: 16.0471,
    lng: 108.2468,
    zoom: 16,
    label: 'Mỹ Khê',
    googleMapsUrl:
      'https://www.google.com/maps/search/?api=1&query=Mỹ+Khê+Đà+Nẵng',
  },
  'dn-at': {
    lat: 16.0552,
    lng: 108.2485,
    zoom: 16,
    label: 'An Thượng',
    googleMapsUrl:
      'https://www.google.com/maps/search/?api=1&query=An+Thượng+Đà+Nẵng',
  },
  'dl-villa': {
    lat: 11.9158,
    lng: 108.4295,
    zoom: 15,
    label: 'Villa Đồi Nam',
    googleMapsUrl:
      'https://www.google.com/maps/search/?api=1&query=11.9158,108.4295',
  },
};
