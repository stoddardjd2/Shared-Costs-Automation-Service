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

    function calculateStartingDate(startTiming) {
      // request date represents when first request should be sent
      if (startTiming == "now") {
        return new Date();
      } else {
        return new Date(startTiming);
      }
    }
    // Calculate due date - accepts starting date param
    const dueDate = calculateDueDate(dueInDays);

    // Calculate next reminder date based on frequency
    const nextReminderDate = calculateNextReminderDate(
      dueDate,
      reminderFrequency
    );

    let request;

    // Create initial payment history entry if startTiming is now
    if (requestData.startTiming == "now") {
      const initialHistory = {
        requestDate: calculateStartingDate(requestData.startTiming),
        dueDate: dueDate,
        amount: requestData.amount,
        nextReminderDate: nextReminderDate,
        // status: "pending",
        participants: (requestData.participants || []).map((participant) => ({
          reminderSent: false,
          reminderSentDate: null,
          paymentAmount: null,
          paidDate: null,
          amount: participant.amount,
          _id: new ObjectId(participant._id),
        })),
      };

      // Create request in DB with initial history entry
      request = await Request.create({
        ...requestData,
        owner: userId,
        reminderFrequency: reminderFrequency,
        paymentHistory: [initialHistory], // Add initial history as subdocument
        lastSent: new Date()
      });
    } else {
      // for future payment, do not add history yet as has not sent request
      request = await Request.create({
        ...requestData,
        owner: userId,
        reminderFrequency: reminderFrequency,
      });
    }

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

    // send initial payment request to those approved for text messages or send after user opts in
    // Using send reminder function as intial request even though it is not a reminder
    //only send now if startTiming = "now"
    if (request.startTiming == "now") {
      const owner = await User.findById(new ObjectId(req.user._id));
      participantsTextPermissions.forEach((participant) => {
        if (participant.canText) {
          sendReminder({
            requestId: request._id,
            paymentHistoryId: request.paymentHistory[0]._id,
            requestName: request.name,
            requestOwner: owner.name,
            requestOwnerPaymentMethods: owner.paymentMethods || {},
            participantId: participant._id,
            participantName: participant.name,
            stillOwes: participant.amount || request.amount,
            dueDate: request.paymentHistory[0].dueDate,
            requestData: request,
          });
        }
      });
    }

    // sendReminder({
    //   requestId: existingRequest._id,
    //   paymentHistoryId: paymentHistoryId,
    //   requestId: requestId,
    //   requestName: existingRequest.name,
    //   requestOwner: owner?.name,
    //   requestOwnerPaymentMethods: owner?.paymentMethods || {},
    //   participantId: userId,
    //   participantName: matchingContact?.name,
    //   stillOwes: info.amount,
    //   dueDate: info.dueDate,
    //   requestData: existingRequest,
    // });

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
      paymentHistoryId: paymentHistoryId,
      requestId: requestId,
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

// Alternative simpler approach using positional operators
const handlePayment = async (req, res) => {
  try {
    const { paymentAmount } = req.body;
    const { requestId, paymentHistoryId, userId } = req.params;

    // First, fetch the current document to check payment status
    const currentRequest = await Request.findOne({
      _id: new ObjectId(requestId),
      "paymentHistory._id": new ObjectId(paymentHistoryId),
      "paymentHistory.participants._id": new ObjectId(userId),
    });

    if (!currentRequest) {
      return res.status(404).json({
        error:
          "Payment request not found or user not authorized for this payment",
      });
    }

    // Find the specific payment history entry and participant
    const paymentEntry = currentRequest.paymentHistory.find(
      (payment) => payment._id.toString() === paymentHistoryId
    );

    const participant = paymentEntry.participants.find(
      (p) => p._id.toString() === userId
    );

    const originalAmount = participant.amount;
    const currentPaymentAmount = participant.paymentAmount || 0;
    const paidDate = participant.paidDate;

    // Check if payment has already been made in full or overpaid
    if (currentPaymentAmount >= originalAmount) {
      return res.status(400).json({
        success: false,
        error: "Payment has already been made in full or overpaid",
        data: {
          originalAmount: originalAmount,
          currentPaymentAmount: currentPaymentAmount,
          isAlreadyPaid: true,
          paidDate: paidDate,
        },
      });
    }

    // Check if the new payment amount would exceed the original amount
    if (paymentAmount > originalAmount) {
      return res.status(400).json({
        success: false,
        error: `Payment amount ($${paymentAmount}) exceeds the original amount owed ($${originalAmount})`,
        data: {
          originalAmount: originalAmount,
          requestedPayment: paymentAmount,
          maxAllowedPayment: originalAmount,
          paidDate: paidDate,
          alreadyPaid: true,
        },
      });
    }

    // Proceed with the update if checks pass
    const result = await Request.findOneAndUpdate(
      {
        _id: new ObjectId(requestId),
        "paymentHistory._id": new ObjectId(paymentHistoryId),
        "paymentHistory.participants._id": new ObjectId(userId),
      },
      {
        $set: {
          "paymentHistory.$[payment].participants.$[participant].paymentAmount":
            paymentAmount,
          "paymentHistory.$[payment].participants.$[participant].paidDate":
            new Date(),
        },
      },
      {
        arrayFilters: [
          { "payment._id": new ObjectId(paymentHistoryId) },
          { "participant._id": new ObjectId(userId) },
        ],
        new: true,
      }
    );

    const amountOwed = originalAmount - paymentAmount;

    // Update User model to track this payment
    const userUpdate = await User.findByIdAndUpdate(
      userId,
      {
        $push: {
          paymentHistory: {
            requestId: new ObjectId(requestId),
            paymentHistoryId: new ObjectId(paymentHistoryId),
            originalAmount: originalAmount,
            amountPaid: paymentAmount,
            amountOwed: amountOwed,
            paidDate: new Date(),
            requestName: currentRequest.name,
            isFullyPaid: amountOwed <= 0,
          },
        },
        $inc: {
          totalPaymentsMade: 1,
          totalAmountPaid: paymentAmount,
        },
        $set: {
          lastPaymentDate: new Date(),
        },
      },
      {
        upsert: true,
        new: true,
      }
    );

    return res.status(200).json({
      success: true,
      message: "Payment updated successfully",
      data: {
        request: result,
        paymentSummary: {
          originalAmount: originalAmount,
          amountPaid: paymentAmount,
          amountOwed: amountOwed,
          isFullyPaid: amountOwed <= 0,
        },
      },
    });
  } catch (error) {
    console.error("Error updating payment:", error);
    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

module.exports = {
  createRequest,
  getRequests,
  updateRequest,
  handleSendReminder,
  handlePayment,
};
