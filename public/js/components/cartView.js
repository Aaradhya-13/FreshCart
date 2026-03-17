// Cart View component
const CartView = {
  render(cartData) {
    if (!cartData || cartData.items.length === 0) {
      return `
        <div class="cart-page">
          <h1 class="page-title">Shopping Cart</h1>
          <div class="empty-state">
            <div class="empty-state-icon">🛒</div>
            <h2>Your cart is empty</h2>
            <p>Browse our fresh groceries and add items to your cart.</p>
            <button class="empty-state-btn" onclick="app.navigate('home')">Start Shopping</button>
          </div>
        </div>
      `;
    }

    const items = cartData.items.map(item => `
      <div class="cart-item fade-in">
        <div class="cart-item-emoji">${item.product.image}</div>
        <div class="cart-item-info">
          <div class="cart-item-name">${item.product.name}</div>
          <div class="cart-item-price">${Utils.formatPrice(item.product.price)} / ${item.product.unit}</div>
        </div>
        <div class="cart-item-actions">
          <div class="qty-control">
            <button class="qty-btn" onclick="app.updateCartQty('${item.productId}', ${item.quantity - 1})">−</button>
            <span class="qty-value">${item.quantity}</span>
            <button class="qty-btn" onclick="app.updateCartQty('${item.productId}', ${item.quantity + 1})">+</button>
          </div>
          <div class="cart-item-subtotal">${Utils.formatPrice(item.product.price * item.quantity)}</div>
          <button class="remove-btn" onclick="app.removeCartItem('${item.productId}')" title="Remove">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="3,6 5,6 21,6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
            </svg>
          </button>
        </div>
      </div>
    `).join('');

    const deliveryFee = cartData.total > 35 ? 0 : 4.99;
    const finalTotal = cartData.total + deliveryFee;

    return `
      <div class="cart-page slide-up">
        <h1 class="page-title">Shopping Cart</h1>
        <p class="page-subtitle">${cartData.itemCount} item${cartData.itemCount !== 1 ? 's' : ''} in your cart</p>
        <div class="cart-layout">
          <div class="cart-items-list">
            ${items}
          </div>
          <div class="cart-summary">
            <h3>Order Summary</h3>
            <div class="summary-row">
              <span>Subtotal</span>
              <span>${Utils.formatPrice(cartData.total)}</span>
            </div>
            <div class="summary-row">
              <span>Delivery</span>
              <span>${deliveryFee === 0 ? '<span style="color: var(--success)">FREE</span>' : Utils.formatPrice(deliveryFee)}</span>
            </div>
            ${deliveryFee > 0 ? `<div class="summary-row" style="font-size:11px;color:var(--primary-light)"><span>Add ${Utils.formatPrice(35 - cartData.total)} more for free delivery</span><span></span></div>` : ''}
            <div class="summary-row total">
              <span>Total</span>
              <span class="total-amount">${Utils.formatPrice(finalTotal)}</span>
            </div>
            <button class="checkout-btn" id="checkout-btn" onclick="app.placeOrder()">
              Place Order — ${Utils.formatPrice(finalTotal)}
            </button>
            <button class="clear-cart-btn" onclick="app.clearCart()">Clear Cart</button>
          </div>
        </div>
      </div>
    `;
  }
};
