import express from 'express';
import Review from '../models/Review.js';
import Booking from '../models/Booking.js';
import Service from '../models/Service.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// @route   POST /api/reviews
// @desc    Submit a review for a completed booking
// @access  Private (eligible customer with completed booking)
router.post('/', protect, async (req, res) => {
  try {
    const { bookingId, rating, comment } = req.body;

    if (!bookingId || !rating || !comment) {
      return res.status(400).json({ error: 'Please provide booking ID, rating (1-5), and review comment.' });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({ error: 'Rating must be between 1 and 5.' });
    }

    // 1. Find booking
    const booking = await Booking.findOne({
      $or: [
        { _id: bookingId.match(/^[0-9a-fA-F]{24}$/) ? bookingId : null },
        { bookingId: bookingId },
      ],
    });

    if (!booking) {
      return res.status(404).json({ error: 'Booking not found.' });
    }

    // 2. Eligibility check: Booking must be 'completed'
    if (booking.bookingStatus !== 'completed') {
      return res.status(400).json({
        error: `Only completed bookings can be reviewed. Current status is '${booking.bookingStatus}'.`,
      });
    }

    // 3. Ownership check: Must be the customer who booked it
    if (booking.customer && booking.customer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'You are not authorized to review this booking.' });
    }

    // 4. Duplicate check
    const existingReview = await Review.findOne({ booking: booking._id });
    if (existingReview) {
      return res.status(400).json({ error: 'You have already reviewed this booking.' });
    }

    // 5. Create review
    const review = await Review.create({
      customer: req.user._id,
      customerName: req.user.fullName,
      customerLocation: req.user.city || 'Chicago, IL',
      customerImage: req.user.profileImage || '',
      service: booking.service || null,
      serviceTitle: booking.serviceTitle,
      booking: booking._id,
      rating: Number(rating),
      comment: comment.trim(),
    });

    // 6. Recalculate average rating for service if service exists
    if (booking.service) {
      const allServiceReviews = await Review.find({ service: booking.service });
      const avgRating =
        allServiceReviews.reduce((sum, r) => sum + r.rating, 0) / allServiceReviews.length;
      await Service.findByIdAndUpdate(booking.service, {
        rating: Number(avgRating.toFixed(2)),
        reviewsCount: allServiceReviews.length,
      });
    }

    res.status(201).json({
      success: true,
      message: 'Thank you for your feedback! Review published successfully.',
      review,
    });
  } catch (error) {
    console.error('[Review Submit Error]:', error);
    res.status(500).json({ error: error.message || 'Failed to submit review.' });
  }
});

// @route   GET /api/reviews/service/:serviceId
// @desc    Get all reviews for a service
// @access  Public
router.get('/service/:serviceId', async (req, res) => {
  try {
    const { serviceId } = req.params;
    const filter = serviceId.match(/^[0-9a-fA-F]{24}$/)
      ? { service: serviceId }
      : { serviceTitle: new RegExp(serviceId.replace('-', ' '), 'i') };

    const reviews = await Review.find(filter).sort({ createdAt: -1 });
    res.json({ success: true, count: reviews.length, reviews });
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve reviews.' });
  }
});

// @route   GET /api/reviews/my-reviews
// @desc    Get reviews submitted by logged in customer
// @access  Private
router.get('/my-reviews', protect, async (req, res) => {
  try {
    const reviews = await Review.find({ customer: req.user._id }).sort({ createdAt: -1 });
    res.json({ success: true, count: reviews.length, reviews });
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve your reviews.' });
  }
});

export default router;
