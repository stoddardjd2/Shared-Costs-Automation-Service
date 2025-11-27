const Telnyx = require("telnyx");

if (!process.env.TELNYX_API_KEY) {
  console.error("[Telnyx] Missing TELNYX_API_KEY env var");
}

const telnyx = new Telnyx(process.env.TELNYX_API_KEY);

/**
 * Sends an SMS reminder via Telnyx.
 * Returns a normalized result:
 *  { success: true, data } on success
 *  { success: false, error } on failure
 */
async function sendReminder(to, from = "+18333702013", body) {
  console.log("[Telnyx] sendReminder payload:", { to, from, body: String(body) });

  try {
    const res = await telnyx.messages.create({
      from,
      to,
      text: String(body),
      // messaging_profile_id: process.env.TELNYX_MESSAGING_PROFILE_ID,
    });

    console.log("[Telnyx] SMS sent successfully", {
      to,
      from,
      messageId: res?.data?.id,
      status: res?.data?.status,
    });

    return {
      success: true,
      data: res.data,
    };
  } catch (err) {
    // Try to pull out the juicy bits from Telnyx error structure
    const telnyxError = err?.raw?.errors?.[0];

    const normalizedError = {
      message: err.message || telnyxError?.detail || "Failed to send SMS via Telnyx",
      type: err.type || "TelnyxError",
      statusCode: err.statusCode || err.raw?.statusCode || null,
      code: telnyxError?.code || null,
      detail: telnyxError?.detail || null,
      // keep the original around for debugging if needed
      raw: err.raw || null,
    };

    console.error("[Telnyx] Error sending SMS", {
      to,
      from,
      error: normalizedError,
    });

    // You can either throw here or just return the error object.
    // Throwing will bubble up to your route and hit its try/catch.
    // throw Object.assign(new Error(normalizedError.message), normalizedError);

    return {
      success: false,
      error: normalizedError,
    };
  }
}

module.exports = sendReminder;
