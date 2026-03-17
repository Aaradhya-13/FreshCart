const express = require('express');
const router = express.Router();
const Orders = require('../models/orders');
const Cart = require('../models/cart');
const path = require('path');
const products = require(path.join(__dirname, '..', 'data', 'products.json'));

// POST /api/orders — place an order from current cart
router.post('/', (req, res) => {
  const cartItems = Cart.getAll();

  if (cartItems.length === 0) {
    return res.status(400).json({ success: false, error: 'Cart is empty' });
  }

  // Build order items with prices
  const orderItems = cartItems.map(item => {
    const product = products.find(p => p.id === item.productId);
    return {
      productId: item.productId,
      name: product ? product.name : 'Unknown',
      image: product ? product.image : '',
      quantity: item.quantity,
      price: product ? product.price : 0,
      subtotal: product ? parseFloat((product.price * item.quantity).toFixed(2)) : 0
    };
  });

  const total = orderItems.reduce((sum, item) => sum + item.subtotal, 0);
  const order = Orders.create(orderItems, total);

  // Clear the cart after placing order
  Cart.clear();

  res.status(201).json({ success: true, data: order });
});

// GET /api/orders
router.get('/', (req, res) => {
  res.json({ success: true, data: Orders.getAll() });
});

// GET /api/orders/:id
router.get('/:id', (req, res) => {
  const order = Orders.getById(req.params.id);
  if (!order) {
    return res.status(404).json({ success: false, error: 'Order not found' });
  }
  res.json({ success: true, data: order });
});

module.exports = router;
