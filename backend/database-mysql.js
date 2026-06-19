// ══════════════════════════════════════════
// 生产环境 MySQL 版本 — 替换 database.js
// 使用方法：
//   1. 先 npm install mysql2
//   2. 将 app.js 中 require('./database') 改为 require('./database-mysql')
//   3. 配置下方数据库连接信息
// ══════════════════════════════════════════

const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: '127.0.0.1',
  port: 3306,
  user: 'root',
  password: 'your_password',
  database: 'carwash',
  waitForConnections: true,
  connectionLimit: 10
});

async function query(sql, params = []) {
  const [rows] = await pool.execute(sql, params);
  return rows;
}

async function initDatabase() {
  await pool.execute(`
    CREATE TABLE IF NOT EXISTS users (
      id INT PRIMARY KEY AUTO_INCREMENT,
      openid VARCHAR(64) UNIQUE NOT NULL,
      nickname VARCHAR(64) DEFAULT '',
      avatar VARCHAR(256) DEFAULT '',
      phone VARCHAR(20) DEFAULT '',
      role VARCHAR(20) DEFAULT 'user',
      status TINYINT DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

  await pool.execute(`
    CREATE TABLE IF NOT EXISTS vehicles (
      id INT PRIMARY KEY AUTO_INCREMENT,
      user_id INT NOT NULL,
      plate_no VARCHAR(20) NOT NULL,
      brand VARCHAR(32) DEFAULT '',
      model VARCHAR(32) DEFAULT '',
      color VARCHAR(16) DEFAULT '',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    )`);

  await pool.execute(`
    CREATE TABLE IF NOT EXISTS stores (
      id INT PRIMARY KEY AUTO_INCREMENT,
      name VARCHAR(64) NOT NULL,
      address VARCHAR(256) NOT NULL,
      latitude DOUBLE DEFAULT 0,
      longitude DOUBLE DEFAULT 0,
      phone VARCHAR(20) DEFAULT '',
      open_time VARCHAR(8) DEFAULT '08:00',
      close_time VARCHAR(8) DEFAULT '20:00',
      image VARCHAR(256) DEFAULT '',
      description TEXT,
      status TINYINT DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

  await pool.execute(`
    CREATE TABLE IF NOT EXISTS services (
      id INT PRIMARY KEY AUTO_INCREMENT,
      name VARCHAR(64) NOT NULL,
      icon VARCHAR(16) DEFAULT '',
      price DECIMAL(10,2) NOT NULL,
      original_price DECIMAL(10,2) DEFAULT 0,
      duration INT DEFAULT 30,
      description TEXT,
      category VARCHAR(32) DEFAULT '标准洗车',
      status TINYINT DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

  await pool.execute(`
    CREATE TABLE IF NOT EXISTS coupons (
      id INT PRIMARY KEY AUTO_INCREMENT,
      name VARCHAR(64) NOT NULL,
      type VARCHAR(16) DEFAULT 'discount',
      discount_value DECIMAL(10,2) NOT NULL,
      min_amount DECIMAL(10,2) DEFAULT 0,
      valid_days INT DEFAULT 30,
      total_count INT DEFAULT 100,
      used_count INT DEFAULT 0,
      status TINYINT DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

  await pool.execute(`
    CREATE TABLE IF NOT EXISTS user_coupons (
      id INT PRIMARY KEY AUTO_INCREMENT,
      user_id INT NOT NULL,
      coupon_id INT NOT NULL,
      status TINYINT DEFAULT 1,
      expire_time DATETIME,
      used_at DATETIME,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id),
      FOREIGN KEY (coupon_id) REFERENCES coupons(id)
    )`);

  await pool.execute(`
    CREATE TABLE IF NOT EXISTS orders (
      id INT PRIMARY KEY AUTO_INCREMENT,
      order_no VARCHAR(32) UNIQUE NOT NULL,
      user_id INT NOT NULL,
      vehicle_id INT,
      store_id INT,
      service_id INT,
      amount DECIMAL(10,2) NOT NULL,
      coupon_id INT,
      status VARCHAR(20) DEFAULT 'pending',
      appoint_date VARCHAR(16) NOT NULL,
      appoint_time VARCHAR(8) NOT NULL,
      remark TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    )`);

  await pool.execute(`
    CREATE TABLE IF NOT EXISTS reviews (
      id INT PRIMARY KEY AUTO_INCREMENT,
      order_id INT NOT NULL UNIQUE,
      user_id INT NOT NULL,
      rating INT NOT NULL,
      content TEXT,
      images TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (order_id) REFERENCES orders(id),
      FOREIGN KEY (user_id) REFERENCES users(id)
    )`);

  console.log('MySQL 数据库初始化完成');
}

module.exports = { query, initDatabase };
