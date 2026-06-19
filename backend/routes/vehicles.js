const express = require('express');
const { db } = require('../database');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

// 我的车辆列表
router.get('/', authMiddleware, (req, res) => {
  const vehicles = db.prepare('SELECT * FROM vehicles WHERE user_id = ? ORDER BY id DESC').all(req.user.id);
  res.json({ code: 0, data: vehicles });
});

// 添加车辆
router.post('/', authMiddleware, (req, res) => {
  const { plate_no, brand, model, color } = req.body;
  if (!plate_no) return res.status(400).json({ code: 400, message: '请输入车牌号' });
  const result = db.prepare(
    'INSERT INTO vehicles (user_id, plate_no, brand, model, color) VALUES (?, ?, ?, ?, ?)'
  ).run(req.user.id, plate_no, brand || '', model || '', color || '');
  const vehicle = db.prepare('SELECT * FROM vehicles WHERE id = ?').get(result.lastInsertRowid);
  res.json({ code: 0, data: vehicle });
});

// 编辑车辆
router.put('/:id', authMiddleware, (req, res) => {
  const vehicle = db.prepare('SELECT * FROM vehicles WHERE id = ? AND user_id = ?').get(req.params.id, req.user.id);
  if (!vehicle) return res.status(404).json({ code: 404, message: '车辆不存在' });
  const { plate_no, brand, model, color } = req.body;
  db.prepare(
    'UPDATE vehicles SET plate_no = COALESCE(?, plate_no), brand = COALESCE(?, brand), model = COALESCE(?, model), color = COALESCE(?, color) WHERE id = ?'
  ).run(plate_no || null, brand || null, model || null, color || null, req.params.id);
  const updated = db.prepare('SELECT * FROM vehicles WHERE id = ?').get(req.params.id);
  res.json({ code: 0, data: updated });
});

// 删除车辆
router.delete('/:id', authMiddleware, (req, res) => {
  db.prepare('DELETE FROM vehicles WHERE id = ? AND user_id = ?').run(req.params.id, req.user.id);
  res.json({ code: 0, message: '删除成功' });
});

module.exports = router;
