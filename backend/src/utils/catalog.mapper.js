const PROPERTY_KIND_LABELS = {
  homestay: 'Homestay',
  mini_hotel: 'Mini Hotel',
  villa: 'Villa',
  serviced_apartment: 'Serviced Apartment',
};

function num(value) {
  if (value == null) return 0;
  return Number(value);
}

function toPublicMapPin(pin) {
  if (!pin) return null;
  return {
    lat: num(pin.lat),
    lng: num(pin.lng),
    zoom: pin.zoom ?? 15,
    label: pin.label ?? null,
    pinBadge: pin.pinBadge ?? null,
    pinInfo: pin.pinInfo ?? null,
    googleMapsUrl: pin.googleMapsUrl,
    embedUrl: pin.embedUrl ?? null,
  };
}

function toPublicBranch(branch) {
  return {
    id: branch.code,
    dbId: branch.id,
    code: branch.code,
    propertyId: branch.propertyId,
    name: branch.name,
    address: branch.address,
    tagline: branch.tagline ?? null,
    priceFromVnd: num(branch.price),
    roomCount: branch.roomCount ?? 0,
    image: branch.imgUrl ?? null,
    isActive: branch.isActive,
    mapPin: toPublicMapPin(branch.mapPin),
    property: branch.property
      ? {
          id: branch.property.id,
          slug: branch.property.slug,
          name: branch.property.name,
          city: branch.property.city,
        }
      : undefined,
  };
}

function toPublicProperty(property, options = {}) {
  const { includeBranches = false, includeGallery = true, includeAmenities = true } = options;

  const base = {
    id: property.id,
    slug: property.slug,
    name: property.name,
    city: property.city,
    region: property.region,
    kind: property.kind,
    kindLabel: PROPERTY_KIND_LABELS[property.kind] ?? property.kind,
    tagline: property.tagline ?? null,
    description: property.description,
    address: property.address,
    priceFromVnd: property.priceFromVnd,
    roomCount: property.roomCount ?? 0,
    branchCount: property.branchCount ?? 0,
    rating: num(property.rating),
    reviewCount: property.reviewCount ?? 0,
    heroImageUrl: property.heroImageUrl ?? null,
    heroImage: property.heroImageUrl ?? null,
    highlights: Array.isArray(property.highlights) ? property.highlights : [],
    isActive: property.isActive,
    gallery: [],
    amenities: [],
    subBranches: [],
    reviews: [],
  };

  if (includeGallery && property.gallery?.length) {
    base.gallery = property.gallery.map((g) => g.imageUrl);
  }

  if (includeAmenities && property.amenities?.length) {
    base.amenities = property.amenities.map((row) => ({
      icon: row.amenity.icon,
      label: row.amenity.label,
    }));
  }

  if (includeBranches && property.branches?.length) {
    base.subBranches = property.branches.map(toPublicBranch);
  }

  return base;
}

function toPublicRoom(room) {
  const rt = room.roomType;
  return {
    id: room.id,
    code: room.code,
    detailSlug: room.code.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
    branchId: room.branch?.code ?? null,
    branchDbId: room.branchId,
    propertySlug: room.branch?.property?.slug ?? null,
    propertyId: room.branch?.propertyId ?? null,
    roomTypeId: room.roomTypeId,
    type: rt?.category ?? rt?.title ?? 'Room',
    roomTypeTitle: rt?.title ?? null,
    status: room.status,
    priceVnd: room.priceVnd,
    capacityLabel: rt?.capacityLabel ?? `Tối đa ${room.maxAdults} người lớn`,
    description: room.description,
    image: room.imageUrl ?? null,
    alt: room.altText ?? room.code,
    maxAdults: room.maxAdults,
    maxChildren: room.maxChildren,
    isActive: room.isActive,
  };
}

module.exports = {
  PROPERTY_KIND_LABELS,
  toPublicProperty,
  toPublicBranch,
  toPublicRoom,
  toPublicMapPin,
};
