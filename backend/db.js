const mysql = require('mysql2/promise');

module.exports = mysql.createPool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  connectionLimit: 10,
  // Devolve DATETIME como texto ('2026-11-20 14:30:00'), sem conversão de fuso.
  dateStrings: true,
});
