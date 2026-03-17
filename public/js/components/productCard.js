// Product Card component
const ProductCard = {
  render(product, cartItems = []) {
    const inCart = cartItems.find(item => item.productId === product.id);
    const qty = inCart ? inCart.quantity : 0;

    return `
      <div class="product-card slide-up" id="product-${product.id}">
        <div class="product-card-image">
          <span>${product.image}</span>
          <div class="product-rating">⭐ ${product.rating}</div>
        </div>
        <div class="product-card-body">
          <div class="product-category">${product.category}</div>
          <h3 class="product-name">${product.name}</h3>
          <p class="product-description">${product.description}</p>
          <div class="product-card-footer">
            <div>
              <span class="product-price">${Utils.formatPrice(product.price)}</span>
              <span class="product-unit">/ ${product.unit}</span>
            </div>
            ${qty > 0
              ? ProductCard.renderQtyControl(product.id, qty)
              : ProductCard.renderAddBtn(product.id)
            }
          </div>
        </div>
      </div>
    `;
  },

  renderAddBtn(productId) {
    return `
      <button class="add-to-cart-btn" id="add-btn-${productId}" onclick="app.addToCart('${productId}')">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
        </svg>
        <span>Add</span>
      </button>
    `;
  },

  renderQtyControl(productId, qty) {
    return `
      <div class="qty-control">
        <button class="qty-btn" onclick="app.updateQty('${productId}', ${qty - 1})">−</button>
        <span class="qty-value">${qty}</span>
        <button class="qty-btn" onclick="app.updateQty('${productId}', ${qty + 1})">+</button>
      </div>
    `;
  },

  renderGrid(products, cartItems = []) {
    if (products.length === 0) {
      return `
        <div class="empty-state">
          <div class="empty-state-icon">🔍</div>
          <h2>No products found</h2>
          <p>Try adjusting your search or category filter.</p>
        </div>
      `;
    }
    return `<div class="product-grid">${products.map(p => ProductCard.render(p, cartItems)).join('')}</div>`;
  },

  renderSkeletons(count = 8) {
    return `<div class="product-grid">${Array(count).fill('<div class="skeleton skeleton-card"></div>').join('')}</div>`;
  }
};
