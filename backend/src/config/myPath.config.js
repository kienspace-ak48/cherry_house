const path = require('path');

const ROOT_PATH = path.resolve(__dirname, '../../');
const SRC_PATH = path.resolve(ROOT_PATH, 'src');
/** Folder tùy chỉnh (upload, CDN bridge, ...) — không dùng cho bundle React */
const PUBLIC_PATH = path.resolve(ROOT_PATH, 'public');
/** Output `npm run build` của frontend (Vite → outDir khớp với đường này) */
const CLIENT_DIST_PATH = path.resolve(ROOT_PATH, 'client');
const ENV_PATH = path.resolve(ROOT_PATH, '.env');
const VIEWS_PATH = path.resolve(SRC_PATH, 'views');
const UPLOADS_PATH = path.resolve(PUBLIC_PATH, 'uploads');
const GALLERY_UPLOAD_PATH = path.resolve(UPLOADS_PATH, 'gallery');
const BOOKING_SIGNATURE_UPLOAD_PATH = path.resolve(UPLOADS_PATH, 'bookings', 'signatures');
/** SQL dumps — chỉ admin tải qua route có auth */
const BACKUPS_PATH = path.resolve(ROOT_PATH, 'backups');

module.exports = {
    ROOT_PATH,
    SRC_PATH,
    PUBLIC_PATH,
    CLIENT_DIST_PATH,
    ENV_PATH,
    VIEWS_PATH,
    UPLOADS_PATH,
    GALLERY_UPLOAD_PATH,
    BOOKING_SIGNATURE_UPLOAD_PATH,
    BACKUPS_PATH,
};