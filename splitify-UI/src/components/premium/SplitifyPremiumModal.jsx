import { useEffect, useRef, useState } from "react";
import { createSubscription } from "../../queries/stripe";
import {
  X,
  Check,
  Shield,
  CreditCard,
  Sparkles,
  Building2,
  BadgeDollarSign,
  Info,
  ArrowLeft,
  Loader2,
} from "lucide-react";

// ⬇️ Stripe imports
import { useData } from "../../contexts/DataContext";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  PaymentElement,
  LinkAuthenticationElement,
  AddressElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { gaEvent } from "../../googleAnalytics/googleAnalyticsHelpers";

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

const DEFAULT_PRICING = {
  currency: "USD",
  trialDays: null,
  premium: { monthly: 4.49, annual: 47.88 },
  professional: { monthly: 29, annual: 240 },
  defaultBilling: "monthly",
};

const DEFAULT_COPY = {
  headline: "Unlock smarter requests",
  subheadline:
    "Upgrade to save more time and get access to customizable features.",
  dataAssurance:
    "We never store or have direct access to your bank credentials. Splitify only retains minimal details for the transaction you choose.",
};

// DISPLAY ONLY
const plans = [
  {
    name: "Free",
    id: "free",
    price: "0",
    annualPrice: "0",
    description: (
      <>
        Includes everything you need to automate your bill splits. <br></br>
        <strong className="font-[500]">No card needed.</strong>
      </>
    ),
    features: [
      "*LIMITED TIME* Unlimited text messages and requests",
      "Recurring splits",
      "Automated reminders",
      "Instant bill splitting calculations",
      "Payment tracking",
    ],
    cta: "Sign Up Free",
  },
  {
    name: "Premium",
    id: "premium",
    price: "4.49",
    annualPrice: "3.99",
    includes: "Includes everything in Free",

    description:
      "For those who want to save more time, plus unlock powerful features",
    features: [
      "Unlimited text messages and requests",
      "Plaid bank connection",
      "Automatically update split amounts as bills change.",
      "Customizable Text & Email Messages (Coming soon)",
      "Schedule requests for later",
    ],
    cta: "Get Started",
    popular: true,
  },
  {
    name: "Professional",
    id: "professional",
    price: "29",
    annualPrice: "20",
    includes: "Includes everything in Premium",
    description: "For our bill splitting pros",
    features: [
      "Advanced analytics (Coming Soon)",
      "Priority support",
      "Early access to new features",
      "supports a solo developer",
    ],
    cta: "Get Started",
  },
];

export default function SplitifyPremiumModal({
  isOpen,
  onClose,
  pricing = DEFAULT_PRICING,
  featureCopy = DEFAULT_COPY,
  showPlaid = true,
  showPremium = true,
  showFree = false,
  navbarPadding = false,
  specialCaseScroll = true,
  isModal = true,
  onComplete,
  isCheckoutPhaseForOnboard,
  setIsCheckoutPhaseForOnboard,
}) {
  const { userData, setUserData } = useData();
  const userEmail = userData?.email || "";
  const userName = userData?.name || "";
  const [billing, setBilling] = useState(pricing?.defaultBilling || "monthly");
  const closeBtnRef = useRef(null);

  // steps: "choose" | "pay" | "success"
  const [step, setStep] = useState("choose");
  const [selection, setSelection] = useState(null); // { planKey, billing }
  const [clientSecret, setClientSecret] = useState(null);
  const [isFetchingCS, setIsFetchingCS] = useState(false);
  const [fetchError, setFetchError] = useState(null);

  // success info for confirmation screen
  const [successInfo, setSuccessInfo] = useState(null); // { planKey, billing, amount, currency }

  //for onboarding
  useEffect(() => {
    if (setIsCheckoutPhaseForOnboard) {
      if (step == "pay" || step == "success") {
        setIsCheckoutPhaseForOnboard(true);
      } else {
        setIsCheckoutPhaseForOnboard(false);
      }
    }
  }, [step]);

  // ⬇️ start checkout – fetch a clientSecret for Payment Element
  const startCheckout = async (planKey) => {
    setFetchError(null);
    setStep("pay");
    setIsFetchingCS(true);

    try {
      setSelection({ planKey, billing });
      // Hit your backend to create a Subscription and return a clientSecret
      const res = await createSubscription(planKey, billing, ccy);

      if (!res?.clientSecret) {
        throw new Error("Missing clientSecret from server response");
      }
      setClientSecret(res.clientSecret);
    } catch (err) {
      setFetchError(err?.message || "Something went wrong");
      setStep("choose");
    } finally {
      setIsFetchingCS(false);
    }
    // after finish call onComplete for onboarding step
  };

  useEffect(() => {
    gaEvent("subscription_view");
  }, []);

  useEffect(() => {
    if (isOpen) {
      const id = setTimeout(() => closeBtnRef.current?.focus(), 0);
      const onKey = (e) => {
        if (e.key === "Escape") onClose?.();
      };
      window.addEventListener("keydown", onKey);
      return () => {
        window.removeEventListener("keydown", onKey);
        clearTimeout(id);
      };
    }
  }, [isOpen, onClose]);

  // Reset state when modal opens/closes
  useEffect(() => {
    // If user selected subscription already from landing
    const params = new URLSearchParams(window.location.search);
    if (params?.get("plan") && params?.get("billing")) {
      setStep("pay");
      setSelection({
        planKey: params.get("plan"),
        billing: params.get("billing"),
      });
      setBilling(params.get("billing"));
      startCheckout(params.get("plan"));
    } else {
      if (isOpen) {
        setStep("choose");
        setSelection(null);
        setClientSecret(null);
        setIsFetchingCS(false);
        setFetchError(null);
        setSuccessInfo(null);
      }
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const ccy = pricing.currency || "USD";
  const trial = pricing.trialDays;

  const formatPrice = (amount) => {
    try {
      return new Intl.NumberFormat(undefined, {
        style: "currency",
        currency: ccy,
      }).format(amount);
    } catch {
      return `$${amount}`;
    }
  };

  const getAnnualSavingsPct = (planKey) => {
    const monthly = pricing?.[planKey]?.monthly;
    const annual = pricing?.[planKey]?.annual;
    if (typeof monthly !== "number" || typeof annual !== "number") return null;
    const fullYearMonthly = monthly * 12;
    if (fullYearMonthly <= annual) return null;
    return Math.round((1 - annual / fullYearMonthly) * 100);
  };

  const PriceBlock = ({ planKey }) => {
    const price = pricing[planKey][billing];
    const savings = billing === "annual" ? getAnnualSavingsPct(planKey) : null;
    return (
      <div className="mt-6 flex-1 flex flex-wrap items-end gap-2">
        <span className="text-3xl font-bold tracking-tight">
          {formatPrice(price)}
        </span>
        <span className="text-sm mb-1 text-gray-500">
          / {billing === "monthly" ? "mo" : "yr"}
        </span>
        {savings ? (
          <span className="ml-1 inline-flex items-center rounded-full bg-green-50 px-2 py-0.5 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-100">
            Save {savings}%
          </span>
        ) : null}
      </div>
    );
  };

  const FreeCard = ({ plan }) => (
    <div
      className={` relative bg-white rounded-lg border border-gray-300/70 p-8 shadow-lg transition-shadow hover:shadow-xl ${
        plan.popular ? "ring-2 ring-blue-600" : ""
      }`}
    >
      {plan.popular && (
        <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-blue-600 text-white px-4 py-1 rounded-full text-sm font-semibold">
          Most Popular
        </div>
      )}

      <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name} </h3>

      <p className="text-gray-600 mb-6 min-h-[54px]">{plan.description}</p>

      <div className="mb-6">
        <span className="text-5xl font-bold text-gray-900">
          ${billing == "annual" ? plan.annualPrice : plan.price}
        </span>
        <span className="text-gray-600">/month</span>
      </div>

      <button
        onClick={() => {
          onComplete?.();
        }}
        disabled={isFetchingCS}
        className="inline-flex w-full mb-4 items-center justify-center gap-2 rounded-xl bg-blue-600 text-white px-4 py-2.5 font-medium shadow-sm hover:shadow-md hover:brightness-105 transition disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {isFetchingCS ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" /> Preparing…
          </>
        ) : (
          "Start Free"
        )}
      </button>
      <p className="mb-3 text-gray-400">{plan.includes}</p>

      <ul className="space-y-3">
        {plan.features.map((feature, featureIndex) => (
          <li key={featureIndex} className="flex items-start gap-3">
            <Check className="w-5 h-5 flex-shrink-0 mt-0.5 text-blue-600" />
            <span className="text-gray-700 text-start">{feature}</span>
          </li>
        ))}
      </ul>
    </div>
  );

  const PlaidCard = ({ plan }) => (
    <div
      className={` relative bg-white rounded-lg border border-gray-300/70 p-8 shadow-lg transition-shadow hover:shadow-xl ${
        plan.popular ? "ring-2 ring-blue-600" : ""
      }`}
    >
      {plan.popular && (
        <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-blue-600 text-white px-4 py-1 rounded-full text-sm font-semibold">
          Most Popular
        </div>
      )}

      <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>

      <p className="text-gray-600 mb-6 min-h-[54px]">{plan.description}</p>

      <div className="mb-6">
        <span className="text-5xl font-bold text-gray-900">
          ${billing == "annual" ? plan.annualPrice : plan.price}
        </span>
        <span className="text-gray-600">/month</span>
      </div>

      <button
        onClick={() => startCheckout("premium")}
        disabled={isFetchingCS}
        className="inline-flex w-full mb-4 items-center justify-center gap-2 rounded-xl bg-blue-600 text-white px-4 py-2.5 font-medium shadow-sm hover:shadow-md hover:brightness-105 transition disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {isFetchingCS ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" /> Preparing…
          </>
        ) : (
          "Get Premium"
        )}
      </button>
      <p className="mb-3 text-gray-400">{plan.includes}</p>

      <ul className="space-y-3">
        {plan.features.map((feature, featureIndex) => (
          <li key={featureIndex} className="flex items-start gap-3">
            <Check className="w-5 h-5 flex-shrink-0 mt-0.5 text-blue-600" />
            <span className="text-gray-700 text-start">{feature}</span>
          </li>
        ))}
      </ul>
    </div>
  );

  const PremiumCard = ({ plan }) => (
    <div
      className={`relative border border-gray-200 bg-white rounded-lg p-8 shadow-lg transition-shadow hover:shadow-xl ${
        plan.popular ? "ring-2 ring-blue-600" : ""
      }`}
    >
      {plan.popular && (
        <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-blue-600 text-white px-4 py-1 rounded-full text-sm font-semibold">
          Most Popular
        </div>
      )}

      <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>

      <p className="text-gray-600 mb-6 min-h-[54px]">{plan.description}</p>

      <div className="mb-6">
        <span className="text-5xl font-bold text-gray-900">
          ${billing == "annual" ? plan.annualPrice : plan.price}
        </span>
        <span className="text-gray-600">/month</span>
      </div>

      <button
        onClick={() => startCheckout("professional")}
        disabled={isFetchingCS}
        className="inline-flex w-full mb-4 items-center justify-center gap-2 rounded-xl bg-blue-600 text-white px-4 py-2.5 font-medium shadow-sm hover:shadow-md hover:brightness-105 transition disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {isFetchingCS ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" /> Preparing…
          </>
        ) : (
          "Get Professional"
        )}
      </button>
      <p className="mb-3 text-gray-400">{plan.includes}</p>

      <ul className="space-y-3">
        {plan.features.map((feature, featureIndex) => (
          <li key={featureIndex} className="flex items-start gap-3">
            <Check className="w-5 h-5 flex-shrink-0 mt-0.5 text-blue-600" />
            <span className="text-gray-700 text-start">{feature}</span>
          </li>
        ))}
      </ul>
    </div>
  );

  const PaymentStep = () => {
    const appearance = {
      theme: "stripe",
      variables: {
        colorPrimary: "#2563eb",
        borderRadius: "12px",
      },
    };

    return (
      <div className="flex flex-col  h-full min-h-0">
        {/* Header */}
        <div className="relative flex items-center gap-4 border-b border-gray-100 pl-2 p-6 sm:p-8 flex-none">
          <button
            onClick={() => {
              setStep("choose");
              setClientSecret(null);
              setSelection(null);
            }}
            className="mr-1 inline-flex items-center gap-2 rounded-full px-2.5 py-1.5 text-sm text-gray-600 hover:bg-gray-100"
          >
            <ArrowLeft className="h-4 w-4" /> Back
          </button>

          <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white shadow-sm">
            <Sparkles className="h-5 w-5" />
          </div>
          <div className="flex-1">
            <h2 className="text-xl sm:text-2xl font-semibold tracking-tight">
              Complete your purchase
            </h2>
            <p className="mt-1 text-sm text-gray-600">
              {selection?.planKey === "premium" ? "Premium" : "Professional"} •{" "}
              {billing === "monthly" ? "Monthly" : "Annual"} —{" "}
              {formatPrice(pricing?.[selection?.planKey]?.[billing])}
            </p>
          </div>
          {/* <button
            ref={closeBtnRef}
            onClick={onClose}
            aria-label="Close"
            className="absolute right-2 top-2 inline-flex items-center justify-center rounded-full p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-600"
          >
            <X className="h-5 w-5" />
          </button> */}
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-8">
          {fetchError ? (
            <div className="rounded-lg bg-red-50 text-red-700 p-3 mb-4 text-sm">
              {fetchError}
            </div>
          ) : null}

          {!clientSecret ? (
            <div className="flex h-full items-center justify-center py-16 text-gray-500">
              <Loader2 className="h-5 w-5 animate-spin mr-2" />
              Initializing secure payment…
            </div>
          ) : (
            <Elements
              // ⬇️ Remount when email changes so prefill is applied
              key={userEmail || "no-email"}
              stripe={stripePromise}
              options={{ clientSecret, appearance, loader: "auto" }}
            >
              <CheckoutForm
                planKey={selection?.planKey}
                billing={billing}
                price={pricing?.[selection?.planKey]?.[billing]}
                amountLabel={`${formatPrice(
                  pricing?.[selection?.planKey]?.[billing]
                )} / ${billing === "monthly" ? "mo" : "yr"}`}
                userEmail={userEmail}
                userName={userName}
                onSuccess={(info) => {
                  gaEvent("subscription_purchased", {
                    plan: selection?.planKey,
                    billing: billing,
                  });
                  setUserData((prevUserData) => ({
                    ...prevUserData,
                    plan: selection?.planKey,
                  }));

                  setSuccessInfo(info);
                  setStep("success");
                  setTimeout(() => {
                    onComplete?.(); //for onboarding next step
                  }, 1000);
                }}
              />
            </Elements>
          )}

          {/* Footer */}
          <div className="flex flex-col items-center gap-2 border-t border-gray-100 px-6 py-5 sm:px-8 flex-none">
            <p className="text-xs text-gray-500 text-center max-w-3xl">
              {featureCopy.dataAssurance}
            </p>
            <p className="text-[11px] text-gray-400 text-center">
              Cancel anytime. Prices shown in {ccy}. Taxes may apply.
            </p>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div
      className={`${isModal && "fixed inset-0"} w-full ${
        specialCaseScroll && "overflow-scroll"
      } z-[9999] ${navbarPadding && "mt-[65px]"}`}
      role="dialog"
      d
      aria-modal="true"
      aria-labelledby="splitify-premium-title"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose?.();
      }}
    >
      {/* Scrollable overlay container */}
      <div className="">
        {/* Align top on mobile, center on sm+ */}
        <div
          onClick={(e) => {
            if (e.target !== e.currentTarget) return;
            onClose();
          }}
          className="flex min-h-screen w-full items-start sm:items-center justify-center"
        >
          {/* Panel */}
          <div
            className={`w-full min-h-screen bg-white ${
              isModal && "shadow-2xl ring-1 ring-black/5"
            }  flex flex-col overflow-hidden`}
          >
            {/* CHOOSE STEP */}
            {step === "choose" && (
              <div className="flex-1 overflow-y-auto">
                {/* Header */}
                <div
                  className={`relative flex-col items-start gap-4 ${
                    isModal && "border-b border-gray-100"
                  } p-6 sm:p-8 flex-none`}
                >
                  <div className=" mb-3 mx-auto h-10 w-10 flex items-center justify-center rounded-xl bg-blue-600 text-white shadow-sm">
                    <Sparkles className="h-5 w-5 " />
                  </div>
                  <div className="flex-1 items-center flex flex-col">
                    <h2
                      id="splitify-premium-title"
                      className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2"
                    >
                      {featureCopy.headline}
                    </h2>
                    <p className="text-sm sm:text-base text-gray-600 leading-relaxed max-w-xl">
                      {featureCopy.subheadline}
                    </p>
                  </div>
                  {isModal && (
                    <button
                      ref={closeBtnRef}
                      onClick={onClose}
                      aria-label="Close upgrade modal"
                      className="absolute right-4 top-4 inline-flex items-center justify-center rounded-full p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 "
                    >
                      <X className="h-5 w-5" />
                    </button>
                  )}
                </div>

                {/* Billing toggle */}
                <BillingToggle
                  isAnnual={billing !== "monthly"}
                  setBilling={setBilling}
                />

                {/* Cards */}
                <div
                  className="
    grid max-w-[1200px] mx-auto 
    gap-8 p-6 
   sm:p-8

    /* 1 column on mobile */
    grid-cols-1

    /* auto-fit columns on md+ */
    lg:[grid-template-columns:repeat(auto-fit,minmax(290px,1fr))]
"
                >
                  {showFree && <FreeCard plan={plans[0]} />}
                  {showPlaid && <PlaidCard plan={plans[1]} />}
                  {showPremium && <PremiumCard plan={plans[2]} />}
                </div>

                {/* Footer */}
                <div className="flex flex-col items-center gap-2 px-6 py-5 sm:px-8 flex-none">
                  <p className="text-xs text-gray-500 text-center max-w-3xl">
                    {featureCopy.dataAssurance}
                  </p>
                  <p className="text-[11px] text-gray-400 text-center">
                    Cancel anytime. Prices shown in {ccy}. Taxes may apply.
                  </p>
                </div>
              </div>
            )}

            {/* PAY STEP */}
            {step === "pay" && <PaymentStep />}

            {/* SUCCESS STEP */}
            {step === "success" && (
              <SuccessStep
                info={successInfo}
                onClose={onClose}
                setUserData={setUserData}
                onGoToBilling={() => {
                  // Customize for your router or redirect:
                  // window.location.href = "/billing";
                  onClose?.();
                }}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* --------- Success Step ---------- */
function SuccessStep({ info, onClose, onGoToBilling }) {
  const { planKey, billing, amount, currency = "USD" } = info || {};
  const format = (n) => {
    try {
      return new Intl.NumberFormat(undefined, {
        style: "currency",
        currency,
      }).format(n);
    } catch {
      return `$${n}`;
    }
  };

  // update user data to have plan

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="relative flex items-center gap-4 border-b border-gray-100 p-6 sm:p-8">
        <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-green-600 text-white shadow-sm">
          <Check className="h-5 w-5" />
        </div>
        <div className="flex-1">
          <h2 className="text-xl sm:text-2xl font-semibold tracking-tight">
            Payment successful
          </h2>
          <p className="mt-1 text-sm text-gray-600">
            {planKey === "premium" ? "Premium" : "Professional"} •{" "}
            {billing === "monthly" ? "Monthly" : "Annual"}{" "}
            {typeof amount === "number" ? `— ${format(amount)}` : ""}
          </p>
        </div>
        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute right-4 top-4 inline-flex items-center justify-center rounded-full p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-600"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto p-6 sm:p-8">
        <div className="mx-auto max-w-xl text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-50 text-green-700">
            <Check className="h-8 w-8" />
          </div>
          <h3 className="text-lg font-semibold">You’re all set!</h3>
          <p className="mt-2 text-sm text-gray-600">
            Your purchase was accepted and your subscription is now active.
            You’ll receive an email receipt shortly.
          </p>

          <div className="mt-6 flex justify-center">
            <button
              onClick={onClose}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-white text-gray-700 ring-1 ring-inset ring-gray-200 px-5 py-2.5 font-medium hover:bg-gray-50"
            >
              Continue
            </button>
          </div>

          <p className="mt-4 text-xs text-gray-500">
            Tip: You can update billing details or cancel anytime from settings.
          </p>
        </div>
      </div>
    </div>
  );
}

/* --------- Stripe Checkout Form (inside Elements) ---------- */
function CheckoutForm({
  amountLabel,
  onSuccess,
  userEmail,
  userName,
  planKey,
  billing,
  price,
}) {
  const stripe = useStripe();
  const elements = useElements();

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  // Prevent early submit until PaymentElement is fully ready
  const [paymentReady, setPaymentReady] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return; // hard guard against double-clicks
    setError(null);

    // Block if Stripe/Elements not ready or PaymentElement not ready
    if (!stripe || !elements || !paymentReady) return;

    setSubmitting(true);

    const { error: stripeError } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        // Optional: add a return_url for off-session or redirect-based flows
        // return_url: `${window.location.origin}/billing/return`,
      },
      redirect: "if_required",
    });

    if (stripeError) {
      setError(stripeError.message || "Payment failed.");
      setSubmitting(false);
      return;
    }

    // Success — show success confirmation UI
    onSuccess?.({
      planKey,
      billing,
      amount: typeof price === "number" ? price : undefined,
      currency: "USD",
    });

    setSubmitting(false);
  };

  const paymentElementOptions = {
    layout: "tabs",
    paymentMethodOrder: [
      "apple_pay",
      "google_pay",
      "link",
      "card",
      "us_bank_account",
      "sepa_debit",
      "bancontact",
      "ideal",
      "giropay",
      "eps",
      "p24",
      "sofort",
      "blik",
      "affirm",
      "klarna",
      "afterpay_clearpay",
      "alipay",
      "wechat_pay",
      "paypal",
      "cashapp",
    ],
    wallets: {
      applePay: "auto",
      googlePay: "auto",
    },
    fields: {
      billingDetails: {
        name: "auto",
        email: "auto",
        phone: "auto",
        address: "auto",
      },
    },
    defaultValues: {
      billingDetails: {
        name: userName || undefined,
        email: userEmail || undefined,
      },
    },
    business: { name: "Splitify" },
  };

  return (
    <form onSubmit={handleSubmit} className="h max-w-xl mx-auto space-y-6">
      <div className="rounded-xl border border-gray-200 p-4">
        {/* Prefill Link's email explicitly */}
        <div className="mb-3">
          <LinkAuthenticationElement
            options={{ defaultValues: { email: userEmail || "" } }}
          />
        </div>

        {/* Optional address for invoices/tax */}
        <div className="mb-3">
          <AddressElement
            options={{ mode: "billing", fields: { phone: "auto" } }}
          />
        </div>

        <div>
          <PaymentElement
            options={paymentElementOptions}
            onReady={() => setPaymentReady(true)}
            onEscape={() => {}}
            onBlur={() => {}}
            onFocus={() => {}}
            onChange={() => {}}
          />
        </div>
      </div>

      {error ? (
        <div className="rounded-lg bg-red-50 text-red-700 p-3 text-sm">
          {error}
        </div>
      ) : null}

      <div className="w-full flex items-center justify-center">
        <button
          type="submit"
          disabled={!stripe || !paymentReady || submitting}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 text-white px-5 py-2.5 font-medium shadow-sm hover:shadow-md hover:brightness-105 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {submitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" /> Processing…
            </>
          ) : (
            <>Confirm Payment</>
          )}
        </button>
      </div>

      <p className="text-xs text-gray-500 text-center">
        Payments secured by Stripe.
      </p>
    </form>
  );
}

function BillingToggle({ isAnnual, setBilling }) {
  const leftRef = useRef(null);
  const rightRef = useRef(null);

  const toggle = () =>
    setBilling((prev) => {
      if (prev == "monthly") {
        return "annual";
      } else return "monthly";
    });
  const setMonthly = () => setBilling("monthly");
  const setAnnual = () => setBilling("annual");

  // Keyboard: left/right arrows switch
  const onKeyDown = (e) => {
    if (e.key === "ArrowLeft") setMonthly();
    if (e.key === "ArrowRight") setAnnual();
    if (e.key === "Enter" || e.key === " ") toggle();
  };

  // Each side uses equal width for a crisp slide; tweak w-32 if you want tighter/looser
  const segmentWidth = "w-32"; // change to w-28 / w-36 as you like

  return (
    <div className="flex items-center justify-center flex-col mt-3">
      <div
        role="group"
        aria-label="Billing period"
        className={[
          "relative inline-flex items-center rounded-full",
          "bg-gray-100 ring-1 ring-inset ring-gray-200",
          "p-1 select-none",
        ].join(" ")}
        onKeyDown={onKeyDown}
        tabIndex={0}
      >
        {/* Sliding pill backdrop */}
        <span
          aria-hidden
          className={[
            "absolute inset-y-1 my-auto h-[calc(100%-0.5rem)] rounded-full bg-white shadow-sm",
            "transition-transform duration-300 ease-out motion-reduce:transition-none",
            segmentWidth,
            isAnnual ? "translate-x-[calc(100%+0.25rem)]" : "translate-x-0",
          ].join(" ")}
          style={{ left: "0.25rem" }}
        />

        {/* Monthly */}
        <button
          ref={leftRef}
          type="button"
          onClick={setMonthly}
          aria-pressed={!isAnnual}
          className={[
            "relative z-10 inline-flex items-center justify-center",
            "px-4 py-2 text-sm font-medium rounded-full",
            segmentWidth,
            !isAnnual ? "text-gray-900" : "text-gray-600 hover:text-gray-800",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600",
            "transition-colors",
          ].join(" ")}
        >
          Monthly
        </button>

        {/* Annual */}
        <button
          ref={rightRef}
          type="button"
          onClick={setAnnual}
          aria-pressed={isAnnual}
          className={[
            "relative mr-1 z-10 inline-flex items-center justify-center",
            "px-4 py-2 text-sm font-medium rounded-full",
            segmentWidth,
            isAnnual ? "text-gray-900" : "text-gray-600 hover:text-gray-800",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600",
            "transition-colors",
          ].join(" ")}
        >
          <span className="flex items-center gap-1">Yearly</span>
        </button>
      </div>
      <span className="text-[14px] mt-4 font-normal text-blue-600">
        Save up to 30% with yearly
      </span>
    </div>
  );
}
