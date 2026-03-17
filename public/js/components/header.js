// Header component logic
const Header = {
  updateCartBadge(count) {
    const badge = document.getElementById('cart-badge');
    badge.textContent = count;
    if (count > 0) {
      badge.classList.add('visible');
      badge.classList.remove('pop');
      void badge.offsetWidth; // trigger reflow
      badge.classList.add('pop');
    } else {
      badge.classList.remove('visible');
    }
  },

  setActiveNav(page) {
    document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));
    const id = page === 'home' ? 'nav-home' : page === 'cart' ? 'nav-cart' : page === 'orders' ? 'nav-orders' : null;
    if (id) document.getElementById(id)?.classList.add('active');
  }
};
