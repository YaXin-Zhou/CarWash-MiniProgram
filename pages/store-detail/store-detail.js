const app = getApp();

Page({
  data: { store: null },

  onLoad(options) {
    app.get(`/api/stores/${options.id}`).then(store => {
      this.setData({ store });
    });
  },

  goToBooking() {
    if (!app.checkLogin()) return;
    wx.navigateTo({ url: `/pages/booking/booking?storeId=${this.data.store.id}` });
  },

  callPhone() {
    wx.makePhoneCall({ phoneNumber: this.data.store.phone });
  },

  openLocation() {
    const store = this.data.store;
    wx.openLocation({
      latitude: store.latitude,
      longitude: store.longitude,
      name: store.name,
      address: store.address
    });
  }
});
