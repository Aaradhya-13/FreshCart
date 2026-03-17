const express = require('express');
const router = express.Router();
const path = require('path');
const products = require(path.join(__dirname, '..', 'data', 'products.json'));

// GET /api/products — list all, optional ?category= and ?search=
router.get('/', (req, res) => {
  let result = [...products];

  if (req.query.category && req.query.category !== 'All') {
    result = result.filter(p => p.category === req.query.category);
  }

  if (req.query.search) {
    const search = req.query.search.toLowerCase();
    result = result.filter(p =>
      p.name.toLowerCase().includes(search) ||
      p.description.toLowerCase().includes(search)
    );
  }

  res.json({ success: true, data: result, count: result.length });
});

// GET /api/products/categories — list unique categories
router.get('/categories', (req, res) => {
  const categories = [...new Set(products.map(p => p.category))];
  res.json({ success: true, data: categories });
});

// GET /api/products/:id — single product
router.get('/:id', (req, res) => {
  const product = products.find(p => p.id === req.params.id);
  if (!product) {
    return res.status(404).json({ success: false, error: 'Product not found' });
  }
  res.json({ success: true, data: product });
});

module.exports = router;
