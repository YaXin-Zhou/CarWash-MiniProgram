const app = getApp();
const util = require('../../utils/util');

Page({
  data: {
    isAdmin: false,
    // 用户端
    tabs: [
      { key: 'all', label: '全部' },
      { key: 'pending', label: '待确认' },
      { key: 'confirmed', label: '已确认' },
      { key: 'in_progress', label: '进行中' },
      { key: 'completed', label: '已完成' },
      { key: 'cancelled', label: '已取消' }
    ],
    activeTab: 'all',
    orders: [],
    // 管理端
    dashboard: {},
    revenueData: []
  },

  onShow() {
    const admin = app.isAdmin();
    this.setData({ isAdmin: admin });
    if (!app.globalData.token) {
      wx.navigateTo({ url: '/pages/login/login' });
      return;
    }
    if (admin) {
      this.loadAdminStats();
    } else {
      this.loadOrders();
    }
  },

  onLoad() {
    this.onShow();
  },

  // ===== 管理端：数据统计 =====
  async loadAdminStats() {
    try {
      const data = await app.get('/api/admin/dashboard');
      // 获取本月订单用于收入统计
      const allOrders = await app.get('/api/orders/admin/list', { pageSize: 100 });
      const orders = allOrders.list || allOrders || [];
      // 按天汇总收入
      const dailyMap = {};
      orders.forEach(o => {
        if (o.status !== 'cancelled') {
          const day = (o.appoint_date || o.created_at || '').slice(5); // MM-DD
          dailyMap[day] = (dailyMap[day] || 0) + o.amount;
        }
      });
      const revenueData = Object.entries(dailyMap).map(([date, amount]) => ({ date, amount: Math.round(amount * 100) / 100 }));
      // 统计不同状态的订单数量
      const statusCounts = {};
      orders.forEach(o => {
        statusCounts[o.status] = (statusCounts[o.status] || 0) + 1;
      });
      this.setData({ dashboard: data, revenueData, statusCounts });
    } catch (e) {}
  },

  // ===== 用户端 =====
  loadOrders() {
    app.get('/api/orders', { status: this.data.activeTab === 'all' ? '' : this.data.activeTab }).then(orders => {
      this.setData({ orders });
    });
  },

  switchTab(e) {
    this.setData({ activeTab: e.currentTarget.dataset.key }, () => {
      if (!app.isAdmin()) this.loadOrders();
    });
  },

  goToDetail(e) {
    wx.navigateTo({ url: `/pages/order-detail/order-detail?id=${e.currentTarget.dataset.id}` });
  }
});
