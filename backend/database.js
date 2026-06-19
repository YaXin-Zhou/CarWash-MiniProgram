const Database = require('better-sqlite3');
const path = require('path');
const config = require('./config');

const db = new Database(path.join(__dirname, config.dbPath));

db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

function initDatabase() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      openid TEXT UNIQUE NOT NULL,
      nickname TEXT DEFAULT '',
      avatar TEXT DEFAULT '',
      phone TEXT DEFAULT '',
      role TEXT DEFAULT 'user',
      status INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS vehicles (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      plate_no TEXT NOT NULL,
      brand TEXT DEFAULT '',
      model TEXT DEFAULT '',
      color TEXT DEFAULT '',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS stores (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      address TEXT NOT NULL,
      latitude REAL DEFAULT 0,
      longitude REAL DEFAULT 0,
      phone TEXT DEFAULT '',
      open_time TEXT DEFAULT '08:00',
      close_time TEXT DEFAULT '20:00',
      image TEXT DEFAULT '',
      description TEXT DEFAULT '',
      status INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS services (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      icon TEXT DEFAULT '',
      price REAL NOT NULL,
      original_price REAL DEFAULT 0,
      duration INTEGER DEFAULT 30,
      description TEXT DEFAULT '',
      category TEXT DEFAULT '标准洗车',
      status INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS coupons (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      type TEXT DEFAULT 'discount',
      discount_value REAL NOT NULL,
      min_amount REAL DEFAULT 0,
      valid_days INTEGER DEFAULT 30,
      total_count INTEGER DEFAULT 100,
      used_count INTEGER DEFAULT 0,
      status INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS user_coupons (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      coupon_id INTEGER NOT NULL,
      status INTEGER DEFAULT 1,
      expire_time DATETIME,
      used_at DATETIME,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id),
      FOREIGN KEY (coupon_id) REFERENCES coupons(id)
    );

    CREATE TABLE IF NOT EXISTS orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      order_no TEXT UNIQUE NOT NULL,
      user_id INTEGER NOT NULL,
      vehicle_id INTEGER,
      store_id INTEGER,
      service_id INTEGER,
      amount REAL NOT NULL,
      coupon_id INTEGER,
      status TEXT DEFAULT 'pending',
      appoint_date TEXT NOT NULL,
      appoint_time TEXT NOT NULL,
      remark TEXT DEFAULT '',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id),
      FOREIGN KEY (vehicle_id) REFERENCES vehicles(id),
      FOREIGN KEY (store_id) REFERENCES stores(id),
      FOREIGN KEY (service_id) REFERENCES services(id)
    );

    CREATE TABLE IF NOT EXISTS reviews (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      order_id INTEGER NOT NULL UNIQUE,
      user_id INTEGER NOT NULL,
      rating INTEGER NOT NULL,
      content TEXT DEFAULT '',
      images TEXT DEFAULT '',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (order_id) REFERENCES orders(id),
      FOREIGN KEY (user_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS banners (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      image_url TEXT NOT NULL,
      title TEXT DEFAULT '',
      link_url TEXT DEFAULT '',
      sort_order INTEGER DEFAULT 0,
      status INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  seedData();
}

function seedData() {
  const serviceCount = db.prepare('SELECT COUNT(*) as count FROM services').get();
  if (serviceCount.count === 0) {
    const insertService = db.prepare(
      'INSERT INTO services (name, icon, price, original_price, duration, description, category) VALUES (?, ?, ?, ?, ?, ?, ?)'
    );
    const services = [
      ['标准洗车', '🧽', 39.9, 60, 30, '高压冲洗+泡沫清洗+车身擦干+轮胎清洁', '标准洗车'],
      ['精洗打蜡', '✨', 88, 128, 60, '标准洗车+全车打蜡+内饰清洁+玻璃清洁', '精洗护理'],
      ['深度精洗', '💎', 158, 228, 90, '精洗打蜡+发动机舱清洗+真皮护理+空调清洗', '精洗护理'],
      ['内饰清洁', '🧹', 68, 98, 45, '全车内饰吸尘+座椅清洁+仪表台护理+地毯清洗', '专项服务'],
      ['漆面镀晶', '🛡️', 388, 588, 120, '漆面去污+镀晶处理+光泽保护+持久防护', '专项服务'],
      ['全车抛光', '🔧', 268, 388, 90, '漆面抛光+划痕修复+镜面还原+封釉保护', '专项服务']
    ];
    const insertMany = db.transaction(() => {
      for (const s of services) {
        insertService.run(...s);
      }
    });
    insertMany();
  }

  const storeCount = db.prepare('SELECT COUNT(*) as count FROM stores').get();
  if (storeCount.count === 0) {
    const insertStore = db.prepare(
      'INSERT INTO stores (name, address, latitude, longitude, phone, open_time, close_time, description) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
    );
    const stores = [
      ['阳光洗车(朝阳店)', '北京市朝阳区建国路88号', 39.9087, 116.4716, '13800138001', '08:00', '20:00', '旗舰门店，设备齐全，技师经验丰富'],
      ['阳光洗车(海淀店)', '北京市海淀区中关村大街15号', 39.9842, 116.3074, '13800138002', '08:30', '19:30', '紧邻地铁站，交通便利'],
      ['阳光洗车(丰台店)', '北京市丰台区方庄路32号', 39.8654, 116.4228, '13800138003', '09:00', '21:00', '大型停车场，可同时服务6辆车']
    ];
    const insertMany = db.transaction(() => {
      for (const s of stores) {
        insertStore.run(...s);
      }
    });
    insertMany();
  }

  const couponCount = db.prepare('SELECT COUNT(*) as count FROM coupons').get();
  if (couponCount.count === 0) {
    const insertCoupon = db.prepare(
      'INSERT INTO coupons (name, type, discount_value, min_amount, valid_days, total_count) VALUES (?, ?, ?, ?, ?, ?)'
    );
    const coupons = [
      ['新用户专享券', 'discount', 15, 0, 30, 500],
      ['满减优惠券', 'discount', 20, 100, 60, 200],
      ['精洗体验券', 'discount', 30, 0, 30, 100],
      ['八折优惠券', 'percent', 20, 0, 90, 300]
    ];
    const insertMany = db.transaction(() => {
      for (const c of coupons) {
        insertCoupon.run(...c);
      }
    });
    insertMany();
  }

  const bannerCount = db.prepare('SELECT COUNT(*) as count FROM banners').get();
  if (bannerCount.count === 0) {
    const insertBanner = db.prepare(
      'INSERT INTO banners (image_url, title, sort_order) VALUES (?, ?, ?)'
    );
    const banners = [
      ['', '新用户首单立减15元', 1],
      ['', '精洗打蜡限时特惠88元', 2],
      ['', '会员充值享8折优惠', 3]
    ];
    const insertMany = db.transaction(() => {
      for (const b of banners) {
        insertBanner.run(...b);
      }
    });
    insertMany();
  }
}

module.exports = { db, initDatabase };
