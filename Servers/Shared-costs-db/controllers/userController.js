const User = require("../models/User");
const jwt = require("jsonwebtoken");
const { validationResult } = require("express-validator");

const crypto = require("crypto");
const nodemailer = require("nodemailer");

const {normalizePhone} = require("../utils/general");

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || "7d",
  });
};

const getUserData = async (req, res) => {
  try {
    const userId = req.user._id; // From auth middleware

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found." });

    return res.status(200).json(user);
  } catch (err) {
    console.error("Error getting user data:", err);
    return res
      .status(500)
      .json({ message: "Server error while getting user data." });
  }
};

const removeContactFromUser = async (req, res) => {
  try {
    const userId = req.user._id; // From auth middleware
    const { contactId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(contactId)) {
      return res.status(400).json({ message: "Invalid contactId." });
    }

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found." });

    // Filter out the contact
    const initialLength = user.contacts.length;
    user.contacts = user.contacts.filter(
      (contact) => contact.contactId.toString() !== contactId
    );

    if (user.contacts.length === initialLength) {
      return res.status(404).json({ message: "Contact not found." });
    }

    await user.save();

    return res.status(200).json({ message: "Contact removed successfully." });
  } catch (err) {
    console.error("Error removing contact:", err);
    return res
      .status(500)
      .json({ message: "Server error while removing contact." });
  }
};

const addContactToUser = async (req, res) => {
  try {
    const userId = req.user._id; // From auth middleware
    const { name, phone, avatar, color, email } = req.body;

    // prevent adding self
    if (email == req.user.email) {
      return res.status(404).json({ message: "Cannot add self" });
    }

    // phone is not required
    if (!name || !email || !avatar || !color) {
      return res
        .status(400)
        .json({ message: "Name, phone, avatar, and color are required." });
    }

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found." });

    // Check for duplicate phone number if phone number given
    let phoneExists;
    if (phone) {
      phoneExists = user.contacts.some(
        (contact) => contact.phone.trim() === phone.trim()
      );
    }

    if (phoneExists) {
      return res
        .status(409)
        .json({ message: "Contact with this phone number already exists." });
    }

    // check for duplicate email
    const emailExists = user.contacts.some(
      (contact) => contact.email.trim() === email.trim()
    );

    if (emailExists) {
      return res
        .status(409)
        .json({ message: "Contact with this email already exists." });
    }

    // Add new contact as new User in DB if not added yet
    const prevUser = await User.findOne({ email: email.trim().toLowerCase() });
    let newUser;
    if (!prevUser) {
      newUser = new User({ email: email.trim(), name: name });
      await newUser.save();
    }

    // Add new contact
    const newContact = {
      name: name.trim(),
      avatar: avatar.trim(),
      color: color.trim(),
      email: email.trim(),
      // Add user Id (either newly created or one found)
      _id: prevUser ? prevUser._id : newUser._id,
      ...(phone ? phone.trim : {}),
    };
    user.contacts.push(newContact);
    await user.save();

    const addedContact = user.contacts[user.contacts.length - 1];

    return res.status(201).json({
      message: "Contact added successfully.",
      contact: addedContact,
    });
  } catch (err) {
    console.error("Error adding contact:", err);
    return res
      .status(500)
      .json({ message: "Server error while adding contact." });
  }
};
// @desc    Check if token is expired without validating user
// @route   POST /api/auth/check-token
// @access  Public
// USED TO GET USER AND GET REQUESTS
const checkTokenExpiry = async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({
        success: false,
        message: "Token is required",
      });
    }

    try {
      // Just verify the token structure and expiry
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // const user = await User.findById(decoded.id);

      console.log("Token decoded:", new Date(decoded.exp * 1000));
      res.status(200).json({
        success: true,
        message: "Token is valid",
        data: {
          valid: true,
          userId: decoded.id,
          // user: user,
          issuedAt: new Date(decoded.iat * 1000),
          expiresAt: new Date(decoded.exp * 1000),
          timeUntilExpiry: decoded.exp * 1000 - Date.now(),
        },
      });
    } catch (jwtError) {
      if (jwtError.name === "TokenExpiredError") {
        return res.status(401).json({
          success: false,
          message: "Token has expired",
          data: {
            valid: false,
            expired: true,
            expiredAt: new Date(jwtError.expiredAt),
          },
        });
      }

      return res.status(401).json({
        success: false,
        message: "Invalid token",
        data: {
          valid: false,
          expired: false,
        },
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error checking token",
      error: error.message,
    });
  }
};
// @desc    Forgot Password - Send reset email
// @route   POST /api/users/forgot-password
// @access  Public
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    // Find user by email
    const user = await User.findByEmail(email);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "No user found with that email address",
      });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetTokenExpire = Date.now() + 10 * 60 * 1000; // 10 minutes

    // Save reset token to user (you'll need to add these fields to your User model)
    user.passwordResetToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");
    user.passwordResetExpire = resetTokenExpire;
    await user.save({ validateBeforeSave: false });

    // Create reset URL
    const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;

    // Email content
    const message = `
      <h2>Password Reset Request</h2>
      <p>You requested a password reset for your account.</p>
      <p>Please click the link below to reset your password:</p>
      <a href="${resetUrl}" style="background-color: #3B82F6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; display: inline-block; margin: 16px 0;">Reset Password</a>
      <p>This link will expire in 10 minutes.</p>
      <p>If you didn't request this password reset, please ignore this email.</p>
    `;

    // Send email
    console.log("EMAIL!", process.env.EMAIL_USER, process.env.EMAIL_PASS);
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: user.email,
      subject: "Password Reset Request",
      html: message,
    });

    res.status(200).json({
      success: true,
      message: "Password reset email sent successfully",
    });
  } catch (error) {
    console.error("Forgot password error:", error);
    res.status(500).json({
      success: false,
      message: "Error sending password reset email",
      error: error.message,
    });
  }
};

// @desc    Reset Password
// @route   PUT /api/users/reset-password/:token
// @access  Public
const resetPasswordHandler = async (req, res) => {
  try {
    const { password } = req.body;
    const { token } = req.params;

    if (!password) {
      return res.status(400).json({
        success: false,
        message: "Password is required",
      });
    }

    // Hash the token to match what's stored in database
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    // Find user with valid reset token
    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpire: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired reset token",
      });
    }

    // Set new password (will be hashed by pre-save middleware)
    user.password = password;
    user.passwordResetToken = undefined;
    user.passwordResetExpire = undefined;
    await user.save();

    res.status(200).json({
      success: true,
      message: "Password reset successful",
    });
  } catch (error) {
    console.error("Reset password error:", error);
    res.status(500).json({
      success: false,
      message: "Error resetting password",
      error: error.message,
    });
  }
};

// @desc    Get all users
// @route   GET /api/users
// @access  Public
const getUsers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Build filter object
    const filter = { isActive: true };
    if (req.query.role) filter.role = req.query.role;
    if (req.query.search) {
      filter.$or = [
        { name: { $regex: req.query.search, $options: "i" } },
        { email: { $regex: req.query.search, $options: "i" } },
      ];
    }

    const users = await User.find(filter)
      .select("-password")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await User.countDocuments(filter);

    res.status(200).json({
      success: true,
      count: users.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      data: users,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

// @desc    Get single user
// @route   GET /api/users/:id
// @access  Public
const getUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID format",
      });
    }
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

// @desc    Create new user
// @route   POST /api/users
// @access  Public
const createUser = async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Validation Error",
        errors: errors.array(),
      });
    }

    const { name, email, password, role, profile } = req.body;

    // Check if user already exists
    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User with this email already exists",
      });
    }

    // Create user
    const user = await User.create({
      name,
      email,
      password,
      role,
      profile,
      plan: "free",
    });

    // Generate token
    const token = generateToken(user._id);

    console.log("CREATED USER, ", user);
    res.status(201).json({
      success: true,
      message: "User created successfully",
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          profile: user.profile,
          createdAt: user.createdAt,
          plan: user.plan,
        },
        token,
      },
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "Email already exists",
      });
    }
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

// @desc    Update user
// @route   PUT /api/users/:id
// @access  Private
const updateUser = async (req, res) => {
  try {
    const { name, email, role, profile, isActive } = req.body;

    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Update fields
    if (name) user.name = name;
    if (email) user.email = email;
    if (role) user.role = role;
    if (profile) user.profile = { ...user.profile, ...profile };
    if (typeof isActive === "boolean") user.isActive = isActive;

    const updatedUser = await user.save();

    res.status(200).json({
      success: true,
      message: "User updated successfully",
      data: {
        id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        profile: updatedUser.profile,
        isActive: updatedUser.isActive,
        updatedAt: updatedUser.updatedAt,
      },
    });
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID format",
      });
    }
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Private
const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    await User.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: "User deleted successfully",
    });
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID format",
      });
    }
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

// @desc    Login user
// @route   POST /api/users/login
// @access  Public
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if email and password are provided
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please provide email and password",
      });
    }

    // Find user and include password
    const user = await User.findByEmail(email).select("+password");

    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: "Account is deactivated",
      });
    }

    // Update last login
    await user.updateLastLogin();

    // Generate token
    const token = generateToken(user._id);

    console.log("LOGIN SUCCESSFUL", user);

    res.status(200).json({
      success: true,
      message: "Login successful",
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          profile: user.profile,
          lastLogin: user.lastLogin,
        },
        token,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

async function approveSmsMessages(req, res) {
  try {
    const { userId } = req.params;
    const isAllowed = req.body?.isAllowed ?? true;
    const method = req.body?.method || "web";
    const normalizedPhone = req.body?.phone
      ? normalizePhone(req.body.phone)
      : null;

 
      
    if (req.body?.phone && !normalizedPhone) {
      return res.status(400).json({ ok: false, error: "Invalid phone format" });
    }

    // Light audit
    const ip =
      (req.headers["x-forwarded-for"] || "").split(",")[0].trim() ||
      req.socket?.remoteAddress ||
      null;
    const userAgent = req.get("user-agent") || null;

    // Build $set payload
    const set = {
      "textMessagesAllowed.isAllowed": !!isAllowed,
      "textMessagesAllowed.allowedAt": isAllowed ? new Date() : null,
      "textMessagesAllowed.lastConsentMeta": {
        ip,
        userAgent,
        at: new Date(),
        method,
      },
    };

    if (normalizedPhone) set.phone = normalizedPhone; // <— top-level field

    const user = await User.findByIdAndUpdate(
      userId,
      { $set: set },
      {
        new: true,
        runValidators: true,
        projection: { name: 1, email: 1, phone: 1, textMessagesAllowed: 1 },
      }
    ).lean();

    if (!user) {
      return res.status(404).json({ ok: false, error: "User not found" });
    }

    return res.json({ ok: true, user });
  } catch (err) {
    // If you have a unique index on phone, surface dup-key cleanly
    if (err?.code === 11000 && err?.keyPattern?.phone) {
      return res
        .status(409)
        .json({ ok: false, error: "Phone number already in use" });
    }
    console.error("approveSmsConsent error:", err);
    return res.status(500).json({ ok: false, error: "Server error" });
  }
}
module.exports = {
  getUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
  loginUser,
  forgotPassword,
  resetPassword: resetPasswordHandler,
  checkTokenExpiry,
  removeContactFromUser,
  addContactToUser,
  getUserData,
  approveSmsMessages,
};
