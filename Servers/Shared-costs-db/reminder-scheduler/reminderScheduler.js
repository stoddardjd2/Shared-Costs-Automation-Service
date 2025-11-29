// scheduler/reminderScheduler.js
const cron = require("node-cron");
const mongoose = require("mongoose");
const { ObjectId } = require("mongodb");
const { calculateNextReminderDate } = require("../utils/requestHelpers");
const sendRequestsRouter = require("../send-request-helpers/sendRequestsRouter");
// Import your Request model - adjust path as needed
const Request = require("../models/Request");
const User = require("../models/User");
// Global state
let isJobRunning = false;
let cronJob = null;

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

  // Helpers
  function addDaysUTC(date, days) {
    const d = new Date(date);
    d.setUTCDate(d.getUTCDate() + days);
    return d;
  }

  function addMonthsUTC(date, months) {
    const d = new Date(date);
    const day = d.getUTCDate();
    d.setUTCMonth(d.getUTCMonth() + months);

    // handle month rollover (e.g., Jan 31 -> Feb)
    if (d.getUTCDate() < day) {
      d.setUTCDate(0); // last day of previous month
    }
    return d;
  }

  const freq = request.reminderFrequency || "3days"; // default if missing

  for (let i = 0; i < request.paymentHistory.length; i++) {
    const paymentEntry = request.paymentHistory[i];

    // Ensure counter exists on history entries
    if (typeof paymentEntry.reminderCycleCount !== "number") {
      paymentEntry.reminderCycleCount = 0;
      updatedRequest = true;
    }

    // Frequency = none -> disable reminders for this entry
    if (freq === "none") {
      if (paymentEntry.nextReminderDate) {
        paymentEntry.nextReminderDate = null;
        updatedRequest = true;
      }
      continue;
    }

    // Frequency = once -> if already reminded once, stop
    if (freq === "once" && paymentEntry.reminderCycleCount >= 1) {
      if (paymentEntry.nextReminderDate) {
        paymentEntry.nextReminderDate = null;
        updatedRequest = true;
      }
      continue;
    }

    // Skip if no reminder date set or not yet due
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
      // no one eligible -> disable reminders for this payment entry
      paymentEntry.nextReminderDate = null;
      updatedRequest = true;
      continue;
    }

    let sentAnyThisCycle = false;

    // Send reminders to participants who need them
    for (const participant of participantsToRemind) {
      try {
        const owner = await User.findById(new ObjectId(request.owner));
        const participantInfo = await User.findById(
          new ObjectId(participant.participantId)
        );

        await sendRequestsRouter(
          {
            requestId: request._id,
            requestName: request.name,
            requestOwner: owner.name,
            requestOwnerPaymentMethods: owner?.paymentMethods || {},
            participantId: participant.participantId,
            participantName: participantInfo.name,
            paymentHistoryId: paymentEntry._id,
            stillOwes: participant.stillOwes,
            dueDate: paymentEntry.dueDate,
            requestData: request,
          },
          ["text", "email"],
          true // isReminder
        );

        // Update the participant's reminder status in paymentHistory
        const historyParticipant = paymentEntry.participants.find(
          (p) => p._id.toString() === participant.participantId.toString()
        );

        if (historyParticipant) {
          historyParticipant.reminderSent = true;
          historyParticipant.reminderSentDate = now;
          updatedRequest = true;
        }

        sentAnyThisCycle = true;

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

    // If we sent at least one reminder, increment the cycle count once
    if (sentAnyThisCycle) {
      paymentEntry.reminderCycleCount += 1;
      updatedRequest = true;
    }

    // Update next reminder date or disable based on payment status/frequency
    const isPaid =
      paymentEntry.markedAsPaid &&
      paymentEntry.paymentAmount >= paymentEntry.amount;

    if (!isPaid) {
      if (freq === "once") {
        // we already sent this once-cycle, so stop further reminders
        paymentEntry.nextReminderDate = null;
      } else {
        paymentEntry.nextReminderDate = calculateNextReminderDate(
          now,
          freq,
          request?.createdInTimeZone
        );
      }

      // Reset reminderSent so next cycle can send again if still owes
      // if (paymentEntry.participants?.length) {
      //   for (const p of paymentEntry.participants) {
      //     if (p.stillOwes) {
      //       p.reminderSent = false;
      //     }
      //   }
      // }

      updatedRequest = true;
    } else {
      // Paid -> stop reminders for this entry
      if (paymentEntry.nextReminderDate) {
        paymentEntry.nextReminderDate = null;
        updatedRequest = true;
      }
    }
  }

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
      $and: [
        {
          $or: [
            { isDeleted: { $ne: true } },
            { isDeleted: { $exists: false } },
          ],
        },
        {
          $or: [{ isPaused: { $ne: true } }, { isPaused: { $exists: false } }],
        },
      ],
      "paymentHistory.nextReminderDate": { $lte: now },
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
  getParticipantsNeedingReminders,
  processRequestReminders,
  getSchedulerStatus,
};
