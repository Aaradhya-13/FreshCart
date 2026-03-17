// Checkout / Order Confirmation / Orders list component
const Checkout = {
  renderConfirmation(order) {
    const items = order.items.map(item => `
      <div class="order-item-row">
        <div class="order-item-left">
          <span class="order-item-emoji">${item.image}</span>
          <div>
            <div class="order-item-name">${item.name}</div>
            <div class="order-item-qty">Qty: ${item.quantity}</div>
          </div>
        </div>
        <div class="order-item-price">${Utils.formatPrice(item.subtotal)}</div>
      </div>
    `).join('');

    return `
      <div class="checkout-page slide-up">
        <div class="order-success">
          <div class="order-success-icon">✓</div>
          <h2>Order Placed!</h2>
          <div class="order-id">${order.id}</div>
          <div class="order-items-list">
            ${items}
            <div class="order-total-row">
              <span>Total Paid</span>
              <span class="amount">${Utils.formatPrice(order.total)}</span>
            </div>
          </div>
          <button class="empty-state-btn" onclick="app.navigate('home')" style="margin-top:16px;">Continue Shopping</button>
          <button class="clear-cart-btn" onclick="app.navigate('orders')" style="margin-top:8px;">View All Orders</button>
        </div>
      </div>
    `;
  },

  renderOrdersList(orders) {
    if (orders.length === 0) {
      return `
        <div class="orders-page">
          <h1 class="page-title">My Orders</h1>
          <div class="empty-state">
            <div class="empty-state-icon">📦</div>
            <h2>No orders yet</h2>
            <p>When you place orders, they'll appear here.</p>
            <button class="empty-state-btn" onclick="app.navigate('home')">Start Shopping</button>
          </div>
        </div>
      `;
    }

    const cards = orders.map(order => `
      <div class="order-card fade-in">
        <div class="order-card-header">
          <span class="order-card-id">${order.id}</span>
          <span class="order-status">${order.status}</span>
        </div>
        <div class="order-card-items">
          ${order.items.map(item => `<span class="order-card-item">${item.image} ${item.name} ×${item.quantity}</span>`).join('')}
        </div>
        <div class="order-card-footer">
          <span class="order-card-date">${Utils.formatDate(order.createdAt)}</span>
          <span class="order-card-total">${Utils.formatPrice(order.total)}</span>
        </div>
      </div>
    `).join('');

    return `
      <div class="orders-page slide-up">
        <h1 class="page-title">My Orders</h1>
        <p class="page-subtitle">${orders.length} order${orders.length !== 1 ? 's' : ''} placed</p>
        ${cards}
      </div>
    `;
  }
};
