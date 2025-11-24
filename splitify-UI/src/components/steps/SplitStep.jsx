import React, { useState, useRef, useEffect } from "react";
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
  Users,
  UserMinus,
  UserCheck,
  Split,
  CalendarDays,
  CalendarClock,
  BellPlus,
  BellDot,
  Bell,
  TextIcon,
  Text,
  SendIcon,
  BadgeCheck,
  BadgeCheckIcon,
  CalendarRange,
  Repeat,
} from "lucide-react";
import StepIndicator from "./StepIndicator";
import ChargeDisplay from "../costs/ChargeDisplay";
import { useData } from "../../contexts/DataContext";
import generateCostEntry from "../../utils/generateCostEntry";
import ConfirmButtonTray from "./ConfirmButtonTray";
import { createRequest, updateRequest } from "../../queries/requests";
import EditPeople from "../dashboard/EditPeople";
import DatePicker from "./SplitStep-builders/DatePicker";
import PlaidConnect from "../plaid/PlaidConnect";
import { Navigate } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import RequestSentScreen from "../dashboard/RequestSentScreen";
import SplitifyPremiumModal from "../premium/SplitifyPremiumModal";
import { gaEvent } from "../../googleAnalytics/googleAnalyticsHelpers";
import SelectedPeopleDisplay from "./SelectedPeopleDisplay";
import DropdownOptionSection from "./SplitStep-builders/CollapsibleOptionsSection";

const SplitStep = ({
  setSelectedPeople,
  onBack,
  selectedCharge,
  selectedPeople,
  newChargeDetails,
  // Split state
  // splitType,
  // setSplitType,
  setView,
  // totalAmount,
  // setTotalAmount,
  customAmounts,
  updateCustomAmount,
  calculateSplitAmounts,
  setPercentageAmounts,
  // Percentage state
  percentageAmounts,
  setSelectedCharge,
  // Edit mode props
  isEditMode = false,
  disableDynamicCosts = false,
  setSelectedCost,
  setNewChargeDetails,
}) => {
  const navigate = useNavigate();
  if (!selectedPeople || selectedPeople.length == 0) {
    return <Navigate to="/dashboard" replace />;
  }

  // Context to update costs
  const { updateCost, addCost, participants, userData } = useData();
  // Helper function to get amount with fallback logic
  const [splitType, setSplitType] = useState(
    selectedCharge?.splitType ? selectedCharge.splitType : "equalWithMe"
  );

  // Advanced options visibility
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState(
    selectedCharge?.selectedTransaction
  );
  const [showPremiumPrompt, setShowPremiumPrompt] = useState(false);
  const [isEditingPeople, setIsEditingPeople] = useState(false);

  const [isSendingRequest, setIsSendingRequest] = useState(false);
  const [allowMarkAsPaidForEveryone, setAllowMarkAsPaidForEveryone] =
    useState(false);
  const [showMarkAsPaidInfo, setShowMarkAsPaidInfo] = useState(false);
  const [isHoveringMarkAsPaidInfo, setIsHoveringMarkAsPaidInfo] =
    useState(false);
  // Local state for recurring options - use existing values in edit mode
  const [showRecurringOptions, setShowRecurringOptions] = useState(false);
  const [recurringType, setRecurringType] = useState(
    selectedCharge?.frequency?.toLowerCase() || null
  );
  const [originalFrequency, setOriginalFrequency] = useState(
    selectedCharge?.frequency?.toLowerCase()
  );

  const [chargeName, setChargeName] = useState(
    selectedCharge?.name ? selectedCharge?.name : ""
  );
  const [customInterval, setCustomInterval] = useState(
    isEditMode ? selectedCharge?.customInterval || 1 : 1
  );
  const [customUnit, setCustomUnit] = useState(
    isEditMode ? selectedCharge?.customUnit || "days" : "days"
  );

  // State for start timing - default based on mode
  const [startTiming, setStartTiming] = useState("now");

  const [showUnitOptions, setShowUnitOptions] = useState(false);

  const [submittedRequest, setSubmittedRequest] = useState({});

  const [dueInDays, setDueInDays] = useState(1);

  const [isPlaidCharge, setIsPlaidCharge] = useState(
    selectedCharge?.isPlaidCharge || false
  );

  // State for editable total amounts
  // const initEditableTotalAmount = Number(
  //   (Number(totalAmount) || Number(selectedCharge?.lastAmount) || "").toFixed(2)
  // );
  const [editableTotalAmount, setEditableTotalAmount] = useState(
    selectedCharge?.totalAmount || 0
  );

  // Add state to preserve the last known good amount
  const [lastKnownGoodAmount, setLastKnownGoodAmount] = useState(
    Number(
      (
        Number(selectedCharge?.totalAmount) ||
        Number(selectedCharge?.lastAmount) ||
        0
      ).toFixed(2)
    )
  );

  // Check if dynamic costs should be disabled
  const isDynamicCostsDisabled =
    splitType === "custom" ||
    !isPlaidCharge ||
    recurringType === "one-time" ||
    disableDynamicCosts ||
    userData.plan == "free";

  const isMarkAsPaidEveryoneDisabled = userData.plan == "free";

  // const isPaymentNotificationsInfoDisabled = userData.plan == "free";
  const isPaymentNotificationsInfoDisabled = false;

  // State for dynamic costs tracking - use previous setting in edit mode, otherwise default based on plaidMatch
  const [isDynamic, setIsDynamic] = useState(
    selectedCharge?.isDynamic || false
  );
  // const [isDynamic, setIsDynamic] = useState(false);
  const [showDynamicInfo, setShowDynamicInfo] = useState(false);
  const [isHoveringDynamicInfo, setIsHoveringDynamicInfo] = useState(false);

  const [reminderFrequency, setReminderFrequency] = useState(
    userData.reminderPreference
  );

  const [showPaymentNotificationsInfo, setShowPaymentNotificationsInfo] =
    useState(false);
  const [
    isHoveringPaymentNotificationsInfo,
    setIsHoveringPaymentNotificationsInfo,
  ] = useState(false);
  const [allowPaymentNotificationsInfo, setAllowPaymentNotificationsInfo] =
    useState(true);

  const [showRequestSentScreen, setShowRequestSentScreen] = useState(false);
  // Track previous split type to detect changes from custom
  const prevSplitTypeRef = useRef(splitType);

  const customUnitPopupRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (
        customUnitPopupRef.current &&
        !customUnitPopupRef.current.contains(event.target)
      ) {
        setShowUnitOptions(false); // close popup
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showUnitOptions]);

  // Initialize last known good amount
  React.useEffect(() => {
    const initialAmount = Number(
      (
        Number(selectedCharge?.totalAmount) ||
        Number(selectedCharge?.lastAmount) ||
        0
      ).toFixed(2)
    );
    if (initialAmount > 0) {
      setLastKnownGoodAmount(initialAmount);
    }
  }, [selectedCharge?.lastAmount]);

  // Only disable dynamic costs if conditions don't allow it, but don't auto-enable
  // React.useEffect(() => {
  //   // If dynamic costs become disabled (e.g., switching to custom split or one-time), turn it off
  //   if (isDynamicCostsDisabled && isDynamic) {
  //     setIsDynamic(false);
  //   }
  //   // Don't auto-enable when conditions allow - let user choose
  // }, [isDynamicCostsDisabled, isDynamic]);

  // Sync editableTotalAmount with totalAmount prop
  // React.useEffect(() => {
  //   if (totalAmount !== undefined && totalAmount !== editableTotalAmount) {
  //     setEditableTotalAmount(Number(Number(totalAmount).toFixed(2)));
  //   }
  // }, [totalAmount]);

  // Update parent totalAmount when editableTotalAmount changes
  // React.useEffect(() => {
  //   if (setTotalAmount && editableTotalAmount !== totalAmount) {
  //     setTotalAmount(Number(editableTotalAmount.toFixed(2)));
  //   }
  // }, [editableTotalAmount, setTotalAmount, totalAmount]);

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
      case "biweekly":
        return "Biweekly";
      case "monthly":
        return "Monthly";
      case "yearly":
        return "Yearly";
      case "custom":
        if (customInterval === 1) {
          switch (customUnit) {
            case "days":
              return "daily";
            case "weeks":
              return "weekly";
            case "months":
              return "monthly";
            case "years":
              return "yearly";
            default:
              return `Every ${customUnit.slice(0, -1)}`;
          }
        } else {
          return `every ${customInterval} ${customUnit}`;
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
          case "biweekly":
            return "In two weeks";
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
      case "biweekly":
        return "In two weeks";
      case "monthly":
        return "Next month";
      case "yearly":
        return "Next year";
      // default:
      //   return "Now";
    }
  };

  function getCostEntry() {
    console.log(
      "AMOUNT",
      splitType == "percentage"
        ? null
        : Number(roundToTwo(editableTotalAmount / (participants.length + 1))),
      editableTotalAmount
    );
    function roundToTwo(num) {
      const n = Number(num);
      if (Number.isNaN(n));
      return Number(n.toFixed(2));
    }
    const costEntry = generateCostEntry({
      selectedCharge,
      newChargeDetails,
      selectedPeople,
      splitType,
      ...(splitType === "custom" && { customAmounts }),
      recurringType,
      customInterval,
      customUnit,
      startTiming,
      totalSplit,
      editableTotalAmount,
    });

    // Override cost entry properties with current state values to ensure accuracy
    costEntry.splitType = splitType;
    costEntry.amount =
      splitType == "percentage"
        ? null
        : Number(roundToTwo(editableTotalAmount / (participants.length + 1)));
    costEntry.totalAmount = roundToTwo(Number(editableTotalAmount));
    costEntry.frequency = recurringType === "none" ? null : recurringType;
    costEntry.customInterval =
      recurringType === "custom" ? customInterval : null;
    costEntry.customUnit = recurringType === "custom" ? customUnit : null;
    costEntry.startTiming = startTiming;
    costEntry.isDynamic = isDynamic;

    costEntry.reminderFrequency = reminderFrequency;

    costEntry.allowPaymentNotificationsInfo = allowPaymentNotificationsInfo;

    costEntry.dueInDays = dueInDays;

    costEntry.name = chargeName;
    costEntry.selectedTransaction = selectedTransaction;

    // NOT CONFIGURABLE FOR USER YET!
    costEntry.requestFrequency = "daily";

    costEntry.allowMarkAsPaidForEveryone = allowMarkAsPaidForEveryone;
    costEntry.isPlaidCharge = isPlaidCharge;
    // save id to entry for edit mode, used to identify which cost to update in DB
    if (isEditMode) {
      costEntry._id = selectedCharge._id;
    }

    // costEntry.dynamicCostReason = dynamicCostReason;
    // Only include split method specific data
    if (splitType === "custom") {
      costEntry.customAmounts = Object.fromEntries(
        Object.entries(customAmounts).map(([key, value]) => [
          key,
          roundToTwo(value),
        ])
      );
    } else {
      costEntry.customAmounts = {};
    }

    if (splitType === "percentage") {
      costEntry.percentageAmounts = Object.fromEntries(
        Object.entries(percentageAmounts).map(([key, value]) => [
          key,
          roundToTwo(value),
        ])
      );
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
          // individualAmount = actualAmount / (selectedPeople.length + 1);
          individualAmount = roundToTwo(
            Number(editableTotalAmount / (selectedPeople.length + 1))
          );
          break;
        case "equal":
          individualAmount = roundToTwo(
            Number(editableTotalAmount / selectedPeople.length)
          );
          break;
        case "percentage":
          individualAmount = roundToTwo(
            editableTotalAmount *
              (Number(percentageAmounts[person._id] || 0) / 100)
          );
          baseParticipant.percentage = Number(percentageAmounts[person._id]);
          break;
        case "custom":
          individualAmount = roundToTwo(Number(customAmounts[person._id]) || 0);
          baseParticipant.customAmount = roundToTwo(
            Number(customAmounts[person._id])
          );
          break;
        default:
          individualAmount = 0;
      }

      baseParticipant.amount = individualAmount;
      return baseParticipant;
    });

    function calculateTotalAmountOwed(participants) {
      return participants.reduce((total, participant) => {
        return total + Number(participant.amount) || 0;
      }, 0);
    }

    costEntry.totalAmountOwed = roundToTwo(
      calculateTotalAmountOwed(costEntry.participants)
    );

    return costEntry;
  }

  const handleSendRequest = () => {
    const costEntry = getCostEntry();
    setIsSendingRequest(true);

    gaEvent("send_request_click");

    if (isEditMode) {
      const handleUpdateRequest = async () => {
        const UpdatedCostFromDB = await updateRequest(costEntry._id, costEntry);
        if (UpdatedCostFromDB) {
          updateCost(UpdatedCostFromDB);
          setSelectedCost(UpdatedCostFromDB);
          onBack();
          setIsSendingRequest(false);
          root.scrollTo({ top: 0, behavior: "instant" });
        }
      };
      handleUpdateRequest(); // Call the function
    } else {
      // query db with new request:
      const handleCreateRequest = async () => {
        const newCostFromDB = await createRequest(costEntry);
        if (newCostFromDB) {
          addCost(newCostFromDB);
          setShowRequestSentScreen(true);
          setSubmittedRequest(newCostFromDB);
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
  // React.useEffect(() => {
  //   const prevSplitType = prevSplitTypeRef.current;

  //   // Check if we're changing FROM custom TO another split type
  //   if (prevSplitType === "custom" && splitType !== "custom") {
  //     // Auto-enable dynamic costs if:
  //     // 1. Not in edit mode (new cost) and plaidMatch is available, OR
  //     // 2. In edit mode and the original charge had dynamic costs enabled
  //     const shouldAutoEnable = !isEditMode
  //       ? isPlaidCharge || false // New cost: enable if plaid available
  //       : isDynamic || false; // Edit mode: enable if original was dynamic

  //     if (shouldAutoEnable && !isDynamicCostsDisabled) {
  //       setIsDynamic(true);
  //     }
  //   }

  //   // Update the ref for next comparison
  //   prevSplitTypeRef.current = splitType;
  // }, [splitType, isDynamicCostsDisabled, isEditMode, isPlaidCharge, isDynamic]);

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
      }
    }

    // Update the ref for next comparison
    prevSplitTypeRef.current = splitType;
  }, [splitType, customAmounts, lastKnownGoodAmount]);

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
          newTotalAmount = Number(customTotal);
        }
      }
    }

    // For percentage split, ensure we have a base amount to work with
    else if (splitType === "percentage") {
      if (!editableTotalAmount || editableTotalAmount === 0) {
        newTotalAmount = Number(
          editableTotalAmount || lastKnownGoodAmount || 0
        );
      }
    }

    // For equal splits, use the charge amount or current total
    else if (splitType === "equal" || splitType === "equalWithMe") {
      if (!editableTotalAmount || editableTotalAmount === 0) {
        newTotalAmount = Number(
          editableTotalAmount || lastKnownGoodAmount || 0
        );
      }
    }

    // Update if amount changed and is valid
    if (newTotalAmount !== editableTotalAmount && newTotalAmount >= 0) {
      setEditableTotalAmount(newTotalAmount);
      setEditableTotalAmount(newTotalAmount);
    }
  }, [
    splitType,
    customAmounts,
    selectedCharge?.lastAmount,
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
        setEditableTotalAmount(roundedTotal);
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
    }
  }, [selectedCharge?._id, selectedCharge?.lastAmount]);
  const [hide, setHide] = useState(true);

  if (showRequestSentScreen) {
    // after sent request, show confirmation screen
    return (
      <>
        <RequestSentScreen
          setHide={setHide}
          request={submittedRequest}
          onClose={() => {
            navigate("/dashboard");
            setView("dashboard");
            root.scrollTo({ top: 0, behavior: "instant" });
          }}
          onAgain={() => {
            navigate("/dashboard/add");
            setView("add");
            root.scrollTo({ top: 0, behavior: "instant" });
          }}
          startTimeNow={startTiming == "now"}
        />
      </>
    );
  }

  const avatar = generateAvatar();
  function generateAvatar() {
    // Safety check for userData and name
    if (!userData || !userData.name) {
      return "?"; // Default fallback
    }

    const nameParts = userData.name
      .trim()
      .split(" ")
      .filter((part) => part.length > 0);

    // Handle edge cases
    if (nameParts.length === 0) {
      return "?"; // Fallback for empty name
    }

    const initials =
      nameParts.length === 1
        ? nameParts[0][0].toUpperCase()
        : (nameParts[0][0] + nameParts[nameParts.length - 1][0]).toUpperCase(); // Fixed: was .toUpper

    return initials;
  }
  return (
    <div className={""}>
      {/* Main content container with bottom padding to prevent content being hidden behind ConfirmButtonTray */}
      <div className={`max-w-lg mx-auto px-4 sm:px-6 py-0 pb-48 `}>
        {/* Hide step indicator and back button in edit mode since modal has its own header */}
        {/* {!isEditMode && <StepIndicator current="split" />} */}
        {
          <div
            className={`flex items-center gap-4  mt-10 mb-6  ${
              isEditMode && "mt-8"
            }`}
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
                  ? `Configure requests for ${selectedPeople.length} ${
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
        {/* <ChargeDisplay
          selectedCharge={selectedCharge}
          newChargeDetails={newChargeDetails}
          overrideAmount={totalSplit}
          paymentSchedule={getRecurringLabel()}
          recurringType={recurringType}
          customInterval={customInterval}
          customUnit={customUnit}
          originalFrequency={originalFrequency}
        /> */}
        {!isEditMode && (
          <PlaidConnect
            setChargeName={setChargeName}
            setEditableTotalAmount={setEditableTotalAmount}
            setRecurringType={setRecurringType}
            setIsPlaidCharge={setIsPlaidCharge}
            setIsDynamic={setIsDynamic}
            setStartTiming={setStartTiming}
            chargeName={chargeName}
            isPlaidCharge={isPlaidCharge}
            setSelectedTransaction={setSelectedTransaction}
            selectedTransaction={selectedTransaction}
            isEditMode={isEditMode}
          />
        )}
        {/* Name of Charge */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 ">
            Name of Charge
          </h3>
          <input
            type="text"
            disabled={isPlaidCharge}
            value={chargeName}
            onChange={(e) => setChargeName(e.target.value)}
            placeholder="e.g., Netflix, Spotify Premium"
            className={` outline-none text-base  focus:ring-2 focus:ring-blue-600 focus:border-transparent 
              
                w-full flex items-center justify-between text-left p-3 rounded-xl border bg-white 
            transition-all hover:border-gray-300
            border-gray-200
              ${
                isPlaidCharge
                  ? "!bg-gray-100 text-gray-500 "
                  : "bg-white focus:ring-2  border-gray-200 focus:ring-blue-600 focus:border-transparent"
              }`}
          />
        </div>
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Total Amount to Split
          </h3>
          <div className="relative">
            <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="number"
              step="0.01"
              onWheel={(e) => e.target.blur()} // 👈 disables scroll-to-change
              value={editableTotalAmount == 0 ? "" : editableTotalAmount}
              onChange={(e) => {
                const newAmount = e.target.value;
                setEditableTotalAmount(newAmount);
                if (newAmount >= 0) {
                  setLastKnownGoodAmount(newAmount);
                }
                setEditableTotalAmount(newAmount);
              }}
              placeholder="Enter total amount"
              disabled={splitType === "custom" || isPlaidCharge}
              className={`pl-10 pr-4 py-3 outline-none text-base 

                w-full flex items-center justify-between text-left p-3 rounded-xl border bg-white 
            transition-all hover:border-gray-300
            border-gray-200
        ${
          splitType === "custom" || isPlaidCharge
            ? "bg-gray-100 text-gray-500 "
            : "bg-white focus:ring-2  border-gray-200 focus:ring-blue-600 focus:border-transparent"
        }`}
            />
          </div>
        </div>

        {/* Payment Schedule */}
        <div>
          {/* Frequency (new) */}
          <DropdownOptionSection
            title="Frequency"
            isEditMode={isEditMode}
            selectedKey={recurringType || null}
            options={[
              {
                key: "one-time",
                label: "One-time",
                subLabel: "Send only once",
              },
              {
                key: "daily",
                label: "Daily",
                subLabel: "Sends every day",
              },
              {
                key: "weekly",
                label: "Weekly",
                subLabel: "Sends every week",
              },
              {
                key: "biweekly",
                label: "Biweekly",
                subLabel: "Sends every 2 weeks",
              },
              {
                key: "monthly",
                label: "Monthly",
                subLabel: "Sends every month",
              },
              {
                key: "yearly",
                label: "Yearly",
                subLabel: "Sends once per year",
              },
              {
                key: "custom",
                label: "Custom",
                subLabel: "Set your own interval",
              },
            ]}
            columns={2}
            icon={<Clock className="w-4 h-4 text-gray-500" />}
            onSelect={(key) => {
              setRecurringType(key);

              // If they switch away from custom, clear custom inputs
              if (key !== "custom") {
                setCustomInterval("");
                setCustomUnit("days");
              }

              // Your old logic: one-time disables dynamic
              if (key === "one-time") {
                setIsDynamic(false);
              }
            }}
          />

          {/* Custom Interval Input (same as before, but unit uses component) */}
          {recurringType === "custom" && (
            <div className="mb-4 mt-3">
              <div className="flex gap-2">
                {/* Every (Number) Input */}
                <div className="flex-1">
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Every
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={customInterval}
                    onChange={(e) =>
                      setCustomInterval(parseInt(e.target.value, 10) || "")
                    }
                    className={` text-sm outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent
                    
                    w-full flex items-center justify-between text-left p-3 rounded-xl border bg-white 
            transition-all hover:border-gray-300
            border-gray-200
                    `}
                  />
                </div>

                {/* Unit (new) */}
                <div className="flex-1">
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Unit
                  </label>
                  <DropdownOptionSection
                    title="Unit"
                    hideTitle={true}
                    selectedKey={customUnit}
                    options={[
                      {
                        key: "days",
                        label: "Days",
                      },
                      {
                        key: "weeks",
                        label: "Weeks",
                      },
                      {
                        key: "months",
                        label: "Months",
                      },
                      {
                        key: "years",
                        label: "Years",
                      },
                    ]}
                    columns={2}
                    dropdownMaxHeight={220}
                    dropdownMargin={8}
                    onSelect={(key) => setCustomUnit(key)}
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Split Method Selection - Always visible */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Split Method
          </h3>
          <div className="grid grid-cols-2 gap-3">
            <div
              onClick={() => setSplitType("equalWithMe")}
              className={`p-4 col-span-1 rounded-xl border-2 cursor-pointer transition-all ${
                splitType === "equalWithMe"
                  ? "border-blue-600 bg-blue-50"
                  : "border-gray-200 bg-white hover:border-gray-300"
              }`}
            >
              <div className="flex flex-col items-center text-center gap-2">
                {/* <div className="w-8 h-8 rounded-lg bg-blue-500 flex items-center justify-center">
                  <User className="w-4 h-4 text-white" />
                </div> */}
                <div className="flex gap-2 items-center justify-center">
                  <div
                    className={`w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-semibold text-sm`}
                  >
                    {avatar}
                  </div>
                  <strong className="text-lg font-semibold">+</strong>
                  <SelectedPeopleDisplay
                    size={8}
                    hideCount={true}
                    selectedPeople={selectedPeople}
                    rounded="lg"
                  />
                </div>

                <div>
                  <h4 className="font-semibold text-gray-900 text-sm">
                    Equal Split (including you)
                  </h4>
                  <p className="text-gray-600 text-xs">
                    Divide equally between everyone
                  </p>
                </div>
              </div>
            </div>

            <div
              onClick={() => setSplitType("equal")}
              className={`p-4 rounded-xl col-span-1 border-2 cursor-pointer transition-all ${
                splitType === "equal"
                  ? "border-blue-600 bg-blue-50"
                  : "border-gray-200 bg-white hover:border-gray-300"
              }`}
            >
              <div className="flex flex-col items-center text-center gap-2">
                <SelectedPeopleDisplay
                  size={8}
                  hideCount={true}
                  selectedPeople={selectedPeople}
                  rounded="lg"
                />
                <div>
                  <h4 className="font-semibold text-gray-900 text-sm">
                    Equal Split (participants)
                  </h4>
                  <p className="text-gray-600 text-xs">
                    Divide equally between participants
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

            <button
              disabled={isDynamic}
              onClick={() => setSplitType("custom")}
              className={`p-4 rounded-xl border-2 transition-all ${
                isDynamic
                  ? "border-gray-200 bg-gray-100 cursor-not-allowed opacity-60"
                  : splitType === "custom"
                  ? "border-blue-600 bg-blue-50 cursor-pointer"
                  : "border-gray-200 bg-white hover:border-gray-300 cursor-pointer"
              }`}
            >
              <div className="flex flex-col items-center text-center gap-2">
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                    isDynamic ? "bg-blue-600" : "bg-blue-600"
                  }`}
                >
                  <DollarSign className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h4
                    className={`font-semibold text-sm ${
                      isDynamic ? "text-gray-400" : "text-gray-900"
                    }`}
                  >
                    Custom
                  </h4>
                  <p
                    className={`text-xs ${
                      isDynamic ? "text-gray-400" : "text-gray-600"
                    }`}
                  >
                    Set amounts
                  </p>
                </div>
              </div>
            </button>
          </div>
        </div>
        {/* Percentage Split Input - Visible when percentage selected */}
        {splitType === "percentage" && (
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Percentage Split
            </label>
            <div className="space-y-2 max-h-50 overflow-y-auto">
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
                        onWheel={(e) => e.target.blur()} // 👈 disables scroll-to-change
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
        {/* Start Timing Options - Only when making initial request */}
        {!isEditMode && (
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
                    {isEditMode ? "Not Available" : "Send it now"}
                  </div>
                </div>
              </button>

              <DatePicker
                setStartTiming={setStartTiming}
                startTiming={startTiming}
              />
            </div>
          </div>
        )}
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Additional Settings
        </h3>
        {/* Only show when making initial request */}
        <DropdownOptionSection
          title="Due date"
          hideTitle={true}
          isEditMode={isEditMode}
          selectedKey={dueInDays}
          onSelect={(v) => setDueInDays(v)}
          icon={<CalendarClock className="w-4 h-4 text-gray-500 shrink-0" />}
          options={[
            {
              key: 1,
              label:
                startTiming === "now" ? "Due tomorrow" : "Due day after sent",
              subLabel: "Reminders start then",
            },
            {
              key: 3,
              label:
                startTiming === "now"
                  ? "Due in 3 days"
                  : "Due 3 days after sent",
              subLabel: "Reminders start then",
            },
            {
              key: 7,
              label:
                startTiming === "now" ? "Due in a week" : "Due week after sent",
              subLabel: "Reminders start then",
            },
            {
              key: 30,
              label:
                startTiming === "now"
                  ? "Due in a month"
                  : "Due month after sent",
              subLabel: "Reminders start then",
            },
          ]}
        />
        <DropdownOptionSection
          title="Reminder frequency"
          hideTitle={true}
          isEditMode={isEditMode}
          selectedKey={reminderFrequency}
          icon={<Bell className="w-4 h-4 text-gray-500 shrink-0" />}
          onSelect={setReminderFrequency}
          options={[
            {
              key: "daily",
              label: "Reminders once a day",
              // icon: <CalendarClock className="w-5 h-5" />,
            },
            {
              key: "3days",
              label: "Reminders every 3 days",
              // icon: <Repeat className="w-5 h-5" />,
            },
            {
              key: "weekly",
              label: "Reminders once a week",
              // icon: <CalendarClock className="w-5 h-5" />,
            },
            {
              key: "once",
              label: "One reminder",
              // icon: <Bell className="w-5 h-5" />,
            },
            {
              key: "none",
              label: "No reminders",
              // icon: <X className="w-5 h-5" />,
            },
          ].map((o) => ({
            key: o.key,
            label: o.label,
            subLabel:
              o.key === "none" ? "No text reminders" : "Texts this often",
          }))}
        />

        <DropdownOptionSection
          title="Text Notifications"
          hideTitle={true}
          infoContent={`When someone pays you, Splitify sends you a text. 
     Tap the link to instantly mark the request as paid.`}
          icon={<SendIcon className="w-4 h-4 text-gray-500 shrink-0" />}
          options={[
            {
              key: "enabled",
              label: "Get texts notifications",
              subLabel:
                "When a payment is made, you will be sent a text with a link to instantly mark it as paid",
              disabled: isPaymentNotificationsInfoDisabled,
              badge: isPaymentNotificationsInfoDisabled
                ? "Premium required"
                : null,
            },
            {
              key: "disabled",
              label: "Don't get text notifications",
              subLabel: "You will not receive texts when payments are made",
            },
          ]}
          selectedKey={allowPaymentNotificationsInfo ? "enabled" : "disabled"}
          columns={1}
          onBeforeSelect={(opt) => {
            if (opt.key === "enabled" && isPaymentNotificationsInfoDisabled) {
              setShowPremiumPrompt(true);
              return false; // block select like your old code
            }
          }}
          onSelect={(key) =>
            setAllowPaymentNotificationsInfo(key === "enabled")
          }
        />

        <DropdownOptionSection
          title="Variable Cost Tracking"
          hideTitle={true}
          icon={<TrendingUp className="w-4 h-4 text-gray-500 shrink-0" />}
          infoContent={`Cost tracking is useful when you have recurring expenses that increase or decrease. 
     Requests will be updated with the new amount each cycle.`}
          isEditMode={isEditMode}
          options={[
            {
              key: "fixed",
              label: "Same amount each time",
              subLabel: "Requests will send with same amount each cycle",
              // icon: <BarChart3 className="w-5 h-5 text-white" />,
            },
            {
              key: "variable",
              label: "Amounts update with latest bill",
              premium: true,
              subLabel:
                "Future requests will update with latest amount using your bank transactions and calculate new amount for each person",
              // icon: <TrendingUp className="w-5 h-5 text-white" />,
              disabled: isDynamicCostsDisabled,
              badge: isDynamicCostsDisabled
                ? splitType === "custom"
                  ? "Not available for custom split"
                  : recurringType === "none"
                  ? "Recurring only"
                  : !isPlaidCharge
                  ? "Must add charge with bank"
                  : "Plaid required"
                : null,
            },
          ]}
          selectedKey={isDynamic ? "variable" : "fixed"}
          columns={1}
          onBeforeSelect={(opt) => {
            if (opt.key === "variable") {
              if (isDynamicCostsDisabled) {
                // block select (same behavior as before)
                if (userData.plan === "free") setShowPremiumPrompt(true);
                return false;
              }
              // allow select, but still nudge free users
              if (userData.plan === "free") setShowPremiumPrompt(true);
            }
          }}
          onSelect={(key) => setIsDynamic(key === "variable")}
        />

        <DropdownOptionSection
          title="Allow others to mark as paid"
          hideTitle={true}
          icon={<BadgeCheckIcon className="w-4 h-4 text-gray-500 shrink-0" />}
          infoContent={`Setting this to "Everyone" is useful when you trust users to honestly mark requests as paid.`}
          options={[
            {
              key: "only_you",
              label: "Only you can mark as paid",
              subLabel: "You must record when a payment is recieved",
              // icon: <User className="w-5 h-5 text-white" />,
            },
            {
              key: "everyone",
              premium: true,
              label: "Others can mark as paid",
              subLabel: "Others can record when a payment has been made",
              // icon: <Users className="w-5 h-5 text-white" />,
              disabled: isMarkAsPaidEveryoneDisabled,
              // badge: isMarkAsPaidEveryoneDisabled ? "Premium required" : null,
            },
          ]}
          selectedKey={allowMarkAsPaidForEveryone ? "everyone" : "only_you"}
          columns={1}
          onBeforeSelect={(opt) => {
            if (opt.key === "everyone" && isMarkAsPaidEveryoneDisabled) {
              setShowPremiumPrompt(true);
              return false;
            }
          }}
          onSelect={(key) => setAllowMarkAsPaidForEveryone(key === "everyone")}
        />

        {/* Live Total Display - Always visible and sticky above send button */}
        {/* Send Button - Always visible and sticky */}
        <ConfirmButtonTray
          isSendingRequest={isSendingRequest}
          isEditMode={isEditMode}
          isCheckout={true}
          startTiming={startTiming}
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
                  Number(editableTotalAmount) / (selectedPeople.length + 1)
                )
              : splitType === "equal"
              ? Number(
                  (Number(editableTotalAmount) / selectedPeople.length).toFixed(
                    2
                  )
                )
              : 0 // For custom/percentage, we'll show total instead
          }
          totalAmount={
            splitType == "percentage"
              ? totalSplit.toFixed(2)
              : Number(editableTotalAmount).toFixed(2)
          }
          costEntry={getCostEntry()}
          billingFrequency={getRecurringLabel()}
          isCustomFrequency={recurringType == "custom"}
          chargeName={chargeName}
          frequency={recurringType}
          splitType={splitType}
        />
        <SplitifyPremiumModal
          navbarPadding={true}
          isOpen={showPremiumPrompt}
          onClose={() => {
            // navigate("/dashboard");
            setShowPremiumPrompt(false);
          }}
        />
      </div>
    </div>
  );
};

export default SplitStep;
