const { createApp } = Vue;

createApp({
  data() {
    return {
      token: localStorage.getItem('admin_token') || '',
      activeMenu: 'dashboard',
      loginForm: { username: 'admin', password: 'admin' },
      menus: [
        { key: 'dashboard', label: '仪表盘' },
        { key: 'orders', label: '订单管理' },
        { key: 'services', label: '服务管理' },
        { key: 'stores', label: '门店管理' },
        { key: 'users', label: '用户管理' },
        { key: 'coupons', label: '优惠券管理' },
        { key: 'banners', label: '轮播图管理' },
        { key: 'reviews', label: '评价管理' }
      ],
      statusMap: { pending: '待确认', confirmed: '已确认', in_progress: '进行中', completed: '已完成', cancelled: '已取消' },
      dashboard: {},
      orders: { list: [], total: 0 },
      orderFilter: { status: 'all', keyword: '' },
      services: [],
      stores: [],
      users: [],
      coupons: [],
      reviews: [],
      banners: [],
      showServiceForm: false,
      editingService: this.emptyService(),
      showStoreForm: false,
      editingStore: this.emptyStore(),
      showCouponForm: false,
      editingCoupon: this.emptyCoupon(),
      showBannerForm: false,
      editingBanner: this.emptyBanner(),
      baseUrl: ''
    };
  },

  methods: {
    emptyService() {
      return { name: '', icon: '', price: 0, original_price: 0, duration: 30, description: '', category: '标准洗车' };
    },
    emptyStore() {
      return { name: '', address: '', phone: '', open_time: '08:00', close_time: '20:00', latitude: 0, longitude: 0, description: '' };
    },
    emptyCoupon() {
      return { name: '', type: 'discount', discount_value: 10, min_amount: 0, valid_days: 30, total_count: 100 };
    },
    emptyBanner() {
      return { image_url: '', title: '', link_url: '', sort_order: 0 };
    },

    async request(method, url, data = {}) {
      try {
        const config = {
          method,
          url: this.baseUrl + url,
          headers: {}
        };
        if (this.token) config.headers['Authorization'] = 'Bearer ' + this.token;
        if (method === 'GET') config.params = data;
        else config.data = data;

        const res = await axios(config);
        if (res.data.code === 0) return res.data.data;
        if (res.data.code === 401) { this.token = ''; localStorage.removeItem('admin_token'); }
        throw new Error(res.data.message);
      } catch (e) {
        alert(e.message || '请求失败');
        throw e;
      }
    },

    get(url, data) { return this.request('GET', url, data); },
    post(url, data) { return this.request('POST', url, data); },
    put(url, data) { return this.request('PUT', url, data); },
    del(url) { return this.request('DELETE', url); },

    // Auth
    async login() {
      if (!this.loginForm.username || !this.loginForm.password) return alert('请输入账号密码');
      try {
        const res = await axios.post(this.baseUrl + '/api/auth/login', {
          code: 'admin_' + this.loginForm.password,
          nickname: '管理员'
        });
        this.token = res.data.data.token;
        localStorage.setItem('admin_token', this.token);
        // Update user role to admin in backend
        await axios.put(this.baseUrl + '/api/admin/users/1/status', { status: 1 }, {
          headers: { 'Authorization': 'Bearer ' + this.token }
        });
        this.loadAll();
      } catch (e) {
        alert('登录失败，请确保后端服务已启动');
      }
    },

    logout() {
      this.token = '';
      localStorage.removeItem('admin_token');
    },

    // Loaders
    async loadAll() {
      try {
        const [dash, orders, services, stores, users, coupons, reviews, banners] = await Promise.all([
          this.get('/api/admin/dashboard'),
          this.get('/api/orders/admin/list'),
          this.get('/api/services'),
          this.get('/api/stores'),
          this.get('/api/admin/users'),
          this.get('/api/admin/coupons'),
          this.get('/api/admin/reviews'),
          this.get('/api/banners/admin')
        ]);
        this.dashboard = dash;
        this.orders = orders;
        this.services = services;
        this.stores = stores;
        this.users = users;
        this.coupons = coupons;
        this.reviews = reviews;
        this.banners = banners;
      } catch (e) {}
    },

    loadOrders() {
      this.get('/api/orders/admin/list', { status: this.orderFilter.status, keyword: this.orderFilter.keyword })
        .then(data => this.orders = data);
    },

    // Orders
    async updateOrderStatus(id, status) {
      if (!status) return;
      await this.put(`/api/orders/admin/status/${id}`, { status });
      this.loadOrders();
      alert('状态已更新');
    },

    // Services
    openServiceForm(svc) {
      this.editingService = svc ? { ...svc } : this.emptyService();
      this.showServiceForm = true;
    },
    async saveService() {
      const s = this.editingService;
      if (s.id) {
        await this.put(`/api/services/${s.id}`, s);
      } else {
        await this.post('/api/services', s);
      }
      this.showServiceForm = false;
      this.get('/api/services').then(data => this.services = data);
    },
    async deleteService(id) {
      if (!confirm('确定删除？')) return;
      await this.del(`/api/services/${id}`);
      this.get('/api/services').then(data => this.services = data);
    },

    // Stores
    openStoreForm(store) {
      this.editingStore = store ? { ...store } : this.emptyStore();
      this.showStoreForm = true;
    },
    async saveStore() {
      const s = this.editingStore;
      if (s.id) {
        await this.put(`/api/stores/${s.id}`, s);
      } else {
        await this.post('/api/stores', s);
      }
      this.showStoreForm = false;
      this.get('/api/stores').then(data => this.stores = data);
    },
    async deleteStore(id) {
      if (!confirm('确定删除？')) return;
      await this.del(`/api/stores/${id}`);
      this.get('/api/stores').then(data => this.stores = data);
    },

    // Users
    async toggleUserStatus(u) {
      const newStatus = u.status === 1 ? 0 : 1;
      await this.put(`/api/admin/users/${u.id}/status`, { status: newStatus });
      this.get('/api/admin/users').then(data => this.users = data);
    },

    // Coupons
    openCouponForm(c) {
      this.editingCoupon = c ? { ...c } : this.emptyCoupon();
      this.showCouponForm = true;
    },
    async saveCoupon() {
      const c = this.editingCoupon;
      if (c.id) {
        await this.put(`/api/admin/coupons/${c.id}`, c);
      } else {
        await this.post('/api/admin/coupons', c);
      }
      this.showCouponForm = false;
      this.get('/api/admin/coupons').then(data => this.coupons = data);
    },

    // Reviews
    async deleteReview(id) {
      if (!confirm('确定删除？')) return;
      await this.del(`/api/admin/reviews/${id}`);
      this.get('/api/admin/reviews').then(data => this.reviews = data);
    },

    // Banners
    openBannerForm(b) {
      this.editingBanner = b ? { ...b } : this.emptyBanner();
      this.showBannerForm = true;
    },
    async saveBanner() {
      const b = this.editingBanner;
      if (b.id) {
        await this.put(`/api/banners/${b.id}`, b);
      } else {
        await this.post('/api/banners', b);
      }
      this.showBannerForm = false;
      this.get('/api/banners/admin').then(data => this.banners = data);
    },
    async deleteBanner(id) {
      if (!confirm('确定删除？')) return;
      await this.del(`/api/banners/${id}`);
      this.get('/api/banners/admin').then(data => this.banners = data);
    },
    async uploadBannerImage(e) {
      const file = e.target.files[0];
      if (!file) return;
      const form = new FormData();
      form.append('file', file);
      try {
        const res = await axios.post(this.baseUrl + '/api/upload', form);
        if (res.data.code === 0) {
          this.editingBanner.image_url = this.baseUrl + res.data.data.url;
        }
      } catch (err) {
        alert('上传失败');
      }
    }
  },

  mounted() {
    if (this.token) this.loadAll();
  },

  watch: {
    activeMenu() {
      if (!this.token) return;
      switch (this.activeMenu) {
        case 'dashboard': this.get('/api/admin/dashboard').then(d => this.dashboard = d); break;
        case 'orders': this.loadOrders(); break;
        case 'services': this.get('/api/services').then(d => this.services = d); break;
        case 'stores': this.get('/api/stores').then(d => this.stores = d); break;
        case 'users': this.get('/api/admin/users').then(d => this.users = d); break;
        case 'coupons': this.get('/api/admin/coupons').then(d => this.coupons = d); break;
        case 'banners': this.get('/api/banners/admin').then(d => this.banners = d); break;
        case 'reviews': this.get('/api/admin/reviews').then(d => this.reviews = d); break;
      }
    }
  }
}).mount('#app');
