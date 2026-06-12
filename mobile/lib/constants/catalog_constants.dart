abstract final class CatalogConstants {
  static const kindOptions = <String, String>{
    'all': 'Tất cả',
    'homestay': 'Homestay',
    'mini_hotel': 'Mini Hotel',
    'villa': 'Villa',
    'serviced_apartment': 'Căn hộ DV',
  };

  static const defaultHeroImage =
      'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80';

  static const provinceOptions = [
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

  /// @deprecated — ô địa điểm giờ là tỉnh/thành
  static const cityOptions = provinceOptions;
}
