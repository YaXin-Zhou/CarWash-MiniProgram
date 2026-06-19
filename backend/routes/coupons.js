const express = require('express');
const { db } = require('../database');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

// 可用优惠券列表
router.get('/', (req, res) => {
  const coupons = db.prepare('SELECT * FROM coupons WHERE status = 1 AND used_count < total_count ORDER BY id').all();
  res.json({ code: 0, data: coupons });
});

// 我的优惠券
router.get('/mine', authMiddleware, (req, res) => {
  const { status } = req.query;
  let sql = `
    SELECT uc.*, c.name, c.type, c.discount_value, c.min_amount
    FROM user_coupons uc
    JOIN coupons c ON uc.coupon_id = c.id
    WHERE uc.user_id = ?
  `;
  const params = [req.user.id];
  if (status !== undefined) { sql += ' AND uc.status = ?'; params.push(Number(status)); }
  sql += ' ORDER BY uc.created_at DESC';

  const coupons = db.prepare(sql).all(...params);
  res.json({ code: 0, data: coupons });
});

// 领取优惠券
router.post('/receive/:id', authMiddleware, (req, res) => {
  const coupon = db.prepare('SELECT * FROM coupons WHERE id = ? AND status = 1').get(req.params.id);
  if (!coupon) return res.status(404).json({ code: 404, message: '优惠券不存在' });
  if (coupon.used_count >= coupon.total_count) {
    return res.status(400).json({ code: 400, message: '优惠券已领完' });
  }

  const existing = db.prepare('SELECT * FROM user_coupons WHERE user_id = ? AND coupon_id = ? AND status = 1').get(req.user.id, req.params.id);
  if (existing) return res.status(400).json({ code: 400, message: '已领取过该优惠券' });

  const expireTime = new Date();
  expireTime.setDate(expireTime.getDate() + coupon.valid_days);

  db.prepare('INSERT INTO user_coupons (user_id, coupon_id, expire_time) VALUES (?, ?, ?)').run(req.user.id, coupon.id, expireTime.toISOString());
  db.prepare('UPDATE coupons SET used_count = used_count + 1 WHERE id = ?').run(coupon.id);

  res.json({ code: 0, message: '领取成功' });
});

module.exports = router;
