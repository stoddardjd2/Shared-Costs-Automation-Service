const Telnyx = require("telnyx");
const telnyx = new Telnyx(process.env.TELNYX_API_KEY);

async function sendReminder(to, from, body) {
  console.log("text payload", to, from, body)
  try {
    // `from` is your Telnyx number assigned to the Messaging Profile
    const res = await telnyx.messages.create({
      from: from,
      to: to,
      text: String(body),
      // messaging_profile_id: process.env.TELNYX_MESSAGING_PROFILE_ID,
      // webhook_url: "https://your-domain.com/webhooks/telnyx/dlr" // optional per-message DLR
    });
    console.log("sending TEXT to, from, body", to, from, body);
    return res.data;
  } catch (err) {
    console.log("error sending text!", err);
  }
}

module.exports = sendReminder;
