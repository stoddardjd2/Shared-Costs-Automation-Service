const express = require("express");
const braintree = require("braintree");

const { body } = require("express-validator");
const {
  createRequest,
  getRequests,
  updateRequest,
  handleSendReminder,
  handlePayment,
} = require("../controllers/requestController");

const { protect, authorize } = require("../middleware/auth");

const router = express.Router();

// public payment route
router.patch("/payment/:requestId/:paymentHistoryId/:userId", handlePayment);

// All routes require authentication
router.use(protect);

// Routes
router.post("/", createRequest);
router.get("/", getRequests);
router.put("/:id", updateRequest);

router.patch(
  "/reminder/:requestId/:paymentHistoryId/:userId",
  handleSendReminder
);
router.patch("/reminder/all");

module.exports = router;
