const app = getApp();

Page({
  data: { vehicles: [] },

  onShow() {
    app.get('/api/vehicles').then(vehicles => this.setData({ vehicles }));
  },

  addVehicle() {
    wx.navigateTo({ url: '/pages/vehicle-form/vehicle-form' });
  },

  editVehicle(e) {
    wx.navigateTo({ url: `/pages/vehicle-form/vehicle-form?id=${e.currentTarget.dataset.id}` });
  },

  deleteVehicle(e) {
    wx.showModal({
      title: '确认删除',
      content: '确定要删除该车辆吗？',
      success: (res) => {
        if (res.confirm) {
          app.del(`/api/vehicles/${e.currentTarget.dataset.id}`).then(() => {
            this.onShow();
          });
        }
      }
    });
  }
});
