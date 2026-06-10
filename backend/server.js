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
    const detail =
      error?.cause?.cause?.message
      || error?.cause?.message
      || error?.message
      || String(error);
    console.error('❌ MySQL unavailable — API sẽ trả lỗi 503 cho các request cần DB.');
    console.error(`   → ${detail}`);
    if (isDbConnectionError(error) && /access denied/i.test(detail)) {
      console.error('   → Sai user/mật khẩu trong DATABASE_URL. Tạo user MySQL riêng (không dùng root socket).');
    } else if (isDbConnectionError(error)) {
      console.error('   → Kiểm tra MySQL đang chạy và DATABASE_URL trong backend/.env');
    }
  }
}

//
const httpServer = http.createServer(app);
function startServer(){
    httpServer.listen(HTTP_PORT, HOSTNAME, ()=>{
        console.log(`🚀 Server is running on http://localhost:${HTTP_PORT}`)
        if (process.env.NODE_ENV === 'production') {
          const clientUrl = process.env.CLIENT_APP_URL || '(not set)';
          if (!process.env.CLIENT_APP_URL || /localhost|127\.0\.0\.1/i.test(clientUrl)) {
            console.warn(
              '⚠️  CLIENT_APP_URL chưa trỏ domain production — OAuth Google có thể redirect sai. Đặt CLIENT_APP_URL=https://kienvu.io.vn',
            );
          }
        }
        checkDatabaseConnection();
    })
}

startServer();

