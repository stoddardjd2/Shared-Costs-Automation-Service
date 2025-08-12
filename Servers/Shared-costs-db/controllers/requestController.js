// controllers/requestController.js
const Request = require("../models/Request");
const User = require("../models/User");
const { ObjectId } = require("mongodb");
const { sendReminder } = require("../reminder-scheduler/reminderScheduler");
const {
  calculateNextReminderDate,
  calculateDueDate,
  checkTextMessagePermissions,
  emailNonApprovedParticipants,
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
    const {
      dueInDays = 7,
      reminderFrequency = "weekly",
      ...requestData
    } = req.body;
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

    // Add request to each participant's user document
    if (requestData.participants && requestData.participants.length > 0) {
      const participantUpdates = requestData.participants.map(
        async (participant) => {
          // If participant user exists, add request to their requests array
          await User.findByIdAndUpdate(
            participant._id,
            { $push: { requests: request._id } },
            { new: true }
          );
        }
      );
    }

    // upon success, send out emails to all participants to opt in for text messaging,
    // if already opted in, then ignore

    // this process could be improved:
    const participantsTextPermissions = await checkTextMessagePermissions(
      requestData.participants
    );

    const mailingResults = await emailNonApprovedParticipants(
      participantsTextPermissions,
      (requesterId = req.user._id), // or whatever identifies the sender
      (requesterName = req.user.name),
      requestData
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

const handleSendReminder = async (req, res) => {
  // restrict to only 1 reminder per day per participant
  // const REMINDER_INTERVAL_DAYS = 1;
  const REMINDER_INTERVAL_DAYS = 1;

  try {
    const { requestId, paymentHistoryId, userId } = req.params;
    const senderId = req.user._id;

    // 1) Load the request & auth
    const existingRequest = await Request.findById(requestId);
    if (!existingRequest)
      return res.status(404).json({ error: "Request not found" });
    if (existingRequest.owner.toString() !== senderId.toString()) {
      return res.status(403).json({ error: "Not authorized for this request" });
    }

    // 2) Locate the specific paymentHistory entry & participant in-app
    const ph = existingRequest.paymentHistory.find(
      (ph) => ph._id.toString() === paymentHistoryId
    );
    if (!ph)
      return res.status(404).json({ error: "Payment history item not found" });

    const participant = ph.participants.find(
      (p) => p._id.toString() === userId
    );
    if (!participant)
      return res.status(404).json({ error: "Participant not found" });

    // 3) Enforce interval at the app level
    const now = Date.now();
    const intervalMs = REMINDER_INTERVAL_DAYS * 24 * 60 * 60 * 1000;
    const lastSent = participant.reminderSentDate
      ? new Date(participant.reminderSentDate).getTime()
      : null;

    const eligible = !lastSent || now - lastSent >= intervalMs;

    if (!eligible) {
      const msLeft = intervalMs - (now - lastSent);
      const hoursLeft = Math.ceil(msLeft / (60 * 60 * 1000));
      return res.status(429).json({
        throttled: true,
        error: `Reminder throttled. Try again in ~${hoursLeft} hour(s).`,
        nextAllowedAt: new Date(lastSent + intervalMs),
      });
    }

    // 4) fetch owner/contact display info
    const owner = await User.findById(new ObjectId(req.user._id));
    const matchingContact = owner?.contacts?.find(
      (c) => c._id.toString() === userId
    );

    // 5) Gather extra info for the reminder (amount + dueDate)
    const extra = await Request.aggregate([
      {
        $match: {
          _id: new ObjectId(requestId),
          "paymentHistory._id": new ObjectId(paymentHistoryId),
          "paymentHistory.participants._id": new ObjectId(userId),
        },
      },
      {
        $project: {
          _id: 0,
          paymentHistory: {
            $map: {
              input: {
                $filter: {
                  input: "$paymentHistory",
                  as: "ph",
                  cond: { $eq: ["$$ph._id", new ObjectId(paymentHistoryId)] },
                },
              },
              as: "ph",
              in: {
                dueDate: "$$ph.dueDate",
                amount: {
                  $arrayElemAt: [
                    {
                      $map: {
                        input: {
                          $filter: {
                            input: "$$ph.participants",
                            as: "p",
                            cond: { $eq: ["$$p._id", new ObjectId(userId)] },
                          },
                        },
                        as: "p",
                        in: "$$p.amount",
                      },
                    },
                    0,
                  ],
                },
              },
            },
          },
        },
      },
    ]);

    const info = extra?.[0]?.paymentHistory?.[0];
    if (!info)
      return res
        .status(404)
        .json({ error: "Could not resolve amount/dueDate" });

    // 6) Send the reminder (only now that we know it's eligible)
    await sendReminder({
      requestId: existingRequest._id,
      requestName: existingRequest.name,
      requestOwner: owner?.name,
      requestOwnerPaymentMethods: owner?.paymentMethods || {},
      participantId: userId,
      participantName: matchingContact?.name,
      stillOwes: info.amount,
      dueDate: info.dueDate,
      requestData: existingRequest,
    });

    // 7) Persist reminderSent + reminderSentDate (+ nextReminderDate if you want)
    const nowDate = new Date();
    const nextReminderDate = new Date(now + intervalMs); // configurable interval

    const updateResult = await Request.findOneAndUpdate(
      {
        _id: new ObjectId(requestId),
        "paymentHistory._id": new ObjectId(paymentHistoryId),
        "paymentHistory.participants._id": new ObjectId(userId),
      },
      {
        $set: {
          "paymentHistory.$[p].participants.$[u].reminderSent": true,
          "paymentHistory.$[p].participants.$[u].reminderSentDate": nowDate,
          "paymentHistory.$[p].nextReminderDate": nextReminderDate,
        },
      },
      {
        arrayFilters: [
          { "p._id": new ObjectId(paymentHistoryId) },
          { "u._id": new ObjectId(userId) },
        ],
        returnDocument: "after", // Returns the document after the update
        // Alternative: returnOriginal: false (for older MongoDB drivers)
      }
    );

    return res.json({
      message: "Reminder sent",
      nextReminderDate,
      updateResult: updateResult,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: error.message });
  }
};

module.exports = {
  createRequest,
  getRequests,
  updateRequest,
  handleSendReminder,
};
