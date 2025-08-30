const express = require("express");
const router = express.Router();
const Request = require("../models/Request");

const sentTextMessage = require("../send-request-helpers/sendTextMessage");

const {
  startReminderScheduler,
  startSchedulerWithFrequentChecks,
  stopScheduler,
  runSchedulerNow,
  getSchedulerStatus,
} = require("../reminder-scheduler/reminderScheduler");

const {
  startRecurringRequestsCron,
  getRequestSchedulerStatus,
  runRecurringRequestsNow,
} = require("../payment-request-scheduler/paymentRequestScheduler");
// FOR REMINDER SCHEDULER
// Admin endpoint to check scheduler status
router.get("/scheduler-status", async (req, res) => {
  try {
    const status = await getSchedulerStatus();
    res.json(status);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
// Manual trigger endpoint
router.post("/trigger-reminders", async (req, res) => {
  try {
    console.log("🔧 Manual reminder trigger requested");
    await runSchedulerNow();

    const status = await getSchedulerStatus();
    res.json({
      success: true,
      message: "Reminders processed successfully",
      timestamp: new Date().toISOString(),
      status,
    });
  } catch (error) {
    console.error("❌ Manual reminder trigger failed:", error);
    res.status(500).json({
      success: false,
      message: "Failed to process reminders",
      error: error.message,
    });
  }
});

// Manual trigger endpoint
router.get("/request-scheduler-status", async (req, res) => {
  try {
    const status = getRequestSchedulerStatus();
    res.json(status);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post("/trigger-request-scheduler", async (req, res) => {
  try {
    console.log("🔧 Manual requests scheduler trigger requested");
    const status = await runRecurringRequestsNow();
    res.json({
      success: true,
      message: "requests scheduler processed successfully",
      timestamp: new Date().toISOString(),
      status,
    });
  } catch (error) {
    console.error("❌ Manual request scheduler trigger failed:", error);
    res.status(500).json({
      success: false,
      message: "Failed to process requests",
      error: error.message,
    });
  }
});

router.post("/trigger-email", async (req, res) => {
  try {
    console.log("🔧 Manually sending email");
    await sendEmailRequest(
      "Jared",
      "Kevin",
      "13",
      "URL",
      "stoddardjd3@gmail.com"
    );
    res.json({
      success: true,
      message: "email sent successfully",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("❌ email trigger failed:", error);
    res.status(500).json({
      success: false,
      message: "Failed to send email",
      error: error.message,
    });
  }
});

// OVERRIDES FIRST FOUND REQUEST DOCUMENT AND SETS START TIMING/LASTSENT TO 2 years ago
router.post("/override-and-test-scheduler/:id", async (req, res) => {
  const id = req.params.id;
  const doc = await Request.findOneAndUpdate(
    { _id: id },
    {
      $set: {
        startTiming: {
          $dateToString: {
            date: {
              $dateSubtract: { startDate: "$$NOW", unit: "year", amount: 2 },
            },
            format: "%Y-%m-%d",
            timezone: "UTC", // change to "America/Los_Angeles" if you want local
          },
        },
        lastSent: new Date(
          new Date().setFullYear(new Date().getFullYear() - 2)
        ),
      },
    },
    { sort: { _id: 1 }, new: true }
  );
  console.log("updated doc for testing scheduler:", doc._id);

  try {
    console.log("🔧 Manual requests scheduler trigger requested");
    const status = await runRecurringRequestsNow();
    res.json({
      success: true,
      message: "requests scheduler processed successfully",
      timestamp: new Date().toISOString(),
      status,
    });
  } catch (error) {
    console.error("❌ Manual request scheduler trigger failed:", error);
    res.status(500).json({
      success: false,
      message: "Failed to process requests",
      error: error.message,
    });
  }
});

router.post("/send-text", async (req, res) => {
  const { to } = req.body;
console.log("sending to", to)
  const message = `Hi Jared,
kevin sent you a payment request.

AMOUNT REQUESTED: $32
FOR: Netflix

To complete your payment, visit: https://splitifyofficial.netlify.app/dashboard

Sent via Splitify
`;

  try {
    console.log("🔧 Manually sending text");
    await sentTextMessage(to, "+18333702013", message);

    res.json({
      success: true,
      message: "text sent successfully",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("raw:", JSON.stringify(error.raw, null, 2));
    console.error("errors:", JSON.stringify(error.raw?.errors, null, 2));
    // Optional: log request-id so support can trace
    console.error("x-request-id:", error.requestId);
    console.error("❌ text trigger failed:", error);
    res.status(500).json({
      success: false,
      message: "Failed to send text",
      error: error.message,
    });
  }
});

module.exports = router;
