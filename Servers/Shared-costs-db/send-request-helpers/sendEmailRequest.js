const nodemailer = require("nodemailer");
const emailTemplate = require("./emailTemplate.js");

// v5 (CJS) or v6+ (ESM default) compatible import:
const pRetryMod = require("p-retry");
const pRetry = pRetryMod.default || pRetryMod;
const AbortError = pRetryMod.AbortError || (pRetry && pRetry.AbortError);

async function sendEmailRequest(sender, receiver, amount, paymentUrl, userEmail) {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
  });

  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: userEmail,
    subject: `Payment Request From ${receiver}`,
    text: `Hi ${receiver},\n\n${sender} sent you a payment request.\n\nAMOUNT REQUESTED: $${amount}\nFrom: ${sender}\n\nTo complete your payment, visit: ${paymentUrl}\n\nQuestions? Contact ${sender} or our support team.\n\n---\nSent via Splitify\nSplit expenses. Automate follow-ups.`,
    html: emailTemplate
      .replace(/\{\{sender\}\}/g, sender)
      .replace(/\{\{receiver\}\}/g, receiver)
      .replace(/\{\{amount\}\}/g, amount)
      .replace(/\{\{url\}\}/g, paymentUrl),
  };

  const MAX_RETRIES = 4;

  try {
    await pRetry(async () => {
      return new Promise((resolve, reject) => {
        transporter.sendMail(mailOptions, (err, info) => {
          if (err) {
            const code = err?.responseCode || err?.code;
            const msg = err?.message || "";
            const retryable =
              [421, 450, 451, 452].includes(code) ||
              ["ETIMEDOUT", "ECONNRESET", "EAI_AGAIN"].includes(code) ||
              /temporary|try again later|system problem/i.test(msg);

            if (retryable) {
              console.warn("⚠️ Temporary email issue, retrying:", code || msg);
              return reject(err); // trigger retry
            }
            console.error("❌ Non-retryable email error:", code || msg);
            return reject(new AbortError(err)); // stop retrying
          }
          console.log("✅ Email sent:", info.response);
          resolve(info);
        });
      });
    }, { retries: MAX_RETRIES, factor: 2, minTimeout: 1000, maxTimeout: 15000 });
  } catch (err) {
    console.error("📧 Email failed after retries:", err?.message || err);
  }
}

module.exports = sendEmailRequest;
