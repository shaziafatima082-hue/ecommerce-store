const express = require('express');
const Product = require('../models/Product');
const { protect, admin } = require('../middleware/auth');

const router = express.Router();

// GET all products with search, category filter, pagination
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;
    const skip = (page - 1) * limit;
    const keyword = req.query.keyword || '';
    const category = req.query.category || '';

    const filter = {};
    if (keyword) {
      filter.title = { $regex: keyword, $options: 'i' };
    }
    if (category && category !== 'all') {
      filter.category = category;
    }

    const total = await Product.countDocuments(filter);
    const products = await Product.find(filter).skip(skip).limit(limit);

    res.json({
      products,
      page,
      pages: Math.ceil(total / limit),
      total,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET single product
router.get('/:id', async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) return res.status(404).json({ message: 'Product not found' });
  res.json(product);
});

// CREATE product (admin only)
router.post('/', protect, admin, async (req, res) => {
  const { title, description, price, category, image, stock } = req.body;
  const product = await Product.create({ title, description, price, category, image, stock });
  res.status(201).json(product);
});

// UPDATE product (admin only)
router.put('/:id', protect, admin, async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) return res.status(404).json({ message: 'Product not found' });
  const updated = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(updated);
});

// DELETE product (admin only)
router.delete('/:id', protect, admin, async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) return res.status(404).json({ message: 'Product not found' });
  await product.remove();
  res.json({ message: 'Product removed' });
});

module.exports = router;