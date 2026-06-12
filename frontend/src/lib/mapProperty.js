import { PROPERTY_KIND_LABELS } from '../data/properties';

export const UNCLASSIFIED_ROOM_TYPE_LABEL = 'Chưa phân loại phòng';

/**
 * @param {Record<string, unknown>} row
 * @returns {import('../data/properties').PropertyRecord}
 */
export function mapPropertyFromApi(row) {
  const kind = /** @type {import('../data/properties').PropertyKind} */ (row.kind);

  return {
    slug: String(row.slug),
    name: String(row.name),
    city: String(row.city),
    region: String(row.region),
    kind,
    kindLabel: row.kindLabel ? String(row.kindLabel) : PROPERTY_KIND_LABELS[kind] ?? String(row.kind),
    tagline: row.tagline ? String(row.tagline) : '',
    description: String(row.description ?? ''),
    address: String(row.address ?? ''),
    priceFromVnd: Number(row.priceFromVnd ?? 0),
    roomCount: Number(row.roomCount ?? 0),
    branchCount: Number(row.branchCount ?? 0),
    rating: Number(row.rating ?? 0),
    reviewCount: Number(row.reviewCount ?? 0),
    heroImage: row.heroImage ? String(row.heroImage) : row.heroImageUrl ? String(row.heroImageUrl) : '',
    gallery: Array.isArray(row.gallery) ? row.gallery.map(String) : [],
    amenities: Array.isArray(row.amenities) ? row.amenities : [],
    subBranches: Array.isArray(row.subBranches)
      ? row.subBranches.map((b) => ({
          id: String(b.id ?? b.code ?? ''),
          name: String(b.name ?? ''),
          address: String(b.address ?? ''),
          tagline: b.tagline ? String(b.tagline) : '',
          priceFromVnd: Number(b.priceFromVnd ?? b.price ?? 0),
          roomCount: Number(b.roomCount ?? 0),
          image: b.image ? String(b.image) : '',
        }))
      : [],
    reviews: Array.isArray(row.reviews) ? row.reviews : [],
    highlights: Array.isArray(row.highlights) ? row.highlights.map(String) : [],
  };
}

/**
 * @param {Record<string, unknown>} row
 */
export function mapRoomFromApi(row) {
  return {
    id: Number(row.id),
    propertySlug: row.propertySlug ? String(row.propertySlug) : '',
    branchId: row.branchId ? String(row.branchId) : '',
    detailSlug: row.detailSlug ? String(row.detailSlug) : String(row.code ?? '').toLowerCase(),
    code: String(row.code ?? ''),
    type: String(row.type ?? row.roomTypeTitle ?? UNCLASSIFIED_ROOM_TYPE_LABEL),
    status: /** @type {'available'|'pending'|'booked'} */ (row.status),
    priceVnd: Number(row.priceVnd ?? 0),
    capacityLabel: String(row.capacityLabel ?? ''),
    description: String(row.description ?? ''),
    alt: String(row.alt ?? row.code ?? ''),
    image: row.image ? String(row.image) : '',
  };
}

/**
 * @param {import('../data/properties').PropertyRecord[]} properties
 * @param {import('./bookingContext').BookingContext} ctx
 */
export function filterPropertyList(properties, ctx) {
  return properties.filter((p) => {
    if (ctx.city && p.region !== ctx.city && p.city !== ctx.city) return false;
    if (ctx.kind && ctx.kind !== 'all' && p.kind !== ctx.kind) return false;
    if (ctx.q) {
      const hay = `${p.name} ${p.city} ${p.region} ${p.tagline} ${p.kindLabel}`.toLowerCase();
      if (!hay.includes(ctx.q.toLowerCase())) return false;
    }
    return true;
  });
}

/**
 * @param {import('./bookingContext').BookingContext} ctx
 */
export function propertyApiQueryFromContext(ctx) {
  /** @type {{ province?: string; kind?: string; isActive: string }} */
  const params = { isActive: 'true' };
  if (ctx.city) params.province = ctx.city;
  if (ctx.kind && ctx.kind !== 'all') params.kind = ctx.kind;
  return params;
}
