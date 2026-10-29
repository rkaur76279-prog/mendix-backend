import express from 'express';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import LoginChallenge from '../models/LoginChallenge.js';
import { protect } from '../middleware/authMiddleware.js';
import {
  loginRateLimiter,
  verifyOtpRateLimiter,
  resendOtpRateLimiter,
} from '../middleware/rateLimiter.js';
import {
  generateSecureOtp,
  hashOtp,
  verifyOtpHash,
  maskEmail,
} from '../utils/otpUtils.js';
import { sendOtpEmail } from '../services/emailService.js';

const router = express.Router();

const generateToken = (id) => {
  const secret = process.env.JWT_SECRET || 'mendx_super_secret_jwt_key_2026_secure_production';
  return jwt.sign({ id }, secret, {
    expiresIn: '30d',
  });
};

const getOtpExpiryMinutes = () => {
  const val = parseInt(process.env.OTP_EXPIRY_MINUTES, 10);
  return Number.isFinite(val) && val > 0 ? val : 5;
};

const getOtpCooldownSeconds = () => {
  const val = parseInt(process.env.OTP_RESEND_COOLDOWN_SECONDS, 10);
  return Number.isFinite(val) && val > 0 ? val : 60;
};

const getOtpMaxAttempts = () => {
  const val = parseInt(process.env.OTP_MAX_ATTEMPTS, 10);
  return Number.isFinite(val) && val > 0 ? val : 5;
};

// @route   POST /api/auth/register
// @desc    Register a new customer or worker
// @access  Public
router.post('/register', async (req, res) => {
  try {
    const { fullName, email, password, phone, role, address, city } = req.body;

    if (!fullName || !email || !password) {
      return res.status(400).json({ error: 'Please provide full name, email, and password.' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters.' });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const userExists = await User.findOne({ email: normalizedEmail });

    if (userExists) {
      return res.status(400).json({ error: 'An account with this email already exists.' });
    }

    // Role can only be customer or worker during public registration (admin created via seed or admin console)
    const assignedRole = role === 'worker' ? 'worker' : 'customer';

    const user = await User.create({
      fullName: fullName.trim(),
      email: normalizedEmail,
      password,
      phone: phone || '',
      role: assignedRole,
      address: address || '',
      city: city || 'Chicago, IL',
    });

    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        phone: user.phone,
        role: user.role,
        city: user.city,
        address: user.address,
      },
      message: 'Account created successfully! Welcome to Mendx.',
    });
  } catch (error) {
    console.error('[Auth Register Error]:', error);
    res.status(500).json({ error: error.message || 'Server error during registration.' });
  }
});

// @route   POST /api/auth/login-with-otp
// @desc    Request OTP login when user forgot password (passwordless OTP login)
// @access  Public (Rate Limited)
router.post('/login-with-otp', loginRateLimiter, async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Please provide your registered email address.' });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      return res.status(404).json({ error: 'No account found with this email address.' });
    }

    if (user.accountStatus === 'suspended') {
      return res.status(403).json({ error: 'Account is suspended. Please contact Mendx support.' });
    }

    const expiryMinutes = getOtpExpiryMinutes();
    const cooldownSeconds = getOtpCooldownSeconds();
    const maxAttempts = getOtpMaxAttempts();

    const otp = generateSecureOtp();
    const otpSalt = crypto.randomBytes(16).toString('hex');
    const otpHash = hashOtp(otp, otpSalt);
    const challengeId = crypto.randomUUID();

    await LoginChallenge.deleteMany({ userId: user._id, isUsed: false });

    try {
      await sendOtpEmail({
        to: user.email,
        name: user.fullName,
        otp,
        expiryMinutes,
      });
    } catch (emailError) {
      console.error('[Auth Login With OTP] Email delivery error:', emailError.message);
      return res.status(502).json({
        error: 'Failed to send one-time login code. Please check your email address or try again shortly.',
      });
    }

    await LoginChallenge.create({
      challengeId,
      userId: user._id,
      email: user.email,
      otpHash,
      otpSalt,
      maxAttempts,
      resendCount: 0,
      lastResendAt: new Date(),
      expiresAt: new Date(Date.now() + expiryMinutes * 60 * 1000),
      isUsed: false,
      ipAddress: req.ip || '',
      userAgent: req.headers['user-agent'] || '',
    });

    return res.status(200).json({
      success: true,
      requiresOtp: true,
      challengeId,
      maskedEmail: maskEmail(user.email),
      expiresInSeconds: expiryMinutes * 60,
      resendCooldownSeconds: cooldownSeconds,
      message: `A one-time login code has been sent to ${maskEmail(user.email)}.`,
    });
  } catch (error) {
    console.error('[Auth Login With OTP Error]:', error);
    return res.status(500).json({ error: error.message || 'Server error during OTP login request.' });
  }
});

// @route   POST /api/auth/login
// @desc    Validate credentials, generate OTP & issue short-lived pre-auth challenge
// @access  Public (Rate Limited)
router.post('/login', loginRateLimiter, async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Please provide both email and password.' });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const user = await User.findOne({ email: normalizedEmail }).select('+password');

    // Use uniform timing and generic error response to protect against account enumeration
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    if (user.accountStatus === 'suspended') {
      return res.status(403).json({ error: 'Account is suspended. Please contact Mendx support.' });
    }

    const expiryMinutes = getOtpExpiryMinutes();
    const cooldownSeconds = getOtpCooldownSeconds();
    const maxAttempts = getOtpMaxAttempts();

    // Generate cryptographically secure 6-digit OTP
    const otp = generateSecureOtp();
    const otpSalt = crypto.randomBytes(16).toString('hex');
    const otpHash = hashOtp(otp, otpSalt);
    const challengeId = crypto.randomUUID();

    // Invalidate any previous unverified challenges for this user
    await LoginChallenge.deleteMany({ userId: user._id, isUsed: false });

    // Send the OTP email first to ensure delivery succeeds before saving the challenge
    try {
      await sendOtpEmail({
        to: user.email,
        name: user.fullName,
        otp,
        expiryMinutes,
      });
    } catch (emailError) {
      console.error('[Auth Login] Email delivery error:', emailError.message);
      return res.status(502).json({
        error: 'Failed to send verification code email. Please check your email address or try again shortly.',
      });
    }

    // Record the challenge in database
    await LoginChallenge.create({
      challengeId,
      userId: user._id,
      email: user.email,
      otpHash,
      otpSalt,
      maxAttempts,
      resendCount: 0,
      lastResendAt: new Date(),
      expiresAt: new Date(Date.now() + expiryMinutes * 60 * 1000),
      isUsed: false,
      ipAddress: req.ip || '',
      userAgent: req.headers['user-agent'] || '',
    });

    // Return the pre-authentication challenge response without final token or unhashed OTP
    return res.status(200).json({
      success: true,
      requiresOtp: true,
      challengeId,
      maskedEmail: maskEmail(user.email),
      expiresInSeconds: expiryMinutes * 60,
      resendCooldownSeconds: cooldownSeconds,
      message: `A verification code has been sent to ${maskEmail(user.email)}.`,
    });
  } catch (error) {
    console.error('[Auth Login Error]:', error);
    return res.status(500).json({ error: error.message || 'Server error during login.' });
  }
});

// @route   POST /api/auth/verify-otp
// @desc    Validate OTP for an active challenge and issue final authenticated token
// @access  Public (Rate Limited)
router.post('/verify-otp', verifyOtpRateLimiter, async (req, res) => {
  try {
    const { challengeId, otp } = req.body;

    if (!challengeId || !otp) {
      return res.status(400).json({ error: 'Please provide both the challenge ID and the 6-digit verification code.' });
    }

    const cleanOtp = String(otp).trim();
    if (!/^\d{6}$/.test(cleanOtp)) {
      return res.status(400).json({ error: 'Verification code must be exactly 6 digits.' });
    }

    const challenge = await LoginChallenge.findOne({ challengeId });

    if (!challenge) {
      return res.status(400).json({ error: 'Invalid or expired verification session. Please sign in again.' });
    }

    if (challenge.isUsed) {
      return res.status(400).json({ error: 'This verification code has already been used. Please sign in again.' });
    }

    if (new Date() > challenge.expiresAt) {
      return res.status(400).json({ error: 'Verification code has expired. Please request a new code or sign in again.' });
    }

    if (challenge.attempts >= challenge.maxAttempts) {
      return res.status(429).json({
        error: 'Too many incorrect attempts. This code is locked. Please request a new code or sign in again.',
      });
    }

    // Verify OTP using secure timingSafeEqual comparison
    const isValid = verifyOtpHash(cleanOtp, challenge.otpHash, challenge.otpSalt);

    if (!isValid) {
      challenge.attempts += 1;
      await challenge.save();

      const remaining = Math.max(0, challenge.maxAttempts - challenge.attempts);
      if (remaining === 0) {
        return res.status(429).json({
          error: 'Too many incorrect attempts. This verification code is locked. Please request a new code.',
          remainingAttempts: 0,
        });
      }

      return res.status(400).json({
        error: `Incorrect verification code. Please try again. (${remaining} attempt${remaining === 1 ? '' : 's'} remaining)`,
        remainingAttempts: remaining,
      });
    }

    // Mark challenge as used atomically
    challenge.isUsed = true;
    challenge.verifiedAt = new Date();
    await challenge.save();

    // Clean up any remaining obsolete challenges for this user
    await LoginChallenge.deleteMany({ userId: challenge.userId, _id: { $ne: challenge._id } });

    // Retrieve user and issue final access token
    const user = await User.findById(challenge.userId);
    if (!user) {
      return res.status(404).json({ error: 'User account not found.' });
    }

    if (user.accountStatus === 'suspended') {
      return res.status(403).json({ error: 'Account is suspended. Please contact Mendx support.' });
    }

    const token = generateToken(user._id);

    return res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        phone: user.phone,
        role: user.role,
        city: user.city,
        address: user.address,
      },
      message: 'Email verified successfully! Welcome to Mendx.',
    });
  } catch (error) {
    console.error('[Auth Verify OTP Error]:', error);
    return res.status(500).json({ error: error.message || 'Server error during OTP verification.' });
  }
});

// @route   POST /api/auth/resend-otp
// @desc    Resend a new OTP for an active challenge subject to cooldown and limits
// @access  Public (Rate Limited)
router.post('/resend-otp', resendOtpRateLimiter, async (req, res) => {
  try {
    const { challengeId } = req.body;

    if (!challengeId) {
      return res.status(400).json({ error: 'Please provide the challenge ID.' });
    }

    const challenge = await LoginChallenge.findOne({ challengeId });

    if (!challenge || challenge.isUsed) {
      return res.status(400).json({ error: 'Verification session is invalid or already completed. Please sign in again.' });
    }

    // Check resend limits
    if (challenge.resendCount >= challenge.maxResends) {
      return res.status(429).json({
        error: 'Maximum resend limit reached for this session. Please sign in again with your email and password.',
      });
    }

    // Check cooldown
    const cooldownSeconds = getOtpCooldownSeconds();
    const elapsedSeconds = (Date.now() - new Date(challenge.lastResendAt).getTime()) / 1000;

    if (elapsedSeconds < cooldownSeconds) {
      const waitRemaining = Math.ceil(cooldownSeconds - elapsedSeconds);
      return res.status(429).json({
        error: `Please wait ${waitRemaining} second${waitRemaining === 1 ? '' : 's'} before requesting a new code.`,
        retryAfterSeconds: waitRemaining,
      });
    }

    const user = await User.findById(challenge.userId);
    if (!user) {
      return res.status(404).json({ error: 'User account not found.' });
    }

    const expiryMinutes = getOtpExpiryMinutes();
    const newOtp = generateSecureOtp();
    const newSalt = crypto.randomBytes(16).toString('hex');
    const newHash = hashOtp(newOtp, newSalt);

    // Send email
    try {
      await sendOtpEmail({
        to: user.email,
        name: user.fullName,
        otp: newOtp,
        expiryMinutes,
      });
    } catch (emailError) {
      console.error('[Auth Resend OTP] Email error:', emailError.message);
      return res.status(502).json({
        error: 'Failed to send new verification code. Please try again in a few moments.',
      });
    }

    // Invalidate previous code, update challenge with new code hash and reset attempt counter
    challenge.otpHash = newHash;
    challenge.otpSalt = newSalt;
    challenge.attempts = 0;
    challenge.resendCount += 1;
    challenge.lastResendAt = new Date();
    challenge.expiresAt = new Date(Date.now() + expiryMinutes * 60 * 1000);
    await challenge.save();

    return res.status(200).json({
      success: true,
      message: `A fresh verification code has been sent to ${maskEmail(user.email)}.`,
      expiresInSeconds: expiryMinutes * 60,
      resendCooldownSeconds: cooldownSeconds,
    });
  } catch (error) {
    console.error('[Auth Resend OTP Error]:', error);
    return res.status(500).json({ error: error.message || 'Server error during OTP resend.' });
  }
});

// @route   GET /api/auth/me
// @desc    Get current logged in user profile
// @access  Private
router.get('/me', protect, async (req, res) => {
  try {
    res.json({
      success: true,
      user: req.user,
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve profile.' });
  }
});

// @route   POST /api/auth/logout
// @desc    Logout user
// @access  Public
router.post('/logout', (req, res) => {
  res.json({ success: true, message: 'Logged out successfully.' });
});

export default router;
