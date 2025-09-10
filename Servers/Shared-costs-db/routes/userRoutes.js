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
  handleGoogleAuthVerify
} = require("../controllers/userController");

const { protect, authorize } = require("../middleware/auth");

const router = express.Router();

// Validation middleware
const validateUser = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Name is required")
    .isLength({ min: 2, max: 50 })
    .withMessage("Name must be between 2 and 50 characters"),
  body("email")
    .isEmail()
    .normalizeEmail()
    .withMessage("Please provide a valid email"),
  body("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters")
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage(
      "Password must contain at least one lowercase letter, one uppercase letter, and one number"
    ),
];

const validateLogin = [
  body("email")
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
router.post("/login", validateLogin, loginUser);
router.post("/", validateUser, createUser);

// GOOGLE OAUTH

// 1) Start auth (redirect user to Google)
// router.get("/auth/google/verify", handleGoogleAuthVerify);
// router.get("/auth/google/callback", handleGoogleCallback);



router.post("/forgot-password", forgotPassword);
router.put("/reset-password/:token", resetPassword);
router.post("/check-token", checkIfValidToken);

router.patch("/sms/user-consent/:userId", approveSmsMessages);

// Protected routes
router.use(protect); // All routes after this require user to logged in

router.post("/contact", addContactToUser);
router.delete("/contact", removeContactFromUser);
router.patch("/contact/updateName", updateContactForUser);

router.get("/data", getUserData);

router.get("/:id", getUser);
router.put("/:id", validateUpdate, updateUser);

router.post("/addPaymentMethod", addPaymentMethod);

// Admin only routes
router.delete("/:id", authorize("admin"), deleteUser);

module.exports = router;
