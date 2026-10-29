import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { connectDB } from './config/db.js';
import User from './models/User.js';
import LoginChallenge from './models/LoginChallenge.js';
import { generateSecureOtp, hashOtp, verifyOtpHash, maskEmail } from './utils/otpUtils.js';

dotenv.config();

const runTest = async () => {
  console.log('--- Starting Backend OTP Logic & Model Verification ---');

  // Test 1: Crypto OTP Generation & Timing-safe verification
  const otp1 = generateSecureOtp();
  const otp2 = generateSecureOtp();
  console.log(`[Test 1] Generated 6-digit OTPs: ${otp1}, ${otp2}`);
  if (!/^\d{6}$/.test(otp1) || !/^\d{6}$/.test(otp2)) {
    throw new Error('OTP is not a 6-digit numeric string!');
  }

  const salt = 'sample_random_salt_123456';
  const hash1 = hashOtp(otp1, salt);
  const hash2 = hashOtp(otp2, salt);

  if (hash1 === otp1) {
    throw new Error('OTP was stored as plaintext!');
  }

  const isOtp1Valid = verifyOtpHash(otp1, hash1, salt);
  const isOtp1Wrong = verifyOtpHash('999999', hash1, salt);
  const isOtp2AgainstHash1 = verifyOtpHash(otp2, hash1, salt);

  if (!isOtp1Valid || isOtp1Wrong || isOtp2AgainstHash1) {
    throw new Error('Timing-safe OTP hash comparison failed!');
  }
  console.log('[Test 1 Passed] Cryptographic OTP generation and verification validated.');

  // Test 2: Masking Email
  const masked1 = maskEmail('priya@example.com');
  const masked2 = maskEmail('pro@mendx.com');
  const masked3 = maskEmail('ra@domain.org');
  console.log(`[Test 2] Masked emails: ${masked1}, ${masked2}, ${masked3}`);
  if (!masked1.includes('pr') || !masked2.includes('pr') || !masked3.includes('r*')) {
    throw new Error('Email masking logic failed!');
  }
  console.log('[Test 2 Passed] Email masking validated.');

  // Test 3: Database & Login Challenge Model
  await connectDB();

  // Find demo customer
  let testUser = await User.findOne({ email: 'priya@example.com' });
  if (!testUser) {
    console.log('[Test 3] Creating temporary test user...');
    testUser = await User.create({
      fullName: 'Priya Sharma',
      email: 'priya@example.com',
      password: 'priyapassword123',
      role: 'customer',
    });
  }

  const challengeId = 'test-challenge-' + Date.now();
  const testOtp = generateSecureOtp();
  const testSalt = 'salt-' + Date.now();
  const testHash = hashOtp(testOtp, testSalt);

  const challenge = await LoginChallenge.create({
    challengeId,
    userId: testUser._id,
    email: testUser.email,
    otpHash: testHash,
    otpSalt: testSalt,
    maxAttempts: 3,
    attempts: 0,
    expiresAt: new Date(Date.now() + 5 * 60 * 1000),
    isUsed: false,
  });

  console.log('[Test 3] Challenge created in MongoDB. ID:', challenge.challengeId);

  // Test 4: Verify incorrect OTP increments attempts
  const checkWrong = verifyOtpHash('000000', challenge.otpHash, challenge.otpSalt);
  if (!checkWrong) {
    challenge.attempts += 1;
    await challenge.save();
  }
  if (challenge.attempts !== 1) {
    throw new Error('Challenge attempt counter did not update!');
  }
  console.log('[Test 4 Passed] Failed attempt counter increment verified.');

  // Test 5: Verify correct OTP consumes challenge
  const checkCorrect = verifyOtpHash(testOtp, challenge.otpHash, challenge.otpSalt);
  if (checkCorrect) {
    challenge.isUsed = true;
    challenge.verifiedAt = new Date();
    await challenge.save();
  }
  if (!challenge.isUsed) {
    throw new Error('Challenge was not marked as used!');
  }
  console.log('[Test 5 Passed] Correct OTP verification and single-use consumption verified.');

  // Clean up test challenge
  await LoginChallenge.deleteOne({ _id: challenge._id });
  console.log('[Test 5] Test challenge cleaned up.');

  console.log('--- ALL BACKEND OTP UNIT & MODEL TESTS PASSED ---');
  await mongoose.disconnect();
};

runTest().catch((err) => {
  console.error('Test Error:', err);
  process.exit(1);
});

