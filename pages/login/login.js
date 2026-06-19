const app = getApp();

Page({
  data: {
    loading: false,
    isAdminLogin: false,
    username: '',
    password: ''
  },

  onLoad(options) {
    if (options.admin) this.setData({ isAdminLogin: true });
  },

  // 普通用户微信登录
  handleLogin() {
    this.setData({ loading: true });
    wx.login({
      success: (res) => {
        if (res.code) {
          app.post('/api/auth/login', { code: res.code, nickname: '洗车用户', avatar: '' }).then(data => {
            this.loginSuccess(data);
          }).catch(() => this.setData({ loading: false }));
        }
      },
      fail: () => {
        this.setData({ loading: false });
        wx.showToast({ title: '登录失败', icon: 'none' });
      }
    });
  },

  // 管理员账号密码登录
  handleAdminLogin() {
    const { username, password } = this.data;
    if (!username || !password) {
      return wx.showToast({ title: '请输入账号和密码', icon: 'none' });
    }
    this.setData({ loading: true });
    app.post('/api/auth/admin-login', { username, password }).then(data => {
      this.loginSuccess(data);
    }).catch(() => this.setData({ loading: false }));
  },

  loginSuccess(data) {
    app.globalData.token = data.token;
    app.globalData.userInfo = data.user;
    wx.setStorageSync('token', data.token);
    wx.setStorageSync('userInfo', JSON.stringify(data.user));

    if (data.user.role === 'admin') {
      app.switchToAdminTabs();
    } else {
      app.switchToUserTabs();
    }

    wx.showToast({ title: '登录成功', icon: 'success' });
    setTimeout(() => {
      wx.switchTab({ url: '/pages/index/index' });
    }, 800);
  },

  switchMode() {
    this.setData({ isAdminLogin: !this.data.isAdminLogin });
  },

  onUsernameInput(e) { this.setData({ username: e.detail.value }); },
  onPasswordInput(e) { this.setData({ password: e.detail.value }); }
});
