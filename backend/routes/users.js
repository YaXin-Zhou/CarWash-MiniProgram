const express = require('express');
const { db } = require('../database');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

router.get('/profile', authMiddleware, (req, res) => {
  const user = db.prepare('SELECT id, nickname, avatar, phone, role FROM users WHERE id = ?').get(req.user.id);
  res.json({ code: 0, data: user });
});

router.put('/profile', authMiddleware, (req, res) => {
  const { nickname, avatar, phone } = req.body;
  db.prepare('UPDATE users SET nickname = COALESCE(?, nickname), avatar = COALESCE(?, avatar), phone = COALESCE(?, phone) WHERE id = ?')
    .run(nickname || null, avatar || null, phone || null, req.user.id);
  res.json({ code: 0, message: '更新成功' });
});

module.exports = router;
