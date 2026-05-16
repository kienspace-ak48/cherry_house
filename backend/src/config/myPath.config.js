const path = require('path');

const ROOT_PATH = path.resolve(__dirname, '../../');
const SRC_PATH = path.resolve(ROOT_PATH, 'src');
/** Folder tùy chỉnh (upload, CDN bridge, ...) — không dùng cho bundle React */
const PUBLIC_PATH = path.resolve(ROOT_PATH, 'public');
/** Output `npm run build` của frontend (Vite → outDir khớp với đường này) */
const CLIENT_DIST_PATH = path.resolve(ROOT_PATH, 'client');
const ENV_PATH = path.resolve(ROOT_PATH, '.env');

module.exports = {
    ROOT_PATH,
    SRC_PATH,
    PUBLIC_PATH,
    CLIENT_DIST_PATH,
    ENV_PATH,
};