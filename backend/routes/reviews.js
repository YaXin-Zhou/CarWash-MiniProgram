const express = require('express');
const { db } = require('../database');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

// 提交评价
router.post('/', authMiddleware, (req, res) => {
  const { order_id, rating, content, images } = req.body;
  if (!order_id || !rating) return res.status(400).json({ code: 400, message: '缺少必要参数' });

  const order = db.prepare('SELECT * FROM orders WHERE id = ? AND user_id = ? AND status = ?').get(order_id, req.user.id, 'completed');
  if (!order) return res.status(400).json({ code: 400, message: '订单未完成或不存在' });

  const existing = db.prepare('SELECT * FROM reviews WHERE order_id = ?').get(order_id);
  if (existing) return res.status(400).json({ code: 400, message: '已评价过该订单' });

  db.prepare('INSERT INTO reviews (order_id, user_id, rating, content, images) VALUES (?, ?, ?, ?, ?)')
    .run(order_id, req.user.id, rating, content || '', images || '');

  res.json({ code: 0, message: '评价成功' });
});

// 获取订单评价
router.get('/order/:orderId', authMiddleware, (req, res) => {
  const review = db.prepare('SELECT * FROM reviews WHERE order_id = ?').get(req.params.orderId);
  res.json({ code: 0, data: review || null });
});

module.exports = router;
