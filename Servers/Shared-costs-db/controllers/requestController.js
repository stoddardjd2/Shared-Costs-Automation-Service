// controllers/requestController.js
const Request = require("../models/Request");
const User = require("../models/User");

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
  try {
    const userId = req.user._id; // From auth middleware
    const { dueInDays, ...requestData } = req.body;

    // Calculate due date - default to 7 days if not specified
    let calculatedDueDate = requestData.dueDate;
    if (!calculatedDueDate) {
      const now = new Date();
      const daysToAdd =
        dueInDays && typeof dueInDays === "number" ? dueInDays : 7;
      calculatedDueDate = new Date(
        now.getTime() + daysToAdd * 24 * 60 * 60 * 1000
      );
    }

    // Create initial payment history entry
    const initialHistory = {
      requestDate: new Date(),
      dueDate: calculatedDueDate,
      amount: requestData.amount,
      status: "pending",
      participants: (requestData.participants || []).map((participant) => ({
        ...participant,
        reminderSent: false,
        lastReminderDate: null,
        paymentAmount: null,
      })),
    };

    // Create request in DB with initial history entry
    const request = await Request.create({
      ...requestData,
      dueDate: calculatedDueDate,
      owner: userId,
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
