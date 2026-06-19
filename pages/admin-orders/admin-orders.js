const app = getApp();
const util = require('../../utils/util');

Page({
  data: {
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
    keyword: ''
  },

  onShow() {
    if (!app.isAdmin()) { wx.navigateBack(); return; }
    this.loadOrders();
  },

  loadOrders() {
    app.get('/api/orders/admin/list', {
      status: this.data.activeTab === 'all' ? '' : this.data.activeTab,
      keyword: this.data.keyword
    }).then(data => {
      this.setData({ orders: data.list || data });
    });
  },

  switchTab(e) {
    this.setData({ activeTab: e.currentTarget.dataset.key }, () => this.loadOrders());
  },

  onSearchInput(e) {
    this.setData({ keyword: e.detail.value });
  },

  search() {
    this.loadOrders();
  },

  updateStatus(e) {
    const { id, status } = e.currentTarget.dataset;
    app.put(`/api/orders/admin/status/${id}`, { status }).then(() => {
      wx.showToast({ title: '已更新', icon: 'success' });
      this.loadOrders();
    });
  }
});
