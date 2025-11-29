// cron/recurringRequestsJob.js
const cron = require("node-cron");
const { ObjectId } = require("mongodb");
const Request = require("../models/Request");
const User = require("../models/User");
const sendRequestsRouter = require("../send-request-helpers/sendRequestsRouter");
const { resolveDynamicAmountIfEnabled } = require("./plaidHelper");
const { request } = require("../server");
const {
  calculateDaysFromNow,
  calculateStartingDate,
  createPaymentHistoryEntry,
} = require("../utils/requestHelpers");

const TIMEZONE = process.env.REMINDER_TIMEZONE || "America/Los_Angeles";
const CRON_EXPRESSION = "0 12 * * *"; // 12:00 PM Pacific daily

// ---------- In-memory scheduler telemetry ----------
let schedulerTask = null;
const schedulerMetrics = {
  cronExpression: CRON_EXPRESSION,
  timezone: TIMEZONE,
  isActive: false,
  lastRunStartedAt: null,
  lastRunFinishedAt: null,
  lastRunDurationMs: null,
  lastRunProcessedCount: 0,
  lastRunSentCount: 0,
  lastRunErrors: 0,
  lastErrorMessage: null,
  runsCompleted: 0,
  nextRunScheduledFor: null,
};

// ------------------------ Utility Functions ------------------------

async function handleDynamicCost(requestDocument) {
  if (requestDocument?.isDynamic) {
    console.log("DYNAMIC COST SCHEDULED FOR:", requestDocument.name);
    try {
      const updatedDynamicData = await resolveDynamicAmountIfEnabled(
        requestDocument
      );
      requestDocument.participants = updatedDynamicData.newParticipants;
      console.log(
        "DYNAMIC UPDATE: UPDATED PARCITIPANTS WITH NEW COSTS:",
        requestDocument.participants
      );
      return requestDocument;
    } catch (e) {
      console.error("Dynamic amount (recurring) failed:", e?.message || e);
      throw e;
    }
  }
  return requestDocument;
}

function normalizeStartTiming(startTimingValue) {
  if (!startTimingValue) return null;
  if (typeof startTimingValue === "string") {
    if (startTimingValue.toLowerCase() === "now") return "now";
    const parsedDate = new Date(startTimingValue);
    return Number.isNaN(parsedDate.getTime()) ? null : parsedDate;
  }
  if (startTimingValue instanceof Date) return startTimingValue;
  return null;
}

// DISABLED TIMEZONE
function sameOrAfterDayInTimezone(
  dateA,
  dateB,
  timeZone = TIMEZONE,
  requestDocument
) {
  const formatDateKey = (date) =>
    new Intl.DateTimeFormat("en-CA", {
      // timeZone,
      timeZone: "UTC",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(date);

  return formatDateKey(dateA) >= formatDateKey(dateB);
}

function getIntervalFromFrequency(frequency, customInterval, customUnit) {
  const freq = String(frequency || "")
    .trim()
    .toLowerCase();

  switch (freq) {
    // Custom interval passthrough
    case "custom": {
      const count = Number(customInterval || 0) || 1;
      const unit = customUnit || "days";
      return { count, unit };
    }

    // Day aliases
    case "day":
    case "days":
    case "daily":
      return { count: 1, unit: "days" };

    // Week aliases
    case "week":
    case "weeks":
    case "weekly":
      return { count: 1, unit: "weeks" };

    // Biweekly aliases
    case "biweekly":
    case "bi-weekly":
      return { count: 2, unit: "weeks" };

    // Month aliases
    case "month":
    case "months":
    case "monthly":
      return { count: 1, unit: "months" };

    // Year aliases
    case "year":
    case "years":
    case "yearly":
      return { count: 1, unit: "years" };

    // One-time / none
    case "one-time":
    case "one time":
    case "once":
    case "none":
      return null;

    // Default: 1 week
    default:
      return { count: 1, unit: "months" };
  }
}

function addIntervalToDate(baseDate, intervalCount, intervalUnit) {
  const d = new Date(baseDate); // accepts ISO with +00:00 or Z
  switch (String(intervalUnit).toLowerCase()) {
    case "day":
    case "days":
    case "daily":
      return new Date(d.getTime() + intervalCount * 24 * 60 * 60 * 1000);
    case "week":
    case "weeks":
    case "weekly":
    case "biweekly":
    case "bi-weekly":
      return new Date(d.getTime() + intervalCount * 7 * 24 * 60 * 60 * 1000);
    case "month":
    case "months":
    case "monthly": {
      const m = new Date(d);
      m.setUTCMonth(m.getUTCMonth() + intervalCount);
      return m;
    }
    case "year":
    case "years":
    case "yearly": {
      const y = new Date(d);
      y.setUTCFullYear(y.getUTCFullYear() + intervalCount);
      return y;
    }
    default:
      return new Date(d.getTime() + intervalCount * 24 * 60 * 60 * 1000);
  }
}

function isRequestDue(nextDue, currentDate = new Date()) {
  // If we don't have a next due date, it's not due
  if (!nextDue) return false;

  // Support both Date instances and ISO strings
  const nextDueDate = nextDue instanceof Date ? nextDue : new Date(nextDue);

  if (isNaN(nextDueDate.getTime())) {
    console.error("isRequestDue: invalid nextDue value", nextDue);
    return false;
  }

  const LENIENCY_HOURS = 2;
  const LENIENCY_MS = LENIENCY_HOURS * 60 * 60 * 1000;

  // Allow it to send up to 2 hours *before* the stored nextDue
  return currentDate.getTime() >= nextDueDate.getTime() - LENIENCY_MS;
}

function calculateDueDate(
  requestDate,
  reminderFrequency,
  customInterval,
  customUnit,
  fromTimeZone = "America/Los_Angeles"
) {
  if (!(requestDate instanceof Date) || isNaN(requestDate)) return null;

  const interval = getIntervalFromFrequency(
    reminderFrequency,
    customInterval,
    customUnit
  );
  if (!interval) return null;

  // 1. Interpret requestDate in the given timezone
  const zoned = new Date(
    requestDate.toLocaleString("en-US", { timeZone: fromTimeZone })
  );

  // 2. Strip time -> local midnight for that timezone
  const localBase = new Date(
    zoned.getFullYear(),
    zoned.getMonth(),
    zoned.getDate(),
    0,
    0,
    0,
    0
  );

  // 3. Add the interval in local calendar terms
  const { count, unit } = interval;
  if (!(count > 0)) return null;

  switch (unit) {
    case "days":
      localBase.setDate(localBase.getDate() + count);
      break;
    case "weeks":
      localBase.setDate(localBase.getDate() + count * 7);
      break;
    case "months":
      localBase.setMonth(localBase.getMonth() + count);
      break;
    case "years":
      localBase.setFullYear(localBase.getFullYear() + count);
      break;
    default:
      // If your getIntervalFromFrequency can produce other units,
      // handle them here or return null.
      return null;
  }

  return localBase;
}
// helper: send requests to every participant
async function sendToAllParticipants({
  requestDocument,
  paymentHistoryEntry,
  paymentHistoryId,
  kind = "request", // "initial" | "recurring" (optional, just for log text)
}) {
  for (const participant of requestDocument.participants || []) {
    try {
      await sendPaymentRequestToParticipant({
        request: requestDocument,
        participant,
        paymentHistoryId,
        dueDate: paymentHistoryEntry.dueDate,
      });
    } catch (error) {
      schedulerMetrics.lastRunErrors++;
      console.error(
        `Error sending ${kind} request to participant:`,
        participant?._id,
        error?.message || error
      );
    }
  }
}

// helper: persist history + lastSent/nextDue after a send
async function persistSend({
  requestDocument,
  paymentHistoryEntry,
  currentDate,
  requestNextDueDate,
}) {
  await Request.updateOne(
    { _id: requestDocument._id },
    {
      $push: { paymentHistory: paymentHistoryEntry },
      $set: { lastSent: currentDate, nextDue: requestNextDueDate },
    }
  );
}

/**
 * Create a paymentHistory entry. Accepts an optional presetId so the caller
 * can generate the _id up front and pass it through to notifications.
 */

// ------------------------ Sender ------------------------

/**
 * Sends a reminder to a single participant.
 * Expects paymentHistoryId and dueDate to be passed by the caller so outbound
 * payloads match the stored history entry.
 */
async function sendPaymentRequestToParticipant({
  request,
  participant,
  paymentHistoryId,
  dueDate,
}) {
  try {
    if (!paymentHistoryId) throw new Error("paymentHistoryId is required");

    // 1) Load owner with contacts & payment methods
    const ownerUser = await User.findById(request.owner)
      .select("name paymentMethods contacts")
      .lean();

    // 2) Resolve participant name from owner's contacts (matches your new version)
    const ownerContacts = Array.isArray(ownerUser?.contacts)
      ? ownerUser.contacts
      : [];
    const contactMatch = ownerContacts.find(
      (p) => p._id.toString() === participant._id.toString()
    );

    const participantName = (contactMatch && contactMatch.name) || "Friend";

    // 3) Amounts / still owes
    const participantAmount =
      participant.amount ?? participant.expectedAmount ?? null;
    const paidAmount = participant.paidAmount ?? 0;
    const stillOwes =
      participant.stillOwes ??
      (typeof participantAmount === "number"
        ? Math.max(0, participantAmount - paidAmount)
        : null);

    // 5) Call your existing sender with populated history id
    const success = await sendRequestsRouter({
      requestId: request._id,
      requestName: request.name,
      requestOwner: ownerUser?.name || "Unknown",
      requestOwnerPaymentMethods: ownerUser?.paymentMethods || {},
      participantId: participant._id,
      participantName,
      paymentHistoryId,
      stillOwes,
      dueDate: effectiveDueDate,
      requestData: dueDate,
    });
    return !!success;
  } catch (err) {
    console.error(
      "sendPaymentRequestToParticipant failed:",
      err?.message || err
    );
    return false;
  }
}

// ------------------------ Core Processing ------------------------

async function processRecurringRequestIfDue(
  requestDocument,
  currentDate = new Date()
) {
  const startTimingValue = normalizeStartTiming(requestDocument.startTiming);
  const hasInitialRequestBeenSent = !!requestDocument.lastSent;

  const requestNextDueDate = calculateDueDate(
    currentDate,
    requestDocument.frequency,
    requestDocument?.customInterval,
    requestDocument?.customUnit,
    requestDocument?.createdInTimeZone
  );

  console.log("processing requests for scheduler:", requestDocument.name);

  if (!hasInitialRequestBeenSent) {
    if (startTimingValue && startTimingValue !== "now") {
      // FOR SCHEDULED REQUEST (START TIMING NOT NOW)
      if (
        sameOrAfterDayInTimezone(
          currentDate,
          startTimingValue,
          TIMEZONE,
          requestDocument
        )
      ) {
        // handle dynamic cost
        const updatedRequestDocument = await handleDynamicCost(requestDocument);
        requestDocument = updatedRequestDocument;

        const paymentHistoryId = new ObjectId();
        const paymentHistoryEntry = createPaymentHistoryEntry(
          requestDocument,
          paymentHistoryId
        );

        await sendToAllParticipants({
          requestDocument,
          paymentHistoryEntry,
          paymentHistoryId,
          kind: "initial",
        });

        await persistSend({
          requestDocument,
          paymentHistoryEntry,
          currentDate,
          requestNextDueDate,
        });

        schedulerMetrics.lastRunSentCount++;
        return { sent: true, reason: "initial" };
      }
    }
    return { sent: false, reason: "initial_not_due" };
  } else {
    // Recurring request
    if (
      isRequestDue(
        requestDocument.nextDue,
        // requestDocument.lastSent,
        // requestDocument.frequency,
        // requestDocument.customInterval,
        // requestDocument.customUnit,
        currentDate
      )
    ) {
      console.log("RECURRING REQUEST DUE", requestDocument.name);

      // handle dynamic cost
      const updatedRequestDocument = await handleDynamicCost(requestDocument);
      requestDocument = updatedRequestDocument;

      const paymentHistoryId = new ObjectId();
      const paymentHistoryEntry = createPaymentHistoryEntry(
        requestDocument,
        paymentHistoryId
      );

      await sendToAllParticipants({
        requestDocument,
        paymentHistoryEntry,
        paymentHistoryId,
        kind: "recurring",
      });

      await persistSend({
        requestDocument,
        paymentHistoryEntry,
        currentDate,
        requestNextDueDate,
      });

      schedulerMetrics.lastRunSentCount++;
      return { sent: true, reason: "recurrence" };
    }
  }

  return { sent: false, reason: "not_due" };
}
// ------------------------ Cron Scheduler + Status ------------------------

function _updateNextRun() {
  try {
    if (schedulerTask && typeof schedulerTask.nextDates === "function") {
      const next = schedulerTask.nextDates(); // one occurrence
      schedulerMetrics.nextRunScheduledFor =
        next?.toJSDate?.() || next?.toDate?.() || null;
    } else {
      schedulerMetrics.nextRunScheduledFor = null;
    }
  } catch {
    schedulerMetrics.nextRunScheduledFor = null;
  }
}

function startRecurringRequestsCron() {
  if (schedulerTask) {
    schedulerTask.start();
    schedulerMetrics.isActive = true;
    _updateNextRun();
    return schedulerTask;
  }

  schedulerTask = cron.schedule(
    CRON_EXPRESSION,
    async () => {
      const startedAt = new Date();
      schedulerMetrics.lastRunStartedAt = startedAt;
      schedulerMetrics.lastRunErrors = 0;
      schedulerMetrics.lastRunSentCount = 0;
      schedulerMetrics.lastRunProcessedCount = 0;
      schedulerMetrics.lastErrorMessage = null;

      try {
        const currentDateTime = new Date();
        const activeRecurringRequests = await Request.find({
          isRecurring: true,
          $and: [
            {
              $or: [
                { isPaused: { $ne: true } },
                { isPaused: { $exists: false } },
              ],
            },
            {
              $or: [
                { isDeleted: { $ne: true } },
                { isDeleted: { $exists: false } },
              ],
            },
          ],
        }).lean();
        schedulerMetrics.lastRunProcessedCount = activeRecurringRequests.length;

        for (const recurringRequest of activeRecurringRequests) {
          try {
            await processRecurringRequestIfDue(
              recurringRequest,
              currentDateTime
            );
          } catch (error) {
            schedulerMetrics.lastRunErrors++;
            schedulerMetrics.lastErrorMessage = error?.message || String(error);
            console.error(
              "Error processing recurring request:",
              recurringRequest?._id?.toString(),
              error?.message || error
            );
          }
        }
      } catch (error) {
        schedulerMetrics.lastRunErrors++;
        schedulerMetrics.lastErrorMessage = error?.message || String(error);
        console.error(
          "Error fetching recurring requests:",
          error?.message || error
        );
      } finally {
        const finishedAt = new Date();
        schedulerMetrics.lastRunFinishedAt = finishedAt;
        schedulerMetrics.lastRunDurationMs = finishedAt - startedAt;
        schedulerMetrics.runsCompleted += 1;
        _updateNextRun();
      }
    },
    { timezone: TIMEZONE }
  );

  schedulerTask.start();
  schedulerMetrics.isActive = true;
  _updateNextRun();
  return schedulerTask;
}

// Controls
function stopRecurringRequestsCron() {
  if (schedulerTask) {
    schedulerTask.stop();
    schedulerMetrics.isActive = false;
    _updateNextRun();
  }
}

function restartRecurringRequestsCron() {
  if (schedulerTask) schedulerTask.stop();
  schedulerMetrics.isActive = false;
  _updateNextRun();
  return startRecurringRequestsCron();
}

// Status getter
function getRequestSchedulerStatus() {
  return {
    isActive: schedulerMetrics.isActive,
    cronExpression: schedulerMetrics.cronExpression,
    timezone: schedulerMetrics.timezone,
    nextRunScheduledFor: schedulerMetrics.nextRunScheduledFor,
    lastRunStartedAt: schedulerMetrics.lastRunStartedAt,
    lastRunFinishedAt: schedulerMetrics.lastRunFinishedAt,
    lastRunDurationMs: schedulerMetrics.lastRunDurationMs,
    lastRunProcessedCount: schedulerMetrics.lastRunProcessedCount,
    lastRunSentCount: schedulerMetrics.lastRunSentCount,
    lastRunErrors: schedulerMetrics.lastRunErrors,
    lastErrorMessage: schedulerMetrics.lastErrorMessage,
    runsCompleted: schedulerMetrics.runsCompleted,
  };
}

async function runRecurringRequestsNow() {
  const startedAt = new Date();
  schedulerMetrics.lastRunStartedAt = startedAt;
  schedulerMetrics.lastRunErrors = 0;
  schedulerMetrics.lastRunSentCount = 0;
  schedulerMetrics.lastRunProcessedCount = 0;
  schedulerMetrics.lastErrorMessage = null;

  try {
    const currentDateTime = new Date();
    const activeRecurringRequests = await Request.find({
      isRecurring: true,
      $and: [
        {
          $or: [{ isPaused: { $ne: true } }, { isPaused: { $exists: false } }],
        },
        {
          $or: [
            { isDeleted: { $ne: true } },
            { isDeleted: { $exists: false } },
          ],
        },
      ],
    }).lean();
    schedulerMetrics.lastRunProcessedCount = activeRecurringRequests.length;

    for (const recurringRequest of activeRecurringRequests) {
      try {
        await processRecurringRequestIfDue(recurringRequest, currentDateTime);
      } catch (error) {
        schedulerMetrics.lastRunErrors++;
        schedulerMetrics.lastErrorMessage = error?.message || String(error);
        console.error(
          "Error processing recurring request:",
          recurringRequest?._id?.toString(),
          error?.message || error
        );
      }
    }
  } catch (error) {
    schedulerMetrics.lastRunErrors++;
    schedulerMetrics.lastErrorMessage = error?.message || String(error);
    console.error(
      "Error fetching recurring requests:",
      error?.message || error
    );
  } finally {
    const finishedAt = new Date();
    schedulerMetrics.lastRunFinishedAt = finishedAt;
    schedulerMetrics.lastRunDurationMs = finishedAt - startedAt;
    schedulerMetrics.runsCompleted += 1;
    _updateNextRun();
  }

  return getRequestSchedulerStatus();
}

module.exports = {
  startRecurringRequestsCron,
  stopRecurringRequestsCron,
  restartRecurringRequestsCron,
  getRequestSchedulerStatus,
  runRecurringRequestsNow,
};
