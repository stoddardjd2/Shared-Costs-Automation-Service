const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      maxlength: [50, "Name cannot exceed 50 characters"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        "Please enter a valid email",
      ],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters"],
      select: false, // Don't include password in queries by default
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    lastLogin: {
      type: Date,
    },
    profile: {
      avatar: String,
      bio: {
        type: String,
        maxlength: [500, "Bio cannot exceed 500 characters"],
      },
      location: String,
      website: String,
    },
    passwordResetToken: String,
    passwordResetExpire: Date,
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Index for better query performance
userSchema.index({ email: 1 });
userSchema.index({ role: 1, isActive: 1 });

// Virtual for user's full profile
userSchema.virtual("fullProfile").get(function () {
  return {
    id: this._id,
    name: this.name,
    email: this.email,
    role: this.role,
    isActive: this.isActive,
    profile: this.profile,
    createdAt: this.createdAt,
    lastLogin: this.lastLogin,
  };
});

// Pre-save middleware to hash password
userSchema.pre("save", async function (next) {
  // Only run if password is modified
  if (!this.isModified("password")) return next();

  try {
    // Hash password with salt rounds from env or default to 12
    const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS) || 12;
    this.password = await bcrypt.hash(this.password, saltRounds);
    next();
  } catch (error) {
    next(error);
  }
});

// Instance method to check password
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Instance method to update last login
userSchema.methods.updateLastLogin = async function () {
  this.lastLogin = new Date();
  return await this.save({ validateBeforeSave: false });
};

// Static method to find active users
userSchema.statics.findActiveUsers = function () {
  return this.find({ isActive: true });
};

// Static method to find by email
userSchema.statics.findByEmail = function (email) {
  return this.findOne({ email: email.toLowerCase() });
};

module.exports = mongoose.model("User", userSchema);
