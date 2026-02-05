const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: "sandbox.smtp.mailtrap.io",
  port: 2525,
  auth: {
    user: process.env.MAILTRAP_USER,
    pass: process.env.MAILTRAP_PASS,
  },
});

// verify connection
transporter.verify((error, success) => {
  if (error) {
    console.error("❌ Mailtrap error:", error);
  } else {
    console.log("✅ Mailtrap transporter ready");
  }
});

const sendMail = async ({ to, subject, html }) => {
  await transporter.sendMail({
    from: "no-reply@googledrive.app",
    to,
    subject,
    html,
  });
  console.log("✅ Email captured in Mailtrap for:", to);
};

module.exports = sendMail;
