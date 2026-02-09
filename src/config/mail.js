const axios = require("axios");

const sendMail = async ({ to, subject, html }) => {
  try {
    await axios.post(
      "https://api.brevo.com/v3/smtp/email",
      {
        sender: {
          name: "Google Drive App",
          email: process.env.BREVO_SENDER_EMAIL,
        },
        to: [
          {
            email: to,
          },
        ],
        subject,
        htmlContent: html,
      },
      {
        headers: {
          "api-key": process.env.BREVO_API_KEY,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      }
    );

    console.log("✅ REAL email sent via Brevo API to:", to);
    return true;
  } catch (error) {
    console.error(
      "❌ Brevo API email error:",
      error.response?.data || error.message
    );
    return false; // do NOT break registration
  }
};

module.exports = sendMail;
