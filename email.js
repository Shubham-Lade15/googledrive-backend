require("dotenv").config();
const { Resend } = require("resend");

const resend = new Resend(process.env.RESEND_API_KEY);

async function sendTestEmail() {
  const response = await resend.emails.send({
    from: "GoogleDrive <onboarding@resend.dev>",
    to: ["gdriveappshubham@gmail.com"],
    subject: "Resend Test Email",
    html: "<h2>Email sent successfully 🚀</h2><p>Your setup works!</p>",
  });

  console.log(response);
}

sendTestEmail();
