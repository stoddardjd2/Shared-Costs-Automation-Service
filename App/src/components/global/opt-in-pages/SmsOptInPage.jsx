import React, { useMemo, useState } from "react";
import PhoneInput from "../../common/PhoneInput";
// Route example:
//   /sms/opt-in?userID=...&userName=...&requesterName=...&paymentName=...&paymentAmount=...
import { smsOptIn } from "../../../queries/user";
export default function SmsOptInPage() {
  const params = useMemo(() => new URLSearchParams(window.location.search), []);

  const initial = {
    userID: params.get("userId") || "",
    userName: params.get("name") || "",
    requesterName: params.get("requester") || "",
    paymentName: params.get("chargeName") || "",
    paymentAmount: params.get("amount") || "",
    frequency: params.get("frequency") || "",
  };

  const [phone, setPhone] = useState("");
  const [consent, setConsent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [confirmedPhone, setConfirmedPhone] = useState("");

  const themePrimary = "rgb(37 99 235)"; // blue-600

  // --- Phone formatting helpers ---
  function digitsOnly(s) {
    return String(s || "").replace(/[^0-9]/g, "");
  }

  // Convert formatted input to raw numeric string starting with 1 (no symbols)
  function toRawUS(formatted) {
    let d = digitsOnly(formatted);
    if (!d) return null;
    if (d[0] !== "1") d = "1" + d;
    d = d.slice(0, 11); // strictly 1 + 10 digits
    return d.length === 11 ? d : null;
  }

  // Format phone for display in confirmation
  function formatPhoneDisplay(raw) {
    if (!raw || raw.length !== 11) return raw;
    return `+${raw[0]} (${raw.slice(1, 4)}) ${raw.slice(4, 7)}-${raw.slice(7)}`;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setMessage(null);

    const rawPhone = toRawUS(phone);
    if (!rawPhone) {
      setMessage({
        type: "error",
        text: "Please enter a valid US number (e.g., +1 (422) 1244 1251).",
      });
      return;
    }
    if (!consent) {
      setMessage({
        type: "error",
        text: "You must agree to receive text messages to continue.",
      });
      return;
    }

    setLoading(true);

    try {
      await smsOptIn(initial.userID, rawPhone, consent);
      setMessage({
        type: "success",
        text: "You're all set! Text notifications are now enabled.",
      });
      setConfirmedPhone(rawPhone);
      setIsConfirmed(true);
    } catch (err) {
      console.log("CATCH", err);
      setMessage({
        type: "error",
        text:
          (err && err.message) ||
          err.error ||
          "Something went wrong. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  }

  // Confirmation View
  if (isConfirmed) {
    return (
      <div className="min-h-screen bg-gray-50">
        <main className="px-4 py-8 flex items-center justify-center">
          <div className="w-full max-w-xl">
            <div
              className="rounded-3xl shadow-xl overflow-hidden bg-white"
              style={{ boxShadow: "0 10px 30px rgba(0,0,0,0.08)" }}
            >
              {/* Success Hero */}
              <div
                className="p-8 text-white"
                style={{
                  background: `linear-gradient(135deg, rgb(34 197 94) 0%, rgba(34,197,94,0.85) 60%, rgba(34,197,94,0.75) 100%)`,
                }}
              >
                <div className="flex items-center gap-3">
                  <div className="h-11 w-11 rounded-2xl bg-white/15 grid place-items-center ring-1 ring-white/20">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      className="w-6 h-6"
                    >
                      <path
                        fillRule="evenodd"
                        d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm13.36-1.814a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <div>
                    <h1 className="text-2xl font-semibold leading-tight">
                      Successfully Enrolled!
                    </h1>
                    <p className="text-white/80 text-sm">
                      Text notifications have been enabled
                    </p>
                  </div>
                </div>
              </div>

              {/* Confirmation Details */}
              <div className="p-8">
                <div className="mb-6 space-y-4">
                  <div className="rounded-2xl bg-green-50 border border-green-200 p-4">
                    <div className="flex items-start gap-3">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        className="w-5 h-5 text-green-600 mt-0.5"
                      >
                        <path
                          fillRule="evenodd"
                          d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm13.36-1.814a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <div className="flex-1">
                        <p className="text-green-700 font-medium">
                          Text notifications are now active
                        </p>
                        <p className="text-green-600 text-sm mt-1">
                          You'll receive updates at{" "}
                          {formatPhoneDisplay(confirmedPhone)}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Info label="For" value={initial.userName || "(you)"} />
                    <Info
                      label="Requested by"
                      value={initial.requesterName || "—"}
                    />
                    <Info
                      label="Charge Name"
                      value={initial.paymentName || "—"}
                    />
                    <Info
                      label="Amount"
                      value={
                        initial.paymentAmount
                          ? formatCurrency(initial.paymentAmount)
                          : "—"
                      }
                    />
                    <Info
                      label="Frequency"
                      value={initial.frequency}
                      className={"col-span-full"}
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="rounded-xl bg-gray-50 p-4">
                    <h3 className="font-medium text-gray-900 mb-2">
                      What happens next?
                    </h3>
                    <ul className="space-y-2 text-sm text-gray-600">
                      <li className="flex items-start gap-2">
                        <span className="text-blue-600 mt-0.5">•</span>
                        <span>
                          You'll receive a welcome text message shortly
                        </span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-blue-600 mt-0.5">•</span>
                        <span>
                          Get reminders about "
                          {initial.paymentName || "your payment"}"
                        </span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-blue-600 mt-0.5">•</span>
                        <span>Reply STOP to any message to unsubscribe</span>
                      </li>
                    </ul>
                  </div>

                  <p className="text-xs text-gray-500 text-center">
                    You can close this window. Your preferences have been saved.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // Regular Form View
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Card */}
      <main className="px-4 py-8 flex items-center justify-center">
        <div className="w-full max-w-xl">
          <div
            className="rounded-3xl shadow-xl overflow-hidden bg-white"
            style={{ boxShadow: "0 10px 30px rgba(0,0,0,0.08)" }}
          >
            {/* Hero strip */}
            <div
              className="p-8 text-white"
              style={{
                background: `linear-gradient(135deg, rgb(37 99 235) 0%, rgba(37,99,235,0.85) 60%, rgba(37,99,235,0.75) 100%)`,
              }}
            >
              <div className="flex items-center gap-3">
                <div className="h-11 w-11 rounded-2xl bg-white/15 grid place-items-center ring-1 ring-white/20">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="w-6 h-6"
                  >
                    <path d="M2 5a2 2 0 012-2h16a2 2 0 012 2v11a2 2 0 01-2 2H8l-4 4v-4H4a2 2 0 01-2-2V5z" />
                  </svg>
                </div>
                <div>
                  <h1 className="text-2xl font-semibold leading-tight">
                    Enable Text Updates
                  </h1>
                  <p className="text-white/80 text-sm">
                    Quick opt‑in for payment reminders
                  </p>
                </div>
              </div>
            </div>

            {/* Details */}
            <div className="p-8">
              <div className="mb-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Info label="For" value={initial.userName || "(you)"} />
                <Info
                  label="Requested by"
                  value={initial.requesterName || "—"}
                />
                <Info label="Charge Name" value={initial.paymentName || "—"} />
                <Info
                  label="Amount"
                  value={
                    initial.paymentAmount
                      ? formatCurrency(initial.paymentAmount)
                      : "—"
                  }
                />
                <Info
                  label="Frequency"
                  value={initial.frequency}
                  className={"col-span-full"}
                />
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Mobile phone
                  </label>
                  <PhoneInput
                    value={phone}
                    onChange={(e) => {
                      setPhone(e.target.value);
                    }}
                  />
                </div>

                <div className="flex items-start gap-3">
                  <input
                    id="consent"
                    type="checkbox"
                    checked={consent}
                    onChange={(e) => setConsent(e.target.checked)}
                    className="mt-1 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <label htmlFor="consent" className="text-sm text-gray-700">
                    I agree to receive text messages from Splitify about my
                    payments. Message & data rates may apply. Message frequency
                    may vary. Reply STOP to opt out anytime. By enabling text
                    messages you agree to our
                    <a className="text-[#1865f2]" href="/about/termsAndConditions">
                      {" "}
                      Terms and Conditions
                    </a>{" "}
                    and our
                    <a className="text-[#1865f2]" href="/about/privacyPolicy"> Privacy Policy.</a>
                  </label>
                </div>

                {message && message.type === "error" && (
                  <div
                    className={`rounded-xl px-4 py-3 text-sm bg-rose-50 text-rose-700 border border-rose-200`}
                  >
                    {message.text}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full inline-flex items-center justify-center gap-2 rounded-2xl px-4 py-3 font-medium text-white shadow-sm focus:outline-none focus:ring-4 focus:ring-blue-100 disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{
                    backgroundColor: themePrimary,
                  }}
                >
                  {loading ? (
                    <>
                      <Spinner />
                      Saving…
                    </>
                  ) : (
                    <>Enable Text Messages</>
                  )}
                </button>

                <p className="text-xs text-gray-500 text-center">
                  By continuing, you confirm this is your number and you agree
                  to receive SMS reminders related to this payment.
                </p>
              </form>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

function Info({ label, value, className = "" }) {
  return (
    <div className={`rounded-2xl border border-gray-200 p-4  ${className}`}>
      <div className={`text-xs  uppercase tracking-wide text-gray-500`}>
        {label}
      </div>
      <div className="mt-1 text-gray-900 font-medium capitalize">{value}</div>
    </div>
  );
}

function formatCurrency(v) {
  const num = Number(v);
  if (!Number.isFinite(num)) return v;
  try {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency: "USD",
    }).format(num);
  } catch (e) {
    return `$${num.toFixed(2)}`;
  }
}

function Spinner() {
  return (
    <svg
      className="animate-spin h-5 w-5"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      aria-hidden
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      ></circle>
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
      ></path>
    </svg>
  );
}
