// server/routes/stripe.js
const express = require("express");
const router = express.Router();
const {
  createAccount,
  createAccountLink,
  returnAccountStatus,
  webHookHandler,
  payoutAccount,
  createSubscription,
  handleStripeWebHook,
} = require("../controllers/stripeController");
const { protect, authorize } = require("../middleware/auth");

// router.post("/create-account", createAccount);

// router.post("/create-account-link", createAccountLink);
// router.get("/refresh", createAccountLink);

// router.get("/return", returnAccountStatus);
// // special middleware for this route in server file
// router.post("/webhooks", webHookHandler);

// // NEEDS TO BE SET UP
// router.post("/payout", payoutAccount);

// subscriptions:
// POST /api/billing/create-subscription
// body: { planKey: "plaid" | "premium", interval: "monthly" | "annual", currency: "USD" }

router.use(protect);
router.post("/create-subscription", createSubscription);
router.post("/webhooks", handleStripeWebHook);
module.exports = router;
