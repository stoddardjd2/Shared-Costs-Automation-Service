import { Check } from "lucide-react";
import { useState } from "react";
import { useRef } from "react";
import { useNavigate } from "react-router-dom";
import { gaEvent } from "../../../../../googleAnalytics/googleAnalyticsHelpers";

export default function PricingTable() {
  const navigate = useNavigate();
  const [isAnnual, setIsAnnual] = useState(false);

  // Easy color configuration - change these values
  const colors = {
    primary: "blue", // Options: blue, purple, green, red, orange, pink, indigo
    background: "gray", // Options: gray, slate, zinc, neutral
  };

  const plans = [
    {
      name: "Free (no card needed)",
      id: "free",
      price: "0",
      annualPrice: "0",
      description: "Includes everything you need to automate your bill splits",
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
        "Supports a solo developer",
      ],
      cta: "Get Started",
    },
  ];

  const handleCTAClick = (plan) => {
    // Replace with your actual gaEvent and navigate logic
    const selection = {
      plan: plan.id,
      billing: isAnnual ? "annual" : "monthly",
    };

    gaEvent("track_pricing_table_CTA", {
      ...selection,
      landingPage: "v2",
    });

    navigate(`/signup?plan=${selection.plan}&billing=${selection.billing}`);

  };

  return (
    <div className="min-h-screen bg-gray-50 py-16 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-3">
            Simple Pricing
          </h2>
          <p className="text-lg text-gray-600 mb-6">
            Everything you need for free, plus some extra features for the bill
            splitting pros.
          </p>

          <BillingToggle isAnnual={isAnnual} setIsAnnual={setIsAnnual} />
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {plans.map((plan, index) => (
            <div
              key={index}
              className={`border border-gray-200 relative bg-white rounded-lg p-8 shadow-lg transition-shadow hover:shadow-xl ${
                plan.popular ? "ring-2 ring-blue-600" : ""
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-blue-600 text-white px-4 py-1 rounded-full text-sm font-semibold">
                  Most Popular
                </div>
              )}

              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                {plan.name}
              </h3>

              <p className="text-gray-600 mb-6 min-h-[54px]">
                {plan.description}
              </p>

              <div className="mb-6">
                <span className="text-5xl font-bold text-gray-900">
                  ${isAnnual ? plan.annualPrice : plan.price}
                </span>
                <span className="text-gray-600">/month</span>
              </div>

              <button
                onClick={() => handleCTAClick(plan)}
                className={`w-full py-3 rounded-lg font-semibold mb-6 transition-colors ${
                  plan.popular
                    ? "bg-blue-600 text-white hover:bg-blue-700"
                    : "bg-gray-100 text-gray-900 hover:bg-gray-200"
                }`}
              >
                {plan.cta}
              </button>

              <p className="mb-3 text-gray-400">{plan.includes}</p>

              <ul className="space-y-3">
                {plan.features.map((feature, featureIndex) => (
                  <li key={featureIndex} className="flex items-start gap-3">
                    <Check className="w-5 h-5 flex-shrink-0 mt-0.5 text-blue-600" />
                    <span className="text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function BillingToggle({ isAnnual, setIsAnnual }) {
  const leftRef = useRef(null);
  const rightRef = useRef(null);

  const toggle = () => setIsAnnual((v) => !v);
  const setMonthly = () => setIsAnnual(false);
  const setAnnual = () => setIsAnnual(true);

  // Keyboard: left/right arrows switch
  const onKeyDown = (e) => {
    if (e.key === "ArrowLeft") setMonthly();
    if (e.key === "ArrowRight") setAnnual();
    if (e.key === "Enter" || e.key === " ") toggle();
  };

  // Each side uses equal width for a crisp slide; tweak w-32 if you want tighter/looser
  const segmentWidth = "w-32"; // change to w-28 / w-36 as you like

  return (
    <div className="flex items-center justify-center flex-col">
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
