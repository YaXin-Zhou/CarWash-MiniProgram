const app = getApp();
const util = require('../../utils/util');

Page({
  data: {
    step: 1,
    services: [],
    stores: [],
    vehicles: [],
    dateRange: util.getDateRange(7),
    timeSlots: util.getTimeSlots(),
    selectedService: null,
    selectedStore: null,
    selectedVehicle: null,
    selectedDate: '',
    selectedTime: '',
    remark: '',
    availableCoupons: [],
    selectedCoupon: null,
    totalAmount: 0
  },

  onLoad(options) {
    if (options.serviceId) {
      app.get(`/api/services/${options.serviceId}`).then(s => {
        this.setData({ selectedService: s, totalAmount: s.price });
      });
    }
    if (options.storeId) {
      app.get(`/api/stores/${options.storeId}`).then(s => {
        this.setData({ selectedStore: s });
      });
    }
    app.get('/api/services').then(services => this.setData({ services }));
    app.get('/api/stores').then(stores => this.setData({ stores }));
    app.get('/api/vehicles').then(vehicles => this.setData({ vehicles }));

    const today = util.formatDate(new Date());
    this.setData({ selectedDate: today });
  },

  selectService(e) {
    const service = this.data.services.find(s => s.id === e.currentTarget.dataset.id);
    this.setData({ selectedService: service, totalAmount: service.price, step: 2 });
  },

  selectStore(e) {
    const store = this.data.stores.find(s => s.id === e.currentTarget.dataset.id);
    this.setData({ selectedStore: store, step: 3 });
  },

  selectDate(e) { this.setData({ selectedDate: e.currentTarget.dataset.date }); },
  selectTime(e) { this.setData({ selectedTime: e.currentTarget.dataset.time }); },
  selectVehicle(e) { this.setData({ selectedVehicle: e.currentTarget.dataset.id }); },

  onRemarkInput(e) { this.setData({ remark: e.detail.value }); },

  prevStep() {
    if (this.data.step > 1) this.setData({ step: this.data.step - 1 });
  },

  handleNextStep() { this.goToConfirm(); },

  goToConfirm() {
    const { selectedService, selectedStore, selectedDate, selectedTime } = this.data;
    if (!selectedService) return wx.showToast({ title: '请选择服务', icon: 'none' });
    if (!selectedStore) return wx.showToast({ title: '请选择门店', icon: 'none' });
    if (!selectedDate) return wx.showToast({ title: '请选择日期', icon: 'none' });
    if (!selectedTime) return wx.showToast({ title: '请选择时间', icon: 'none' });

    app.get('/api/coupons/mine?status=1').then(coupons => {
      this.setData({ availableCoupons: coupons, step: 4 });
    }).catch(() => {
      this.setData({ step: 4 });
    });
  },

  selectCoupon(e) {
    const coupon = this.data.availableCoupons.find(c => c.id === e.currentTarget.dataset.id);
    if (this.data.selectedCoupon && this.data.selectedCoupon.id === coupon.id) {
      this.setData({ selectedCoupon: null, totalAmount: this.data.selectedService.price });
      return;
    }
    let amount = this.data.selectedService.price;
    if (amount >= coupon.min_amount) {
      if (coupon.type === 'percent') {
        amount = Math.round(amount * (100 - coupon.discount_value) / 100 * 100) / 100;
      } else {
        amount = Math.max(0, amount - coupon.discount_value);
      }
    }
    this.setData({ selectedCoupon: coupon, totalAmount: amount });
  },

  submitOrder() {
    const { selectedService, selectedStore, selectedDate, selectedTime, selectedVehicle, selectedCoupon, remark } = this.data;
    app.post('/api/orders', {
      service_id: selectedService.id,
      store_id: selectedStore.id,
      vehicle_id: selectedVehicle,
      coupon_id: selectedCoupon ? selectedCoupon.id : null,
      appoint_date: selectedDate,
      appoint_time: selectedTime,
      remark
    }).then(order => {
      wx.redirectTo({ url: `/pages/order-success/order-success?orderId=${order.id}&orderNo=${order.order_no}` });
    });
  }
});
