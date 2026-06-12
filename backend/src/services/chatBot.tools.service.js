const catalogService = require('./catalog.service');
const propertyRepository = require('../repositories/property.repository');
const branchRepository = require('../repositories/branch.repository');
const prisma = require('../config/prisma.config');
const { getBranchOccupancy } = require('../modules/booking/bookingOccupancy.service');
const { getClientAppUrl } = require('../config/appUrl.config');

const roomContextInclude = {
  branch: { include: { property: true } },
  roomType: true,
};

function inactivePropertyMessage(name) {
  return `Cơ sở **${name}** hiện **tạm ngừng hoạt động** — không nhận đặt phòng mới. Bạn có thể xem cơ sở khác cùng thành phố.`;
}

function inactiveBranchMessage(branchName, propertyName) {
  return `Chi nhánh **${branchName}** (${propertyName}) hiện **tạm ngừng hoạt động** — không nhận đặt phòng mới.`;
}

function inactiveRoomMessage(code) {
  return `Phòng **${code}** hiện **tạm ngừng** — không nhận đặt mới. Bạn thử phòng khác hoặc chi nhánh khác nhé.`;
}

async function resolvePropertyBySlug(slug) {
  const propertySlug = typeof slug === 'string' ? slug.trim() : '';
  if (!propertySlug) {
    return { error: 'slug_required', message: 'Thiếu slug cơ sở.' };
  }

  const row = await propertyRepository.findBySlug(propertySlug);
  if (!row) {
    return {
      error: 'property_not_found',
      slug: propertySlug,
      message: `Không tìm thấy cơ sở "${propertySlug}".`,
    };
  }
  if (!row.isActive) {
    return {
      error: 'property_inactive',
      slug: propertySlug,
      propertyName: row.name,
      city: row.city,
      message: inactivePropertyMessage(row.name),
    };
  }
  return { property: row };
}

async function resolveBranchForProperty(property, branchCode) {
  const code = typeof branchCode === 'string' ? branchCode.trim().toLowerCase() : '';
  if (!code) {
    return { error: 'branch_code_required', message: 'Thiếu mã chi nhánh.' };
  }

  const branch = await branchRepository.findByPropertyAndCode(property.id, code);
  if (!branch) {
    return {
      error: 'branch_not_found',
      branchCode: code,
      propertyName: property.name,
      message: `Không tìm thấy chi nhánh "${code}" tại ${property.name}.`,
    };
  }
  if (!branch.isActive) {
    return {
      error: 'branch_inactive',
      branchCode: code,
      branchName: branch.name,
      propertyName: property.name,
      message: inactiveBranchMessage(branch.name, property.name),
    };
  }
  return { branch };
}

async function findRoomsByCodeInDb(roomCode) {
  const code = normalizeRoomCode(roomCode);
  if (!code) return [];

  const rooms = await prisma.inventoryRoom.findMany({
    where: {
      OR: [
        { code: { equals: code } },
        { code: { equals: code.toLowerCase() } },
      ],
    },
    include: roomContextInclude,
    take: 20,
  });

  return rooms.filter((room) => roomCodesEquivalent(code, room.code, true));
}

function detectInactiveFromRoom(room, roomCode) {
  const code = normalizeRoomCode(roomCode);
  const property = room.branch?.property;
  const branch = room.branch;

  if (!property?.isActive) {
    return {
      error: 'property_inactive',
      roomCode: code,
      propertyName: property?.name || null,
      message: inactivePropertyMessage(property?.name || 'Cơ sở'),
    };
  }
  if (!branch?.isActive) {
    return {
      error: 'branch_inactive',
      roomCode: code,
      branchName: branch?.name || null,
      propertyName: property?.name || null,
      message: inactiveBranchMessage(branch?.name || 'Chi nhánh', property?.name || 'Cơ sở'),
    };
  }
  if (!room.isActive) {
    return {
      error: 'room_inactive',
      roomCode: code,
      branchName: branch?.name || null,
      propertyName: property?.name || null,
      message: inactiveRoomMessage(code),
    };
  }
  return null;
}

async function summarizeCityPropertyStatus(city) {
  const normalizedCity = normalizeCity(city);
  if (!normalizedCity) return null;

  const rows = await propertyRepository.findAll({ city: normalizedCity });
  if (!rows.length) return null;

  const active = rows.filter((p) => p.isActive);
  const inactive = rows.filter((p) => !p.isActive);

  if (active.length > 0) return null;

  return {
    error: 'city_inactive_only',
    city: normalizedCity,
    inactiveProperties: inactive.map((p) => ({ name: p.name, slug: p.slug })),
    message:
      `Cherry House tại **${normalizedCity}** hiện **tạm ngừng** toàn bộ cơ sở đang lưu (${inactive.map((p) => p.name).join(', ')}). `
      + 'Bạn thử thành phố khác hoặc hỏi lại sau nhé.',
  };
}

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

  const resolved = await resolvePropertyBySlug(propertySlug);
  if (resolved.error) return resolved;

  const property = await catalogService.getPropertyBySlug(propertySlug);
  if (!property) {
    return {
      error: 'property_not_found',
      slug: propertySlug,
      message: `Không tìm thấy cơ sở "${propertySlug}".`,
    };
  }

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

  if (normalizedCity) {
    const cityStatus = await summarizeCityPropertyStatus(normalizedCity);
    if (cityStatus) return { ...cityStatus, rooms: [], count: 0, supportedCities: SUPPORTED_CITIES };
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
    const dbRooms = await findRoomsByCodeInDb(code);
    for (const room of dbRooms) {
      const inactive = detectInactiveFromRoom(room, code);
      if (inactive) return inactive;
    }

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

  const propertyResolved = await resolvePropertyBySlug(slug);
  if (propertyResolved.error) return propertyResolved;

  const branchResolved = await resolveBranchForProperty(propertyResolved.property, code);
  if (branchResolved.error) return branchResolved;

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
      inactiveNote: r.occupancy === 'inactive' ? 'Phòng tạm ngừng — không nhận đặt mới.' : null,
      bookingUrl:
        r.occupancy === 'inactive'
          ? null
          : buildBookingUrl({
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
