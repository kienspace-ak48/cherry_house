/**
 * 34 tỉnh/thành phố Việt Nam sau sắp xếp 12/6/2025 (Nghị quyết 202/2025/QH15).
 * Dùng cho select admin + profile; không phụ thuộc API bên ngoài.
 */

/** @type {Array<{ code: string; name: string; type: 'city' | 'province' }>} */
const VIETNAM_PROVINCES = [
  { code: '01', name: 'Hà Nội', type: 'city' },
  { code: '04', name: 'Cao Bằng', type: 'province' },
  { code: '08', name: 'Tuyên Quang', type: 'province' },
  { code: '11', name: 'Điện Biên', type: 'province' },
  { code: '12', name: 'Lai Châu', type: 'province' },
  { code: '14', name: 'Sơn La', type: 'province' },
  { code: '15', name: 'Lào Cai', type: 'province' },
  { code: '19', name: 'Thái Nguyên', type: 'province' },
  { code: '20', name: 'Lạng Sơn', type: 'province' },
  { code: '22', name: 'Quảng Ninh', type: 'province' },
  { code: '24', name: 'Bắc Ninh', type: 'province' },
  { code: '25', name: 'Phú Thọ', type: 'province' },
  { code: '31', name: 'Hải Phòng', type: 'city' },
  { code: '33', name: 'Hưng Yên', type: 'province' },
  { code: '37', name: 'Ninh Bình', type: 'province' },
  { code: '38', name: 'Thanh Hóa', type: 'province' },
  { code: '40', name: 'Nghệ An', type: 'province' },
  { code: '42', name: 'Hà Tĩnh', type: 'province' },
  { code: '44', name: 'Quảng Trị', type: 'province' },
  { code: '46', name: 'Huế', type: 'city' },
  { code: '48', name: 'Đà Nẵng', type: 'city' },
  { code: '51', name: 'Quảng Ngãi', type: 'province' },
  { code: '52', name: 'Gia Lai', type: 'province' },
  { code: '56', name: 'Khánh Hòa', type: 'province' },
  { code: '66', name: 'Lâm Đồng', type: 'province' },
  { code: '68', name: 'Đắk Lắk', type: 'province' },
  { code: '75', name: 'Đồng Nai', type: 'province' },
  { code: '79', name: 'TP. Hồ Chí Minh', type: 'city' },
  { code: '80', name: 'Tây Ninh', type: 'province' },
  { code: '82', name: 'Vĩnh Long', type: 'province' },
  { code: '86', name: 'Đồng Tháp', type: 'province' },
  { code: '92', name: 'Cần Thơ', type: 'city' },
  { code: '96', name: 'Cà Mau', type: 'province' },
  { code: '91', name: 'An Giang', type: 'province' },
];

/**
 * Điểm đến lưu trú phổ biến (tên hiển thị trên web) → tỉnh/thành quản lý.
 * Trường property.city thường dùng tên điểm đến, property.region = tỉnh.
 */
const POPULAR_DESTINATIONS = [
  { name: 'Hà Nội', province: 'Hà Nội' },
  { name: 'Sa Pa', province: 'Lào Cai' },
  { name: 'Ninh Bình', province: 'Ninh Bình' },
  { name: 'Đà Nẵng', province: 'Đà Nẵng' },
  { name: 'Hội An', province: 'Quảng Ngãi' },
  { name: 'Huế', province: 'Huế' },
  { name: 'Nha Trang', province: 'Khánh Hòa' },
  { name: 'Đà Lạt', province: 'Lâm Đồng' },
  { name: 'Vũng Tàu', province: 'TP. Hồ Chí Minh' },
  { name: 'TP. Hồ Chí Minh', province: 'TP. Hồ Chí Minh' },
  { name: 'Phú Quốc', province: 'An Giang' },
  { name: 'Cần Thơ', province: 'Cần Thơ' },
  { name: 'Hải Phòng', province: 'Hải Phòng' },
  { name: 'Quy Nhơn', province: 'Gia Lai' },
];

function listProvinces() {
  return VIETNAM_PROVINCES.map((p) => ({ ...p }));
}

function listDestinations() {
  return POPULAR_DESTINATIONS.map((d) => ({ ...d }));
}

function findProvinceByName(name) {
  const t = String(name || '').trim();
  return VIETNAM_PROVINCES.find((p) => p.name === t) || null;
}

function resolveRegionForCity(cityName) {
  const city = String(cityName || '').trim();
  if (!city) return '';
  const dest = POPULAR_DESTINATIONS.find((d) => d.name === city);
  if (dest) return dest.province;
  const prov = findProvinceByName(city);
  return prov ? prov.name : '';
}

/** Tên city/destination thuộc tỉnh — dùng lọc property theo tỉnh/thành. */
function listCityNamesForProvince(provinceName) {
  const province = String(provinceName || '').trim();
  if (!province) return [];
  const names = new Set([province]);
  for (const d of POPULAR_DESTINATIONS) {
    if (d.province === province) names.add(d.name);
  }
  return [...names];
}

/** Gợi ý city khi tạo cơ sở: điểm đến + tỉnh (không trùng tên). */
function listCityOptionsForProperty() {
  const seen = new Set();
  const out = [];
  for (const d of POPULAR_DESTINATIONS) {
    if (!seen.has(d.name)) {
      seen.add(d.name);
      out.push({ name: d.name, region: d.province, kind: 'destination' });
    }
  }
  for (const p of VIETNAM_PROVINCES) {
    if (!seen.has(p.name)) {
      seen.add(p.name);
      out.push({ name: p.name, region: p.name, kind: 'province' });
    }
  }
  return out;
}

module.exports = {
  VIETNAM_PROVINCES,
  POPULAR_DESTINATIONS,
  listProvinces,
  listDestinations,
  findProvinceByName,
  resolveRegionForCity,
  listCityNamesForProvince,
  listCityOptionsForProperty,
};
