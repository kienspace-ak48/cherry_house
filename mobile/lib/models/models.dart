import 'package:flutter/material.dart' show IconData;

enum PropertyKind { homestay, miniHotel, villa, servicedApartment }

enum RoomStatus { available, pending, booked }

class Amenity {
  const Amenity({required this.icon, required this.label});
  final IconData icon;
  final String label;
}

class SubBranch {
  const SubBranch({
    required this.id,
    required this.name,
    required this.address,
    this.tagline = '',
    this.roomCount = 0,
    this.priceFromVnd = 0,
    this.imageUrl = '',
  });

  final String id;
  final String name;
  final String address;
  final String tagline;
  final int roomCount;
  final int priceFromVnd;
  final String imageUrl;
}

class Property {
  const Property({
    required this.slug,
    required this.name,
    required this.city,
    required this.region,
    required this.kind,
    required this.kindLabel,
    required this.tagline,
    required this.description,
    required this.address,
    required this.priceFromVnd,
    required this.roomCount,
    required this.branchCount,
    required this.rating,
    required this.reviewCount,
    required this.heroImageUrl,
    this.gallery = const [],
    this.amenities = const [],
    this.subBranches = const [],
    this.highlights = const [],
  });

  final String slug;
  final String name;
  final String city;
  final String region;
  final PropertyKind kind;
  final String kindLabel;
  final String tagline;
  final String description;
  final String address;
  final int priceFromVnd;
  final int roomCount;
  final int branchCount;
  final double rating;
  final int reviewCount;
  final String heroImageUrl;
  final List<String> gallery;
  final List<Amenity> amenities;
  final List<SubBranch> subBranches;
  final List<String> highlights;
}

class Room {
  const Room({
    required this.id,
    required this.code,
    required this.propertySlug,
    required this.branchId,
    required this.type,
    required this.status,
    required this.priceVnd,
    required this.capacityLabel,
    required this.description,
    required this.imageUrl,
  });

  final String id;
  final String code;
  final String propertySlug;
  final String branchId;
  final String type;
  final RoomStatus status;
  final int priceVnd;
  final String capacityLabel;
  final String description;
  final String imageUrl;
}

class PopularArea {
  const PopularArea({
    required this.city,
    required this.label,
    required this.imageUrl,
    this.comingSoon = false,
  });

  final String city;
  final String label;
  final String imageUrl;
  final bool comingSoon;
}

class BookingSearch {
  const BookingSearch({
    this.city = '',
    this.checkIn,
    this.checkOut,
    this.kind = 'all',
  });

  final String city;
  final DateTime? checkIn;
  final DateTime? checkOut;
  final String kind;
}
