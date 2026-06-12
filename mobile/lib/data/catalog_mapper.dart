import 'package:flutter/material.dart';

import '../constants/catalog_constants.dart';
import '../models/models.dart';
import '../utils/media_url.dart';

PropertyKind _kindFromApi(String? raw) {
  switch (raw) {
    case 'mini_hotel':
      return PropertyKind.miniHotel;
    case 'villa':
      return PropertyKind.villa;
    case 'serviced_apartment':
      return PropertyKind.servicedApartment;
    default:
      return PropertyKind.homestay;
  }
}

IconData _amenityIcon(String? icon) {
  switch (icon) {
    case 'wifi':
      return Icons.wifi;
    case 'parking':
      return Icons.local_parking;
    case 'breakfast':
      return Icons.free_breakfast;
    case 'ac':
      return Icons.ac_unit;
    case 'pool':
      return Icons.pool;
    case 'kitchen':
      return Icons.kitchen;
    default:
      return Icons.check_circle_outline;
  }
}

RoomStatus _roomStatusFromOccupancy(String? occupancy) {
  switch (occupancy) {
    case 'held':
      return RoomStatus.pending;
    case 'booked':
      return RoomStatus.booked;
    case 'inactive':
      return RoomStatus.booked;
    default:
      return RoomStatus.available;
  }
}

RoomStatus _roomStatusFromInventory(String? status) {
  switch (status) {
    case 'pending':
      return RoomStatus.pending;
    case 'booked':
      return RoomStatus.booked;
    default:
      return RoomStatus.available;
  }
}

Property propertyFromApi(Map<String, dynamic> row) {
  final kind = _kindFromApi(row['kind'] as String?);
  final kindLabel = row['kindLabel'] as String? ?? CatalogConstants.kindOptions['homestay']!;
  final hero = resolveMediaUrl(
    (row['heroImageUrl'] ?? row['heroImage']) as String?,
  );

  final branches = (row['subBranches'] as List<dynamic>? ?? [])
      .whereType<Map<String, dynamic>>()
      .map(subBranchFromApi)
      .toList();

  final gallery = (row['gallery'] as List<dynamic>? ?? [])
      .map((e) => resolveMediaUrl(e?.toString()))
      .where((e) => e.isNotEmpty)
      .toList();

  final amenities = (row['amenities'] as List<dynamic>? ?? [])
      .whereType<Map<String, dynamic>>()
      .map(
        (a) => Amenity(
          icon: _amenityIcon(a['icon'] as String?),
          label: a['label'] as String? ?? '',
        ),
      )
      .where((a) => a.label.isNotEmpty)
      .toList();

  return Property(
    id: row['id'] as int?,
    slug: row['slug'] as String? ?? '',
    name: row['name'] as String? ?? '',
    city: row['city'] as String? ?? '',
    region: row['region'] as String? ?? '',
    kind: kind,
    kindLabel: kindLabel,
    tagline: row['tagline'] as String? ?? '',
    description: row['description'] as String? ?? '',
    address: row['address'] as String? ?? '',
    priceFromVnd: (row['priceFromVnd'] as num?)?.toInt() ?? 0,
    roomCount: (row['roomCount'] as num?)?.toInt() ?? 0,
    branchCount: (row['branchCount'] as num?)?.toInt() ?? branches.length,
    rating: (row['rating'] as num?)?.toDouble() ?? 0,
    reviewCount: (row['reviewCount'] as num?)?.toInt() ?? 0,
    heroImageUrl: hero.isNotEmpty ? hero : CatalogConstants.defaultHeroImage,
    gallery: gallery.isNotEmpty ? gallery : (hero.isNotEmpty ? [hero] : []),
    amenities: amenities,
    subBranches: branches,
    highlights: (row['highlights'] as List<dynamic>? ?? [])
        .map((e) => e.toString())
        .where((e) => e.isNotEmpty)
        .toList(),
  );
}

SubBranch subBranchFromApi(Map<String, dynamic> row) {
  final image = resolveMediaUrl(row['image'] as String?);
  return SubBranch(
    id: (row['id'] ?? row['code'] ?? '').toString(),
    dbId: row['dbId'] as int?,
    name: row['name'] as String? ?? '',
    address: row['address'] as String? ?? '',
    tagline: row['tagline'] as String? ?? '',
    roomCount: (row['roomCount'] as num?)?.toInt() ?? 0,
    priceFromVnd: (row['priceFromVnd'] as num?)?.toInt() ?? 0,
    imageUrl: image,
  );
}

Room roomFromApi(
  Map<String, dynamic> row, {
  String? occupancy,
  required String propertySlug,
  required String branchCode,
  int? branchDbId,
}) {
  final image = resolveMediaUrl(row['image'] as String?);
  final status = occupancy != null
      ? _roomStatusFromOccupancy(occupancy)
      : _roomStatusFromInventory(row['status'] as String?);

  return Room(
    id: '${row['id'] ?? row['code']}',
    code: row['code'] as String? ?? '',
    propertySlug: row['propertySlug'] as String? ?? propertySlug,
    branchId: row['branchId'] as String? ?? branchCode,
    detailSlug: row['detailSlug'] as String? ?? '',
    branchDbId: branchDbId ?? row['branchDbId'] as int?,
    type: row['type'] as String? ?? row['roomTypeTitle'] as String? ?? 'Room',
    status: status,
    priceVnd: (row['priceVnd'] as num?)?.toInt() ?? 0,
    capacityLabel: row['capacityLabel'] as String? ?? '',
    description: row['description'] as String? ?? '',
    imageUrl: image.isNotEmpty ? image : CatalogConstants.defaultHeroImage,
  );
}

List<Property> filterProperties(List<Property> list, BookingSearch search) {
  return list.where((p) {
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

String isoDate(DateTime d) =>
    '${d.year}-${d.month.toString().padLeft(2, '0')}-${d.day.toString().padLeft(2, '0')}';
