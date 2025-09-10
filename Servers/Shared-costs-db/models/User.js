const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const { Schema, Types } = mongoose;

// Contact sub-schema with a unique contactId
const contactSchema = new Schema({
  // contactId: {
  //   type: Schema.Types.ObjectId,
  //   default: () => new Types.ObjectId(), // Generates a unique ID
  // },
  name: {
    type: String,
    required: [true, "Contact name is required"],
    trim: true,
  },
  email: {
    type: String,
    required: [true, "Email is required"],
    trim: true,
  },

  // no longer required
  phone: {
    type: String,
    // required: [false, "Contact phone number is required"],
    trim: true,
  },
  avatar: {
    type: String,
    required: true,
    trim: true,
    maxlength: [2, "Avatar initials should be 2 characters maximum"],
  },

  color: {
    type: String,
    required: true,
    trim: true,
    validate: {
      validator: function (v) {
        // Validate that it's a valid Tailwind color class
        const allowedColors = [
          "bg-purple-500",
          "bg-green-500",
          "bg-pink-500",
          "bg-indigo-500",
          "bg-teal-500",
          "bg-cyan-500",
          "bg-emerald-500",
          "bg-violet-500",
          "bg-fuchsia-500",
          "bg-rose-500",
          "bg-lime-500",
        ];
        return allowedColors.includes(v);
      },
      message: "Color must be a valid Tailwind color class",
    },
  },
});

const RequesterNodeSchema = new Schema(
  {
    lastSentAt: { type: Date, default: null },
    count: { type: Number, default: 0 },
  },
  { _id: false }
);

const TextConsentSchema = new Schema(
  {
    // Current consent state
    isAllowed: { type: Boolean, default: false },
    allowedAt: { type: Date, default: null },
    setCount: { type: Number, default: 0 },
    // Latest consent event metadata (single, lightweight)
    lastConsentMeta: {
      ip: { type: String },
      userAgent: { type: String },
      at: { type: Date },
      method: { type: String, default: "web" }, // "web" | "sms" | "api" | etc.
    },

    // Outreach / approval request tracking
    approval: {
      // Global (any requester)
      isSent: { type: Boolean, default: false },
      lastSentAt: { type: Date, default: null },
      count: { type: Number, default: 0 },

      // Per-requester throttle info
      byRequester: {
        type: Map,
        of: RequesterNodeSchema, // keys are requesterId strings
        default: () => ({}),
      },
    },
  },
  { _id: false }
);

const userSchema = new Schema(
  {
    requests: [
      {
        type: Schema.Types.ObjectId,
        required: false,
      },
    ],
    name: {
      type: String,
      // required: [true, "Name is required"],
      trim: true,
      maxlength: [50, "Name cannot exceed 50 characters"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      lowercase: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        "Please enter a valid email",
      ],
    },
    phone: {
      type: String,
      // required: [false, "Contact phone number is required"],
      trim: true,
    },
    password: {
      type: String,
      // required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters"],
      select: false,
    },
    plan: {
      type: String,
      required: true,
      default: "free",
    },
    role: {
      type: String,
      enum: ["user", "admin", "premium", "plaid"],
      default: "user",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    lastLogin: {
      type: Date,
    },
    paymentMethods: {
      cashapp: String,
      venmo: String,
    },
    contacts: [contactSchema], // <-- Contacts with unique IDs
    textMessagesAllowed: { type: TextConsentSchema, default: () => ({}) },
    passwordResetToken: String,
    passwordResetExpire: Date,
    paymentHistory: [
      {
        requestId: Schema.Types.ObjectId,
        paymentHistoryId: Schema.Types.ObjectId,
        originalAmount: Number,
        amountPaid: Number,
        amountOwed: Number,
        paidDate: Date,
        requestName: String,
        isFullyPaid: Boolean,
        markedAsPaid: Boolean,
        markedAsPaidDate: Date,
      },
    ],
    // Example Mongoose fields on User
    stripeCustomerId: String,
    subscription: {
      id: String,
      planKey: String, // "plaid" | "premium"
      interval: String, // "monthly" | "annual"
      status: String, // "active" | "trialing" | "past_due" | "incomplete" | "canceled" ...
      currentPeriodStart: Date,
      currentPeriodEnd: Date,
      cancelAtPeriodEnd: Boolean,
      latestInvoiceId: String,
      defaultPaymentMethodId: String,
    },
    isPremium: Boolean, // derived convenience flag for your app

    plaid: {
      isEnabled: Boolean,
      enabledOn: Date,
      lastUsed: Date,
      accessToken: { type: String, select: false },
    },

    OAuth: {
      google: {
        sub: { type: String },
        picture: { type: String },
      },
    },
  },

  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes
userSchema.index({ email: 1 });
// userSchema.index({ role: 1, isActive: 1 });

// Password hashing
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  try {
    const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS) || 12;
    this.password = await bcrypt.hash(this.password, saltRounds);
    next();
  } catch (error) {
    next(error);
  }
});

// Instance method: password match
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Instance method: update login timestamp
userSchema.methods.updateLastLogin = async function () {
  this.lastLogin = new Date();
  return await this.save({ validateBeforeSave: false });
};

// Static methods
userSchema.statics.findActiveUsers = function () {
  return this.find({ isActive: true });
};

userSchema.statics.findByEmail = function (email) {
  return this.findOne({ email: email.toLowerCase() });
};

module.exports = mongoose.model("User", userSchema);
