import express from 'express';
import jwt from 'jsonwebtoken';
import Contact from '../models/Contact.js';
import User from '../models/User.js';

const router = express.Router();

// Simple in-memory rate limiting map: ip -> timestamps[]
const rateLimitMap = new Map();
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000; // 10 minutes
const RATE_LIMIT_MAX_REQUESTS = 6; // Max 6 requests per 10 mins

const rateLimiter = (req, res, next) => {
  const ip = req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown';
  const now = Date.now();
  const timestamps = (rateLimitMap.get(ip) || []).filter((ts) => now - ts < RATE_LIMIT_WINDOW_MS);

  if (timestamps.length >= RATE_LIMIT_MAX_REQUESTS) {
    return res.status(429).json({
      success: false,
      error: 'Too many messages sent from this network. Please wait a few minutes before submitting again.',
    });
  }

  timestamps.push(now);
  rateLimitMap.set(ip, timestamps);
  next();
};

// Optional auth helper: identifies user if valid Bearer token provided, ignores otherwise
const optionalAuth = async (req, res, next) => {
  req.verifiedUserId = null;
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    try {
      const secret = process.env.JWT_SECRET || 'mendx_super_secret_jwt_key_2026_secure_production';
      const decoded = jwt.verify(token, secret);
      if (decoded && decoded.id) {
        const found = await User.findById(decoded.id).select('_id');
        if (found) {
          req.verifiedUserId = found._id;
        }
      }
    } catch {
      // Token invalid or expired, continue as guest
    }
  }
  next();
};

/**
 * @route   POST /api/contact
 * @desc    Submit a contact enquiry / support request
 * @access  Public / Optional Auth
 */
router.post('/', rateLimiter, optionalAuth, async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      inquiryType,
      bookingId,
      subject,
      message,
    } = req.body;

    // Validation
    const errors = [];

    if (!name || typeof name !== 'string' || name.trim().length < 2) {
      errors.push('Full name must be at least 2 characters long.');
    }
    if (!email || typeof email !== 'string' || !/^\S+@\S+\.\S+$/.test(email.trim())) {
      errors.push('Please enter a valid email address.');
    }
    if (!subject || typeof subject !== 'string' || subject.trim().length < 3) {
      errors.push('Subject must be at least 3 characters long.');
    }
    if (!message || typeof message !== 'string' || message.trim().length < 10) {
      errors.push('Message must be at least 10 characters long.');
    }
    if (message && message.trim().length > 3000) {
      errors.push('Message cannot exceed 3,000 characters.');
    }

    const validInquiryTypes = [
      'Booking Support',
      'Service Information',
      'Booking Cancellation',
      'Rescheduling Request',
      'Payment or Refund Issue',
      'Account Support',
      'Feedback and Suggestions',
      'Other',
    ];

    const cleanInquiryType = validInquiryTypes.includes(inquiryType)
      ? inquiryType
      : 'Booking Support';

    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        error: errors[0],
        errors,
      });
    }

    const clientIp = req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress || '';

    // Create record in MongoDB
    const contactDoc = await Contact.create({
      name: name.trim().slice(0, 100),
      email: email.trim().toLowerCase().slice(0, 120),
      phone: phone ? String(phone).trim().slice(0, 25) : '',
      inquiryType: cleanInquiryType,
      bookingId: bookingId ? String(bookingId).trim().slice(0, 50) : '',
      subject: subject.trim().slice(0, 150),
      message: message.trim().slice(0, 3000),
      user: req.verifiedUserId || null,
      status: 'Open',
      ipAddress: String(clientIp).slice(0, 45),
    });

    console.log(`[Contact API] New message logged ID: ${contactDoc._id} from ${contactDoc.email} (${contactDoc.inquiryType})`);

    return res.status(201).json({
      success: true,
      message: 'Thank you for contacting Mendx! Your message has been submitted successfully.',
      ticketId: contactDoc._id,
      inquiryType: contactDoc.inquiryType,
      createdAt: contactDoc.createdAt,
    });
  } catch (error) {
    console.error('[Contact API] Submission error:', error);
    return res.status(500).json({
      success: false,
      error: 'An unexpected error occurred while processing your message. Please try again.',
    });
  }
});

export default router;
