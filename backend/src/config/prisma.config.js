// const {ENV_PATH} = require('./myPath.config');


const { PrismaClient } = require('../generated/prisma');
const { createMariaDbAdapter } = require('./mariadb.config');

const adapter = createMariaDbAdapter(process.env.DATABASE_URL);
const prisma = new PrismaClient({ adapter });

module.exports = prisma;