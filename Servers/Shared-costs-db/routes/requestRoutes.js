const express = require("express");
const {
  createRequest,
  getRequests,
  updateRequest,
  handleSendReminder,
  handlePayment,
  handleToggleMarkAsPaid,
  handlePaymentDetails,
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
router.patch("/");
router.patch(
  "/toggleMarkedAsPaid/:requestId/:paymentHistoryId/:userId",
  handleToggleMarkAsPaid
);
router.patch("/reminder/all");
router.get(
  "/paymentDetails/:requestId/:paymentHistoryId/:userId",
  handlePaymentDetails
);

module.exports = router;
