const sendEmailRequest = require("./sendEmailRequest");
const sentTextMessage = require("./sendTextMessage");
const User = require("../models/User");

async function sendRequestsRouter(reminderData) {
  // TODO: Implement your SMS/Email sending logic here
  //Generate payment URL

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
  url.searchParams.set("dueDate", dueDate);
  url.searchParams.set("name", name);
  url.searchParams.set("amount", amount);
  url.searchParams.set("frequency", frequency);
  url.searchParams.set("requester", requester);
  url.searchParams.set("chargeName", chargeName);
  url.searchParams.set("cashapp", cashapp);
  url.searchParams.set("venmo", venmo);
  url.searchParams.set(
    "allowMarkAsPaidForEveryone",
    allowMarkAsPaidForEveryone
  );

  const finalUrl = url.toString();
  // Example implementation:
  // await sendSMS(reminderData.participantId, message);
  // await sendEmail(reminderData.participantId, subject, message);
  const user = await User.findOne(
    { _id: userId },
    { email: 1, phone: 1, _id: 0 }
  );

  console.log(`URL FOR ${name}!`, finalUrl);
  console.log("sening req, getting user filtered", user);
  sendEmailRequest(requester, name, amount, finalUrl, user.email);

  const message = `Hi ${name},
${requester} sent you a payment request.

AMOUNT REQUESTED: $${amount}
FOR: ${chargeName}

To complete your payment, visit: ${finalUrl}

Sent via Splitify
Split expenses. Automate follow-ups.`;

  sentTextMessage(user.phone, "+18333702013", message);
  return true;
}
module.exports = sendRequestsRouter;
