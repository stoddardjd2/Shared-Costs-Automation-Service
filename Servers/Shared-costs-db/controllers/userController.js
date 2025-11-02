const User = require("../models/User");
const jwt = require("jsonwebtoken");
// server.js
const { validationResult } = require("express-validator");
const sendRequestsRouter = require("../send-request-helpers/sendRequestsRouter");
const crypto = require("crypto");
const nodemailer = require("nodemailer");
const Request = require("../models/Request");
const { jwtDecode } = require("jwt-decode");
const { normalizePhone } = require("../utils/general");
const { ObjectId } = require("mongodb");
const { mongoose } = require("mongoose");
const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const { OAuth2Client } = require("google-auth-library");

const oAuth2Client = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  "postmessage"
);

// Generate JWT Token
const generateToken = (id, googleProfile) => {
  if (googleProfile) {
    // for google login/signuip:
    return jwt.sign(
      {
        id,
        sub: googleProfile.sub,
        email: googleProfile.email,
        name: googleProfile.name,
        picture: googleProfile.picture,
        provider: "google",
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d", issuer: "your-app", audience: "your-app-web" }
    );
  }
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || "7d",
  });
};
function base64url(input) {
  return input
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
}
function sha256(buffer) {
  return crypto.createHash("sha256").update(buffer).digest();
}
function randomString(bytes = 32) {
  return base64url(crypto.randomBytes(bytes));
}

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

const updateContactForUser = async (req, res) => {
  try {
    const userId = req.user._id; // From auth middleware
    const { contactId, updatedName } = req.body;

    // Validate inputs
    if (!mongoose.Types.ObjectId.isValid(contactId)) {
      return res.status(400).json({ message: "Invalid contactId." });
    }

    if (!updatedName || updatedName.trim() === "") {
      return res.status(400).json({ message: "Updated name is required." });
    }

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found." });

    // Find and update the contact
    const contactIndex = user.contacts.findIndex(
      (contact) => contact._id.toString() === contactId
    );

    if (contactIndex === -1) {
      return res.status(404).json({ message: "Contact not found." });
    }

    // Update the contact's name
    user.contacts[contactIndex].name = updatedName.trim();

    await user.save();

    return res.status(200).json({
      message: "Contact name updated successfully.",
      contact: user.contacts[contactIndex],
    });
  } catch (err) {
    console.error("Error updating contact name:", err);
    return res
      .status(500)
      .json({ message: "Server error while updating contact name." });
  }
};

const removeContactFromUser = async (req, res) => {
  try {
    const userId = req.user._id; // From auth middleware
    const { contactId } = req.body;

    if (!mongoose.Types.ObjectId.isValid(contactId)) {
      return res.status(400).json({ message: "Invalid contactId." });
    }

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found." });

    // Filter out the contact
    const initialLength = user.contacts.length;
    user.contacts = user.contacts.filter(
      (contact) => contact._id.toString() !== contactId
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
    // const emailClean = email.toLowerCase().trim();

    // // prevent adding self
    // if (emailClean == req.user.email) {
    //   return res.status(404).json({ message: "Cannot add self" });
    // }

    // email is not required
    if (!name || !phone || !avatar || !color) {
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
        (contact) => contact?.phone?.trim() === phone.trim()
      );
    }

    if (phoneExists) {
      return res
        .status(409)
        .json({ message: "Contact with this phone number already exists." });
    }

    // check for duplicate email
    // const emailExists = user.contacts.some(
    //   (contact) => contact.email.trim() === emailClean.trim()
    // );

    // if (emailExists) {
    //   return res
    //     .status(409)
    //     .json({ message: "Contact with this email already exists." });
    // }

    // Add new contact as new User in DB if not added yet
    console.log("phone add", phone.trim(), phone);
    const prevUser = await User.findOne({ phone: phone.trim() });
    let newUser;
    if (!prevUser) {
      newUser = new User({
        phone: phone.trim(),
        name: name,
        addedFromContact: true,
      });
      await newUser.save();
    }

    // Add new contact
    
    const newContact = {
      name: name.trim(),
      avatar: avatar.trim(),
      color: color.trim(),
      phone: phone.trim(),
      // email: emailClean,
      // Add user Id (either newly created or one found)
      _id: prevUser ? prevUser._id : newUser._id,
    };

    console.log("new contanct", newContact);
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
const checkIfValidToken = async (req, res) => {
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

      const user = await User.findById(decoded.id);

      console.log("Token decoded:", new Date(decoded.exp * 1000));
      if (user) {
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
      } else {
        res.status(200).json({
          success: false,
          message: "No user found matching token",
          data: {
            valid: false,
            userId: decoded.id,
            // user: user,
            issuedAt: new Date(decoded.iat * 1000),
            expiresAt: new Date(decoded.exp * 1000),
            timeUntilExpiry: decoded.exp * 1000 - Date.now(),
          },
        });
      }
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

    const { name, email, password } = req.body;

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
    const isAllowed = req.body.isAllowed;
    const method = req.body?.method || "web";
    const normalizedPhone = req.body.phone
      ? normalizePhone(req.body.phone)
      : null;
    const userName = req.body.userName;

    if (req.body?.phone && !normalizedPhone) {
      return res.status(400).json({ ok: false, error: "Invalid phone format" });
    }

    // Light audit (no read)
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
    if (normalizedPhone) set.phone = normalizedPhone; // top-level phone

    // Increment setCount and get updated count in one atomic operation
    const oldUser = await User.findOneAndUpdate(
      { _id: userId },
      {
        $set: set,
        $inc: { "textMessagesAllowed.setCount": 1 },
      },
      { new: false }
    ).lean();

    // Store current count as variable for use later
    const currentSetCount = oldUser?.textMessagesAllowed?.setCount || 0;

    const candidateRequests = await Request.find({
      paymentHistory: {
        $elemMatch: {
          participants: {
            $elemMatch: {
              _id: userId,
              paidDate: null,
            },
          },
        },
      },
    }).lean();

    let sentCount = 0;

    for (const reqDoc of candidateRequests) {
      const histories = Array.isArray(reqDoc.paymentHistory)
        ? [...reqDoc.paymentHistory]
        : [];
      histories.sort((a, b) => new Date(b.dueDate) - new Date(a.dueDate));

      const history = histories.find(
        (h) =>
          Array.isArray(h.participants) &&
          h.participants.some(
            (p) => String(p._id) === String(userId) && !p.paidDate
          )
      );
      if (!history) continue;

      const participant =
        history.participants.find((p) => String(p._id) === String(userId)) ||
        {};

      const owner = await User.findById(new ObjectId(reqDoc.owner));

      function isPastOrOnDate(date) {
        if (!(date instanceof Date)) {
          date = new Date(date);
        }
        if (isNaN(date)) throw new Error("Invalid date provided");
        const now = new Date();
        return now.getTime() >= date.getTime();
      }

      if (reqDoc.startTiming == "now" || isPastOrOnDate(reqDoc.startTiming)) {
        if (
          participant.paymentAmount < participant.amount &&
          !participant?.markedAsPaid
        ) {
          // LIMIT SENDING TEXTS AGAIN TO 3 TIMES TO REDUCE USER ABUSE IF THEY -
          // RESUBMIT FORM MULTIPLE TIMES:
          if (currentSetCount <= 3) {
            // do not send again if same number:
            if (oldUser.phone !== normalizedPhone) {
              sendRequestsRouter(
                {
                  requestId: reqDoc._id,
                  paymentHistoryId: history._id,
                  requestName: reqDoc.name,
                  requestOwner: owner.name,
                  requestOwnerPaymentMethods: owner.paymentMethods || {},
                  participantId: participant._id,
                  participantName: userName,
                  stillOwes: participant.amount,
                  dueDate: history.dueDate,
                  requestData: reqDoc,
                },
                ["text"]
              );
              sentCount++;
            }
          }
        }
      }
    }

    return res.json({
      ok: true,
      remindersSent: sentCount,
      setCount: currentSetCount, // expose count in response
    });
  } catch (err) {
    if (err?.code === 11000 && err?.keyPattern?.phone) {
      return res
        .status(409)
        .json({ ok: false, error: "Phone number already in use" });
    }
    console.error("approveSmsMessages error:", err);
    return res.status(500).json({ ok: false, error: "Server error" });
  }
}

const updatePaymentMethod = async (req, res) => {
  try {
    const { type, tag, username, phone } = req.body;
    const userId = req.user?.id || req.params.userId; // Assuming user ID from auth middleware or params

    // Validate required fields
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User ID is required",
      });
    }

    if (!type || !["cashapp", "venmo"].includes(type)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid payment method type. Must be "cashapp" or "venmo"',
      });
    }

    // Validate type-specific required fields
    if (type === "cashapp" && !tag) {
      return res.status(400).json({
        success: false,
        message: "Cash App tag is required",
      });
    }

    if (type === "venmo" && !username) {
      return res.status(400).json({
        success: false,
        message: "Venmo username is required",
      });
    }

    // Prepare the payment method value
    let paymentValue;
    if (type === "cashapp") {
      // Store just the tag for cashapp
      paymentValue = tag;
    } else if (type === "venmo") {
      // Store just the username for venmo
      paymentValue = username;
    }

    // Create update object using dynamic field path
    const updateQuery = {
      $set: {
        [`paymentMethods.${type}`]: paymentValue,
      },
    };

    // Update user's payment method
    const updatedUser = await User.findByIdAndUpdate(userId, updateQuery, {
      new: true, // Return updated document
      runValidators: true, // Run schema validators
      select: "paymentMethods", // Only return payment methods in response
    });

    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Success response
    res.status(200).json({
      success: true,
      message: `${
        type === "cashapp" ? "Cash App" : "Venmo"
      } payment method updated successfully`,
      data: {
        paymentMethods: updatedUser.paymentMethods,
      },
    });
  } catch (error) {
    console.error("Error updating payment method:", error);

    // Handle validation errors
    if (error.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        message: "Validation error",
        errors: Object.values(error.errors).map((err) => err.message),
      });
    }

    // Handle cast errors (invalid ObjectId)
    if (error.name === "CastError") {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID format",
      });
    }

    // Generic server error
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

const addPaymentMethod = async (req, res) => {
  try {
    const { paymentMethod, paymentAddress } = req.body;
    const userId = req.user?.id; // Assuming user ID from auth middleware
    console.log("adding payment method", paymentMethod);
    // Basic validation
    if (
      !paymentMethod ||
      !["cashapp", "venmo", "paypal"].includes(paymentMethod)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid payment method type",
      });
    }

    // Get the payment value based on type

    if (!paymentMethod) {
      return res.status(400).json({
        success: false,
        message: `${"username"} is required`,
      });
    }

    // Update user's payment method
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: { [`paymentMethods.${paymentMethod}`]: paymentAddress } },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      message: `${
        paymentMethod === "cashapp" ? "Cash App" : "Venmo"
      } payment method added successfully`,
    });
  } catch (error) {
    console.error("Error adding payment method:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

const handleGoogleAuth = async (req, res) => {
  try {
    const { tokens } = await oAuth2Client.getToken(req.body.code); // exchange code for tokens

    // use oauth token info to create user
    const userInfo = jwtDecode(tokens.id_token);
    // console.log("GOOGLE ROUTE token", userInfo)

    // used if account with email exists:
    async function getUserByEmail() {
      return await User.findOne({
        email: userInfo.email,
      });
    }
    const userByGoogleId = await User.findOne({
      "OAuth.google.sub": userInfo.sub,
    });

    if (userByGoogleId) {
      console.log("userByGoogleId");
      const token = generateToken(userByGoogleId._id);
      //if account with with google id exists, login user(google id is sub value in user token)
      res.json({
        success: true,
        message: "Login successful",
        data: {
          user: {
            id: userByGoogleId._id,
            name: userByGoogleId.name,
            email: userByGoogleId.email,
            role: userByGoogleId.role,
            profile: userByGoogleId.profile,
            lastLogin: userByGoogleId.lastLogin,
          },
          token,
        },
      });
    } else if (await getUserByEmail()) {
      console.log("userByEmail");
      // if account with email exists, attach google id to account (sub value in user token)
      const user = await User.findOneAndUpdate(
        { email: userInfo.email },
        {
          $set: {
            OAuth: {
              google: {
                sub: userInfo.sub,
                picture: userInfo.picture,
              },
            },
            name: userInfo.name,
          },
        },
        { new: true } // Returns the updated document
      );

      const token = generateToken(user._id);

      res.json({
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
    } else {
      console.log("new user");
      // if account with email doesn't exist, create new account and store googleId
      const user = await User.create({
        email: userInfo.email,
        name: userInfo.name,
        OAuth: {
          google: {
            sub: userInfo.sub,
            picture: userInfo.picture,
          },
        },
      });

      const token = generateToken(user._id);
      res.json({
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
    }
    // send user info after handling account
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: err.message });
  }
};

async function handleGoogleCallback(req, res) {
  console.log("google oauth calback");
  const { code } = req.query;

  if (!code) {
    return res.redirect("/login?error=no_code");
  }

  try {
    // Exchange code for access token
    const tokenResponse = await axios.post(
      "https://oauth2.googleapis.com/token",
      {
        client_id: process.env.GOOGLE_CLIENT_ID,
        client_secret: process.env.GOOGLE_CLIENT_SECRET,
        code,
        grant_type: "authorization_code",
        redirect_uri: `${process.env.CLIENT_URL}/signup`,
      }
    );

    const { access_token } = tokenResponse.data;

    // Get user profile
    const profileResponse = await axios.get(
      "https://www.googleapis.com/oauth2/v2/userinfo",
      {
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
      }
    );

    const profile = profileResponse.data;
    const user = {
      id: profile.id,
      name: profile.name,
      email: profile.email,
      photo: profile.picture,
    };

    // Generate JWT token
    const token = generateToken(user);

    // Set HTTP-only cookie
    res.cookie("auth_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", // HTTPS in production
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      sameSite: "lax",
    });

    res.redirect("/dashboard");
  } catch (error) {
    console.error("OAuth callback error:", error);
    res.redirect("/login?error=auth_failed");
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
  checkIfValidToken,
  removeContactFromUser,
  addContactToUser,
  getUserData,
  approveSmsMessages,
  addPaymentMethod,
  updateContactForUser,
  handleGoogleAuth,
  handleGoogleCallback,
};
