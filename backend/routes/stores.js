const express = require('express');
const { db } = require('../database');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');

const router = express.Router();

// 门店列表（用户端）
router.get('/', (req, res) => {
  const stores = db.prepare('SELECT * FROM stores WHERE status = 1 ORDER BY id').all();
  res.json({ code: 0, data: stores });
});

// 门店详情
router.get('/:id', (req, res) => {
  const store = db.prepare('SELECT * FROM stores WHERE id = ?').get(req.params.id);
  if (!store) return res.status(404).json({ code: 404, message: '门店不存在' });
  res.json({ code: 0, data: store });
});

// 管理端：新增门店
router.post('/', authMiddleware, adminMiddleware, (req, res) => {
  const { name, address, latitude, longitude, phone, open_time, close_time, image, description } = req.body;
  const result = db.prepare(
    'INSERT INTO stores (name, address, latitude, longitude, phone, open_time, close_time, image, description) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)'
  ).run(name, address, latitude || 0, longitude || 0, phone || '', open_time || '08:00', close_time || '20:00', image || '', description || '');
  const store = db.prepare('SELECT * FROM stores WHERE id = ?').get(result.lastInsertRowid);
  res.json({ code: 0, data: store });
});

// 管理端：编辑门店
router.put('/:id', authMiddleware, adminMiddleware, (req, res) => {
  const { name, address, latitude, longitude, phone, open_time, close_time, image, description, status } = req.body;
  const store = db.prepare('SELECT * FROM stores WHERE id = ?').get(req.params.id);
  if (!store) return res.status(404).json({ code: 404, message: '门店不存在' });

  db.prepare(`UPDATE stores SET
    name = COALESCE(?, name), address = COALESCE(?, address), latitude = COALESCE(?, latitude),
    longitude = COALESCE(?, longitude), phone = COALESCE(?, phone),
    open_time = COALESCE(?, open_time), close_time = COALESCE(?, close_time),
    image = COALESCE(?, image), description = COALESCE(?, description),
    status = COALESCE(?, status) WHERE id = ?`
  ).run(name || null, address || null, latitude || null, longitude || null, phone || null,
    open_time || null, close_time || null, image || null, description || null,
    status !== undefined ? status : null, req.params.id);

  const updated = db.prepare('SELECT * FROM stores WHERE id = ?').get(req.params.id);
  res.json({ code: 0, data: updated });
});

// 管理端：删除门店
router.delete('/:id', authMiddleware, adminMiddleware, (req, res) => {
  db.prepare('DELETE FROM stores WHERE id = ?').run(req.params.id);
  res.json({ code: 0, message: '删除成功' });
});

module.exports = router;
