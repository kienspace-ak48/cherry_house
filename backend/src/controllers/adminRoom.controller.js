const inventoryRoomService = require('../services/inventoryRoom.service');
const branchService = require('../services/branch.service');
const roomTypeService = require('../services/roomType.service');
const { renderAdminPage } = require('../utils/adminRender');

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

async function list(req, res) {
  try {
    const filters = {};
    if (req.query.branchId) filters.branchId = req.query.branchId;
    if (req.query.roomTypeId) filters.roomTypeId = req.query.roomTypeId;
    if (req.query.status) filters.status = req.query.status;

    const [rooms, branches, roomTypes] = await Promise.all([
      inventoryRoomService.list(filters),
      branchService.listBranches(),
      roomTypeService.list(),
    ]);

    renderAdminPage(req, res, 'admin/rooms/index', {
      pageTitle: 'Phòng',
      adminPage: 'rooms',
      breadcrumbs: [
        { label: 'Dashboard', href: '/admin' },
        { label: 'Phòng' },
      ],
      rooms,
      branches,
      roomTypes,
      filterBranchId: req.query.branchId ? String(req.query.branchId) : '',
      filterRoomTypeId: req.query.roomTypeId ? String(req.query.roomTypeId) : '',
      filterStatus: req.query.status ? String(req.query.status) : '',
      formatPriceVnd,
      statusLabel,
      statusBadgeClass,
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
      roomTypes: [],
      filterBranchId: '',
      filterRoomTypeId: '',
      filterStatus: '',
      formatPriceVnd,
      statusLabel,
      statusBadgeClass,
      roomStatuses: ROOM_STATUSES,
      formError: error.message,
    });
  }
}

async function createForm(req, res) {
  const [branches, roomTypes] = await Promise.all([
    branchService.listBranches(),
    roomTypeService.list(),
  ]);

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
    roomTypes,
    roomStatuses: ROOM_STATUSES,
    preselectBranchId: req.query.branchId || '',
    preselectRoomTypeId: req.query.roomTypeId || '',
  });
}

async function create(req, res) {
  try {
    await inventoryRoomService.create(parseRoomFormBody(req.body));
    res.redirect('/admin/rooms?flash=created');
  } catch (error) {
    const [branches, roomTypes] = await Promise.all([
      branchService.listBranches(),
      roomTypeService.list(),
    ]);
    renderAdminPage(req, res, 'admin/rooms/form', {
      pageTitle: 'Thêm phòng',
      adminPage: 'rooms',
      breadcrumbs: [
        { label: 'Dashboard', href: '/admin' },
        { label: 'Phòng', href: '/admin/rooms' },
        { label: 'Thêm mới' },
      ],
      mode: 'create',
      room: parseRoomFormBody(req.body),
      branches,
      roomTypes,
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
    const [branches, roomTypes] = await Promise.all([
      branchService.listBranches(),
      roomTypeService.list(),
    ]);

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
      roomTypes,
      roomStatuses: ROOM_STATUSES,
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
    const [branches, roomTypes] = await Promise.all([
      branchService.listBranches(),
      roomTypeService.list(),
    ]);
    const body = parseRoomFormBody(req.body);
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
      roomTypes,
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
