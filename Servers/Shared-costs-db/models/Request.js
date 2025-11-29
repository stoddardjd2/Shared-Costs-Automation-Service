// models/Request.js
const mongoose = require("mongoose");
const { Schema } = mongoose;

// Sub-schema for participants inside the main request
const participantSchema = new Schema({
  _id: { type: Schema.Types.ObjectId, required: true },
  // customAmount: { type: String },
  amount: { type: Number },
  percentage: Number,
});

// Sub-schema for participants inside each payment history entry
const paymentParticipantSchema = new Schema({
  _id: { type: Schema.Types.ObjectId, required: true },
  // status: {
  //   type: String,
  //   enum: ["paid", "pending", "overdue"],
  //   default: "pending",
  // },
  paymentAmount: { type: Number },
  markedAsPaid: { type: Boolean },
  paidDate: { type: Date },
  amount: { type: Number },
  reminderSent: { type: Boolean },
  reminderSentDate: { type: Date },
  markedAsPaidDate: { type: Date },
  participantMarkedAsPaid: { type: Boolean },
  participantMarkedAsPaidDate: { type: Date },
  markedAsPaidMethod: { type: String, Enum: ["UI", "textLink"], default: "UI" },
  paymentLinkClicked: { type: Boolean },
  paymentLinkClickedDate: { type: Date },
  lastClickedPaymentMethod: { type: String },
  requestSentDate: Date,
});

// Sub-schema for payment history entries
const paymentHistorySchema = new Schema({
  requestDate: { type: Date },
  dueDate: { type: Date },
  nextReminderDate: { type: Date },
  reminderCycleCount: { type: Number, default: 0 },
  amount: { type: Number },
  totalAmount: Number,
  totalAmountOwed: Number,

  //   status: {
  //     type: String,
  //     enum: ["paid", "pending", "overdue", "partial"],
  //     default: "pending",
  //   },
  participants: [paymentParticipantSchema],
});

const requestSchema = new Schema({
  owner: { type: Schema.Types.ObjectId, required: true },
  name: { type: String, required: true },
  amount: { type: Number },
  //   totalAmount: { type: Number },
  isRecurring: { type: Boolean, default: false },
  splitType: {
    type: String,
    enum: ["equal", "equalWithMe", "custom", "percentage"],
    default: "equal",
  },
  participants: [participantSchema],
  //   customSplits: { type: Map, of: Number },
  customAmounts: { type: Map, of: String },
  percentageAmounts: { type: Map, of: String },
  createdAt: { type: Date, default: Date.now },
  lastMatched: { type: Date },
  frequency: { type: String }, // weekly, monthly, custom
  nextDue: { type: Date },
  customInterval: { type: Number },
  customUnit: { type: String }, // days, weeks, months
  startTiming: { type: Schema.Types.Mixed, default: "now" },
  startDate: { type: Date }, // for when startTiming is "later"
  lastSent: { type: Date },
  isDynamic: { type: Boolean, default: false },
  allowPaymentNotificationsInfo: { type: Boolean, default: false },
  allowMarkAsPaidForEveryone: { type: Boolean, default: false },
  isPlaidCharge: Boolean,
  totalAmount: Number,
  dueInDays: Number,
  totalAmountOwed: Number,
  reminderFrequency: {
    type: String,
    enum: ["daily", "weekly", "monthly", "none", "once", "3days"],
    default: "3days",
  },
  paymentHistory: [paymentHistorySchema],
  isDeleted: Boolean,
  isPaused: Boolean,
  selectedTransaction: { type: Schema.Types.Mixed },
});

// Pre-save middleware to calculate nextDue
// requestSchema.pre("save", function (next) {
//   if (this.isRecurring && !this.nextDue) {
//     const baseDate =
//       this.startTiming === "later" && this.startDate
//         ? new Date(this.startDate)
//         : new Date();

//     let nextDue = new Date(baseDate);

//     if (this.frequency === "weekly") {
//       nextDue.setDate(nextDue.getDate() + 7);
//     } else if (this.frequency === "monthly") {
//       nextDue.setMonth(nextDue.getMonth() + 1);
//     } else if (
//       this.frequency === "custom" &&
//       this.customInterval &&
//       this.customUnit
//     ) {
//       if (this.customUnit === "days") {
//         nextDue.setDate(nextDue.getDate() + this.customInterval);
//       } else if (this.customUnit === "weeks") {
//         nextDue.setDate(nextDue.getDate() + this.customInterval * 7);
//       } else if (this.customUnit === "months") {
//         nextDue.setMonth(nextDue.getMonth() + this.customInterval);
//       }
//     }

//     this.nextDue = nextDue;
//   }
//   next();
// });

module.exports = mongoose.model("Request", requestSchema);
