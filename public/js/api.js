// API client
const API = {
  baseUrl: '/api',

  async request(endpoint, options = {}) {
    try {
      const res = await fetch(`${this.baseUrl}${endpoint}`, {
        headers: { 'Content-Type': 'application/json' },
        ...options,
        body: options.body ? JSON.stringify(options.body) : undefined
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error || 'Request failed');
      return data;
    } catch (err) {
      console.error('API Error:', err);
      throw err;
    }
  },

  // Products
  async getProducts(category, search) {
    const params = new URLSearchParams();
    if (category && category !== 'All') params.set('category', category);
    if (search) params.set('search', search);
    const query = params.toString();
    return this.request(`/products${query ? '?' + query : ''}`);
  },

  async getCategories() {
    return this.request('/products/categories');
  },

  // Cart
  async getCart() {
    return this.request('/cart');
  },

  async addToCart(productId, quantity = 1) {
    return this.request('/cart', {
      method: 'POST',
      body: { productId, quantity }
    });
  },

  async updateCartItem(productId, quantity) {
    return this.request(`/cart/${productId}`, {
      method: 'PUT',
      body: { quantity }
    });
  },

  async removeFromCart(productId) {
    return this.request(`/cart/${productId}`, {
      method: 'DELETE'
    });
  },

  async clearCart() {
    return this.request('/cart', {
      method: 'DELETE'
    });
  },

  // Orders
  async placeOrder() {
    return this.request('/orders', {
      method: 'POST'
    });
  },

  async getOrders() {
    return this.request('/orders');
  }
};
