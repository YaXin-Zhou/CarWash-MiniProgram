Page({
  data: {},

  callService() {
    wx.makePhoneCall({ phoneNumber: '13800138000' });
  },

  showAbout() {
    wx.showModal({
      title: '关于阳光洗车',
      content: '阳光洗车是专业的汽车美容服务平台，提供标准化、高品质的汽车清洗和护理服务。\n\n版本 1.0.0',
      showCancel: false
    });
  }
});
