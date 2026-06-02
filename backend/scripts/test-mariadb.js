const mariadb = require('mariadb');

async function main() {
  const configs = [
    { host: '127.0.0.1', port: 3306, user: 'root', password: '123@', database: 'cherry_house', connectTimeout: 3000 },
    { host: 'localhost', port: 3306, user: 'root', password: '123@', connectTimeout: 3000 },
    { host: '127.0.0.1', port: 3306, user: 'root', password: '', connectTimeout: 3000 },
  ];

  for (const config of configs) {
    let conn;
    try {
      conn = await mariadb.createConnection(config);
      const rows = await conn.query('SELECT VERSION() AS version');
      console.log('OK', config, rows[0]?.version);
    } catch (error) {
      console.error('FAIL', { host: config.host, port: config.port, user: config.user, db: config.database }, '->', error.code, error.message);
    } finally {
      if (conn) await conn.end();
    }
  }
}

main();
