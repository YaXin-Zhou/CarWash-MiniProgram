const express = require('express');
const cors = require('cors');
const path = require('path');
const config = require('./config');
const { initDatabase } = require('./database');

const app = express();

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/admin', express.static(path.join(__dirname, '..', 'admin')));
app.get('/', (req, res) => res.redirect('/admin/'));

// 初始化数据库
initDatabase();

// 路由
app.use('/api/auth', require('./routes/auth'));
app.use('/api/user', require('./routes/users'));
app.use('/api/services', require('./routes/services'));
app.use('/api/stores', require('./routes/stores'));
app.use('/api/vehicles', require('./routes/vehicles'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/coupons', require('./routes/coupons'));
app.use('/api/reviews', require('./routes/reviews'));
app.use('/api/banners', require('./routes/banners'));
app.use('/api/upload', require('./routes/upload'));

// 管理端仪表盘
const { db } = require('./database');
const { authMiddleware, adminMiddleware } = require('./middleware/auth');

app.get('/api/admin/dashboard', authMiddleware, adminMiddleware, (req, res) => {
  const today = new Date().toISOString().slice(0, 10);
  const todayOrders = db.prepare("SELECT COUNT(*) as count FROM orders WHERE date(created_at) = ?").get(today);
  const todayRevenue = db.prepare("SELECT COALESCE(SUM(amount), 0) as total FROM orders WHERE date(created_at) = ? AND status != 'cancelled'").get(today);
  const totalUsers = db.prepare('SELECT COUNT(*) as count FROM users').get();
  const totalServices = db.prepare('SELECT COUNT(*) as count FROM services WHERE status = 1').get();
  const recentOrders = db.prepare(`
    SELECT o.*, u.nickname, s.name as store_name, sv.name as service_name
    FROM orders o LEFT JOIN users u ON o.user_id = u.id
    LEFT JOIN stores s ON o.store_id = s.id LEFT JOIN services sv ON o.service_id = sv.id
    ORDER BY o.created_at DESC LIMIT 10
  `).all();

  res.json({ code: 0, data: {
    todayOrders: todayOrders.count,
    todayRevenue: todayRevenue.total,
    totalUsers: totalUsers.count,
    totalServices: totalServices.count,
    recentOrders
  }});
});

// 管理端用户列表
app.get('/api/admin/users', authMiddleware, adminMiddleware, (req, res) => {
  const users = db.prepare('SELECT id, nickname, avatar, phone, role, status, created_at FROM users ORDER BY id DESC').all();
  res.json({ code: 0, data: users });
});

// 管理端用户状态切换
app.put('/api/admin/users/:id/status', authMiddleware, adminMiddleware, (req, res) => {
  const { status } = req.body;
  db.prepare('UPDATE users SET status = ? WHERE id = ?').run(status, req.params.id);
  res.json({ code: 0, message: '更新成功' });
});

// 管理端优惠券管理
app.get('/api/admin/coupons', authMiddleware, adminMiddleware, (req, res) => {
  const coupons = db.prepare('SELECT * FROM coupons ORDER BY id DESC').all();
  res.json({ code: 0, data: coupons });
});

app.post('/api/admin/coupons', authMiddleware, adminMiddleware, (req, res) => {
  const { name, type, discount_value, min_amount, valid_days, total_count } = req.body;
  const result = db.prepare(
    'INSERT INTO coupons (name, type, discount_value, min_amount, valid_days, total_count) VALUES (?, ?, ?, ?, ?, ?)'
  ).run(name, type || 'discount', discount_value, min_amount || 0, valid_days || 30, total_count || 100);
  const coupon = db.prepare('SELECT * FROM coupons WHERE id = ?').get(result.lastInsertRowid);
  res.json({ code: 0, data: coupon });
});

app.put('/api/admin/coupons/:id', authMiddleware, adminMiddleware, (req, res) => {
  const { name, type, discount_value, min_amount, valid_days, total_count, status } = req.body;
  db.prepare(`UPDATE coupons SET
    name = COALESCE(?, name), type = COALESCE(?, type), discount_value = COALESCE(?, discount_value),
    min_amount = COALESCE(?, min_amount), valid_days = COALESCE(?, valid_days),
    total_count = COALESCE(?, total_count), status = COALESCE(?, status) WHERE id = ?`
  ).run(name || null, type || null, discount_value || null, min_amount || null,
    valid_days || null, total_count || null, status !== undefined ? status : null, req.params.id);
  res.json({ code: 0, message: '更新成功' });
});

// 管理端评价列表
app.get('/api/admin/reviews', authMiddleware, adminMiddleware, (req, res) => {
  const reviews = db.prepare(`
    SELECT r.*, u.nickname, o.order_no
    FROM reviews r LEFT JOIN users u ON r.user_id = u.id LEFT JOIN orders o ON r.order_id = o.id
    ORDER BY r.created_at DESC
  `).all();
  res.json({ code: 0, data: reviews });
});

app.delete('/api/admin/reviews/:id', authMiddleware, adminMiddleware, (req, res) => {
  db.prepare('DELETE FROM reviews WHERE id = ?').run(req.params.id);
  res.json({ code: 0, message: '删除成功' });
});

// 管理端 admin 路由映射
app.use('/api/admin/services', require('./routes/services'));
app.use('/api/admin/stores', require('./routes/stores'));
app.use('/api/admin/orders', require('./routes/orders'));

app.listen(config.port, () => {
  console.log(`洗车小程序后端服务已启动: http://localhost:${config.port}`);
});
