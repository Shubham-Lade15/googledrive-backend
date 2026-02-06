const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: "smtp.mailersend.net",
  port: 587,
  secure: false,
  auth: {
    user: process.env.MAILERSEND_SMTP_USER,
    pass: process.env.MAILERSEND_SMTP_PASS,
  },
});

// verify connection
transporter.verify((error, success) => {
  if (error) {
    console.error("❌ Mailersend transporter error:", error);
  } else {
    console.log("✅ Mailersend transporter ready");
  }
});

const sendMail = async ({ to, subject, html }) => {
  try {
    await transporter.sendMail({
      from: `"Google Drive Shubham" <MS_W5q5Dg@test-65qngkdk1ewlwr12.mlsender.net>`,
      to,
      subject,
      html,
    });

    console.log("✅ REAL email sent to:", to);
    return true;
  } catch (error) {
    console.error("❌ Error sending real email:", error);
    return false;
  }
};

module.exports = sendMail;
