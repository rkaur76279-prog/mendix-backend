import crypto from 'crypto';

/**
 * Generates a cryptographically secure 6-digit numeric OTP.
 * Uses crypto.randomInt to avoid any predictable pseudorandom patterns.
 */
export const generateSecureOtp = () => {
  return crypto.randomInt(100000, 1000000).toString();
};

/**
 * Creates a secure HMAC-SHA256 hash of the OTP combined with a random salt.
 * Ensures plaintext OTPs are never stored in the database.
 */
export const hashOtp = (otp, salt) => {
  const secret = process.env.OTP_SECRET || process.env.JWT_SECRET || 'mendx_secure_otp_hmac_secret_key_2026';
  return crypto
    .createHmac('sha256', secret)
    .update(`${otp}:${salt}`)
    .digest('hex');
};

/**
 * Securely verifies an OTP against its stored hash using timingSafeEqual
 * to prevent timing side-channel attacks.
 */
export const verifyOtpHash = (enteredOtp, storedHash, salt) => {
  if (!enteredOtp || !storedHash || !salt) return false;
  const normalizedOtp = String(enteredOtp).trim();
  const computedHash = hashOtp(normalizedOtp, salt);

  const computedBuf = Buffer.from(computedHash, 'hex');
  const storedBuf = Buffer.from(storedHash, 'hex');

  if (computedBuf.length !== storedBuf.length) {
    return false;
  }

  return crypto.timingSafeEqual(computedBuf, storedBuf);
};

/**
 * Masks an email address for safe display in UI/API responses.
 * Example: 'priya.sharma@example.com' -> 'pr**********@example.com'
 */
export const maskEmail = (email) => {
  if (!email || typeof email !== 'string' || !email.includes('@')) {
    return '***@***.***';
  }

  const [localPart, domain] = email.trim().toLowerCase().split('@');
  if (localPart.length <= 2) {
    return `${localPart[0]}*@${domain}`;
  }

  const prefix = localPart.slice(0, 2);
  const asterisks = '*'.repeat(Math.min(localPart.length - 2, 6));
  return `${prefix}${asterisks}@${domain}`;
};

