const User = require("../models/User");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const { ObjectId } = require("mongodb");
const { Configuration, PlaidApi, PlaidEnvironments } = require("plaid");
const { encrypt, decrypt } = require ("../utils/accessTokenHelpers");
require("dotenv").config();

/** Initialize Plaid client */
const config = new Configuration({
  basePath: PlaidEnvironments[process.env.PLAID_ENV || "sandbox"],
  baseOptions: {
    headers: {
      "PLAID-CLIENT-ID": process.env.PLAID_CLIENT_ID,
      "PLAID-SECRET": process.env.PLAID_SECRET,
    },
  },
});
const plaid = new PlaidApi(config);




const createLinkToken = async (req, res) => {
  console.log("create link token");
  try {
    const body = req.body || {};
    const fallbackId =
      (crypto.randomUUID && crypto.randomUUID()) ||
      `${Date.now()}-${Math.random().toString(16).slice(2)}`;

    const client_user_id =
      body.userId ||
      (req.user && (req.user.id || req.user._id)) ||
      `demo-${fallbackId}`;

    const request = {
      user: { client_user_id },
      client_name: "Sandbox Connect",
      products: ["transactions"], // add more if needed: "auth", "identity", etc.
      country_codes: ["US"],
      language: "en",
      // Optional fields below; include only if set
      // redirect_uri must be registered in Plaid dashboard when used
    };

    if (process.env.PLAID_REDIRECT_URI) {
      request.redirect_uri = process.env.PLAID_REDIRECT_URI;
    }

    const response = await plaid.linkTokenCreate(request);
    return res.json({ link_token: response.data.link_token });
  } catch (err) {
    // Normalize Plaid errors for the frontend
    const p = err?.response?.data;
    console.error("create_link_token error:", p || err.message || err);
    return res.status(500).json({
      error: {
        message: p?.error_message || "Failed to create link token",
        type: p?.error_type || "INTERNAL",
        code: p?.error_code || "LINK_TOKEN_CREATE_FAILED",
      },
    });
  }
};

const createPublicToken = async (req, res) => {
  try {
    const response = await fetch(
      "https://sandbox.plaid.com/sandbox/public_token/create",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          client_id: "686ee94862386b0024d2cbcd",
          secret: "c18250107468c87adf2934e95d0358",
          institution_id: "ins_109508",
          initial_products: ["transactions"],
        }),
      }
    );
    const data = await response.json();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const exchangePublicToken = async (req, res) => {
  try {
    const { public_token } = req.body;

    const response = await fetch(
      "https://sandbox.plaid.com/item/public_token/exchange",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          client_id: "686ee94862386b0024d2cbcd",
          secret: "c18250107468c87adf2934e95d0358",
          public_token: public_token,
        }),
      }
    );

    const data = await response.json();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const refreshTransactions = async (req, res) => {
  try {
    const { access_token } = req.body;

    const response = await fetch(
      "https://sandbox.plaid.com/transactions/refresh",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          client_id: "686ee94862386b0024d2cbcd",
          secret: "c18250107468c87adf2934e95d0358",
          access_token: access_token,
        }),
      }
    );

    console.log("Fetching transactions with access token:", access_token);
    const data = await response.json();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// const getTransactions = async (req, res) => {
//   try {
//     const { start_date, end_date } = req.body;
//     const userId = req.user._id;

//     const user = await User.findById(userId).select("plaid.accessToken");
//     const rawAccessToken = decrypt(user.plaid.accessToken);

//     const response = await fetch("https://sandbox.plaid.com/transactions/get", {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify({
//         client_id: "686ee94862386b0024d2cbcd",
//         secret: "c18250107468c87adf2934e95d0358",
//         access_token: rawAccessToken,
//         start_date: start_date || "2025-06-01",
//         end_date: end_date || "2025-07-09",
//       }),
//     });

//     console.log("Fetching transactions with access token:", rawAccessToken);
//     const data = await response.json();
//     res.json(data);
//   } catch (error) {
//     console.log(error);
//     res.status(500).json({ error: error.message });
//   }
// };

// Controller: getTransactions
// - Infers recurring frequency per merchant/account (24-month lookback)
// - For each group, computes nextExpectedChargeDate (next date AFTER today)
// - Returns ONLY the requested range, enriched with { billingFrequency, nextExpectedChargeDate }

const getTransactions = async (req, res) => {
  try {
    const { start_date, end_date } = req.body;
    const userId = req.user._id;

    // 1) Access token
    const user = await User.findById(userId).select("plaid.accessToken");
    const rawAccessToken = decrypt(user.plaid.accessToken);

    // ---------- Helpers ----------
    const toISO = (d) => new Date(d).toISOString().slice(0, 10);
    const daysBetween = (a, b) =>
      Math.round(
        (new Date(b).getTime() - new Date(a).getTime()) / (1000 * 60 * 60 * 24)
      );

    const normalizeName = (name = "") =>
      name
        .toLowerCase()
        .replace(/[^\w\s]/g, " ")
        .replace(/\b(inc|llc|co|corp|ltd)\b/g, " ")
        .replace(/\s+/g, " ")
        .trim();

    const getTxnTime = (t) => {
      // prefer precise datetimes if Plaid provides them; fall back to posted date
      const iso =
        t.authorized_datetime ||
        t.datetime ||
        (t.date ? `${t.date}T00:00:00Z` : "1970-01-01T00:00:00Z");
      return new Date(iso).getTime();
    };

    const median = (arr) => {
      if (!arr.length) return null;
      const a = [...arr].sort((x, y) => x - y);
      const mid = Math.floor(a.length / 2);
      return a.length % 2 ? a[mid] : (a[mid - 1] + a[mid]) / 2;
    };

    const classifyIntervalDays = (d) => {
      if (d == null || !isFinite(d)) return "unknown";
      const targets = [
        { days: 1, label: "daily" },
        { days: 7, label: "weekly" },
        { days: 14, label: "biweekly" },
        { days: 30, label: "monthly" },
        // { days: 90, label: "quarterly" },
        // { days: 182, label: "semiannual" },
        { days: 365, label: "yearly" },
      ];
      let best = { label: "irregular", diff: Infinity };
      for (const t of targets) {
        const diff = Math.abs(d - t.days);
        if (diff < best.diff) best = { label: t.label, diff };
      }
      return best.diff > 5 ? "irregular" : best.label;
    };

    const inferFrequencyFromDates = (isoDates) => {
      if (!isoDates || isoDates.length < 3)
        return { label: "unknown", medianGap: null };
      const sorted = [...new Set(isoDates)].sort();
      if (sorted.length < 3) return { label: "unknown", medianGap: null };

      const gaps = [];
      for (let i = 1; i < sorted.length; i++) {
        const d = daysBetween(sorted[i - 1], sorted[i]);
        if (d > 0) gaps.push(d);
      }
      if (gaps.length < 2) return { label: "unknown", medianGap: null };

      const m = median(gaps);
      return { label: classifyIntervalDays(m), medianGap: m };
    };

    // Date arithmetic (UTC-safe, clamped for month lengths)
    const addDaysISO = (iso, n) => {
      const d = new Date(iso + "T00:00:00Z");
      d.setUTCDate(d.getUTCDate() + n);
      return d.toISOString().slice(0, 10);
    };

    const addMonthsClampedISO = (iso, months) => {
      const d = new Date(iso + "T00:00:00Z");
      const year = d.getUTCFullYear();
      const month = d.getUTCMonth();
      const day = d.getUTCDate();

      const targetMonthIndex = month + months;
      const targetYear = year + Math.floor(targetMonthIndex / 12);
      const targetMonth = ((targetMonthIndex % 12) + 12) % 12;
      const daysInTarget = new Date(
        Date.UTC(targetYear, targetMonth + 1, 0)
      ).getUTCDate();
      const clampedDay = Math.min(day, daysInTarget);

      const nd = new Date(Date.UTC(targetYear, targetMonth, clampedDay));
      return nd.toISOString().slice(0, 10);
    };

    const rollForwardISO = (lastISO, stepFn, stepArg, todayISO) => {
      let nextISO = stepFn(lastISO, stepArg);
      while (nextISO <= todayISO) {
        lastISO = nextISO;
        nextISO = stepFn(lastISO, stepArg);
      }
      return nextISO; // strictly after today
    };

    const nextExpectedFrom = (lastISO, freqLabel, medianGap, todayISO) => {
      if (!lastISO) return null;
      switch (freqLabel) {
        case "daily":
          return rollForwardISO(lastISO, addDaysISO, 1, todayISO);
        case "weekly":
          return rollForwardISO(lastISO, addDaysISO, 7, todayISO);
        case "biweekly":
          return rollForwardISO(lastISO, addDaysISO, 14, todayISO);
        case "monthly":
          return rollForwardISO(lastISO, addMonthsClampedISO, 1, todayISO);
        // case "quarterly":
        //   return rollForwardISO(lastISO, addMonthsClampedISO, 3, todayISO);
        // case "semiannual":
        //   return rollForwardISO(lastISO, addMonthsClampedISO, 6, todayISO);
        case "yearly":
          return rollForwardISO(lastISO, addMonthsClampedISO, 12, todayISO);
        case "irregular":
          if (medianGap && isFinite(medianGap) && medianGap > 0) {
            return rollForwardISO(
              lastISO,
              addDaysISO,
              Math.round(medianGap),
              todayISO
            );
          }
          return null;
        default:
          return null;
      }
    };

    // Fetch all transactions with pagination
    const fetchAllTransactions = async (startISO, endISO, accessToken) => {
      const PLAID_URL = "https://sandbox.plaid.com/transactions/get";
      const PAGE_SIZE = 500;
      let all = [];
      let offset = 0;
      let total = null;

      while (total === null || offset < total) {
        const res = await fetch(PLAID_URL, {
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
          const e = await res.text();
          throw new Error(`Plaid error: ${e}`);
        }
        const data = await res.json();
        const { transactions = [], total_transactions } = data;
        all = all.concat(transactions);
        total = total_transactions ?? transactions.length;
        offset += transactions.length;
        if (!transactions.length) break;
      }
      return all;
    };

    // ---------- 2) Compute windows ----------
    const endISO = toISO(end_date || new Date());
    const startISO = toISO(
      start_date || new Date(new Date().setMonth(new Date().getMonth() - 1))
    );

    const lookbackEnd = endISO;
    const lookbackStart = toISO(
      new Date(
        new Date(lookbackEnd).setMonth(new Date(lookbackEnd).getMonth() - 24)
      )
    );

    const todayISO = toISO(new Date());

    // ---------- 3) Pull 24-month history to infer cadence ----------
    const historyTxns = await fetchAllTransactions(
      lookbackStart,
      lookbackEnd,
      rawAccessToken
    );

    // Group by (normalized merchant name + account_id)
    const groups = new Map(); // key -> { dates: Set<string> }
    for (const t of historyTxns) {
      const name = normalizeName(t.merchant_name || t.name || "");
      const key = `${name}|${t.account_id}`;
      if (!groups.has(key)) groups.set(key, { dates: new Set() });
      groups.get(key).dates.add(t.date);
    }

    // Precompute per-group { frequency, medianGap, lastDate, nextExpectedChargeDate }
    const groupInfo = new Map();
    for (const [key, { dates }] of groups.entries()) {
      const dateList = [...dates].sort();
      const lastDate = dateList[dateList.length - 1] || null;
      const { label, medianGap } = inferFrequencyFromDates(dateList);
      const nextExpectedChargeDate = nextExpectedFrom(
        lastDate,
        label,
        medianGap,
        todayISO
      );
      groupInfo.set(key, {
        billingFrequency: label,
        medianGapDays: medianGap,
        lastDate,
        nextExpectedChargeDate,
      });
    }

    // ---------- 4) Pull ONLY the requested range ----------
    const rangeTxns = await fetchAllTransactions(
      startISO,
      endISO,
      rawAccessToken
    );

    // ---------- 5) Enrich ----------
    const enriched = rangeTxns.map((t) => {
      const name = normalizeName(t.merchant_name || t.name || "");
      const key = `${name}|${t.account_id}`;
      const info = groupInfo.get(key);
      return {
        ...t,
        billingFrequency: info?.billingFrequency || "unknown",
        nextExpectedChargeDate: info?.nextExpectedChargeDate || null,
        _normKey: key, // internal for dedupe
      };
    });

    // ---------- 6) Dedupe by (normalized name + account_id) -> keep latest only ----------
    const latestByKey = new Map();
    for (const t of enriched) {
      const prev = latestByKey.get(t._normKey);
      if (!prev || getTxnTime(t) > getTxnTime(prev)) {
        latestByKey.set(t._normKey, t);
      }
    }

    // optional: sort newest first
    const dedupedLatest = Array.from(latestByKey.values()).sort(
      (a, b) => getTxnTime(b) - getTxnTime(a)
    );

    // strip internal field
    const result = dedupedLatest.map(({ _normKey, ...rest }) => rest);

    res.json({
      transactions: result,
      start_date: startISO,
      end_date: endISO,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

const savePlaidAccessToken = async (req, res) => {
  try {
    const userId = req.user.id;
    const rawToken = (req.body.accessToken || "").trim();

    if (!userId) {
      return res.status(400).json({ error: "Missing userId" });
    }
    if (!rawToken) {
      return res.status(400).json({ error: "Missing accessToken" });
    }

    // // read current enabledOn so we don't reset it if already set
    // const existing = await User.findById(userId).select("plaid.enabledOn");
    // if (!existing) {
    //   return res.status(404).json({ error: "User not found" });
    // }

    const now = new Date();
    const encrypted = encrypt(rawToken);

    const update = {
      "plaid.isEnabled": true,
      "plaid.lastUsed": now,
      "plaid.enabledOn": now,
      "plaid.accessToken": encrypted,
    };

    const updated = await User.findByIdAndUpdate(
      userId,
      { $set: update },
      { new: true }
    ).select("-plaid.accessToken"); // never return the token

    return res.json({
      userId: updated._id,
      success: true,
      plaid: {
        isEnabled: updated.plaid?.isEnabled ?? true,
        enabledOn: updated.plaid?.enabledOn,
        lastUsed: updated.plaid?.lastUsed,
      },
      // omit accessToken by design
    });
  } catch (err) {
    console.error("addPlaidAccessToken error:", err);
    return res.status(500).json({ error: "Failed to save Plaid access token" });
  }
};



module.exports = {
  getTransactions,
  refreshTransactions,
  exchangePublicToken,
  createPublicToken,
  createLinkToken,
  savePlaidAccessToken,
};
