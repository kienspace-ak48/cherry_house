import { BOOKING_CITY_OPTIONS } from '../constants/bookingCities';
import { PROPERTY_KIND_LABELS } from '../data/properties';
import { countNights } from './dateRange';

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
export function hasDateRange(ctx) {
  return Boolean(ctx.checkIn && ctx.checkOut && countNights(ctx.checkIn, ctx.checkOut) > 0);
}

export function hasCompleteBookingTarget(ctx) {
  return Boolean(ctx.property && ctx.branch && hasDateRange(ctx));
}

/**
 * Bước tiến trình hiện tại trên màn discovery (tìm kiếm vs chọn cơ sở).
 * @param {BookingContext} ctx
 */
export function getDiscoveryProgressStep(ctx) {
  return hasDateRange(ctx) ? 'property' : 'search';
}

export function getDiscoveryHref(ctx = {}, extra = {}) {
  return buildUrl('/booking', discoveryContext(ctx), extra);
}

/** Quay lại danh sách cơ sở — không tự nhảy bước dù chỉ 1 kết quả. */
export function getDiscoveryListHref(ctx = {}, extra = {}) {
  return getDiscoveryHref(ctx, { ...extra, list: '1' });
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
/**
 * @param {{ city?: string; checkIn?: string; checkOut?: string; kind?: string }} values
 * @returns {{ ctx: BookingContext; error?: string }}
 */
export function formValuesToContext(values) {
  const cityInput = values.city?.trim() ?? '';
  const city = normalizeCity(cityInput) ?? (cityInput || undefined);
  const checkIn = values.checkIn || undefined;
  const checkOut = values.checkOut || undefined;

  if (checkIn && !checkOut) {
    return { ctx: {}, error: 'Vui lòng chọn ngày trả phòng.' };
  }
  if (!checkIn && checkOut) {
    return { ctx: {}, error: 'Vui lòng chọn ngày nhận phòng.' };
  }
  if (checkIn && checkOut && countNights(checkIn, checkOut) < 1) {
    return { ctx: {}, error: 'Ngày trả phòng phải sau ngày nhận phòng.' };
  }

  /** @type {BookingContext} */
  const ctx = {
    checkIn,
    checkOut,
    kind: values.kind && values.kind !== 'all' ? values.kind : undefined,
  };
  if (city) {
    ctx.city = city;
    if (!BOOKING_CITY_OPTIONS.includes(city)) ctx.q = cityInput;
  }
  return { ctx };
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

/**
 * Sau submit tìm kiếm — về discovery với bộ lọc mới.
 * Bỏ property/branch/list; nếu chỉ 1 cơ sở PropertyDiscovery sẽ auto-advance.
 */
export function resolveSearchDestination(ctx) {
  return buildUrl('/booking', discoveryContext(ctx), { list: '' });
}

/**
 * @param {number} count
 * @param {URLSearchParams | string} searchParams
 */
export function shouldAutoAdvanceProperty(count, searchParams) {
  const params =
    searchParams instanceof URLSearchParams
      ? searchParams
      : new URLSearchParams(typeof searchParams === 'string' ? searchParams : '');
  return count === 1 && !params.get('list') && !params.get('property');
}

export const BOOKING_STEP_ORDER = ['search', 'property', 'branch', 'rooms', 'checkout'];

/** Giữ ngày / địa điểm khi nhảy bước */
function stepContextBase(ctx = {}) {
  return {
    city: ctx.city,
    checkIn: ctx.checkIn,
    checkOut: ctx.checkOut,
    kind: ctx.kind,
    q: ctx.q,
  };
}

/**
 * URL cho từng bước tiến trình (giữ checkIn/checkOut/property/branch).
 *
 * @param {'search'|'property'|'branch'|'rooms'|'checkout'} stepId
 * @param {BookingContext} [ctx]
 * @param {{ slug?: string; guests?: string }} [extra]
 */
export function getBookingStepHref(stepId, ctx = {}, extra = {}) {
  const base = stepContextBase(ctx);

  switch (stepId) {
    case 'search':
      return buildUrl('/booking', base, { focus: 'search', list: '1' });
    case 'property':
      return buildUrl('/booking', base, { list: '1' });
    case 'branch':
      if (!ctx.property) return getBookingStepHref('property', ctx, extra);
      return buildUrl('/booking', { ...base, property: ctx.property });
    case 'rooms':
      if (!ctx.property || !ctx.branch) {
        return ctx.property
          ? getBookingStepHref('branch', ctx, extra)
          : getBookingStepHref('property', ctx, extra);
      }
      return buildUrl('/booking', {
        ...base,
        property: ctx.property,
        branch: ctx.branch,
      });
    case 'checkout':
      if (!extra.slug) return getBookingStepHref('rooms', ctx, extra);
      return buildUrl(
        '/checkout',
        { ...base, property: ctx.property, branch: ctx.branch },
        { slug: extra.slug, guests: extra.guests },
      );
    default:
      return '/booking';
  }
}

/**
 * Bước có thể mở (đủ dữ liệu trong context).
 *
 * @param {'search'|'property'|'branch'|'rooms'|'checkout'} stepId
 * @param {BookingContext} [ctx]
 * @param {{ slug?: string }} [extra]
 */
export function isBookingStepReachable(stepId, ctx = {}, extra = {}) {
  if (stepId === 'search' || stepId === 'property') return true;
  if (stepId === 'branch') return Boolean(ctx.property);
  if (stepId === 'rooms') return Boolean(ctx.property && ctx.branch);
  if (stepId === 'checkout') {
    return Boolean(ctx.property && ctx.branch && extra.slug && hasDateRange(ctx));
  }
  return false;
}
