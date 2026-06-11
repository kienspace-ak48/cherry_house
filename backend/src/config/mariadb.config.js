const { PrismaMariaDb } = require('@prisma/adapter-mariadb');

/** Chuẩn hóa DATABASE_URL cho MariaDB driver (VPS Linux, RSA auth, timeout). */
function withMariaDbOptions(connectionString) {
  if (!connectionString) return connectionString;

  const url = new URL(connectionString.replace(/^mysql:\/\//, 'mariadb://'));
  if (!url.searchParams.has('connectTimeout')) url.searchParams.set('connectTimeout', '10000');
  if (!url.searchParams.has('acquireTimeout')) url.searchParams.set('acquireTimeout', '10000');
  if (!url.searchParams.has('allowPublicKeyRetrieval')) {
    url.searchParams.set('allowPublicKeyRetrieval', 'true');
  }

  return url.toString().replace(/^mariadb:\/\//, 'mysql://');
}

function createMariaDbAdapter(connectionString = process.env.DATABASE_URL) {
  return new PrismaMariaDb(withMariaDbOptions(connectionString));
}

module.exports = {
  withMariaDbOptions,
  createMariaDbAdapter,
};
