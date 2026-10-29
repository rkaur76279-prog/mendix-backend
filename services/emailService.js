import nodemailer from 'nodemailer';

/**
 * Creates and caches the nodemailer transporter based on environment configuration.
 */
let cachedTransporter = null;

const getTransporter = async () => {
  if (cachedTransporter) {
    return cachedTransporter;
  }

  // Read credentials from env: EMAIL_USER / EMAIL / SMTP_USER and EMAIL_PASS / PASS / SMTP_PASS
  const emailUser = (process.env.EMAIL_USER || process.env.EMAIL || process.env.SMTP_USER || '').trim();
  const rawPass = process.env.EMAIL_PASS || process.env.PASS || process.env.SMTP_PASS || '';
  const emailPass = rawPass.replace(/\s+/g, ''); // strip spaces from App Passwords

  const { SMTP_HOST, SMTP_PORT } = process.env;

  if (emailUser && emailPass) {
    // If custom SMTP host provided
    if (SMTP_HOST) {
      cachedTransporter = nodemailer.createTransport({
        host: SMTP_HOST,
        port: Number(SMTP_PORT) || 587,
        secure: Number(SMTP_PORT) === 465,
        auth: {
          user: emailUser,
          pass: emailPass,
        },
      });
    } else {
      // Default to Gmail service if @gmail or standard provider
      cachedTransporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: emailUser,
          pass: emailPass,
        },
      });
    }

    console.log(`[Mendx Email] Active email transporter configured for: ${emailUser}`);
    return cachedTransporter;
  }

  // Fallback for development / staging when credentials not yet set:
  try {
    const testAccount = await nodemailer.createTestAccount();
    console.log('[Mendx Email] Generated Ethereal Test Account:', testAccount.user);
    cachedTransporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });
    return cachedTransporter;
  } catch (err) {
    console.warn('[Mendx Email] Fallback to console logger:', err.message);
    cachedTransporter = {
      sendMail: async (mailOptions) => {
        console.log(`[Mendx Email Mock] To: ${mailOptions.to} | Subject: ${mailOptions.subject}`);
        return { messageId: `mock-${Date.now()}` };
      },
    };
    return cachedTransporter;
  }
};

/**
 * Generates the responsive, branded HTML template for Mendx OTP emails.
 */
export const generateOtpEmailHtml = ({ recipientName, otp, expiryMinutes = 5 }) => {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your Mendx Login Verification Code</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      background-color: #F8F9FE;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      color: #10102F;
      -webkit-font-smoothing: antialiased;
    }
    .container {
      max-width: 560px;
      margin: 40px auto;
      background-color: #FFFFFF;
      border-radius: 20px;
      overflow: hidden;
      box-shadow: 0 10px 30px rgba(16, 16, 47, 0.08);
      border: 1px solid #EAEAF2;
    }
    .header {
      background: linear-gradient(135deg, #5968F5 0%, #4351DB 100%);
      padding: 36px 32px;
      text-align: center;
      color: #FFFFFF;
    }
    .logo-container {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 12px;
    }
    .logo-badge {
      display: inline-block;
      width: 44px;
      height: 44px;
      line-height: 44px;
      background: rgba(255, 255, 255, 0.2);
      border-radius: 12px;
      font-size: 22px;
      font-weight: 800;
      color: #FFFFFF;
      text-align: center;
    }
    .brand-title {
      font-size: 28px;
      font-weight: 800;
      letter-spacing: -0.5px;
      margin: 0;
      color: #FFFFFF;
    }
    .brand-subtitle {
      font-size: 13px;
      opacity: 0.9;
      margin-top: 4px;
      font-weight: 500;
      color: #E2E6FF;
    }
    .content {
      padding: 36px 32px;
      text-align: center;
    }
    .heading {
      font-size: 22px;
      font-weight: 700;
      color: #10102F;
      margin: 0 0 12px 0;
    }
    .greeting {
      font-size: 15px;
      color: #555770;
      line-height: 1.6;
      margin: 0 0 28px 0;
    }
    .otp-wrapper {
      background: #F4F5FF;
      border: 2px dashed #5968F5;
      border-radius: 16px;
      padding: 24px 16px;
      margin: 28px 0;
      display: inline-block;
      width: 100%;
      box-sizing: border-box;
    }
    .otp-code {
      font-family: 'SF Mono', Consolas, 'Liberation Mono', Menlo, Courier, monospace;
      font-size: 38px;
      font-weight: 800;
      color: #5968F5;
      letter-spacing: 10px;
      margin: 0;
      text-align: center;
    }
    .otp-note {
      font-size: 12px;
      color: #6B6D82;
      margin-top: 10px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .info-card {
      background: #F8FFF9;
      border: 1px solid #B8F2DA;
      border-radius: 12px;
      padding: 16px;
      margin: 24px 0;
      text-align: left;
    }
    .info-row {
      display: flex;
      align-items: center;
      margin-bottom: 6px;
      font-size: 13px;
      color: #0E6845;
    }
    .info-row strong {
      color: #0A4E34;
      margin-right: 6px;
    }
    .security-notice {
      background: #FFF8F0;
      border-left: 4px solid #FF9800;
      padding: 14px 16px;
      border-radius: 8px;
      text-align: left;
      font-size: 13px;
      color: #8A5300;
      margin-top: 24px;
      line-height: 1.5;
    }
    .footer {
      background-color: #F8F9FE;
      padding: 24px 32px;
      text-align: center;
      border-top: 1px solid #EAEAF2;
      font-size: 12px;
      color: #8C8E9F;
      line-height: 1.6;
    }
    .footer a {
      color: #5968F5;
      text-decoration: none;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="logo-container">
        <span class="logo-badge">M</span>
      </div>
      <h1 class="brand-title">Mendx</h1>
      <p class="brand-subtitle">Premium Home Services On-Demand</p>
    </div>

    <div class="content">
      <h2 class="heading">Your Mendx Login Verification Code</h2>
      <p class="greeting">
        Hello <strong>${recipientName || 'Valued User'}</strong>,<br/>
        We received a request to access your Mendx account. Use the one-time verification code below to securely sign in.
      </p>

      <div class="otp-wrapper">
        <div class="otp-code">${otp}</div>
        <div class="otp-note">Valid for ${expiryMinutes} minutes</div>
      </div>

      <div class="info-card">
        <div class="info-row">
          <strong>⏱️ Code Expiration:</strong> This code expires in exactly <strong>${expiryMinutes} minutes</strong>.
        </div>
        <div class="info-row">
          <strong>🔒 Single-Use:</strong> For your security, this code can only be used once.
        </div>
      </div>

      <div class="security-notice">
        <strong>⚠️ Security Advisory:</strong> Do not share this code with anyone. Mendx specialists or support agents will never ask you for your verification code. If you did not initiate this login, you can safely ignore this email.
      </div>
    </div>

    <div class="footer">
      This is an automated security message from <strong>Mendx Home Services</strong>.<br/>
      Need assistance? Contact our 24/7 care team at <a href="mailto:support@mendx.com">support@mendx.com</a>.<br/>
      &copy; ${new Date().getFullYear()} Mendx Inc. All rights reserved.
    </div>
  </div>
</body>
</html>
  `.trim();
};

/**
 * Sends the OTP email using the configured SMTP transporter.
 * Throws an error if sending fails so the calling controller can fail safely.
 */
export const sendOtpEmail = async ({ to, name, otp, expiryMinutes = 5 }) => {
  if (!to || !otp) {
    throw new Error('Recipient email and OTP are required.');
  }

  const transporter = await getTransporter();
  const emailUser = (process.env.EMAIL_USER || process.env.EMAIL || process.env.SMTP_USER || '').trim();
  const fromAddress = process.env.EMAIL_FROM || process.env.SMTP_FROM || (emailUser ? `"Mendx Security" <${emailUser}>` : '"Mendx Security" <noreply@mendx.com>');
  const html = generateOtpEmailHtml({ recipientName: name, otp, expiryMinutes });

  const mailOptions = {
    from: fromAddress,
    to,
    subject: `${otp} is your Mendx login verification code`,
    text: `Your Mendx login verification code is ${otp}. This code is valid for ${expiryMinutes} minutes. Do not share this code with anyone. If you did not request this login, you can ignore this email.`,
    html,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`[Mendx Email] Verification code sent to ${to} (MessageId: ${info.messageId})`);

    // In ethereal/dev mode, log test URL if available
    if (nodemailer.getTestMessageUrl && info && info.messageId) {
      const previewUrl = nodemailer.getTestMessageUrl(info);
      if (previewUrl) {
        console.log(`[Mendx Email Preview URL]: ${previewUrl}`);
      }
    }

    return {
      success: true,
      messageId: info.messageId,
    };
  } catch (error) {
    console.error(`[Mendx Email Error] Failed to send OTP to ${to}:`, error.message);
    throw new Error(`Email delivery failed: ${error.message}`);
  }
};

