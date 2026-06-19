const express = require('express');
const { db } = require('../database');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');

const router = express.Router();

// 服务列表（用户端）
router.get('/', (req, res) => {
  const { category } = req.query;
  let services;
  if (category) {
    services = db.prepare('SELECT * FROM services WHERE status = 1 AND category = ? ORDER BY id').all(category);
  } else {
    services = db.prepare('SELECT * FROM services WHERE status = 1 ORDER BY id').all();
  }
  res.json({ code: 0, data: services });
});

// 服务详情
router.get('/:id', (req, res) => {
  const service = db.prepare('SELECT * FROM services WHERE id = ?').get(req.params.id);
  if (!service) return res.status(404).json({ code: 404, message: '服务不存在' });
  res.json({ code: 0, data: service });
});

// 管理端：新增服务
router.post('/', authMiddleware, adminMiddleware, (req, res) => {
  const { name, icon, price, original_price, duration, description, category } = req.body;
  const result = db.prepare(
    'INSERT INTO services (name, icon, price, original_price, duration, description, category) VALUES (?, ?, ?, ?, ?, ?, ?)'
  ).run(name, icon || '', price, original_price || 0, duration || 30, description || '', category || '标准洗车');
  const service = db.prepare('SELECT * FROM services WHERE id = ?').get(result.lastInsertRowid);
  res.json({ code: 0, data: service });
});

// 管理端：编辑服务
router.put('/:id', authMiddleware, adminMiddleware, (req, res) => {
  const { name, icon, price, original_price, duration, description, category, status } = req.body;
  const service = db.prepare('SELECT * FROM services WHERE id = ?').get(req.params.id);
  if (!service) return res.status(404).json({ code: 404, message: '服务不存在' });

  db.prepare(`UPDATE services SET
    name = COALESCE(?, name), icon = COALESCE(?, icon), price = COALESCE(?, price),
    original_price = COALESCE(?, original_price), duration = COALESCE(?, duration),
    description = COALESCE(?, description), category = COALESCE(?, category),
    status = COALESCE(?, status) WHERE id = ?`
  ).run(name || null, icon || null, price || null, original_price || null,
    duration || null, description || null, category || null, status !== undefined ? status : null, req.params.id);

  const updated = db.prepare('SELECT * FROM services WHERE id = ?').get(req.params.id);
  res.json({ code: 0, data: updated });
});

// 管理端：删除服务
router.delete('/:id', authMiddleware, adminMiddleware, (req, res) => {
  db.prepare('DELETE FROM services WHERE id = ?').run(req.params.id);
  res.json({ code: 0, message: '删除成功' });
});

module.exports = router;
