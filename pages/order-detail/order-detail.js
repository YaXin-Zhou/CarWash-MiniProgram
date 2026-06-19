const app = getApp();
const util = require('../../utils/util');

Page({
  data: { order: null, review: null, statusSteps: [] },

  onLoad(options) {
    app.get(`/api/orders/${options.id}`).then(order => {
      const steps = [
        { text: '提交预约', done: true, time: order.created_at },
        { text: '商家确认', done: order.status !== 'pending', time: '' },
        { text: '服务进行中', done: ['in_progress', 'completed'].includes(order.status), time: '' },
        { text: '服务完成', done: order.status === 'completed', time: '' }
      ];
      this.setData({ order, statusSteps: steps });

      if (order.status === 'completed') {
        app.get(`/api/reviews/order/${order.id}`).then(review => {
          this.setData({ review });
        });
      }
    });
  },

  cancelOrder() {
    wx.showModal({
      title: '确认取消',
      content: '确定要取消该订单吗？',
      success: (res) => {
        if (res.confirm) {
          app.del(`/api/orders/${this.data.order.id}`).then(() => {
            wx.showToast({ title: '已取消', icon: 'success' });
            setTimeout(() => wx.navigateBack(), 1500);
          });
        }
      }
    });
  },

  goToReview() {
    wx.navigateTo({ url: `/pages/review/review?orderId=${this.data.order.id}` });
  }
});
