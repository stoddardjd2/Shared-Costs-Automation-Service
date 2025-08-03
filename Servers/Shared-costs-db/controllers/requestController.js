// controllers/requestController.js
const Request = require("../models/Request");
const User = require("../models/User");
const {
  calculateNextReminderDate,
  calculateDueDate,
} = require("../utils/requestHelpers");
// const createRequest = () => {};

const getRequests = async (req, res) => {
  console.log("getting requests");
  try {
    const requests = await Request.find({ owner: req.user._id });
    res.json(requests);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const createRequest = async (req, res) => {
  console.log("Creating request with data:", req.body);
  try {
    const userId = req.user._id; // From auth middleware
    const { dueInDays = 7, reminderFrequency = "weekly", ...requestData } = req.body;
    // reminder frequency can be daily, weekly, monthly, or none

    // Calculate due date - accepts starting date param
    const dueDate = calculateDueDate(dueInDays);

    // Calculate next reminder date based on frequency
    const nextReminderDate = calculateNextReminderDate(
      dueDate,
      reminderFrequency
    );

    // Create initial payment history entry
    const initialHistory = {
      requestDate: new Date(),
      dueDate: dueDate,
      amount: requestData.amount,
      nextReminderDate: nextReminderDate,
      // status: "pending",
      participants: (requestData.participants || []).map((participant) => ({
        ...participant,
        reminderSent: false,
        reminderSentDate: null,
        paymentAmount: null,
        paidDate: null,
        amount: null,
      })),
    };

    // Create request in DB with initial history entry
    const request = await Request.create({
      ...requestData,
      owner: userId,
      reminderFrequency: reminderFrequency,
      paymentHistory: [initialHistory], // Add initial history as subdocument
    });

    // Now save request ID to user to associate with account
    await User.findByIdAndUpdate(
      userId,
      { $push: { requests: request._id } },
      { new: true }
    );

    res.status(201).json(request);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

const updateRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    // Find the request and check if user owns it
    const existingRequest = await Request.findById(id);

    if (!existingRequest) {
      return res.status(404).json({ error: "Request not found" });
    }

    // Check if the current user is the owner of the request
    if (existingRequest.owner.toString() !== userId.toString()) {
      return res
        .status(403)
        .json({ error: "Not authorized to update this request" });
    }

    // Update the request
    const updatedRequest = await Request.findByIdAndUpdate(
      id,
      { ...req.body },
      { new: true, runValidators: true }
    );

    res.json(updatedRequest);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  createRequest,
  getRequests,
  updateRequest,
};
