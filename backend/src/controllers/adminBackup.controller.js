const dbBackupService = require('../services/dbBackup.service');
const { renderAdminPage } = require('../utils/adminRender');

function formatBytes(bytes) {
  const n = Number(bytes) || 0;
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / (1024 * 1024)).toFixed(2)} MB`;
}

function formatDateTime(value) {
  if (!value) return '—';
  return new Date(value).toLocaleString('vi-VN');
}

function index(req, res) {
  const backups = dbBackupService.listBackups().map((row) => ({
    ...row,
    sizeLabel: formatBytes(row.sizeBytes),
    createdAtLabel: formatDateTime(row.createdAt),
  }));

  renderAdminPage(req, res, 'admin/backups/index', {
    pageTitle: 'Backup database',
    adminPage: 'backups',
    breadcrumbs: [
      { label: 'Dashboard', href: '/admin' },
      { label: 'Backup database' },
    ],
    backups,
    flash: req.query.flash || null,
    msg: req.query.msg || null,
    lastBackup: req.query.file || null,
  });
}

async function create(req, res) {
  try {
    const created = await dbBackupService.createBackup();
    res.redirect(
      `/admin/backups?flash=created&file=${encodeURIComponent(created.filename)}`,
    );
  } catch (error) {
    res.redirect(
      `/admin/backups?flash=error&msg=${encodeURIComponent(error.message || 'Backup failed')}`,
    );
  }
}

function download(req, res) {
  try {
    const filePath = dbBackupService.resolveBackupPath(req.params.filename);
    res.download(filePath);
  } catch (error) {
    res.redirect(
      `/admin/backups?flash=error&msg=${encodeURIComponent(error.message || 'Download failed')}`,
    );
  }
}

function remove(req, res) {
  try {
    dbBackupService.deleteBackup(req.params.filename);
    res.redirect('/admin/backups?flash=deleted');
  } catch (error) {
    res.redirect(
      `/admin/backups?flash=error&msg=${encodeURIComponent(error.message || 'Delete failed')}`,
    );
  }
}

module.exports = {
  index,
  create,
  download,
  remove,
};
