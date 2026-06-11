require('dotenv').config({ path: require('../src/config/myPath.config').ENV_PATH });
const { PrismaClient } = require('../src/generated/prisma');
const { createMariaDbAdapter, withMariaDbOptions } = require('../src/config/mariadb.config');
const { formatDbErrorDetail } = require('../src/utils/http');

async function main() {
  const raw = process.env.DATABASE_URL;
  if (!raw) {
    console.error('FAILED: DATABASE_URL chưa set trong backend/.env');
    process.exitCode = 1;
    return;
  }

  console.log('DATABASE_URL:', raw.replace(/:([^:@/]+)@/, ':***@'));
  console.log('Resolved:  ', withMariaDbOptions(raw).replace(/:([^:@/]+)@/, ':***@'));

  const prisma = new PrismaClient({ adapter: createMariaDbAdapter(raw) });
  try {
    await prisma.$queryRaw`SELECT 1 AS ok`;
    const count = await prisma.property.count();
    console.log('OK — connected. properties count =', count);
  } catch (error) {
    console.error('FAILED:', formatDbErrorDetail(error));
    process.exitCode = 1;
  } finally {
    await prisma.$disconnect();
  }
}

main();
