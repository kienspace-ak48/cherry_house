const roomTypeService = require('../services/roomType.service');
const amenityService = require('../services/amenity.service');
const { renderAdminPage } = require('../utils/adminRender');

const ROOM_CATEGORIES = [
  { value: 'Standard', label: 'Standard' },
  { value: 'Deluxe', label: 'Deluxe' },
  { value: 'Suite', label: 'Suite' },
  { value: 'Penthouse', label: 'Penthouse' },
];

function emptyRoomType() {
  return {
    slug: '',
    badge: '',
    title: '',
    category: 'Standard',
    areaSqm: 22,
    bedLabel: '',
    capacityLabel: '',
    basePriceVnd: 0,
    checkInTime: '14:00',
    checkOutTime: '12:00',
    paragraphs: [],
    policyBullets: [],
    isActive: true,
    gallery: [],
    amenities: [],
  };
}

function formatPriceVnd(amount) {
  return Number(amount || 0).toLocaleString('vi-VN');
}

async function list(req, res) {
  try {
    const roomTypes = await roomTypeService.list(req.query);
    renderAdminPage(req, res, 'admin/room-types/index', {
      pageTitle: 'Loại phòng',
      adminPage: 'room-types',
      breadcrumbs: [
        { label: 'Dashboard', href: '/admin' },
        { label: 'Loại phòng' },
      ],
      roomTypes,
      formatPriceVnd,
      flash: req.query.flash || null,
      msg: req.query.msg || null,
    });
  } catch (error) {
    renderAdminPage(req, res, 'admin/room-types/index', {
      pageTitle: 'Loại phòng',
      adminPage: 'room-types',
      breadcrumbs: [
        { label: 'Dashboard', href: '/admin' },
        { label: 'Loại phòng' },
      ],
      roomTypes: [],
      formatPriceVnd,
      formError: error.message,
    });
  }
}

async function createForm(req, res) {
  const allAmenities = await amenityService.list().catch(() => []);
  renderAdminPage(req, res, 'admin/room-types/form', {
    pageTitle: 'Thêm loại phòng',
    adminPage: 'room-types',
    breadcrumbs: [
      { label: 'Dashboard', href: '/admin' },
      { label: 'Loại phòng', href: '/admin/room-types' },
      { label: 'Thêm mới' },
    ],
    mode: 'create',
    roomType: emptyRoomType(),
    roomCategories: ROOM_CATEGORIES,
    allAmenities,
  });
}

async function create(req, res) {
  try {
    const [allAmenities] = await Promise.all([amenityService.list()]);
    await roomTypeService.createFromAdmin(req.body);
    res.redirect('/admin/room-types?flash=created');
  } catch (error) {
    const allAmenities = await amenityService.list().catch(() => []);
    renderAdminPage(req, res, 'admin/room-types/form', {
      pageTitle: 'Thêm loại phòng',
      adminPage: 'room-types',
      breadcrumbs: [
        { label: 'Dashboard', href: '/admin' },
        { label: 'Loại phòng', href: '/admin/room-types' },
        { label: 'Thêm mới' },
      ],
      mode: 'create',
      roomType: {
        ...emptyRoomType(),
        slug: req.body.slug || '',
        badge: req.body.badge || '',
        title: req.body.title || '',
        category: req.body.category || 'Standard',
        areaSqm: req.body.areaSqm || 22,
        bedLabel: req.body.bedLabel || '',
        capacityLabel: req.body.capacityLabel || '',
        basePriceVnd: req.body.basePriceVnd || 0,
        checkInTime: req.body.checkInTime || '14:00',
        checkOutTime: req.body.checkOutTime || '12:00',
        paragraphs: Array.isArray(req.body.paragraph) ? req.body.paragraph : [],
        policyBullets: Array.isArray(req.body.policyBullet) ? req.body.policyBullet : [],
        gallery: Array.isArray(req.body.galleryImageUrl)
          ? req.body.galleryImageUrl.map((url, i) => ({ imageUrl: url, sortOrder: i }))
          : [],
        amenities: [],
      },
      roomCategories: ROOM_CATEGORIES,
      allAmenities,
      formError: error.message,
    });
  }
}

async function editForm(req, res) {
  try {
    const [roomType, allAmenities] = await Promise.all([
      roomTypeService.getByIdWithRelations(req.params.id),
      amenityService.list(),
    ]);
    if (!roomType) {
      return res.redirect('/admin/room-types?flash=notfound');
    }
    renderAdminPage(req, res, 'admin/room-types/form', {
      pageTitle: 'Sửa loại phòng',
      adminPage: 'room-types',
      breadcrumbs: [
        { label: 'Dashboard', href: '/admin' },
        { label: 'Loại phòng', href: '/admin/room-types' },
        { label: roomType.title },
      ],
      mode: 'edit',
      roomType,
      roomCategories: ROOM_CATEGORIES,
      allAmenities,
    });
  } catch (error) {
    res.redirect(`/admin/room-types?flash=error&msg=${encodeURIComponent(error.message)}`);
  }
}

async function update(req, res) {
  try {
    await roomTypeService.updateFromAdmin(req.params.id, req.body);
    res.redirect('/admin/room-types?flash=updated');
  } catch (error) {
    const [roomType, allAmenities] = await Promise.all([
      roomTypeService.getByIdWithRelations(req.params.id).catch(() => null),
      amenityService.list().catch(() => []),
    ]);
    renderAdminPage(req, res, 'admin/room-types/form', {
      pageTitle: 'Sửa loại phòng',
      adminPage: 'room-types',
      breadcrumbs: [
        { label: 'Dashboard', href: '/admin' },
        { label: 'Loại phòng', href: '/admin/room-types' },
        { label: roomType?.title || 'Sửa' },
      ],
      mode: 'edit',
      roomType: roomType || { id: req.params.id, ...emptyRoomType() },
      roomCategories: ROOM_CATEGORIES,
      allAmenities,
      formError: error.message,
    });
  }
}

async function remove(req, res) {
  try {
    await roomTypeService.remove(req.params.id);
    res.redirect('/admin/room-types?flash=deleted');
  } catch (error) {
    res.redirect(`/admin/room-types?flash=error&msg=${encodeURIComponent(error.message)}`);
  }
}

module.exports = {
  list,
  createForm,
  create,
  editForm,
  update,
  remove,
};
