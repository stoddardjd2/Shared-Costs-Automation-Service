import React, { useMemo, useState } from "react";
import { handlePayment } from "../../queries/requests";

export default function PaymentPage() {
  const params = useMemo(() => new URLSearchParams(window.location.search), []);

  const initial = {
    requestId: params.get("requestId") || "",
    paymentHistoryId: params.get("paymentHistoryId") || "",
    userId: params.get("userId") || "",
    dueDate: params.get("dueDate") || "",
    userName: params.get("name") || "",
    requesterName: params.get("requester") || "",
    paymentName: params.get("chargeName") || "",
    paymentAmount: params.get("amount") || "",
    frequency: params.get("frequency") || "",
    cashapp: params.get("cashapp") || "",
    venmo: params.get("venmo") || "",
  };

  const formattedDate = new Date(initial.dueDate).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  const [selectedMethod, setSelectedMethod] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [isAlreadyPaid, setIsAlreadyPaid] = useState(false);
  const [paidDate, setPaidDate] = useState(null);
  const themePrimary = "rgb(37 99 235)"; // blue-600

  const paymentMethods = [
    {
      id: "venmo",
      name: "Venmo",
      bgColor: "#3D95CE",
      textColor: "white",
      // Use default Venmo URL if username is null or empty
      paymentUrl:
        initial.venmo && initial.venmo.trim() !== ""
          ? `https://venmo.com/u/${initial.venmo}?txn=pay&amount=${
              initial.paymentAmount
            }&note=${encodeURIComponent(initial.paymentName || "Payment")}`
          : "https://venmo.com/", // Default Venmo homepage
      icon: (
        <svg
          fill="#ffffff"
          viewBox="0 0 512 512"
          id="Layer_1"
          data-name="Layer 1"
          xmlns="http://www.w3.org/2000/svg"
          stroke="#ffffff"
        >
          <g id="SVGRepo_bgCarrier" strokeWidth="0"></g>
          <g
            id="SVGRepo_tracerCarrier"
            strokeLinecap="round"
            strokeLinejoin="round"
          ></g>
          <g id="SVGRepo_iconCarrier">
            <path d="M444.17,32H70.28C49.85,32,32,46.7,32,66.89V441.6C32,461.91,49.85,480,70.28,480H444.06C464.6,480,480,461.8,480,441.61V66.89C480.12,46.7,464.6,32,444.17,32ZM278,387H174.32L132.75,138.44l90.75-8.62,22,176.87c20.53-33.45,45.88-86,45.88-121.87,0-19.62-3.36-33-8.61-44L365.4,124.1c9.56,15.78,13.86,32,13.86,52.57C379.25,242.17,323.34,327.26,278,387Z"></path>
          </g>
        </svg>
      ),
    },
    {
      id: "cashapp",
      name: "Cash App",
      bgColor: "#00D632",
      textColor: "white",
      // Use default Cash App URL if username is null or empty
      paymentUrl:
        initial.cashapp && initial.cashapp.trim() !== ""
          ? `https://cash.app/$${initial.cashapp}/${initial.paymentAmount}`
          : "https://cash.app/", // Default Cash App homepage
      icon: (
        <svg
          fill="#ffffff"
          viewBox="0 0 24 24"
          role="img"
          xmlns="http://www.w3.org/2000/svg"
          stroke="#ffffff"
        >
          <g id="SVGRepo_bgCarrier" strokeWidth="0"></g>
          <g
            id="SVGRepo_tracerCarrier"
            strokeLinecap="round"
            strokeLinejoin="round"
          ></g>
          <g id="SVGRepo_iconCarrier">
            <path d="M23.59 3.47A5.1 5.1 0 0 0 20.54.42C19.23 0 18.04 0 15.62 0H8.36c-2.4 0-3.61 0-4.9.4A5.1 5.1 0 0 0 .41 3.46C0 4.76 0 5.96 0 8.36v7.27c0 2.41 0 3.6.4 4.9a5.1 5.1 0 0 0 3.05 3.05c1.3.41 2.5.41 4.9.41h7.28c2.41 0 3.61 0 4.9-.4a5.1 5.1 0 0 0 3.06-3.06c.41-1.3.41-2.5.41-4.9V8.38c0-2.41 0-3.61-.41-4.91zM17.42 8.1l-.93.93a.5.5 0 0 1-.67.01 5 5 0 0 0-3.22-1.18c-.97 0-1.94.32-1.94 1.21 0 .9 1.04 1.2 2.24 1.65 2.1.7 3.84 1.58 3.84 3.64 0 2.24-1.74 3.78-4.58 3.95l-.26 1.2a.49.49 0 0 1-.48.39H9.63l-.09-.01a.5.5 0 0 1-.38-.59l.28-1.27a6.54 6.54 0 0 1-2.88-1.57v-.01a.48.48 0 0 1 0-.68l1-.97a.49.49 0 0 1 .67 0c.91.86 2.13 1.34 3.39 1.32 1.3 0 2.17-.55 2.17-1.42 0-.87-.88-1.1-2.54-1.72-1.76-.63-3.43-1.52-3.43-3.6 0-2.42 2.01-3.6 4.39-3.71l.25-1.23a.48.48 0 0 1 .48-.38h1.78l.1.01c.26.06.43.31.37.57l-.27 1.37c.9.3 1.75.77 2.48 1.39l.02.02c.19.2.19.5 0 .68z"></path>
          </g>
        </svg>
      ),
    },
  ];

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

  async function handleMarkAsPaid() {
    const { requestId, paymentHistoryId, userId, paymentAmount } = initial;
    setIsProcessing(true);

    try {
      const res = await handlePayment(
        requestId,
        paymentHistoryId,
        userId,
        paymentAmount
      );

      if (res?.success === true) {
        setTimeout(() => {
          setIsConfirmed(true);
          setIsProcessing(false);
        }, 1000);
      } else if (res?.error?.data?.data?.isAlreadyPaid) {
        setIsAlreadyPaid(true);
        const date = res?.error?.data?.data?.paidDate;

        const formattedDate = new Date(date).toLocaleDateString("en-US", {
          year: "numeric",
          month: "short",
          day: "numeric",
        });
        setPaidDate(formattedDate);
        setIsProcessing(false);
      } else {
        setIsProcessing(false);
        alert("Payment confirmation failed. Please try again.");
      }
    } catch (error) {
      setIsProcessing(false);
      console.error("Payment error:", error);
      alert("An error occurred while confirming payment. Please try again.");
    }
  }

  function handlePaymentSelect(method) {
    setSelectedMethod(method);
    setIsProcessing(true);

    setTimeout(() => {
      if (method.requiresInApp) {
        alert(
          `${method.name} requires in-app integration. Please implement payment processing for ${method.name}.`
        );
      } else if (method.paymentUrl) {
        // Open payment URL in new tab
        window.open(method.paymentUrl, "_blank");
        alert(
          `Opened ${method.name} in a new tab with amount ${formatCurrency(
            initial.paymentAmount
          )}.\n\nIMPORTANT: After completing your payment, return to this page and click "Mark As Paid" to confirm.`
        );
      } else {
        alert(
          `Redirecting to ${method.name} with amount ${formatCurrency(
            initial.paymentAmount
          )}...\n\nIMPORTANT: After completing your payment, return to this page and click "Mark As Paid" to confirm.`
        );
      }
      setIsProcessing(false);
    }, 1500);
  }

  // Confirmation Mode UI
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
                className="p-8 text-white text-center"
                style={{
                  background: `linear-gradient(135deg, #10B981 0%, #059669 100%)`,
                }}
              >
                <div className="flex flex-col items-center gap-4">
                  <div className="h-16 w-16 rounded-full bg-white/20 grid place-items-center ring-2 ring-white/30 animate-pulse">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      className="w-8 h-8"
                    >
                      <path
                        fillRule="evenodd"
                        d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm13.36-1.814a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold leading-tight">
                      Payment Confirmed!
                    </h1>
                    <p className="text-white/90 text-lg mt-2">
                      Thank you for completing your payment
                    </p>
                  </div>
                </div>
              </div>

              {/* Confirmation Details */}
              <div className="p-8">
                <div className="text-center mb-8">
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      className="w-4 h-4"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.236 4.53L7.53 10.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z"
                        clipRule="evenodd"
                      />
                    </svg>
                    Payment Status: Confirmed
                  </div>
                </div>

                {/* Payment Summary */}
                <div className="bg-gray-50 rounded-2xl p-6 mb-6">
                  <h3 className="font-semibold text-gray-900 mb-4">
                    Payment Summary
                  </h3>
                  <div className="grid grid-cols-1 gap-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Amount Paid</span>
                      <span className="font-semibold text-gray-900">
                        {formatCurrency(initial.paymentAmount)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Payment For</span>
                      <span className="font-semibold text-gray-900">
                        {initial.paymentName || "Payment"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Paid By</span>
                      <span className="font-semibold text-gray-900">
                        {initial.userName || "You"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Date Confirmed</span>
                      <span className="font-semibold text-gray-900">
                        {new Date().toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Success Message */}
                <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6">
                  <div className="flex items-start gap-3">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0"
                    >
                      <path
                        fillRule="evenodd"
                        d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm13.36-1.814a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-green-900">
                        Payment Successfully Recorded
                      </p>
                      <p className="text-xs text-green-700 mt-1">
                        Your payment has been confirmed and recorded in our
                        system. You will no longer receive payment reminders for
                        this charge.
                        {initial.requesterName &&
                          ` ${initial.requesterName} has been notified of your payment.`}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Action Button */}
                <div className="text-center">
                  <button
                    onClick={() => window.close()}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-gray-900 text-white rounded-xl font-medium hover:bg-gray-800 transition-colors"
                  >
                    <div>×</div> Close Window
                  </button>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  } else if (isAlreadyPaid) {
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
                className="p-8 text-white text-center"
                style={{
                  background: `linear-gradient(135deg, #F59E0B 0%, #D97706 100%)`,
                }}
              >
                <div className="flex flex-col items-center gap-4">
                  <div className="h-16 w-16 rounded-full bg-white/20 grid place-items-center ring-2 ring-white/30 animate-pulse">
                    <div className="text-[30px]"> ×</div>
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold leading-tight">
                      Payment already complete!
                    </h1>
                    <p className="text-white/90 text-lg mt-2">
                      You have already fully paid this bill
                    </p>
                  </div>
                </div>
              </div>

              {/* Confirmation Details */}
              <div className="p-8">
                <div className="text-center mb-8">
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      className="w-4 h-4"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.236 4.53L7.53 10.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z"
                        clipRule="evenodd"
                      />
                    </svg>
                    Payment Status: Paid
                  </div>
                </div>

                {/* Payment Summary */}
                <div className="bg-gray-50 rounded-2xl p-6 mb-6">
                  <h3 className="font-semibold text-gray-900 mb-4">
                    Payment Summary
                  </h3>
                  <div className="grid grid-cols-1 gap-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Amount Paid</span>
                      <span className="font-semibold text-gray-900">
                        {formatCurrency(initial.paymentAmount)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Payment For</span>
                      <span className="font-semibold text-gray-900">
                        {initial.paymentName || "Payment"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Paid By</span>
                      <span className="font-semibold text-gray-900">
                        {initial.userName || "You"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Date Paid</span>
                      <span className="font-semibold text-gray-900">
                        {paidDate}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Success Message */}
                <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6">
                  <div className="flex items-start gap-3">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0"
                    >
                      <path
                        fillRule="evenodd"
                        d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm13.36-1.814a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-green-900">
                        Payment Already Recorded
                      </p>
                      <p className="text-xs text-green-700 mt-1">
                        Your payment has already been confirmed and recorded in
                        our system. You will no longer receive payment reminders
                        for this charge.
                        {initial.requesterName &&
                          ` ${initial.requesterName} has been notified of your payment.`}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Action Button */}
                <div className="text-center">
                  <button
                    onClick={() => window.close()}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-gray-900 text-white rounded-xl font-medium hover:bg-gray-800 transition-colors"
                  >
                    <div>×</div> Close Window
                  </button>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // Regular Payment Mode UI
  return (
    <div className="min-h-screen bg-gray-50">
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
                    <path d="M2.273 5.625A4.483 4.483 0 015.25 4.5h13.5c1.141 0 2.183.425 2.977 1.125A3 3 0 0018.75 3H5.25a3 3 0 00-2.977 2.625zM2.273 8.625A4.483 4.483 0 015.25 7.5h13.5c1.141 0 2.183.425 2.977 1.125A3 3 0 0018.75 6H5.25a3 3 0 00-2.977 2.625zM5.25 9a3 3 0 00-3 3v6a3 3 0 003 3h13.5a3 3 0 003-3v-6a3 3 0 00-3-3H15a.75.75 0 00-.75.75 2.25 2.25 0 01-4.5 0A.75.75 0 009 9H5.25z" />
                  </svg>
                </div>
                <div>
                  <h1 className="text-2xl font-semibold leading-tight">
                    Make Payment
                  </h1>
                  <p className="text-white/80 text-sm">
                    Choose your preferred payment method
                  </p>
                </div>
              </div>
            </div>

            {/* Payment Details */}
            <div className="p-8">
              <div className="mb-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Info label="For" value={initial.userName || "(you)"} />
                <Info
                  label="Requested by"
                  value={initial.requesterName || "—"}
                />
                <Info label="Charge Name" value={initial.paymentName || "—"} />
                <Info
                  label="Amount Due"
                  value={
                    initial.paymentAmount
                      ? formatCurrency(initial.paymentAmount)
                      : "—"
                  }
                  highlight
                />
                <Info label="Due Date" value={formattedDate || ""} />
                <Info
                  label="Frequency"
                  value={initial.frequency || "One-time"}
                />
              </div>

              {/* Instructions Notice */}
              <div className="mb-6 p-4 rounded-xl bg-amber-50 border border-amber-200">
                <div className="flex items-start gap-3">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0"
                  >
                    <path
                      fillRule="evenodd"
                      d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm8.706-1.442c1.146-.573 2.437.463 2.126 1.706l-.709 2.836.042-.02a.75.75 0 01.67 1.34l-.04.022c-1.147.573-2.438-.463-2.127-1.706l.71-2.836-.042.02a.75.75 0 11-.671-1.34l.041-.022zM12 9a.75.75 0 100-1.5.75.75 0 000 1.5z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-amber-900">
                      Important: Two-Step Process
                    </p>
                    <ol className="text-xs text-amber-700 mt-1 space-y-1">
                      <li>
                        <span className="font-semibold">1.</span> Select a
                        payment method below to pay
                      </li>
                      <li>
                        <span className="font-semibold">2.</span> Return here
                        and click "Mark As Paid" to confirm else you will
                        continue to receive reminders
                      </li>
                    </ol>
                  </div>
                </div>
              </div>

              {/* Mark as Paid - Primary Action */}
              <div className="mb-6">
                <button
                  onClick={handleMarkAsPaid}
                  disabled={isProcessing}
                  className="w-full relative overflow-hidden rounded-2xl p-5 transition-all duration-200 hover:scale-[1.02] hover:shadow-xl disabled:opacity-60 disabled:cursor-not-allowed group"
                  style={{
                    background: `linear-gradient(135deg, #10B981 0%, #059669 100%)`,
                  }}
                >
                  <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity"></div>
                  <div className="relative flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-xl bg-white/20 grid place-items-center">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          fill="currentColor"
                          className="w-6 h-6 text-white"
                        >
                          <path
                            fillRule="evenodd"
                            d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm13.36-1.814a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </div>
                      <div className="text-left">
                        <div className="text-white font-semibold text-lg">
                          Mark As Paid
                        </div>
                        <div className="text-white/80 text-sm">
                          Click here after completing payment
                        </div>
                      </div>
                    </div>
                    {isProcessing && selectedMethod === null ? (
                      <Spinner color="white" />
                    ) : (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        className="w-6 h-6 text-white"
                      >
                        <path
                          fillRule="evenodd"
                          d="M12.53 16.28a.75.75 0 01-1.06 0l-7.5-7.5a.75.75 0 011.06-1.06L12 14.69l6.97-6.97a.75.75 0 111.06 1.06l-7.5 7.5z"
                          clipRule="evenodd"
                          transform="rotate(-90 12 12)"
                        />
                      </svg>
                    )}
                  </div>
                  <div className="mt-2 flex items-center gap-2">
                    <span className="inline-flex items-center gap-1 text-xs text-white/90 bg-white/10 px-2 py-1 rounded-full">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                        className="w-3 h-3"
                      >
                        <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                      </svg>
                      Step 2: Return here to confirm
                    </span>
                    <span className="text-xs text-white/70">
                      Required after payment
                    </span>
                  </div>
                </button>
              </div>

              <div className="relative mb-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-white text-gray-500 uppercase tracking-wide font-medium">
                    Step 1: Choose payment method
                  </span>
                </div>
              </div>

              {/* Payment Methods */}
              <div className="space-y-4">
                <h3 className="text-sm font-medium text-gray-700 uppercase tracking-wide">
                  Select Payment Method
                </h3>

                <div className="grid gap-3">
                  {paymentMethods.map((method) => (
                    <button
                      key={method.id}
                      onClick={() => handlePaymentSelect(method)}
                      disabled={isProcessing}
                      className={`
                        relative w-full rounded-2xl p-4 transition-all duration-200
                        ${method.borderColor ? "border-2" : ""}
                        ${
                          isProcessing && selectedMethod?.id === method.id
                            ? "ring-4 ring-blue-100 scale-[0.98]"
                            : "hover:scale-[1.02] hover:shadow-lg"
                        }
                        ${
                          isProcessing ? "cursor-not-allowed" : "cursor-pointer"
                        }
                        disabled:opacity-60
                      `}
                      style={{
                        backgroundColor: method.bgColor,
                        color: method.textColor,
                        borderColor: method.borderColor || "transparent",
                      }}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-[24px]">{method.icon}</div>
                          <span className="font-medium text-base text-nowrap">
                            {method.name}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          {method.popular && (
                            <span
                              className="text-xs px-2 py-1 rounded-full font-medium"
                              style={{
                                backgroundColor:
                                  method.textColor === "white"
                                    ? "rgba(255,255,255,0.2)"
                                    : "rgba(0,0,0,0.08)",
                                color: method.textColor,
                              }}
                            >
                              Popular
                            </span>
                          )}
                          {isProcessing && selectedMethod?.id === method.id ? (
                            <Spinner color={method.textColor} />
                          ) : (
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              viewBox="0 0 24 24"
                              fill="currentColor"
                              className="w-5 h-5"
                            >
                              <path
                                fillRule="evenodd"
                                d="M12.53 16.28a.75.75 0 01-1.06 0l-7.5-7.5a.75.75 0 011.06-1.06L12 14.69l6.97-6.97a.75.75 0 111.06 1.06l-7.5 7.5z"
                                clipRule="evenodd"
                                transform="rotate(-90 12 12)"
                              />
                            </svg>
                          )}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <p className="text-xs text-gray-500 text-center mt-4">
                By continuing, you agree to our Terms of Service and Privacy
                Policy
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

function Info({ label, value, className = "", highlight = false }) {
  return (
    <div
      className={`rounded-2xl border ${
        highlight ? "border-blue-300 bg-blue-50" : "border-gray-200"
      } p-4 ${className}`}
    >
      <div
        className={`text-xs uppercase tracking-wide ${
          highlight ? "text-blue-600" : "text-gray-500"
        }`}
      >
        {label}
      </div>
      <div
        className={`mt-1 font-medium capitalize ${
          highlight ? "text-blue-900 text-lg" : "text-gray-900"
        }`}
      >
        {value}
      </div>
    </div>
  );
}

function Spinner({ color = "currentColor" }) {
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
        stroke={color}
        strokeWidth="4"
      ></circle>
      <path
        className="opacity-75"
        fill={color}
        d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
      ></path>
    </svg>
  );
}
