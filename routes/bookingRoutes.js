import express from 'express';
import Booking from '../models/Booking.js';
import Service from '../models/Service.js';
import Coupon from '../models/Coupon.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

import { CATEGORIES_DATA } from './categoryRoutes.js';

// Tier surcharges in INR
const TIER_PRICES = {
  'Standard Certified': 0,
  'Standard': 0,
  'Master Specialist': 149,
  'Master': 149,
  'Elite Craftsman': 299,
  'Elite': 299,
};

// Helper to look up a subservice from category catalog
const findSubServiceInCatalog = (serviceId, serviceTitle) => {
  for (const cat of CATEGORIES_DATA) {
    for (const sub of cat.subcategories || []) {
      for (const s of sub.services || []) {
        if (s.id === serviceId || (serviceTitle && s.name?.toLowerCase() === serviceTitle.toLowerCase())) {
          return s;
        }
      }
    }
  }
  return null;
};

// @route   POST /api/bookings
// @desc    Create a new booking with server-side price & coupon validation
// @access  Public (guests & authenticated users)
router.post('/', async (req, res) => {
  try {
    const {
      serviceId,
      serviceTitle,
      bookingDate,
      timeSlot,
      proTier,
      customerInfo,
      customerInstructions,
      couponCode,
      paymentMethod,
      basePrice: customBasePrice,
    } = req.body;

    if (!customerInfo || !customerInfo.name || !customerInfo.email || !customerInfo.address) {
      return res.status(400).json({ error: 'Please provide customer name, email, and address.' });
    }

    if (!serviceTitle) {
      return res.status(400).json({ error: 'Please specify the service title.' });
    }

    // 1. Determine base price and link service safely without ObjectId cast errors
    let basePrice = 249;
    let foundService = null;
    const isMongoId = Boolean(serviceId && /^[0-9a-fA-F]{24}$/.test(serviceId.toString()));

    if (isMongoId) {
      foundService = await Service.findById(serviceId);
      if (foundService) {
        basePrice = foundService.numericPrice || foundService.price || 249;
      }
    } else {
      // Look up in category catalog for subservices like 'elec-fan-install'
      const catalogItem = findSubServiceInCatalog(serviceId, serviceTitle);
      if (catalogItem) {
        basePrice = catalogItem.price || 249;
      }

      // Check if a parent service exists in MongoDB by name
      const match = await Service.findOne({
        name: { $regex: new RegExp(`^${serviceTitle}$`, 'i') },
      });
      if (match) {
        foundService = match;
        if (!catalogItem) {
          basePrice = match.numericPrice || 249;
        }
      }
    }

    // If client provided a numeric base price and we found none, honor client price
    if (customBasePrice && Number(customBasePrice) > 0) {
      basePrice = Number(customBasePrice);
    }

    // 2. Pro tier surcharge
    const tierSurcharge = TIER_PRICES[proTier] !== undefined ? TIER_PRICES[proTier] : 149;
    const subtotal = basePrice + tierSurcharge;

    // 3. Coupon validation & calculation
    let discount = 0;
    let validCouponCode = '';
    if (couponCode && couponCode.trim()) {
      const codeClean = couponCode.trim().toUpperCase();
      const coupon = await Coupon.findOne({ code: codeClean });
      if (coupon) {
        try {
          discount = coupon.calculateDiscount(subtotal);
          validCouponCode = coupon.code;
          // Increment used count
          coupon.usedCount += 1;
          await coupon.save();
        } catch (couponErr) {
          return res.status(400).json({ error: couponErr.message });
        }
      } else {
        return res.status(400).json({ error: 'Invalid coupon code.' });
      }
    }

    const total = Math.max(0, subtotal - discount);

    // Optional customer link if Authorization token is passed
    let customerUserId = null;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      try {
        const token = req.headers.authorization.split(' ')[1];
        const jwt = await import('jsonwebtoken');
        const secret = process.env.JWT_SECRET || 'mendx_super_secret_jwt_key_2026_secure_production';
        const decoded = jwt.default.verify(token, secret);
        customerUserId = decoded.id;
      } catch (e) {
        // Continue as guest
      }
    }

    const booking = await Booking.create({
      customer: customerUserId,
      customerInfo: {
        name: customerInfo.name.trim(),
        email: customerInfo.email.trim().toLowerCase(),
        phone: customerInfo.phone || '',
        address: customerInfo.address.trim(),
        city: customerInfo.city || 'Chicago, IL',
      },
      service: foundService ? foundService._id : null,
      serviceTitle: serviceTitle.trim(),
      bookingDate: bookingDate || new Date().toISOString().split('T')[0],
      timeSlot: timeSlot || '09:00 AM - 11:00 AM',
      proTier: proTier || 'Master Specialist',
      customerInstructions: customerInstructions || '',
      priceBreakdown: {
        basePrice,
        tierSurcharge,
        discount,
        couponCode: validCouponCode,
        total,
      },
      bookingStatus: 'confirmed',
      paymentStatus: 'pending',
      paymentMethod: paymentMethod || 'online',
    });

    res.status(201).json({
      success: true,
      message: 'Booking confirmed! A certified Mendx technician has been scheduled.',
      booking,
    });
  } catch (error) {
    console.error('[Booking Create Error]:', error);
    res.status(500).json({ error: error.message || 'Failed to create booking.' });
  }
});

// @route   GET /api/bookings/my-bookings
// @desc    Get bookings for logged in user or query by email
// @access  Public / Private
router.get('/my-bookings', async (req, res) => {
  try {
    let filter = {};

    // Check token if present
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      try {
        const token = req.headers.authorization.split(' ')[1];
        const jwt = await import('jsonwebtoken');
        const secret = process.env.JWT_SECRET || 'mendx_super_secret_jwt_key_2026_secure_production';
        const decoded = jwt.default.verify(token, secret);
        filter.$or = [{ customer: decoded.id }, { 'customerInfo.email': req.query.email?.toLowerCase() }];
      } catch (e) {
        // Fall back to query param
      }
    }

    if (!filter.$or) {
      if (!req.query.email) {
        return res.status(400).json({ error: 'Please provide email or login to view bookings.' });
      }
      filter['customerInfo.email'] = req.query.email.trim().toLowerCase();
    }

    const bookings = await Booking.find(filter).sort({ createdAt: -1 });
    res.json({ success: true, count: bookings.length, bookings });
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve bookings.' });
  }
});

// @route   GET /api/bookings/:id
// @desc    Get single booking by ID or reference MDX-XXXXXX
// @access  Public / Protected
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    let booking;

    if (id.startsWith('MDX-')) {
      booking = await Booking.findOne({ bookingId: id }).populate('assignedWorker', 'fullName email phone');
    } else if (id.match(/^[0-9a-fA-F]{24}$/)) {
      booking = await Booking.findById(id).populate('assignedWorker', 'fullName email phone');
    }

    if (!booking) {
      return res.status(404).json({ error: 'Booking not found.' });
    }

    res.json({ success: true, booking });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch booking details.' });
  }
});

// @route   PATCH /api/bookings/:id/cancel
// @desc    Cancel a booking
// @access  Customer / Admin
router.patch('/:id/cancel', async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const booking = await Booking.findOne({
      $or: [{ _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }, { bookingId: id }],
    });

    if (!booking) {
      return res.status(404).json({ error: 'Booking not found.' });
    }

    if (booking.bookingStatus === 'completed') {
      return res.status(400).json({ error: 'Completed bookings cannot be cancelled.' });
    }

    booking.bookingStatus = 'cancelled';
    booking.cancellationReason = reason || 'Cancelled by customer';
    await booking.save();

    res.json({ success: true, message: 'Booking has been cancelled.', booking });
  } catch (error) {
    res.status(500).json({ error: 'Failed to cancel booking.' });
  }
});

// @route   PATCH /api/bookings/:id/reschedule
// @desc    Reschedule a booking (update date and time slot)
// @access  Customer / Admin
router.patch('/:id/reschedule', async (req, res) => {
  try {
    const { id } = req.params;
    const { bookingDate, timeSlot } = req.body;

    if (!bookingDate || !timeSlot) {
      return res.status(400).json({ error: 'Please provide new booking date and time slot.' });
    }

    const booking = await Booking.findOne({
      $or: [{ _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }, { bookingId: id }],
    });

    if (!booking) {
      return res.status(404).json({ error: 'Booking not found.' });
    }

    if (booking.bookingStatus === 'cancelled' || booking.bookingStatus === 'completed') {
      return res.status(400).json({ error: `Cannot reschedule a ${booking.bookingStatus} booking.` });
    }

    booking.bookingDate = bookingDate;
    booking.timeSlot = timeSlot;
    // When rescheduled, status can be confirmed
    if (booking.bookingStatus === 'pending') {
      booking.bookingStatus = 'confirmed';
    }
    await booking.save();

    res.json({ success: true, message: 'Booking has been rescheduled successfully.', booking });
  } catch (error) {
    res.status(500).json({ error: 'Failed to reschedule booking.' });
  }
});

// @route   PATCH /api/bookings/:id/status
// @desc    Update booking status or assign worker
// @access  Worker / Admin
router.patch('/:id/status', protect, authorize('worker', 'admin'), async (req, res) => {
  try {
    const { status, assignedWorkerId } = req.body;
    const allowed = ['pending', 'confirmed', 'assigned', 'in-progress', 'completed', 'cancelled'];

    if (status && !allowed.includes(status)) {
      return res.status(400).json({ error: 'Invalid booking status.' });
    }

    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ error: 'Booking not found.' });
    }

    if (status) booking.bookingStatus = status;
    if (assignedWorkerId) booking.assignedWorker = assignedWorkerId;

    if (status === 'completed') {
      booking.paymentStatus = 'paid';
    }

    await booking.save();
    res.json({ success: true, message: 'Status updated successfully.', booking });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update booking status.' });
  }
});

// @route   GET /api/bookings
// @desc    List all bookings (for Admin / Worker dashboard)
// @access  Admin / Worker
router.get('/', protect, authorize('admin', 'worker'), async (req, res) => {
  try {
    let filter = {};
    if (req.user.role === 'worker') {
      // Workers see assigned jobs or unassigned jobs ready to accept
      filter = {
        $or: [{ assignedWorker: req.user._id }, { assignedWorker: null }],
      };
    }

    const bookings = await Booking.find(filter)
      .populate('assignedWorker', 'fullName email phone')
      .sort({ createdAt: -1 });

    const totalRevenue = bookings
      .filter((b) => b.bookingStatus !== 'cancelled')
      .reduce((sum, b) => sum + (b.priceBreakdown?.total || 0), 0);

    res.json({
      success: true,
      count: bookings.length,
      totalRevenue,
      bookings,
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve bookings list.' });
  }
});

export default router;
