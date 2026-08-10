const express = require('express');
const Order = require('../models/Order');
const Cart = require('../models/Cart');
const { protect, admin } = require('../middleware/auth');

const router = express.Router();

// Create order from cart (mock payment)
router.post('/', protect, async (req, res) => {
  const { address, paymentMethod } = req.body;
  const cart = await Cart.findOne({ user: req.user._id }).populate('items.product');
  if (!cart || cart.items.length === 0) {
    return res.status(400).json({ message: 'Cart is empty' });
  }

  const items = cart.items.map(item => ({
    product: item.product._id,
    title: item.product.title,
    price: item.product.price,
    quantity: item.quantity,
  }));

  const totalAmount = items.reduce((sum, i) => sum + i.price * i.quantity, 0);

  const order = await Order.create({
    user: req.user._id,
    items,
    totalAmount,
    address,
    paymentMethod: paymentMethod || 'mock',
    status: 'pending',
  });

  // Clear cart after order
  cart.items = [];
  await cart.save();

  res.status(201).json(order);
});

// Get user's orders
router.get('/myorders', protect, async (req, res) => {
  const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
  res.json(orders);
});

// Get all orders (admin only)
router.get('/', protect, admin, async (req, res) => {
  const orders = await Order.find().populate('user', 'name email').sort({ createdAt: -1 });
  res.json(orders);
});

// Update order status (admin)
router.put('/:id', protect, admin, async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order) return res.status(404).json({ message: 'Order not found' });
  order.status = req.body.status || order.status;
  await order.save();
  res.json(order);
});

// Dashboard stats (admin)
router.get('/dashboard/stats', protect, admin, async (req, res) => {
  const totalOrders = await Order.countDocuments();
  const totalUsers = await require('../models/User').countDocuments();
  const totalProducts = await require('../models/Product').countDocuments();
  const recentOrders = await Order.find().populate('user', 'name').sort({ createdAt: -1 }).limit(5);
  res.json({ totalOrders, totalUsers, totalProducts, recentOrders });
});

module.exports = router;