// In-memory cart store
let cartItems = [];

const Cart = {
  getAll() {
    return [...cartItems];
  },

  addItem(productId, quantity = 1) {
    const existing = cartItems.find(item => item.productId === productId);
    if (existing) {
      existing.quantity += quantity;
    } else {
      cartItems.push({ productId, quantity });
    }
    return this.getAll();
  },

  updateItem(productId, quantity) {
    const item = cartItems.find(item => item.productId === productId);
    if (!item) return null;
    if (quantity <= 0) {
      return this.removeItem(productId);
    }
    item.quantity = quantity;
    return this.getAll();
  },

  removeItem(productId) {
    cartItems = cartItems.filter(item => item.productId !== productId);
    return this.getAll();
  },

  clear() {
    cartItems = [];
    return [];
  },

  getItemCount() {
    return cartItems.reduce((sum, item) => sum + item.quantity, 0);
  }
};

module.exports = Cart;
