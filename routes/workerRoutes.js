import express from 'express';
import Booking from '../models/Booking.js';
import User from '../models/User.js';
import Review from '../models/Review.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

// Apply worker authorization to all worker routes
router.use(protect, authorize('worker', 'admin'));

// @route   GET /api/worker/profile
// @desc    Get authenticated worker profile
router.get('/profile', async (req, res) => {
  try {
    const worker = await User.findById(req.user._id).select('-password');
    if (!worker) {
      return res.status(404).json({ error: 'Worker account not found' });
    }
    res.json({ success: true, worker });
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve worker profile' });
  }
});

// @route   PATCH /api/worker/profile
// @desc    Update allowed profile fields
router.patch('/profile', async (req, res) => {
  try {
    const { fullName, phone, address, city, skills, serviceArea } = req.body;
    const worker = await User.findById(req.user._id);

    if (!worker) {
      return res.status(404).json({ error: 'Worker account not found' });
    }

    if (fullName) worker.fullName = fullName.trim();
    if (phone !== undefined) worker.phone = phone.trim();
    if (address !== undefined) worker.address = address.trim();
    if (city !== undefined) worker.city = city.trim();
    if (serviceArea !== undefined) worker.serviceArea = serviceArea.trim();
    if (Array.isArray(skills)) worker.skills = skills;

    await worker.save();

    const sanitized = await User.findById(worker._id).select('-password');
    res.json({ success: true, message: 'Profile updated successfully', worker: sanitized });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// @route   PATCH /api/worker/availability
// @desc    Toggle or set worker availability
router.patch('/availability', async (req, res) => {
  try {
    const worker = await User.findById(req.user._id);
    if (!worker) {
      return res.status(404).json({ error: 'Worker account not found' });
    }

    if (req.body.isAvailable !== undefined) {
      worker.isAvailable = Boolean(req.body.isAvailable);
    } else {
      worker.isAvailable = !worker.isAvailable;
    }

    await worker.save();
    res.json({
      success: true,
      message: `Status updated to ${worker.isAvailable ? 'Available' : 'Unavailable'}`,
      isAvailable: worker.isAvailable,
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update availability status' });
  }
});

// @route   GET /api/worker/jobs/stats
// @desc    Fetch accurate real-time stats for the authenticated worker
router.get('/jobs/stats', async (req, res) => {
  try {
    const workerId = req.user._id;

    // 1. Pending: open requests not yet assigned and not rejected by this worker
    const pendingCount = await Booking.countDocuments({
      assignedWorker: null,
      bookingStatus: { $in: ['confirmed', 'pending'] },
      'rejections.worker': { $ne: workerId },
    });

    // 2. Accepted (Assigned to this worker, ready to be started)
    const acceptedCount = await Booking.countDocuments({
      assignedWorker: workerId,
      bookingStatus: 'assigned',
    });

    // 3. In Progress
    const inProgressCount = await Booking.countDocuments({
      assignedWorker: workerId,
      bookingStatus: 'in-progress',
    });

    // 4. Completed
    const completedCount = await Booking.countDocuments({
      assignedWorker: workerId,
      bookingStatus: 'completed',
    });

    // 5. Rejected by this worker
    const rejectedCount = await Booking.countDocuments({
      'rejections.worker': workerId,
    });

    // 6. Cancelled jobs assigned to this worker
    const cancelledCount = await Booking.countDocuments({
      assignedWorker: workerId,
      bookingStatus: 'cancelled',
    });

    // Total jobs visible to this worker (pending pool + worker's own jobs + rejections)
    const totalVisible = pendingCount + acceptedCount + inProgressCount + completedCount + rejectedCount + cancelledCount;

    res.json({
      success: true,
      stats: {
        total: totalVisible,
        pending: pendingCount,
        accepted: acceptedCount,
        inProgress: inProgressCount,
        completed: completedCount,
        rejected: rejectedCount,
        cancelled: cancelledCount,
      },
    });
  } catch (error) {
    console.error('[Worker Stats Error]:', error);
    res.status(500).json({ error: 'Failed to calculate job statistics' });
  }
});

// @route   GET /api/worker/jobs
// @desc    Get jobs visible to worker with full filtering, sorting, tab navigation & search
router.get('/jobs', async (req, res) => {
  try {
    const workerId = req.user._id;
    const {
      filter,
      tab = filter || 'all',
      search = '',
      category = '',
      timeframe = 'all', // all | upcoming | past | today
      sort = 'newest',   // newest | upcoming | oldest | recent_completed
      page = 1,
      limit = 50,
    } = req.query;

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const pageLimit = Math.max(1, Math.min(100, parseInt(limit, 10) || 50));

    let queryConditions = [];

    // Tab-based status conditions
    if (tab === 'pending' || tab === 'requests') {
      queryConditions.push({
        assignedWorker: null,
        bookingStatus: { $in: ['confirmed', 'pending'] },
        'rejections.worker': { $ne: workerId },
      });
    } else if (tab === 'accepted' || tab === 'assigned') {
      queryConditions.push({
        assignedWorker: workerId,
        bookingStatus: 'assigned',
      });
    } else if (tab === 'in-progress') {
      queryConditions.push({
        assignedWorker: workerId,
        bookingStatus: 'in-progress',
      });
    } else if (tab === 'completed') {
      queryConditions.push({
        assignedWorker: workerId,
        bookingStatus: 'completed',
      });
    } else if (tab === 'rejected') {
      queryConditions.push({
        'rejections.worker': workerId,
      });
    } else if (tab === 'cancelled') {
      queryConditions.push({
        assignedWorker: workerId,
        bookingStatus: 'cancelled',
      });
    } else {
      // 'all' tab: jobs assigned to worker, pending open pool, or rejected by worker
      queryConditions.push({
        $or: [
          { assignedWorker: workerId },
          {
            assignedWorker: null,
            bookingStatus: { $in: ['confirmed', 'pending'] },
            'rejections.worker': { $ne: workerId },
          },
          { 'rejections.worker': workerId },
        ],
      });
    }

    // Search query filter (bookingId, serviceTitle, customer name, city)
    if (search && search.trim()) {
      const q = search.trim();
      const searchRegex = new RegExp(q, 'i');
      queryConditions.push({
        $or: [
          { bookingId: searchRegex },
          { serviceTitle: searchRegex },
          { 'customerInfo.name': searchRegex },
          { 'customerInfo.city': searchRegex },
          { 'customerInfo.address': searchRegex },
        ],
      });
    }

    // Timeframe filter (based on bookingDate string YYYY-MM-DD)
    const todayStr = new Date().toISOString().split('T')[0];
    if (timeframe === 'today') {
      queryConditions.push({ bookingDate: todayStr });
    } else if (timeframe === 'upcoming') {
      queryConditions.push({
        bookingDate: { $gte: todayStr },
        bookingStatus: { $nin: ['completed', 'cancelled'] },
      });
    } else if (timeframe === 'past') {
      queryConditions.push({
        $or: [
          { bookingDate: { $lt: todayStr } },
          { bookingStatus: { $in: ['completed', 'cancelled'] } },
        ],
      });
    }

    const finalQuery = queryConditions.length > 1 ? { $and: queryConditions } : queryConditions[0] || {};

    // Sort definition
    let sortObj = { createdAt: -1 };
    if (sort === 'upcoming') {
      sortObj = { bookingDate: 1, timeSlot: 1 };
    } else if (sort === 'oldest') {
      sortObj = { createdAt: 1 };
    } else if (sort === 'recent_completed') {
      sortObj = { completedAt: -1, updatedAt: -1 };
    } else {
      // newest
      sortObj = { createdAt: -1 };
    }

    const totalCount = await Booking.countDocuments(finalQuery);
    let bookings = await Booking.find(finalQuery)
      .populate('service', 'name category image duration price numericPrice')
      .sort(sortObj)
      .skip((pageNum - 1) * pageLimit)
      .limit(pageLimit);

    // Filter by service category if requested and category is populated
    if (category && category !== 'all') {
      bookings = bookings.filter((b) => b.service?.category?.toLowerCase() === category.toLowerCase());
    }

    // Attach review info for completed bookings
    const bookingIds = bookings.map((b) => b._id);
    const reviews = await Review.find({ booking: { $in: bookingIds } }).lean();
    const reviewsMap = {};
    reviews.forEach((r) => {
      reviewsMap[r.booking.toString()] = r;
    });

    const enrichedBookings = bookings.map((b) => {
      const obj = b.toObject();
      if (reviewsMap[b._id.toString()]) {
        obj.review = reviewsMap[b._id.toString()];
      }
      return obj;
    });

    res.json({
      success: true,
      count: enrichedBookings.length,
      totalCount,
      totalPages: Math.ceil(totalCount / pageLimit) || 1,
      currentPage: pageNum,
      bookings: enrichedBookings,
    });
  } catch (error) {
    console.error('[Worker Jobs Error]:', error);
    res.status(500).json({ error: 'Failed to fetch jobs' });
  }
});

// @route   GET /api/worker/schedule
// @desc    Get organized worker schedule with Day, Week, Month breakdown and conflict awareness
router.get('/schedule', async (req, res) => {
  try {
    const workerId = req.user._id;

    // Get all jobs assigned to or in-progress/completed by this worker
    const allAssigned = await Booking.find({
      assignedWorker: workerId,
    })
      .populate('service', 'name category image duration price numericPrice')
      .sort({ bookingDate: 1, timeSlot: 1 });

    const todayStr = new Date().toISOString().split('T')[0];

    // Compute tomorrow's date string YYYY-MM-DD
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split('T')[0];

    // Split into categories
    const todayJobs = allAssigned.filter((b) => b.bookingDate === todayStr);
    const tomorrowJobs = allAssigned.filter((b) => b.bookingDate === tomorrowStr);
    const upcomingJobs = allAssigned.filter(
      (b) => b.bookingDate >= todayStr && ['assigned', 'in-progress'].includes(b.bookingStatus)
    );
    const pastJobs = allAssigned.filter(
      (b) => b.bookingDate < todayStr || b.bookingStatus === 'completed'
    );

    // Attach reviews for completed jobs
    const pastIds = pastJobs.map((b) => b._id);
    const reviews = await Review.find({ booking: { $in: pastIds } }).lean();
    const reviewsMap = {};
    reviews.forEach((r) => {
      reviewsMap[r.booking.toString()] = r;
    });

    const enrichedPastJobs = pastJobs.map((b) => {
      const obj = b.toObject();
      if (reviewsMap[b._id.toString()]) {
        obj.review = reviewsMap[b._id.toString()];
      }
      return obj;
    });

    res.json({
      success: true,
      schedule: {
        allScheduled: allAssigned,
        today: todayJobs,
        tomorrow: tomorrowJobs,
        upcoming: upcomingJobs,
        past: enrichedPastJobs,
      },
    });
  } catch (error) {
    console.error('[Worker Schedule Error]:', error);
    res.status(500).json({ error: 'Failed to load schedule data' });
  }
});

// @route   GET /api/worker/reviews
// @desc    Get all authenticated worker reviews and calculated rating stats
router.get('/reviews', async (req, res) => {
  try {
    const workerId = req.user._id;

    // Find all bookings completed by this worker
    const workerBookings = await Booking.find({ assignedWorker: workerId }).select('_id');
    const bookingIds = workerBookings.map((b) => b._id);

    // Fetch actual reviews for these bookings
    const reviews = await Review.find({ booking: { $in: bookingIds } })
      .populate('service', 'name category image')
      .sort({ createdAt: -1 })
      .lean();

    const totalReviews = reviews.length;
    let averageRating = 0;
    const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };

    if (totalReviews > 0) {
      const sum = reviews.reduce((acc, r) => {
        const rounded = Math.round(r.rating);
        if (distribution[rounded] !== undefined) {
          distribution[rounded] += 1;
        }
        return acc + r.rating;
      }, 0);
      averageRating = Number((sum / totalReviews).toFixed(1));
    }

    res.json({
      success: true,
      stats: {
        totalReviews,
        averageRating,
        distribution,
      },
      reviews,
    });
  } catch (error) {
    console.error('[Worker Reviews Error]:', error);
    res.status(500).json({ error: 'Failed to fetch customer reviews' });
  }
});

// @route   GET /api/worker/jobs/:id
// @desc    Get authorized job details with review & conflict check
router.get('/jobs/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const isMongoId = id.match(/^[0-9a-fA-F]{24}$/);

    const booking = await Booking.findOne({
      $or: [{ _id: isMongoId ? id : null }, { bookingId: id }],
    }).populate('service');

    if (!booking) {
      return res.status(404).json({ error: 'Job not found' });
    }

    const workerId = req.user._id.toString();
    const isAssignedToMe = booking.assignedWorker && booking.assignedWorker.toString() === workerId;
    const isUnassigned = !booking.assignedWorker;
    const hasRejected = booking.rejections?.some((r) => r.worker?.toString() === workerId);

    if (!isAssignedToMe && !isUnassigned && !hasRejected && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'You are not authorized to view this job' });
    }

    // Fetch review if exists
    const review = await Review.findOne({ booking: booking._id }).lean();

    // Check if worker has a schedule conflict with this job
    let hasConflict = false;
    let conflictDetails = null;
    if (isUnassigned && booking.bookingDate && booking.timeSlot) {
      const conflict = await Booking.findOne({
        _id: { $ne: booking._id },
        assignedWorker: req.user._id,
        bookingDate: booking.bookingDate,
        timeSlot: booking.timeSlot,
        bookingStatus: { $in: ['assigned', 'in-progress'] },
      });
      if (conflict) {
        hasConflict = true;
        conflictDetails = {
          bookingId: conflict.bookingId,
          serviceTitle: conflict.serviceTitle,
          bookingDate: conflict.bookingDate,
          timeSlot: conflict.timeSlot,
        };
      }
    }

    const bookingObj = booking.toObject();
    if (review) bookingObj.review = review;
    bookingObj.scheduleConflict = conflictDetails;

    res.json({
      success: true,
      booking: bookingObj,
      isAssignedToMe,
      isUnassigned,
      hasConflict,
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve job details' });
  }
});

// @route   POST /api/worker/jobs/:id/accept
// @desc    Accept an open job request with schedule conflict check & atomic lock
router.post('/jobs/:id/accept', async (req, res) => {
  try {
    const { id } = req.params;
    const isMongoId = id.match(/^[0-9a-fA-F]{24}$/);

    // 1. Locate the candidate booking first
    const candidate = await Booking.findOne({
      $or: [{ _id: isMongoId ? id : null }, { bookingId: id }],
    });

    if (!candidate) {
      return res.status(404).json({ error: 'Job not found' });
    }

    // 2. Server-side schedule conflict check:
    // Does the worker already have an accepted or in-progress booking for the same date and time?
    if (candidate.bookingDate && candidate.timeSlot) {
      const conflict = await Booking.findOne({
        _id: { $ne: candidate._id },
        assignedWorker: req.user._id,
        bookingDate: candidate.bookingDate,
        timeSlot: candidate.timeSlot,
        bookingStatus: { $in: ['assigned', 'in-progress'] },
      });

      if (conflict) {
        return res.status(409).json({
          error: `Schedule Conflict: You already have job '${conflict.bookingId}' (${conflict.serviceTitle}) scheduled on ${candidate.bookingDate} at ${candidate.timeSlot}. Please resolve your schedule before accepting overlapping bookings.`,
          conflictBooking: {
            bookingId: conflict.bookingId,
            serviceTitle: conflict.serviceTitle,
            bookingDate: conflict.bookingDate,
            timeSlot: conflict.timeSlot,
          },
        });
      }
    }

    // 3. Concurrency-safe atomic claim
    const booking = await Booking.findOneAndUpdate(
      {
        _id: candidate._id,
        assignedWorker: null,
        bookingStatus: { $in: ['confirmed', 'pending'] },
      },
      {
        assignedWorker: req.user._id,
        bookingStatus: 'assigned',
      },
      { new: true }
    ).populate('service');

    if (!booking) {
      return res.status(400).json({
        error: 'This job is no longer available or was just accepted by another specialist.',
      });
    }

    res.json({
      success: true,
      message: 'Job successfully accepted! Added to your schedule.',
      booking,
    });
  } catch (error) {
    console.error('[Worker Accept Job Error]:', error);
    res.status(500).json({ error: 'Failed to accept job' });
  }
});

// @route   POST /api/worker/jobs/:id/reject
// @desc    Reject / release an assigned job or open request with recorded reason
router.post('/jobs/:id/reject', async (req, res) => {
  try {
    const { id } = req.params;
    const { reason = 'Scheduling conflict / personal reason' } = req.body;
    const isMongoId = id.match(/^[0-9a-fA-F]{24}$/);

    const booking = await Booking.findOne({
      $or: [{ _id: isMongoId ? id : null }, { bookingId: id }],
    });

    if (!booking) {
      return res.status(404).json({ error: 'Job not found' });
    }

    if (booking.bookingStatus === 'completed') {
      return res.status(400).json({ error: 'Completed jobs cannot be rejected or released' });
    }

    const workerIdStr = req.user._id.toString();
    const isAssignedToWorker = booking.assignedWorker && booking.assignedWorker.toString() === workerIdStr;

    // Record rejection record in sub-document
    if (!booking.rejections) {
      booking.rejections = [];
    }
    booking.rejections.push({
      worker: req.user._id,
      workerName: req.user.fullName || 'Technician',
      reason: reason.trim(),
      rejectedAt: new Date(),
    });

    // If currently assigned to this worker, release it back to pool
    if (isAssignedToWorker) {
      booking.assignedWorker = null;
      booking.bookingStatus = 'confirmed';
      if (reason) {
        booking.customerInstructions = booking.customerInstructions
          ? `${booking.customerInstructions} [Worker released: ${reason}]`
          : `[Worker released: ${reason}]`;
      }
    }

    await booking.save();

    res.json({
      success: true,
      message: isAssignedToWorker
        ? 'Job released back to the available requests pool.'
        : 'Job request rejected and archived from your pending pool.',
      booking,
    });
  } catch (error) {
    console.error('[Worker Reject Job Error]:', error);
    res.status(500).json({ error: 'Failed to process rejection' });
  }
});

// @route   PATCH /api/worker/jobs/:id/status
// @desc    Update status of an assigned job (start or complete) with real timestamps
router.patch('/jobs/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const isMongoId = id.match(/^[0-9a-fA-F]{24}$/);

    const allowed = ['in-progress', 'completed'];
    if (!allowed.includes(status)) {
      return res.status(400).json({ error: "Permitted worker status updates are 'in-progress' or 'completed'." });
    }

    const booking = await Booking.findOne({
      $or: [{ _id: isMongoId ? id : null }, { bookingId: id }],
      assignedWorker: req.user._id,
    }).populate('service');

    if (!booking) {
      return res.status(404).json({ error: 'Job not found or not assigned to you' });
    }

    // Status transition rules
    if (status === 'in-progress') {
      if (booking.bookingStatus !== 'assigned') {
        return res.status(400).json({
          error: `Cannot start job from '${booking.bookingStatus}' status. Must be in 'assigned' state.`,
        });
      }
      booking.bookingStatus = 'in-progress';
      booking.startedAt = new Date();
    } else if (status === 'completed') {
      if (booking.bookingStatus !== 'in-progress' && booking.bookingStatus !== 'assigned') {
        return res.status(400).json({
          error: `Cannot complete job from '${booking.bookingStatus}' status.`,
        });
      }
      booking.bookingStatus = 'completed';
      booking.paymentStatus = 'paid';
      booking.completedAt = new Date();
    }

    await booking.save();

    res.json({
      success: true,
      message: `Job marked as ${status}`,
      booking,
    });
  } catch (error) {
    console.error('[Worker Status Update Error]:', error);
    res.status(500).json({ error: 'Failed to update job status' });
  }
});

// @route   GET /api/worker/earnings
// @desc    Get real worker earnings summary and job payout history
router.get('/earnings', async (req, res) => {
  try {
    const payoutRate = req.user.payoutRate || 0.75; // 75% default technician payout

    // Fetch all jobs associated with worker
    const allWorkerJobs = await Booking.find({
      assignedWorker: req.user._id,
    })
      .populate('service', 'name category')
      .sort({ updatedAt: -1 });

    const completedJobs = allWorkerJobs.filter((b) => b.bookingStatus === 'completed');
    const pendingJobs = allWorkerJobs.filter((b) => ['assigned', 'in-progress'].includes(b.bookingStatus));

    // Calculate figures
    const totalGrossRevenue = completedJobs.reduce((sum, b) => sum + (b.priceBreakdown?.total || 0), 0);
    const totalEarnings = Math.round(totalGrossRevenue * payoutRate);
    const platformCommission = totalGrossRevenue - totalEarnings;

    const pendingGross = pendingJobs.reduce((sum, b) => sum + (b.priceBreakdown?.total || 0), 0);
    const pendingPayout = Math.round(pendingGross * payoutRate);

    // Build itemized earnings history
    const history = completedJobs.map((b) => {
      const gross = b.priceBreakdown?.total || 0;
      const workerCut = Math.round(gross * payoutRate);
      const commission = gross - workerCut;
      return {
        bookingId: b.bookingId,
        serviceTitle: b.serviceTitle,
        customerName: b.customerInfo?.name || 'Customer',
        date: b.bookingDate,
        grossAmount: gross,
        workerPayout: workerCut,
        platformFee: commission,
        status: 'paid',
        paymentMethod: b.paymentMethod,
        completedAt: b.completedAt || b.updatedAt,
      };
    });

    res.json({
      success: true,
      earnings: {
        totalEarnings,
        totalCompletedJobs: completedJobs.length,
        totalGrossRevenue,
        platformCommission,
        pendingPayout,
        activeJobsCount: pendingJobs.length,
        payoutRate: `${payoutRate * 100}%`,
        history,
      },
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to calculate earnings data' });
  }
});

export default router;
