const User = require("../models/User");
const nodemailer = require("nodemailer");
const smsOptInEmailTemplate = require("./smsEmailTemplate");

// Create transporter (configure with your SMTP settings)
const transporter = nodemailer.createTransport({
  service: "gmail", // change to your SMTP provider if needed
  auth: {
    user: process.env.GENERAL_EMAIL_USER,
    pass: process.env.GENERAL_EMAIL_PASS,
  },
});

const calculateNextReminderDate = (nextDueDate, reminderFrequency) => {
  if (!reminderFrequency || reminderFrequency === "none" || !nextDueDate) {
    return null;
  }

  const dueDate = new Date(nextDueDate);

  switch (reminderFrequency) {
    case "daily":
      return new Date(dueDate.getTime() + 24 * 60 * 60 * 1000);
    case "weekly":
      return new Date(dueDate.getTime() + 7 * 24 * 60 * 60 * 1000);
    case "monthly":
      const monthlyDate = new Date(dueDate);
      monthlyDate.setMonth(monthlyDate.getMonth() + 1);
      return monthlyDate;
    default:
      return null;
  }
};

function calculateDueDate(daysFromNow, startDate = new Date()) {
  const dueDate = new Date(startDate);
  dueDate.setDate(dueDate.getDate() + daysFromNow);
  return dueDate;
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

module.exports = {
  calculateNextReminderDate,
  calculateDueDate,
  checkTextMessagePermissions,
  emailNonApprovedParticipants,
};
