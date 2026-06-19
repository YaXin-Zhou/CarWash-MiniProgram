const express = require('express');
const { db } = require('../database');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');

const router = express.Router();

// 获取全部轮播图（公开接口）
router.get('/', (req, res) => {
  const banners = db.prepare('SELECT * FROM banners WHERE status = 1 ORDER BY sort_order').all();
  res.json({ code: 0, data: banners });
});

// 管理端：获取全部（含下架的）
router.get('/admin', authMiddleware, adminMiddleware, (req, res) => {
  const banners = db.prepare('SELECT * FROM banners ORDER BY sort_order').all();
  res.json({ code: 0, data: banners });
});

// 新增轮播图
router.post('/', authMiddleware, adminMiddleware, (req, res) => {
  const { image_url, title, link_url, sort_order } = req.body;
  if (!image_url && !title) return res.status(400).json({ code: 400, message: '缺少必要参数' });
  const result = db.prepare(
    'INSERT INTO banners (image_url, title, link_url, sort_order) VALUES (?, ?, ?, ?)'
  ).run(image_url || '', title || '', link_url || '', sort_order || 0);
  const banner = db.prepare('SELECT * FROM banners WHERE id = ?').get(result.lastInsertRowid);
  res.json({ code: 0, data: banner });
});

// 编辑轮播图
router.put('/:id', authMiddleware, adminMiddleware, (req, res) => {
  const { image_url, title, link_url, sort_order, status } = req.body;
  const banner = db.prepare('SELECT * FROM banners WHERE id = ?').get(req.params.id);
  if (!banner) return res.status(404).json({ code: 404, message: '轮播图不存在' });

  db.prepare(`UPDATE banners SET
    image_url = COALESCE(?, image_url), title = COALESCE(?, title),
    link_url = COALESCE(?, link_url), sort_order = COALESCE(?, sort_order),
    status = COALESCE(?, status) WHERE id = ?`
  ).run(image_url || null, title || null, link_url || null,
    sort_order || null, status !== undefined ? status : null, req.params.id);

  const updated = db.prepare('SELECT * FROM banners WHERE id = ?').get(req.params.id);
  res.json({ code: 0, data: updated });
});

// 删除轮播图
router.delete('/:id', authMiddleware, adminMiddleware, (req, res) => {
  db.prepare('DELETE FROM banners WHERE id = ?').run(req.params.id);
  res.json({ code: 0, message: '删除成功' });
});

module.exports = router;
