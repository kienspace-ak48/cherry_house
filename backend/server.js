const { ENV_PATH } = require('./src/config/myPath.config');
require('dotenv').config({path: ENV_PATH});
const http = require('http');

const HOSTNAME = '0.0.0.0';
const HTTP_PORT = process.env.HTTP_PORT || 3000;
const app = require('./src/app');
const prisma = require('./src/config/prisma.config');
const { isDbConnectionError } = require('./src/utils/http');

async function checkDatabaseConnection() {
  try {
    await prisma.$queryRaw`SELECT 1`;
    console.log('✅ MySQL connected');
  } catch (error) {
    console.error('❌ MySQL unavailable — API sẽ trả lỗi 503 cho các request cần DB.');
    if (isDbConnectionError(error)) {
      console.error('   → Bật MySQL Server / MySQL Workbench service, rồi chạy: npm run db:seed');
    } else {
      console.error(`   → ${error.message}`);
    }
  }
}

//
const httpServer = http.createServer(app);
function startServer(){
    httpServer.listen(HTTP_PORT, HOSTNAME, ()=>{
        console.log(`🚀 Server is running on http://localhost:${HTTP_PORT}`)
        checkDatabaseConnection();
    })
}

startServer();

