const sendEmail = require("./sendEmail");

const sendStaffCredentials = async ({ 
  to, 
  name, 
  loginEmail, 
  password 
}) => {
  return sendEmail({
    to,
    subject: "Your Staff Account Login Details",
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
      box-shadow: 0 4px 6px rgba(0,0,0,0.1);
    }

    .header {
      background: #3498db;
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

    .credentials-box {
      background: #ecf0f1;
      padding: 20px;
      border-radius: 10px;
      margin: 20px 0;
    }

    .credentials-box p {
      margin: 8px 0;
    }

    .footer {
      background: #f8f9fa;
      padding: 20px;
      text-align: center;
      font-size: 12px;
      color: #666;
    }

    .footer p {
      margin: 5px 0;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Welcome to Stockmate</h1>
    </div>

    <div class="content">
      <p>Hello <strong>${name}</strong>,</p>

      <p>Your staff account has been created. Please find your login credentials below:</p>

      <div class="credentials-box">
        <p><strong>Login Email:</strong> ${loginEmail}</p>
        ${
          password
            ? `<p><strong>Password:</strong> ${password}</p>
               <p>Please change your password after first login.</p>`
            : `<p>If you forgot your password, please contact your admin.</p>`
        }
      </div>

      <p>Thanks,<br/>Stockmate Team</p>
    </div>

    <div class="footer">
      <p>This is an automated email. Please do not reply.</p>
      <p>© ${new Date().getFullYear()} Stockmate. All rights reserved.</p>
    </div>
  </div>
</body>
</html>

    `,
  });
};

module.exports = sendStaffCredentials;
