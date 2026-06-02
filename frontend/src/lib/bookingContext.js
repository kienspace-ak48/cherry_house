import { BOOKING_CITY_OPTIONS } from '../constants/bookingCities';
import { PROPERTY_KIND_LABELS } from '../data/properties';

/** @typedef {{
 *   city?: string;
 *   checkIn?: string;
 *   checkOut?: string;
 *   kind?: string;
 *   property?: string;
 *   branch?: string;
 *   q?: string;
 * }} BookingContext
 */

export const CTA = {
  searchSubmit: 'Tìm phòng trống',
  propertyPrimary: 'Xem & đặt phòng',
  propertySecondary: 'Chi tiết cơ sở',
  viewRooms: 'Xem phòng trống',
  viewRoomDetail: 'Xem chi tiết',
  bookRoom: 'Đặt phòng',
  branchDetail: 'Xem chi tiết chi nhánh',
  compareBranches: 'So sánh chi nhánh',
  editSearch: 'Sửa tìm kiếm',
  changeBranch: 'Đổi chi nhánh',
  startSearch: 'Bắt đầu tìm phòng',
};

const CONTEXT_KEYS = ['city', 'checkIn', 'checkOut', 'kind', 'property', 'branch', 'q'];

function stripDiacritics(raw) {
  return String(raw || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
}

/**
 * @param {string} raw
 * @returns {string | undefined}
 */
function normalizeCity(raw) {
  const t = raw?.trim();
  if (!t) return undefined;
  const lower = stripDiacritics(t);
  const match = BOOKING_CITY_OPTIONS.find((c) => stripDiacritics(c) === lower);
  if (match) return match;
  const fuzzy = BOOKING_CITY_OPTIONS.find(
    (c) => lower.includes(stripDiacritics(c)) || stripDiacritics(c).includes(lower),
  );
  return fuzzy ?? t;
}

/**
 * @param {URLSearchParams | string | null | undefined} input
 * @returns {BookingContext}
 */
export function parseBookingContext(input) {
  const params =
    input instanceof URLSearchParams
      ? input
      : new URLSearchParams(typeof input === 'string' ? input : '');

  /** @type {BookingContext} */
  const ctx = {};

  for (const key of CONTEXT_KEYS) {
    const v = params.get(key);
    if (v) ctx[key] = v;
  }

  if (!ctx.city && ctx.q) {
    const mapped = normalizeCity(ctx.q);
    if (mapped && BOOKING_CITY_OPTIONS.some((c) => c === mapped)) {
      ctx.city = mapped;
    }
  }

  if (ctx.city) ctx.city = normalizeCity(ctx.city) ?? ctx.city;

  return ctx;
}

/**
 * @param {BookingContext} ctx
 * @returns {URLSearchParams}
 */
export function contextToSearchParams(ctx) {
  const params = new URLSearchParams();
  for (const key of CONTEXT_KEYS) {
    const v = ctx[key];
    if (v) params.set(key, v);
  }
  return params;
}

/**
 * @param {string} path
 * @param {BookingContext} ctx
 * @param {Record<string, string | undefined>} [extra]
 */
export function buildUrl(path, ctx = {}, extra = {}) {
  const merged = mergeContext(ctx, extra);
  const params = contextToSearchParams(merged);
  for (const [k, v] of Object.entries(extra)) {
    if (v && !CONTEXT_KEYS.includes(k)) params.set(k, v);
  }
  const qs = params.toString();
  return qs ? `${path}?${qs}` : path;
}

/**
 * @param {BookingContext} base
 * @param {BookingContext} patch
 */
export function mergeContext(base, patch) {
  /** @type {BookingContext} */
  const next = { ...base };
  for (const [k, v] of Object.entries(patch)) {
    if (v === null || v === undefined || v === '') delete next[k];
    else next[k] = v;
  }
  return next;
}

/**
 * @param {BookingContext} ctx
 */
export function hasCompleteBookingTarget(ctx) {
  return Boolean(ctx.property && ctx.branch && ctx.checkIn && ctx.checkOut);
}

export function getDiscoveryHref(ctx = {}, extra = {}) {
  return buildUrl('/booking', discoveryContext(ctx), extra);
}

/** Header / footer 「Đặt phòng」— luôn vào bước chọn cơ sở, không khôi phục lịch sử. */
export function getHeaderBookingHref() {
  return '/booking';
}

/** @param {BookingContext} ctx */
export function getBranchStepHref(ctx) {
  const { branch, ...rest } = ctx;
  return buildUrl('/booking', rest);
}

/**
 * @param {BookingContext} ctx
 * @param {string} detailSlug
 */
export function getRoomDetailHref(ctx, detailSlug) {
  return buildUrl(`/room/${detailSlug}`, ctx);
}

/**
 * @param {BookingContext} ctx
 */
export function formatContextSummary(ctx) {
  const parts = [];
  if (ctx.city) parts.push(ctx.city);
  if (ctx.checkIn && ctx.checkOut) {
    try {
      const inD = new Date(`${ctx.checkIn}T12:00:00`);
      const outD = new Date(`${ctx.checkOut}T12:00:00`);
      const fmt = (d) =>
        new Intl.DateTimeFormat('vi-VN', { day: 'numeric', month: 'short' }).format(d);
      parts.push(`${fmt(inD)} – ${fmt(outD)}`);
    } catch {
      parts.push(`${ctx.checkIn} – ${ctx.checkOut}`);
    }
  }
  if (ctx.kind && ctx.kind !== 'all' && PROPERTY_KIND_LABELS[ctx.kind]) {
    parts.push(PROPERTY_KIND_LABELS[ctx.kind]);
  }
  return parts.join(' · ');
}

/**
 * Form values → context (normalize city from free text)
 * @param {{ city?: string; checkIn?: string; checkOut?: string; kind?: string }} values
 */
export function formValuesToContext(values) {
  const cityInput = values.city?.trim() ?? '';
  const city = normalizeCity(cityInput) ?? (cityInput || undefined);
  /** @type {BookingContext} */
  const ctx = {
    checkIn: values.checkIn || undefined,
    checkOut: values.checkOut || undefined,
    kind: values.kind && values.kind !== 'all' ? values.kind : undefined,
  };
  if (city) {
    ctx.city = city;
    if (!BOOKING_CITY_OPTIONS.includes(city)) ctx.q = cityInput;
  }
  return ctx;
}

/** Strip property/branch for discovery-only URLs */
export function discoveryContext(ctx) {
  const { property, branch, ...rest } = ctx;
  return rest;
}

/** @param {BookingContext} ctx */
export function hasActiveDiscoveryFilter(ctx) {
  return Boolean(ctx.city || ctx.kind || ctx.q || ctx.checkIn || ctx.checkOut);
}

/** @param {BookingContext} ctx */
export function filterPropertiesByContext(ctx) {
  return PROPERTIES.filter((p) => {
    if (ctx.city && p.city !== ctx.city) return false;
    if (ctx.kind && ctx.kind !== 'all' && p.kind !== ctx.kind) return false;
    if (ctx.q) {
      const hay = `${p.name} ${p.city} ${p.region} ${p.tagline} ${p.kindLabel}`.toLowerCase();
      if (!hay.includes(ctx.q.toLowerCase())) return false;
    }
    return true;
  });
}

/**
 * Primary CTA target from a property card or single-result redirect.
 * @param {{ slug: string; subBranches: { id: string }[] }} property
 * @param {BookingContext} ctx
 */
export function getPropertyContinueHref(property, ctx) {
  /** @type {BookingContext} */
  const next = { ...ctx, property: property.slug };
  if (property.subBranches.length === 1) {
    next.branch = property.subBranches[0].id;
  }
  return buildUrl('/booking', next);
}

/** Sau tìm kiếm — luôn về danh sách cơ sở (params trên URL), không tự nhảy bước. */
export function resolveSearchDestination(ctx) {
  return buildUrl('/booking', ctx);
}
