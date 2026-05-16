// const {ENV_PATH} = require('./myPath.config');


const { PrismaClient } = require('../generated/prisma');
const {PrismaMariaDb} = require('@prisma/adapter-mariadb');

// Prisma 7 + MySQL: use mariaDB driver adapter
const adapter = new PrismaMariaDb(process.env.DATABASE_URL);
const prisma = new PrismaClient({adapter});


module.exports = prisma;