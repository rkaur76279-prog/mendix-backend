import express from 'express';
import Coupon from '../models/Coupon.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

// @route   POST /api/coupons/validate
// @desc    Validate coupon code and calculate discount
// @access  Public
router.post('/validate', async (req, res) => {
  try {
    const { code, orderAmount } = req.body;

    if (!code) {
      return res.status(400).json({ error: 'Please enter a coupon code.' });
    }

    const amount = Number(orderAmount) || 0;
    const ALL=await Coupon.find();
    console.log(ALL);
      
    const cleanCode = code.trim().toUpperCase();

    const coupon = await Coupon.findOne({ code: cleanCode });
    if (!coupon) {
      return res.status(404).json({ error: 'Coupon code not found.' });
    }

    try {
      const discount = coupon.calculateDiscount(amount);
      const newTotal = Math.max(0, amount - discount);

      res.json({
        success: true,
        valid: true,
        code: coupon.code,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue,
        discount,
        originalTotal: amount,
        finalTotal: newTotal,
        message: `Coupon '${coupon.code}' applied! You saved $${discount.toFixed(2)}.`,
      });
    } catch (calcError) {
      return res.status(400).json({ valid: false, error: calcError.message });
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to validate coupon.' });
  }
});

// @route   GET /api/coupons
// @desc    List all coupons
// @access  Admin only
router.get('/', protect, authorize('admin'), async (req, res) => {
  try {
    const coupons = await Coupon.find().sort({ createdAt: -1 });
    res.json({ success: true, count: coupons.length, coupons });
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve coupons.' });
  }
});

// @route   POST /api/coupons
// @desc    Create a new coupon
// @access  Admin only
router.post('/', protect, authorize('admin'), async (req, res) => {
  try {
    const { code, discountType, discountValue, minOrderValue, maxDiscount, expirationDate, usageLimit } = req.body;

    if (!code || !discountValue || !expirationDate) {
      return res.status(400).json({ error: 'Please provide code, discount value, and expiration date.' });
    }

    const coupon = await Coupon.create({
      code: code.trim().toUpperCase(),
      discountType: discountType || 'percentage',
      discountValue: Number(discountValue),
      minOrderValue: Number(minOrderValue) || 0,
      maxDiscount: maxDiscount ? Number(maxDiscount) : null,
      expirationDate: new Date(expirationDate),
      usageLimit: Number(usageLimit) || 1000,
    });

    res.status(201).json({ success: true, coupon, message: 'Coupon created successfully.' });
  } catch (error) {
    res.status(400).json({ error: error.message || 'Failed to create coupon.' });
  }
});

// @route   PATCH /api/coupons/:id
// @desc    Toggle coupon active status or edit
// @access  Admin only
router.patch('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const coupon = await Coupon.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!coupon) {
      return res.status(404).json({ error: 'Coupon not found.' });
    }
    res.json({ success: true, coupon, message: 'Coupon updated successfully.' });
  } catch (error) {
    res.status(400).json({ error: error.message || 'Failed to update coupon.' });
  }
});

export default router;
