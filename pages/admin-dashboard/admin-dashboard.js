const app = getApp();
const util = require('../../utils/util');

Page({
  data: {
    dashboard: { todayOrders: 0, todayRevenue: 0, totalUsers: 0, totalServices: 0 },
    recentOrders: []
  },

  onShow() {
    if (!app.isAdmin()) { wx.navigateBack(); return; }
    app.get('/api/admin/dashboard').then(data => {
      this.setData({
        dashboard: data,
        recentOrders: data.recentOrders || []
      });
    });
  },

  updateStatus(e) {
    const { id, status } = e.currentTarget.dataset;
    app.put(`/api/orders/admin/status/${id}`, { status }).then(() => {
      wx.showToast({ title: '已更新', icon: 'success' });
      this.onShow();
    });
  },

  goToAdminOrders() {
    wx.navigateTo({ url: '/pages/admin-orders/admin-orders' });
  }
});
