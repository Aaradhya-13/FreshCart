const express = require('express');
const router = express.Router();
const Cart = require('../models/cart');
const path = require('path');
const products = require(path.join(__dirname, '..', 'data', 'products.json'));

// Helper: enrich cart items with product details
function enrichCart(cartItems) {
  return cartItems.map(item => {
    const product = products.find(p => p.id === item.productId);
    return {
      ...item,
      product: product || null
    };
  }).filter(item => item.product !== null);
}

function getCartTotal(enrichedItems) {
  return parseFloat(
    enrichedItems.reduce((sum, item) => sum + (item.product.price * item.quantity), 0).toFixed(2)
  );
}

// GET /api/cart
router.get('/', (req, res) => {
  const items = enrichCart(Cart.getAll());
  res.json({
    success: true,
    data: {
      items,
      itemCount: Cart.getItemCount(),
      total: getCartTotal(items)
    }
  });
});

// POST /api/cart — add item { productId, quantity }
router.post('/', (req, res) => {
  const { productId, quantity } = req.body;

  if (!productId) {
    return res.status(400).json({ success: false, error: 'productId is required' });
  }

  const product = products.find(p => p.id === productId);
  if (!product) {
    return res.status(404).json({ success: false, error: 'Product not found' });
  }

  Cart.addItem(productId, quantity || 1);
  const items = enrichCart(Cart.getAll());

  res.json({
    success: true,
    data: {
      items,
      itemCount: Cart.getItemCount(),
      total: getCartTotal(items)
    }
  });
});

// PUT /api/cart/:productId — update quantity { quantity }
router.put('/:productId', (req, res) => {
  const { quantity } = req.body;

  if (quantity === undefined) {
    return res.status(400).json({ success: false, error: 'quantity is required' });
  }

  const result = Cart.updateItem(req.params.productId, quantity);
  if (result === null) {
    return res.status(404).json({ success: false, error: 'Item not in cart' });
  }

  const items = enrichCart(Cart.getAll());
  res.json({
    success: true,
    data: {
      items,
      itemCount: Cart.getItemCount(),
      total: getCartTotal(items)
    }
  });
});

// DELETE /api/cart/:productId — remove single item
router.delete('/:productId', (req, res) => {
  Cart.removeItem(req.params.productId);
  const items = enrichCart(Cart.getAll());
  res.json({
    success: true,
    data: {
      items,
      itemCount: Cart.getItemCount(),
      total: getCartTotal(items)
    }
  });
});

// DELETE /api/cart — clear entire cart
router.delete('/', (req, res) => {
  Cart.clear();
  res.json({
    success: true,
    data: { items: [], itemCount: 0, total: 0 }
  });
});

module.exports = router;
