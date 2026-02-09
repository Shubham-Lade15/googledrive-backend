const { Resend } = require("resend");

const resend = new Resend(process.env.RESEND_API_KEY);

const sendMail = async ({ to, subject, html }) => {
  try {
    await resend.emails.send({
      from: "Google Drive App <onboarding@resend.dev>",
      to: [to],
      subject,
      html,
    });

    console.log("✅ REAL email sent via Resend to:", to);
    return true;
  } catch (error) {
    console.error("❌ Resend email error:", error);
    return false; // do NOT crash registration
  }
};

module.exports = sendMail;
