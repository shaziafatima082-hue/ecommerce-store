const express = require('express');
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Get user's cart
router.get('/', protect, async (req, res) => {
  let cart = await Cart.findOne({ user: req.user._id }).populate('items.product');
  if (!cart) {
    cart = await Cart.create({ user: req.user._id, items: [] });
  }
  res.json(cart);
});

// Add item to cart
router.post('/add', protect, async (req, res) => {
  const { productId, quantity } = req.body;
  if (!productId || quantity < 1) return res.status(400).json({ message: 'Invalid data' });

  let cart = await Cart.findOne({ user: req.user._id });
  if (!cart) {
    cart = await Cart.create({ user: req.user._id, items: [] });
  }

  const existing = cart.items.find(item => item.product.toString() === productId);
  if (existing) {
    existing.quantity += quantity;
  } else {
    cart.items.push({ product: productId, quantity });
  }
  await cart.save();
  await cart.populate('items.product');
  res.json(cart);
});

// Update item quantity
router.put('/update', protect, async (req, res) => {
  const { productId, quantity } = req.body;
  if (!productId || quantity < 0) return res.status(400).json({ message: 'Invalid data' });

  let cart = await Cart.findOne({ user: req.user._id });
  if (!cart) return res.status(404).json({ message: 'Cart not found' });

  const item = cart.items.find(item => item.product.toString() === productId);
  if (!item) return res.status(404).json({ message: 'Item not in cart' });

  if (quantity === 0) {
    cart.items = cart.items.filter(item => item.product.toString() !== productId);
  } else {
    item.quantity = quantity;
  }
  await cart.save();
  await cart.populate('items.product');
  res.json(cart);
});

// Remove item
router.delete('/remove/:productId', protect, async (req, res) => {
  let cart = await Cart.findOne({ user: req.user._id });
  if (!cart) return res.status(404).json({ message: 'Cart not found' });
  cart.items = cart.items.filter(item => item.product.toString() !== req.params.productId);
  await cart.save();
  await cart.populate('items.product');
  res.json(cart);
});

// Clear cart (after order)
router.delete('/clear', protect, async (req, res) => {
  let cart = await Cart.findOne({ user: req.user._id });
  if (cart) {
    cart.items = [];
    await cart.save();
  }
  res.json({ message: 'Cart cleared' });
});

module.exports = router;