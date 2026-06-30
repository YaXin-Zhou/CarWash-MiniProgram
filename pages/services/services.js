const app = getApp();
const util = require('../../utils/util');

Page({
  data: {
    isAdmin: false,
    // 用户端
    categories: [],
    services: [],
    activeCategory: '',
    // 管理端：订单管理
    statusTabs: [
      { key: 'all', label: '全部' },
      { key: 'pending', label: '待确认' },
      { key: 'confirmed', label: '已确认' },
      { key: 'in_progress', label: '进行中' },
      { key: 'completed', label: '已完成' },
      { key: 'cancelled', label: '已取消' }
    ],
    activeStatus: 'all',
    orders: [],
    keyword: ''
  },

  onShow() {
    const admin = app.isAdmin();
    this.setData({ isAdmin: admin });
    if (admin) {
      this.loadOrders();
    } else {
      app.get('/api/services').then(services => {
        const cats = [...new Set(services.map(s => s.category))];
        this.setData({ services, categories: cats, activeCategory: cats[0] || '' });
      });
    }
  },

  onLoad() {
    this.onShow();
  },

  // ===== 管理端 =====
  loadOrders() {
    app.get('/api/orders/admin/list', {
      status: this.data.activeStatus === 'all' ? '' : this.data.activeStatus,
      keyword: this.data.keyword
    }).then(data => {
      this.setData({ orders: data.list || data });
    });
  },

  switchStatus(e) {
    this.setData({ activeStatus: e.currentTarget.dataset.key }, () => this.loadOrders());
  },

  onSearchInput(e) { this.setData({ keyword: e.detail.value }); },

  search() { this.loadOrders(); },

  updateStatus(e) {
    const { id, status } = e.currentTarget.dataset;
    app.put(`/api/orders/admin/status/${id}`, { status }).then(() => {
      wx.showToast({ title: '已更新', icon: 'success' });
      this.loadOrders();
    });
  },

  // ===== 用户端 =====
  switchCategory(e) {
    this.setData({ activeCategory: e.currentTarget.dataset.cat });
  },
  goToDetail(e) {
    wx.navigateTo({ url: `/pages/service-detail/service-detail?id=${e.currentTarget.dataset.id}` });
  }
});
