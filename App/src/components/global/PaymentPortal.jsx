import React, { useMemo, useState } from "react";

export default function PaymentPage() {
  const params = useMemo(() => new URLSearchParams(window.location.search), []);

  const initial = {
    userID: params.get("userId") || "",
    userName: params.get("name") || "",
    requesterName: params.get("requester") || "",
    paymentName: params.get("chargeName") || "",
    paymentAmount: params.get("amount") || "",
    frequency: params.get("frequency") || "",
    cashapp: params.get("cashapp") || "",
    venmo: params.get("venmo") || "",
  };

  const [selectedMethod, setSelectedMethod] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

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
          <g id="SVGRepo_bgCarrier" stroke-width="0"></g>
          <g
            id="SVGRepo_tracerCarrier"
            stroke-linecap="round"
            stroke-linejoin="round"
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
          <g id="SVGRepo_bgCarrier" stroke-width="0"></g>
          <g
            id="SVGRepo_tracerCarrier"
            stroke-linecap="round"
            stroke-linejoin="round"
          ></g>
          <g id="SVGRepo_iconCarrier">
            <path d="M23.59 3.47A5.1 5.1 0 0 0 20.54.42C19.23 0 18.04 0 15.62 0H8.36c-2.4 0-3.61 0-4.9.4A5.1 5.1 0 0 0 .41 3.46C0 4.76 0 5.96 0 8.36v7.27c0 2.41 0 3.6.4 4.9a5.1 5.1 0 0 0 3.05 3.05c1.3.41 2.5.41 4.9.41h7.28c2.41 0 3.61 0 4.9-.4a5.1 5.1 0 0 0 3.06-3.06c.41-1.3.41-2.5.41-4.9V8.38c0-2.41 0-3.61-.41-4.91zM17.42 8.1l-.93.93a.5.5 0 0 1-.67.01 5 5 0 0 0-3.22-1.18c-.97 0-1.94.32-1.94 1.21 0 .9 1.04 1.2 2.24 1.65 2.1.7 3.84 1.58 3.84 3.64 0 2.24-1.74 3.78-4.58 3.95l-.26 1.2a.49.49 0 0 1-.48.39H9.63l-.09-.01a.5.5 0 0 1-.38-.59l.28-1.27a6.54 6.54 0 0 1-2.88-1.57v-.01a.48.48 0 0 1 0-.68l1-.97a.49.49 0 0 1 .67 0c.91.86 2.13 1.34 3.39 1.32 1.3 0 2.17-.55 2.17-1.42 0-.87-.88-1.1-2.54-1.72-1.76-.63-3.43-1.52-3.43-3.6 0-2.42 2.01-3.6 4.39-3.71l.25-1.23a.48.48 0 0 1 .48-.38h1.78l.1.01c.26.06.43.31.37.57l-.27 1.37c.9.3 1.75.77 2.48 1.39l.02.02c.19.2.19.5 0 .68z"></path>
          </g>
        </svg>
      ),
    },
    // {
    //   id: "paypal",
    //   name: "PayPal",
    //   bgColor: "#0070E0",
    //   textColor: "white",
    //   paymentUrl: `https://www.paypal.com/paypalme/YOUR_PAYPAL_USERNAME/${initial.paymentAmount}`,
    //   icon: (
    //     <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
    //       <path d="M8.32 21.97a.546.546 0 0 1-.26-.32c-.03-.15-.06.11.6-8.42h2.45c.65 0 1.03-.01 1.49.07 2.75.45 4.02 2.61 3.7 4.96-.37 2.71-2.29 3.7-3.82 3.7l-4.16.01M3.2 1.3h6.87c.8 0 1.54-.01 2.21.11 1.69.3 3.19 1.21 3.72 2.88.53 1.68.16 3.68-1.18 5.08-.74.78-1.72 1.33-2.8 1.56-.3.06-.71.11-1.03.11H7.56L6.93 15c-.03.23-.24.43-.48.43H3.67c-.39 0-.66-.37-.61-.76L5.77 1.7a.63.63 0 0 1 .61-.51m4.12 7.45l-.79 4.94c-.02.14.1.27.25.27h1.98c1.23 0 2.25-.53 2.61-2 .35-1.43-.34-2.44-1.7-2.73a3 3 0 0 0-.88-.1h-.78c-.31 0-.62.31-.69.62"/>
    //     </svg>
    //   )
    // },
    // {
    //   id: "zelle",
    //   name: "Zelle",
    //   bgColor: "#6D1ED4",
    //   textColor: "white",
    //   paymentUrl: "https://www.zellepay.com/", // Generic Zelle link since it depends on bank
    //   icon: (
    //     <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
    //       <path d="M13.8 2v3.38L6.41 19H13v3H2v-3.31L9.41 5H3V2h10.8M22 2v3h-7v3h6v3h-6v8h7v3h-10V2h10Z"/>
    //     </svg>
    //   )
    // },
    // {
    //   id: "apple",
    //   name: "Apple Pay",
    //   bgColor: "#000000",
    //   textColor: "white",
    //   paymentUrl: null, // Apple Pay requires in-app integration
    //   requiresInApp: true,
    //   icon: (
    //     <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
    //       <path d="M17.05 20.28c-.98.95-2.05.88-3.08.36-1.09-.55-2.08-.56-3.22 0-1.44.71-2.2.5-3.06-.37C5.33 18.15 4.87 14.3 7.4 10.85c1.21-1.66 2.75-2.5 4.32-2.51 1.03.02 2.04.38 2.73.55.87.21 1.71-.02 2.6-.57a6.6 6.6 0 0 1 2.81.12c2.14.69 3.15 2.24 2.89 4.48-.17 1.49-1.55 2.83-2.91 2.88-1.32.05-2.14-.71-3.09-.72-.96 0-1.76.8-3.15.69-.89-.07-1.75-.48-2.55-1.49m-1.62-9.66c-.16 1.98 1.35 3.58 3.21 3.65.2-2.02-1.27-3.68-3.21-3.65Z"/>
    //     </svg>
    //   )
    // }
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
                <Info
                  label="Frequency"
                  value={initial.frequency || "One-time"}
                  className="col-span-full"
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
                  onClick={() => {
                    setIsProcessing(true);
                    setTimeout(() => {
                      alert(
                        `Payment of ${formatCurrency(
                          initial.paymentAmount
                        )} marked as complete!`
                      );
                      setIsProcessing(false);
                    }, 1500);
                  }}
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
