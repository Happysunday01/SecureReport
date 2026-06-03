const nodemailer = require('nodemailer');

function hasRealValue(value) {
  return value && !value.startsWith('your-');
}

function createTransporter() {
  if (process.env.SMTP_HOST) {
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT || 587),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      },
      tls: {
        rejectUnauthorized: process.env.SMTP_REJECT_UNAUTHORIZED !== 'false'
      }
    });
  }

  if (hasRealValue(process.env.GMAIL_USER) && hasRealValue(process.env.GMAIL_APP_PASSWORD)) {
    return nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD
      }
    });
  }

  if (process.env.GMAIL_USER || process.env.GMAIL_APP_PASSWORD) {
    throw new Error('Replace GMAIL_USER and GMAIL_APP_PASSWORD in backend/.env with your Gmail address and Google App Password.');
  }

  throw new Error('Email is not configured. Set SMTP_HOST/SMTP_USER/SMTP_PASS or GMAIL_USER/GMAIL_APP_PASSWORD in backend/.env.');
}

async function sendPasswordResetEmail(userEmail, resetCode, expiresAt) {
  const transporter = createTransporter();
  const from = process.env.MAIL_FROM || process.env.GMAIL_USER || process.env.SMTP_USER;
  const expiryText = expiresAt ? new Date(expiresAt).toLocaleString() : '15 minutes';

  await transporter.sendMail({
    from,
    to: userEmail,
    subject: 'SecureReport - Your Password Reset Code',
    text: [
      'You requested to reset your SecureReport password.',
      '',
      `Your password reset code is: ${resetCode}`,
      `This code expires at: ${expiryText}`,
      '',
      "If you didn't request this, you can ignore this email."
    ].join('\n'),
    html: `
      <h2>Password Reset Request</h2>
      <p>You requested to reset your password for SecureReport.</p>
      <p>Use this one-time code to choose a new password:</p>
      <p style="font-size:28px;letter-spacing:6px;font-weight:700;background:#F3F4F6;color:#111827;padding:16px 20px;border-radius:8px;display:inline-block;">${resetCode}</p>
      <p>This code expires at <strong>${expiryText}</strong>.</p>
      <p>If you didn't request this, please ignore this email.</p>
    `
  });

  console.log('Password reset email sent to:', userEmail);
}

module.exports = { sendPasswordResetEmail };
