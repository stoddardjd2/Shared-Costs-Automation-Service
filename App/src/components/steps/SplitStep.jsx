import React, { useState, useRef } from "react";
import {
  ArrowLeft,
  User,
  X,
  Calculator,
  DollarSign,
  Send,
  ChevronDown,
  ChevronUp,
  Clock,
  Play,
  SkipForward,
  Edit3,
  TrendingUp,
  BarChart3,
  Info,
  Percent,
  Settings,
  Calendar,
  UserPlus,
  UserX,
  UserMinus,
  UserCheck,
} from "lucide-react";
import StepIndicator from "./StepIndicator";
import ChargeDisplay from "../costs/ChargeDisplay";
import { useData } from "../../contexts/DataContext";
import generateCostEntry from "../../utils/generateCostEntry";
import ConfirmButtonTray from "./ConfirmButtonTray";
import { createRequest, updateRequest } from "../../queries/requests";
import EditPeople from "../dashboard/EditPeople";
const SplitStep = ({
  setSelectedPeople,
  onBack,
  selectedCharge,
  selectedPeople,
  newChargeDetails,
  // Split state
  splitType,
  setSplitType,
  totalAmount,
  setTotalAmount,
  customAmounts,
  updateCustomAmount,
  calculateSplitAmounts,
  setPercentageAmounts,
  // Percentage state
  percentageAmounts,
  setSelectedCharge,
  setIsAddingRequest,
  // Edit mode props
  isEditMode = false,
}) => {
  // Context to update costs
  const { updateCost, addCost, participants } = useData();
  // Advanced options visibility
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);

  const [isEditingPeople, setIsEditingPeople] = useState(false);

  const [isSendingRequest, setIsSendingRequest] = useState(false);

  // Local state for recurring options - use existing values in edit mode
  const [showRecurringOptions, setShowRecurringOptions] = useState(false);
  const [recurringType, setRecurringType] = useState(
    selectedCharge.frequency.toLowerCase()
  );
  const [originalFrequency, setOriginalFrequency] = useState(
    selectedCharge.frequency.toLowerCase()
  );

  const [customInterval, setCustomInterval] = useState(
    isEditMode ? selectedCharge?.customInterval || 1 : 1
  );
  const [customUnit, setCustomUnit] = useState(
    isEditMode ? selectedCharge?.customUnit || "days" : "days"
  );

  // State for start timing - default based on mode
  const [startTiming, setStartTiming] = useState(isEditMode ? "next" : "now");

  const [showUnitOptions, setShowUnitOptions] = useState(false);

  // State for editable total amounts
  const [editableTotalAmount, setEditableTotalAmount] = useState(
    Number(
      (Number(totalAmount) || Number(selectedCharge?.lastAmount) || 0).toFixed(
        2
      )
    )
  );

  // Add state to preserve the last known good amount
  const [lastKnownGoodAmount, setLastKnownGoodAmount] = useState(
    Number(
      (Number(totalAmount) || Number(selectedCharge?.lastAmount) || 0).toFixed(
        2
      )
    )
  );

  // Check if dynamic costs should be disabled
  const isDynamicCostsDisabled =
    splitType === "custom" ||
    !selectedCharge?.plaidMatch ||
    recurringType === "none";

  // State for dynamic costs tracking - use previous setting in edit mode, otherwise default based on plaidMatch
  const [isDynamic, setIsDynamic] = useState(
    isEditMode
      ? selectedCharge?.isDynamic || false
      : (selectedCharge?.plaidMatch && true) || false
  );

  const [showDynamicInfo, setShowDynamicInfo] = useState(false);
  const [isHoveringDynamicInfo, setIsHoveringDynamicInfo] = useState(false);

  // Track previous split type to detect changes from custom
  const prevSplitTypeRef = useRef(splitType);

  // Initialize last known good amount
  React.useEffect(() => {
    const initialAmount = Number(
      (Number(totalAmount) || Number(selectedCharge?.lastAmount) || 0).toFixed(
        2
      )
    );
    if (initialAmount > 0) {
      setLastKnownGoodAmount(initialAmount);
    }
  }, [selectedCharge?.lastAmount, totalAmount]);

  // Only disable dynamic costs if conditions don't allow it, but don't auto-enable
  React.useEffect(() => {
    // If dynamic costs become disabled (e.g., switching to custom split or one-time), turn it off
    if (isDynamicCostsDisabled && isDynamic) {
      setIsDynamic(false);
    }
    // Don't auto-enable when conditions allow - let user choose
  }, [isDynamicCostsDisabled, isDynamic]);

  // Sync editableTotalAmount with totalAmount prop
  React.useEffect(() => {
    if (totalAmount !== undefined && totalAmount !== editableTotalAmount) {
      setEditableTotalAmount(Number(Number(totalAmount).toFixed(2)));
    }
  }, [totalAmount]);

  // Update parent totalAmount when editableTotalAmount changes
  React.useEffect(() => {
    if (setTotalAmount && editableTotalAmount !== totalAmount) {
      setTotalAmount(Number(editableTotalAmount.toFixed(2)));
    }
  }, [editableTotalAmount, setTotalAmount, totalAmount]);

  // Close dropdowns when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        showRecurringOptions &&
        !event.target.closest(".recurring-dropdown")
      ) {
        setShowRecurringOptions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showRecurringOptions]);

  // Auto-hide tooltip when not hovering
  React.useEffect(() => {
    if (!isHoveringDynamicInfo) {
      const timer = setTimeout(() => {
        setShowDynamicInfo(false);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [isHoveringDynamicInfo]);

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
      // default:
      //   return "Now";
    }
  };

  function getCostEntry() {
    // Calculate the actual amount to use based on split type
    // switch (splitType) {
    //   case "custom":
    //     return totalSplit;
    //   case "percentage":
    //     return totalSplit;
    //   case "equalWithMe":
    //     return totalSplit;
    //   default:
    //     editableTotalAmount;
    // }

    const actualAmount = totalSplit;

    // Number(
    //   (splitType === "custom" || splitType === "percentage"
    //     ? totalSplit
    //     : editableTotalAmount
    //   ).toFixed(2)
    // );
    // Original flow for new costs
    const costEntry = generateCostEntry({
      selectedCharge,
      newChargeDetails,
      selectedPeople,
      splitType,
      ...(splitType === "custom" && { customAmounts }),
      ...(splitType === "percentage" && {
        percentageAmounts: percentageAmounts,
      }),
      recurringType,
      customInterval,
      customUnit,
      startTiming,
      totalSplit,
      // isDynamic,
      // dynamicCostReason,
      // Pass the actual calculated amount
      // totalAmount: actualAmount,
      editableTotalAmount,
    });

    // Override cost entry properties with current state values to ensure accuracy
    costEntry.splitType = splitType;
    costEntry.amount = actualAmount;
    // costEntry.totalAmount = actualAmount;
    costEntry.frequency = recurringType === "none" ? null : recurringType;
    costEntry.customInterval =
      recurringType === "custom" ? customInterval : null;
    costEntry.customUnit = recurringType === "custom" ? customUnit : null;
    costEntry.startTiming = startTiming;
    costEntry.isDynamic = isDynamic;

    // save id to entry for edit mode, used to identify which cost to update in DB
    if (isEditMode) {
      costEntry._id = selectedCharge._id;
    }

    // costEntry.dynamicCostReason = dynamicCostReason;
    // Only include split method specific data
    if (splitType === "custom") {
      costEntry.customAmounts = { ...customAmounts };
    } else {
      costEntry.customAmounts = {};
    }

    if (splitType === "percentage") {
      costEntry.percentageAmounts = { ...percentageAmounts };
    } else {
      costEntry.percentageAmounts = {};
    }

    // Ensure participants array matches selectedPeople with all current values
    costEntry.participants = selectedPeople.map((person) => {
      const baseParticipant = {
        ...person,
      };

      // Calculate individual amount based on split type
      let individualAmount;
      switch (splitType) {
        case "equalWithMe":
          individualAmount = actualAmount / (selectedPeople.length + 1);
          break;
        case "equal":
          individualAmount = actualAmount / selectedPeople.length;
          break;
        case "percentage":
          individualAmount =
            actualAmount * (Number(percentageAmounts[person._id] || 0) / 100);
          baseParticipant.percentage = percentageAmounts[person._id];
          break;
        case "custom":
          individualAmount = Number(customAmounts[person._id] || 0);
          baseParticipant.customAmount = customAmounts[person._id];
          break;
        default:
          individualAmount = 0;
      }

      baseParticipant.amount = Number(individualAmount.toFixed(2));
      return baseParticipant;
    });
    return costEntry;
  }

  const handleSendRequest = () => {
    const costEntry = getCostEntry();
    setIsSendingRequest(true);
    if (isEditMode) {
      const handleUpdateRequest = async () => {
        const UpdatedCostFromDB = await updateRequest(costEntry._id, costEntry);
        if (UpdatedCostFromDB) {
          updateCost(UpdatedCostFromDB);
          onBack();
          setIsSendingRequest(false);
        }
      };
      handleUpdateRequest(); // Call the function
    } else {
      // query db with new request:
      const handleCreateRequest = async () => {
        const newCostFromDB = await createRequest(costEntry);
        if (newCostFromDB) {
          addCost(newCostFromDB);
          setIsAddingRequest(false);
          setIsSendingRequest(false);
        }
      };
      handleCreateRequest(); // Call the function
    }
  };

  // Calculate split amounts based on split type
  const calculateActualSplitAmounts = () => {
    if (splitType === "percentage") {
      const percentageSplit = {};
      selectedPeople.forEach((person) => {
        console.log("percentageAmounts",percentageAmounts)
        const percentage = Number(percentageAmounts[person._id] || 0);
        percentageSplit[person._id] = Number(
          ((Number(editableTotalAmount) * percentage) / 100).toFixed(2)
        );
      });
      return percentageSplit;
    }
    return calculateSplitAmounts(selectedPeople);
  };

  // Calculate split amounts
  const splitAmounts = calculateActualSplitAmounts();
  const entries = Object.entries(splitAmounts);
  const totalAmountValue =
    editableTotalAmount || selectedCharge?.lastAmount || 0;

  // Calculate the sum based on split type
  const totalSplit = React.useMemo(() => {
    let result;
    switch (splitType) {
      case "equalWithMe":
        result =
          (Number(editableTotalAmount) / (selectedPeople.length + 1)) *
          selectedPeople.length;
        break;

      case "equal":
        result = Number(editableTotalAmount);
        break;

      case "percentage":
        result = entries
          .filter(([key]) => !key.toLowerCase().includes("total"))
          .reduce((sum, [, amount]) => sum + Number(amount || 0), 0);
        break;

      case "custom":
        result = entries
          .filter(([key]) => !key.toLowerCase().includes("total"))
          .reduce((sum, [, amount]) => sum + Number(amount || 0), 0);
        break;

      default:
        result = Number(editableTotalAmount);
    }
    return Number(result.toFixed(2));
  }, [splitType, editableTotalAmount, selectedPeople.length, entries]);

  // Calculate the remainder
  const remainder = Number(totalAmountValue) - totalSplit;

  // Calculate total percentage for percentage split
  const totalPercentage =
    splitType === "percentage"
      ? selectedPeople.reduce(
          (sum, person) => sum + Number(percentageAmounts[person._id] || 0),
          0
        )
      : 0;

  // Auto-enable dynamic costs when switching away from custom split method (when appropriate)
  React.useEffect(() => {
    const prevSplitType = prevSplitTypeRef.current;

    // Check if we're changing FROM custom TO another split type
    if (prevSplitType === "custom" && splitType !== "custom") {
      // Auto-enable dynamic costs if:
      // 1. Not in edit mode (new cost) and plaidMatch is available, OR
      // 2. In edit mode and the original charge had dynamic costs enabled
      const shouldAutoEnable = !isEditMode
        ? selectedCharge?.plaidMatch || false // New cost: enable if plaid available
        : selectedCharge?.isDynamic || false; // Edit mode: enable if original was dynamic

      if (shouldAutoEnable && !isDynamicCostsDisabled) {
        setIsDynamic(true);
      }
    }

    // Update the ref for next comparison
    prevSplitTypeRef.current = splitType;
  }, [
    splitType,
    isDynamicCostsDisabled,
    isEditMode,
    selectedCharge?.plaidMatch,
    selectedCharge?.isDynamic,
  ]);

  // Update last known good amount when we have a valid amount
  React.useEffect(() => {
    if (editableTotalAmount > 0 && splitType !== "custom") {
      setLastKnownGoodAmount(editableTotalAmount);
    }
  }, [editableTotalAmount, splitType]);

  // Handle split type changes and preserve/restore amounts
  React.useEffect(() => {
    const prevSplitType = prevSplitTypeRef.current;

    // When switching FROM custom to another split type
    if (prevSplitType === "custom" && splitType !== "custom") {
      // Check if custom amounts sum to 0 or are empty
      const customTotal = customAmounts
        ? Object.values(customAmounts).reduce(
            (sum, amount) => sum + (Number(amount) || 0),
            0
          )
        : 0;

      // If custom total is 0, restore the last known good amount
      if (customTotal === 0 && lastKnownGoodAmount > 0) {
        setEditableTotalAmount(lastKnownGoodAmount);
        if (setTotalAmount) {
          setTotalAmount(lastKnownGoodAmount);
        }
      }
    }

    // Update the ref for next comparison
    prevSplitTypeRef.current = splitType;
  }, [splitType, customAmounts, lastKnownGoodAmount, setTotalAmount]);

  // Recalculate total amount when split method changes
  React.useEffect(() => {
    let newTotalAmount = editableTotalAmount;

    // For custom split, calculate total from individual amounts
    if (splitType === "custom") {
      if (customAmounts && Object.keys(customAmounts).length > 0) {
        const customTotal = Object.values(customAmounts).reduce(
          (sum, amount) => sum + (Number(amount) || 0),
          0
        );
        if (customTotal > 0) {
          newTotalAmount = Number(customTotal.toFixed(2));
        }
      }
    }

    // For percentage split, ensure we have a base amount to work with
    else if (splitType === "percentage") {
      if (!editableTotalAmount || editableTotalAmount === 0) {
        newTotalAmount = Number(
          (
            selectedCharge?.lastAmount ||
            totalAmount ||
            lastKnownGoodAmount ||
            0
          ).toFixed(2)
        );
      }
    }

    // For equal splits, use the charge amount or current total
    else if (splitType === "equal" || splitType === "equalWithMe") {
      if (!editableTotalAmount || editableTotalAmount === 0) {
        newTotalAmount = Number(
          (
            selectedCharge?.lastAmount ||
            totalAmount ||
            lastKnownGoodAmount ||
            0
          ).toFixed(2)
        );
      }
    }

    // Update if amount changed and is valid
    if (newTotalAmount !== editableTotalAmount && newTotalAmount >= 0) {
      setEditableTotalAmount(newTotalAmount);
      if (setTotalAmount) {
        setTotalAmount(newTotalAmount);
      }
    }
  }, [
    splitType,
    customAmounts,
    selectedCharge?.lastAmount,
    totalAmount,
    lastKnownGoodAmount,
  ]);

  // Update total when custom amounts change (but only when in custom mode)
  React.useEffect(() => {
    if (splitType === "custom" && customAmounts) {
      const customTotal = Object.values(customAmounts).reduce(
        (sum, amount) => sum + (Number(amount) || 0),
        0
      );
      const roundedTotal = Number(customTotal.toFixed(2));
      if (roundedTotal !== editableTotalAmount) {
        setEditableTotalAmount(roundedTotal);
        if (setTotalAmount) {
          setTotalAmount(roundedTotal);
        }
      }
    }
  }, [customAmounts, splitType]);

  // Update total calculation when percentage amounts change
  React.useEffect(() => {
    if (splitType === "percentage" && percentageAmounts) {
      // The total stays the same for percentage, but we might need to trigger recalculation
      const calculatedTotal = selectedPeople.reduce((sum, person) => {
        const percentage = Number(percentageAmounts[person._id] || 0);
        return sum + (Number(editableTotalAmount) * percentage) / 100;
      }, 0);

      // For percentage splits, we typically keep the editableTotalAmount as the base
      // The calculated amounts are shown in the UI but don't change the total
    }
  }, [percentageAmounts, splitType, selectedPeople, editableTotalAmount]);

  // Handle changes to selectedCharge (e.g., when a new charge is selected)
  React.useEffect(() => {
    if (selectedCharge?.lastAmount) {
      const chargeAmount = Number(Number(selectedCharge.lastAmount).toFixed(2));
      setEditableTotalAmount(chargeAmount);
      setLastKnownGoodAmount(chargeAmount);
      if (setTotalAmount) {
        setTotalAmount(chargeAmount);
      }
    }
  }, [selectedCharge?._id, selectedCharge?.lastAmount, setTotalAmount]);

  return (
    <div className={"relative"}>
      {/* Main content container with bottom padding to prevent content being hidden behind ConfirmButtonTray */}
      <div className={`max-w-lg mx-auto px-6 py-0 pb-48 `}>
        {/* Hide step indicator and back button in edit mode since modal has its own header */}
        {!isEditMode && <StepIndicator current="split" />}

        {
          <div
            className={`flex items-center gap-4 mb-6  ${isEditMode && "mt-8"}`}
          >
            <button
              onClick={onBack}
              className="p-3 hover:bg-white rounded-xl transition-all hover:shadow-md"
            >
              <ArrowLeft className="w-6 h-6 text-gray-700" />
            </button>
            <div className="flex-1">
              <h1 className={`text-3xl font-bold text-gray-900`}>
                {isEditMode ? `Edit Requests` : "Split Costs"}
              </h1>
              <p className="text-gray-600">
                {isEditMode
                  ? `Configure future requests for ${selectedPeople.length} ${
                      selectedPeople.length !== 1 ? "people" : "person"
                    }`
                  : `Configure how to split with ${selectedPeople.length} ${
                      selectedPeople.length !== 1 ? "people" : "person"
                    }`}
              </p>
            </div>
          </div>
        }

        {/* Charge Display - Always visible and prominent */}
        <ChargeDisplay
          selectedCharge={selectedCharge}
          newChargeDetails={newChargeDetails}
          overrideAmount={totalSplit}
          paymentSchedule={getRecurringLabel()}
          recurringType={recurringType}
          customInterval={customInterval}
          customUnit={customUnit}
          originalFrequency={originalFrequency}
        />
        {/* {isEditMode && (
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Edit People
            </h3>
            <button
              onClick={() => {
                setIsEditingPeople((prev) => !prev);
              }}
              className="p-4 rounded-xl w-full border-2 cursor-pointer transition-all border-gray-200 bg-white hover:border-gray-300"
            >
              <div className="flex flex-col items-center text-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-orange-400 flex items-center justify-center">
                  <UserPlus size={16} color={"white"} />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 text-sm">
                    Edit People
                  </h4>
                  <p className="text-gray-600 text-xs">Add or Remove People</p>
                </div>
              </div>
            </button>
          </div>
        )} */}
        {/* for editing people in edit mode: */}
        {/* {isEditMode && isEditingPeople && (
          <EditPeople
            setIsEditingPeople={setIsEditingPeople}
            setSelectedCharge={setSelectedCharge}
            selectedCharge={selectedCharge}
            setSelectedPeople={setSelectedPeople}
            selectedPeople={selectedPeople}
          />
        )} */}

        {/* Split Method Selection - Always visible */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Split Method
          </h3>
          <div className="grid grid-cols-2 gap-3">
            <div
              onClick={() => setSplitType("equalWithMe")}
              className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                splitType === "equalWithMe"
                  ? "border-blue-600 bg-blue-50"
                  : "border-gray-200 bg-white hover:border-gray-300"
              }`}
            >
              <div className="flex flex-col items-center text-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-blue-500 flex items-center justify-center">
                  <User className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 text-sm">
                    Equal - Me
                  </h4>
                  <p className="text-gray-600 text-xs">Include yourself</p>
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
              <div className="flex flex-col items-center text-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-green-500 flex items-center justify-center">
                  <Calculator className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 text-sm">
                    Equal Split
                  </h4>
                  <p className="text-gray-600 text-xs">Divide equally</p>
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
              <div className="flex flex-col items-center text-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-indigo-500 flex items-center justify-center">
                  <Percent className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 text-sm">
                    Percentage
                  </h4>
                  <p className="text-gray-600 text-xs">By percentage</p>
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
              <div className="flex flex-col items-center text-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-purple-500 flex items-center justify-center">
                  <DollarSign className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 text-sm">
                    Custom
                  </h4>
                  <p className="text-gray-600 text-xs">Set amounts</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Percentage Split Input - Visible when percentage selected */}
        {splitType === "percentage" && (
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Percentage Split
            </label>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {selectedPeople.map((person) => {
                const user = participants.find((u) => u._id === person._id);

                const currentValue = percentageAmounts[user._id] || "";
                return (
                  <div
                    key={person._id}
                    className="flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-200"
                  >
                    <div
                      className={`w-8 h-8 rounded ${user.color} flex items-center justify-center text-white font-semibold text-sm`}
                    >
                      {user.avatar}
                    </div>
                    <span className="text-sm font-medium text-gray-900 flex-1">
                      {user.name}
                    </span>
                    <div className="relative w-20">
                      <input
                        type="number"
                        min="0"
                        max="100"
                        step="0.1"
                        value={currentValue}
                        onChange={(e) => {
                          setPercentageAmounts((prev) => ({
                            ...prev,
                            [user._id]: e.target.value,
                          }));
                        }}
                        placeholder="0"
                        className="w-full pr-6 pl-2 py-2 border rounded text-sm outline-none bg-white focus:ring-2 border-gray-200 focus:ring-blue-600 focus:border-transparent"
                      />
                      <Percent className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 w-3 h-3" />
                    </div>
                    <div className="w-16 text-right text-xs text-gray-500">
                      $
                      {(
                        (Number(editableTotalAmount) *
                          Number(currentValue || 0)) /
                        100
                      ).toFixed(2)}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Total Percentage Indicator */}
            <div className="mt-3 p-3 bg-gray-50 rounded-lg">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-700">
                  Total Percentage:
                </span>
                <span
                  className={`text-sm font-bold ${
                    totalPercentage === 100
                      ? "text-green-600"
                      : totalPercentage > 100
                      ? "text-red-600"
                      : "text-orange-600"
                  }`}
                >
                  {Number(totalPercentage).toFixed(1)}%
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Custom Amount Input - Visible when custom selected */}
        {splitType === "custom" && (
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Individual Amounts
            </label>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {selectedPeople.map((person) => {
                const user = participants.find((u) => u._id === person._id);
                return (
                  <div
                    key={user._id}
                    className="flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-200"
                  >
                    <div
                      className={`w-8 h-8 rounded ${user.color} flex items-center justify-center text-white font-semibold text-sm`}
                    >
                      {user.avatar}
                    </div>
                    <span className="text-sm font-medium text-gray-900 flex-1">
                      {user.name}
                    </span>
                    <div className="relative w-24">
                      <DollarSign className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 w-3 h-3" />

                      <input
                        type="number"
                        step="0.01"
                        value={customAmounts[user._id] || ""}
                        onChange={(e) =>
                          updateCustomAmount(user._id, e.target.value)
                        }
                        placeholder="0.00"
                        className="w-full pl-6 pr-2 py-2 border rounded text-sm outline-none bg-white focus:ring-2 border-gray-200 focus:ring-blue-600 focus:border-transparent"
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Start Timing Options - Only show for recurring payments */}
        {recurringType !== "none" && (
          <div className="space-y-2 mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Start Time
            </h3>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => !isEditMode && setStartTiming("now")}
                className={`p-3 rounded-lg border-2 transition-all flex items-center gap-2 ${
                  isEditMode
                    ? "border-gray-200 bg-gray-50 cursor-not-allowed opacity-60"
                    : startTiming === "now"
                    ? "border-blue-600 bg-blue-50 cursor-pointer"
                    : "border-gray-200 bg-white hover:border-gray-300 cursor-pointer"
                }`}
              >
                <Play className="w-4 h-4 text-gray-500" />
                <div className="text-left">
                  <div
                    className={`text-sm font-medium ${
                      isEditMode ? "text-gray-500" : "text-gray-900"
                    }`}
                  >
                    Start Now
                  </div>
                  <div
                    className={`text-xs ${
                      isEditMode ? "text-gray-400" : "text-gray-600"
                    }`}
                  >
                    {isEditMode ? "Not Available" : "Send first request"}
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
                    {isEditMode && selectedCharge?.nextDue
                      ? new Date(selectedCharge.nextDue).toLocaleDateString()
                      : getNextPeriodLabel()}
                  </div>
                </div>
              </button>
            </div>
          </div>
        )}

        {/* Advanced Options Toggle */}
        <div className="mb-6">
          <button
            onClick={() => setShowAdvancedOptions(!showAdvancedOptions)}
            className="w-full p-4 bg-gray-50 hover:bg-gray-100 rounded-xl border border-gray-200 transition-all flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gray-600 flex items-center justify-center">
                <Settings className="w-4 h-4 text-white" />
              </div>
              <div className="text-left">
                <h4 className="font-semibold text-gray-900 text-sm">
                  Advanced Options
                </h4>
                <p className="text-gray-600 text-xs">
                  Payment schedule, cost tracking & more
                </p>
              </div>
            </div>
            {showAdvancedOptions ? (
              <ChevronUp className="w-5 h-5 text-gray-500" />
            ) : (
              <ChevronDown className="w-5 h-5 text-gray-500" />
            )}
          </button>
        </div>

        {/* Advanced Options Content */}
        {showAdvancedOptions && (
          <div className="space-y-6 mb-6">
            {/* Total Amount Input - Always visible */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Total Amount to Split
              </h3>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="number"
                  step="0.01"
                  value={editableTotalAmount}
                  onChange={(e) => {
                    const newAmount =
                      Number(Number(e.target.value).toFixed(2)) || 0;
                    setEditableTotalAmount(newAmount);
                    // Update last known good amount if it's a valid positive amount
                    if (newAmount > 0) {
                      setLastKnownGoodAmount(newAmount);
                    }
                    // Also update parent totalAmount if the setter exists
                    if (setTotalAmount) {
                      setTotalAmount(newAmount);
                    }
                  }}
                  placeholder="Enter total amount"
                  className="w-full pl-10 pr-4 py-3 border rounded-lg outline-none text-base bg-white focus:ring-2 border-gray-200 focus:ring-blue-600 focus:border-transparent"
                />
              </div>
            </div>

            {/* Payment Schedule */}
            <div>
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
                  <div className="absolute bottom-full left-0 right-0 mb-2 bg-white border border-gray-200 rounded-lg shadow-lg z-[20]">
                    <div className="p-2 space-y-1">
                      <button
                        onClick={() => {
                          setRecurringType("one-time");
                          setShowRecurringOptions(false);
                          setIsDynamic(false);
                        }}
                        className={`w-full text-left px-3 py-2 rounded hover:bg-gray-100 text-sm ${
                          recurringType === "one-time"
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
            </div>

            {/* Custom Interval Input */}
            {recurringType === "custom" && (
              <div className="mb-4">
                <div className="flex gap-2">
                  {/* Every (Number) Input */}
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
                      className="w-full p-2 border border-gray-200 rounded text-sm outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                    />
                  </div>

                  {/* Unit Dropdown */}
                  <div className="flex-1 relative">
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      Unit
                    </label>
                    <button
                      onClick={() => setShowUnitOptions(!showUnitOptions)}
                      className="w-full p-2 border border-gray-200 rounded text-sm outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent bg-white text-left flex justify-between items-center hover:bg-gray-50"
                    >
                      <span className="capitalize">{customUnit}</span>
                      <svg
                        className="w-4 h-4 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    </button>

                    {showUnitOptions && (
                      <div className="absolute bottom-full left-0 right-0 mb-2 bg-white border border-gray-200 rounded-lg shadow-lg z-[20]">
                        <div className="p-2 space-y-1">
                          {[
                            { value: "days", label: "Days" },
                            { value: "weeks", label: "Weeks" },
                            { value: "months", label: "Months" },
                            { value: "years", label: "Years" },
                          ].map((unit) => (
                            <button
                              key={unit.value}
                              onClick={() => {
                                setCustomUnit(unit.value);
                                setShowUnitOptions(false);
                              }}
                              className={`w-full text-left px-3 py-2 rounded hover:bg-gray-100 text-sm ${
                                customUnit === unit.value
                                  ? "bg-blue-50 text-blue-700"
                                  : "text-gray-700"
                              }`}
                            >
                              {unit.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Live Total Display - Always visible and sticky above send button */}

        {/* Send Button - Always visible and sticky */}
        <ConfirmButtonTray
          isSendingRequest={isSendingRequest}
          buttonContent={
            isEditMode ? (
              <>
                <Edit3 className="w-5 h-5" />
                Update Future Requests
              </>
            ) : startTiming === "now" ? (
              <>
                <Send className="w-5 h-5" />
                Send Request
              </>
            ) : (
              <>
                <Calendar className="w-5 h-5" />
                Schedule Request
              </>
            )
          }
          selectedPeople={selectedPeople}
          onConfirm={() => handleSendRequest(totalSplit)}
          isDynamic={isDynamic}
          amountPerPerson={
            splitType === "equalWithMe"
              ? Number(
                  (
                    Number(editableTotalAmount) /
                    (selectedPeople.length + 1)
                  ).toFixed(2)
                )
              : splitType === "equal"
              ? Number(
                  (Number(editableTotalAmount) / selectedPeople.length).toFixed(
                    2
                  )
                )
              : 0 // For custom/percentage, we'll show total instead
          }
          totalAmount={Number(
            (splitType === "custom" || splitType === "percentage"
              ? totalSplit
              : editableTotalAmount
            ).toFixed(2)
          )}
          billingFrequency={getRecurringLabel()}
          splitType={splitType}
        />
      </div>
    </div>
  );
};

export default SplitStep;
