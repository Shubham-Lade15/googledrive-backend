const { MailerSend, EmailParams, Sender, Recipient } = require("mailersend");

const mailerSend = new MailerSend({
  apiKey: process.env.MAILERSEND_API_KEY,
});

const sendMail = async ({ to, subject, html }) => {
  try {
    const sentFrom = new Sender(
      "MS_W5q5Dg@test-65qngkdk1ewlwr12.mlsender.net",
      "Google Drive Shubham"
    );

    const recipients = [new Recipient(to, to)];

    const emailParams = new EmailParams()
      .setFrom(sentFrom)
      .setTo(recipients)
      .setSubject(subject)
      .setHtml(html);

    await mailerSend.email.send(emailParams);

    console.log("✅ REAL email sent via MailerSend API to:", to);
    return true;
  } catch (error) {
    console.error("❌ MailerSend API error:", error.body || error);
    return false;
  }
};

module.exports = sendMail;
