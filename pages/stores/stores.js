const app = getApp();

Page({
  data: { stores: [] },

  onLoad() {
    app.get('/api/stores').then(stores => {
      this.setData({ stores });
    });
  },

  goToDetail(e) {
    wx.navigateTo({ url: `/pages/store-detail/store-detail?id=${e.currentTarget.dataset.id}` });
  }
});
