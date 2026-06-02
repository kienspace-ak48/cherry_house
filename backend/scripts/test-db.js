require('dotenv').config({ path: require('../src/config/myPath.config').ENV_PATH });
const { PrismaMariaDb } = require('@prisma/adapter-mariadb');
const { PrismaClient } = require('../src/generated/prisma');

async function main() {
  console.log('DATABASE_URL:', process.env.DATABASE_URL?.replace(/:([^:@/]+)@/, ':***@'));
  const adapter = new PrismaMariaDb(process.env.DATABASE_URL);
  const prisma = new PrismaClient({ adapter });
  try {
    await prisma.$queryRaw`SELECT 1 AS ok`;
    const count = await prisma.property.count();
    console.log('OK connected. properties count =', count);
  } catch (error) {
    console.error('FAILED:', error.message);
    process.exitCode = 1;
  } finally {
    await prisma.$disconnect();
  }
}

main();
