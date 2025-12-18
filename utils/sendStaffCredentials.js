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
      <p>Hello ${name},</p>
      <p>Welcome to <strong>Stockmate</strong>.</p>

      <p>Your staff account has been created.</p>

      <p><strong>Login Email:</strong> ${loginEmail}</p>
      ${
        password
          ? `<p><strong>Password:</strong> ${password}</p>
             <p>Please change your password after first login.</p>`
          : `<p>If you forgot your password, please contact admin.</p>`
      }

      <p>Thanks,<br/>Stockmate Team</p>
    `,
  });
};

module.exports = sendStaffCredentials;
