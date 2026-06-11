const catalogService = require('./catalog.service');
const { getBranchOccupancy } = require('../modules/booking/bookingOccupancy.service');
const { getClientAppUrl } = require('../config/appUrl.config');

const SUPPORTED_CITIES = [
  'Hà Nội',
  'Sa Pa',
  'Ninh Bình',
  'Đà Lạt',
  'Huế',
  'Hội An',
  'Đà Nẵng',
  'Nha Trang',
  'Vũng Tàu',
  'TP. Hồ Chí Minh',
];

function stripDiacritics(raw) {
  return String(raw || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
}

function normalizeCity(raw) {
  const t = typeof raw === 'string' ? raw.trim() : '';
  if (!t) return null;
  const lower = stripDiacritics(t);
  const exact = SUPPORTED_CITIES.find((c) => stripDiacritics(c) === lower);
  if (exact) return exact;
  const fuzzy = SUPPORTED_CITIES.find(
    (c) => lower.includes(stripDiacritics(c)) || stripDiacritics(c).includes(lower),
  );
  return fuzzy || null;
}

function formatVnd(value) {
  const n = Number(value);
  if (!Number.isFinite(n)) return '';
  return `${Math.round(n).toLocaleString('vi-VN')} đ`;
}

function normalizeRoomCode(raw) {
  return String(raw || '').trim().toUpperCase();
}

function branchMatchesHint(branchName, hint) {
  if (!hint) return true;
  const a = stripDiacritics(branchName);
  const b = stripDiacritics(hint);
  return a.includes(b) || b.includes(a);
}

function roomCodesEquivalent(queryCode, actualCode, allowNumberOnly) {
  const q = normalizeRoomCode(queryCode);
  const a = normalizeRoomCode(actualCode);
  if (q === a) return true;
  if (!allowNumberOnly) return false;
  return q.split('-').pop() === a.split('-').pop();
}

function buildBookingUrl({ propertySlug, branchCode, checkIn, checkOut, detailSlug }) {
  const base = getClientAppUrl();
  const params = new URLSearchParams();
  if (propertySlug) params.set('property', propertySlug);
  if (branchCode) params.set('branch', branchCode);
  if (checkIn) params.set('checkIn', checkIn);
  if (checkOut) params.set('checkOut', checkOut);
  const qs = params.toString();
  const path = detailSlug ? `/room/${detailSlug}` : '/booking';
  return qs ? `${base}${path}?${qs}` : `${base}${path}`;
}

async function listProperties({ city, kind } = {}) {
  const normalizedCity = normalizeCity(city);
  const query = {};
  if (normalizedCity) query.city = normalizedCity;
  if (kind) query.kind = String(kind).trim();

  const rows = await catalogService.listProperties(query);
  return {
    supportedCities: SUPPORTED_CITIES,
    cityQuery: city || null,
    cityResolved: normalizedCity,
    count: rows.length,
    properties: rows.map((p) => ({
      name: p.name,
      slug: p.slug,
      city: p.city,
      region: p.region,
      kind: p.kindLabel || p.kind,
      priceFromVnd: p.priceFromVnd,
      priceFromLabel: formatVnd(p.priceFromVnd),
      branchCount: p.branchCount,
      branches: (p.subBranches || []).map((b) => ({
        name: b.name,
        code: b.code || b.id,
        priceFromVnd: b.priceFromVnd,
      })),
      bookingUrl: buildBookingUrl({ propertySlug: p.slug }),
    })),
  };
}

async function getPropertyDetail({ slug } = {}) {
  const propertySlug = typeof slug === 'string' ? slug.trim() : '';
  if (!propertySlug) return { error: 'slug is required' };

  const property = await catalogService.getPropertyBySlug(propertySlug);
  if (!property) return { error: 'Không tìm thấy cơ sở', slug: propertySlug };

  return {
    name: property.name,
    slug: property.slug,
    city: property.city,
    region: property.region,
    kind: property.kindLabel || property.kind,
    tagline: property.tagline,
    description: property.description?.slice(0, 500),
    priceFromVnd: property.priceFromVnd,
    priceFromLabel: formatVnd(property.priceFromVnd),
    branches: (property.subBranches || []).map((b) => ({
      name: b.name,
      code: b.code || b.id,
      address: b.address,
      priceFromVnd: b.priceFromVnd,
      bookingUrl: buildBookingUrl({
        propertySlug: property.slug,
        branchCode: b.code || b.id,
      }),
    })),
    bookingUrl: buildBookingUrl({ propertySlug: property.slug }),
  };
}

async function searchAvailableRooms({
  city,
  checkIn,
  checkOut,
  maxPriceVnd,
  sortBy,
  limit,
} = {}) {
  const normalizedCity = normalizeCity(city);
  const maxPrice = maxPriceVnd != null ? Number(maxPriceVnd) : null;
  const take = Math.min(Math.max(Number(limit) || 12, 1), 20);

  const properties = await catalogService.listProperties(
    normalizedCity ? { city: normalizedCity } : {},
  );

  if (city && !normalizedCity) {
    return {
      error: 'city_not_supported',
      message: `Cherry House chưa có cơ sở tại "${city}".`,
      supportedCities: SUPPORTED_CITIES,
      rooms: [],
      count: 0,
    };
  }

  if (checkIn && checkOut && checkOut <= checkIn) {
    return { error: 'invalid_dates', message: 'Ngày trả phòng phải sau ngày nhận phòng.' };
  }

  const hasDates = Boolean(checkIn && checkOut);
  const results = [];

  for (const property of properties) {
    for (const branch of property.subBranches || []) {
      const branchCode = branch.code || branch.id;
      let occupancyByCode = new Map();

      if (hasDates) {
        try {
          const occ = await getBranchOccupancy({
            propertySlug: property.slug,
            branchCode,
            from: checkIn,
            to: checkOut,
          });
          for (const row of occ.rooms || []) {
            occupancyByCode.set(row.code, row.occupancy);
          }
        } catch {
          /* branch skip */
        }
      }

      const rooms = await catalogService.listRooms({
        propertySlug: property.slug,
        branchCode,
      });

      for (const room of rooms) {
        const occupancy = occupancyByCode.get(room.code);
        if (hasDates && occupancy && occupancy !== 'available') continue;
        if (maxPrice != null && Number.isFinite(maxPrice) && room.priceVnd > maxPrice) continue;

        results.push({
          propertyName: property.name,
          propertySlug: property.slug,
          city: property.city,
          branchName: branch.name,
          branchCode,
          roomCode: room.code,
          detailSlug: room.detailSlug,
          roomType: room.type || room.roomTypeTitle,
          priceVnd: room.priceVnd,
          priceLabel: formatVnd(room.priceVnd),
          capacity: room.capacityLabel,
          occupancy: hasDates ? (occupancy || 'available') : 'dates_not_provided',
          bookingUrl: buildBookingUrl({
            propertySlug: property.slug,
            branchCode,
            checkIn,
            checkOut,
            detailSlug: room.detailSlug,
          }),
        });
      }
    }
  }

  if (sortBy === 'cheapest' || sortBy === 'price_asc') {
    results.sort((a, b) => a.priceVnd - b.priceVnd);
  }

  return {
    supportedCities: SUPPORTED_CITIES,
    cityResolved: normalizedCity,
    checkIn: checkIn || null,
    checkOut: checkOut || null,
    maxPriceVnd: maxPrice,
    datesRequiredNote: hasDates
      ? null
      : 'Chưa có ngày — hiển thị phòng & giá tham khảo. Hỏi thêm ngày nhận/trả để kiểm tra trống thực tế.',
    count: results.length,
    rooms: results.slice(0, take),
  };
}

async function getRoomQuote({
  roomCode,
  propertySlug,
  branchCode,
  city,
  branchNameHint,
  checkIn,
  checkOut,
} = {}) {
  const code = normalizeRoomCode(roomCode);
  if (!code) return { error: 'roomCode is required', message: 'Thiếu mã phòng.' };

  if (checkIn && checkOut && checkOut <= checkIn) {
    return { error: 'invalid_dates', message: 'Ngày trả phòng phải sau ngày nhận phòng.' };
  }

  const normalizedCity = city ? normalizeCity(city) : null;
  const slugFilter = typeof propertySlug === 'string' ? propertySlug.trim() : '';
  const branchFilter = typeof branchCode === 'string' ? branchCode.trim().toLowerCase() : '';
  const branchHint = typeof branchNameHint === 'string' ? branchNameHint.trim() : '';

  const properties = await catalogService.listProperties(
    normalizedCity ? { city: normalizedCity } : {},
  );

  const matches = [];
  for (const property of properties) {
    if (slugFilter && property.slug !== slugFilter) continue;
    for (const branch of property.subBranches || []) {
      const bc = String(branch.code || branch.id).toLowerCase();
      if (branchFilter && bc !== branchFilter) continue;
      if (branchHint && !branchMatchesHint(branch.name, branchHint)) continue;

      const rooms = await catalogService.listRooms({
        propertySlug: property.slug,
        branchCode: bc,
      });

      const allowNumberOnly = Boolean(branchHint || branchFilter || slugFilter);
      for (const room of rooms) {
        if (roomCodesEquivalent(code, room.code, allowNumberOnly)) {
          matches.push({
            property,
            branch,
            branchCode: bc,
            room,
          });
        }
      }
    }
  }

  if (!matches.length) {
    return {
      error: 'room_not_found',
      roomCode: code,
      message: `Không tìm thấy phòng ${code}${normalizedCity ? ` tại ${normalizedCity}` : ''}.`,
    };
  }

  if (matches.length > 1 && !branchHint && !branchFilter && !slugFilter) {
    return {
      error: 'ambiguous_room',
      roomCode: code,
      message: `Mã ${code} có ở nhiều chi nhánh — bạn nói rõ cơ sở/chi nhánh nhé.`,
      matches: matches.slice(0, 5).map((m) => ({
        roomCode: m.room.code,
        propertyName: m.property.name,
        branchName: m.branch.name,
        branchCode: m.branchCode,
      })),
    };
  }

  const { property, branch, branchCode: bc, room } = matches[0];
  let occupancy = 'dates_not_provided';
  let nights = null;

  if (checkIn && checkOut) {
    try {
      const occ = await getBranchOccupancy({
        propertySlug: property.slug,
        branchCode: bc,
        from: checkIn,
        to: checkOut,
      });
      const row = (occ.rooms || []).find((r) => roomCodesEquivalent(code, r.code, true));
      occupancy = row?.occupancy || 'available';
    } catch {
      occupancy = 'dates_not_provided';
    }
    nights = Math.round(
      (new Date(`${checkOut}T12:00:00`).getTime() - new Date(`${checkIn}T12:00:00`).getTime())
        / 86400000,
    );
    if (nights < 1) nights = null;
  }

  const totalVnd = nights ? room.priceVnd * nights : null;

  return {
    roomCode: room.code,
    propertyName: property.name,
    propertySlug: property.slug,
    branchName: branch.name,
    branchCode: bc,
    priceVnd: room.priceVnd,
    priceLabel: formatVnd(room.priceVnd),
    occupancy,
    checkIn: checkIn || null,
    checkOut: checkOut || null,
    nights,
    totalVnd,
    totalLabel: totalVnd != null ? formatVnd(totalVnd) : null,
    bookingUrl: buildBookingUrl({
      propertySlug: property.slug,
      branchCode: bc,
      checkIn,
      checkOut,
      detailSlug: room.detailSlug,
    }),
  };
}

async function getBranchRoomStatus({ propertySlug, branchCode, checkIn, checkOut } = {}) {
  const slug = typeof propertySlug === 'string' ? propertySlug.trim() : '';
  const code = typeof branchCode === 'string' ? branchCode.trim() : '';
  if (!slug || !code) return { error: 'propertySlug và branchCode là bắt buộc' };

  const occ = await getBranchOccupancy({
    propertySlug: slug,
    branchCode: code,
    from: checkIn,
    to: checkOut,
  });

  return {
    propertyName: occ.propertyName,
    propertySlug: occ.propertySlug,
    branchName: occ.branchName,
    branchCode: occ.branchCode,
    checkIn: checkIn || null,
    checkOut: checkOut || null,
    summary: occ.summary,
    rooms: (occ.rooms || []).map((r) => ({
      code: r.code,
      detailSlug: r.detailSlug,
      priceVnd: r.priceVnd,
      priceLabel: formatVnd(r.priceVnd),
      occupancy: r.occupancy,
      bookingUrl: buildBookingUrl({
        propertySlug: slug,
        branchCode: code,
        checkIn,
        checkOut,
        detailSlug: r.detailSlug,
      }),
    })),
  };
}

const TOOL_HANDLERS = {
  list_properties: listProperties,
  get_property_detail: getPropertyDetail,
  search_available_rooms: searchAvailableRooms,
  get_branch_room_status: getBranchRoomStatus,
  get_room_quote: getRoomQuote,
};

async function executeTool(name, args) {
  const handler = TOOL_HANDLERS[name];
  if (!handler) return { error: `Unknown tool: ${name}` };
  return handler(args || {});
}

module.exports = {
  SUPPORTED_CITIES,
  executeTool,
  TOOL_HANDLERS,
  getRoomQuote,
  normalizeRoomCode,
  formatVnd,
  normalizeCity,
};
