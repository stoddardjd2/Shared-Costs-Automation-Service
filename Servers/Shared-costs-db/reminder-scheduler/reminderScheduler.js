// scheduler/reminderScheduler.js
const cron = require("node-cron");
const mongoose = require("mongoose");
const { ObjectId } = require("mongodb");
const sendRequestsRouter = require("../send-request-helpers/sendRequestsRouter");
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
      next.setUTCDate(next.getUTCDate() + 1);
      break;
    case "weekly":
      next.setUTCDate(next.getUTCDate() + 7);
      break;
    case "biweekly":
      next.setUTCDate(next.getUTCDate() + 14);
      break;
    case "monthly":
      next.setUTCMonth(next.getUTCMonth() + 1);
      break;
    case "yearly":
      next.setUTCFullYear(next.getUTCFullYear() + 1);
      break;
    default:
      // If frequency is a number, treat as days
      const days = parseInt(frequency, 10);
      if (!isNaN(days)) {
        next.setUTCDate(next.getUTCDate() + days);
      } else {
        // Default to weekly if frequency is unknown
        next.setUTCDate(next.getUTCDate() + 7);
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

      // Send reminder if they haven't paid enough and if not marked as paid
      if (paidAmount < expectedAmount && !historyParticipant?.markedAsPaid) {
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
 * Process reminders for a single request
 */
async function processRequestReminders(request) {
  const now = new Date();
  let updatedRequest = false;
  for (let i = 0; i < request.paymentHistory.length; i++) {
    const paymentEntry = request.paymentHistory[i];
  
    // // Skip if no reminder date set or not yet due
    if (!paymentEntry.nextReminderDate || paymentEntry.nextReminderDate > now) {
      continue;
    }

    // Get participants who need reminders
    const participantsToRemind = getParticipantsNeedingReminders(
      paymentEntry,
      request.participants
    );

    console.log("TO REMIND:", participantsToRemind);

    if (participantsToRemind.length === 0) {
      // disable reminders for payment entry if no one eligible
      paymentEntry.nextReminderDate = null;
      updatedRequest = true;

      // No one needs reminders, but still update next reminder date for recurring requests
      // if (request.isRecurring) {
      //   paymentEntry.nextReminderDate = calculateNextReminderDate(
      //     now,
      //     request.reminderFrequency
      //   );
      //   updatedRequest = true;
      // }
      continue;
    }

    // Send reminders to participants who need them
    for (const participant of participantsToRemind) {
      try {
        // Get request's owner info
        const owner = await User.findById(new ObjectId(request.owner));

        // Get participant name from User collection
        const partcipantInfo = await User.findById(
          new ObjectId(participant.participantId)
        );

        await sendRequestsRouter({
          requestId: request._id,
          requestName: request.name,
          requestOwner: owner.name,
          requestOwnerPaymentMethods: owner?.paymentMethods || {},
          participantId: participant.participantId,
          participantName: partcipantInfo.name,
          paymentHistoryId: paymentEntry._id,
          // expectedAmount: participant.expectedAmount,
          // paidAmount: participant.paidAmount,
          stillOwes: participant.stillOwes,
          dueDate: paymentEntry.dueDate,
          requestData: request,
        });

        // Update the participant's reminder status in paymentHistory
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

    // Update next reminder date or mark as complete
    if (request.isRecurring) {
      paymentEntry.nextReminderDate = calculateNextReminderDate(
        now,
        request.reminderFrequency
      );
      updatedRequest = true;
    } else {
      request.isCompleted = true;
      paymentEntry.nextReminderDate = null;
      updatedRequest = true;
      console.log(`📝 One-time request "${request.name}" marked as completed`);
    }
  }

  // Save changes if needed
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
    // Skip if no reminder date set or not yet due
    // Skip if paused or delete
    const requests = await Request.find({
      isDelete: { $ne: true }, // Not deleted,
      iPaused: { $ne: true }, // Not paused,
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
function startReminderScheduler() {
  // Run every day at 2 PM (14:00)
  cronJob = cron.schedule(
    "0 14 * * *",
    () => {
      processReminders();
    },
    {
      timezone: "America/Los_Angeles", // Adjust to your server timezone
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
  startReminderScheduler,
  stopScheduler,
  runSchedulerNow,
  processReminders,
  //   sendSMS,
  //   sendEmail,
  calculateNextReminderDate,
  getParticipantsNeedingReminders,
  processRequestReminders,
  getSchedulerStatus,
};
