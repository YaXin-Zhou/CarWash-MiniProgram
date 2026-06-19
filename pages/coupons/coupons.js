const app = getApp();

Page({
  data: {
    tabs: [
      { key: 1, label: '可用' },
      { key: 2, label: '已用' },
      { key: 3, label: '已过期' }
    ],
    activeTab: 1,
    coupons: []
  },

  onShow() {
    this.loadCoupons();
  },

  loadCoupons() {
    app.get('/api/coupons/mine').then(coupons => {
      this.setData({ coupons });
    });
  },

  switchTab(e) {
    this.setData({ activeTab: e.currentTarget.dataset.key });
  }
});
