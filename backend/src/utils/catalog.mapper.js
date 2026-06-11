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

const DEFAULT_ROOM_IMAGE =
  'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?auto=format&fit=crop&w=1400&q=80';

const MAX_ROOM_GALLERY = 5;

function toDetailSlug(code) {
  return String(code).toLowerCase().replace(/[^a-z0-9]+/g, '-');
}

function parseStringList(raw) {
  if (!Array.isArray(raw)) return [];
  return raw.map((item) => String(item).trim()).filter(Boolean);
}

function buildRoomGallery(room, rt) {
  const out = [];
  const roomGallery = parseStringList(room.galleryImages);

  if (roomGallery.length) {
    out.push(...roomGallery.slice(0, MAX_ROOM_GALLERY));
  } else {
    if (room.imageUrl) out.push(room.imageUrl);
    if (rt?.gallery?.length) {
      for (const item of rt.gallery) {
        if (item.imageUrl && !out.includes(item.imageUrl) && out.length < MAX_ROOM_GALLERY) {
          out.push(item.imageUrl);
        }
      }
    }
  }

  if (!out.length) out.push(DEFAULT_ROOM_IMAGE);
  return out.slice(0, MAX_ROOM_GALLERY);
}

function toPublicRoom(room) {
  const rt = room.roomType;
  return {
    id: room.id,
    code: room.code,
    detailSlug: toDetailSlug(room.code),
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

function toPublicRoomDetail(room) {
  const rt = room.roomType;
  const detailSlug = toDetailSlug(room.code);
  const branch = room.branch ? toPublicBranch(room.branch) : null;
  const property = room.branch?.property
    ? {
        id: room.branch.property.id,
        slug: room.branch.property.slug,
        name: room.branch.property.name,
        city: room.branch.property.city,
        region: room.branch.property.region ?? null,
        kind: room.branch.property.kind,
        kindLabel: PROPERTY_KIND_LABELS[room.branch.property.kind] ?? room.branch.property.kind,
        rating: num(room.branch.property.rating),
        reviewCount: room.branch.property.reviewCount ?? 0,
      }
    : null;

  const gallery = buildRoomGallery(room, rt);

  const extraParagraphs = parseStringList(room.extraParagraphs);
  const typeParagraphs = Array.isArray(rt?.paragraphs) ? rt.paragraphs.filter(Boolean) : [];
  const paragraphs = [];
  if (room.description) paragraphs.push(room.description);
  for (const p of extraParagraphs) {
    if (!paragraphs.includes(p)) paragraphs.push(p);
  }
  for (const p of typeParagraphs) {
    if (!paragraphs.includes(p)) paragraphs.push(p);
  }

  const amenities = rt?.amenities?.length
    ? rt.amenities.map((row) => ({
        icon: row.amenity.icon,
        label: row.amenity.label,
      }))
    : [];

  const policyBullets = Array.isArray(rt?.policyBullets)
    ? rt.policyBullets.filter(Boolean)
    : [];

  return {
    id: room.id,
    code: room.code,
    slug: detailSlug,
    detailSlug,
    badge: rt?.badge ?? 'Cherry House',
    title: rt?.title ?? room.code,
    subtitle: room.code,
    roomTypeTitle: rt?.title ?? null,
    roomTypeSlug: rt?.slug ?? null,
    category: rt?.category ?? null,
    areaSqm: rt?.areaSqm ?? 0,
    bedLabel: rt?.bedLabel ?? '',
    capacityLabel: rt?.capacityLabel ?? `Tối đa ${room.maxAdults} người lớn`,
    paragraphs,
    amenities,
    policyBullets,
    checkIn: rt?.checkInTime ?? '14:00',
    checkOut: rt?.checkOutTime ?? '12:00',
    priceVnd: room.priceVnd,
    basePriceVnd: rt?.basePriceVnd ?? room.priceVnd,
    status: room.status,
    maxAdults: room.maxAdults,
    maxChildren: room.maxChildren,
    gallery,
    image: gallery[0] ?? room.imageUrl ?? DEFAULT_ROOM_IMAGE,
    alt: room.altText ?? room.code,
    description: room.description,
    branch,
    property,
    propertySlug: property?.slug ?? null,
    branchCode: room.branch?.code ?? null,
    branchDbId: room.branchId,
    roomTypeId: room.roomTypeId,
    isActive: room.isActive,
  };
}

module.exports = {
  PROPERTY_KIND_LABELS,
  toPublicProperty,
  toPublicBranch,
  toPublicRoom,
  toPublicRoomDetail,
  toPublicMapPin,
  toDetailSlug,
  DEFAULT_ROOM_IMAGE,
  MAX_ROOM_GALLERY,
};
