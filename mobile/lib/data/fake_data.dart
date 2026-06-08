import 'package:flutter/material.dart';

import '../models/models.dart';

abstract final class FakeData {
  static const heroImage =
      'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80';

  static const imgDalat =
      'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1200&q=80';
  static const imgVilla =
      'https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=1200&q=80';
  static const imgRoom =
      'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?auto=format&fit=crop&w=1200&q=80';
  static const imgVungTau =
      'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=1200&q=80';
  static const imgDanang =
      'https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?auto=format&fit=crop&w=1200&q=80';

  static const defaultAmenities = [
    Amenity(icon: Icons.wifi, label: 'Wi-Fi miễn phí'),
    Amenity(icon: Icons.local_parking, label: 'Bãi đỗ xe'),
    Amenity(icon: Icons.free_breakfast, label: 'Bữa sáng'),
    Amenity(icon: Icons.ac_unit, label: 'Điều hòa'),
  ];

  static final properties = <Property>[
    Property(
      slug: 'cherry-house-da-lat',
      name: 'Cherry House Đà Lạt',
      city: 'Đà Lạt',
      region: 'Lâm Đồng',
      kind: PropertyKind.homestay,
      kindLabel: 'Homestay',
      tagline: 'Homestay giữa thành phố ngàn hoa',
      description:
          'Cherry House Đà Lạt là cụm homestay dưới thương hiệu Cherry House — ấm áp, gỗ và ánh sáng dịu.',
      address: 'TP. Đà Lạt, Lâm Đồng',
      priceFromVnd: 890000,
      roomCount: 42,
      branchCount: 3,
      rating: 4.8,
      reviewCount: 328,
      heroImageUrl: heroImage,
      gallery: [heroImage, imgDalat, imgRoom],
      amenities: defaultAmenities,
      highlights: ['Khí hậu mát', 'Gần hồ Xuân Hương'],
      subBranches: [
        SubBranch(
          id: 'dl-hxh',
          name: 'Chi nhánh Hồ Xuân Hương',
          address: 'Gần Hồ Xuân Hương, P.1',
          tagline: 'Yên tĩnh, gần hồ',
          roomCount: 14,
          priceFromVnd: 890000,
          imageUrl: imgDalat,
        ),
        SubBranch(
          id: 'dl-dt',
          name: 'Chi nhánh Đồi Thông',
          address: 'Khu Đồi Thông',
          tagline: 'View rừng thông',
          roomCount: 16,
          priceFromVnd: 990000,
          imageUrl: imgRoom,
        ),
        SubBranch(
          id: 'dl-tt',
          name: 'Chi nhánh Trung Tâm',
          address: 'Gần chợ Đà Lạt',
          tagline: 'Gần quán cà phê',
          roomCount: 12,
          priceFromVnd: 950000,
          imageUrl: heroImage,
        ),
      ],
    ),
    Property(
      slug: 'cherry-retreat-ninh-binh',
      name: 'Cherry Retreat Ninh Bình',
      city: 'Ninh Bình',
      region: 'Ninh Bình',
      kind: PropertyKind.villa,
      kindLabel: 'Villa',
      tagline: 'Villa view sông Ngô Đồng & Tràng An',
      description: 'Khu villa nghỉ dưỡng — lý tưởng cho nhóm và gia đình.',
      address: 'Huyện Hoa Lư, Ninh Bình',
      priceFromVnd: 2400000,
      roomCount: 2,
      branchCount: 1,
      rating: 4.8,
      reviewCount: 87,
      heroImageUrl: imgVilla,
      gallery: [imgVilla, heroImage],
      amenities: defaultAmenities,
      highlights: ['Hồ bơi riêng', 'Tour Tràng An'],
      subBranches: [
        SubBranch(
          id: 'nb-trangan',
          name: 'Villa Tràng An',
          address: 'Khu du lịch Tràng An',
          tagline: 'Nguyên căn, sân vườn rộng',
          roomCount: 2,
          priceFromVnd: 2400000,
          imageUrl: imgVilla,
        ),
      ],
    ),
    Property(
      slug: 'cherry-house-vung-tau',
      name: 'Cherry House Vũng Tàu',
      city: 'Vũng Tàu',
      region: 'Bà Rịa - Vũng Tàu',
      kind: PropertyKind.miniHotel,
      kindLabel: 'Mini Hotel',
      tagline: 'Mini stay ven biển',
      description: 'Cherry House Vũng Tàu — gần bãi biển, phù hợp cuối tuần.',
      address: 'TP. Vũng Tàu',
      priceFromVnd: 780000,
      roomCount: 18,
      branchCount: 1,
      rating: 4.6,
      reviewCount: 156,
      heroImageUrl: imgVungTau,
      amenities: defaultAmenities,
      subBranches: [
        SubBranch(
          id: 'vt-bb',
          name: 'Chi nhánh Back Beach',
          address: 'Gần bãi Back Beach',
          roomCount: 18,
          priceFromVnd: 780000,
          imageUrl: imgVungTau,
        ),
      ],
    ),
    Property(
      slug: 'cherry-house-da-nang',
      name: 'Cherry House Đà Nẵng',
      city: 'Đà Nẵng',
      region: 'Đà Nẵng',
      kind: PropertyKind.miniHotel,
      kindLabel: 'Mini Hotel',
      tagline: 'Mini stay gần biển Mỹ Khê',
      description: 'Cherry House Đà Nẵng — tiện nghi giữa biển và trung tâm.',
      address: 'Quận Sơn Trà, Đà Nẵng',
      priceFromVnd: 920000,
      roomCount: 22,
      branchCount: 2,
      rating: 4.7,
      reviewCount: 256,
      heroImageUrl: imgDanang,
      amenities: defaultAmenities,
      subBranches: [
        SubBranch(
          id: 'dn-mk',
          name: 'Chi nhánh Mỹ Khê',
          address: 'Gần bãi Mỹ Khê',
          roomCount: 12,
          priceFromVnd: 920000,
          imageUrl: imgDanang,
        ),
        SubBranch(
          id: 'dn-st',
          name: 'Chi nhánh Sơn Trà',
          address: 'Sơn Trà',
          roomCount: 10,
          priceFromVnd: 980000,
          imageUrl: imgDanang,
        ),
      ],
    ),
  ];

  static final popularAreas = [
    PopularArea(city: 'Đà Lạt', label: 'Thành phố Đà Lạt', imageUrl: imgDalat),
    PopularArea(city: 'Vũng Tàu', label: 'Thành phố Vũng Tàu', imageUrl: imgVungTau),
    PopularArea(city: 'Đà Nẵng', label: 'Thành phố Đà Nẵng', imageUrl: imgDanang),
    PopularArea(city: 'Nha Trang', label: 'Thành phố Nha Trang', imageUrl: heroImage, comingSoon: true),
    PopularArea(city: 'Ninh Bình', label: 'Ninh Bình', imageUrl: imgVilla),
  ];

  static const cityOptions = [
    'Đà Lạt',
    'Ninh Bình',
    'Vũng Tàu',
    'Đà Nẵng',
    'Hà Nội',
    'Hội An',
  ];

  static const kindOptions = {
    'all': 'Tất cả loại hình',
    'homestay': 'Homestay',
    'mini_hotel': 'Mini Hotel',
    'villa': 'Villa',
    'serviced_apartment': 'Căn hộ dịch vụ',
  };

  static Property? propertyBySlug(String slug) {
    try {
      return properties.firstWhere((p) => p.slug == slug);
    } catch (_) {
      return null;
    }
  }

  static List<Property> filterProperties(BookingSearch search) {
    return properties.where((p) {
      if (search.city.isNotEmpty && p.city != search.city) return false;
      if (search.kind != 'all') {
        final kindKey = switch (p.kind) {
          PropertyKind.homestay => 'homestay',
          PropertyKind.miniHotel => 'mini_hotel',
          PropertyKind.villa => 'villa',
          PropertyKind.servicedApartment => 'serviced_apartment',
        };
        if (kindKey != search.kind) return false;
      }
      return true;
    }).toList();
  }

  static List<Room> roomsFor(String propertySlug, String branchId) {
    if (propertySlug == 'cherry-house-da-lat' && branchId == 'dl-hxh') {
      return const [
        Room(
          id: '1',
          code: 'HXH-101',
          propertySlug: 'cherry-house-da-lat',
          branchId: 'dl-hxh',
          type: 'Standard',
          status: RoomStatus.available,
          priceVnd: 890000,
          capacityLabel: '2 người lớn',
          description: 'Phòng 101 — tầng 1, view vườn',
          imageUrl: imgRoom,
        ),
        Room(
          id: '2',
          code: 'HXH-205',
          propertySlug: 'cherry-house-da-lat',
          branchId: 'dl-hxh',
          type: 'Deluxe',
          status: RoomStatus.pending,
          priceVnd: 1250000,
          capacityLabel: '2 người lớn · 1 trẻ',
          description: 'Phòng góc — view thung lũng',
          imageUrl: imgDalat,
        ),
        Room(
          id: '3',
          code: 'HXH-302',
          propertySlug: 'cherry-house-da-lat',
          branchId: 'dl-hxh',
          type: 'Suite',
          status: RoomStatus.booked,
          priceVnd: 1890000,
          capacityLabel: '4 người',
          description: 'Suite — ban công rộng',
          imageUrl: heroImage,
        ),
      ];
    }
    return [
      Room(
        id: '99',
        code: 'DEMO-01',
        propertySlug: propertySlug,
        branchId: branchId,
        type: 'Standard',
        status: RoomStatus.available,
        priceVnd: 1200000,
        capacityLabel: '2 người lớn',
        description: 'Phòng demo — dữ liệu giả',
        imageUrl: imgRoom,
      ),
    ];
  }

  static const fakeUser = (
    name: 'Nguyễn Văn Demo',
    email: 'demo@cherryhouse.vn',
    phone: '0901234567',
    tier: 'Gold',
  );
}
