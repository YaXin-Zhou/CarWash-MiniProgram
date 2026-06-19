const express = require('express');
const jwt = require('jsonwebtoken');
const { db } = require('../database');
const config = require('../config');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

// 管理员账号密码登录
router.post('/admin-login', (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ code: 400, message: '请输入账号和密码' });
  }
  if (username !== config.adminUser || password !== config.adminPass) {
    return res.status(401).json({ code: 401, message: '账号或密码错误' });
  }

  let user = db.prepare('SELECT * FROM users WHERE openid = ?').get('admin_user_openid');
  if (!user) {
    db.prepare("INSERT INTO users (openid, nickname, role) VALUES ('admin_user_openid', '管理员', 'admin')").run();
    user = db.prepare('SELECT * FROM users WHERE id = ?').get(db.prepare('SELECT last_insert_rowid() as id').get().id);
  } else if (user.role !== 'admin') {
    db.prepare('UPDATE users SET role = ? WHERE id = ?').run('admin', user.id);
    user.role = 'admin';
  }

  const token = jwt.sign({ userId: user.id }, config.jwtSecret, { expiresIn: config.jwtExpiresIn });
  res.json({
    code: 0,
    data: {
      token,
      user: { id: user.id, nickname: user.nickname, avatar: user.avatar, phone: user.phone, role: 'admin' }
    }
  });
});

// 微信登录（模拟）- 实际需调用微信接口换取 openid
router.post('/login', (req, res) => {
  const { code, nickname, avatar } = req.body;
  if (!code) {
    return res.status(400).json({ code: 400, message: '缺少code' });
  }

  // 模拟微信登录：实际应用中需调用 wx.login + 后端请求微信接口
  const mockOpenid = 'wx_' + code.replace(/[^a-zA-Z0-9]/g, '').slice(-16);

  let user = db.prepare('SELECT * FROM users WHERE openid = ?').get(mockOpenid);
  if (!user) {
    const result = db.prepare(
      'INSERT INTO users (openid, nickname, avatar, role) VALUES (?, ?, ?, ?)'
    ).run(mockOpenid, nickname || '洗车用户', avatar || '', 'user');
    user = db.prepare('SELECT * FROM users WHERE id = ?').get(result.lastInsertRowid);
  } else if (nickname || avatar) {
    db.prepare('UPDATE users SET nickname = COALESCE(?, nickname), avatar = COALESCE(?, avatar) WHERE id = ?')
      .run(nickname || null, avatar || null, user.id);
    user = db.prepare('SELECT * FROM users WHERE id = ?').get(user.id);
  }

  const token = jwt.sign({ userId: user.id }, config.jwtSecret, { expiresIn: config.jwtExpiresIn });

  res.json({
    code: 0,
    data: {
      token,
      user: {
        id: user.id,
        nickname: user.nickname,
        avatar: user.avatar,
        phone: user.phone,
        role: user.role
      }
    }
  });
});

// 获取用户信息
router.get('/profile', authMiddleware, (req, res) => {
  const user = db.prepare('SELECT id, nickname, avatar, phone, role FROM users WHERE id = ?').get(req.user.id);
  res.json({ code: 0, data: user });
});

// 更新用户信息
router.put('/profile', authMiddleware, (req, res) => {
  const { nickname, avatar, phone } = req.body;
  db.prepare('UPDATE users SET nickname = COALESCE(?, nickname), avatar = COALESCE(?, avatar), phone = COALESCE(?, phone) WHERE id = ?')
    .run(nickname || null, avatar || null, phone || null, req.user.id);
  const user = db.prepare('SELECT id, nickname, avatar, phone, role FROM users WHERE id = ?').get(req.user.id);
  res.json({ code: 0, data: user });
});

module.exports = router;
