const multer = require("multer");

const storage = multer.memoryStorage();

/** Media Library: ảnh + video một cửa (byte). */
const MAX_MEDIA_BYTES = 120 * 1024 * 1024;

const uploadImage = multer({
  storage,
  limits: { fileSize: 1024 * 1024 * 5 }, // 5MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) cb(null, true);
    else cb(new Error("Only images are allowed"), false);
  },
});

const uploadVideo = multer({
  storage,
  limits: { fileSize: 1024 * 1024 * 10 },// 10MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("video/")) cb(null, true);
    else cb(new Error("Only videos are allowed"), false);
  },
});

/** Ảnh (gif, jpeg, …) hoặc video (mp4, webm, …) */
const uploadMedia = multer({
  storage,
  limits: { fileSize: MAX_MEDIA_BYTES },
  fileFilter: (req, file, cb) => {
    const mime = String(file.mimetype || "").toLowerCase();
    if (mime.startsWith("image/") || mime.startsWith("video/")) {
      cb(null, true);
      return;
    }
    cb(new Error("Chỉ chấp nhận ảnh hoặc video (gif, mp4, webm, …)"), false);
  },
});

module.exports = { uploadImage, uploadVideo, uploadMedia };
