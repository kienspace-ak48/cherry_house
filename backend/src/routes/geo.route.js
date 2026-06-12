const express = require('express');
const geoController = require('../controllers/geo.controller');

const router = express.Router();

/** 34 tỉnh/thành phố VN (sau sắp xếp 2025) */
router.get('/provinces', geoController.provinces);
/** Điểm đến lưu trú phổ biến + map tỉnh */
router.get('/destinations', geoController.destinations);
/** Thành phố có cơ sở đang hoạt động (tìm kiếm booking) */
router.get('/catalog-cities', geoController.catalogCities);
/** Gộp — tiện cho client load một lần */
router.get('/bundle', geoController.bundle);

module.exports = router;
