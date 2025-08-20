import React from "react";
import { Receipt, Edit3, Clock } from "lucide-react";

const ChargeDisplay = ({
  selectedCharge,
  newChargeDetails,
  overrideAmount,
  recurringType,
  originalFrequency = "none",
}) => {
  // if (!selectedCharge && !newChargeDetails?.name) return null;

  // Helper function to get amount with fallback logic
  const getAmount = (charge) => {
    return charge?.amount ?? charge?.lastAmount ?? null;
  };

  const originalAmount =
    getAmount(selectedCharge) || getAmount(newChargeDetails) || 0;
  const displayAmount =
    overrideAmount !== undefined ? overrideAmount : originalAmount;
  const isOverridden =
    overrideAmount !== undefined && overrideAmount !== originalAmount;

  const currentFrequency = recurringType || "One-time";
  const isScheduleModified = !(originalFrequency == currentFrequency);

  return (
    <div className="p-4 mb-6 bg-white rounded-xl border border-gray-200 shadow-sm">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center">
          <Receipt className="w-5 h-5 text-white" />
        </div>
        <div className="flex-1">
          <p className="font-semibold text-gray-900">
            {selectedCharge?.name ||
              newChargeDetails?.customName ||
              newChargeDetails?.name || "Your Charge"}
          </p>
          <div className="flex items-center gap-2 text-sm">
            {/* Amount Display */}
            {isOverridden ? (
              <>
                <span className="text-gray-400 line-through">
                  ${Number(originalAmount).toFixed(2)}
                </span>
                <span className="text-blue-600 font-medium">
                  ${Number(displayAmount).toFixed(2)}
                </span>
                <Edit3 className="w-3 h-3 text-blue-600" />
              </>
            ) : (
              <span className="text-gray-600">
                ${Number(displayAmount).toFixed(2)}
              </span>
            )}
            <span className="text-gray-400">•</span>
            {/* Payment Schedule Display */}
            {isScheduleModified && !(originalFrequency == "none") ? (
              <>
                <span className="text-gray-400 line-through text-xs capitalize">
                  {originalFrequency}
                </span>
                <span className="text-orange-600 font-medium flex items-center gap-1 capitalize">
                  <Clock className="w-3 h-3" />
                  {currentFrequency}
                </span>
              </>
            ) : (
              <span className="text-gray-600 flex items-center gap-1 capitalize">
                <Clock className="w-3 h-3" />
                {currentFrequency}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChargeDisplay;
