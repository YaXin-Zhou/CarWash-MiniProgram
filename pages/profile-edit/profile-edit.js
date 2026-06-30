const app = getApp();

Page({
  data: {
    nickname: '',
    phone: '',
    avatar: '',
    userId: ''
  },

  onLoad() {
    const user = app.globalData.userInfo || {};
    this.setData({
      nickname: user.nickname || '',
      phone: user.phone || '',
      avatar: user.avatar || '',
      userId: user.id || ''
    });
  },

  onNickname(e) { this.setData({ nickname: e.detail.value }); },
  onPhone(e) { this.setData({ phone: e.detail.value }); },

  chooseAvatar() {
    wx.chooseMedia({
      count: 1,
      mediaType: ['image'],
      success: (res) => {
        const tempPath = res.tempFiles[0].tempFilePath;
        wx.uploadFile({
          url: app.globalData.baseUrl + '/api/upload',
          filePath: tempPath,
          name: 'file',
          header: { 'Authorization': 'Bearer ' + app.globalData.token },
          success: (uploadRes) => {
            const data = JSON.parse(uploadRes.data);
            if (data.code === 0) {
              this.setData({ avatar: app.globalData.baseUrl + data.data.url });
            }
          }
        });
      }
    });
  },

  save() {
    const { nickname, phone, avatar } = this.data;
    app.put('/api/user/profile', { nickname, phone, avatar }).then(() => {
      app.globalData.userInfo.nickname = nickname;
      app.globalData.userInfo.phone = phone;
      app.globalData.userInfo.avatar = avatar;
      wx.setStorageSync('userInfo', JSON.stringify(app.globalData.userInfo));
      wx.showToast({ title: '保存成功', icon: 'success', duration: 800 });
      wx.navigateBack();
    });
  }
});
