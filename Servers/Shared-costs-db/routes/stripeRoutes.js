// server/routes/stripe.js
const express = require("express");
const router = express.Router();
const {
  createAccount,
  createAccountLink,
  returnAccountStatus,
  webHookHandler,
  payoutAccount,
} = require("../controllers/stripeController");

router.post("/create-account", createAccount);

router.post("/create-account-link", createAccountLink);
router.get("/refresh", createAccountLink);

router.get("/return", returnAccountStatus);
// special middleware for this route in server file
router.post("/webhooks", webHookHandler);

// NEEDS TO BE SET UP
router.post("/payout", payoutAccount);

module.exports = router;
