const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const { BACKUPS_PATH } = require('../config/myPath.config');
const { httpError } = require('../utils/http');

function parseDatabaseUrl(rawUrl) {
  if (!rawUrl || typeof rawUrl !== 'string') {
    throw httpError('DATABASE_URL is not configured', 500);
  }
  let url;
  try {
    url = new URL(rawUrl);
  } catch {
    throw httpError('DATABASE_URL is invalid', 500);
  }
  const database = url.pathname.replace(/^\//, '').split('?')[0];
  if (!database) throw httpError('DATABASE_URL must include database name', 500);

  return {
    host: url.hostname || 'localhost',
    port: url.port || '3306',
    user: decodeURIComponent(url.username || ''),
    password: decodeURIComponent(url.password || ''),
    database,
  };
}

function ensureBackupDir() {
  fs.mkdirSync(BACKUPS_PATH, { recursive: true });
}

function buildBackupFilename(database) {
  const safeDb = String(database).replace(/[^a-zA-Z0-9_-]/g, '_');
  const ts = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
  return `${safeDb}_${ts}.sql`;
}

function sanitizeFilename(filename) {
  const safe = path.basename(String(filename || ''));
  if (!safe || !safe.endsWith('.sql') || safe.includes('..')) {
    throw httpError('Invalid backup file name', 400);
  }
  return safe;
}

function resolveBackupPath(filename) {
  const safe = sanitizeFilename(filename);
  const full = path.join(BACKUPS_PATH, safe);
  if (!fs.existsSync(full)) throw httpError('Backup file not found', 404);
  return full;
}

function runMysqldump(config, outPath) {
  const mysqldumpBin = process.env.MYSQLDUMP_PATH || 'mysqldump';
  const args = [
    `-h${config.host}`,
    `-P${config.port}`,
    `-u${config.user}`,
    '--single-transaction',
    '--routines',
    '--triggers',
    '--set-gtid-purged=OFF',
    `--result-file=${outPath}`,
    config.database,
  ];

  return new Promise((resolve, reject) => {
    const proc = spawn(mysqldumpBin, args, {
      env: { ...process.env, MYSQL_PWD: config.password },
      windowsHide: true,
    });

    let stderr = '';
    proc.stderr.on('data', (chunk) => {
      stderr += chunk.toString();
    });

    proc.on('error', (err) => {
      if (err.code === 'ENOENT') {
        reject(httpError(
          'Không tìm thấy mysqldump. Cài MySQL/MariaDB client hoặc set MYSQLDUMP_PATH trong .env.',
          500,
        ));
        return;
      }
      reject(err);
    });

    proc.on('close', (code) => {
      if (code !== 0) {
        if (fs.existsSync(outPath)) fs.unlinkSync(outPath);
        const detail = stderr.trim() || `mysqldump exited with code ${code}`;
        reject(httpError(`Backup thất bại: ${detail}`, 500));
        return;
      }
      if (!fs.existsSync(outPath) || fs.statSync(outPath).size === 0) {
        if (fs.existsSync(outPath)) fs.unlinkSync(outPath);
        reject(httpError('Backup file rỗng — kiểm tra quyền DB và mysqldump.', 500));
        return;
      }
      resolve();
    });
  });
}

async function createBackup() {
  const config = parseDatabaseUrl(process.env.DATABASE_URL);
  ensureBackupDir();

  const filename = buildBackupFilename(config.database);
  const outPath = path.join(BACKUPS_PATH, filename);

  await runMysqldump(config, outPath);

  const stat = fs.statSync(outPath);
  return {
    filename,
    sizeBytes: stat.size,
    createdAt: stat.mtime,
    database: config.database,
  };
}

function listBackups() {
  ensureBackupDir();
  return fs.readdirSync(BACKUPS_PATH)
    .filter((name) => name.endsWith('.sql'))
    .map((name) => {
      const full = path.join(BACKUPS_PATH, name);
      const stat = fs.statSync(full);
      return {
        filename: name,
        sizeBytes: stat.size,
        createdAt: stat.mtime,
      };
    })
    .sort((a, b) => b.createdAt - a.createdAt);
}

function deleteBackup(filename) {
  const full = resolveBackupPath(filename);
  fs.unlinkSync(full);
  return { filename: path.basename(full) };
}

module.exports = {
  createBackup,
  listBackups,
  deleteBackup,
  resolveBackupPath,
  BACKUPS_PATH,
};
