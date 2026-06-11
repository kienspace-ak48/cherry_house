const inventoryRoomService = require('../services/inventoryRoom.service');
const branchService = require('../services/branch.service');
const roomTypeService = require('../services/roomType.service');
const roomTypeRepository = require('../repositories/roomType.repository');
const propertyService = require('../services/property.service');
const { renderAdminPage, kindLabel } = require('../utils/adminRender');
const { getClientAppUrl } = require('../config/appUrl.config');
const { toDetailSlug } = require('../utils/catalog.mapper');

const ROOM_STATUSES = [
  { value: 'available', label: 'Còn phòng (available)' },
  { value: 'pending', label: 'Đang giữ (pending)' },
  { value: 'booked', label: 'Đã đặt (booked)' },
];

function statusLabel(status) {
  return ROOM_STATUSES.find((s) => s.value === status)?.label || status;
}

function statusBadgeClass(status) {
  const map = { available: 'success', pending: 'warning', booked: 'secondary' };
  return map[status] || 'secondary';
}

function parseRoomFormBody(body) {
  const branchId = Number.parseInt(body.branchId, 10);
  const roomTypeId = Number.parseInt(body.roomTypeId, 10);
  const priceVnd = Number.parseInt(body.priceVnd, 10);
  const maxAdults = Number.parseInt(body.maxAdults, 10);
  const maxChildren = Number.parseInt(body.maxChildren, 10);

  return {
    branchId: Number.isNaN(branchId) ? undefined : branchId,
    roomTypeId: Number.isNaN(roomTypeId) ? undefined : roomTypeId,
    code: body.code,
    priceVnd: Number.isNaN(priceVnd) ? 0 : priceVnd,
    description: body.description,
    imageUrl: body.imageUrl || null,
    galleryImageUrl: body.galleryImageUrl,
    extraParagraph: body.extraParagraph,
    altText: body.altText || null,
    maxAdults: Number.isNaN(maxAdults) ? 2 : maxAdults,
    maxChildren: Number.isNaN(maxChildren) ? 0 : maxChildren,
    status: body.status || 'available',
    isActive: body.isActive === 'on' || body.isActive === true || body.isActive === '1',
  };
}

function emptyRoom() {
  return {
    branchId: '',
    roomTypeId: '',
    code: '',
    priceVnd: 0,
    description: '',
    imageUrl: '',
    galleryImages: [],
    extraParagraphs: [],
    altText: '',
    maxAdults: 2,
    maxChildren: 0,
    status: 'available',
    isActive: true,
  };
}

function formatPriceVnd(amount) {
  return Number(amount || 0).toLocaleString('vi-VN');
}

async function loadRoomFormData() {
  const [branches, roomTypes, properties, roomTypeCatalog] = await Promise.all([
    branchService.listBranches(),
    roomTypeService.list(),
    propertyService.listProperties(),
    roomTypeRepository.findAllForAdminCatalog(),
  ]);
  return { branches, roomTypes, properties, roomTypeCatalog };
}

function roomFromFailedSubmit(body) {
  const parsed = parseRoomFormBody(body);
  const galleryImages = Array.isArray(body.galleryImageUrl)
    ? body.galleryImageUrl.map((u) => String(u).trim()).filter(Boolean)
    : [];
  const extraParagraphs = Array.isArray(body.extraParagraph)
    ? body.extraParagraph.map((p) => String(p).trim()).filter(Boolean)
    : [];
  return { ...parsed, galleryImages, extraParagraphs };
}

function buildRoomPreviewUrl(req, room) {
  if (!room?.code || !room.branchId) return null;
  const branch = room.branch;
  const propertySlug = branch?.property?.slug;
  const branchCode = branch?.code;
  if (!propertySlug || !branchCode) return null;
  const params = new URLSearchParams({
    property: propertySlug,
    branch: branchCode,
  });
  return `${getClientAppUrl()}/room/${toDetailSlug(room.code)}?${params.toString()}`;
}

const ROOMS_GROUPED_THRESHOLD = 30;
const TABLE_PAGE_SIZE = 25;
const BRANCH_PREVIEW_LIMIT = 5;

function filterRoomsBySearch(rooms, searchQ) {
  const q = typeof searchQ === 'string' ? searchQ.trim().toLowerCase() : '';
  if (!q) return rooms;
  return rooms.filter((room) => {
    const code = String(room.code || '').toLowerCase();
    const desc = String(room.description || '').toLowerCase();
    return code.includes(q) || desc.includes(q);
  });
}

function enrichRoomsForTable(rooms, branches, properties) {
  const branchById = new Map(branches.map((b) => [b.id, b]));
  const propertyById = new Map(properties.map((p) => [p.id, p]));

  return rooms
    .map((room) => {
      const branch = branchById.get(room.branchId);
      const property = branch ? propertyById.get(branch.propertyId) : null;
      return { room, branch, property };
    })
    .sort((a, b) => {
      const byProperty = (a.property?.name || '').localeCompare(b.property?.name || '', 'vi');
      if (byProperty !== 0) return byProperty;
      const byBranch = (a.branch?.name || '').localeCompare(b.branch?.name || '', 'vi');
      if (byBranch !== 0) return byBranch;
      return (a.room.code || '').localeCompare(b.room.code || '', 'vi');
    });
}

function buildRoomsListQuery(parts = {}) {
  const params = new URLSearchParams();
  Object.entries(parts).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      params.set(key, String(value));
    }
  });
  const qs = params.toString();
  return qs ? `?${qs}` : '';
}

/**
 * Nhóm phòng theo cơ sở → chi nhánh (giữ cấu trúc phân cấp trên UI admin)
 */
function groupRoomsForDisplay(rooms, branches, properties, options = {}) {
  const { filterPropertyId = '', filterBranchId = '', hideEmptyBranches = false } = options;

  const roomsByBranch = new Map();
  for (const room of rooms) {
    const list = roomsByBranch.get(room.branchId) || [];
    list.push(room);
    roomsByBranch.set(room.branchId, list);
  }

  let visibleProperties = properties;
  if (filterPropertyId) {
    visibleProperties = properties.filter((p) => String(p.id) === filterPropertyId);
  }

  return visibleProperties
    .map((property) => {
      let propertyBranches = branches.filter((b) => b.propertyId === property.id);
      if (filterBranchId) {
        propertyBranches = propertyBranches.filter((b) => String(b.id) === filterBranchId);
      }

      const branchGroups = propertyBranches
        .map((branch) => ({
          branch,
          rooms: roomsByBranch.get(branch.id) || [],
        }))
        .filter((group) => {
          if (filterBranchId) return true;
          if (hideEmptyBranches) return group.rooms.length > 0;
          return true;
        });

      return { property, branchGroups };
    })
    .filter((group) => group.branchGroups.length > 0);
}

async function list(req, res) {
  try {
    const filters = {};
    if (req.query.branchId) filters.branchId = req.query.branchId;
    if (req.query.roomTypeId) filters.roomTypeId = req.query.roomTypeId;
    if (req.query.status) filters.status = req.query.status;

    const filterPropertyId = req.query.propertyId ? String(req.query.propertyId) : '';
    const filterBranchId = req.query.branchId ? String(req.query.branchId) : '';
    const filterRoomTypeId = req.query.roomTypeId ? String(req.query.roomTypeId) : '';
    const filterStatus = req.query.status ? String(req.query.status) : '';
    const searchQ = typeof req.query.q === 'string' ? req.query.q.trim() : '';
    const hasRoomFilters = Boolean(filterRoomTypeId || filterStatus || searchQ);

    const [allRooms, branches, roomTypes, properties] = await Promise.all([
      inventoryRoomService.list(filters),
      branchService.listBranches(),
      roomTypeService.list(),
      propertyService.listProperties(),
    ]);

    const filterBranches = filterPropertyId
      ? branches.filter((b) => String(b.propertyId) === filterPropertyId)
      : branches;

    let rooms = allRooms;
    if (filterPropertyId && !filterBranchId) {
      const branchIds = new Set(filterBranches.map((b) => b.id));
      rooms = allRooms.filter((room) => branchIds.has(room.branchId));
    }
    rooms = filterRoomsBySearch(rooms, searchQ);

    const requestedView = req.query.view === 'table' || req.query.view === 'grouped'
      ? req.query.view
      : '';
    const viewMode = requestedView || (rooms.length > ROOMS_GROUPED_THRESHOLD ? 'table' : 'grouped');
    const useGroupedView = viewMode === 'grouped';

    const page = Math.max(1, Number.parseInt(req.query.page, 10) || 1);
    const tableRows = enrichRoomsForTable(rooms, branches, properties);
    const totalPages = Math.max(1, Math.ceil(tableRows.length / TABLE_PAGE_SIZE));
    const safePage = Math.min(page, totalPages);
    const paginatedTableRows = tableRows.slice(
      (safePage - 1) * TABLE_PAGE_SIZE,
      safePage * TABLE_PAGE_SIZE,
    );

    const listQueryBase = {
      propertyId: filterPropertyId,
      branchId: filterBranchId,
      roomTypeId: filterRoomTypeId,
      status: filterStatus,
      q: searchQ,
    };

    const selectedBranch = filterBranchId
      ? branches.find((b) => String(b.id) === filterBranchId) || null
      : null;
    const selectedProperty = filterPropertyId
      ? properties.find((p) => String(p.id) === filterPropertyId) || null
      : selectedBranch
        ? properties.find((p) => p.id === selectedBranch.propertyId) || null
        : null;

    const propertyGroups = groupRoomsForDisplay(rooms, branches, properties, {
      filterPropertyId,
      filterBranchId,
      hideEmptyBranches: hasRoomFilters,
    });

    renderAdminPage(req, res, 'admin/rooms/index', {
      pageTitle: 'Phòng',
      adminPage: 'rooms',
      breadcrumbs: [
        { label: 'Dashboard', href: '/admin' },
        { label: 'Phòng' },
      ],
      rooms,
      branches,
      filterBranches,
      roomTypes,
      properties,
      propertyGroups,
      selectedBranch,
      selectedProperty,
      filterPropertyId,
      filterBranchId,
      filterRoomTypeId,
      filterStatus,
      hasRoomFilters,
      searchQ,
      viewMode,
      useGroupedView,
      tableRows: paginatedTableRows,
      tableTotalRows: tableRows.length,
      page: safePage,
      totalPages,
      pageSize: TABLE_PAGE_SIZE,
      branchPreviewLimit: BRANCH_PREVIEW_LIMIT,
      groupedThreshold: ROOMS_GROUPED_THRESHOLD,
      buildRoomsListQuery,
      listQueryBase,
      formatPriceVnd,
      statusLabel,
      statusBadgeClass,
      kindLabel,
      roomStatuses: ROOM_STATUSES,
      flash: req.query.flash || null,
      msg: req.query.msg || null,
    });
  } catch (error) {
    renderAdminPage(req, res, 'admin/rooms/index', {
      pageTitle: 'Phòng',
      adminPage: 'rooms',
      breadcrumbs: [
        { label: 'Dashboard', href: '/admin' },
        { label: 'Phòng' },
      ],
      rooms: [],
      branches: [],
      filterBranches: [],
      roomTypes: [],
      properties: [],
      propertyGroups: [],
      selectedBranch: null,
      selectedProperty: null,
      filterPropertyId: '',
      filterBranchId: '',
      filterRoomTypeId: '',
      filterStatus: '',
      hasRoomFilters: false,
      searchQ: '',
      viewMode: 'grouped',
      useGroupedView: true,
      tableRows: [],
      tableTotalRows: 0,
      page: 1,
      totalPages: 1,
      pageSize: TABLE_PAGE_SIZE,
      branchPreviewLimit: BRANCH_PREVIEW_LIMIT,
      groupedThreshold: ROOMS_GROUPED_THRESHOLD,
      buildRoomsListQuery,
      listQueryBase: {},
      formatPriceVnd,
      statusLabel,
      statusBadgeClass,
      kindLabel,
      roomStatuses: ROOM_STATUSES,
      formError: error.message,
    });
  }
}

async function createForm(req, res) {
  const { branches, roomTypes, properties, roomTypeCatalog } = await loadRoomFormData();

  renderAdminPage(req, res, 'admin/rooms/form', {
    pageTitle: 'Thêm phòng',
    adminPage: 'rooms',
    breadcrumbs: [
      { label: 'Dashboard', href: '/admin' },
      { label: 'Phòng', href: '/admin/rooms' },
      { label: 'Thêm mới' },
    ],
    mode: 'create',
    room: emptyRoom(),
    branches,
    properties,
    roomTypes,
    roomTypeCatalog,
    roomStatuses: ROOM_STATUSES,
    preselectBranchId: req.query.branchId || '',
    preselectPropertyId: req.query.propertyId || '',
    preselectRoomTypeId: req.query.roomTypeId || '',
  });
}

async function create(req, res) {
  try {
    await inventoryRoomService.create(parseRoomFormBody(req.body));
    res.redirect('/admin/rooms?flash=created');
  } catch (error) {
    const { branches, roomTypes, properties, roomTypeCatalog } = await loadRoomFormData();
    renderAdminPage(req, res, 'admin/rooms/form', {
      pageTitle: 'Thêm phòng',
      adminPage: 'rooms',
      breadcrumbs: [
        { label: 'Dashboard', href: '/admin' },
        { label: 'Phòng', href: '/admin/rooms' },
        { label: 'Thêm mới' },
      ],
      mode: 'create',
      room: roomFromFailedSubmit(req.body),
      branches,
      properties,
      roomTypes,
      roomTypeCatalog,
      roomStatuses: ROOM_STATUSES,
      formError: error.message,
    });
  }
}

async function editForm(req, res) {
  try {
    const room = await inventoryRoomService.getById(req.params.id);
    if (!room) {
      return res.redirect('/admin/rooms?flash=notfound');
    }
    const { branches, roomTypes, properties, roomTypeCatalog } = await loadRoomFormData();

    renderAdminPage(req, res, 'admin/rooms/form', {
      pageTitle: 'Sửa phòng',
      adminPage: 'rooms',
      breadcrumbs: [
        { label: 'Dashboard', href: '/admin' },
        { label: 'Phòng', href: '/admin/rooms' },
        { label: room.code },
      ],
      mode: 'edit',
      room,
      branches,
      properties,
      roomTypes,
      roomTypeCatalog,
      roomStatuses: ROOM_STATUSES,
      previewUrl: buildRoomPreviewUrl(req, room),
    });
  } catch (error) {
    res.redirect(`/admin/rooms?flash=error&msg=${encodeURIComponent(error.message)}`);
  }
}

async function update(req, res) {
  try {
    await inventoryRoomService.update(req.params.id, parseRoomFormBody(req.body));
    res.redirect('/admin/rooms?flash=updated');
  } catch (error) {
    const { branches, roomTypes, properties, roomTypeCatalog } = await loadRoomFormData();
    const body = roomFromFailedSubmit(req.body);
    renderAdminPage(req, res, 'admin/rooms/form', {
      pageTitle: 'Sửa phòng',
      adminPage: 'rooms',
      breadcrumbs: [
        { label: 'Dashboard', href: '/admin' },
        { label: 'Phòng', href: '/admin/rooms' },
        { label: body.code || 'Sửa' },
      ],
      mode: 'edit',
      room: { ...body, id: req.params.id },
      branches,
      properties,
      roomTypes,
      roomTypeCatalog,
      roomStatuses: ROOM_STATUSES,
      formError: error.message,
    });
  }
}

async function remove(req, res) {
  try {
    await inventoryRoomService.remove(req.params.id);
    res.redirect('/admin/rooms?flash=deleted');
  } catch (error) {
    res.redirect(`/admin/rooms?flash=error&msg=${encodeURIComponent(error.message)}`);
  }
}

module.exports = {
  list,
  createForm,
  create,
  editForm,
  update,
  remove,
  statusLabel,
  statusBadgeClass,
};
