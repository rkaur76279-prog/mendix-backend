/**
 * Lightweight, in-memory sliding window rate limiter
 * Protects login, OTP verification, and OTP resend endpoints from brute-force & spamming.
 */

class MemoryRateLimiter {
  constructor(windowMs = 15 * 60 * 1000, maxRequests = 10, message = 'Too many requests. Please try again later.') {
    this.windowMs = windowMs;
    this.maxRequests = maxRequests;
    this.message = message;
    this.hits = new Map();

    // Clean up expired keys every 5 minutes
    setInterval(() => this.cleanup(), 5 * 60 * 1000).unref();
  }

  cleanup() {
    const now = Date.now();
    for (const [key, record] of this.hits.entries()) {
      if (now - record.startTime > this.windowMs) {
        this.hits.delete(key);
      }
    }
  }

  middleware() {
    return (req, res, next) => {
      const ip = req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown';
      const identifier = `${ip}:${req.path}`;
      const now = Date.now();

      let record = this.hits.get(identifier);
      if (!record || now - record.startTime > this.windowMs) {
        record = {
          count: 1,
          startTime: now,
        };
        this.hits.set(identifier, record);
        return next();
      }

      record.count += 1;
      if (record.count > this.maxRequests) {
        const retryAfterSeconds = Math.ceil((record.startTime + this.windowMs - now) / 1000);
        res.setHeader('Retry-After', retryAfterSeconds);
        return res.status(429).json({
          error: this.message,
          retryAfterSeconds,
        });
      }

      return next();
    };
  }
}

// 1. Login rate limiter: Max 12 login attempts per 15 minutes per IP
export const loginRateLimiter = new MemoryRateLimiter(
  15 * 60 * 1000,
  12,
  'Too many login attempts from this network. Please try again in 15 minutes.'
).middleware();

// 2. OTP verification rate limiter: Max 15 verification submissions per 10 minutes per IP
export const verifyOtpRateLimiter = new MemoryRateLimiter(
  10 * 60 * 1000,
  15,
  'Too many OTP verification attempts. Please wait a few minutes before trying again.'
).middleware();

// 3. OTP resend rate limiter: Max 5 resend requests per 10 minutes per IP
export const resendOtpRateLimiter = new MemoryRateLimiter(
  10 * 60 * 1000,
  5,
  'Too many resend requests. Please wait before requesting another code.'
).middleware();

