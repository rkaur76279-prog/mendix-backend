import mongoose from 'mongoose';

const loginChallengeSchema = new mongoose.Schema(
  {
    challengeId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    // Cryptographic hash of the OTP (never plaintext)
    otpHash: {
      type: String,
      required: true,
    },
    // Random per-challenge salt used in HMAC
    otpSalt: {
      type: String,
      required: true,
    },
    attempts: {
      type: Number,
      default: 0,
      min: 0,
    },
    maxAttempts: {
      type: Number,
      default: 5,
    },
    resendCount: {
      type: Number,
      default: 0,
    },
    maxResends: {
      type: Number,
      default: 3,
    },
    lastResendAt: {
      type: Date,
      default: Date.now,
    },
    expiresAt: {
      type: Date,
      required: true,
      index: { expires: 0 }, // MongoDB automatic TTL cleanup after expiration
    },
    isUsed: {
      type: Boolean,
      default: false,
      index: true,
    },
    verifiedAt: {
      type: Date,
    },
    ipAddress: {
      type: String,
      default: '',
    },
    userAgent: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

// Method to verify if challenge is still active
loginChallengeSchema.methods.isValid = function () {
  return !this.isUsed && new Date() < this.expiresAt && this.attempts < this.maxAttempts;
};

const LoginChallenge = mongoose.model('LoginChallenge', loginChallengeSchema);

export default LoginChallenge;

