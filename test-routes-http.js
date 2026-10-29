import mongoose from 'mongoose';
import app from './server.js';
import { connectDB } from './config/db.js';
import { seedDatabase } from './config/seed.js';
import LoginChallenge from './models/LoginChallenge.js';
import { hashOtp } from './utils/otpUtils.js';

let server;

const runHttpTest = async () => {
  console.log('--- Starting Auth Routes HTTP Integration Test ---');
  await connectDB();
  await seedDatabase();

  const PORT = 5055;
  server = app.listen(PORT);
  const BASE_URL = `http://localhost:${PORT}/api/auth`;

  // Helper fetch wrapper
  const post = async (endpoint, body, token) => {
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    const res = await fetch(`${BASE_URL}${endpoint}`, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    });
    const data = await res.json().catch(() => ({}));
    return { status: res.status, ok: res.ok, data };
  };

  const get = async (endpoint, token) => {
    const headers = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;
    const res = await fetch(`${BASE_URL}${endpoint}`, {
      method: 'GET',
      headers,
    });
    const data = await res.json().catch(() => ({}));
    return { status: res.status, ok: res.ok, data };
  };

  try {
    // 1. Invalid credentials
    const badLogin = await post('/login', { email: 'priya@example.com', password: 'wrongpassword' });
    console.log('[Step 1] Bad login status:', badLogin.status, badLogin.data);
    if (badLogin.status !== 401 || badLogin.data.token || badLogin.data.challengeId) {
      throw new Error('Bad login did not fail as expected!');
    }
    console.log('[Step 1 Passed] Invalid credentials rejected without issuing challenge or token.');

    // 2. Valid credentials
    const validLogin = await post('/login', { email: 'priya@example.com', password: 'priyapassword123' });
    console.log('[Step 2] Valid login response:', validLogin.status, validLogin.data);
    if (validLogin.status !== 200 || !validLogin.data.requiresOtp || !validLogin.data.challengeId) {
      throw new Error('Valid login did not return OTP challenge!');
    }
    if (validLogin.data.token || validLogin.data.otp) {
      throw new Error('Security violation: token or plain OTP leaked in login response!');
    }
    const challengeId = validLogin.data.challengeId;
    console.log('[Step 2 Passed] Valid login issued OTP challenge ID:', challengeId);

    // 3. Verify incorrect OTP
    const wrongOtpRes = await post('/verify-otp', { challengeId, otp: '111111' });
    console.log('[Step 3] Wrong OTP response:', wrongOtpRes.status, wrongOtpRes.data);
    if (wrongOtpRes.status !== 400 || !wrongOtpRes.data.error) {
      throw new Error('Wrong OTP was not rejected!');
    }
    console.log('[Step 3 Passed] Wrong OTP rejected with attempt tracking.');

    // 4. Update the challenge with a known test OTP to verify successful completion
    const knownOtp = '654321';
    const challengeInDb = await LoginChallenge.findOne({ challengeId });
    challengeInDb.otpHash = hashOtp(knownOtp, challengeInDb.otpSalt);
    await challengeInDb.save();

    // 5. Verify correct OTP
    const correctOtpRes = await post('/verify-otp', { challengeId, otp: knownOtp });
    console.log('[Step 4] Correct OTP response:', correctOtpRes.status, correctOtpRes.data.user);
    if (correctOtpRes.status !== 200 || !correctOtpRes.data.token || !correctOtpRes.data.user) {
      throw new Error('Correct OTP verification failed!');
    }
    const authToken = correctOtpRes.data.token;
    console.log('[Step 4 Passed] Correct OTP verified, access token issued.');

    // 6. Attempt to reuse the consumed OTP
    const reuseRes = await post('/verify-otp', { challengeId, otp: knownOtp });
    console.log('[Step 5] Reuse OTP response:', reuseRes.status, reuseRes.data);
    if (reuseRes.status !== 400) {
      throw new Error('Replay attack was not prevented!');
    }
    console.log('[Step 5 Passed] Replay attack prevented (OTP single-use verified).');

    // 7. Verify protected /me route with the issued token
    const meRes = await get('/me', authToken);
    console.log('[Step 6] /me profile response:', meRes.status, meRes.data.user.email);
    if (meRes.status !== 200 || meRes.data.user.email !== 'priya@example.com') {
      throw new Error('Protected /me route failed with issued token!');
    }
    console.log('[Step 6 Passed] Issued token authenticated successfully on protected route.');

    // 8. Test Forgot Password / Passwordless OTP Login endpoint (/login-with-otp)
    const otpLoginReq = await post('/login-with-otp', { email: 'priya@example.com' });
    console.log('[Step 7] /login-with-otp response:', otpLoginReq.status, otpLoginReq.data);
    if (otpLoginReq.status !== 200 || !otpLoginReq.data.requiresOtp || !otpLoginReq.data.challengeId) {
      throw new Error('Passwordless OTP login request failed!');
    }
    console.log('[Step 7 Passed] Forgot Password / Passwordless OTP login request issued challenge successfully.');

    console.log('--- ALL AUTH ROUTES HTTP INTEGRATION TESTS PASSED ---');
  } finally {
    if (server) server.close();
    await mongoose.disconnect();
  }
};

runHttpTest().catch((err) => {
  console.error('HTTP Test Failure:', err);
  if (server) server.close();
  process.exit(1);
});

