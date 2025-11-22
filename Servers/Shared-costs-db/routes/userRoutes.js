const express = require("express");
const { body } = require("express-validator");
const {
  getUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
  loginUser,
  forgotPassword,
  resetPassword,
  checkIfValidToken,
  addContactToUser,
  removeContactFromUser,
  getUserData,
  approveSmsMessages,
  addPaymentMethod,
  updateContactForUser,
  handleGoogleCallback,
  handleGoogleAuth,
  updateLastActive,
  handleSendPhoneCode,
  handleVerifyPhoneCode,
  handleSaveOnboarding,
  handleSavePaymentMethods,
} = require("../controllers/userController");

const { protect, authorize } = require("../middleware/auth");

const router = express.Router();

// Validation middleware
const validateUser = [
  body("phone")
    .customSanitizer((v) => {
      if (!v) return v;

      // Remove everything except digits and leading +
      let cleaned = v.replace(/[^\d+]/g, "");

      // Ensure only a single leading +
      cleaned = cleaned.replace(/(?!^)\+/g, "");

      return cleaned;
    })
    .isMobilePhone("en-US")
    .withMessage("Please provide a valid phone"),
  body("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters")
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage(
      "Password must contain at least one lowercase letter, one uppercase letter, and one number"
    ),
];

const validatePhone = [
  body("phone")
    .customSanitizer((v) => {
      if (!v) return v;

      // Remove everything except digits and leading +
      let cleaned = v.replace(/[^\d+]/g, "");

      // Ensure only a single leading +
      cleaned = cleaned.replace(/(?!^)\+/g, "");

      return cleaned;
    })
    .isMobilePhone("en-US")
    .withMessage("Please provide a valid phone"),
];

const validateLogin = [
  body("email")
    .optional()
    .isEmail()
    .normalizeEmail()
    .withMessage("Please provide a valid email"),
  body("password").notEmpty().withMessage("Password is required"),
];

const validateUpdate = [
  body("name")
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage("Name must be between 2 and 50 characters"),
  body("email")
    .optional()
    .isEmail()
    .normalizeEmail()
    .withMessage("Please provide a valid email"),
  body("role")
    .optional()
    .isIn(["user", "admin"])
    .withMessage("Role must be either user or admin"),
];

// Public routes
router.post("/login", validateLogin, validatePhone, loginUser);
// router.post("/", validateUser, createUser); MUST CREATE USER BY VALIDATING PHONE
router.post("/sendPhoneCode", validatePhone, handleSendPhoneCode);
router.post("/verifyPhoneCode", validatePhone, handleVerifyPhoneCode);

// GOOGLE OAUTH
router.post("/auth/google/", handleGoogleAuth);
// router.get("/auth/google/callback", handleGoogleCallback);

router.post("/forgot-password", forgotPassword);
router.put("/reset-password/:token", resetPassword);
router.post("/check-token", checkIfValidToken);

router.patch("/sms/user-consent/:userId", approveSmsMessages);

// Protected routes
router.use(protect); // All routes after this require user to logged in

router.post("/saveOnboarding", handleSaveOnboarding);

router.post("/contact", addContactToUser);
router.delete("/contact", removeContactFromUser);
router.patch("/contact/updateName", updateContactForUser);

router.get("/data", getUserData);

router.get("/:id", getUser);
router.put("/:id", validateUpdate, updateUser);

// router.post("/addPaymentMethod", addPaymentMethod);
router.post("/payment-methods", handleSavePaymentMethods);

router.post("/lastActive", updateLastActive);

// Admin only routes
router.use(authorize("admin"));
router.delete("/:id", deleteUser);
router.post("/all", getUsers);

module.exports = router;
