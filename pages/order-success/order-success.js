Page({
  data: { orderId: '', orderNo: '' },

  onLoad(options) {
    this.setData({ orderId: options.orderId, orderNo: options.orderNo });
  },

  goToOrder() {
    wx.redirectTo({ url: `/pages/order-detail/order-detail?id=${this.data.orderId}` });
  },

  goHome() {
    wx.switchTab({ url: '/pages/index/index' });
  }
});
