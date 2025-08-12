// scheduler/reminderScheduler.js
const cron = require("node-cron");
const mongoose = require("mongoose");
const { ObjectId } = require("mongodb");

// Import your Request model - adjust path as needed
const Request = require("../models/Request");
const User = require("../models/User");
// Global state
let isJobRunning = false;
let cronJob = null;

/**
 * Calculate next reminder date based on frequency
 */
function calculateNextReminderDate(currentDate, frequency) {
  const next = new Date(currentDate);

  switch (frequency.toLowerCase()) {
    case "daily":
      next.setDate(next.getDate() + 1);
      break;
    case "weekly":
      next.setDate(next.getDate() + 7);
      break;
    case "monthly":
      next.setMonth(next.getMonth() + 1);
      break;
    default:
      // If frequency is a number, treat as days
      const days = parseInt(frequency);
      if (!isNaN(days)) {
        next.setDate(next.getDate() + days);
      } else {
        // Default to weekly if frequency is unknown
        next.setDate(next.getDate() + 7);
      }
  }

  return next;
}

/**
 * Check if participants need reminders (paymentAmount < expected amount)
 */
function getParticipantsNeedingReminders(
  paymentHistoryEntry,
  requestParticipants
) {
  const participantsToRemind = [];

  paymentHistoryEntry.participants.forEach((historyParticipant) => {
    // Find the participant's expected amount from the main participants array
    const mainParticipant = requestParticipants.find(
      (p) => p._id.toString() === historyParticipant._id.toString()
    );

    if (mainParticipant) {
      const expectedAmount = mainParticipant.amount;
      const paidAmount = historyParticipant.paymentAmount || 0;

      // Send reminder if they haven't paid enough
      if (paidAmount < expectedAmount) {
        participantsToRemind.push({
          participantId: historyParticipant._id,
          expectedAmount,
          paidAmount,
          stillOwes: expectedAmount - paidAmount,
        });
      }
    }
  });

  return participantsToRemind;
}

/**
 * Placeholder function for sending reminders - implement with your SMS/Email API
 */
async function sendReminder(reminderData) {
  // TODO: Implement your SMS/Email sending logic here
  //Generate payment URL
  function getFrequency(requestData) {
    const { frequency, customInterval, customUnit } = requestData;
    if (frequency !== "custom") {
      return frequency;
    } else {
      if (frequency === "custom") {
        // Handle pluralization for time units
        const getSingularUnit = (unit) => {
          const singularMap = {
            months: "month",
            days: "day",
            weeks: "week",
            years: "year",
          };
          return singularMap[unit] || unit;
        };

        const unit =
          customInterval === 1 ? getSingularUnit(customUnit) : customUnit;
        return `Every ${customInterval} ${unit}`;
      }
    }
  }

  const urlBase = `${process.env.CLIENT_URL}/paymentPortal`;
  const userId = reminderData.participantId;
  const name = reminderData.participantName;
  const amount = reminderData.stillOwes;
  const frequency = getFrequency(reminderData.requestData);
  const requester = reminderData.requestOwner;
  const chargeName = reminderData.requestName;
  const cashapp = reminderData.requestOwnerPaymentMethods?.cashapp || null;
  const venmo = reminderData.requestOwnerPaymentMethods?.venmo || null;

  const url = new URL(urlBase);
  url.searchParams.set("userId", userId);
  url.searchParams.set("name", name);
  url.searchParams.set("amount", amount);
  url.searchParams.set("frequency", frequency);
  url.searchParams.set("requester", requester);
  url.searchParams.set("chargeName", chargeName);
  url.searchParams.set("cashapp", cashapp);
  url.searchParams.set("venmo", venmo);

  const finalUrl = url.toString();
  console.log(`URL FOR ${name}!`, finalUrl);
  // Example implementation:
  // await sendSMS(reminderData.participantId, message);
  // await sendEmail(reminderData.participantId, subject, message);

  return true;
}

/**
 * Process reminders for a single request
 */
async function processRequestReminders(request) {
  const now = new Date();
  let updatedRequest = false;

  for (let i = 0; i < request.paymentHistory.length; i++) {
    const paymentEntry = request.paymentHistory[i];

    // Skip if no reminder date set or not yet due
    // FLIP for dev
    if (!paymentEntry.nextReminderDate || paymentEntry.nextReminderDate > now) {
      continue;
    }

    // Get participants who need reminders
    const participantsToRemind = getParticipantsNeedingReminders(
      paymentEntry,
      request.participants
    );

    if (participantsToRemind.length === 0) {
      // No one needs reminders, but still update next reminder date for recurring requests
      if (request.isRecurring) {
        paymentEntry.nextReminderDate = calculateNextReminderDate(
          now,
          request.reminderFrequency
        );
        updatedRequest = true;
      }
      continue;
    }

    // Send reminders to participants who need them
    for (const participant of participantsToRemind) {
      try {
        // Call your reminder sending function here
        // get requests owner info:
        const owner = await User.findById(new ObjectId(request.owner));
        // get participant name:
        const partcipantInfo = await User.findById(
          new ObjectId(participant.participantId)
        );

        await sendReminder({
          requestId: request._id,
          requestName: request.name,
          requestOwner: owner.name,
          requestOwnerPaymentMethods: owner?.paymentMethods || {},
          participantId: participant.participantId,
          participantName: partcipantInfo.name,
          // expectedAmount: participant.expectedAmount,
          // paidAmount: participant.paidAmount,
          stillOwes: participant.stillOwes,
          dueDate: paymentEntry.dueDate,
          requestData: request,
        });

        // Update the participant's reminder status
        const historyParticipant = paymentEntry.participants.find(
          (p) => p._id.toString() === participant.participantId.toString()
        );

        if (historyParticipant) {
          historyParticipant.reminderSent = true;
          historyParticipant.reminderSentDate = now;
          updatedRequest = true;
        }

        console.log(
          `✅ Reminder sent for request "${request.name}" to participant ${participant.participantId}`
        );
      } catch (error) {
        console.error(
          `❌ Failed to send reminder for request ${request._id}:`,
          error
        );
      }
    }

    // Update next reminder date
    if (request.isRecurring) {
      // For recurring requests, schedule next reminder
      paymentEntry.nextReminderDate = calculateNextReminderDate(
        now,
        request.reminderFrequency
      );
      updatedRequest = true;
    } else {
      // For one-time requests, mark as completed
      request.isCompleted = true;
      paymentEntry.nextReminderDate = null; // Clear next reminder
      updatedRequest = true;
      console.log(`📝 One-time request "${request.name}" marked as completed`);
    }
  }

  // Save changes if any updates were made
  if (updatedRequest) {
    await request.save();
  }

  return updatedRequest;
}

/**
 * Main job function that processes all due reminders
 */
async function processReminders() {
  if (isJobRunning) {
    console.log("⏳ Reminder job already running, skipping...");
    return;
  }

  isJobRunning = true;
  console.log("🚀 Starting reminder processing job...");

  try {
    const now = new Date();

    // Find all active requests that have reminders due
    const requests = await Request.find({
      isCompleted: { $ne: true }, // Not completed
      // FLIP for dev
      "paymentHistory.nextReminderDate": { $lte: now }, // Has reminders due
    });

    console.log(`📋 Found ${requests.length} requests with due reminders`);

    let processedCount = 0;
    for (const request of requests) {
      try {
        const wasUpdated = await processRequestReminders(request);
        if (wasUpdated) {
          processedCount++;
        }
      } catch (error) {
        console.error(`❌ Error processing request ${request._id}:`, error);
      }
    }

    console.log(
      `✅ Reminder processing completed. Processed ${processedCount} requests.`
    );
  } catch (error) {
    console.error("❌ Error in reminder processing job:", error);
  } finally {
    isJobRunning = false;
  }
}

/**
 * Start the cron job - runs daily at 2 PM server time
 */
function startScheduler() {
  // Run every day at 2 PM (14:00)
  cronJob = cron.schedule(
    "0 14 * * *",
    () => {
      processReminders();
    },
    {
      timezone: process.env.REMINDER_TIMEZONE || "America/New_York", // Adjust to your server timezone
    }
  );

  console.log("⏰ Reminder scheduler started - will run daily at 2:00 PM");

  // Optional: Run immediately on start for testing
  // processReminders();
}

/**
 * Stop the cron job
 */
function stopScheduler() {
  if (cronJob) {
    cronJob.stop();
    console.log("⏹️ Reminder scheduler stopped");
  }
}

/**
 * Manual trigger for testing
 */
async function runSchedulerNow() {
  console.log("🔧 Manually triggering reminder processing...");
  await processReminders();
}

// Helper functions for sending SMS/Email - implement with your APIs
async function sendSMS(participantId, message) {
  // TODO: Implement with your SMS provider (Twilio, etc.)
  console.log(`📱 SMS to ${participantId}: ${message}`);
}

async function sendEmail(participantId, subject, message) {
  // TODO: Implement with your email provider (SendGrid, etc.)
  console.log(`📧 Email to ${participantId}: ${subject} - ${message}`);
}

/**
 * Get status of scheduler and pending reminders
 */
async function getSchedulerStatus() {
  try {
    const now = new Date();

    // Count overdue reminders
    const overdueCount = await Request.countDocuments({
      isCompleted: { $ne: true },
      "paymentHistory.nextReminderDate": { $lte: now },
    });

    // Count upcoming reminders (next 24 hours)
    const upcomingCount = await Request.countDocuments({
      isCompleted: { $ne: true },
      "paymentHistory.nextReminderDate": {
        $gt: now,
        $lte: new Date(now.getTime() + 24 * 60 * 60 * 1000),
      },
    });

    // Count total active requests
    const activeRequestsCount = await Request.countDocuments({
      isCompleted: { $ne: true },
    });

    return {
      isRunning: cronJob ? true : false,
      isJobCurrentlyRunning: isJobRunning,
      overdueReminders: overdueCount,
      upcomingReminders: upcomingCount,
      activeRequests: activeRequestsCount,
      lastCheckTime: new Date().toISOString(),
      timezone: process.env.REMINDER_TIMEZONE || "America/New_York",
      scheduledTime: "14:00 (2:00 PM) daily",
    };
  } catch (error) {
    console.error("❌ Error getting scheduler status:", error);
    return {
      error: error.message,
      isRunning: cronJob ? true : false,
      isJobCurrentlyRunning: isJobRunning,
    };
  }
}

module.exports = {
  startScheduler,
  stopScheduler,
  runSchedulerNow,
  processReminders,
  sendReminder,
  //   sendSMS,
  //   sendEmail,
  calculateNextReminderDate,
  getParticipantsNeedingReminders,
  processRequestReminders,
  getSchedulerStatus,
};
