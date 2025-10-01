const User = require("../models/User");
const Request = require("../models/Request");
const LOOKBACK_DAYS = 120; // keep simple; tweak if needed
const { encrypt, decrypt } = require("../utils/accessTokenHelpers");

const toISO = (d) => new Date(d).toISOString().slice(0, 10);

const normalizeName = (name = "") =>
  name
    .toLowerCase()
    .replace(/[^\w\s]/g, " ")
    .replace(/\b(inc|llc|co|corp|ltd|the|service|services)\b/g, " ")
    .replace(/\s+/g, " ")
    .trim();

async function fetchAllTransactions(startISO, endISO, accessToken) {
  try {
    const url = "https://sandbox.plaid.com/transactions/get";
    const PAGE_SIZE = 500;
    let all = [];
    let offset = 0;
    let total = null;

    do {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          client_id: process.env.PLAID_CLIENT_ID,
          secret: process.env.PLAID_SECRET,
          access_token: accessToken,
          start_date: startISO,
          end_date: endISO,
          options: {
            count: PAGE_SIZE,
            offset,
            include_personal_finance_category: true,
          },
        }),
      });

      if (!res.ok) {
        const txt = await res.text();
        throw new Error(`Plaid error: ${res.status} ${txt}`);
      }
      const data = await res.json();
      const { transactions = [], total_transactions } = data;

      all.push(...transactions);
      total = total_transactions ?? all.length;
      offset += transactions.length;
    } while (offset < (total ?? 0));

    return all;
  } catch (err) {
    console.error("plaid fetch error for fetchAllTransaction", err);
  }
}

/**
 * Find latest charge that matches request name (simple exact/contains match).
 * Returns { amount, date } or null.
 */
async function getLatestMatchingCharge({
  ownerUserId,
  requestName,
  lookbackDays = LOOKBACK_DAYS,
}) {
  if (!ownerUserId || !requestName) return null;

  const user = await User.findById(ownerUserId).select("plaid.accessToken");
  if (!user?.plaid?.accessToken) return null;
  const accessToken = decrypt(user.plaid.accessToken);

  const endISO = toISO(new Date());
  const startISO = toISO(
    new Date(Date.now() - lookbackDays * 24 * 60 * 60 * 1000)
  );

  const txns = await fetchAllTransactions(startISO, endISO, accessToken);

  const target = normalizeName(requestName);
  if (!target) return null;

  let latest = null;
  for (const t of txns) {
    const key = normalizeName(t.merchant_name || t.name || "");
    if (!key) continue;
    if (key === target || key.includes(target) || target.includes(key)) {
      if (!latest || t.date > latest.date) latest = t;
    }
  }

  return latest ? { amount: Math.abs(latest.amount), date: latest.date } : null;
}

/** Returns a number (override amount) or null */
async function resolveDynamicAmountIfEnabled(requestDocument) {
  if (!requestDocument?.isDynamic) return null;

  const ownerUserId = requestDocument.owner;

  const requestName = requestDocument.name;

  const last = await getLatestMatchingCharge({ ownerUserId, requestName });

  if (!last) {
    throw console.error("error getting latest amount for dynamic cost");
  }
  let updatedDynamicData = {};
  if (requestDocument.splitType == "custom") {
    throw console.error("custom split type not allowed for dynamic costs");
  }
  if (requestDocument.splitType == "percentage") {
    try {
      const updatedParticipants = requestDocument.participants.map(
        (participant, index) => {
          return {
            amount: last?.amount * (participant.percentage / 100),
            ...participant,
          };
        }
      );

      //update request doc with latest cost amount
      const doc = await Request.findByIdAndUpdate(
        requestDocument._id,
        {
          $set: {
            amount: null,
            totalAmount: Number(last?.amount.toFixed(2)),
            participants: updatedParticipants,
          },
        },
        { new: true }
      );

      updatedDynamicData = {
        // newAmount: amountEach,
        // newTotalAmount: last?.amount,
        newParticipants: updatedParticipants,
      };
    } catch (err) {
      console.errror(
        "failed to update request document with new dynamic cost amount",
        err
      );
    }
  } else {
    const amountEach = (
      last?.amount / requestDocument.participants.length
    ).toFixed(2);

    try {
      //update request doc with latest cost amount
      const updatedParticipants = requestDocument.participants.map(
        (participant, index) => {
          return {
            ...participant,
            amount: Number(amountEach),
          };
        }
      );
      const doc = await Request.findByIdAndUpdate(
        requestDocument._id,
        {
          $set: {
            amount: amountEach,
            totalAmount: last?.amount.toFixed(2),
            participants: updatedParticipants,
          },
        },
        { new: true }
      );

      updatedDynamicData = {
        // newAmount: amountEach,
        // newTotalAmount: last?.amount,
        newParticipants: updatedParticipants,
      };
    } catch (err) {
      console.errror(
        "failed to update request document with new dynamic cost amount",
        err
      );
    }
  }

  console.log("DYNAMIC UPDATED WITH:", updatedDynamicData);
  return updatedDynamicData;
}

module.exports = {
  resolveDynamicAmountIfEnabled,
};
