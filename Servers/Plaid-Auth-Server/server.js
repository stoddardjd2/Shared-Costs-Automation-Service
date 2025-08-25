const express = require("express");
const cors = require("cors");
const {
  Configuration,
  PlaidApi,
  PlaidEnvironments,
} = require("plaid");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3001;

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

// Middleware
app.use(cors());
app.use(express.json());

app.post("/api/sandbox/create_link_token", async (req, res) => {
  console.log("create link token")
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
});

app.post("/api/sandbox/public_token", async (req, res) => {
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
});

// Simple route to exchange public token for access token
app.post("/api/exchange", async (req, res) => {
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
});

// Simple route to refresh transactions
app.post("/api/transactions/refresh", async (req, res) => {
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
});

// Simple route to get transactions
app.post("/api/transactions", async (req, res) => {
  try {
    const { access_token, start_date, end_date } = req.body;

    const response = await fetch("https://sandbox.plaid.com/transactions/get", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        client_id: "686ee94862386b0024d2cbcd",
        secret: "c18250107468c87adf2934e95d0358",
        access_token: access_token,
        start_date: start_date || "2025-06-01",
        end_date: end_date || "2025-07-09",
      }),
    });

    console.log("Fetching transactions with access token:", access_token);
    const data = await response.json();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(3001, () => {
  console.log("Server running on port 3001");
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: "Route not found",
    path: req.originalUrl,
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Plaid server running on port ${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || "development"}`);
  console.log(`🔗 Health check: http://localhost:${PORT}/health`);
});
