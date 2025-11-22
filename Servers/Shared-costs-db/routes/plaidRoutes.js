// server/routes/stripe.js
const express = require("express");
const router = express.Router();
const {
  getTransactions,
  refreshTransactions,
  exchangePublicToken,
  createPublicToken,
  createLinkToken,
  savePlaidAccessToken,
  webhook,
} = require("../controllers/plaidController");
const { protect, authorizePlan } = require("../middleware/auth");

router.use(protect); // require user to be logged in
router.use(authorizePlan("premium", "professional")); //require plan

router.post("/create_link_token", createLinkToken);
router.post("/public_token", createPublicToken);
router.post("/exchange_public_token", exchangePublicToken);


router.post("/transactions", getTransactions);
router.post("/transactions/refresh", refreshTransactions);
router.post("/savePlaidAccessToken", savePlaidAccessToken);
router.post("/plaidWebhook", webhook);

module.exports = router;
