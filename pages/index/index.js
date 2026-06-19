const app = getApp();
const util = require('../../utils/util');

Page({
  data: {
    isAdmin: false,
    // 用户端
    bannerColors: ['#1677FF', '#52C41A', '#FAAD14', '#FF4D4F', '#722ED1'],
    banners: [],
    services: [],
    stores: [],
    coupons: [],
    // 管理端
    dashboard: {},
    recentOrders: [],
    adminTabs: [
      { key: 'pending', label: '待确认' },
      { key: 'confirmed', label: '已确认' },
      { key: 'in_progress', label: '进行中' }
    ],
    adminActiveTab: 'pending'
  },

  onShow() {
    const admin = app.isAdmin();
    this.setData({ isAdmin: admin });
    if (admin) {
      this.loadAdminData();
    } else {
      this.loadUserData();
    }
  },

  onLoad() {
    this.onShow();
  },

  loadUserData() {
    app.get('/api/services').then(services => this.setData({ services }));
    app.get('/api/stores').then(stores => this.setData({ stores: stores.slice(0, 3) }));
    app.get('/api/banners').then(banners => {
      const colors = this.data.bannerColors;
      banners.forEach((b, i) => { b.fallbackColor = colors[i % colors.length]; });
      this.setData({ banners });
    });
    if (app.globalData.token) {
      app.get('/api/coupons').then(coupons => this.setData({ coupons: coupons.slice(0, 3) }));
    }
  },

  loadAdminData() {
    app.get('/api/admin/dashboard').then(data => {
      this.setData({ dashboard: data, recentOrders: data.recentOrders || [] });
    });
  },

  switchAdminTab(e) {
    this.setData({ adminActiveTab: e.currentTarget.dataset.key });
    app.get('/api/orders/admin/list', { status: e.currentTarget.dataset.key }).then(data => {
      this.setData({ recentOrders: data.list || data });
    });
  },

  updateStatus(e) {
    const { id, status } = e.currentTarget.dataset;
    app.put(`/api/orders/admin/status/${id}`, { status }).then(() => {
      wx.showToast({ title: '已更新', icon: 'success' });
      this.loadAdminData();
    });
  },

  // 用户端方法
  goToServices() { wx.switchTab({ url: '/pages/services/services' }); },
  goToServiceDetail(e) { wx.navigateTo({ url: `/pages/service-detail/service-detail?id=${e.currentTarget.dataset.id}` }); },
  goToStores() { wx.navigateTo({ url: '/pages/stores/stores' }); },
  goToStoreDetail(e) { wx.navigateTo({ url: `/pages/store-detail/store-detail?id=${e.currentTarget.dataset.id}` }); },
  goToBooking(e) {
    if (!app.checkLogin()) return;
    wx.navigateTo({ url: e.currentTarget.dataset.serviceId ? `/pages/booking/booking?serviceId=${e.currentTarget.dataset.serviceId}` : '/pages/booking/booking' });
  },
  receiveCoupon(e) {
    if (!app.checkLogin()) return;
    app.post(`/api/coupons/receive/${e.currentTarget.dataset.id}`).then(() => wx.showToast({ title: '领取成功', icon: 'success' }));
  }
});
