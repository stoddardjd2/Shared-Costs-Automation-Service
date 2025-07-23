import {
  ArrowLeft,
  Receipt,
  User,
  DollarSign,
  Calendar,
  RefreshCw,
  ChevronDown,
  Clock,
} from "lucide-react";
import { useState, useEffect } from "react";
import StepIndicator from "./StepIndicator";

const ChargeDetailsStep = ({
  newChargeDetails,
  setNewChargeDetails,
  onContinue,
  onBack,
  chargeType,
}) => {
  const [showFrequencyOptions, setShowFrequencyOptions] = useState(false);
  const [showCustomUnitOptions, setShowCustomUnitOptions] = useState(false);
  const [customInterval, setCustomInterval] = useState(newChargeDetails.customInterval || 1);
  const [customUnit, setCustomUnit] = useState(newChargeDetails.customUnit || "months");
  const isFormValid = newChargeDetails.name.trim() && newChargeDetails.lastAmount.trim();

  // Function to handle numeric input validation
  const handleAmountChange = (e) => {
    const value = e.target.value;
    // Allow only numbers and one decimal point
    const numericValue = value.replace(/[^0-9.]/g, '');
    
    // Prevent multiple decimal points
    const parts = numericValue.split('.');
    if (parts.length > 2) {
      return; // Don't update if there are multiple decimal points
    }
    
    // Limit to 2 decimal places
    if (parts[1] && parts[1].length > 2) {
      return; // Don't update if more than 2 decimal places
    }
    
    setNewChargeDetails((prev) => ({
      ...prev,
      lastAmount: numericValue,
    }));
  };

  // Function to prevent non-numeric key presses
  const handleAmountKeyDown = (e) => {
    // Allow: backspace, delete, tab, escape, enter
    if ([8, 9, 27, 13, 46].indexOf(e.keyCode) !== -1 ||
        // Allow: Ctrl+A, Ctrl+C, Ctrl+V, Ctrl+X
        (e.keyCode === 65 && e.ctrlKey === true) ||
        (e.keyCode === 67 && e.ctrlKey === true) ||
        (e.keyCode === 86 && e.ctrlKey === true) ||
        (e.keyCode === 88 && e.ctrlKey === true) ||
        // Allow: home, end, left, right, down, up
        (e.keyCode >= 35 && e.keyCode <= 40)) {
      return;
    }
    
    // Allow decimal point only if there isn't one already
    if (e.key === '.' && !e.target.value.includes('.')) {
      return;
    }
    
    // Ensure that it's a number and stop the keypress if it's not
    if ((e.shiftKey || (e.keyCode < 48 || e.keyCode > 57)) && (e.keyCode < 96 || e.keyCode > 105)) {
      e.preventDefault();
    }
  };

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        showFrequencyOptions &&
        !event.target.closest(".recurring-dropdown")
      ) {
        setShowFrequencyOptions(false);
      }
      if (
        showCustomUnitOptions &&
        !event.target.closest(".custom-unit-dropdown")
      ) {
        setShowCustomUnitOptions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showFrequencyOptions, showCustomUnitOptions]);

  const getFrequencyLabel = () => {
    switch (newChargeDetails.frequency) {
      case "one-time": return "One-time";
      case "weekly": return "Weekly";
      case "monthly": return "Monthly";
      case "yearly": return "Yearly";
      case "custom": return "Custom";
      default: return "One-time";
    }
  };

  const getCustomFrequencyDisplay = () => {
    if (newChargeDetails.frequency === "custom") {
      if (customInterval === 1) {
        switch (customUnit) {
          case "days": return "Daily";
          case "weeks": return "Weekly";
          case "months": return "Monthly";
          case "years": return "Yearly";
          default: return `Every ${customUnit.slice(0, -1)}`;
        }
      } else {
        return `Every ${customInterval} ${customUnit}`;
      }
    }
    return getFrequencyLabel();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-lg mx-auto px-6 py-0">
        <StepIndicator current="chargeDetails" />

        <div className="flex items-center gap-4 mb-10">
          <button
            onClick={onBack}
            className="p-3 hover:bg-white rounded-xl transition-all hover:shadow-md"
          >
            <ArrowLeft className="w-6 h-6 text-gray-700" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Charge Details</h1>
            <p className="text-gray-600">
              Enter the details for this recurring charge
            </p>
          </div>
        </div>

        <div className="space-y-6 mb-32">
          {/* Name of Charge */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              <Receipt className="w-5 h-5 inline mr-2" />
              Name of Charge
            </h3>
            <input
              type="text"
              value={newChargeDetails.name}
              onChange={(e) =>
                setNewChargeDetails((prev) => ({
                  ...prev,
                  name: e.target.value,
                }))
              }
              placeholder="e.g., Netflix, Spotify Premium"
              className="w-full p-3 border border-gray-200 rounded-lg outline-none text-base bg-white hover:bg-gray-50 transition-colors focus:ring-2 focus:ring-blue-600 focus:border-transparent"
            />
          </div>

          {/* Charge Amount */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              <DollarSign className="w-5 h-5 inline mr-2" />
              Charge Amount
            </h3>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 w-4 h-4" />
              <input
                type="text"
                inputMode="decimal"
                value={newChargeDetails.lastAmount}
                onChange={handleAmountChange}
                onKeyDown={handleAmountKeyDown}
                placeholder="0.00"
                className="w-full pl-10 pr-3 py-3 border border-gray-200 rounded-lg outline-none text-base bg-white hover:bg-gray-50 transition-colors focus:ring-2 focus:ring-blue-600 focus:border-transparent"
              />
            </div>
          </div>

          {/* Billing Frequency */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              <RefreshCw className="w-5 h-5 inline mr-2" />
              Billing Frequency
            </h3>
            
            {/* Recurring Options Dropdown */}
            <div className="relative recurring-dropdown mb-4">
              <button
                onClick={() => setShowFrequencyOptions(!showFrequencyOptions)}
                className="w-full p-3 border border-gray-200 rounded-lg bg-white hover:bg-gray-50 transition-colors flex items-center justify-between focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none"
              >
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-gray-500" />
                  <span className="text-base font-medium text-gray-700">
                    {getFrequencyLabel()}
                  </span>
                </div>
                <ChevronDown
                  className={`w-4 h-4 text-gray-500 transition-transform ${
                    showFrequencyOptions ? "rotate-180" : ""
                  }`}
                />
              </button>

              {showFrequencyOptions && (
                <div className="absolute bottom-full left-0 right-0 mb-2 bg-white border border-gray-200 rounded-lg shadow-lg z-[60]">
                  <div className="p-2 space-y-1">
                    <button
                      onClick={() => {
                        setNewChargeDetails((prev) => ({
                          ...prev,
                          frequency: "one-time",
                        }));
                        setShowFrequencyOptions(false);
                      }}
                      className={`w-full text-left px-3 py-2 rounded hover:bg-gray-100 text-sm transition-colors ${
                        newChargeDetails.frequency === "one-time"
                          ? "bg-blue-50 text-blue-700"
                          : "text-gray-700"
                      }`}
                    >
                      One-time
                    </button>
                    <button
                      onClick={() => {
                        setNewChargeDetails((prev) => ({
                          ...prev,
                          frequency: "weekly",
                        }));
                        setShowFrequencyOptions(false);
                      }}
                      className={`w-full text-left px-3 py-2 rounded hover:bg-gray-100 text-sm transition-colors ${
                        newChargeDetails.frequency === "weekly"
                          ? "bg-blue-50 text-blue-700"
                          : "text-gray-700"
                      }`}
                    >
                      Weekly
                    </button>
                    <button
                      onClick={() => {
                        setNewChargeDetails((prev) => ({
                          ...prev,
                          frequency: "monthly",
                        }));
                        setShowFrequencyOptions(false);
                      }}
                      className={`w-full text-left px-3 py-2 rounded hover:bg-gray-100 text-sm transition-colors ${
                        newChargeDetails.frequency === "monthly"
                          ? "bg-blue-50 text-blue-700"
                          : "text-gray-700"
                      }`}
                    >
                      Monthly
                    </button>
                 
                    <button
                      onClick={() => {
                        setNewChargeDetails((prev) => ({
                          ...prev,
                          frequency: "yearly",
                        }));
                        setShowFrequencyOptions(false);
                      }}
                      className={`w-full text-left px-3 py-2 rounded hover:bg-gray-100 text-sm transition-colors ${
                        newChargeDetails.frequency === "yearly"
                          ? "bg-blue-50 text-blue-700"
                          : "text-gray-700"
                      }`}
                    >
                      Yearly
                    </button>
                    <button
                      onClick={() => {
                        setNewChargeDetails((prev) => ({
                          ...prev,
                          frequency: "custom",
                        }));
                        setShowFrequencyOptions(false);
                      }}
                      className={`w-full text-left px-3 py-2 rounded hover:bg-gray-100 text-sm transition-colors ${
                        newChargeDetails.frequency === "custom"
                          ? "bg-blue-50 text-blue-700"
                          : "text-gray-700"
                      }`}
                    >
                      Custom
                    </button>
                  </div>
                </div>
              )}
            </div>

            {newChargeDetails.frequency === "custom" && (
              <div className="flex gap-3 mb-4">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-600 mb-2">
                    Every
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={customInterval}
                    onChange={(e) => {
                      const value = parseInt(e.target.value) || 1;
                      setCustomInterval(value);
                      setNewChargeDetails((prev) => ({
                        ...prev,
                        customInterval: value,
                      }));
                    }}
                    className="w-full p-3 border border-gray-200 rounded-lg text-base outline-none bg-white hover:bg-gray-50 transition-colors focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                  />
                </div>

                {/* Custom unit dropdown */}
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-600 mb-2">
                    Unit
                  </label>
                  <div className="relative custom-unit-dropdown">
                    <button
                      onClick={() => setShowCustomUnitOptions(!showCustomUnitOptions)}
                      className="w-full p-3 border border-gray-200 rounded-lg text-base bg-white hover:bg-gray-50 transition-colors flex items-center justify-between outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                    >
                      <span className="text-gray-700 font-medium">
                        {customUnit.charAt(0).toUpperCase() + customUnit.slice(1)}
                      </span>
                      <ChevronDown
                        className={`w-4 h-4 text-gray-500 transition-transform ${
                          showCustomUnitOptions ? "rotate-180" : ""
                        }`}
                      />
                    </button>

                    {showCustomUnitOptions && (
                      <div className="absolute bottom-full left-0 right-0 mb-2 bg-white border border-gray-200 rounded-lg shadow-lg z-[70]">
                        <div className="p-2 space-y-1">
                          <button
                            onClick={() => {
                              setCustomUnit("days");
                              setNewChargeDetails((prev) => ({
                                ...prev,
                                customUnit: "days",
                              }));
                              setShowCustomUnitOptions(false);
                            }}
                            className={`w-full text-left px-3 py-2 rounded hover:bg-gray-100 text-sm transition-colors ${
                              customUnit === "days"
                                ? "bg-blue-50 text-blue-700"
                                : "text-gray-700"
                            }`}
                          >
                            Days
                          </button>
                          <button
                            onClick={() => {
                              setCustomUnit("weeks");
                              setNewChargeDetails((prev) => ({
                                ...prev,
                                customUnit: "weeks",
                              }));
                              setShowCustomUnitOptions(false);
                            }}
                            className={`w-full text-left px-3 py-2 rounded hover:bg-gray-100 text-sm transition-colors ${
                              customUnit === "weeks"
                                ? "bg-blue-50 text-blue-700"
                                : "text-gray-700"
                            }`}
                          >
                            Weeks
                          </button>
                          <button
                            onClick={() => {
                              setCustomUnit("months");
                              setNewChargeDetails((prev) => ({
                                ...prev,
                                customUnit: "months",
                              }));
                              setShowCustomUnitOptions(false);
                            }}
                            className={`w-full text-left px-3 py-2 rounded hover:bg-gray-100 text-sm transition-colors ${
                              customUnit === "months"
                                ? "bg-blue-50 text-blue-700"
                                : "text-gray-700"
                            }`}
                          >
                            Months
                          </button>
                          <button
                            onClick={() => {
                              setCustomUnit("years");
                              setNewChargeDetails((prev) => ({
                                ...prev,
                                customUnit: "years",
                              }));
                              setShowCustomUnitOptions(false);
                            }}
                            className={`w-full text-left px-3 py-2 rounded hover:bg-gray-100 text-sm transition-colors ${
                              customUnit === "years"
                                ? "bg-blue-50 text-blue-700"
                                : "text-gray-700"
                            }`}
                          >
                            Years
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Preview */}
          {newChargeDetails.name && (
            <div className="p-4 !mt-14 bg-white rounded-lg border border-gray-200 shadow-sm">
              <h4 className="text-sm font-semibold text-gray-700 mb-3">
                Details:
              </h4>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-semibold text-sm bg-blue-600">
                  <Receipt className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900">
                    {newChargeDetails.customName || newChargeDetails.name}
                  </p>
                  <p className="text-gray-600 text-sm">
                    ${newChargeDetails.lastAmount || "0.00"} •{" "}
                    {getCustomFrequencyDisplay()} 
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-5 shadow-2xl">
          <div className="max-w-[29rem] mx-auto">
            <button
              onClick={onContinue}
              disabled={!isFormValid}
              className={`w-full text-white font-semibold py-4 rounded-xl shadow-lg transition-all flex items-center justify-center gap-3 ${
                isFormValid
                  ? "bg-blue-600 hover:bg-blue-700 hover:shadow-xl"
                  : "bg-gray-300 cursor-not-allowed"
              }`}
            >
              Continue to Select People
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChargeDetailsStep;