const app = getApp();

Page({
  data: {
    userInfo: null,
    isAdmin: false,
    orderCounts: { pending: 0, in_progress: 0 },
    dashboard: null
  },

  onShow() {
    if (!app.globalData.token) {
      wx.navigateTo({ url: '/pages/login/login' });
      return;
    }
    const userInfo = app.globalData.userInfo;
    const admin = app.isAdmin();
    this.setData({ userInfo, isAdmin: admin });
    this.loadCounts();
    if (admin) this.loadDashboard();
  },

  async loadCounts() {
    try {
      const [pending, progressing] = await Promise.all([
        app.get('/api/orders', { status: 'pending' }),
        app.get('/api/orders', { status: 'in_progress' })
      ]);
      this.setData({ orderCounts: { pending: pending.length, in_progress: progressing.length } });
    } catch (e) {}
  },

  async loadDashboard() {
    try {
      const data = await app.get('/api/admin/dashboard');
      this.setData({ dashboard: data });
    } catch (e) {}
  },

  goToAdminDashboard() {
    wx.navigateTo({ url: '/pages/admin-dashboard/admin-dashboard' });
  },

  goToAdminOrders() {
    wx.navigateTo({ url: '/pages/admin-orders/admin-orders' });
  },

  goToOrders() {
    wx.switchTab({ url: '/pages/orders/orders' });
  },

  goToVehicles() {
    wx.navigateTo({ url: '/pages/vehicles/vehicles' });
  },

  goToCoupons() {
    wx.navigateTo({ url: '/pages/coupons/coupons' });
  },

  goToSettings() {
    wx.navigateTo({ url: '/pages/settings/settings' });
  },

  logout() {
    wx.showModal({
      title: '退出登录',
      content: '确定要退出登录吗？',
      success: (res) => {
        if (res.confirm) {
          app.globalData.token = '';
          app.globalData.userInfo = null;
          wx.removeStorageSync('token');
          wx.removeStorageSync('userInfo');
          app.switchToUserTabs();
          wx.switchTab({ url: '/pages/index/index' });
        }
      }
    });
  }
});
