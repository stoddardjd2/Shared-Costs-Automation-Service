import React, { useState, useMemo, useEffect, useRef } from "react";
import {
  CreditCard,
  Link2,
  BadgeDollarSign,
  CircleDollarSign,
  PiggyBank,
  Settings2,
  ArrowRight,
  ArrowLeft,
} from "lucide-react";

import { savePaymentMethods } from "../../../queries/user";

export default function PaymentMethodsStep({
  paymentMethods,
  setPaymentMethods,
  onNext,
  onBack,
  showSkip = false,
  onSkip,
  isOnboarding = true,
}) {
  const [submitting, setSubmitting] = useState(false);
  console.log("PAYHMENT METHODS", paymentMethods);

  // ✅ expand any filled-out methods on first mount (minimal + no fights with user toggles)
  const didInitExpand = useRef(false);
  useEffect(() => {
    if (didInitExpand.current) return;
    didInitExpand.current = true;

    const enabled = { ...(paymentMethods.enabled || {}) };

    const normalKeys = ["venmo", "cashapp", "paypal", "zelle"];

    // enable any normal method with a value
    normalKeys.forEach((k) => {
      if ((paymentMethods[k] || "").trim()) enabled[k] = true;
    });

    // enable "other" only if both fields are filled
    if (
      (paymentMethods.otherName || "").trim() &&
      (paymentMethods.other || "").trim()
    ) {
      enabled.other = true;
    }

    // if something changed, write it back once
    const changed =
      JSON.stringify(enabled) !== JSON.stringify(paymentMethods.enabled || {});
    if (changed) {
      setPaymentMethods((p) => ({ ...p, enabled }));
    }
  }, [paymentMethods, setPaymentMethods]);

  const toggle = (key) => {
    setPaymentMethods((p) => ({
      ...p,
      enabled: { ...p.enabled, [key]: !p.enabled[key] },
    }));
  };

  const handleValueChange = (key, value) => {
    setPaymentMethods((p) => ({ ...p, [key]: value }));
  };

  const paymentOptions = [
    {
      key: "venmo",
      label: "Venmo",
      icon: (
        <svg
          viewBox="0 0 512 512"
          xmlns="http://www.w3.org/2000/svg"
          className="w-5 h-5 fill-blue-600"
        >
          <path d="M444.17,32H70.28C49.85,32,32,46.7,32,66.89V441.6C32,461.91,49.85,480,70.28,480H444.06C464.6,480,480,461.8,480,441.61V66.89C480.12,46.7,464.6,32,444.17,32ZM278,387H174.32L132.75,138.44l90.75-8.62,22,176.87c20.53-33.45,45.88-86,45.88-121.87,0-19.62-3.36-33-8.61-44L365.4,124.1c9.56,15.78,13.86,32,13.86,52.57C379.25,242.17,323.34,327.26,278,387Z"></path>
        </svg>
      ),
      placeholder: "@yourname",
    },
    {
      key: "cashapp",
      label: "Cash App",
      icon: (
        <svg
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
          className="w-5 h-5 fill-blue-600"
        >
          <path d="M23.59 3.47A5.1 5.1 0 0 0 20.54.42C19.23 0 18.04 0 15.62 0H8.36c-2.4 0-3.61 0-4.9.4A5.1 5.1 0 0 0 .41 3.46C0 4.76 0 5.96 0 8.36v7.27c0 2.41 0 3.6.4 4.9a5.1 5.1 0 0 0 3.05 3.05c1.3.41 2.5.41 4.9.41h7.28c2.41 0 3.61 0 4.9-.4a5.1 5.1 0 0 0 3.06-3.06c.41-1.3.41-2.5.41-4.9V8.38c0-2.41 0-3.61-.41-4.91zM17.42 8.1l-.93.93a.5.5 0 0 1-.67.01 5 5 0 0 0-3.22-1.18c-.97 0-1.94.32-1.94 1.21 0 .9 1.04 1.2 2.24 1.65 2.1.7 3.84 1.58 3.84 3.64 0 2.24-1.74 3.78-4.58 3.95l-.26 1.2a.49.49 0 0 1-.48.39H9.63l-.09-.01a.5.5 0 0 1-.38-.59l.28-1.27a6.54 6.54 0 0 1-2.88-1.57v-.01a.48.48 0 0 1 0-.68l1-.97a.49.49 0 0 1 .67 0c.91.86 2.13 1.34 3.39 1.32 1.3 0 2.17-.55 2.17-1.42 0-.87-.88-1.1-2.54-1.72-1.76-.63-3.43-1.52-3.43-3.6 0-2.42 2.01-3.6 4.39-3.71l.25-1.23a.48.48 0 0 1 .48-.38h1.78l.1.01c.26.06.43.31.37.57l-.27 1.37c.9.3 1.75.77 2.48 1.39l.02.02c.19.2.19.5 0 .68z"></path>
        </svg>
      ),
      placeholder: "$yourname",
    },
    {
      key: "paypal",
      label: "PayPal",
      icon: (
        <div className="bg-blue-600 w-5 h-5 flex items-center justify-center rounded-[3px]">
          <svg
            className="w-3 h-3 fill-white translate-x-[0.5px] translate-y-[0.5px]"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M7.076 21.337H2.47a.641.641 0 0 1-.633-.74L4.944.901C5.026.382 5.474 0 5.998 0h7.46c2.57 0 4.578.543 5.69 1.81 1.01 1.15 1.304 2.42 1.012 4.287-.023.143-.047.288-.077.437-.983 5.05-4.349 6.797-8.647 6.797h-2.19c-.524 0-.982.382-1.064.9l-1.106 7.006zm2.146-10.814a.641.641 0 0 0 .633-.74L8.930 2.717a.641.641 0 0 1 .633-.74h4.008c1.295 0 2.233.259 2.845.833.612.574.918 1.407.918 2.833 0 .259-.018.5-.053.740-.018.259-.053.518-.118.777-.018.037-.018.074-.035.111-.353 1.704-1.353 2.833-3.08 3.481-.595.222-1.295.333-2.104.333H9.222z" />
          </svg>
        </div>
      ),
      placeholder: "paypal.me/you",
    },
    {
      key: "zelle",
      label: "Zelle",
      icon: (
        <div className="bg-blue-600 w-5 h-5 flex items-center justify-center rounded-[3px]">
          <svg
            className="w-3 h-3 fill-white"
            viewBox="0 0 178 290"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <g filter="url(#filter0_d_0_1)">
              <path
                d="M14.6289 240.599C6.48898 234.24 5.04575 222.485 11.4053 214.346L137.05 53.5277C143.41 45.3878 155.164 43.9446 163.304 50.3041C171.444 56.6637 172.887 68.4179 166.527 76.5577L40.8825 237.376C34.5229 245.515 22.7688 246.959 14.6289 240.599Z"
                fill="white"
              />
            </g>
            <rect y="37" width="171" height="42" rx="13" fill="white" />
            <path
              d="M7 225C7 217.82 12.8203 212 20 212H165C172.18 212 178 217.82 178 225V241C178 248.18 172.18 254 165 254H20C12.8203 254 7 248.18 7 241V225Z"
              fill="white"
            />
            <path
              d="M67 6C67 2.68629 69.6863 0 73 0H104C107.314 0 110 2.68629 110 6V37C110 40.3137 107.314 43 104 43H73C69.6863 43 67 40.3137 67 37V6Z"
              fill="white"
            />
            <path
              d="M67 253C67 249.686 69.6863 247 73 247H104C107.314 247 110 249.686 110 253V284C110 287.314 107.314 290 104 290H73C69.6863 290 67 287.314 67 284V253Z"
              fill="white"
            />
            <defs>
              <filter
                id="filter0_d_0_1"
                x="3.43956"
                y="46.3384"
                width="171.053"
                height="206.227"
                filterUnits="userSpaceOnUse"
                color-interpolation-filters="sRGB"
              >
                <feFlood flood-opacity="0" result="BackgroundImageFix" />
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
      placeholder: "phone or email",
    },
    {
      key: "other",
      label: "Other",
      icon: <Settings2 className="w-5 h-5" />,
      placeholder: "Apple Pay, cash…",
    },
  ];
  const sanitizeValue = (type, raw) => {
    if (!raw) return "";

    let v = raw.trim();

    switch (type) {
      case "venmo":
        v = v
          .replace(/^https?:\/\/(www\.)?venmo\.com\//i, "")
          .replace(/^venmo\.com\//i, "")
          .replace(/^@/, "");
        return v;

      case "cashapp":
        return v.replace(/^\$/, "");

      case "paypal":
        v = v
          .replace(/^https?:\/\/(www\.)?paypal\.me\//i, "")
          .replace(/^paypal\.me\//i, "");
        return v;

      default:
        return v; // DO NOT sanitize "other" here
    }
  };

  // ✅ Require otherName + other value if Other enabled
  const otherEnabled = !!paymentMethods.enabled?.other;
  const otherNameMissing = otherEnabled && !paymentMethods.otherName?.trim();
  const otherValueMissing = otherEnabled && !paymentMethods.other?.trim();

  // ✅ Require at least ONE payment method filled out/enabled
  const hasAtLeastOnePaymentMethod = useMemo(() => {
    const enabled = paymentMethods.enabled || {};

    if (enabled.plaidBank) return true;

    if (
      enabled.other &&
      paymentMethods.otherName?.trim() &&
      paymentMethods.other?.trim()
    ) {
      return true;
    }

    const normalKeys = ["venmo", "cashapp", "paypal", "zelle"];
    return normalKeys.some((k) => enabled[k] && paymentMethods[k]?.trim());
  }, [paymentMethods]);

  const primaryDisabled = useMemo(() => {
    if (submitting) return true;
    if (otherNameMissing || otherValueMissing) return true;
    // if (!hasAtLeastOnePaymentMethod) return true;
    return false;
  }, [
    submitting,
    otherNameMissing,
    otherValueMissing,
    hasAtLeastOnePaymentMethod,
  ]);

  const handleSaveAndContinue = async () => {
    setSubmitting(true);

    const nextPM = {
      ...paymentMethods,
      enabled: { ...(paymentMethods.enabled || {}) },
    };

    try {
      // For each enabled key, sanitize + disable if invalid
      for (const type of Object.keys(nextPM.enabled)) {
        const isEnabled = !!nextPM.enabled[type];
        if (!isEnabled) continue;

        if (type === "plaidBank") {
          nextPM.plaidBank = true;
          continue;
        }

        if (type === "other") {
          const name = (nextPM.otherName || "").trim();
          const value = (nextPM.other || "").trim();

          if (!name || !value) {
            nextPM.enabled.other = false;
            continue;
          }

          nextPM.otherName = name;
          nextPM.other = value;
          continue;
        }

        const rawUnsanitized = (nextPM[type] || "").trim();

        if (!rawUnsanitized) {
          nextPM.enabled[type] = false;
          continue;
        }

        const cleaned = sanitizeValue(type, rawUnsanitized);

        if (!cleaned) {
          nextPM.enabled[type] = false;
          continue;
        }

        nextPM[type] = cleaned;
      }

      // ✅ NEW: clear values for anything NOT enabled
      const allKeys = ["venmo", "cashapp", "paypal", "zelle", "other"]; // add more if needed
      allKeys.forEach((k) => {
        if (!nextPM.enabled[k]) {
          // normal methods -> wipe stored value
          if (k !== "other") {
            nextPM[k] = "";
          } else {
            // other -> wipe BOTH fields
            nextPM.other = "";
            nextPM.otherName = "";
          }
        }
      });

      const res = await savePaymentMethods(nextPM);
      if (!res?.success) throw new Error("Failed to save payment methods");

      setPaymentMethods(nextPM);
      onNext?.();
    } catch (e) {
      console.error(e);
    } finally {
      setSubmitting(false);
    }
  };

  const SectionTitle = ({ icon, title, subtitle }) => (
    <div className="mb-5 sm:mb-7 flex flex-col items-center text-center px-2">
      {icon && (
        <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 mb-3">
          {icon}
        </div>
      )}
      <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
        {title}
      </h2>
      {subtitle && (
        <p className="text-sm sm:text-base text-gray-600 leading-relaxed max-w-xl">
          {subtitle}
        </p>
      )}
    </div>
  );

  const FooterNav = ({
    primaryLabel = "Next",
    onPrimary,
    primaryDisabled,
    secondaryLabel = "Back",
    onSecondary,
    showSkip,
    skipLabel = "Skip for now",
    onSkip,
  }) => (
    <div className="mt-6 sm:mt-8 flex flex-col gap-2 px-2">
      <button
        type="button"
        onClick={onPrimary}
        disabled={primaryDisabled}
        className={`w-full inline-flex items-center justify-center gap-2 px-4 sm:px-6 py-3 rounded-lg font-medium transition-colors duration-200 ${
          primaryDisabled
            ? "bg-blue-300 text-white cursor-not-allowed"
            : "bg-blue-600 hover:bg-blue-700 text-white"
        }`}
      >
        <span>{primaryLabel}</span>
        <ArrowRight className="w-4 h-4" />
      </button>

      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={onSecondary}
          className="inline-flex items-center justify-center gap-1 text-sm text-gray-600 hover:text-gray-900 transition-colors px-2 py-2"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{secondaryLabel}</span>
        </button>

        {showSkip && (
          <button
            type="button"
            onClick={onSkip}
            className="text-sm text-gray-500 hover:text-gray-800 transition-colors px-2 py-2"
          >
            {skipLabel}
          </button>
        )}
      </div>
    </div>
  );

  return (
    <div className="px-2">
      <SectionTitle
        icon={<CreditCard className="w-6 h-6" />}
        title="How should people pay you back?"
        subtitle="We’ll include these links in every request sent."
      />

      <div className="grid grid-cols-2 gap-2 sm:gap-3">
        {paymentOptions.map((opt) => {
          const enabled = !!paymentMethods.enabled[opt.key];
          console.log("PASS!");
          return (
            <div
              onClick={() => toggle(opt.key)}
              key={opt.key}
              className={`cursor-pointer border rounded-lg p-3 sm:p-4 transition-all ${
                enabled ? "border-blue-600 bg-blue-50/40" : "border-gray-100"
              }`}
            >
              <button
                type="button"
                className="w-full flex items-center gap-2 text-left"
              >
                <div className="text-blue-600">{opt.icon}</div>
                <div className="font-medium text-gray-900">{opt.label}</div>

                {opt.key === "plaidBank" && (
                  <span className="ml-auto text-[10px] uppercase tracking-wide text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                    optional
                  </span>
                )}
              </button>

              {/* Normal methods */}
              {enabled && opt.key !== "plaidBank" && opt.key !== "other" && (
                <input
                  value={paymentMethods[opt.key] || ""}
                  onChange={(e) => handleValueChange(opt.key, e.target.value)}
                  onClick={(e) => e.stopPropagation()}
                  className="mt-2 w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600"
                  placeholder={opt.placeholder}
                  autoComplete="off"
                />
              )}

              {/* ✅ Other: name + value */}
              {enabled && opt.key === "other" && (
                <div
                  className="mt-2 grid gap-2"
                  onClick={(e) => e.stopPropagation()}
                >
                  <input
                    value={paymentMethods.otherName || ""}
                    onChange={(e) =>
                      handleValueChange("otherName", e.target.value)
                    }
                    className={`w-full border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 ${
                      otherNameMissing ? "border-red-300" : "border-gray-200"
                    }`}
                    placeholder="(e.g., Apple Pay)"
                    autoComplete="off"
                  />
                  <input
                    value={paymentMethods.other || ""}
                    onChange={(e) => handleValueChange("other", e.target.value)}
                    className={`w-full border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 ${
                      otherValueMissing ? "border-red-300" : "border-gray-200"
                    }`}
                    placeholder="Handle/link/info"
                    autoComplete="off"
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {(otherNameMissing || otherValueMissing) && (
        <div className="mt-5 text-xs text-red-600">
          Please enter a name and value for “Other”.
        </div>
      )}

       <div className="mt-3 border border-gray-100 rounded-lg p-3 text-left text-sm text-gray-600">
        Your payment links will appear in every text message request.
      </div> 
      {/* {!hasAtLeastOnePaymentMethod && (
        <div className="mt-3 border border-gray-100 rounded-lg p-3 text-left text-sm text-red-600">
          Please add at least one payment method so people can pay you.
        </div>
      )} */}

      <FooterNav
        primaryLabel={submitting ? "Saving..." : "Save payment methods"}
        onPrimary={handleSaveAndContinue}
        primaryDisabled={primaryDisabled}
        onSecondary={onBack}
        showSkip={showSkip}
        onSkip={onSkip}
      />
    </div>
  );
}
