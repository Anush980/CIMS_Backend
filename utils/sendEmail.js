const nodemailer = require("nodemailer");

// ===============================
// Create Transporter
// ===============================
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: process.env.SMTP_SECURE === "true",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
  tls: {
    rejectUnauthorized: false,
  },
  family: 4, // Force IPv4
});

// ===============================
// Verify Email Configuration
// ===============================
transporter.verify((error) => {
  if (error) {
    console.error(" Email configuration error:", error.message);

  } else {
    console.log(" Email server is ready to send messages");
  }
});

// ===============================
// Generic Send Email Function
// ===============================
const sendEmail = async ({ to, subject, html, text }) => {
  try {
    const info = await transporter.sendMail({
      from: `"${process.env.SMTP_FROM_NAME}" <${process.env.SMTP_FROM_EMAIL}>`,
      to,
      subject,
      html,
      text,
    });

    console.log(" Email sent:", info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error(" Failed to send email:", error.message);
    return { success: false, error: error.message };
  }
};

module.exports = sendEmail;
