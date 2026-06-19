const app = getApp();

Page({
  data: {
    isEdit: false,
    id: '',
    plate_no: '',
    brand: '',
    model: '',
    color: ''
  },

  onLoad(options) {
    if (options.id) {
      this.setData({ isEdit: true, id: options.id });
      app.get('/api/vehicles').then(vehicles => {
        const v = vehicles.find(item => item.id === Number(options.id));
        if (v) this.setData({ plate_no: v.plate_no, brand: v.brand, model: v.model, color: v.color });
      });
    }
  },

  onPlateInput(e) { this.setData({ plate_no: e.detail.value }); },
  onBrandInput(e) { this.setData({ brand: e.detail.value }); },
  onModelInput(e) { this.setData({ model: e.detail.value }); },
  onColorInput(e) { this.setData({ color: e.detail.value }); },

  save() {
    const { isEdit, id, plate_no, brand, model, color } = this.data;
    if (!plate_no) return wx.showToast({ title: '请输入车牌号', icon: 'none' });

    const data = { plate_no, brand, model, color };
    const promise = isEdit ? app.put(`/api/vehicles/${id}`, data) : app.post('/api/vehicles', data);

    promise.then(() => {
      wx.showToast({ title: isEdit ? '修改成功' : '添加成功', icon: 'success' });
      setTimeout(() => wx.navigateBack(), 1500);
    });
  }
});
