import { Users, RotateCcw, TrendingUp, Info, Loader2 } from "lucide-react";
import { useState } from "react";
import { useData } from "../../contexts/DataContext";
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
}) {
  const { participants } = useData();
  const [showCostTooltip, setShowCostTooltip] = useState(false);

  // Format the amount per person based on split type
  const formatAmountDisplay = () => {
    if (splitType === "custom" || splitType === "percentage") {
      return {
        amount: `$${Number(totalAmount).toFixed(2)}`,
        label: "total",
      };
    } else {
      return {
        amount: `$${Number(amountPerPerson).toFixed(2)}`,
        label: "each",
      };
    }
  };

  const { amount, label } = formatAmountDisplay();

  // Format billing frequency for display
  const formatBillingFrequency = () => {
    if (billingFrequency === "One-time") {
      return "One-time request";
    }
    return `${billingFrequency} requests`;
  };

  return (
    <>
      {/* Continue Button */}
      {selectedPeople.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 z-50">
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
                                <strong>Dynamic Costs:</strong> Track when
                                amounts change between payment cycles
                              </p>
                              <p>
                                Dynamic costs are useful for utilities,
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
                  <div className="flex items-center gap-3">
                    <div className="flex -space-x-3">
                      {selectedPeople.slice(0, 5).map((person, index) => {
                        const user = participants.find(
                          (u) => u._id === person._id
                        );

                        return (
                          <div
                            key={user._id}
                            className={`w-10 h-10 rounded-xl ${user.color} flex items-center justify-center text-white font-semibold text-sm border-3 border-white shadow-md relative group/avatar hover:translate-x-2 transition-transform duration-200`}
                            style={{ zIndex: selectedPeople.length - index }}
                          >
                            {user.avatar}
                            {/* Tooltip */}
                            <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs py-2 px-3 rounded-lg opacity-0 group-hover/avatar:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
                              {user.name}
                              <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-2 h-2 bg-gray-900 rotate-45"></div>
                            </div>
                          </div>
                        );
                      })}
                      {selectedPeople.length > 5 && (
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-gray-400 to-gray-500 flex items-center justify-center text-white font-semibold text-xs border-3 border-white shadow-md relative group/avatar hover:translate-x-2 transition-transform duration-200">
                          +{selectedPeople.length - 5}
                          {/* Tooltip for overflow count */}
                          <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs py-2 px-3 rounded-lg opacity-0 group-hover/avatar:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
                            {selectedPeople.length - 5} more{" "}
                            {selectedPeople.length - 5 === 1
                              ? "person"
                              : "people"}
                            <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-2 h-2 bg-gray-900 rotate-45"></div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* People count indicator */}
                    <div className="flex items-center gap-1 text-sm text-gray-600 bg-gray-100 px-2 py-1 rounded-lg">
                      <Users className="w-4 h-4" />
                      <span className="font-medium">
                        {selectedPeople.length}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Confirm Button */}
              <button
                onClick={onConfirm}
                disabled={isSendingRequest}
                className={`w-full text-white font-semibold py-4 rounded-xl shadow-lg transition-all hover:shadow-xl flex items-center justify-center gap-3 ${
                  isSendingRequest
                    ? "bg-blue-500 cursor-not-allowed"
                    : "bg-blue-600 hover:bg-blue-700"
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
