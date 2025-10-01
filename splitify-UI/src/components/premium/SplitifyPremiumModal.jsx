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
  plaid: { monthly: 1.49, annual: 13.99 },
  premium: { monthly: 3.49, annual: 29.49 },
  defaultBilling: "monthly",
};

const DEFAULT_COPY = {
  headline: "Unlock smarter splits",
  subheadline:
    "Connect your bank with Plaid to enable cost tracking or upgrade to Premium for Plaid with additional advanced features.",
  dataAssurance:
    "We never store or have direct access to your bank credentials. Splitify only retains minimal details for the transaction you choose.",
};

export default function SplitifyPremiumModal({
  isOpen,
  onClose,
  pricing = DEFAULT_PRICING,
  featureCopy = DEFAULT_COPY,
  showPlaidOnly = true,
  showPremium = true,
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
    if (isOpen) {
      setStep("choose");
      setSelection(null);
      setClientSecret(null);
      setIsFetchingCS(false);
      setFetchError(null);
      setSuccessInfo(null);
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
  };

  const PlaidCard = () => (
    <div className="group relative flex flex-col rounded-2xl border border-gray-200 bg-white p-6 shadow-sm hover:shadow-md transition-shadow">
      <div className="absolute -top-3 left-4 inline-flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-100">
        <Building2 className="h-3.5 w-3.5" /> Plaid only
      </div>
      <div className="mt-3 flex items-center gap-3">
        <CreditCard className="h-6 w-6 text-blue-600" />
        <h3 className="text-lg font-semibold">Plaid Bank Connection</h3>
      </div>
      <p className="mt-2 text-sm text-gray-600">
        Securely connect your bank to import transactions and enable dynamic
        cost tracking.
      </p>
      <ul className="mt-4 space-y-2 text-sm">
        {[
          "Cost tracking (Splitify adjusts requests with new amounts if costs change)",
          "Find transactions from your bank",
          "Bank-grade encryption via Plaid",
        ].map((f) => (
          <li key={f} className="flex items-start gap-2">
            <Check className="mt-0.5 h-4 w-4 text-blue-600 flex-shrink-0" />
            <span>{f}</span>
          </li>
        ))}
      </ul>

      <PriceBlock planKey="plaid" />

      <button
        onClick={() => startCheckout("plaid")}
        disabled={isFetchingCS}
        className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-white text-blue-600 ring-1 ring-inset ring-blue-200 px-4 py-2.5 font-medium hover:bg-blue-50 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {isFetchingCS ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" /> Preparing…
          </>
        ) : (
          "Connect with Plaid"
        )}
      </button>
    </div>
  );

  const PremiumCard = () => (
    <div className="group relative flex flex-col rounded-2xl border border-gray-200 bg-white p-6 shadow-sm hover:shadow-md transition-shadow">
      <div className="absolute -top-3 left-4 inline-flex items-center gap-1 rounded-full bg-blue-600 px-2.5 py-1 text-xs font-medium text-white shadow">
        <Sparkles className="h-3.5 w-3.5" /> Most popular
      </div>
      <div className="mt-3 flex items-center gap-3">
        <BadgeDollarSign className="h-6 w-6 text-blue-600" />
        <h3 className="text-lg font-semibold">Premium</h3>
      </div>
      <p className="mt-2 text-sm text-gray-600">
        Everything in Plaid connection, plus automation to remove the friction
        of shared costs.
      </p>
      <ul className="mt-4 space-y-2 text-sm">
        {[
          "Cost tracking (Splitify adjusts requests with new amounts if costs change)",
          "Find transactions from your bank",
          "Bank-grade encryption via Plaid",
          "Allow recipients to mark as paid",
          "Custom SMS/email text for requests & reminders (Coming Soon)",
        ].map((f) => (
          <li key={f} className="flex items-start gap-2">
            <Check className="mt-0.5 h-4 w-4 text-blue-600 flex-shrink-0" />
            <span>{f}</span>
          </li>
        ))}
      </ul>

      <PriceBlock planKey="premium" />
      {trial ? (
        <span className="mt-1 inline-flex items-center rounded-full bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-100">
          {trial}-day free trial
        </span>
      ) : null}

      <button
        onClick={() => startCheckout("premium")}
        disabled={isFetchingCS}
        className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 text-white px-4 py-2.5 font-medium shadow-sm hover:shadow-md hover:brightness-105 transition disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {isFetchingCS ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" /> Preparing…
          </>
        ) : (
          "Upgrade to Premium"
        )}
      </button>
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
      <div className="flex flex-col h-full min-h-0">
        {/* Header */}
        <div className="relative flex items-center gap-4 border-b border-gray-100 p-6 sm:p-8 flex-none">
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
              {selection?.planKey === "premium" ? "Premium" : "Plaid"} •{" "}
              {billing === "monthly" ? "Monthly" : "Annual"} —{" "}
              {formatPrice(pricing?.[selection?.planKey]?.[billing])}
            </p>
          </div>
          <button
            ref={closeBtnRef}
            onClick={onClose}
            aria-label="Close"
            className="absolute right-4 top-4 inline-flex items-center justify-center rounded-full p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-600"
          >
            <X className="h-5 w-5" />
          </button>
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
      className="fixed inset-0 z-[1000]"
      role="dialog"
      aria-modal="true"
      aria-labelledby="splitify-premium-title"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose?.();
      }}
    >
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" />

      {/* Scrollable overlay container */}
      <div className="fixed inset-0 overflow-y-auto">
        {/* Align top on mobile, center on sm+ */}
        <div
          onClick={(e) => {
            if (e.target !== e.currentTarget) return;
            onClose();
          }}
          className="flex min-h-dvh items-start sm:items-center justify-center"
        >
          {/* Panel */}
          <div className="w-full max-w-5xl bg-white shadow-2xl ring-1 ring-black/5 min-h-[100svh] sm:min-h-0 max-h-[100svh] sm:max-h-[85vh] flex flex-col overflow-hidden sm:m-10 sm:rounded-xl">
            {/* CHOOSE STEP */}
            {step === "choose" && (
              <div className="flex-1 min-h-0 overflow-y-auto">
                {/* Header */}
                <div className="relative flex items-start gap-4 border-b border-gray-100 p-6 sm:p-8 flex-none">
                  <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white shadow-sm">
                    <Sparkles className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <h2
                      id="splitify-premium-title"
                      className="text-xl sm:text-2xl font-semibold tracking-tight"
                    >
                      {featureCopy.headline}
                    </h2>
                    <p className="mt-1 text-sm text-gray-600">
                      {featureCopy.subheadline}
                    </p>
                  </div>
                  <button
                    ref={closeBtnRef}
                    onClick={onClose}
                    aria-label="Close upgrade modal"
                    className="absolute right-4 top-4 inline-flex items-center justify-center rounded-full p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 "
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                {/* Billing toggle */}
                <div className="flex flex-wrap items-center justify-center gap-3 px-6 pt-5 sm:px-8">
                  <div className="relative inline-flex rounded-full bg-gray-100 p-1 text-sm">
                    {/* Sliding thumb */}
                    <span
                      aria-hidden
                      className={`absolute inset-y-1 left-1 rounded-full bg-white shadow ring-1 ring-inset ring-blue-200
                  transition-transform duration-300 ease-out
                  w-24 sm:w-28
                  ${
                    billing === "annual"
                      ? "translate-x-[96px] sm:translate-x-[112px]"
                      : "translate-x-0"
                  }`}
                    />

                    <div className="relative z-10 flex ">
                      {["monthly", "annual"].map((k) => (
                        <button
                          key={k}
                          onClick={() => setBilling(k)}
                          className={`w-24 sm:w-28 px-3 py-1.5 rounded-full capitalize text-center
                      transition-colors duration-200
                      ${
                        billing === k
                          ? "text-blue-600"
                          : "text-gray-600 hover:text-gray-800"
                      }`}
                          aria-pressed={billing === k}
                        >
                          {k}
                        </button>
                      ))}
                    </div>

                    {/* Animated badge */}
                    <span
                      className={`absolute top-[-20px] right-1/2 translate-x-1/2 text-xs font-medium text-blue-700 bg-blue-50 rounded-full px-2 py-1
                  ring-1 ring-inset ring-blue-100
                  transition-all duration-300
                  ${
                    billing === "annual"
                      ? "opacity-100 -translate-y-1/2"
                      : "opacity-0 translate-y-[-20px] pointer-events-none"
                  }`}
                    >
                      Best value
                    </span>
                  </div>
                </div>

                {/* Cards */}
                <div className="grid grid-cols-1 gap-y-8 gap-4 p-6 sm:grid-cols-2 sm:gap-6 sm:p-8">
                  {showPlaidOnly && <PlaidCard />}
                  {showPremium && <PremiumCard />}
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
            {planKey === "premium" ? "Premium" : "Plaid"} •{" "}
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
          <>Pay {amountLabel}</>
        )}
      </button>

      <p className="text-xs text-gray-500 text-center">
        Payments secured by Stripe.
      </p>
    </form>
  );
}
