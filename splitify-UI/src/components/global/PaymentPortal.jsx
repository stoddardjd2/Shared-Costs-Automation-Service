import React, { useEffect, useMemo, useState } from "react";
import {
  handleLogLastClickedPaymentMethod,
  handleLogPaymentView,
  handlePayment,
} from "../../queries/requests";
import { Info as InfoIcon, AlertCircle, Home, RefreshCw } from "lucide-react"; // the info-in-a-circle icon
import { handlePaymentDetails } from "../../queries/requests";
import { motion } from "framer-motion";

// Constants
const THEME_PRIMARY = "rgb(37 99 235)";
const SUCCESS_GRADIENT = "linear-gradient(135deg, #10B981 0%, #059669 100%)";
const WARNING_GRADIENT = "linear-gradient(135deg, #F59E0B 0%, #D97706 100%)";
const PRIMARY_GRADIENT =
  "linear-gradient(135deg, rgb(37 99 235) 0%, rgba(37,99,235,0.85) 60%, rgba(37,99,235,0.75) 100%)";

// Utility functions
const formatCurrency = (value) => {
  const num = Number(value);
  if (!Number.isFinite(num)) return value;
  try {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency: "USD",
    }).format(num);
  } catch (e) {
    return `$${num.toFixed(2)}`;
  }
};

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

const getCurrentDate = () => formatDate(new Date());

// Payment method configurations
const getPaymentMethods = (initial, paymentDetails) => {
  const pm = paymentDetails.paymentMethods || {};
  const enabled = pm.enabled || {};

  const hasValue = (key) =>
    typeof pm[key] === "string" && pm[key].trim() !== "";

  const isShown = (key) => enabled[key] === true || hasValue(key);

  const methods = [];

  // Venmo
  if (isShown("venmo")) {
    methods.push({
      id: "venmo",
      name: "Venmo",
      bgColor: "#3D95CE",
      textColor: "white",
      paymentUrl: hasValue("venmo")
        ? `https://venmo.com/?txn=pay&recipients=${pm.venmo}&amount=${
            paymentDetails.amountOwed
          }&note=${encodeURIComponent(paymentDetails.requestName || "Payment")}`
        : "https://venmo.com/",
      icon: (
        <svg
          fill="#ffffff"
          viewBox="0 0 512 512"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M444.17,32H70.28C49.85,32,32,46.7,32,66.89V441.6C32,461.91,49.85,480,70.28,480H444.06C464.6,480,480,461.8,480,441.61V66.89C480.12,46.7,464.6,32,444.17,32ZM278,387H174.32L132.75,138.44l90.75-8.62,22,176.87c20.53-33.45,45.88-86,45.88-121.87,0-19.62-3.36-33-8.61-44L365.4,124.1c9.56,15.78,13.86,32,13.86,52.57C379.25,242.17,323.34,327.26,278,387Z"></path>
        </svg>
      ),
    });
  }

  // Cash App
  if (isShown("cashapp")) {
    methods.push({
      id: "cashapp",
      name: "Cash App",
      bgColor: "#00D632",
      textColor: "white",
      paymentUrl: hasValue("cashapp")
        ? `https://cash.app/$${pm.cashapp}/${paymentDetails.amountOwed}`
        : "https://cash.app/",
      icon: (
        <svg
          fill="#ffffff"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M23.59 3.47A5.1 5.1 0 0 0 20.54.42C19.23 0 18.04 0 15.62 0H8.36c-2.4 0-3.61 0-4.9.4A5.1 5.1 0 0 0 .41 3.46C0 4.76 0 5.96 0 8.36v7.27c0 2.41 0 3.6.4 4.9a5.1 5.1 0 0 0 3.05 3.05c1.3.41 2.5.41 4.9.41h7.28c2.41 0 3.61 0 4.9-.4a5.1 5.1 0 0 0 3.06-3.06c.41-1.3.41-2.5.41-4.9V8.38c0-2.41 0-3.61-.41-4.91zM17.42 8.1l-.93.93a.5.5 0 0 1-.67.01 5 5 0 0 0-3.22-1.18c-.97 0-1.94.32-1.94 1.21 0 .9 1.04 1.2 2.24 1.65 2.1.7 3.84 1.58 3.84 3.64 0 2.24-1.74 3.78-4.58 3.95l-.26 1.2a.49.49 0 0 1-.48.39H9.63l-.09-.01a.5.5 0 0 1-.38-.59l.28-1.27a6.54 6.54 0 0 1-2.88-1.57v-.01a.48.48 0 0 1 0-.68l1-.97a.49.49 0 0 1 .67 0c.91.86 2.13 1.34 3.39 1.32 1.3 0 2.17-.55 2.17-1.42 0-.87-.88-1.1-2.54-1.72-1.76-.63-3.43-1.52-3.43-3.6 0-2.42 2.01-3.6 4.39-3.71l.25-1.23a.48.48 0 0 1 .48-.38h1.78l.1.01c.26.06.43.31.37.57l-.27 1.37c.9.3 1.75.77 2.48 1.39l.02.02c.19.2.19.5 0 .68z"></path>
        </svg>
      ),
    });
  }

  // PayPal
  if (isShown("paypal")) {
    methods.push({
      id: "paypal",
      name: "PayPal",
      bgColor: "#0070BA",
      textColor: "white",
      paymentUrl: hasValue("paypal")
        ? `https://www.paypal.me/${pm.paypal}/${paymentDetails.amountOwed}`
        : "https://paypal.me/",
      icon: (
        <svg
          fill="#ffffff"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M7.076 21.337H2.47a.641.641 0 0 1-.633-.74L4.944.901C5.026.382 5.474 0 5.998 0h7.46c2.57 0 4.578.543 5.69 1.81 1.01 1.15 1.304 2.42 1.012 4.287-.023.143-.047.288-.077.437-.983 5.05-4.349 6.797-8.647 6.797h-2.19c-.524 0-.982.382-1.064.9l-1.106 7.006zm2.146-10.814a.641.641 0 0 0 .633-.74L8.930 2.717a.641.641 0 0 1 .633-.74h4.008c1.295 0 2.233.259 2.845.833.612.574.918 1.407.918 2.833 0 .259-.018.5-.053.740-.018.259-.053.518-.118.777-.018.037-.018.074-.035.111-.353 1.704-1.353 2.833-3.08 3.481-.595.222-1.295.333-2.104.333H9.222z" />
        </svg>
      ),
    });
  }

  // Zelle
  if (isShown("zelle")) {
    methods.push({
      id: "zelle",
      name: "Zelle",
      bgColor: "#6D1ED4",
      textColor: "white",
      paymentUrl: "https://www.zellepay.com/get-started",
      icon: (
        <div className="bg-white w-6 h-6 rounded-[100px] flex items-center justify-center">
          <svg
            className="w-4 h-4 r"
            viewBox="0 0 178 290"
            xmlns="http://www.w3.org/2000/svg"
          >
            <g filter="url(#filter0_d_0_1)">
              <path
                d="M14.6289 240.599C6.48898 234.24 5.04575 222.485 11.4053 214.346L137.05 53.5277C143.41 45.3878 155.164 43.9446 163.304 50.3041C171.444 56.6637 172.887 68.4179 166.527 76.5577L40.8825 237.376C34.5229 245.515 22.7688 246.959 14.6289 240.599Z"
                fill="rgb(109, 30, 212)"
              />
            </g>

            <rect
              y="37"
              width="171"
              height="42"
              rx="13"
              fill="rgb(109, 30, 212)"
            />

            <path
              d="M7 225C7 217.82 12.8203 212 20 212H165C172.18 212 178 217.82 178 225V241C178 248.18 172.18 254 165 254H20C12.8203 254 7 248.18 7 241V225Z"
              fill="rgb(109, 30, 212)"
            />

            <path
              d="M67 6C67 2.68629 69.6863 0 73 0H104C107.314 0 110 2.68629 110 6V37C110 40.3137 107.314 43 104 43H73C69.6863 43 67 40.3137 67 37V6Z"
              fill="rgb(109, 30, 212)"
            />

            <path
              d="M67 253C67 249.686 69.6863 247 73 247H104C107.314 247 110 249.686 110 253V284C110 287.314 107.314 290 104 290H73C69.6863 290 67 287.314 67 284V253Z"
              fill="rgb(109, 30, 212)"
            />

            <defs>
              <filter
                id="filter0_d_0_1"
                x="3.43956"
                y="46.3384"
                width="171.053"
                height="206.227"
                filterUnits="userSpaceOnUse"
                colorInterpolationFilters="sRGB"
              >
                <feFlood floodOpacity="0" result="BackgroundImageFix" />
                <feColorMatrix
                  in="SourceAlpha"
                  type="matrix"
                  values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
                  result="hardAlpha"
                />
                <feOffset dy="4" />
                <feGaussianBlur stdDeviation="2" />
                <feComposite in2="hardAlpha" operator="out" />
                <feColorMatrix
                  type="matrix"
                  values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0"
                />
                <feBlend
                  mode="normal"
                  in2="BackgroundImageFix"
                  result="effect1_dropShadow_0_1"
                />
                <feBlend
                  mode="normal"
                  in="SourceGraphic"
                  in2="effect1_dropShadow_0_1"
                  result="shape"
                />
              </filter>
            </defs>
          </svg>
        </div>
      ),
    });
  }

  // Other
  // Other (instructions, not a link)
  if (isShown("other")) {
    const otherValue = pm.other?.trim() || "";
    const otherName = pm.otherName?.trim() || "Other";

    methods.push({
      id: "other",
      name: otherName,
      bgColor: "#111827",
      textColor: "white",
      paymentUrl: null, // ❗ DO NOT LINK ANYWHERE
      instructions: otherValue, // <--- custom instructions (text)
      icon: (
        <svg
          fill="#ffffff"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M12 2a10 10 0 100 20 10 10 0 000-20zm1 14.5h-2v-2h2v2zm1.07-7.75l-.9.92A2.5 2.5 0 0012 13h-1v-1c0-.83.34-1.5 1.02-2.18l1.24-1.26a1.5 1.5 0 10-2.56-1.06H9a3 3 0 115.07 2.25z" />
        </svg>
      ),
    });
  }

  return methods;
};
// Common Icons
const CheckIcon = ({ className = "w-8 h-8" }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
  >
    <path
      fillRule="evenodd"
      d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm13.36-1.814a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z"
      clipRule="evenodd"
    />
  </svg>
);

const WalletIcon = ({ className = "w-6 h-6" }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
  >
    <path d="M2.273 5.625A4.483 4.483 0 015.25 4.5h13.5c1.141 0 2.183.425 2.977 1.125A3 3 0 0018.75 3H5.25a3 3 0 00-2.977 2.625zM2.273 8.625A4.483 4.483 0 015.25 7.5h13.5c1.141 0 2.183.425 2.977 1.125A3 3 0 0018.75 6H5.25a3 3 0 00-2.977 2.625zM5.25 9a3 3 0 00-3 3v6a3 3 0 003 3h13.5a3 3 0 003-3v-6a3 3 0 00-3-3H15a.75.75 0 00-.75.75 2.25 2.25 0 01-4.5 0A.75.75 0 009 9H5.25z" />
  </svg>
);

const ArrowIcon = ({ className = "w-6 h-6" }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
  >
    <path
      fillRule="evenodd"
      d="M12.53 16.28a.75.75 0 01-1.06 0l-7.5-7.5a.75.75 0 011.06-1.06L12 14.69l6.97-6.97a.75.75 0 111.06 1.06l-7.5 7.5z"
      clipRule="evenodd"
      transform="rotate(-90 12 12)"
    />
  </svg>
);

// Reusable Components
const Spinner = ({ color = "currentColor" }) => (
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

const Info = ({ label, value, className = "", highlight = false }) => (
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

const StatusBadge = ({ status = "confirmed" }) => {
  const isConfirmed = status === "confirmed";
  return (
    <div
      className={`inline-flex items-center gap-2 px-4 py-2 ${"bg-green-100 text-green-800"} rounded-full text-sm font-medium`}
    >
      <CheckIcon className="w-4 h-4" />
      Payment Status: {"Paid"}
    </div>
  );
};

const PaymentSummary = ({
  initial,
  paidDate = null,
  amountPaid,
  paymentDetails,
}) => {
  const summaryItems = [
    { label: "Amount Paid", value: formatCurrency(amountPaid) },
    { label: "Payment For", value: paymentDetails.requestName || "Payment" },
    { label: "Paid By", value: initial.userName || "You" },
    {
      label: "Date Paid",
      value: paidDate,
    },
  ];

  return (
    <div className="bg-gray-50 rounded-xl p-6 mb-6">
      <h3 className="font-semibold text-gray-900 mb-4">Payment Summary</h3>
      <div className="grid grid-cols-1 gap-3">
        {summaryItems.map(({ label, value }, index) => (
          <div key={index} className="flex justify-between">
            <span className="text-gray-600">{label}</span>
            <span className="font-semibold text-gray-900">{value}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

const SuccessMessage = ({ initial, isAlreadyPaid = false, paymentDetails }) => (
  <div className="bg-gray-50 rounded-lg p-4 mb-6">
    <div className="flex items-start gap-3">
      <CheckIcon className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
      <div className="flex-1">
        <p className="text-sm font-medium">
          Payment {isAlreadyPaid ? "Already Recorded" : "Successfully Recorded"}
        </p>
        <p className="text-xs mt-1">
          Your payment has {isAlreadyPaid ? "already been" : "been"} confirmed
          and recorded in our system. You will no longer receive payment
          reminders for this charge.
          {paymentDetails.owedTo &&
            ` ${paymentDetails.owedTo} has been notified of your payment.`}
        </p>
      </div>
    </div>
  </div>
);

const HeroSection = ({
  title,
  subtitle,
  gradient,
  icon,
  iconBg = "white/15",
}) => (
  <div className="p-8 text-white" style={{ background: gradient }}>
    <div className="flex items-center gap-3">
      <div
        className={`h-11 w-11 rounded-2xl bg-${iconBg} grid place-items-center ring-1 ring-white/20`}
      >
        {icon}
      </div>
      <div>
        <h1 className="text-2xl font-semibold leading-tight">{title}</h1>
        <p className="text-white/80 text-sm">{subtitle}</p>
      </div>
    </div>
  </div>
);

const CompletionHeroSection = ({
  title,
  subtitle,
  gradient,
  isAlreadyPaid = false,
}) => (
  <div className="p-8 text-white text-center" style={{ background: gradient }}>
    <div className="flex flex-col items-center gap-4">
      <div className="h-16 w-16 rounded-full bg-white/20 grid place-items-center ring-2 ring-white/30 animate-pulse">
        {isAlreadyPaid ? <div className="text-[30px]">×</div> : <CheckIcon />}
      </div>
      <div>
        <h1 className="text-3xl font-bold leading-tight">{title}</h1>
        <p className="text-white/90 text-lg mt-2">{subtitle}</p>
      </div>
    </div>
  </div>
);

const PageLayout = ({ children, header }) => (
  <div className="min-h-screen ">
    <main className="px-6 py-6 flex items-center justify-center">
      <div className="w-full max-w-xl">
        <div>{header}</div>
        <div className="bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden">
          {children}
        </div>
      </div>
    </main>
  </div>
);

function InvalidRequestView() {
  return (
    <div className="bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="bg-red-500 p-8 text-white text-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-16 w-16 rounded-full bg-white/20 grid place-items-center ring-2 ring-white/30">
            <AlertCircle className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Bad Request</h1>
            <p className="text-red-100 mt-1">
              Something went wrong on our backend, please let us know about this
              issue so we can resolve it.
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-8">
        <div className="text-center mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">
            Unable to Process Payment
          </h2>
          <p className="text-gray-600 mb-4">
            The payment link you're trying to access had something go wrong on
            our servers. Please try again or contact us for assistance.
          </p>
          {/* <div className="bg-gray-50 rounded-lg p-4 text-left">
            <p className="text-sm text-gray-700 mb-2">This could happen if:</p>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• The link has expired</li>
              <li>• Required information is missing</li>
              <li>• The payment has already been processed</li>
              <li>• The link was corrupted or incomplete</li>
            </ul>
          </div> */}
        </div>

        {/* Action Buttons */}
      </div>
    </div>
  );
}

function InvalidUrlView() {
  return (
    <div className="bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="bg-red-500 p-8 text-white text-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-16 w-16 rounded-full bg-white/20 grid place-items-center ring-2 ring-white/30">
            <AlertCircle className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Invalid URL</h1>
            <p className="text-red-100 mt-1">This payment link is not valid</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-8">
        <div className="text-center mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">
            Unable to Process Payment
          </h2>
          <p className="text-gray-600 mb-4">
            The payment link you're trying to access is invalid, expired, or
            incomplete.
          </p>
          <div className="bg-gray-50 rounded-lg p-4 text-left">
            <p className="text-sm text-gray-700 mb-2">This could happen if:</p>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• The link has expired</li>
              <li>• Required information is missing</li>
              <li>• The payment has already been processed</li>
              <li>• The link was corrupted or incomplete</li>
            </ul>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-6 text-center">
          <p className="text-xs text-gray-500">
            Please contact the person who sent you this payment link for
            assistance.
          </p>
        </div>
      </div>
    </div>
  );
}

function PaidToggle({
  initialPaid = false,
  onConfirm, // async function returning { success: true } or throwing
  minSpinnerTime = 600, // ms
}) {
  const [paid, setPaid] = useState(initialPaid);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleClick = async () => {
    if (paid || loading) return;

    setLoading(true);
    setError(null);

    const startTime = Date.now();
    let success = false;
    let errorMessage = null;

    try {
      if (onConfirm) {
        const res = await onConfirm(); // expected: { success: true }
        console.log("TOGGLE", res);
        if (!res || res.success !== true) {
          throw new Error("Backend did not confirm success");
        }
      }

      success = true;
    } catch (err) {
      console.error("Mark as paid failed:", err);
      errorMessage = "Something went wrong. Please try again.";
    }

    // 🔁 Enforce minimum spinner time (applies to both success & error)
    const elapsed = Date.now() - startTime;
    const remaining = Math.max(0, minSpinnerTime - elapsed);
    if (remaining > 0) {
      await new Promise((resolve) => setTimeout(resolve, remaining));
    }

    // Now update UI
    if (success) {
      setPaid(true);
    } else if (errorMessage) {
      setError(errorMessage);
    }

    setLoading(false);
  };

  return (
    <div className="w-full">
      <button
        onClick={handleClick}
        disabled={loading || paid}
        className={`
          w-full rounded-lg px-4 py-3 text-center font-semibold transition-all
          disabled:opacity-70 disabled:cursor-not-allowed mt-20
          ${
            paid
              ? "bg-green-100 border border-green-400 text-green-700"
              : "bg-gray-100 border border-gray-300 text-gray-700 hover:bg-gray-200"
          }
        `}
      >
        {paid ? (
          <span className="flex justify-center items-center gap-2">
            Payment Confirmed <CheckIcon className="w-5 h-5" />
          </span>
        ) : loading ? (
          <div className="flex items-center justify-center gap-2">
            <span className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full splitify-spinner" />
            <span>Processing...</span>
          </div>
        ) : (
          "Mark as Paid"
        )}
      </button>

      {error && (
        <p className="mt-1 text-xs text-red-500 text-center">{error}</p>
      )}
    </div>
  );
}
// Main Component
export default function PaymentPage() {
  const params = useMemo(() => new URLSearchParams(window.location.search), []);

  const initial = {
    requestId: params.get("requestId") || "",
    paymentHistoryId: params.get("paymentHistoryId") || "",
    userId: params.get("userId") || "",
    // dueDate: params.get("dueDate") || "",
    userName: params.get("name") || "",
    // requesterName: params.get("requester") || "",
    // paymentName: params.get("chargeName") || "",
    // paymentAmount: params.get("amount") || "",
    // frequency: params.get("frequency") || "",
    // cashapp: params.get("cashapp") || "",
    // venmo: params.get("venmo") || "",
    // allowMarkAsPaidForEveryone:
    //   params.get("allowMarkAsPaidForEveryone") == "true" || false,
  };

  const [selectedMethod, setSelectedMethod] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [isAlreadyPaid, setIsAlreadyPaid] = useState(false);
  const [paidDate, setPaidDate] = useState(null);
  const [invalidUrl, setInvalidUrl] = useState(false);
  const [invalidRequest, setInvalidRequest] = useState(false);
  const [amountPaid, setAmountPaid] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [paymentDetails, setPaymentDetails] = useState({});
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [showOtherInstructions, setShowOtherInstructions] = useState(false);

  useEffect(() => {
    const { requestId, paymentHistoryId, userId } = initial;
    if (!requestId || !paymentHistoryId || !userId) {
      setInvalidUrl(true);
    }

    async function logPaymentView() {
      console.log("Logging payment view...");
      const res = await handleLogPaymentView(
        requestId,
        paymentHistoryId,
        userId
      );
    }

    async function getPaymentDetails() {
      const res = await handlePaymentDetails(
        requestId,
        paymentHistoryId,
        userId
      );

      if (res.success) {
        const {
          allowMarkAsPaidForEveryone,
          amountOwed,
          dueDate,
          owedTo,
          requestName,
          paymentMethods,
          participantMarkedAsPaid,
          participantName,
        } = res.data;

        const paymentDetailsFiller = {
          allowMarkAsPaidForEveryone,
          amountOwed,
          dueDate,
          owedTo,
          requestName,
          paymentMethods,
          participantMarkedAsPaid,
          participantName,
        };

        setPaymentDetails({ ...paymentDetailsFiller });

        setPaymentMethods(
          getPaymentMethods(initial, { ...paymentDetailsFiller })
        );

        if (res.data.isPaidInFull) {
          setIsAlreadyPaid(true);
          setAmountPaid(res.data.amountPaid);
          setPaidDate(formatDate(res.data.datePaid));
        }
      } else {
        console.error("Error fetching payment details:", res.error);
        setInvalidRequest(true);
      }

      setTimeout(() => {
        setIsLoading(false);
      }, 500);
    }
    getPaymentDetails();
    logPaymentView();
  }, []);

  async function handleClickPaymentOption(paymentMethodName) {
    const { requestId, paymentHistoryId, userId, paymentAmount } = initial;

    handleLogLastClickedPaymentMethod(
      requestId,
      paymentHistoryId,
      userId,
      paymentMethodName
    );
  }

  const handleMarkAsPaid = async () => {
    const { requestId, paymentHistoryId, userId, paymentAmount } = initial;
    setIsProcessing(true);
    let results;
    try {
      const res = await handlePayment(
        requestId,
        paymentHistoryId,
        userId,
        paymentAmount
      );
      results = res;
      console.log("PAYMENT", res);

      if (res?.success === true) {
        setTimeout(() => {
          setIsConfirmed(true);
          setIsProcessing(false);
        }, 1000);
      } else if (res?.error?.data?.data?.isAlreadyPaid) {
        setIsAlreadyPaid(true);
        const date = res?.error?.data?.data?.paidDate;
        setPaidDate(formatDate(date));
        setIsProcessing(false);
      } else {
        setIsProcessing(false);
        // alert("Payment confirmation failed. Please try again.");
      }
    } catch (error) {
      setIsProcessing(false);
      console.error("Payment error:", error);
      // alert("An error occurred while confirming payment. Please try again.");
    } finally {
      return results;
    }
  };

  const handlePaymentSelect = (method) => {
    setSelectedMethod(method);
    setIsProcessing(true);

    setTimeout(() => {
      if (method.requiresInApp) {
        alert(
          `${method.name} requires in-app integration. Please implement payment processing for ${method.name}.`
        );
      } else if (method.paymentUrl) {
        window.open(method.paymentUrl, "_blank");
        // alert(
        //   `Opened ${method.name} in a new tab with amount ${formatCurrency(
        //     paymentDetails.amountOwed
        //   )}.\n\nIMPORTANT: After completing your payment, return to this page and click "Mark As Paid" to confirm.`
        // );
      } else {
        alert(
          `Redirecting to ${method.name} with amount ${formatCurrency(
            paymentDetails.amountOwed
          )}...\n\nIMPORTANT: After completing your payment, return to this page and click "Mark As Paid" to confirm.`
        );
      }
      setIsProcessing(false);
    }, 1500);
  };

  if (invalidRequest) {
    return (
      <PageLayout>
        <InvalidRequestView />
      </PageLayout>
    );
  }

  if (invalidUrl) {
    return (
      <PageLayout>
        <InvalidUrlView />
      </PageLayout>
    );
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen w-full">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-blue-600 border-t-transparent"></div>
      </div>
    );
  }

  // Completion states
  if (isConfirmed || isAlreadyPaid) {
    const config = isAlreadyPaid
      ? {
          title: "Payment already complete!",
          subtitle: "You have already fully paid this bill",
          gradient: WARNING_GRADIENT,
        }
      : {
          title: "Payment Confirmed!",
          subtitle: "Thank you for completing your payment",
          gradient: SUCCESS_GRADIENT,
        };

    return (
      <PageLayout>
        <CompletionHeroSection
          title={config.title}
          subtitle={config.subtitle}
          gradient={config.gradient}
          isAlreadyPaid={isAlreadyPaid}
        />
        <div className="p-8">
          <div className="text-center mb-8">
            <StatusBadge status={isConfirmed ? "confirmed" : "paid"} />
          </div>
          <PaymentSummary
            initial={initial}
            paidDate={paidDate}
            paymentDetails={paymentDetails}
            amountPaid={amountPaid || paymentDetails.amountOwed}
          />
          {/* <SuccessMessage
            initial={initial}
            paymentDetails={paymentDetails}
            isAlreadyPaid={isAlreadyPaid}
          /> */}
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout
      header={
        <div className="mb-8 text-center space-y-2">
          <h1 className="text-3xl font-bold text-gray-900">
            Hi, {paymentDetails.participantName}
          </h1>

          <h2 className="text-xl font-semibold text-gray-700">
            Payment Details
          </h2>
        </div>
      }
    >
      {/* <HeroSection
        title="Make Payment"
        subtitle="Choose your preferred payment method"
        gradient={PRIMARY_GRADIENT}
        icon={<WalletIcon />}
      /> */}

      <div
        style={{ boxShadow: "0 10px 30px rgba(0,0,0,0.08)" }}
        className="p-8 rounded-lg shadow-xl border border-gray-200 overflow-hidden bg-white"
      >
        {/* <div className="mb-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {paymentDetails.map((detail, index) => (
            <Info key={index} {...detail} />
          ))}
        </div> */}
        <div className="mb-4">
          {/* <h3 className="text-lg font-semibold text-gray-800 mb-2">
            Payment Details
          </h3> */}
          <div className="flex justify-between">
            <div>
              <p className="text-2xl font-bold text-gray-900">
                ${paymentDetails.amountOwed}
              </p>
              <p className="text-sm  font-semibold text-gray-900">
                {paymentDetails.requestName}
              </p>
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900">
                Owed to {paymentDetails.owedTo}
              </p>
              <p className="text-sm font-semibold text-gray-900 text-right">
                {formatDate(paymentDetails.dueDate)}
              </p>
            </div>
          </div>
        </div>

        {/* Instructions Notice */}
        {paymentDetails.allowMarkAsPaidForEveryone && (
          <>
            <div className="mb-6 p-4 rounded-xl bg-amber-50 border border-amber-200">
              <div className="flex items-start gap-3">
                <InfoIcon className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-amber-900">
                    Important: Two-Step Process
                  </p>
                  <ol className="text-xs text-amber-700 mt-1 space-y-1">
                    <li>
                      <span className="font-semibold">1.</span> Select a payment
                      method below to pay
                    </li>
                    <li>
                      <span className="font-semibold">2.</span> Return here and
                      click "Mark As Paid" to confirm else you will continue to
                      receive reminders
                    </li>
                  </ol>
                </div>
              </div>
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
          </>
        )}

        {/* Payment Methods */}
        <div className="space-y-4 mt-4">
          <h3 className="text-gray-500 tracking-wide">Select Payment Method</h3>

          {paymentMethods.length === 0 ? (
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
              <div className="flex items-start gap-3">
                <InfoIcon className="w-5 h-5 text-amber-700 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-amber-900">
                  <div className="font-semibold mb-1">
                    No payment methods available
                  </div>
                  <p className="text-amber-800">
                    Please contact the person in charge of this bill to add a
                    payment method.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <motion.div
              className="grid gap-3 w-full"
              initial="hidden"
              animate="show"
              variants={{
                hidden: {},
                show: {
                  transition: {
                    staggerChildren: 0.08,
                    delayChildren: 0.05,
                  },
                },
              }}
            >
              {paymentMethods.map((method) => {
                const isOther = method.id === "other";
                const showInstructions =
                  isOther &&
                  method.instructions?.trim() &&
                  selectedMethod?.id === "other";

                return (
                  <motion.div
                    key={method.id}
                    className="w-full"
                    variants={{
                      hidden: { opacity: 0, y: 8, scale: 0.98 },
                      show: {
                        opacity: 1,
                        y: 0,
                        scale: 1,
                        transition: { duration: 0.35, ease: "easeOut" },
                      },
                    }}
                  >
                    <motion.a
                      onClick={(e) => {
                        handleClickPaymentOption(method.name);

                        if (isOther) {
                          e.preventDefault();
                          setSelectedMethod((prev) =>
                            prev?.id === "other" ? null : method
                          );
                          return;
                        }

                        setSelectedMethod(method);
                      }}
                      href={isOther ? undefined : method.paymentUrl || "#"}
                      className={`
                        block w-full
                        relative rounded-lg p-4 transition-all duration-200
                        ${
                          isProcessing && selectedMethod?.id === method.id
                            ? "ring-4 ring-blue-100 scale-[0.98]"
                            : "hover:shadow-lg hover:brightness-95"
                        }
                        ${
                          isProcessing ? "cursor-not-allowed" : "cursor-pointer"
                        }
                      `}
                      style={{
                        backgroundColor: method.bgColor,
                        color: method.textColor,
                      }}
                      whileTap={{ scale: 0.985 }}
                    >
                      <div className="flex items-center justify-between w-full">
                        <div className="flex items-center gap-3">
                          <div className="w-[24px] shrink-0">{method.icon}</div>
                          <span className="font-medium text-base text-nowrap">
                            {method.name}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          {isProcessing && selectedMethod?.id === method.id ? (
                            <Spinner color={method.textColor} />
                          ) : (
                            <ArrowIcon
                              className={`w-5 h-5 transition-transform ${
                                isOther && selectedMethod?.id === "other"
                                  ? "rotate-90"
                                  : ""
                              }`}
                            />
                          )}
                        </div>
                      </div>
                    </motion.a>

                    {showInstructions && (
                      <motion.div
                        className="mt-2 rounded-lg border border-gray-200 bg-gray-50 p-3 text-sm text-gray-700 w-full"
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -4 }}
                        transition={{ duration: 0.2 }}
                      >
                        <div className="font-semibold text-gray-900 mb-1">
                          Instructions
                        </div>
                        <div className="whitespace-pre-wrap leading-relaxed">
                          {method.instructions}
                        </div>
                      </motion.div>
                    )}
                  </motion.div>
                );
              })}
            </motion.div>
          )}
        </div>
        {/* Mark as Paid Button */}
        {/* {paymentDetails.allowMarkAsPaidForEveryone && (
          <>
            <div className="relative mb-6 mt-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-gray-500 uppercase tracking-wide font-medium">
                  Step 2: Confirm Payment
                </span>
              </div>
            </div>
            <div className="mb-6">
              <button
                onClick={handleMarkAsPaid}
                disabled={isProcessing}
                className="w-full relative overflow-hidden rounded-2xl p-5 transition-all duration-200 hover:shadow-lg hover:brightness-95 disabled:opacity-60 disabled:cursor-not-allowed group"
                style={{ background: SUCCESS_GRADIENT }}
              >
                <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity"></div>
                <div className="relative flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-white/20 grid place-items-center">
                      <CheckIcon className="w-6 h-6 text-white" />
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
                    <ArrowIcon className="w-6 h-6 text-white" />
                  )}
                </div>
              </button>
            </div>
          </>
        )} */}

        <PaidToggle
          className="mt-20"
          initialPaid={paymentDetails.participantMarkedAsPaid}
          onChange={() => console.log("Marked as paid!")}
          onConfirm={handleMarkAsPaid}
        />

        <p className="text-xs text-gray-500 text-center mt-4">
          By continuing, you agree to our Terms of Service and Privacy Policy
        </p>
      </div>
    </PageLayout>
  );
}
