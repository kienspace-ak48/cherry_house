// const {ENV_PATH} = require('./myPath.config');


const { PrismaClient } = require('../generated/prisma');
const {PrismaMariaDb} = require('@prisma/adapter-mariadb');

function withMariaDbOptions(connectionString) {
  if (!connectionString) return connectionString;

  const url = new URL(connectionString.replace(/^mysql:\/\//, 'mariadb://'));
  if (!url.searchParams.has('connectTimeout')) url.searchParams.set('connectTimeout', '3000');
  if (!url.searchParams.has('acquireTimeout')) url.searchParams.set('acquireTimeout', '3000');
  if (!url.searchParams.has('allowPublicKeyRetrieval')) url.searchParams.set('allowPublicKeyRetrieval', 'true');

  return url.toString().replace(/^mariadb:\/\//, 'mysql://');
}

// Prisma 7 + MySQL: use mariaDB driver adapter
const adapter = new PrismaMariaDb(withMariaDbOptions(process.env.DATABASE_URL));
const prisma = new PrismaClient({adapter});


module.exports = prisma;