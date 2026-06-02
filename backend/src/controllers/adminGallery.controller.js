const adminGalleryService = require('../services/adminGallery.service');
const { renderAdminPage } = require('../utils/adminRender');
const { sendApiError, resolveApiErrorMessage } = require('../utils/http');

async function page(req, res) {
  try {
    const [folders, images] = await Promise.all([
      adminGalleryService.listFolders(),
      adminGalleryService.listImages('all'),
    ]);

    renderAdminPage(req, res, 'admin/gallery/gallery', {
      pageTitle: 'Gallery',
      adminPage: 'gallery',
      breadcrumbs: [
        { label: 'Dashboard', href: '/admin' },
        { label: 'Gallery' },
      ],
      folders,
      images,
    });
  } catch (error) {
    renderAdminPage(req, res, 'admin/gallery/gallery', {
      pageTitle: 'Gallery',
      adminPage: 'gallery',
      breadcrumbs: [
        { label: 'Dashboard', href: '/admin' },
        { label: 'Gallery' },
      ],
      folders: [],
      images: [],
      formError: resolveApiErrorMessage(error),
    });
  }
}

async function listImagesAjax(req, res) {
  try {
    const images = await adminGalleryService.listImages(req.query.folder);
    res.json({ success: true, images });
  } catch (error) {
    sendApiError(res, error);
  }
}

async function listFoldersAjax(req, res) {
  try {
    const folders = await adminGalleryService.listFolders();
    res.json({ success: true, folders });
  } catch (error) {
    sendApiError(res, error);
  }
}

async function createFolderAjax(req, res) {
  try {
    const folder = await adminGalleryService.createFolder(req.body);
    res.json({ success: true, folder });
  } catch (error) {
    sendApiError(res, error);
  }
}

async function deleteFolderAjax(req, res) {
  try {
    await adminGalleryService.deleteFolder(req.body.folder_id);
    res.json({ success: true });
  } catch (error) {
    sendApiError(res, error);
  }
}

async function uploadImageAjax(req, res) {
  try {
    const images = await adminGalleryService.uploadImage(req.file, req.body.folder_id);
    res.json({ success: true, images });
  } catch (error) {
    sendApiError(res, error);
  }
}

async function deleteImageAjax(req, res) {
  try {
    const images = await adminGalleryService.deleteImage(req.body.img_path, req.body.folder_id);
    res.json({ success: true, images });
  } catch (error) {
    sendApiError(res, error);
  }
}

module.exports = {
  page,
  listImagesAjax,
  listFoldersAjax,
  createFolderAjax,
  deleteFolderAjax,
  uploadImageAjax,
  deleteImageAjax,
};
