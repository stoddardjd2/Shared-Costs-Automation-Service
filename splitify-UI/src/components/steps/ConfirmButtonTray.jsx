import { Users, RotateCcw, TrendingUp, Info, Loader2 } from "lucide-react";
import { useState } from "react";
import { useData } from "../../contexts/DataContext";
import { amountRange } from "../../utils/amountHelper";
import SelectedPeopleDisplay from "./SelectedPeopleDisplay";

export default function ConfirmButtonTray({
  selectedPeople,
  onConfirm,
  buttonContent,
  isDynamic = false,
  amountPerPerson,
  totalAmount,
  billingFrequency,
  splitType,
  hideBillingInfo = false,
  isSendingRequest,
  isCustomFrequency,
  isEditMode,
  frequency,
  chargeName = "none",
  isCheckout = false,
  startTiming,
  costEntry,
}) {
  const { participants } = useData();
  const [showCostTooltip, setShowCostTooltip] = useState(false);

  console.log("customfrequency", billingFrequency);
  const isDisabled = () => {
    if (!isCheckout) {
      return false;
    } else {
      const isUsingCustomFrequencyNumberAndIsFalsy = () => {
        function extractNumbers(str) {
          return str?.match(/\d+/g)?.map(Number) || [];
        }
        const customFrequencyNumber = extractNumbers(billingFrequency)[0];

        if (frequency == "custom") {
          const exceptions = [
            "daily",
            "weekly",
            "monthly",
            "yearly",
            "biweekly",
          ];
          if (exceptions.some((freq) => billingFrequency.includes(freq))) {
          } else {
            return (
              customFrequencyNumber == 0 || customFrequencyNumber == undefined
            );
          }
        }
        return false;
      };
      return (
        isSendingRequest ||
        totalAmount == 0 ||
        !chargeName ||
        !frequency ||
        isUsingCustomFrequencyNumberAndIsFalsy() ||
        !startTiming
      );
    }
  };

  function getFrequncyLabel(frequency) {
    switch (frequency) {
      case "daily":
        return "1 day";
      case "weekly":
        return "1 week";
      case "monthly":
        return "1 month";
      case "yearly":
        return "1 year";
    }
  }

  // Format the amount per person based on split type
  const formatAmountDisplay = (cost) => {
    if (splitType === "custom" || splitType === "percentage") {
      const range = amountRange(cost);
      if (range.isSame) {
        return {
          amount: `$${range.low}`,
          label: "per person",
        };
      } else {
        return {
          amount: `$${range.low}-$${range.high}`,
          label: "per person",
        };
      }
    } else {
      return {
        amount: `$${Number(amountPerPerson).toFixed(2)}`,
        label: "each",
      };
    }
  };

  const { amount, label } = formatAmountDisplay(costEntry);
  const capitalizeFirst = (str) => str.charAt(0).toUpperCase() + str.slice(1);

  // Format billing frequency for display
  const formatBillingFrequency = () => {
    if (billingFrequency === "One-time") {
      return "One-time request";
    } else if (isCustomFrequency) {
      return `Requests ${billingFrequency} `;
    }
    return `${capitalizeFirst(billingFrequency)} requests`;
  };

  return (
    <>
      {/* Continue Button */}
      {selectedPeople.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 z-[60]">
          {/* Backdrop blur effect */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-black/5 to-transparent backdrop-blur-sm"></div>

          {/* Main container */}
          <div className="relative bg-white/95 backdrop-blur-xl border-t border-gray-200/50 shadow-2xl">
            <div className="max-w-lg mx-auto px-6 py-5">
              {/* Header section with price and people */}
              <div
                className={`flex items-center ${
                  hideBillingInfo ? "justify-center" : "justify-between"
                } mb-5 min-h-[3.75rem]`}
              >
                {/* Price section */}
                {!hideBillingInfo && (
                  <div className="flex-shrink-0">
                    <div className="flex items-center gap-3 mb-2">
                      <div>
                        <div className="flex items-baseline gap-2">
                          <span className="text-2xl font-bold text-gray-900">
                            {amount}
                          </span>
                          <span className="text-sm font-medium text-gray-500">
                            {label}
                          </span>
                        </div>
                      </div>

                      {/* Cost tracking badge */}
                      {isDynamic && (
                        <div className="relative">
                          <div
                            className="flex items-center justify-center bg-gray-100 px-2 py-1 rounded-lg hover:bg-gray-200 transition-colors cursor-pointer relative"
                            onMouseEnter={() => setShowCostTooltip(true)}
                            onMouseLeave={() => setShowCostTooltip(false)}
                          >
                            <TrendingUp className="w-6 h-6 text-orange-500" />
                            <Info className="w-4 h-4 text-gray-500 absolute -top-2 -right-2" />
                          </div>

                          {/* Tooltip */}
                          {showCostTooltip && (
                            <div className="absolute bottom-full left-0 mb-2 w-64 bg-gray-900 text-white text-xs rounded-lg p-3 shadow-lg z-50">
                              <p className="mb-2">
                                <strong>Cost Tracking:</strong> Track when
                                amounts change between payment cycles
                              </p>
                              <p>
                                Variable cost tracking is useful for utilities,
                                subscriptions, or any recurring cost that varies
                                each period.
                              </p>
                              <div className="absolute top-full left-2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-gray-900"></div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <RotateCcw className="w-3 h-3 text-blue-500" />
                      <span>{formatBillingFrequency()}</span>
                      {/* {isEditMode && (
                        <div className="relative group">
                          <Info className="w-3 h-3 text-gray-400" />
                          <div className="absolute bottom-full right-full w-[250px] z-50 left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                            Future requests will be sent{" "}
                            {frequency == "custom"
                              ? billingFrequency
                                  .replace(/\bevery\b/gi, "")
                                  .replace(/\s+/g, " ")
                                  .trim()
                              : getFrequncyLabel(frequency)}{" "}
                            from last sent request
                          </div>
                        </div>
                      )} */}
                    </div>
                  </div>
                )}

                {/* People display section - Always Avatars */}
                <div
                  className={`flex-1 flex ${
                    hideBillingInfo
                      ? "max-w-full "
                      : "ml-auto max-w-[60%] justify-end "
                  }`}
                >
                  <SelectedPeopleDisplay selectedPeople={selectedPeople} />
                </div>
              </div>

              {/* Confirm Button */}
              <button
                onClick={() => {
                  if (!isCheckout) {
                    const root = document.getElementById("root");
                    if (root) {
                      root.scrollTo({ top: 0, left: 0, behavior: "instant" });
                    }
                  }
                  onConfirm();
                }}
                disabled={isDisabled()}
                className={`w-full text-white font-semibold py-4 rounded-xl shadow-lg transition-all hover:shadow-xl flex items-center justify-center gap-3 ${
                  isDisabled()
                    ? "bg-blue-600/40 cursor-not-allowed"
                    : "bg-blue-600 hover:bg-blue-700 cursor-pointer"
                }`}
              >
                {isSendingRequest ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Sending...
                  </>
                ) : (
                  buttonContent || "Continue"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
