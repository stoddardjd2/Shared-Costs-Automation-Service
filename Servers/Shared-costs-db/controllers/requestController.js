// controllers/requestController.js
const Request = require("../models/Request");
const User = require("../models/User");
const { ObjectId } = require("mongodb");
const { mongoose } = require("mongoose");
const sendRequestsRouter = require("../send-request-helpers/sendRequestsRouter");
const {
  calculateNextReminderDate,
  calculateDaysFromNow,
  checkTextMessagePermissions,
  emailNonApprovedParticipants,
} = require("../utils/requestHelpers");
const sendReminder = require("../send-request-helpers/sendTextMessage");
// const createRequest = () => {};

const getRequests = async (req, res) => {
  try {
    // 1) Get the array of request IDs from the user doc
    const user = await User.findById(req.user._id).select("requests").lean();
    if (!user) return res.status(404).json({ error: "User not found" });

    const requestIds = (user.requests || [])
      .filter(Boolean)
      .map((id) => new ObjectId(id));

    // 2) If no ids, return empty list
    if (requestIds.length === 0) return res.json([]);

    // 3) Fetch only those requests (exclude soft-deleted)
    const requests = await Request.find({
      _id: { $in: requestIds },
      isDeleted: { $ne: true },
    }).lean();

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
      // assume due in week
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
    const dueDate = calculateDaysFromNow(dueInDays);

    // Calculate next reminder date based on frequency
    // send reminder on day its due
    const remindInDays = 3;
    const nextReminderDate = calculateDaysFromNow(remindInDays);
    // calculateNextReminderDate(
    //   dueDate,
    //   reminderFrequency
    // );
    let request;

    // Create initial payment history entry if startTiming is now
    if (requestData.startTiming == "now") {
      const initialHistory = {
        requestDate: calculateStartingDate(requestData.startTiming),
        dueDate: dueDate,
        amount: requestData.amount,
        totalAmount: requestData.totalAmount,
        totalAmountOwed: requestData.totalAmountOwed,
        nextReminderDate: nextReminderDate,
        // status: "pending",
        participants: (requestData.participants || []).map((participant) => ({
          reminderSent: false,
          reminderSentDate: null,
          paymentAmount: null,
          paidDate: null,
          requestSentDate: new Date(),
          amount: participant.amount,
          _id: new ObjectId(participant._id),
        })),
      };

      // Create request in DB with initial history entry
      const now = new Date();
      console.log("init data", requestData);
      request = await Request.create({
        ...requestData,
        createdAt: now,
        owner: userId,
        reminderFrequency: reminderFrequency,
        paymentHistory: [initialHistory], // Add initial history as subdocument
        lastSent: new Date(
          Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate())
        ), //set to start of current day so timing works with scheduler
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
            {
              $push: { participantForRequests: request._id },
              // Optionally store email if you want to track or reference it

              // MAY NEED TO REMOVE:
              // $set: { email: participant.email },
            },
            { new: true }
          );
        }
      );
    }

    // upon success, send out emails to all participants to opt in for text messaging,
    // if already opted in, then ignore

    // this process could be improved:
    // const participantsTextPermissions = await checkTextMessagePermissions(
    //   requestData.participants
    // );

    // const mailingResults = await emailNonApprovedParticipants(
    //   participantsTextPermissions,
    //   (requesterId = req.user._id), // or whatever identifies the sender
    //   (requesterName = req.user.name),
    //   requestData
    // );

    // send initial payment request to those approved for text messages or send after user opts in
    // Using send reminder function as intial request even though it is not a reminder
    //only send now if startTiming = "now"
    if (request.startTiming == "now") {
      const owner = await User.findById(new ObjectId(req.user._id));
      requestData.participants.forEach((participant) => {
        sendRequestsRouter({
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

    const alreadyPaid =
      participant.paidAmount >= participant.amount || participant.markedAsPaid;

    if (alreadyPaid) {
      return res.status(429).json({
        throttled: true,
        error: `Already paid`,
        markedAsPaid: participant.markedAsPaid,
        paidAmount: participant.paidAmount,
        amount: participant.amount,
      });
    }

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
    await sendRequestsRouter({
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
    const isMarkedAsPaid = participant.markedAsPaid;
    const amountOwed = originalAmount - paymentAmount;

    // Check if payment has already been made in full or overpaid
    if (currentPaymentAmount >= originalAmount || isMarkedAsPaid) {
      return res.status(400).json({
        success: false,
        error: "Payment has already been made",
        data: {
          originalAmount: originalAmount,
          currentPaymentAmount: currentPaymentAmount,
          isAlreadyPaid: true,
          paidDate: paidDate,
          isMarkedAsPaid: isMarkedAsPaid,
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

    // mark as paid by user (not master/source of truth)
    let userMarkedAsPaid = null;
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
          "paymentHistory.$[payment].participants.$[participant].participantMarkedAsPaid": true,
          "paymentHistory.$[payment].participants.$[participant].participantMarkedAsPaidDate":
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
    userMarkedAsPaid = true;

    // mark as paid for master if setting enabled:
    let masterMarkedAsPaid = null;
    if (currentRequest.allowMarkAsPaidForEveryone) {
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
            "paymentHistory.$[payment].participants.$[participant].markedAsPaid": true,
            "paymentHistory.$[payment].participants.$[participant].markedAsPaidDate":
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
      masterMarkedAsPaid = true;

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
    }

    // Text owner when payment recieved if opted in and premium:
    try {
      console.log("marked paid, try send text");
      const ownerId = currentRequest.owner; // the creator of the request
      const owner = await User.findById(ownerId).select(
        "phone reminderPreference plan name"
      );

      console.log(
        "booleans",
        currentRequest.allowPaymentNotificationsInfo,
        owner,
        owner.phone,
        // owner.reminderPreference.payments === true && // your opt-in flag
        ["professional", "premium", "free"].includes(owner.plan)
      );
      if (
        currentRequest.allowPaymentNotificationsInfo &&
        owner &&
        owner.phone &&
        // owner.reminderPreference.payments === true && // your opt-in flag
        ["professional", "premium", "free"].includes(owner.plan) // allowed plans (INCLUDES FREE FOR NOW)
      ) {
        console.log("sending text");

        const participantUser = await User.findById(userId).select("name");

        const safeAmount =
          paymentAmount ?? participant?.paymentAmount ?? originalAmount ?? 0;
requestId, paymentHistoryId, userId 


    const urlBase = `${process.env.CLIENT_URL}/markAsPaid`;
   const url = new URL(urlBase);
    url.searchParams.set("userId", userId);
    url.searchParams.set("paymentHistoryId", paymentHistoryId);
    url.searchParams.set("requestId", requestId);
    // url.searchParams.set("name", name);
    const finalUrl = url.toString();


        const body = `Hi ${owner.name},
${participantUser?.name || "a participant"} marked their request as paid.

AMOUNT: $${safeAmount}
FOR: ${currentRequest.name}

Confirm you recieved the payment then click URL to mark as paid: ${finalUrl}

Sent via Splitify
`;

        const to = owner.phone;

        // IMPORTANT: don't pass "" as from — let sendReminder use its default
        sendReminder(to, undefined, body);
      }
    } catch (err) {
      console.error("Error sending owner payment notification:", err);
    }

    return res.status(200).json({
      success: true,
      message: "Payment updated successfully",
      data: {
        request: result,
        masterMarkedAsPaid: masterMarkedAsPaid,
        userMarkedAsPaid: userMarkedAsPaid,
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

const handleToggleMarkAsPaid = async (req, res) => {
  console.log("Toggling mark as paid with data:", req.params);
  try {
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
    const isCurrentlyMarkedAsPaid = participant.markedAsPaid || false;
    const paidDate = participant.paidDate;

    // Toggle the markedAsPaid status
    const newMarkedAsPaid = !isCurrentlyMarkedAsPaid;
    const actionType = newMarkedAsPaid ? "marked" : "unmarked";

    // Update the markedAsPaid field in the Request collection
    const result = await Request.findOneAndUpdate(
      {
        _id: new ObjectId(requestId),
        "paymentHistory._id": new ObjectId(paymentHistoryId),
        "paymentHistory.participants._id": new ObjectId(userId),
      },
      {
        $set: {
          "paymentHistory.$[payment].participants.$[participant].markedAsPaid":
            newMarkedAsPaid,
          "paymentHistory.$[payment].participants.$[participant].markedAsPaidDate":
            newMarkedAsPaid ? new Date() : null,
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

    // Calculate status for response (considering both actual payments and marked status)
    const effectivelyPaid =
      newMarkedAsPaid || currentPaymentAmount >= originalAmount;
    const amountOwed = effectivelyPaid
      ? 0
      : originalAmount - currentPaymentAmount;

    // Handle User model updates based on action
    let userUpdate;

    if (newMarkedAsPaid) {
      // Mark as paid - update existing entry or create new one if it doesn't exist
      const existingEntry = await User.findOne({
        _id: userId,
        "paymentHistory.requestId": new ObjectId(requestId),
        "paymentHistory.paymentHistoryId": new ObjectId(paymentHistoryId),
      });

      if (existingEntry) {
        // Update existing entry
        userUpdate = await User.findOneAndUpdate(
          {
            _id: userId,
            "paymentHistory.requestId": new ObjectId(requestId),
            "paymentHistory.paymentHistoryId": new ObjectId(paymentHistoryId),
          },
          {
            $set: {
              "paymentHistory.$.markedAsPaid": true,
              "paymentHistory.$.markedAmount":
                originalAmount - currentPaymentAmount,
              "paymentHistory.$.isFullyPaid": true,
              "paymentHistory.$.amountOwed": 0,
              "paymentHistory.$.markedAsPaidDate": new Date(),
            },
            $inc: {
              totalMarkedAsPaid: 1,
              totalMarkedAmount: originalAmount - currentPaymentAmount,
            },
            $set: {
              lastMarkedAsPaidDate: new Date(),
            },
          },
          {
            new: true,
          }
        );
      } else {
        // Create new entry if it doesn't exist
        userUpdate = await User.findByIdAndUpdate(
          userId,
          {
            $push: {
              paymentHistory: {
                requestId: new ObjectId(requestId),
                paymentHistoryId: new ObjectId(paymentHistoryId),
                originalAmount: originalAmount,
                amountPaid: currentPaymentAmount,
                markedAmount: originalAmount - currentPaymentAmount,
                amountOwed: 0,
                paidDate: paidDate,
                requestName: currentRequest.name,
                isFullyPaid: true,
                markedAsPaid: true,
                markedAsPaidDate: new Date(),
              },
            },
            $inc: {
              totalMarkedAsPaid: 1,
              totalMarkedAmount: originalAmount - currentPaymentAmount,
            },
            $set: {
              lastMarkedAsPaidDate: new Date(),
            },
          },
          {
            upsert: true,
            new: true,
          }
        );
      }
    } else {
      // Unmark as paid - update existing entry but preserve payment history
      const isStillFullyPaid = currentPaymentAmount >= originalAmount;

      userUpdate = await User.findOneAndUpdate(
        {
          _id: userId,
          "paymentHistory.requestId": new ObjectId(requestId),
          "paymentHistory.paymentHistoryId": new ObjectId(paymentHistoryId),
          "paymentHistory.markedAsPaid": true,
        },
        {
          $set: {
            "paymentHistory.$.markedAsPaid": false,
            "paymentHistory.$.markedAmount": 0,
            "paymentHistory.$.isFullyPaid": isStillFullyPaid, // Based on actual payments
            "paymentHistory.$.amountOwed": isStillFullyPaid
              ? 0
              : originalAmount - currentPaymentAmount,
            "paymentHistory.$.markedAsPaidDate": null, // Clear the marked date when unmarking
          },
          $inc: {
            totalMarkedAsPaid: -1,
            totalMarkedAmount: -(originalAmount - currentPaymentAmount),
          },
        },
        {
          new: true,
        }
      );

      // Update lastMarkedAsPaidDate if there are still marked payments
      const remainingMarkedPayments = userUpdate?.paymentHistory?.filter(
        (p) => p.markedAsPaid
      );
      if (remainingMarkedPayments && remainingMarkedPayments.length > 0) {
        const lastMarkedPayment = remainingMarkedPayments.sort(
          (a, b) => new Date(b.markedAsPaidDate) - new Date(a.markedAsPaidDate)
        )[0];

        await User.findByIdAndUpdate(userId, {
          $set: {
            lastMarkedAsPaidDate: lastMarkedPayment.markedAsPaidDate,
          },
        });
      } else {
        // No marked payments left, remove lastMarkedAsPaidDate
        await User.findByIdAndUpdate(userId, {
          $unset: {
            lastMarkedAsPaidDate: "",
          },
        });
      }
    }

    return res.status(200).json({
      success: true,
      message: `Payment ${actionType} as paid successfully`,
      data: {
        request: result,
        paymentSummary: {
          originalAmount: originalAmount,
          actualAmountPaid: currentPaymentAmount, // Actual payment amount unchanged
          effectiveAmountPaid: originalAmount, // Full amount when marked as paid
          amountOwed: amountOwed,
          isMarkedAsPaid: newMarkedAsPaid,
          isEffectivelyPaid: effectivelyPaid, // Either marked or actually paid in full
          isActuallyFullyPaid: currentPaymentAmount >= originalAmount, // Based on actual payments only
          actionPerformed: actionType,
          markedAsPaidDate: newMarkedAsPaid ? new Date() : null,
        },
      },
    });
  } catch (error) {
    console.error("Error toggling marked as paid status:", error);
    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

const handlePaymentDetails = async (req, res) => {
  try {
    const { requestId, paymentHistoryId, userId } = req.params;
    const requestObjectId = new ObjectId(requestId);
    const historyObjectId = new ObjectId(paymentHistoryId);
    const participantObjectId = new ObjectId(userId);

    const requestDocument = await Request.findOne({
      _id: requestObjectId,
      paymentHistory: {
        $elemMatch: {
          _id: historyObjectId,
          "participants._id": participantObjectId,
        },
      },
    });

    const owner = await User.findById(new ObjectId(requestDocument.owner));
    const OwnerName = owner.name;
    const ownerPaymentMethods = owner.paymentMethods;

    const convertToNumber = (value) =>
      typeof value === "number" ? value : Number(value ?? 0);

    const thisPaymentHistory = requestDocument?.paymentHistory?.find(
      (history) => history._id?.equals(historyObjectId)
    );

    const thisParticipant = thisPaymentHistory?.participants?.find(
      (participant) => participant._id?.equals(participantObjectId)
    );

    // ✅ Step-by-step boolean evaluation
    let paidInFull = false;
    let amountLeft;

    if (thisParticipant) {
      const amountOwed = convertToNumber(thisParticipant.amount);
      const amountPaid = convertToNumber(thisParticipant.paymentAmount);

      amountLeft = amountOwed - amountPaid;

      if (thisParticipant.markedAsPaid === true) {
        paidInFull = true; // manual override
      } else if (amountPaid >= amountOwed) {
        paidInFull = true; // fully paid
      }
    }

    return res.status(200).json({
      success: true,
      isPaidInFull: paidInFull,
      amountOwed: amountLeft,
      owedTo: OwnerName,
      allowMarkAsPaidForEveryone:
        requestDocument?.allowMarkAsPaidForEveryone || false,
      paymentMethods: ownerPaymentMethods,
      dueDate: thisPaymentHistory.dueDate,
      amountPaid: thisParticipant.amount,
      requestName: requestDocument.name,
      markedAsPaid: thisParticipant.markedAsPaid,
      participantMarkedAsPaid: thisParticipant.participantMarkedAsPaid,
      datePaid: thisParticipant.paidDate || thisParticipant.markedAsPaidDate,
      message: `Request ${paidInFull ? "paid in full" : "not paid in full"}`,
    });
  } catch (error) {
    console.error("Error checking if paid:", error);
    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

const handleTogglePauseRequest = async (req, res) => {
  try {
    const { requestId } = req.params;
    const userId = req.user._id; // Assuming user ID comes from auth middleware

    // Validate input
    if (!requestId) {
      return res.status(400).json({
        success: false,
        message: "Request ID is required",
      });
    }

    // Validate ObjectId format
    if (!ObjectId.isValid(requestId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid request ID format",
      });
    }

    // Find the request and verify ownership
    const request = await Request.findOne({
      _id: new ObjectId(requestId),
      owner: userId, // Assuming requests have userId field for ownership
    });

    if (!request) {
      return res.status(404).json({
        success: false,
        message: "Request not found or you do not have permission to modify it",
      });
    }

    // Check if request is already deleted
    if (request.isDeleted) {
      return res.status(400).json({
        success: false,
        message: "Cannot modify a deleted request",
      });
    }

    // Toggle pause status
    const newPauseStatus = !request.isPaused;

    // Update the request
    const updateResult = await Request.updateOne(
      { _id: new ObjectId(requestId) },
      {
        $set: {
          isPaused: newPauseStatus,
        },
      }
    );

    if (updateResult.matchedCount === 0) {
      return res.status(404).json({
        success: false,
        message: "Request not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: `Request ${newPauseStatus ? "paused" : "unpaused"} successfully`,
      data: {
        requestId: requestId,
        isPaused: newPauseStatus,
      },
    });
  } catch (error) {
    console.error("Error toggling request pause status:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Controller to handle deleting a request (soft delete)

// assumes: const mongoose = require("mongoose");

const handleDeleteRequest = async (req, res) => {
  try {
    const { requestId } = req.params;
    const userId = req.user._id;
    const useTransactions = process.env.NODE_ENV === "production";

    if (!requestId) {
      return res
        .status(400)
        .json({ success: false, message: "Request ID is required" });
    }
    if (!ObjectId.isValid(requestId)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid request ID format" });
    }

    // Find and verify ownership
    const request = await Request.findOne({
      _id: new ObjectId(requestId),
      owner: userId,
    });
    if (!request) {
      return res.status(404).json({
        success: false,
        message: "Request not found or you do not have permission to delete it",
      });
    }
    if (request.isDeleted) {
      return res
        .status(400)
        .json({ success: false, message: "Request is already deleted" });
    }

    // --- Try transactional path first (preferred) ---
    if (useTransactions) {
      const session = await mongoose.startSession();
      try {
        await session.withTransaction(async () => {
          const upd = await Request.updateOne(
            { _id: request._id },
            {
              $set: { isDeleted: true, isPaused: false, deletedAt: new Date() },
            },
            { session }
          );
          if (upd.matchedCount === 0)
            throw new Error("Request not found for update");

          const userUpd = await User.updateOne(
            { _id: userId },
            { $pull: { requests: request._id } },
            { session }
          );
          // Require actual removal from the array
          if (userUpd.matchedCount === 0)
            throw new Error("User not found for update");
          if ((userUpd.modifiedCount ?? userUpd.nModified ?? 0) === 0) {
            throw new Error(
              "Failed to pull request from user's requests array"
            );
          }
        });

        // Transaction committed
        return res.status(200).json({
          success: true,
          message: "Request deleted successfully",
          data: { requestId, isDeleted: true },
        });
      } catch (txnErr) {
        // If transaction not supported or failed, fall through to compensating path
        session.endSession();
        // Only fall back for topology/txn support issues; otherwise return error
        const msg = String(txnErr?.message || "");
        const looksLikeNoTxnSupport =
          msg.includes("replica set") ||
          msg.includes(
            "Transaction numbers are only allowed on a replica set"
          ) ||
          msg.includes("not supported");

        if (!looksLikeNoTxnSupport) {
          console.error("Transactional delete failed:", txnErr);
          return res
            .status(500)
            .json({ success: false, message: "Failed to delete request" });
        }
        // continue to non-transactional compensating logic
      }
    }

    // --- Non-transactional compensating path (dev/local without replica set) ---
    const prevPaused = !!request.isPaused;

    // Step 1: soft-delete
    const upd = await Request.updateOne(
      { _id: request._id },
      { $set: { isDeleted: true, isPaused: false, deletedAt: new Date() } }
    );
    if (upd.matchedCount === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Request not found" });
    }

    // Step 2: pull from user array
    const userUpd = await User.updateOne(
      { _id: userId },
      { $pull: { requests: request._id } }
    );

    const removed = (userUpd.modifiedCount ?? userUpd.nModified ?? 0) > 0;
    if (!removed) {
      // COMPENSATION: revert the request doc since user array was not updated
      try {
        await Request.updateOne(
          { _id: request._id },
          {
            $set: { isDeleted: false, isPaused: prevPaused },
            $unset: { deletedAt: "" },
          }
        );
      } catch (revertErr) {
        console.error(
          "CRITICAL: Delete compensation failed; manual cleanup needed.",
          revertErr
        );
      }
      return res.status(500).json({
        success: false,
        message:
          "Failed to remove request from user's requests array; no changes were persisted.",
      });
    }

    // Both steps succeeded
    return res.status(200).json({
      success: true,
      message: "Request deleted successfully",
      data: { requestId, isDeleted: true },
    });
  } catch (error) {
    console.error("Error deleting request:", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};

const handleLogPaymentView = async (req, res) => {
  try {
    const { requestId, paymentHistoryId, userId } = req.params;
    const requestObjectId = new ObjectId(requestId);
    const historyObjectId = new ObjectId(paymentHistoryId);
    const participantObjectId = new ObjectId(userId);

    const requestDocument = await Request.updateOne(
      { _id: requestObjectId },
      {
        $set: {
          "paymentHistory.$[history].participants.$[participant].paymentLinkClicked": true,
          "paymentHistory.$[history].participants.$[participant].paymentLinkClickedDate":
            new Date(),
        },
      },
      {
        arrayFilters: [
          { "history._id": historyObjectId },
          { "participant._id": participantObjectId },
        ],
      }
    );

    console.log("logging", requestDocument);
    return res.status(200).json({
      success: true,
      message: "Payment view logged successfully",
    });
  } catch (error) {
    console.error("Error marking payment link clicked:", error);
    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

const handleLogLastClickedPaymentMethod = async (req, res) => {
  try {
    const { requestId, paymentHistoryId, userId } = req.params;
    const { paymentMethodName } = req.body;
    const requestObjectId = new ObjectId(requestId);
    const historyObjectId = new ObjectId(paymentHistoryId);
    const participantObjectId = new ObjectId(userId);

    console.log("lastClickedPaymentMethod", paymentMethodName);

    const requestDocument = await Request.updateOne(
      { _id: requestObjectId },
      {
        $set: {
          "paymentHistory.$[history].participants.$[participant].lastClickedPaymentMethod":
            paymentMethodName,
        },
      },
      {
        arrayFilters: [
          { "history._id": historyObjectId },
          { "participant._id": participantObjectId },
        ],
      }
    );

    return res.status(200).json({
      success: true,
      message: "Last clicked method logged",
    });
  } catch (error) {
    console.error("Error logging last clicked method:", error);
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
  handleToggleMarkAsPaid,
  handlePaymentDetails,
  handleDeleteRequest,
  handleTogglePauseRequest,
  handleLogPaymentView,
  handleLogLastClickedPaymentMethod,
};
