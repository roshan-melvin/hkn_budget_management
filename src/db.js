// src/db.js
const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'hkn_budget',
  waitForConnections: true,
  connectionLimit: 10,
});

async function testConnection() {
  try {
    // simple query to confirm credentials and connectivity
    await pool.query('SELECT 1');
    return true;
  } catch (err) {
    // rethrow so caller can log friendly message
    throw err;
  }
}

module.exports = pool;
module.exports.testConnection = testConnection;
