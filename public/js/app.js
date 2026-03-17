// Main Application Controller
const app = {
  currentPage: 'home',
  products: [],
  cartItems: [],
  categories: ['All'],
  activeCategory: 'All',
  searchQuery: '',

  async init() {
    // Set up search with debounce
    const searchInput = document.getElementById('search-input');
    searchInput.addEventListener('input', Utils.debounce((e) => {
      this.searchQuery = e.target.value.trim();
      this.loadProducts();
    }, 300));

    // Load initial data
    this.navigate('home');
    this.refreshCartBadge();
  },

  // --- Navigation ---
  async navigate(page, data = null) {
    this.currentPage = page;
    Header.setActiveNav(page);
    const main = document.getElementById('main-content');

    switch (page) {
      case 'home':
        await this.renderHome(main);
        break;
      case 'cart':
        await this.renderCart(main);
        break;
      case 'orders':
        await this.renderOrders(main);
        break;
      case 'confirmation':
        main.innerHTML = Checkout.renderConfirmation(data);
        break;
    }

    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
  },

  // --- Home Page ---
  async renderHome(container) {
    container.innerHTML = this.renderHero() + this.renderCategoryBar() + 
      `<div class="section-header"><h2>Fresh Picks</h2><span class="product-count" id="product-count"></span></div>` +
      `<div id="products-container">${ProductCard.renderSkeletons()}</div>`;

    await this.loadCategories();
    await this.loadProducts();
  },

  renderHero() {
    return `
      <section class="hero">
        <div class="hero-content">
          <h1>Fresh Groceries,<br>Delivered to Your Door</h1>
          <p>Handpicked produce, dairy, bakery & more — shop premium quality groceries from the comfort of your home.</p>
        </div>
        <div class="hero-emojis">
          <span>🥑</span><span>🍓</span><span>🥖</span><span>🧀</span>
        </div>
      </section>
    `;
  },

  renderCategoryBar() {
    const chips = this.categories.map(cat =>
      `<button class="cat-chip ${cat === this.activeCategory ? 'active' : ''}" onclick="app.filterCategory('${cat}')">${cat === 'All' ? '🛍️ All' : cat}</button>`
    ).join('');
    return `<div class="categories-bar" id="categories-bar">${chips}</div>`;
  },

  async loadCategories() {
    try {
      const res = await API.getCategories();
      this.categories = ['All', ...res.data];
      const bar = document.getElementById('categories-bar');
      if (bar) {
        bar.innerHTML = this.categories.map(cat =>
          `<button class="cat-chip ${cat === this.activeCategory ? 'active' : ''}" onclick="app.filterCategory('${cat}')">${cat === 'All' ? '🛍️ All' : cat}</button>`
        ).join('');
      }
    } catch (err) {
      console.error('Failed to load categories', err);
    }
  },

  async loadProducts() {
    try {
      const [productsRes, cartRes] = await Promise.all([
        API.getProducts(this.activeCategory, this.searchQuery),
        API.getCart()
      ]);

      this.products = productsRes.data;
      this.cartItems = cartRes.data.items;

      const container = document.getElementById('products-container');
      if (container) {
        container.innerHTML = ProductCard.renderGrid(this.products, this.cartItems);
      }

      const counter = document.getElementById('product-count');
      if (counter) {
        counter.textContent = `${productsRes.count} items`;
      }

      Header.updateCartBadge(cartRes.data.itemCount);
    } catch (err) {
      console.error('Failed to load products', err);
    }
  },

  filterCategory(category) {
    this.activeCategory = category;
    // Update chip styles
    document.querySelectorAll('.cat-chip').forEach(chip => {
      chip.classList.toggle('active', chip.textContent.includes(category === 'All' ? 'All' : category));
    });
    this.loadProducts();
  },

  // --- Cart Actions (from product card) ---
  async addToCart(productId) {
    try {
      const res = await API.addToCart(productId);
      this.cartItems = res.data.items;
      Header.updateCartBadge(res.data.itemCount);

      // Re-render just the card footer
      const product = this.products.find(p => p.id === productId);
      if (product) {
        Utils.showToast(`${product.name} added to cart`);
      }

      // Re-render products to update qty controls
      const container = document.getElementById('products-container');
      if (container) {
        container.innerHTML = ProductCard.renderGrid(this.products, this.cartItems);
      }
    } catch (err) {
      Utils.showToast('Failed to add item', 'error');
    }
  },

  async updateQty(productId, newQty) {
    try {
      if (newQty <= 0) {
        await API.removeFromCart(productId);
      } else {
        await API.updateCartItem(productId, newQty);
      }
      const cartRes = await API.getCart();
      this.cartItems = cartRes.data.items;
      Header.updateCartBadge(cartRes.data.itemCount);

      const container = document.getElementById('products-container');
      if (container) {
        container.innerHTML = ProductCard.renderGrid(this.products, this.cartItems);
      }
    } catch (err) {
      Utils.showToast('Failed to update quantity', 'error');
    }
  },

  // --- Cart Page ---
  async renderCart(container) {
    try {
      const res = await API.getCart();
      Header.updateCartBadge(res.data.itemCount);
      container.innerHTML = CartView.render(res.data);
    } catch (err) {
      container.innerHTML = CartView.render(null);
    }
  },

  async updateCartQty(productId, newQty) {
    try {
      if (newQty <= 0) {
        await API.removeFromCart(productId);
      } else {
        await API.updateCartItem(productId, newQty);
      }
      await this.renderCart(document.getElementById('main-content'));
    } catch (err) {
      Utils.showToast('Failed to update quantity', 'error');
    }
  },

  async removeCartItem(productId) {
    try {
      await API.removeFromCart(productId);
      Utils.showToast('Item removed from cart');
      await this.renderCart(document.getElementById('main-content'));
    } catch (err) {
      Utils.showToast('Failed to remove item', 'error');
    }
  },

  async clearCart() {
    try {
      await API.clearCart();
      Utils.showToast('Cart cleared');
      await this.renderCart(document.getElementById('main-content'));
    } catch (err) {
      Utils.showToast('Failed to clear cart', 'error');
    }
  },

  // --- Orders ---
  async placeOrder() {
    try {
      const btn = document.getElementById('checkout-btn');
      if (btn) {
        btn.disabled = true;
        btn.textContent = 'Placing Order...';
      }

      const res = await API.placeOrder();
      Header.updateCartBadge(0);
      Utils.showToast(`Order ${res.data.id} placed successfully!`);
      this.navigate('confirmation', res.data);
    } catch (err) {
      Utils.showToast('Failed to place order', 'error');
      const btn = document.getElementById('checkout-btn');
      if (btn) {
        btn.disabled = false;
        btn.textContent = 'Place Order';
      }
    }
  },

  async renderOrders(container) {
    try {
      const res = await API.getOrders();
      container.innerHTML = Checkout.renderOrdersList(res.data);
    } catch (err) {
      container.innerHTML = Checkout.renderOrdersList([]);
    }
  },

  // --- Helpers ---
  async refreshCartBadge() {
    try {
      const res = await API.getCart();
      Header.updateCartBadge(res.data.itemCount);
    } catch (err) {
      // ignore
    }
  }
};

// Start the app
document.addEventListener('DOMContentLoaded', () => app.init());
