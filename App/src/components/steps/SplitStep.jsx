import React, { useState } from "react";
import {
  ArrowLeft,
  User,
  X,
  Calculator,
  DollarSign,
  Send,
  ChevronDown,
  Clock,
  Play,
  SkipForward,
  Edit3,
  TrendingUp,
  BarChart3,
  Info,
  Percent,
} from "lucide-react";
import StepIndicator from "./StepIndicator";
import ChargeDisplay from "../costs/ChargeDisplay";
import { useData } from "../../contexts/DataContext";
import generateCostEntry from "../../utils/generateCostEntry";
import { useNavigate } from "react-router-dom";

const SplitStep = ({
  selectedPeople,
  onBack,
  selectedCharge,
  newChargeDetails,
  // Split state
  splitType,
  setSplitType,
  totalAmount,
  setTotalAmount,
  customAmounts,
  updateCustomAmount,
  calculateSplitAmounts,
  // Percentage state - remove defaults to force proper passing
  percentageAmounts,
  updatePercentageAmount,
}) => {
  // Context to update costs
  const { setCosts } = useData();
  const navigate = useNavigate();

  // Internal state for percentage amounts if not provided
  const [internalPercentageAmounts, setInternalPercentageAmounts] = useState({});
  
  // Use internal state if props not provided
  const effectivePercentageAmounts = percentageAmounts || internalPercentageAmounts;
  const effectiveUpdatePercentageAmount = updatePercentageAmount || ((personId, value) => {
    console.log("Using internal percentage state:", personId, value);
    setInternalPercentageAmounts(prev => ({
      ...prev,
      [personId]: value
    }));
  });

  // Local state for recurring options
  const [showRecurringOptions, setShowRecurringOptions] = useState(false);
  const [recurringType, setRecurringType] = useState(
    selectedCharge?.frequency.toLowerCase() || "none"
  );
  const [customInterval, setCustomInterval] = useState(1);
  const [customUnit, setCustomUnit] = useState("days");

  // State for start timing
  const [startTiming, setStartTiming] = useState("now");

  // State for editable total amounts
  const [editableTotalAmount, setEditableTotalAmount] = useState(
    selectedCharge?.lastAmount || 0
  );
  const [isEditingTotal, setIsEditingTotal] = useState(false);

  // State for dynamic costs tracking
  const [isDynamicCosts, setIsDynamicCosts] = useState(false);
  const [dynamicCostReason, setDynamicCostReason] = useState("");
  const [showDynamicInfo, setShowDynamicInfo] = useState(false);

  // Close dropdowns when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        showRecurringOptions &&
        !event.target.closest(".recurring-dropdown")
      ) {
        setShowRecurringOptions(false);
      }
      if (showDynamicInfo && !event.target.closest(".dynamic-info-tooltip")) {
        setShowDynamicInfo(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showRecurringOptions, showDynamicInfo]);

  const getRecurringLabel = () => {
    switch (recurringType) {
      case "daily":
        return "Daily";
      case "weekly":
        return "Weekly";
      case "monthly":
        return "Monthly";
      case "yearly":
        return "Yearly";
      case "custom":
        if (customInterval === 1) {
          switch (customUnit) {
            case "days":
              return "Daily";
            case "weeks":
              return "Weekly";
            case "months":
              return "Monthly";
            case "years":
              return "Yearly";
            default:
              return `Every ${customUnit.slice(0, -1)}`;
          }
        } else {
          return `Every ${customInterval} ${customUnit}`;
        }
      default:
        return "One-time";
    }
  };

  const getNextPeriodLabel = () => {
    if (recurringType === "custom") {
      if (customInterval === 1) {
        switch (customUnit) {
          case "days":
            return "Tomorrow";
          case "weeks":
            return "Next week";
          case "months":
            return "Next month";
          case "years":
            return "Next year";
          default:
            return `Next ${customUnit.slice(0, -1)}`;
        }
      } else {
        return `In ${customInterval} ${customUnit}`;
      }
    }
    switch (recurringType) {
      case "daily":
        return "Tomorrow";
      case "weekly":
        return "Next week";
      case "monthly":
        return "Next month";
      case "yearly":
        return "Next year";
      default:
        return "Next occurrence";
    }
  };

  const handleSendRequest = (totalSplit) => {
    const costEntry = generateCostEntry({
      selectedCharge,
      newChargeDetails,
      selectedPeople,
      splitType,
      customAmounts,
      percentageAmounts: effectivePercentageAmounts,
      recurringType,
      customInterval,
      customUnit,
      startTiming,
      totalSplit,
      isDynamicCosts,
      dynamicCostReason,
    });

    setCosts((prevCosts) => [...prevCosts, costEntry]);
    navigate("/dashboard");
  };

  // Calculate split amounts based on split type
  const calculateActualSplitAmounts = () => {
    if (splitType === "percentage") {
      const percentageSplit = {};
      selectedPeople.forEach((person) => {
        const percentage = Number(effectivePercentageAmounts[person.id] || 0);
        percentageSplit[person.id] = (Number(editableTotalAmount) * percentage) / 100;
      });
      return percentageSplit;
    }
    return calculateSplitAmounts(selectedPeople);
  };

  // Calculate split amounts
  const splitAmounts = calculateActualSplitAmounts();
  const entries = Object.entries(splitAmounts);
  const totalAmountValue = editableTotalAmount || selectedCharge?.lastAmount || 0;

  // Calculate the sum based on split type
  const totalSplit =
    splitType === "equalWithMe"
      ? (Number(editableTotalAmount) / (selectedPeople.length + 1)) *
        selectedPeople.length
      : splitType === "equal"
      ? Number(editableTotalAmount)
      : splitType === "percentage"
      ? entries
          .filter(([key]) => !key.toLowerCase().includes("total"))
          .reduce((sum, [, amount]) => sum + Number(amount || 0), 0)
      : entries
          .filter(([key]) => !key.toLowerCase().includes("total"))
          .reduce((sum, [, amount]) => sum + Number(amount || 0), 0);

  // Calculate the remainder
  const remainder = Number(totalAmountValue) - totalSplit;

  // Calculate total percentage for percentage split
  const totalPercentage = splitType === "percentage" 
    ? selectedPeople.reduce((sum, person) => sum + Number(effectivePercentageAmounts[person.id] || 0), 0)
    : 0;

  // Check if dynamic costs should be disabled
  const isDynamicCostsDisabled = 
    splitType === "custom" || 
    !selectedCharge?.plaidMatched;

  // Reset dynamic costs when switching to custom or when disabled
  React.useEffect(() => {
    if (isDynamicCostsDisabled && isDynamicCosts) {
      setIsDynamicCosts(false);
    }
  }, [isDynamicCostsDisabled, isDynamicCosts]);

  // Get the reason why dynamic costs is disabled
  const getDynamicCostsDisabledReason = () => {
    const reasons = [];
    if (!selectedCharge?.plaidMatched) {
      reasons.push("Plaid Required");
    }
    if (splitType === "custom") {
      reasons.push("Not Available for Custom");
    }
    return reasons.join(" & ") || null;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-lg mx-auto px-6 py-8">
        <StepIndicator current="split" />

        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={onBack}
            className="p-3 hover:bg-white rounded-xl transition-all hover:shadow-md"
          >
            <ArrowLeft className="w-6 h-6 text-gray-700" />
          </button>
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-900">Split Costs</h1>
            <p className="text-gray-600">
              Configure how to split with {selectedPeople.length}{" "}
              {selectedPeople.length !== 1 ? "people" : "person"}
            </p>
          </div>
        </div>

        <ChargeDisplay
          selectedCharge={selectedCharge}
          newChargeDetails={newChargeDetails}
        />

        {/* Selected People Preview */}
        <div className="mb-6 p-4 bg-white rounded-xl border border-gray-200">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">
            Splitting with:
          </h3>
          <div className="flex flex-wrap gap-2">
            {selectedPeople.map((person) => (
              <div
                key={person.id}
                className="flex items-center gap-2 bg-gray-100 px-3 py-2 rounded-lg"
              >
                <div
                  className={`w-6 h-6 rounded ${person.color} flex items-center justify-center text-white font-semibold text-xs`}
                >
                  {person.avatar}
                </div>
                <span className="text-sm font-medium text-gray-900">
                  {person.name}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Total Amount Input - Always visible at top */}
        <div className="mb-6">
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Total Amount to Split
          </label>
          <div className="relative">
            <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="number"
              value={editableTotalAmount}
              onChange={(e) =>
                setEditableTotalAmount(Number(e.target.value) || 0)
              }
              placeholder="Enter total amount"
              className="w-full pl-10 pr-12 py-3 border rounded-lg outline-none text-base bg-white focus:ring-2 border-gray-200 focus:ring-blue-600 focus:border-transparent"
            />
            <button
              onClick={() => setIsEditingTotal(!isEditingTotal)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 text-gray-400 hover:text-blue-600 transition-colors"
            >
              <Edit3 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Split Options */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Choose Split Method
          </h3>
          <div className="space-y-3">
            <div
              onClick={() => setSplitType("equalWithMe")}
              className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                splitType === "equalWithMe"
                  ? "border-blue-600 bg-blue-50"
                  : "border-gray-200 bg-white hover:border-gray-300"
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-blue-500 flex items-center justify-center">
                  <User className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900 text-sm">
                    Split Equally (Including Me)
                  </h4>
                  <p className="text-gray-600 text-xs">
                    Divide total among selected people including you
                  </p>
                </div>
              </div>
            </div>

            <div
              onClick={() => setSplitType("equal")}
              className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                splitType === "equal"
                  ? "border-blue-600 bg-blue-50"
                  : "border-gray-200 bg-white hover:border-gray-300"
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-green-500 flex items-center justify-center">
                  <Calculator className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900 text-sm">
                    Split Equally
                  </h4>
                  <p className="text-gray-600 text-xs">
                    Divide total among selected people
                  </p>
                </div>
              </div>
            </div>

            <div
              onClick={() => setSplitType("percentage")}
              className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                splitType === "percentage"
                  ? "border-blue-600 bg-blue-50"
                  : "border-gray-200 bg-white hover:border-gray-300"
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-indigo-500 flex items-center justify-center">
                  <Percent className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900 text-sm">
                    Percentage Split
                  </h4>
                  <p className="text-gray-600 text-xs">
                    Split by percentage of total
                  </p>
                </div>
              </div>
            </div>

            <div
              onClick={() => setSplitType("custom")}
              className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                splitType === "custom"
                  ? "border-blue-600 bg-blue-50"
                  : "border-gray-200 bg-white hover:border-gray-300"
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-purple-500 flex items-center justify-center">
                  <DollarSign className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900 text-sm">
                    Custom Amounts
                  </h4>
                  <p className="text-gray-600 text-xs">Set specific amounts</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Percentage Split Input */}
        {splitType === "percentage" && (
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Percentage Split
            </label>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {selectedPeople.map((person) => {
                const currentValue = effectivePercentageAmounts[person.id] || "";
                
                return (
                  <div
                    key={person.id}
                    className="flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-200"
                  >
                    <div
                      className={`w-8 h-8 rounded ${person.color} flex items-center justify-center text-white font-semibold text-sm`}
                    >
                      {person.avatar}
                    </div>
                    <span className="text-sm font-medium text-gray-900 flex-1">
                      {person.name}
                    </span>
                    <div className="relative w-20">
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={currentValue}
                        onChange={(e) => {
                          const newValue = e.target.value;
                          console.log("Direct input change:", person.id, newValue);
                          console.log("Current state before:", effectivePercentageAmounts);
                          effectiveUpdatePercentageAmount(person.id, newValue);
                          console.log("Function called with:", person.id, newValue);
                        }}
                        onInput={(e) => {
                          console.log("onInput triggered:", e.target.value);
                        }}
                        placeholder="0"
                        className="w-full pr-6 pl-2 py-2 border rounded text-sm outline-none bg-white focus:ring-2 border-gray-200 focus:ring-blue-600 focus:border-transparent"
                      />
                      <Percent className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 w-3 h-3" />
                    </div>
                    <div className="w-16 text-right text-xs text-gray-500">
                      ${((Number(editableTotalAmount) * Number(currentValue || 0)) / 100).toFixed(2)}
                    </div>
                  </div>
                );
              })}
            </div>
            
            {/* Total Percentage Indicator */}
            <div className="mt-3 p-3 bg-gray-50 rounded-lg">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-700">Total Percentage:</span>
                <span className={`text-sm font-bold ${
                  totalPercentage === 100 
                    ? "text-green-600" 
                    : totalPercentage > 100 
                    ? "text-red-600" 
                    : "text-orange-600"
                }`}>
                  {totalPercentage.toFixed(1)}%
                </span>
              </div>
              {totalPercentage !== 100 && (
                <div className="text-xs text-gray-500 mt-1">
                  {totalPercentage > 100
                    ? "Percentages exceed 100%"
                    : totalPercentage < 100
                    ? `${(100 - totalPercentage).toFixed(1)}% remaining`
                    : ""}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Custom Amount Input */}
        {splitType === "custom" && (
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Individual Amounts
            </label>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {selectedPeople.map((person) => (
                <div
                  key={person.id}
                  className="flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-200"
                >
                  <div
                    className={`w-8 h-8 rounded ${person.color} flex items-center justify-center text-white font-semibold text-sm`}
                  >
                    {person.avatar}
                  </div>
                  <span className="text-sm font-medium text-gray-900 flex-1">
                    {person.name}
                  </span>
                  <div className="relative w-24">
                    <DollarSign className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 w-3 h-3" />
                    <input
                      type="number"
                      value={customAmounts[person.id] || ""}
                      onChange={(e) =>
                        updateCustomAmount(person.id, e.target.value)
                      }
                      placeholder="0.00"
                      className={`w-full pl-6 pr-2 py-2 border rounded text-sm outline-none bg-white focus:ring-2 ${
                        Number(customAmounts[person.id] || 0) < 0
                          ? "border-red-500 focus:ring-red-600 focus:border-transparent"
                          : "border-gray-200 focus:ring-blue-600 focus:border-transparent"
                      }`}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Cost Tracking Section - Always visible */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <label className="text-lg font-semibold text-gray-900">
              Cost Tracking
            </label>
            <div className="relative dynamic-info-tooltip">
              <button
                onClick={() => setShowDynamicInfo(!showDynamicInfo)}
                className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
              >
                <Info className="w-4 h-4" />
              </button>
              {showDynamicInfo && (
                <div className="absolute bottom-full left-0 mb-2 w-64 bg-gray-900 text-white text-xs rounded-lg p-3 shadow-lg z-50">
                  <p className="mb-2">
                    <strong>Fixed Amount:</strong> Same amount for all payment cycles
                  </p>
                  <p className="mb-2">
                    <strong>Dynamic Costs:</strong> Track when amounts change between payment cycles
                  </p>
                  <p className="mb-2">
                    Dynamic costs are useful for utilities, subscriptions, or any recurring cost that varies each period.
                  </p>
                  <p>
                    Requires Plaid connection and not available with custom amounts.
                  </p>
                  <div className="absolute top-full left-2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-gray-900"></div>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-3">
            <div
              onClick={() => setIsDynamicCosts(false)}
              className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                !isDynamicCosts
                  ? "border-blue-600 bg-blue-50"
                  : "border-gray-200 bg-white hover:border-gray-300"
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-gray-500 flex items-center justify-center">
                  <BarChart3 className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900 text-sm">
                    Fixed Amount
                  </h4>
                  <p className="text-gray-600 text-xs">
                    Same amount each payment cycle
                  </p>
                </div>
              </div>
            </div>

            <div
              onClick={() => {
                if (!isDynamicCostsDisabled) {
                  setIsDynamicCosts(true);
                }
              }}
              className={`p-4 rounded-xl border-2 transition-all flex items-center gap-3 ${
                isDynamicCostsDisabled
                  ? "border-gray-200 bg-gray-50 cursor-not-allowed opacity-60"
                  : isDynamicCosts
                  ? "border-blue-600 bg-blue-50 cursor-pointer"
                  : "border-gray-200 bg-white hover:border-gray-300 cursor-pointer"
              }`}
            >
              <div
                className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                  isDynamicCostsDisabled ? "bg-gray-400" : "bg-orange-500"
                }`}
              >
                <TrendingUp className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <h4
                  className={`font-semibold text-sm ${
                    isDynamicCostsDisabled ? "text-gray-500" : "text-gray-900"
                  }`}
                >
                  Dynamic Costs
                  {isDynamicCostsDisabled && (
                    <span className="ml-2 text-xs bg-gray-200 text-gray-600 px-2 py-0.5 rounded-full">
                      {getDynamicCostsDisabledReason()}
                    </span>
                  )}
                </h4>
                <p
                  className={`text-xs ${
                    isDynamicCostsDisabled ? "text-gray-400" : "text-gray-600"
                  }`}
                >
                  {isDynamicCostsDisabled 
                    ? splitType === "custom" && !selectedCharge?.plaidMatched
                      ? "Requires Plaid connection and not available with custom amounts"
                      : splitType === "custom"
                      ? "Not available with custom amounts"
                      : "Requires Plaid connection to track cost changes"
                    : "Track cost changes for next payment cycle"
                  }
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Recurring Options */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Payment Schedule
          </h3>

          {/* Recurring Options Dropdown */}
          <div className="relative recurring-dropdown mb-4">
            <button
              onClick={() => setShowRecurringOptions(!showRecurringOptions)}
              className="w-full p-3 border border-gray-200 rounded-lg bg-white hover:bg-gray-50 transition-colors flex items-center justify-between"
            >
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-gray-500" />
                <span className="text-sm font-medium text-gray-700">
                  {getRecurringLabel()}
                </span>
              </div>
              <ChevronDown
                className={`w-4 h-4 text-gray-500 transition-transform ${
                  showRecurringOptions ? "rotate-180" : ""
                }`}
              />
            </button>

            {showRecurringOptions && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                <div className="p-2 space-y-1">
                  <button
                    onClick={() => {
                      setRecurringType("none");
                      setShowRecurringOptions(false);
                      setIsDynamicCosts(false);
                    }}
                    className={`w-full text-left px-3 py-2 rounded hover:bg-gray-100 text-sm ${
                      recurringType === "none"
                        ? "bg-blue-50 text-blue-700"
                        : "text-gray-700"
                    }`}
                  >
                    One-time
                  </button>
                  <button
                    onClick={() => {
                      setRecurringType("daily");
                      setShowRecurringOptions(false);
                    }}
                    className={`w-full text-left px-3 py-2 rounded hover:bg-gray-100 text-sm ${
                      recurringType === "daily"
                        ? "bg-blue-50 text-blue-700"
                        : "text-gray-700"
                    }`}
                  >
                    Daily
                  </button>
                  <button
                    onClick={() => {
                      setRecurringType("weekly");
                      setShowRecurringOptions(false);
                    }}
                    className={`w-full text-left px-3 py-2 rounded hover:bg-gray-100 text-sm ${
                      recurringType === "weekly"
                        ? "bg-blue-50 text-blue-700"
                        : "text-gray-700"
                    }`}
                  >
                    Weekly
                  </button>
                  <button
                    onClick={() => {
                      setRecurringType("monthly");
                      setShowRecurringOptions(false);
                    }}
                    className={`w-full text-left px-3 py-2 rounded hover:bg-gray-100 text-sm ${
                      recurringType === "monthly"
                        ? "bg-blue-50 text-blue-700"
                        : "text-gray-700"
                    }`}
                  >
                    Monthly
                  </button>
                  <button
                    onClick={() => {
                      setRecurringType("yearly");
                      setShowRecurringOptions(false);
                    }}
                    className={`w-full text-left px-3 py-2 rounded hover:bg-gray-100 text-sm ${
                      recurringType === "yearly"
                        ? "bg-blue-50 text-blue-700"
                        : "text-gray-700"
                    }`}
                  >
                    Yearly
                  </button>
                  <button
                    onClick={() => {
                      setRecurringType("custom");
                      setShowRecurringOptions(false);
                    }}
                    className={`w-full text-left px-3 py-2 rounded hover:bg-gray-100 text-sm ${
                      recurringType === "custom"
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

          {/* Custom Interval Input */}
          {recurringType === "custom" && (
            <div className="flex gap-2 mb-4">
              <div className="flex-1">
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Every
                </label>
                <input
                  type="number"
                  min="1"
                  value={customInterval}
                  onChange={(e) =>
                    setCustomInterval(parseInt(e.target.value) || 1)
                  }
                  className={`w-full p-2 border rounded text-sm outline-none focus:ring-2 ${
                    customInterval < 1
                      ? "border-red-500 focus:ring-red-600 focus:border-transparent"
                      : "border-gray-200 focus:ring-blue-600 focus:border-transparent"
                  }`}
                />
              </div>
              <div className="flex-1">
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Unit
                </label>
                <select
                  value={customUnit}
                  onChange={(e) => setCustomUnit(e.target.value)}
                  className="w-full p-2 border border-gray-200 rounded text-sm outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                >
                  <option value="days">Days</option>
                  <option value="weeks">Weeks</option>
                  <option value="months">Months</option>
                  <option value="years">Years</option>
                </select>
              </div>
            </div>
          )}

          {/* Start Timing Options - Only show for recurring payments */}
          {recurringType !== "none" && (
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">
                Start Date
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setStartTiming("now")}
                  className={`p-3 rounded-lg border-2 cursor-pointer transition-all flex items-center gap-2 ${
                    startTiming === "now"
                      ? "border-blue-600 bg-blue-50"
                      : "border-gray-200 bg-white hover:border-gray-300"
                  }`}
                >
                  <Play className="w-4 h-4 text-gray-500" />
                  <div className="text-left">
                    <div className="text-sm font-medium text-gray-900">
                      Start Now
                    </div>
                    <div className="text-xs text-gray-600">
                      Send first request immediately
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => setStartTiming("next")}
                  className={`p-3 rounded-lg border-2 cursor-pointer transition-all flex items-center gap-2 ${
                    startTiming === "next"
                      ? "border-blue-600 bg-blue-50"
                      : "border-gray-200 bg-white hover:border-gray-300"
                  }`}
                >
                  <SkipForward className="w-4 h-4 text-gray-500" />
                  <div className="text-left">
                    <div className="text-sm font-medium text-gray-900">
                      Next Request
                    </div>
                    <div className="text-xs text-gray-600">
                      {getNextPeriodLabel()}
                    </div>
                  </div>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Live Total Display */}
        <div className="mb-6 p-4 bg-blue-50 rounded-xl border border-blue-200">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-semibold text-gray-900">
              Total Split
              {isDynamicCosts && (
                <span className="ml-1 text-xs text-orange-600 font-medium">
                  (Dynamic)
                </span>
              )}
            </span>
            <span className="text-lg font-bold text-blue-600">
              ${totalSplit.toFixed(2)}
            </span>
          </div>

          {/* Show per person amount for equal splits */}
          {(splitType === "equal" || splitType === "equalWithMe") && (
            <div className="text-xs text-gray-600">
              {splitType === "equalWithMe"
                ? `${(
                    Number(editableTotalAmount) /
                    (selectedPeople.length + 1)
                  ).toFixed(2)} per person`
                : `${(totalSplit / selectedPeople.length).toFixed(
                    2
                  )} per person`}
            </div>
          )}

          {/* Show remainder for custom amounts and percentage */}
          {(splitType === "custom" || splitType === "percentage") && (
            <div className="mt-2 pt-2 border-t border-blue-200">
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-700">Total Expected:</span>
                <span className="text-sm font-semibold text-gray-900">
                  ${Number(totalAmountValue).toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between items-center mt-1">
                <span className="text-xs text-gray-700">
                  {splitType === "percentage" ? "Difference:" : "Remainder:"}
                </span>
                <span
                  className={`text-sm font-semibold ${
                    remainder === 0
                      ? "text-green-600"
                      : remainder > 0
                      ? "text-orange-600"
                      : "text-red-600"
                  }`}
                >
                  ${remainder.toFixed(2)}
                </span>
              </div>
              {remainder !== 0 && (
                <div className="text-xs text-gray-500 mt-1">
                  {remainder > 0
                    ? `Total split below charge cost`
                    : `Total split exceeds charge cost`}
                </div>
              )}
            </div>
          )}

          {/* Percentage validation message */}
          {splitType === "percentage" && totalPercentage !== 100 && (
            <div className="mt-2 pt-2 border-t border-blue-200">
              <div className={`flex items-center gap-2 text-xs ${
                totalPercentage > 100 ? "text-red-700" : "text-orange-700"
              }`}>
                <Info className="w-3 h-3" />
                <span>
                  {totalPercentage > 100
                    ? "Percentages total more than 100%"
                    : `${(100 - totalPercentage).toFixed(1)}% unallocated`}
                </span>
              </div>
            </div>
          )}

          {/* Dynamic costs notification */}
          {isDynamicCosts && (
            <div className="mt-2 pt-2 border-t border-blue-200">
              <div className="flex items-center gap-2 text-xs text-orange-700">
                <TrendingUp className="w-3 h-3" />
                <span>Amount may change in future cycles</span>
              </div>
            </div>
          )}
        </div>

        {/* Send Button */}
        <div className="pb-6">
          <button
            onClick={() => handleSendRequest(totalSplit)}
            disabled={totalSplit <= 0 || (splitType === "percentage" && totalPercentage > 100)}
            className="w-full text-white font-semibold py-4 rounded-xl shadow-lg transition-all flex items-center justify-center gap-3 disabled:bg-gray-300 disabled:cursor-not-allowed"
            style={{
              backgroundColor: (totalSplit > 0 && (splitType !== "percentage" || totalPercentage <= 100)) ? "#2563eb" : "#d1d5db",
            }}
          >
            <Send className="w-5 h-5" />
            {`Send Request${selectedPeople.length === 1 ? "" : `s`}`}
          </button>
          
          {/* Validation messages */}
          {splitType === "percentage" && totalPercentage > 100 && (
            <p className="text-xs text-red-600 mt-2 text-center">
              Total percentage cannot exceed 100%
            </p>
          )}
          {totalSplit <= 0 && (
            <p className="text-xs text-gray-500 mt-2 text-center">
              Enter amounts to send requests
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default SplitStep;