const User = require("../models/User");
const nodemailer = require("nodemailer");
const smsOptInEmailTemplate = require("./smsEmailTemplate");
const { ObjectId } = require("mongodb");

// Create transporter (configure with your SMTP settings)
const transporter = nodemailer.createTransport({
  service: "gmail", // change to your SMTP provider if needed
  auth: {
    user: process.env.GENERAL_EMAIL_USER,
    pass: process.env.GENERAL_EMAIL_PASS,
  },
  maxConnections: 2, // keep low for Gmail/Workspace
  maxMessages: 50, // per connection
  rateDelta: 60_000, // window (ms)
  rateLimit: 80, // messages per window (tune to your quota)
  socketTimeout: 30_000,
  logger: true, // enable for debugging
  debug: false,
});

// function calculateDueDate(daysFromNow, startDate = new Date()) {
//   const dueDate = new Date(startDate);
//   dueDate.setDate(dueDate.getDate() + daysFromNow);
//   return dueDate;
// }

function calculateDaysFromNow(
  daysFromNow,
  startDate = new Date(),
  targetHourPST = 10
) {
  if (!(startDate instanceof Date) || isNaN(startDate)) return null;

  const days = Number(daysFromNow || 0);
  if (!Number.isFinite(days)) return null;

  // 1. Interpret startDate in America/Los_Angeles local time
  const pacificNow = new Date(
    startDate.toLocaleString("en-US", { timeZone: "America/Los_Angeles" })
  );

  // 2. Use the Pacific *calendar day* (midnight)
  const pacificDate = new Date(
    pacificNow.getFullYear(),
    pacificNow.getMonth(),
    pacificNow.getDate(),
    0,
    0,
    0,
    0
  );

  // 3. Add days in Pacific calendar terms
  pacificDate.setDate(pacificDate.getDate() + days);

  // 4. Snap to 10:00 AM PST (or targetHourPST)
  pacificDate.setHours(targetHourPST, 0, 0, 0);

  // 5. Convert that Pacific wall-clock time → UTC Date
  const utcString = pacificDate.toLocaleString("en-US", { timeZone: "UTC" });
  const utcDate = new Date(utcString);

  return utcDate;
}

async function checkTextMessagePermissions(participants) {
  const ids = participants.map((p) => p._id);
  const users = await User.find(
    { _id: { $in: ids } },
    { "textMessagesAllowed.isAllowed": 1 }
  ).lean();

  const map = new Map(
    users.map((u) => [u._id.toString(), !!u.textMessagesAllowed?.isAllowed])
  );
  return participants.map((p) => ({
    ...p,
    canText: map.get(String(p._id)) || false,
  }));
}

function calculateStartingDate(startTiming) {
  // request date represents when first request should be sent
  if (startTiming == "now") {
    return new Date();
  } else {
    return new Date(startTiming);
  }
}

function createPaymentHistoryEntry(
  requestData,
  paymentHistoryObjId = new ObjectId()
) {
  const initialHistory = {
    requestDate: new Date(),
    dueDate: calculateDaysFromNow(requestData.dueInDays),
    amount: requestData.amount,
    totalAmount: requestData.totalAmount,
    totalAmountOwed: requestData.totalAmountOwed,
    nextReminderDate: calculateNextReminderDate(
      calculateStartingDate(requestData.startTiming),
      requestData.reminderFrequency
    ), // Reminders start on due date
    _id: paymentHistoryObjId,
    // status: "pending",
    participants: (requestData.participants || []).map((participant) => ({
      reminderSent: false,
      reminderSentDate: null,
      paymentAmount: null,
      paidDate: null,
      requestSentDate: new Date(),
      amount: participant.amount,
      _id: new ObjectId(participant._id),
    })),
  };
  return initialHistory;
}

/**
 * Send email to all participants who are NOT approved for text messages.
 * Always fetches emails from DB.
 **/
async function emailNonApprovedParticipants(
  annotatedParticipants,
  requesterId,
  requesterName,
  requestData
) {
  // ONLY ALLOW EMAIL FOR OPT-IN EVERY 1 DAY TO PREVENT SPAM
  const DAY_MS = 1 * 24 * 60 * 60 * 1000;
  // const DAY_MS = 1;
  const requesterKey = String(requesterId);

  const targets = annotatedParticipants.filter((p) => !p.canText);
  if (!targets.length)
    return {
      sent: [],
      throttled: [],
      skipped: [],
      failed: [],
      updateFailed: [],
    };

  const ids = targets.map((t) => t._id);
  const users = await User.find(
    { _id: { $in: ids } },
    {
      email: 1,
      name: 1,
      "textMessagesAllowed.approval.byRequester": 1,
    }
  ).lean();

  const byId = new Map(users.map((u) => [u._id.toString(), u]));
  const validEmail = (e) => typeof e === "string" && /\S+@\S+\.\S+/.test(e);

  const now = Date.now();

  const candidates = targets.map((t) => {
    const u = byId.get(String(t._id)) || {};
    const byRequester = u.textMessagesAllowed?.approval?.byRequester || {};
    const r = byRequester[requesterKey] || byRequester.get?.(requesterKey); // Map or plain obj
    const lastSentAt = r?.lastSentAt || null;

    console.log("t", t);
    return {
      _id: t._id,
      email: t.email,
      name: t.name || "Participant",
      lastSentAt,
      amount: t.amount,
    };
  });

  const withValidEmail = candidates.filter((c) => validEmail(c.email));
  const skipped = candidates
    .filter((c) => !validEmail(c.email))
    .map((c) => String(c._id));

  const eligible = withValidEmail.filter(
    (c) => !c.lastSentAt || now - new Date(c.lastSentAt).getTime() >= DAY_MS
  );
  const throttled = withValidEmail
    .filter(
      (c) => c.lastSentAt && now - new Date(c.lastSentAt).getTime() < DAY_MS
    )
    .map((c) => c.email.toLowerCase());

  const sent = [];
  const failed = [];
  const updateFailed = [];
  const toUpdate = [];

  for (const c of eligible) {
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
    // create custom url for each message
    const urlBase = `${process.env.CLIENT_URL}/smsoptin`;
    const userId = c._id;
    const name = c.name;
    const amount = c.amount;
    const frequency = getFrequency(requestData);
    const requester = requesterName;
    const chargeName = requestData?.name;

    const url = new URL(urlBase);
    url.searchParams.set("userId", userId);
    url.searchParams.set("name", name);
    url.searchParams.set("amount", amount);
    url.searchParams.set("frequency", frequency);
    url.searchParams.set("requester", requester);
    url.searchParams.set("chargeName", chargeName);

    const finalUrl = url.toString();

    try {
      await transporter.sendMail({
        from: process.env.DEFAULT_FROM_EMAIL,
        to: c.email,
        subject: "Consent Needed for Text Message Reminders",
        text:
          `Hi ${c.name},\n\n` +
          `${requesterName} would like to send you payment reminders by text message, ` +
          `but we don't have your consent on file.\n` +
          `Please go to ${finalUrl} to opt in.\n\n` +
          `Thank you,\nSplitify`,
        html: smsOptInEmailTemplate
          .replace(/\{\{senderName\}\}/g, requesterName)
          .replace(/\{\{receiverName\}\}/g, c.name)
          .replace(/\{\{optInUrl\}\}/g, finalUrl),
      });
      sent.push(c.email.toLowerCase());
      toUpdate.push({ _id: c._id });
    } catch (err) {
      failed.push({
        email: c.email.toLowerCase(),
        reason: err.message || "Unknown error",
      });
    }
  }

  // Bulk update per-sender nodes + global flags
  if (toUpdate.length) {
    const nowDate = new Date();
    try {
      await User.bulkWrite(
        toUpdate.map((s) => {
          const base = "textMessagesAllowed.approval";
          return {
            updateOne: {
              filter: { _id: s._id },
              update: {
                $set: {
                  [`${base}.isSent`]: true, // global: someone has asked
                  [`${base}.lastSentAt`]: nowDate, // optional global last
                  [`${base}.byRequester.${requesterKey}.lastSentAt`]: nowDate, // per-sender
                },
                $inc: {
                  [`${base}.count`]: 1, // optional global count
                  [`${base}.byRequester.${requesterKey}.count`]: 1, // per-sender count
                },
              },
            },
          };
        }),
        { ordered: false }
      );
    } catch (e) {
      updateFailed.push({
        userId: "bulk",
        reason: e.message || "Bulk update error",
      });
    }
  }

  return { sent, throttled, skipped, failed, updateFailed };
}

// freq: "daily" | "3days" | "weekly" | "monthly" | "none"
// fromDate: Date in UTC
// targetHourPST: wall-clock time in PST you want (default 12:00)
function calculateNextReminderDate(fromDate, freq, targetHourPST = 12) {
  if (!(fromDate instanceof Date) || isNaN(fromDate)) return null;

  // 1. Interpret `fromDate` in America/Los_Angeles local time
  const pacificNow = new Date(
    fromDate.toLocaleString("en-US", { timeZone: "America/Los_Angeles" })
  );

  // 2. Decide how many *Pacific* days to add
  let daysToAdd;
  switch (freq) {
    case "daily":
      daysToAdd = 1;
      break;
    case "3days":
      daysToAdd = 3;
      break;
    case "weekly":
      daysToAdd = 7;
      break;
    case "monthly":
      // For monthly, add 1 month in Pacific terms:
      pacificNow.setMonth(pacificNow.getMonth() + 1);
      daysToAdd = 0;
      break;
    default:
      return null; // "none" or unknown
  }

  if (daysToAdd) {
    pacificNow.setDate(pacificNow.getDate() + daysToAdd);
  }

  // 3. Snap to targetHourPST on that Pacific date
  pacificNow.setHours(targetHourPST, 0, 0, 0);

  // 4. Convert that exact Pacific time → UTC
  const utcString = pacificNow.toLocaleString("en-US", { timeZone: "UTC" });
  const utcDate = new Date(utcString);

  return utcDate;
}

module.exports = {
  calculateNextReminderDate,
  calculateDaysFromNow,
  checkTextMessagePermissions,
  emailNonApprovedParticipants,
  calculateStartingDate,
  createPaymentHistoryEntry,
};
