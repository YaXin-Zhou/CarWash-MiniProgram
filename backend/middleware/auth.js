const jwt = require('jsonwebtoken');
const config = require('../config');
const { db } = require('../database');

function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ code: 401, message: '未登录' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, config.jwtSecret);
    const user = db.prepare('SELECT id, openid, nickname, avatar, phone, role, status FROM users WHERE id = ?').get(decoded.userId);
    if (!user) {
      return res.status(401).json({ code: 401, message: '用户不存在' });
    }
    if (user.status === 0) {
      return res.status(403).json({ code: 403, message: '账号已被禁用' });
    }
    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ code: 401, message: 'token已过期，请重新登录' });
  }
}

function adminMiddleware(req, res, next) {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ code: 403, message: '无权限' });
  }
  next();
}

module.exports = { authMiddleware, adminMiddleware };
