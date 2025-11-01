const mysql = require('mysql2');

// Pool de conexiones compatible con callbacks (usado por index.js)
const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: 'admin',
  database: 'tienda_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

module.exports = pool;
