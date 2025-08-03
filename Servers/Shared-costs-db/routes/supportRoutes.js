const express = require("express");
const router = express.Router();

// Support Email Route
const nodemailer = require("nodemailer");

// Use env for security: SUPPORT_EMAIL_USER, SUPPORT_EMAIL_PASS
const transporter = nodemailer.createTransport({
  service: "gmail", // change to your SMTP provider if needed
  auth: {
    user: process.env.SUPPORT_EMAIL_USER,
    pass: process.env.SUPPORT_EMAIL_PASS,
  },
});

// Manual route for support/contact emails
router.post("/email", async (req, res) => {
  console.log("Received support email request:", req.body);
  const { email, message } = req.body;

  // Basic validation
  if (!email || !message) {
    return res.status(400).json({ error: "Email and message are required." });
  }

  // Email options
  const mailOptions = {
    from: `"SmartSplit Contact" <${process.env.SUPPORT_EMAIL_USER}>`,
    to: process.env.SUPPORT_EMAIL_USER, // Where support mail lands
    replyTo: email,
    subject: `Support Request from ${email}`,
    text: message,
    html: `<div>
             <strong>From:</strong> ${email}<br/>
             <strong>Message:</strong><br/>
             <pre style="font-family:inherit">${message}</pre>
           </div>`,
  };

  try {
    await transporter.sendMail(mailOptions);
    res.json({ success: true, message: "Message sent!" });
  } catch (err) {
    console.error("Email send error:", err);
    res.status(500).json({ error: "Failed to send email." });
  }
});

module.exports = router;
