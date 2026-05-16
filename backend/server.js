const { ENV_PATH } = require('./src/config/myPath.config');
require('dotenv').config({path: ENV_PATH});
const http = require('http');
const cors = require('cors');

const HOSTNAME ="0.0.0.0";
const HTTP_PORT = process.env.HTTP_PORT || 3000;
const app = require('./src/app');

//
const httpServer = http.createServer(app);
function startServer(){
    httpServer.listen(HTTP_PORT, HOSTNAME, ()=>{
        console.log(`🚀 Server is running on http://localhost:${HTTP_PORT}`)
    })
}

startServer();

