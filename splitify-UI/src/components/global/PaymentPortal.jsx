import React, { useEffect, useMemo, useState } from "react";
import { handlePayment } from "../../queries/requests";
import { Info as InfoIcon, AlertCircle, Home, RefreshCw } from "lucide-react"; // the info-in-a-circle icon
import { handlePaymentDetails } from "../../queries/requests";
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
const getPaymentMethods = (initial, paymentDetails) => [
  {
    id: "venmo",
    name: "Venmo",
    bgColor: "#3D95CE",
    textColor: "white",
    paymentUrl:
      paymentDetails.paymentMethods?.venmo &&
      paymentDetails.paymentMethods.venmo.trim() !== ""
        ? (() => {
            const username = paymentDetails.paymentMethods.venmo.trim();
            const amount = paymentDetails.amountOwed;
            const note = encodeURIComponent(
              paymentDetails.requestName || "Payment"
            );

            // venmo:// deep link (preferred for mobile)
            const deepLink = `venmo://pay?txn=pay&recipients=${username}&amount=${amount}&note=${note}`;

            // fallback for desktop (opens profile)
            const webFallback = `https://venmo.com/u/${username}`;

            return { deepLink, webFallback };
          })()
        : {
            deepLink: "https://venmo.com/",
            webFallback: "https://venmo.com/",
          },
    icon: (
      <svg
        fill="#ffffff"
        viewBox="0 0 512 512"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path d="M444.17,32H70.28C49.85,32,32,46.7,32,66.89V441.6C32,461.91,49.85,480,70.28,480H444.06C464.6,480,480,461.8,480,441.61V66.89C480.12,46.7,464.6,32,444.17,32ZM278,387H174.32L132.75,138.44l90.75-8.62,22,176.87c20.53-33.45,45.88-86,45.88-121.87,0-19.62-3.36-33-8.61-44L365.4,124.1c9.56,15.78,13.86,32,13.86,52.57C379.25,242.17,323.34,327.26,278,387Z"></path>
      </svg>
    ),
  },
  {
    id: "cashapp",
    name: "Cash App",
    bgColor: "#00D632",
    textColor: "white",
    paymentUrl:
      paymentDetails.paymentMethods?.cashapp &&
      paymentDetails.paymentMethods.cashapp?.trim() !== ""
        ? `https://cash.app/$${paymentDetails.paymentMethods.cashapp}/${paymentDetails.amountOwed}`
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
  },

  // {
  //   id: "zelle",
  //   name: "Zelle",
  //   bgColor: "#6D1ED4",
  //   textColor: "white",
  //   paymentUrl: "https://www.zellepay.com/get-started",
  //   icon: (
  //     <svg
  //       fill="#ffffff"
  //       viewBox="0 0 24 24"
  //       xmlns="http://www.w3.org/2000/svg"
  //     >
  //       <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.568 17.334h-7.568L16.432 6.666H9.568L7.432 17.334h7.568L8.568 6.666h7.568L17.568 17.334z" />
  //       <path d="M15.134 9.866H8.866l2.268-3.2h6.268l-2.268 3.2zM8.866 14.134h6.268l-2.268 3.2H6.598l2.268-3.2z" />
  //     </svg>
  //   ),
  // },
  {
    id: "applepay",
    name: "Apple Pay",
    bgColor: "#000000",
    textColor: "white",
    paymentUrl: "https://www.apple.com/apple-pay/",
    icon: (
      <svg
        fill="#ffffff"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
      </svg>
    ),
  },
  {
    id: "googlepay",
    name: "Google Pay",
    bgColor: "#4285F4",
    textColor: "white",
    paymentUrl: "https://pay.google.com/",
    icon: (
      <svg
        fill="#ffffff"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
      </svg>
    ),
  },
  {
    id: "paypal",
    name: "PayPal",
    bgColor: "#0070BA",
    textColor: "white",
    paymentUrl:
      paymentDetails.paymentMethods?.paypal &&
      paymentDetails.paymentMethods.paypal?.trim() !== ""
        ? `https://www.paypal.me/${paymentDetails.paymentMethods.paypal}/${paymentDetails.amountOwed}`
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
  },
];

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
  const [amountPaid, setAmountPaid] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [paymentDetails, setPaymentDetails] = useState({});

  const [paymentMethods, setPaymentMethods] = useState([]);

  useEffect(() => {
    const { requestId, paymentHistoryId, userId } = initial;
    if (!requestId || !paymentHistoryId || !userId) {
      setInvalidUrl(true);
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
        } = res.data;

        const paymentDetailsFiller = {
          allowMarkAsPaidForEveryone,
          amountOwed,
          dueDate,
          owedTo,
          requestName,
          paymentMethods,
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
      }

      setTimeout(() => {
        setIsLoading(false);
      }, 500);
    }
    getPaymentDetails();
  }, []);

  const handleMarkAsPaid = async () => {
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
        setPaidDate(formatDate(date));
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
          <SuccessMessage
            initial={initial}
            paymentDetails={paymentDetails}
            isAlreadyPaid={isAlreadyPaid}
          />
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout
      header={
        <h1 className="text-3xl  font-bold text-center mb-8 text-gray-800">
          Payment Details
        </h1>
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

          <div className="grid gap-3">
            {paymentMethods.map((method) => (
              <button
                key={method.id}
                onClick={() => handlePaymentSelect(method)}
                disabled={isProcessing}
                className={`
                  relative w-full rounded-lg p-4 transition-all duration-200
                  ${
                    isProcessing && selectedMethod?.id === method.id
                      ? "ring-4 ring-blue-100 scale-[0.98]"
                      : "hover:shadow-lg hover:brightness-95"
                  }
                  ${isProcessing ? "cursor-not-allowed" : "cursor-pointer"}
                  disabled:opacity-60
                `}
                style={{
                  backgroundColor: method.bgColor,
                  color: method.textColor,
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
                    {isProcessing && selectedMethod?.id === method.id ? (
                      <Spinner color={method.textColor} />
                    ) : (
                      <ArrowIcon className="w-5 h-5" />
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Mark as Paid Button */}
        {paymentDetails.allowMarkAsPaidForEveryone && (
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
        )}

        <p className="text-xs text-gray-500 text-center mt-4">
          By continuing, you agree to our Terms of Service and Privacy Policy
        </p>
      </div>
    </PageLayout>
  );
}
