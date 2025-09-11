const sendEmailRequest = require("./sendEmailRequest");
const sendTextMessage = require("./sendTextMessage");
const User = require("../models/User");

// routes is array of strings with channels to send messages to EX: ["text", "email"]
async function sendRequestsRouter(reminderData, routes = ["text", "email"]) {
  // TODO: Implement your SMS/Email sending logic here
  //Generate payment URL
  try {
    const isTextEnabled = await User.findById("68c1d9c25dcc518c5641b28b", {
      "textMessagesAllowed.isAllowed": true,
    });

    function getFrequency(requestData) {
      const { frequency, customInterval, customUnit } = requestData;
      if (frequency !== "custom") {
        return frequency;
      } else {
        if (frequency === "custom") {
          // Handle pluralization for time units
          const getSingularUnit = (unit) => {
            const singularMap = {
              months: "month",
              days: "day",
              weeks: "week",
              years: "year",
            };
            return singularMap[unit] || unit;
          };

          const unit =
            customInterval === 1 ? getSingularUnit(customUnit) : customUnit;
          return `Every ${customInterval} ${unit}`;
        }
      }
    }

    const urlBase = `${process.env.CLIENT_URL}/paymentPortal`;
    const userId = reminderData.participantId;
    const paymentHistoryId = reminderData.paymentHistoryId;
    const requestId = reminderData.requestId;
    const dueDate = reminderData.dueDate;
    const name = reminderData.participantName;
    const amount = reminderData.stillOwes;
    const frequency = getFrequency(reminderData.requestData);
    const requester = reminderData.requestOwner;
    const chargeName = reminderData.requestName;
    const cashapp = reminderData.requestOwnerPaymentMethods?.cashapp || null;
    const venmo = reminderData.requestOwnerPaymentMethods?.venmo || null;
    const allowMarkAsPaidForEveryone =
      reminderData.requestData?.allowMarkAsPaidForEveryone || false;

    const url = new URL(urlBase);
    url.searchParams.set("userId", userId);
    url.searchParams.set("paymentHistoryId", paymentHistoryId);
    url.searchParams.set("requestId", requestId);
    url.searchParams.set("name", name);

    const finalUrl = url.toString();
    // Example implementation:
    // await sendSMS(reminderData.participantId, message);
    // await sendEmail(reminderData.participantId, subject, message);
    const user = await User.findOne(
      { _id: userId },
      { email: 1, phone: 1, _id: 0 }
    );
    console.log(`URL FOR ${name}!`, finalUrl);

    if (routes.includes("email")) {
      console.log("sending email");
      sendEmailRequest(requester, name, amount, finalUrl, user.email);
    }

    const message = `Hi ${name},
${requester} sent you a payment request.

AMOUNT REQUESTED: $${amount}
FOR: ${chargeName}

To complete your payment, visit: ${finalUrl}

Sent via Splitify
`;

    if (routes.includes("text") && isTextEnabled) {
      console.log("sending text");
      sendTextMessage(user.phone, "+18333702013", message);
    }
    return true;
  } catch (err) {
    console.log("error in requestRouter", err);
  }
}
module.exports = sendRequestsRouter;
