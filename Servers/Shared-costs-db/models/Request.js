// models/Request.js
const mongoose = require("mongoose");
const { Schema } = mongoose;

// Sub-schema for participants inside the main request
const participantSchema = new Schema({
  userId: { type: Number, required: true },
  status: {
    type: String,
    enum: ["pending", "paid", "overdue"],
    default: "pending",
  },
  customAmount: { type: String },
  amount: { type: Number },
});

// Sub-schema for participants inside each payment history entry
const paymentParticipantSchema = new Schema({
  userId: { type: Number, required: true },
  status: {
    type: String,
    enum: ["paid", "pending", "overdue"],
    default: "pending",
  },
  paidDate: { type: Date },
  amount: { type: Number },
  remindersSent: { type: Number },
  lastReminderDate: { type: Date },
});

// Sub-schema for payment history entries
const paymentHistorySchema = new Schema({
  id: { type: String, required: true },
  requestDate: { type: Date },
  dueDate: { type: Date },
  amount: { type: Number },
  status: {
    type: String,
    enum: ["paid", "pending", "overdue", "partial"],
    default: "pending",
  },
  followUpSent: { type: Boolean, default: false },
  lastReminderSent: { type: Date, default: null },
  participants: [paymentParticipantSchema],
});

const requestSchema = new Schema({
  name: { type: String, required: true },
  amount: { type: Number, required: true },
  totalAmount: { type: Number },
  isRecurring: { type: Boolean, default: false },
  plaidMatch: { type: String },
  splitType: { type: String, enum: ["equal", "custom"], default: "equal" },
  participants: [participantSchema],
  customSplits: { type: Map, of: Number },
  customAmounts: { type: Map, of: String },
  createdAt: { type: Date, default: Date.now },
  lastMatched: { type: Date },
  frequency: { type: String }, // weekly, monthly, custom
  nextDue: { type: Date },
  customInterval: { type: Number },
  customUnit: { type: String }, // days, weeks, months
  startTiming: { type: String, enum: ["now", "later"], default: "now" },
  startDate: { type: Date }, // for when startTiming is "later"
  isDynamic: { type: Boolean, default: false },
  dynamicCostReason: { type: String },
  paymentHistory: [paymentHistorySchema],
});

// Pre-save middleware to calculate nextDue
requestSchema.pre('save', function(next) {
  if (this.isRecurring && !this.nextDue) {
    const baseDate = this.startTiming === 'later' && this.startDate 
      ? new Date(this.startDate) 
      : new Date();

    let nextDue = new Date(baseDate);

    if (this.frequency === 'weekly') {
      nextDue.setDate(nextDue.getDate() + 7);
    } else if (this.frequency === 'monthly') {
      nextDue.setMonth(nextDue.getMonth() + 1);
    } else if (this.frequency === 'custom' && this.customInterval && this.customUnit) {
      if (this.customUnit === 'days') {
        nextDue.setDate(nextDue.getDate() + this.customInterval);
      } else if (this.customUnit === 'weeks') {
        nextDue.setDate(nextDue.getDate() + (this.customInterval * 7));
      } else if (this.customUnit === 'months') {
        nextDue.setMonth(nextDue.getMonth() + this.customInterval);
      }
    }

    this.nextDue = nextDue;
  }
  next();
});

module.exports = mongoose.model("Request", requestSchema);