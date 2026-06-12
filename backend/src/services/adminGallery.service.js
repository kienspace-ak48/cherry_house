const fs = require('fs/promises');
const path = require('path');
const mediaFolderRepository = require('../repositories/mediaFolder.repository');
const mediaImageRepository = require('../repositories/mediaImage.repository');
const { GALLERY_UPLOAD_PATH } = require('../config/myPath.config');
const { httpError, parseId } = require('../utils/http');
const { mapPrismaError } = require('../utils/crud');

const GALLERY_PUBLIC_PREFIX = 'uploads/gallery';

function toImageDto(image) {
  return {
    id: image.id,
    name: image.name,
    path: image.path,
  };
}

function requireFolderId(folderRaw) {
  const folder = String(folderRaw ?? '').trim();
  if (!folder || folder === 'all') {
    throw httpError('folder_id is required');
  }
  return parseId(folder, 'folder_id');
}

function sanitizeBaseName(originalName) {
  const ext = path.extname(originalName).toLowerCase();
  const base = path.basename(originalName, ext)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9_-]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .slice(0, 80);

  return `${base || 'image'}${ext || '.jpg'}`;
}

function mapFsWriteError(error) {
  const code = String(error?.code || '');
  if (code === 'EACCES' || code === 'EPERM') {
    return httpError(
      `Không ghi được file vào ${GALLERY_UPLOAD_PATH}. Trên VPS: chown/chmod thư mục public/uploads cho user chạy PM2.`,
      500,
    );
  }
  if (code === 'ENOSPC') {
    return httpError('Ổ đĩa VPS đầy — không thể lưu ảnh.', 507);
  }
  if (code === 'EROFS') {
    return httpError('Filesystem chỉ đọc — kiểm tra mount/quyền thư mục uploads.', 500);
  }
  return error;
}

async function ensureGalleryDir() {
  await fs.mkdir(GALLERY_UPLOAD_PATH, { recursive: true });
}

/** Kiểm tra quyền ghi khi server khởi động (VPS deploy). */
async function assertGalleryUploadWritable() {
  await ensureGalleryDir();
  const probe = path.join(GALLERY_UPLOAD_PATH, `.write_probe_${process.pid}`);
  try {
    await fs.writeFile(probe, 'ok');
    await fs.unlink(probe);
    return true;
  } catch (error) {
    console.error(`❌ Gallery upload path not writable: ${GALLERY_UPLOAD_PATH}`);
    console.error(`   → ${error.code || ''} ${error.message}`);
    console.error('   → VPS: sudo chown -R <pm2-user>:<group> backend/public/uploads && chmod -R 775 backend/public/uploads');
    return false;
  }
}

async function saveUploadedFile(file) {
  await ensureGalleryDir();

  const safeName = sanitizeBaseName(file.originalname || 'image.jpg');
  const uniqueName = `${Date.now()}_${Math.random().toString(36).slice(2, 8)}_${safeName}`;
  const absolutePath = path.join(GALLERY_UPLOAD_PATH, uniqueName);
  const publicPath = `${GALLERY_PUBLIC_PREFIX}/${uniqueName}`;

  try {
    await fs.writeFile(absolutePath, file.buffer);
  } catch (error) {
    throw mapFsWriteError(error);
  }

  return {
    name: safeName,
    path: publicPath,
    mimeType: file.mimetype || null,
    sizeBytes: file.size || null,
  };
}

async function deleteFileByPublicPath(publicPath) {
  if (!publicPath || !publicPath.startsWith(`${GALLERY_PUBLIC_PREFIX}/`)) {
    throw httpError('Invalid image path');
  }

  const fileName = path.basename(publicPath);
  const absolutePath = path.join(GALLERY_UPLOAD_PATH, fileName);

  try {
    await fs.unlink(absolutePath);
  } catch (error) {
    if (error?.code !== 'ENOENT') throw error;
  }
}

async function listFolders() {
  return mediaFolderRepository.findAll();
}

async function listImages(folderRaw) {
  const folderId = requireFolderId(folderRaw);
  const folder = await mediaFolderRepository.findById(folderId);
  if (!folder) throw httpError('Folder not found', 404);

  const images = await mediaImageRepository.findAll({ folderId });
  return images.map(toImageDto);
}

async function createFolder(body) {
  const name = typeof body.folder_name === 'string' ? body.folder_name.trim() : '';
  if (!name) throw httpError('folder_name is required');
  if (name.length > 120) throw httpError('folder_name is too long');

  try {
    return await mediaFolderRepository.create({ name });
  } catch (error) {
    mapPrismaError(error, 'Folder not found');
  }
}

async function deleteFolder(folderIdRaw) {
  const folderId = parseId(folderIdRaw, 'folder_id');

  const images = await mediaImageRepository.findByFolderId(folderId);
  await Promise.all(images.map((img) => deleteFileByPublicPath(img.path)));

  try {
    await mediaFolderRepository.remove(folderId);
  } catch (error) {
    mapPrismaError(error, 'Folder not found');
  }
}

async function uploadImage(file, folderRaw) {
  if (!file) throw httpError('image is required');

  const folderId = requireFolderId(folderRaw);
  const folder = await mediaFolderRepository.findById(folderId);
  if (!folder) throw httpError('Folder not found', 404);

  const saved = await saveUploadedFile(file);

  try {
    await mediaImageRepository.create({
      folderId,
      name: saved.name,
      path: saved.path,
      mimeType: saved.mimeType,
      sizeBytes: saved.sizeBytes,
    });
  } catch (error) {
    await deleteFileByPublicPath(saved.path);
    mapPrismaError(error, 'Image not found');
  }

  return listImages(folderId);
}

async function deleteImage(imgPathRaw, folderRaw) {
  const imgPath = typeof imgPathRaw === 'string' ? imgPathRaw.trim() : '';
  if (!imgPath) throw httpError('img_path is required');

  const image = await mediaImageRepository.findByPath(imgPath);
  if (!image) throw httpError('Image not found', 404);

  await deleteFileByPublicPath(image.path);

  try {
    await mediaImageRepository.removeByPath(imgPath);
  } catch (error) {
    mapPrismaError(error, 'Image not found');
  }

  return listImages(folderRaw);
}

async function getPageData(folderRaw) {
  const folders = await listFolders();
  let selectedFolderId = null;

  if (folderRaw) {
    try {
      selectedFolderId = requireFolderId(folderRaw);
    } catch {
      selectedFolderId = null;
    }
  }

  if (selectedFolderId && !folders.some((f) => f.id === selectedFolderId)) {
    selectedFolderId = null;
  }

  if (!selectedFolderId && folders.length) {
    selectedFolderId = folders[0].id;
  }

  const images = selectedFolderId ? await listImages(selectedFolderId) : [];

  return {
    folders,
    images,
    selectedFolderId,
    selectedFolder: folders.find((f) => f.id === selectedFolderId) || null,
  };
}

module.exports = {
  listFolders,
  listImages,
  getPageData,
  createFolder,
  deleteFolder,
  uploadImage,
  deleteImage,
  assertGalleryUploadWritable,
};
