import mysql from 'mysql2/promise';

const DB_HOST = process.env.DB_HOST || 'localhost';
const DB_PORT = Number(process.env.DB_PORT || 3306);
const DB_USER = process.env.DB_USER || 'root';
const DB_PASSWORD = process.env.DB_PASSWORD || '';
const DB_NAME = process.env.DB_NAME || 'crud';

let pool = null;

async function ensureDatabase() {
  const conn = await mysql.createConnection({
    host: DB_HOST,
    port: DB_PORT,
    user: DB_USER,
    password: DB_PASSWORD
  });
  try {
    await conn.query(
      `CREATE DATABASE IF NOT EXISTS \`${DB_NAME}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`
    );
  } finally {
    await conn.end();
  }
}

function getPool() {
  if (!pool) {
    pool = mysql.createPool({
      host: DB_HOST,
      port: DB_PORT,
      user: DB_USER,
      password: DB_PASSWORD,
      database: DB_NAME,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0
    });
  }
  return pool;
}

const db = {
  get isCloud() { return false; },
  get config() {
    return { host: DB_HOST, port: DB_PORT, user: DB_USER, database: DB_NAME };
  },
  async run(sql, args) {
    const [result] = await getPool().execute(sql, args || []);
    return result;
  },
  async get(sql, args) {
    const [rows] = await getPool().execute(sql, args || []);
    return rows[0] ?? null;
  },
  async all(sql, args) {
    const [rows] = await getPool().execute(sql, args || []);
    return rows;
  },
  async init() {
    await ensureDatabase();
    const a = getPool();
    await a.query(`CREATE TABLE IF NOT EXISTS availability_requests (
      id INT AUTO_INCREMENT PRIMARY KEY,
      request_id VARCHAR(64) NOT NULL UNIQUE,
      name VARCHAR(255) NOT NULL,
      phone VARCHAR(64) NOT NULL,
      email VARCHAR(255),
      city VARCHAR(128),
      neighborhood VARCHAR(128),
      address TEXT,
      service VARCHAR(128),
      contact_method VARCHAR(64),
      created_at VARCHAR(64) NOT NULL
    )`);
    await a.query(`CREATE TABLE IF NOT EXISTS quote_requests (
      id INT AUTO_INCREMENT PRIMARY KEY,
      request_id VARCHAR(64) NOT NULL UNIQUE,
      name VARCHAR(255) NOT NULL,
      company VARCHAR(255),
      phone VARCHAR(64) NOT NULL,
      email VARCHAR(255),
      location VARCHAR(255),
      notes TEXT,
      items TEXT,
      created_at VARCHAR(64) NOT NULL
    )`);
    await a.query(`CREATE TABLE IF NOT EXISTS equipment (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      price VARCHAR(64) NOT NULL,
      sku VARCHAR(128),
      image VARCHAR(512),
      features TEXT,
      category VARCHAR(128),
      created_at VARCHAR(64) NOT NULL
    )`);
    await a.query(`CREATE TABLE IF NOT EXISTS services (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      description TEXT,
      tag VARCHAR(128),
      image VARCHAR(512),
      features TEXT,
      created_at VARCHAR(64) NOT NULL
    )`);
    await a.query(`CREATE TABLE IF NOT EXISTS chat_messages (
      id INT AUTO_INCREMENT PRIMARY KEY,
      session_id VARCHAR(128) NOT NULL,
      sender VARCHAR(32) NOT NULL,
      message TEXT NOT NULL,
      product_sku VARCHAR(128),
      product_name VARCHAR(255),
      created_at VARCHAR(64) NOT NULL
    )`);
    await a.query(`CREATE TABLE IF NOT EXISTS settings (
      \`key\` VARCHAR(128) PRIMARY KEY,
      \`value\` TEXT
    )`);
    await a.query(`CREATE TABLE IF NOT EXISTS users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255),
      email VARCHAR(255) UNIQUE,
      username VARCHAR(128) UNIQUE,
      password_hash VARCHAR(512) NOT NULL,
      role VARCHAR(32) NOT NULL DEFAULT 'user',
      token VARCHAR(128) UNIQUE,
      created_at VARCHAR(64) NOT NULL
    )`);
    await a.query(`CREATE TABLE IF NOT EXISTS bookings (
      id INT AUTO_INCREMENT PRIMARY KEY,
      booking_id VARCHAR(64) NOT NULL UNIQUE,
      client_name VARCHAR(255) NOT NULL,
      client_phone VARCHAR(64) NOT NULL,
      client_email VARCHAR(255),
      service VARCHAR(255),
      technician_id INT,
      technician_name VARCHAR(255),
      booking_date VARCHAR(32),
      time_slot VARCHAR(32),
      address TEXT,
      city VARCHAR(128),
      neighborhood VARCHAR(128),
      lat VARCHAR(32),
      lng VARCHAR(32),
      notes TEXT,
      status VARCHAR(32) NOT NULL DEFAULT 'pending',
      created_at VARCHAR(64) NOT NULL
    )`);
    await a.query(`CREATE TABLE IF NOT EXISTS booking_work (
      id INT AUTO_INCREMENT PRIMARY KEY,
      booking_id VARCHAR(64) NOT NULL,
      kind VARCHAR(16) NOT NULL,
      image VARCHAR(512) NOT NULL,
      caption TEXT,
      created_at VARCHAR(64) NOT NULL
    )`);
    try {
      await a.query(
        'CREATE INDEX IF NOT EXISTS idx_chat_session ON chat_messages (session_id, id)'
      );
    } catch { /* MySQL has no IF NOT EXISTS for indexes; ignore duplicates */ }
    try {
      const cols = await this.all(
        "SELECT COLUMN_NAME AS name FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA=? AND TABLE_NAME='services'",
        [DB_NAME]
      );
      if (!cols.some(c => c.name === 'image')) {
        await a.query('ALTER TABLE services ADD COLUMN image VARCHAR(512)');
      }
      if (!cols.some(c => c.name === 'features')) {
        await a.query('ALTER TABLE services ADD COLUMN features TEXT');
      }
    } catch { /* best-effort */ }
    try {
      const eqCols = await this.all(
        "SELECT COLUMN_NAME AS name FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA=? AND TABLE_NAME='equipment'",
        [DB_NAME]
      );
      if (!eqCols.some(c => c.name === 'image')) {
        await a.query('ALTER TABLE equipment ADD COLUMN image VARCHAR(512)');
      }
      if (!eqCols.some(c => c.name === 'category')) {
        await a.query('ALTER TABLE equipment ADD COLUMN category VARCHAR(128)');
      }
      if (!eqCols.some(c => c.name === 'features')) {
        await a.query('ALTER TABLE equipment ADD COLUMN features TEXT');
      }
    } catch { /* best-effort */ }
    try {
      const userCols = await this.all(
        "SELECT COLUMN_NAME AS name FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA=? AND TABLE_NAME='users'",
        [DB_NAME]
      );
      if (!userCols.some(c => c.name === 'name')) {
        await a.query('ALTER TABLE users ADD COLUMN name VARCHAR(255)');
      }
      if (!userCols.some(c => c.name === 'email')) {
        await a.query('ALTER TABLE users ADD COLUMN email VARCHAR(255)');
      }
      if (!userCols.some(c => c.name === 'username')) {
        await a.query('ALTER TABLE users ADD COLUMN username VARCHAR(128)');
      }
      if (!userCols.some(c => c.name === 'phone')) {
        await a.query('ALTER TABLE users ADD COLUMN phone VARCHAR(64)');
      }
      if (!userCols.some(c => c.name === 'specialty')) {
        await a.query('ALTER TABLE users ADD COLUMN specialty VARCHAR(255)');
      }
    } catch { /* best-effort */ }
  },
  async close() {
    if (pool) {
      try { await pool.end(); } catch { /* ignore */ }
      pool = null;
    }
  }
};

export default db;