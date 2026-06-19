App({
  globalData: {
    token: '',
    userInfo: null,
    baseUrl: 'http://192.168.2.7:3000'
  },

  onLaunch() {
    const token = wx.getStorageSync('token');
    const raw = wx.getStorageSync('userInfo');
    if (token) {
      this.globalData.token = token;
      try {
        this.globalData.userInfo = typeof raw === 'string' ? JSON.parse(raw) : raw;
      } catch (e) {
        this.globalData.userInfo = raw;
      }
      if (this.isAdmin()) {
        this.switchToAdminTabs();
      }
    }
  },

  isAdmin() {
    const u = this.globalData.userInfo;
    return u && u.role === 'admin';
  },

  // 切换为管理员导航栏
  switchToAdminTabs() {
    wx.setTabBarItem({ index: 0, text: '仪表盘' });
    wx.setTabBarItem({ index: 1, text: '订单管理' });
    wx.setTabBarItem({ index: 2, text: '数据' });
    wx.setTabBarItem({ index: 3, text: '我的' });
  },

  // 恢复普通用户导航栏
  switchToUserTabs() {
    wx.setTabBarItem({ index: 0, text: '首页' });
    wx.setTabBarItem({ index: 1, text: '服务' });
    wx.setTabBarItem({ index: 2, text: '订单' });
    wx.setTabBarItem({ index: 3, text: '我的' });
  },

  checkLogin() {
    if (!this.globalData.token) {
      wx.navigateTo({ url: '/pages/login/login' });
      return false;
    }
    return true;
  },

  request(method, url, data = {}) {
    return new Promise((resolve, reject) => {
      const header = { 'Content-Type': 'application/json' };
      if (this.globalData.token) {
        header['Authorization'] = 'Bearer ' + this.globalData.token;
      }
      wx.request({
        url: this.globalData.baseUrl + url,
        method,
        data,
        header,
        success: (res) => {
          if (res.data.code === 0) {
            resolve(res.data.data);
          } else if (res.data.code === 401) {
            this.globalData.token = '';
            wx.removeStorageSync('token');
            wx.redirectTo({ url: '/pages/login/login' });
            reject(res.data);
          } else {
            wx.showToast({ title: res.data.message || '请求失败', icon: 'none' });
            reject(res.data);
          }
        },
        fail: (err) => {
          wx.showToast({ title: '网络错误', icon: 'none' });
          reject(err);
        }
      });
    });
  },

  get(url, data) { return this.request('GET', url, data); },
  post(url, data) { return this.request('POST', url, data); },
  put(url, data) { return this.request('PUT', url, data); },
  del(url, data) { return this.request('DELETE', url, data); }
});
