const express = require("express");
const {
  createRequest,
  getRequests,
  updateRequest,
  handleSendReminder,
  handlePayment,
  handleToggleMarkAsPaid,
  handlePaymentDetails,
  handleDeleteRequest,
  handleTogglePauseRequest,
  handleLogPaymentView,
  handleLogLastClickedPaymentMethod,
} = require("../controllers/requestController");

const { protect, authorize } = require("../middleware/auth");

const router = express.Router();

// public payment route
router.patch("/payment/:requestId/:paymentHistoryId/:userId", handlePayment);

// router.patch("/reminder/all");
router.get(
  "/paymentDetails/:requestId/:paymentHistoryId/:userId",
  handlePaymentDetails
);

router.post(
  "/logPaymentView/:requestId/:paymentHistoryId/:userId",
  handleLogPaymentView
);
router.post(
  "/logLastClickedPaymentMethod/:requestId/:paymentHistoryId/:userId",
  handleLogLastClickedPaymentMethod
);

// All routes require authentication
router.use(protect);

// Routes
router.post("/", createRequest);
router.get("/", getRequests);
router.put("/:id", updateRequest);

// OUTDATED: DOES NOT TAKE LOCAL USERTIMEZONE INTO ACCOUNT FOR CALCULATING NEXT DUE
router.patch(
  "/reminder/:requestId/:paymentHistoryId/:userId",
  handleSendReminder
);

router.post("/delete/:requestId", handleDeleteRequest);
router.post("/pause/:requestId", handleTogglePauseRequest);

router.patch(
  "/toggleMarkedAsPaid/:requestId/:paymentHistoryId/:userId",
  handleToggleMarkAsPaid
);

module.exports = router;
