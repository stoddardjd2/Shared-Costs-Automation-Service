const nodemailer = require("nodemailer");
const emailTemplate = require("./emailTemplate.js");
// Send email

async function sendEmailRequest(
  sender,
  receiver,
  amount,
  paymentUrl,
  userEmail
) {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: userEmail,
      subject: `Payment Request From ${receiver}`,
      text: `Hi ${receiver},

${sender} sent you a payment request.

AMOUNT REQUESTED: ${amount}
From: ${sender}

To complete your payment, visit: ${paymentUrl}

Questions? Contact ${sender} or our support team.

---
Sent via Splitify
Split expenses. Settle up easily.`,
      html: emailTemplate
        .replace(/\{\{sender\}\}/g, sender)
        .replace(/\{\{receiver\}\}/g, receiver)
        .replace(/\{\{amount\}\}/g, amount)
        .replace(/\{\{url\}\}/g, paymentUrl),
    });
  } catch (err) {
    console.log("error sending email request", err);
  }
}

module.exports = sendEmailRequest;
