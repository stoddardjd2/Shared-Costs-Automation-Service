const express = require("express");
const { body } = require("express-validator");
const {
  createRequest,
} = require("../controllers/requestController");

const { protect, authorize } = require("../middleware/auth");

const router = express.Router();

// All routes require authentication
router.use(protect);


// Routes
router.post("/", createRequest);
router.get("/", createRequest);
// router.put("/:id",updateRequest);

module.exports = router;
