const express = require('express');
const { db } = require('../database');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');

const router = express.Router();

function generateOrderNo() {
  const now = new Date();
  const date = now.toISOString().slice(0, 10).replace(/-/g, '');
  const rand = Math.random().toString(36).substring(2, 8).toUpperCase();
  return 'XW' + date + rand;
}

// 创建订单
router.post('/', authMiddleware, (req, res) => {
  const { vehicle_id, store_id, service_id, coupon_id, appoint_date, appoint_time, remark } = req.body;

  if (!service_id || !store_id || !appoint_date || !appoint_time) {
    return res.status(400).json({ code: 400, message: '缺少必要参数' });
  }

  const service = db.prepare('SELECT * FROM services WHERE id = ? AND status = 1').get(service_id);
  if (!service) return res.status(400).json({ code: 400, message: '服务不存在' });

  let amount = service.price;
  let usedCouponId = null;

  // 处理优惠券
  if (coupon_id) {
    const userCoupon = db.prepare(
      'SELECT uc.*, c.discount_value, c.type, c.min_amount FROM user_coupons uc JOIN coupons c ON uc.coupon_id = c.id WHERE uc.id = ? AND uc.user_id = ? AND uc.status = 1'
    ).get(coupon_id, req.user.id);

    if (userCoupon) {
      if (amount >= userCoupon.min_amount) {
        if (userCoupon.type === 'percent') {
          amount = Math.round(amount * (100 - userCoupon.discount_value) / 100 * 100) / 100;
        } else {
          amount = Math.max(0, amount - userCoupon.discount_value);
        }
        usedCouponId = userCoupon.id;
        db.prepare('UPDATE user_coupons SET status = 2, used_at = CURRENT_TIMESTAMP WHERE id = ?').run(userCoupon.id);
      }
    }
  }

  const orderNo = generateOrderNo();
  db.prepare(
    'INSERT INTO orders (order_no, user_id, vehicle_id, store_id, service_id, amount, coupon_id, status, appoint_date, appoint_time, remark) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
  ).run(orderNo, req.user.id, vehicle_id || null, store_id, service_id, amount, usedCouponId, 'pending', appoint_date, appoint_time, remark || '');

  const order = db.prepare(`
    SELECT o.*, s.name as store_name, sv.name as service_name, sv.duration
    FROM orders o
    LEFT JOIN stores s ON o.store_id = s.id
    LEFT JOIN services sv ON o.service_id = sv.id
    WHERE o.order_no = ?
  `).get(orderNo);

  res.json({ code: 0, data: order });
});

// 我的订单列表
router.get('/', authMiddleware, (req, res) => {
  const { status } = req.query;
  let orders;
  if (status && status !== 'all') {
    orders = db.prepare(`
      SELECT o.*, s.name as store_name, sv.name as service_name, sv.duration
      FROM orders o
      LEFT JOIN stores s ON o.store_id = s.id
      LEFT JOIN services sv ON o.service_id = sv.id
      WHERE o.user_id = ? AND o.status = ?
      ORDER BY o.created_at DESC
    `).all(req.user.id, status);
  } else {
    orders = db.prepare(`
      SELECT o.*, s.name as store_name, sv.name as service_name, sv.duration
      FROM orders o
      LEFT JOIN stores s ON o.store_id = s.id
      LEFT JOIN services sv ON o.service_id = sv.id
      WHERE o.user_id = ?
      ORDER BY o.created_at DESC
    `).all(req.user.id);
  }
  res.json({ code: 0, data: orders });
});

// 订单详情
router.get('/:id', authMiddleware, (req, res) => {
  const order = db.prepare(`
    SELECT o.*, s.name as store_name, s.address as store_address, s.phone as store_phone,
           sv.name as service_name, sv.duration, sv.icon as service_icon,
           v.plate_no, v.brand, v.model, v.color
    FROM orders o
    LEFT JOIN stores s ON o.store_id = s.id
    LEFT JOIN services sv ON o.service_id = sv.id
    LEFT JOIN vehicles v ON o.vehicle_id = v.id
    WHERE o.id = ? AND o.user_id = ?
  `).get(req.params.id, req.user.id);

  if (!order) return res.status(404).json({ code: 404, message: '订单不存在' });
  res.json({ code: 0, data: order });
});

// 取消订单
router.delete('/:id', authMiddleware, (req, res) => {
  const order = db.prepare('SELECT * FROM orders WHERE id = ? AND user_id = ?').get(req.params.id, req.user.id);
  if (!order) return res.status(404).json({ code: 404, message: '订单不存在' });
  if (order.status !== 'pending') return res.status(400).json({ code: 400, message: '该订单状态不可取消' });

  db.prepare('UPDATE orders SET status = ? WHERE id = ?').run('cancelled', req.params.id);

  // 如果使用了优惠券，退还
  if (order.coupon_id) {
    db.prepare('UPDATE user_coupons SET status = 1, used_at = NULL WHERE id = ?').run(order.coupon_id);
  }
  res.json({ code: 0, message: '取消成功' });
});

// ==================== 管理端 ====================

// 管理端订单列表
router.get('/admin/list', authMiddleware, adminMiddleware, (req, res) => {
  const { status, keyword, page = 1, pageSize = 20 } = req.query;
  let sql = `
    SELECT o.*, u.nickname, u.phone, s.name as store_name, sv.name as service_name
    FROM orders o
    LEFT JOIN users u ON o.user_id = u.id
    LEFT JOIN stores s ON o.store_id = s.id
    LEFT JOIN services sv ON o.service_id = sv.id
    WHERE 1=1
  `;
  const params = [];

  if (status && status !== 'all') { sql += ' AND o.status = ?'; params.push(status); }
  if (keyword) { sql += ' AND (o.order_no LIKE ? OR u.nickname LIKE ?)'; params.push(`%${keyword}%`, `%${keyword}%`); }

  sql += ' ORDER BY o.created_at DESC LIMIT ? OFFSET ?';
  params.push(Number(pageSize), (Number(page) - 1) * Number(pageSize));

  const orders = db.prepare(sql).all(...params);
  const countResult = db.prepare('SELECT COUNT(*) as total FROM orders').get();
  res.json({ code: 0, data: { list: orders, total: countResult.total } });
});

// 更新订单状态（管理端）
router.put('/admin/status/:id', authMiddleware, adminMiddleware, (req, res) => {
  const { status } = req.body;
  const validStatuses = ['pending', 'confirmed', 'in_progress', 'completed', 'cancelled'];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ code: 400, message: '无效的状态' });
  }
  db.prepare('UPDATE orders SET status = ? WHERE id = ?').run(status, req.params.id);
  res.json({ code: 0, message: '状态更新成功' });
});

module.exports = router;
