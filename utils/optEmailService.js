const nodemailer = require('nodemailer');

// Create transporter using Gmail
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,     
  port: process.env.SMTP_PORT,      
  secure: false,
  auth: {
    user: process.env.SMTP_USER,    
    pass: process.env.SMTP_PASS,    
  },
  
  tls: {
    rejectUnauthorized: false,
  },
  family: 4, // Force IPv4 to avoid ::1 errors
});

// Verify connection
transporter.verify(function (error, success) {
  if (error) {
    console.error('Email configuration error:', error.message);
    console.error('Check your .env file:');
    console.error('  SMTP_HOST:', process.env.SMTP_HOST ? '✓' : '✗ MISSING');
    console.error('  SMTP_PORT:', process.env.SMTP_PORT ? '✓' : '✗ MISSING');
    console.error('  SMTP_USER:', process.env.SMTP_USER ? '✓' : '✗ MISSING');
    console.error('  SMTP_PASS:', process.env.SMTP_PASS ? '✓' : '✗ MISSING');
  } else {
    console.log(' Email server is ready to send OTP');
  }
});

/**
 * Send OTP email for password reset
 * @param {string} email - Recipient email
 * @param {string} otp - 6-digit OTP code
 * @param {string} userName - User's name
 */
const sendOTPEmail = async (email, otp, userName = 'User') => {
  const mailOptions = {
    from: `"${process.env.SMTP_FROM_NAME || 'Online Retail Management System'}" <${process.env.SMTP_FROM_EMAIL}>`,
    to: email,
    subject: 'Password Reset OTP Code',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            background-color: #f4f4f4;
            margin: 0;
            padding: 0;
          }
          .container {
            max-width: 600px;
            margin: 20px auto;
            background: white;
            border-radius: 10px;
            overflow: hidden;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          }
          .header {
            background:#3498db;
            color: white;
            padding: 30px;
            text-align: center;
          }
          .header h1 {
            margin: 0;
            font-size: 24px;
          }
          .content {
            padding: 40px 30px;
          }
          .otp-box {
            background:#3498db;
            color: white;
            padding: 20px;
            text-align: center;
            border-radius: 10px;
            margin: 30px 0;
          }
          .otp-code {
            font-size: 42px;
            font-weight: bold;
            letter-spacing: 8px;
            margin: 10px 0;
            font-family: 'Courier New', monospace;
          }
          .warning {
            background-color: #fff3cd;
            border-left: 4px solid #ffc107;
            padding: 15px;
            margin: 20px 0;
            border-radius: 4px;
          }
          .footer {
            background-color: #f8f9fa;
            padding: 20px;
            text-align: center;
            font-size: 12px;
            color: #666;
          }
          .expiry-info {
            text-align: center;
            color: #666;
            font-size: 14px;
            margin-top: 10px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1> Password Reset Request</h1>
          </div>
          
          <div class="content">
            <p>Hello <strong>${userName}</strong>,</p>
            
            <p>We received a request to reset your password. Use the OTP code below to proceed:</p>
            
            <div class="otp-box">
              <div style="font-size: 14px; margin-bottom: 10px;">Your OTP Code</div>
              <div class="otp-code">${otp}</div>
              <div class="expiry-info">⏱️ Valid for 10 minutes</div>
            </div>
            
            <p style="text-align: center; color: #666;">
              Enter this code on the password reset page to continue.
            </p>
            
            <div class="warning">
              <strong>⚠️ Security Notice:</strong>
              <ul style="margin: 10px 0 0 0; padding-left: 20px;">
                <li>Never share this OTP with anyone</li>
                <li>This code expires in 10 minutes</li>
                <li>If you didn't request this, please ignore this email</li>
              </ul>
            </div>
          </div>
          
          <div class="footer">
            <p>This is an automated email. Please do not reply.</p>
            <p style="margin-top: 10px;">© ${new Date().getFullYear()} ${process.env.SMTP_FROM_NAME || 'Stockmate'}. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `
      Hello ${userName},

      Your password reset OTP code is: ${otp}

      This code will expire in 10 minutes.

      If you didn't request this, please ignore this email.

      Never share this OTP with anyone.
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(' OTP email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error(' Error sending OTP email:', error);
    throw new Error('Failed to send OTP email');
  }
};

/**
 * Send password reset success confirmation
 */
const sendPasswordChangeConfirmation = async (email, userName = 'User') => {
  const mailOptions = {
    from: `"${process.env.SMTP_FROM_NAME || 'Stockmate'}" <${process.env.SMTP_FROM_EMAIL}>`,
    to: email,
    subject: 'Password Successfully Changed',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            background-color: #f4f4f4;
            margin: 0;
            padding: 0;
          }
          .container {
            max-width: 600px;
            margin: 20px auto;
            background: white;
            border-radius: 10px;
            overflow: hidden;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          }
          .header {
            background: #2ecc71;
            color: white;
            padding: 30px;
            text-align: center;
          }
          .content {
            padding: 40px 30px;
          }
          .success-icon {
            text-align: center;
            font-size: 64px;
            margin-bottom: 20px;
          }
          .alert {
            background-color: #f8d7da;
            border-left: 4px solid #dc3545;
            padding: 15px;
            margin: 20px 0;
            border-radius: 4px;
          }
          .footer {
            background-color: #f8f9fa;
            padding: 20px;
            text-align: center;
            font-size: 12px;
            color: #666;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="success-icon">✓</div>
            <h1>Password Changed Successfully</h1>
          </div>
          
          <div class="content">
            <p>Hello <strong>${userName}</strong>,</p>
            
            <p>Your password has been successfully changed.</p>
            
            <p><strong>Change Details:</strong></p>
            <ul>
              <li>Date & Time: ${new Date().toLocaleString()}</li>
              <li>Email: ${email}</li>
            </ul>
            
            <div class="alert">
              <strong>⚠️ Did not make this change?</strong><br>
              If you did not authorize this password change, please contact our support team immediately as your account may have been compromised.
            </div>
            
            <p>You can now log in to your account using your new password.</p>
          </div>
          
          <div class="footer">
            <p>This is an automated email. Please do not reply.</p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `
      Hello ${userName},

      Your password has been successfully changed.

      Change Details:
      - Date & Time: ${new Date().toLocaleString()}
      - Email: ${email}

      If you did not make this change, please contact support immediately.

      You can now log in with your new password.
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(' Password change confirmation sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending confirmation email:', error);
    return { success: false, error: error.message };
  }
};

module.exports = {
  sendOTPEmail,
  sendPasswordChangeConfirmation,
  transporter,
};