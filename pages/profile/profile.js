const app = getApp();

Page({
  data: {
    userInfo: null,
    isAdmin: false,
    myVehicle: null,
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
    this.loadVehicle();
    if (admin) this.loadDashboard();
  },

  async loadVehicle() {
    if (!app.isAdmin()) {
      try {
        const vehicles = await app.get('/api/vehicles');
        this.setData({ myVehicle: vehicles.length > 0 ? vehicles[0] : null });
      } catch (e) {}
    }
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

  goToEditProfile() {
    wx.navigateTo({ url: '/pages/profile-edit/profile-edit' });
  },

  goToVehicles() {
    wx.navigateTo({ url: '/pages/vehicles/vehicles' });
  },

  goToCoupons() {
    wx.navigateTo({ url: '/pages/coupons/coupons' });
  },

  goToPackages() {
    wx.showModal({ title: '我的套餐', content: '套餐功能开发中，敬请期待', showCancel: false });
  },
  goToPoints() {
    wx.showModal({ title: '我的积分', content: '积分功能开发中，敬请期待', showCancel: false });
  },
  goToTeam() {
    wx.showModal({ title: '我的团队', content: '团队功能开发中，敬请期待', showCancel: false });
  },

  showTip(e) {
    const text = e.currentTarget.dataset.text;
    wx.showModal({ title: text, content: '功能开发中，敬请期待', showCancel: false });
  },
  goToMyReviews() {
    wx.navigateTo({ url: '/pages/review/review' });
  },
  contactService() {
    wx.showModal({
      title: '在线客服',
      content: '客服电话：13800138000\n工作时间：08:00-20:00',
      showCancel: false
    });
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
