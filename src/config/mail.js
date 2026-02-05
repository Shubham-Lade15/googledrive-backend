const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: "smtp-relay.brevo.com",
  port: 587,
  secure: false, // TLS
  auth: {
    user: process.env.BREVO_SMTP_USER,
    pass: process.env.BREVO_SMTP_PASS,
  },
});

// verify transporter
transporter.verify((error, success) => {
  if (error) {
    console.error("❌ Brevo transporter error:", error);
  } else {
    console.log("✅ Brevo transporter ready (REAL EMAILS)");
  }
});

const sendMail = async ({ to, subject, html }) => {
  try {
    await transporter.sendMail({
      from: `"Google Drive App" <${process.env.BREVO_SMTP_USER}>`,
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
