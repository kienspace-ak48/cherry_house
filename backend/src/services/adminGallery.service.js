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

function normalizeFolderKey(folderRaw) {
  const folder = String(folderRaw || 'all').trim();
  if (!folder || folder === 'all') return 'all';
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

async function ensureGalleryDir() {
  await fs.mkdir(GALLERY_UPLOAD_PATH, { recursive: true });
}

async function saveUploadedFile(file) {
  await ensureGalleryDir();

  const safeName = sanitizeBaseName(file.originalname || 'image.jpg');
  const uniqueName = `${Date.now()}_${Math.random().toString(36).slice(2, 8)}_${safeName}`;
  const absolutePath = path.join(GALLERY_UPLOAD_PATH, uniqueName);
  const publicPath = `${GALLERY_PUBLIC_PREFIX}/${uniqueName}`;

  await fs.writeFile(absolutePath, file.buffer);

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

async function listImages(folderRaw = 'all') {
  const folderKey = normalizeFolderKey(folderRaw);
  const images = folderKey === 'all'
    ? await mediaImageRepository.findAll()
    : await mediaImageRepository.findAll({ folderId: folderKey });

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

async function uploadImage(file, folderRaw = 'all') {
  if (!file) throw httpError('image is required');

  const folderKey = normalizeFolderKey(folderRaw);
  const folderId = folderKey === 'all' ? null : folderKey;

  if (folderId) {
    const folder = await mediaFolderRepository.findById(folderId);
    if (!folder) throw httpError('Folder not found', 404);
  }

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

  return listImages(folderRaw);
}

async function deleteImage(imgPathRaw, folderRaw = 'all') {
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

module.exports = {
  listFolders,
  listImages,
  createFolder,
  deleteFolder,
  uploadImage,
  deleteImage,
};
