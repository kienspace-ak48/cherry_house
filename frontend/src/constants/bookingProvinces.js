/** 34 tỉnh/thành — fallback khi API chưa tải */
export const BOOKING_PROVINCE_OPTIONS_FALLBACK = [
  'Hà Nội',
  'Cao Bằng',
  'Tuyên Quang',
  'Điện Biên',
  'Lai Châu',
  'Sơn La',
  'Lào Cai',
  'Thái Nguyên',
  'Lạng Sơn',
  'Quảng Ninh',
  'Bắc Ninh',
  'Phú Thọ',
  'Hải Phòng',
  'Hưng Yên',
  'Ninh Bình',
  'Thanh Hóa',
  'Nghệ An',
  'Hà Tĩnh',
  'Quảng Trị',
  'Huế',
  'Đà Nẵng',
  'Quảng Ngãi',
  'Gia Lai',
  'Khánh Hòa',
  'Lâm Đồng',
  'Đắk Lắk',
  'Đồng Nai',
  'TP. Hồ Chí Minh',
  'Tây Ninh',
  'Vĩnh Long',
  'Đồng Tháp',
  'Cần Thơ',
  'Cà Mau',
  'An Giang',
];

/** @type {string[]} */
let provinceOptionsCache = [...BOOKING_PROVINCE_OPTIONS_FALLBACK];

export function getBookingProvinceOptions() {
  return provinceOptionsCache;
}

/** @param {string[]} provinces */
export function setBookingProvinceOptions(provinces) {
  if (Array.isArray(provinces) && provinces.length) {
    provinceOptionsCache = provinces;
  }
}

/** @deprecated alias — ô địa điểm giờ là tỉnh/thành */
export function getBookingCityOptions() {
  return getBookingProvinceOptions();
}

/** @deprecated alias */
export function setBookingCityOptions(provinces) {
  setBookingProvinceOptions(provinces);
}

export const BOOKING_CITY_OPTIONS_FALLBACK = BOOKING_PROVINCE_OPTIONS_FALLBACK;
