const app = getApp();

Page({
  data: { service: null },

  onLoad(options) {
    app.get(`/api/services/${options.id}`).then(service => {
      this.setData({ service });
    });
  },

  goToBooking() {
    if (!app.checkLogin()) return;
    wx.navigateTo({ url: `/pages/booking/booking?serviceId=${this.data.service.id}` });
  }
});
