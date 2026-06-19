const app = getApp();

Page({
  data: { orderId: '', rating: 5, content: '' },

  onLoad(options) {
    this.setData({ orderId: options.orderId });
  },

  setRating(e) {
    this.setData({ rating: e.currentTarget.dataset.rating });
  },

  onContentInput(e) {
    this.setData({ content: e.detail.value });
  },

  submit() {
    if (!this.data.rating) return wx.showToast({ title: '请选择评分', icon: 'none' });

    app.post('/api/reviews', {
      order_id: Number(this.data.orderId),
      rating: this.data.rating,
      content: this.data.content
    }).then(() => {
      wx.showToast({ title: '评价成功', icon: 'success' });
      setTimeout(() => wx.navigateBack(), 1500);
    });
  }
});
