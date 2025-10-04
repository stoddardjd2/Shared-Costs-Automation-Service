const nodemailer = require("nodemailer");
const emailTemplate = require("./emailTemplate.js");
const pRetry = require("p-retry"); // npm install p-retry

async function sendEmailRequest(
  sender,
  receiver,
  amount,
  paymentUrl,
  userEmail
) {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: userEmail,
    subject: `Payment Request From ${receiver}`,
    text: `Hi ${receiver},

${sender} sent you a payment request.

AMOUNT REQUESTED: $${amount}
From: ${sender}

To complete your payment, visit: ${paymentUrl}

Questions? Contact ${sender} or our support team.

---
Sent via Splitify
Split expenses. Automate follow-ups.`,
    html: emailTemplate
      .replace(/\{\{sender\}\}/g, sender)
      .replace(/\{\{receiver\}\}/g, receiver)
      .replace(/\{\{amount\}\}/g, amount)
      .replace(/\{\{url\}\}/g, paymentUrl),
  };

  // Retry wrapper for transient SMTP failures
  const MAX_RETRIES = 4;

  try {
    await pRetry(
      async () => {
        return new Promise((resolve, reject) => {
          transporter.sendMail(mailOptions, (err, info) => {
            if (err) {
              const code = err?.responseCode || err?.code;
              const msg = err?.message || "";
              const retryable =
                [421, 450, 451, 452].includes(code) ||
                /temporary|try again later|system problem/i.test(msg);

              if (retryable) {
                console.warn("⚠️ Temporary email issue, retrying:", msg);
                return reject(err); // trigger retry
              }

              console.error("❌ Non-retryable email error:", msg);
              return reject(new pRetry.AbortError(err)); // stop retrying
            }
            console.log("✅ Email sent:", info.response);
            resolve(info);
          });
        });
      },
      {
        retries: MAX_RETRIES,
        factor: 2, // exponential backoff
        minTimeout: 1000, // 1s
        maxTimeout: 15000, // 15s
      }
    );
  } catch (err) {
    console.error("📧 Email failed after retries:", err.message || err);
  }
}

module.exports = sendEmailRequest;
