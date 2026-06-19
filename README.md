<p align="center">
  <h1 align="center">🚗 洗车小程序</h1>
  <p align="center">
    基于微信小程序 + Node.js 的洗车预约服务平台，支持用户端与后台管理系统
  </p>
</p>

---

## ✨ 功能特性

### 📱 用户端（微信小程序）

| 模块 | 说明 |
|------|------|
| **首页** | 轮播广告、热门服务推荐、门店导航入口 |
| **服务浏览** | 按分类查看洗车服务（标准洗车、精洗护理、专项服务），查看详情与价格 |
| **门店选择** | 查看附近门店、营业时间、联系电话 |
| **在线预约** | 选择服务 → 选择门店 → 选择车辆 → 预约时间 → 使用优惠券 → 一键下单 |
| **订单管理** | 查看所有订单，支持筛选状态（待确认/进行中/已完成/已取消） |
| **车辆管理** | 添加/编辑/删除车辆信息（车牌、品牌、型号、颜色） |
| **优惠券** | 查看持有的优惠券、使用状态与有效期 |
| **评价打分** | 完成订单后可对服务进行星级评分和文字评价 |
| **个人中心** | 修改昵称头像、查看系统设置 |

### 🛠 后台管理系统（Admin Web）

| 模块 | 说明 |
|------|------|
| **数据仪表盘** | 今日订单数、今日营收、总用户数、服务数，近期订单列表 |
| **服务管理** | 新增/编辑/下架/删除洗车服务 |
| **门店管理** | 管理门店信息（名称、地址、坐标、电话、营业时间） |
| **订单管理** | 查看所有订单、按状态筛选、更新订单状态 |
| **用户管理** | 用户列表、禁用/启用用户 |
| **优惠券管理** | 创建/编辑/下架优惠券（满减券、折扣券） |
| **评价管理** | 查看/删除用户评价 |

---

## 🧰 技术栈

| 层级 | 技术 |
|------|------|
| **小程序框架** | 微信原生框架 + Skyline 渲染引擎 + glass-easel 组件框架 |
| **后端框架** | Node.js + Express 4.x |
| **数据库** | SQLite（better-sqlite3） |
| **认证** | JWT（jsonwebtoken） |
| **图片上传** | Multer |
| **后台前端** | 原生 HTML/CSS/JS（零依赖） |

---

## 📁 项目结构

```
├── app.js / app.json / app.wxss   # 小程序入口
├── components/
│   └── navigation-bar/            # 自定义导航栏组件
├── pages/
│   ├── index/                     # 首页
│   ├── services/                  # 服务列表
│   ├── service-detail/            # 服务详情
│   ├── stores/                    # 门店列表
│   ├── store-detail/              # 门店详情
│   ├── booking/                   # 预约下单
│   ├── order-success/             # 预约成功
│   ├── orders/                    # 订单列表
│   ├── order-detail/              # 订单详情
│   ├── vehicles/                  # 车辆管理
│   ├── vehicle-form/              # 添加/编辑车辆
│   ├── coupons/                   # 我的优惠券
│   ├── review/                    # 评价打分
│   ├── login/                     # 登录页
│   ├── profile/                   # 个人中心
│   ├── settings/                  # 系统设置
│   ├── admin-dashboard/           # 管理仪表盘
│   └── admin-orders/              # 管理端订单
├── images/tab/                    # TabBar 图标
├── utils/util.js                  # 工具函数（API 请求封装）
├── admin/                         # 后台管理页面 (HTML/CSS/JS)
└── backend/
    ├── app.js                     # Express 服务入口
    ├── database.js                # SQLite 数据库初始化 + 种子数据
    ├── database-mysql.js          # MySQL 备选方案
    ├── config.js                  # 服务器配置
    ├── middleware/auth.js         # JWT 认证中间件（用户/管理员）
    ├── routes/
    │   ├── auth.js                # 微信登录
    │   ├── users.js               # 用户信息
    │   ├── services.js            # 服务管理
    │   ├── stores.js              # 门店管理
    │   ├── orders.js              # 订单管理
    │   ├── vehicles.js            # 车辆管理
    │   ├── coupons.js             # 优惠券
    │   ├── reviews.js             # 评价管理
    │   ├── banners.js             # 轮播图
    │   └── upload.js              # 图片上传
    ├── uploads/                   # 上传文件目录
    └── nginx.conf                 # Nginx 反向代理配置
```

---

## 🚀 快速开始

### 环境要求

- **Node.js** >= 16.x
- **微信开发者工具**（用于运行小程序前端）
- **微信小程序 AppID**（需在 [微信公众平台](https://mp.weixin.qq.com/) 注册）

### 1. 启动后端

```bash
cd backend

# 安装依赖
npm install

# 启动服务（默认端口 3000）
npm start
```

服务启动后自动创建 SQLite 数据库并写入种子数据（6 个洗车服务、3 个模拟门店、4 张优惠券）。

### 2. 配置小程序前端

在微信开发者工具中打开项目根目录，修改 `project.config.json` 中的 `appid` 为你的小程序 AppID。

> 如果后端地址不同，修改 `utils/util.js` 中的 `BASE_URL`。

### 3. 访问后台管理

后端启动后，浏览器访问 `http://localhost:3000` 即可打开管理后台。

默认登录方式：使用微信小程序端登录后，后端会注册用户。将用户的 `role` 字段改为 `admin` 即可获得管理权限。

---

## 🔑 环境变量

在 `backend/config.js` 中配置：

| 变量 | 说明 | 默认值 |
|------|------|--------|
| `port` | 后端服务端口 | `3000` |
| `dbPath` | SQLite 数据库文件路径 | `carwash.db` |
| `jwtSecret` | JWT 签名密钥 | `carwash_secret_key_2024` |
| `uploadDir` | 图片上传目录 | `uploads` |

> ⚠️ 生产环境请务必更换 `jwtSecret` 和数据库路径。

---

## 📡 API 概览

| 路由 | 说明 |
|------|------|
| `POST /api/auth/wechat-login` | 微信登录 |
| `GET  /api/services` | 服务列表（支持 `?category=` 筛选） |
| `GET  /api/services/:id` | 服务详情 |
| `GET  /api/stores` | 门店列表 |
| `GET  /api/stores/:id` | 门店详情 |
| `POST /api/orders` | 创建订单 🔒 |
| `GET  /api/orders` | 我的订单列表 🔒 |
| `GET  /api/orders/:id` | 订单详情 🔒 |
| `DEL  /api/orders/:id` | 取消订单 🔒 |
| `GET  /api/vehicles` | 我的车辆列表 🔒 |
| `POST /api/vehicles` | 添加车辆 🔒 |
| `PUT  /api/vehicles/:id` | 编辑车辆 🔒 |
| `DEL  /api/vehicles/:id` | 删除车辆 🔒 |
| `GET  /api/coupons` | 我的优惠券 🔒 |
| `POST /api/reviews` | 提交评价 🔒 |
| `GET  /api/banners` | 轮播图列表 |
| `POST /api/upload` | 图片上传 🔒 |
| `GET  /api/admin/dashboard` | 仪表盘数据 🔒👑 |
| `POST /api/admin/coupons` | 创建优惠券 🔒👑 |
| ... | 更多管理端接口 |

> 🔒 需要用户 Token &nbsp;&nbsp; 👑 需要管理员权限

---

## 📄 License

MIT License
