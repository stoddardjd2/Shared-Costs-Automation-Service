const Telnyx = require("telnyx");
const telnyx = new Telnyx(process.env.TELNYX_API_KEY);

async function sendReminder( to, from, body ) {
  // `from` is your Telnyx number assigned to the Messaging Profile
  const res = await telnyx.messages.create({
    from: from,
    to: to,
    text: String(body),
    // messaging_profile_id: process.env.TELNYX_MESSAGING_PROFILE_ID,
    // webhook_url: "https://your-domain.com/webhooks/telnyx/dlr" // optional per-message DLR
  });
  console.log("TEXT MESSAGE SENT, RESPONSE:", res);
  console.log("sending to, from, body", to, from, body);
  return res.data;
}

module.exports = sendReminder;
