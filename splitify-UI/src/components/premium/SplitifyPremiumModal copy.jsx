import { useEffect, useRef, useState } from "react";
import {
  X,
  Check,
  Shield,
  CreditCard,
  Sparkles,
  Building2,
  BadgeDollarSign,
  Info,
} from "lucide-react";

const DEFAULT_PRICING = {
  currency: "USD",
  trialDays: null,
  plaid: { monthly: 2.99, annual: 24.0 },
  premium: { monthly: 7.99, annual: 72.0 },
  defaultBilling: "monthly",
};

const DEFAULT_COPY = {
  headline: "Unlock smarter splits",
  subheadline:
    "Connect your bank for accurate transaction history and upgrade to Premium for advanced automation.",
  dataAssurance:
    "We never store or have direct access to your bank credentials. Splitify only retains minimal details for the transaction you choose.",
};

export default function SplitifyPremiumModal({
  isOpen,
  onClose,
  onSelect,
  pricing = DEFAULT_PRICING,
  featureCopy = DEFAULT_COPY,
  showPlaidOnly = true,
  showPremium = true,
}) {
  const [billing, setBilling] = useState(pricing?.defaultBilling || "monthly");
  const closeBtnRef = useRef(null);

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
          "Dynamic cost tracking (auto-adjust requests)",
          "Find transactions from your bank to easily set up new requests",
          "Filter & choose what to use—your control",
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
        onClick={() => onSelect?.("plaid", billing)}
        className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-white text-blue-600 ring-1 ring-inset ring-blue-200 px-4 py-2.5 font-medium hover:bg-blue-50 transition-colors"
      >
        Connect with Plaid
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
          "Dynamic cost tracking (auto-adjust requests)",
          "Find transactions from your bank to easily set up new requests",
          "Everyone can mark as paid",
          "Custom SMS/email text for requests & reminders",
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
        onClick={() => onSelect?.("premium", billing)}
        className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 text-white px-4 py-2.5 font-medium shadow-sm hover:shadow-md hover:brightness-105 transition"
      >
        Upgrade to Premium
      </button>
    </div>
  );

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
        <div className="flex min-h-dvh items-start sm:items-center justify-center">
          {/* Panel with internal scroll and capped height */}
          <div className="w-full max-w-5xl bg-white shadow-2xl ring-1 ring-black/5 max-h-[100dvh] flex flex-col overflow-hidden  sm:m-10 sm:rounded-xl">
            {/* Body (scrolls if needed) */}
            <div className="flex-1 overflow-y-auto">
              {/* Header (non-scrolling) */}
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
                  className="absolute right-4 top-4 inline-flex items-center justify-center rounded-full p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-600"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

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
                      ? "translate-x-[96px] sm:translate-x-[112px]" // 24*4=96px, 28*4=112px
                      : "translate-x-0"
                  }`}
                  />

                  <div className="relative z-10 flex">
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
                    className={`absolute right-[-5rem] top-1/2 -translate-y-1/2 text-xs font-medium text-blue-700 bg-blue-50 rounded-full px-2 py-1
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

              <div className="grid grid-cols-1 gap-y-8 gap-4 p-6 sm:grid-cols-2 sm:gap-6 sm:p-8">
                {showPlaidOnly && <PlaidCard />}
                {showPremium && <PremiumCard />}
              </div>

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
        </div>
      </div>
    </div>
  );
}
