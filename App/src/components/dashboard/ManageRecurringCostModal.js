import React, { useState, useEffect } from "react";
import {
  X,
  Send,
  CheckCircle,
  Clock,
  XCircle,
  AlertTriangle,
  Calendar,
  Edit,
  RefreshCw,
  Mail,
  MessageCircle,
  ArrowLeft,
  Settings,
  Users,
} from "lucide-react";
import { useData } from "../../contexts/DataContext";
import { getPaymentStatusColor } from "../../utils/helpers";
import SplitStep from "../steps/SplitStep"; // Import SplitStep component
import RequestButton from "./RequestButton";

const ManageRecurringCostModal = ({ cost, onClose }) => {
  const { participants, updateCost, sendPaymentRequest, resendPaymentRequest } =
    useData();
  const [activeTab, setActiveTab] = useState("requests");
  const [showSplitStep, setShowSplitStep] = useState(false);
  const [costSettings, setCostSettings] = useState({
    name: cost.name,
    amount: cost.amount,
    frequency: cost.frequency,
    nextDue: cost.nextDue,
    participants: cost.participants,
    splitType: cost.splitType,
  });

  // Format the amount per person based on split type (adapted from tray)
  const formatAmountDisplay = (cost) => {
    const totalParticipants = cost.participants.length;
    const amountPerPerson =
      totalParticipants > 0 ? cost.amount / totalParticipants : cost.amount;
    return {
      amount: `$${Number(amountPerPerson).toFixed(2)}`,
      label: "each",
    };
  };

  // Split step state
  const [splitType, setSplitType] = useState(cost.splitType || "equal");
  const [totalAmount, setTotalAmount] = useState(cost.amount || 0);
  const [customAmounts, setCustomAmounts] = useState({});
  const [percentageAmounts, setPercentageAmounts] = useState({});

  // Initialize custom and percentage amounts from cost data
  useEffect(() => {
    if (cost.participants) {
      const customAmts = {};
      const percentAmts = {};

      cost.participants.forEach((participant) => {
        if (participant.customAmount) {
          customAmts[participant.userId] = participant.customAmount;
        }
        if (participant.percentage) {
          percentAmts[participant.userId] = participant.percentage;
        }
      });

      setCustomAmounts(customAmts);
      setPercentageAmounts(percentAmts);
    }
  }, [cost]);

  // Helper function to generate avatar for users
  const getUserAvatar = (user) => {
    const name = user?.name || "";
    const nameParts = name.split(" ");
    const avatar =
      nameParts.length > 1
        ? `${nameParts[0][0]}${nameParts[1][0]}`
        : name.slice(0, 2);

    return {
      avatar: avatar.toUpperCase(),
    };
  };
  // Get subtle status indicator color
  const getStatusIndicatorColor = (status) => {
    switch (status) {
      case "paid":
        return "bg-green-500";
      case "pending":
        return "bg-blue-500";
      case "partial":
        return "bg-yellow-500"; // Added specific color for partial
      case "overdue":
        return "bg-red-500"; // Changed from orange to red for more distinction
      default:
        return "bg-gray-400";
    }
  };

  // Get subtle payment status styling - much more muted
  const getPaymentStatusStyling = (status) => {
    switch (status) {
      case "paid":
        return {
          cardClass: "bg-white border-gray-200",
          headerClass: "bg-green-50 border-b border-green-100",
          badgeClass: "bg-green-100 text-green-700 border border-green-200",
          iconClass: "text-green-600",
          textClass: "text-green-700",
          label: "Completed",
          icon: CheckCircle,
        };
      case "pending":
        return {
          cardClass: "bg-white border-gray-200",
          headerClass: "bg-blue-50 border-b border-blue-100",
          badgeClass: "bg-blue-100 text-blue-700 border border-blue-200",
          iconClass: "text-blue-600",
          textClass: "text-blue-700",
          label: "Pending",
          icon: Clock,
        };
      case "partial":
        return {
          cardClass: "bg-white border-gray-200",
          headerClass: "bg-yellow-50 border-b border-yellow-100", // Changed from amber to yellow
          badgeClass: "bg-yellow-100 text-yellow-700 border border-yellow-200",
          iconClass: "text-yellow-600",
          textClass: "text-yellow-700",
          label: "Partial",
          icon: AlertTriangle,
        };
      case "overdue":
        return {
          cardClass: "bg-white border-gray-200",
          headerClass: "bg-red-50 border-b border-red-100", // Changed from orange to red
          badgeClass: "bg-red-100 text-red-700 border border-red-200",
          iconClass: "text-red-600",
          textClass: "text-red-700",
          label: "Overdue",
          icon: XCircle,
        };
      default:
        return {
          cardClass: "bg-white border-gray-200",
          headerClass: "bg-gray-50 border-b border-gray-100",
          badgeClass: "bg-gray-100 text-gray-700 border border-gray-200",
          iconClass: "text-gray-600",
          textClass: "text-gray-700",
          label: "Unknown",
          icon: Clock,
        };
    }
  };

  // Get payment history from the cost object
  const paymentHistory = cost.paymentHistory || [];

  // Sort payment history by date (most recent first)
  const sortedPayments = paymentHistory.sort(
    (a, b) => new Date(b.requestDate) - new Date(a.requestDate)
  );

  const getPaymentStatusIcon = (status) => {
    switch (status) {
      case "paid":
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case "pending":
        return <Clock className="w-4 h-4 text-blue-600" />;
      case "overdue":
        return <XCircle className="w-4 h-4 text-orange-600" />;
      default:
        return <Clock className="w-4 h-4 text-gray-400" />;
    }
  };

  const handleResendRequest = (paymentId, userId) => {
    if (resendPaymentRequest) {
      resendPaymentRequest(cost.id, paymentId, userId);
    }
  };

  const handleSendNewRequest = () => {
    if (sendPaymentRequest) {
      sendPaymentRequest(cost.id);
    }
  };

  const handleUpdateCost = (updatedCostData) => {
    // Update cost settings with the new split configuration
    const updatedSettings = {
      ...costSettings,
      splitType: updatedCostData.splitType,
      amount: updatedCostData.amount,
      frequency: updatedCostData.frequency,
      customInterval: updatedCostData.customInterval,
      customUnit: updatedCostData.customUnit,
      startTiming: updatedCostData.startTiming,
      isDynamicCosts: updatedCostData.isDynamicCosts,
      dynamicCostReason: updatedCostData.dynamicCostReason,
      participants: updatedCostData.participants,
    };

    // Update the cost in the context
    updateCost(cost.id, updatedSettings);

    // Update local state
    setCostSettings(updatedSettings);
    setSplitType(updatedCostData.splitType);
    setTotalAmount(updatedCostData.amount);

    // Update custom and percentage amounts
    const newCustomAmounts = {};
    const newPercentageAmounts = {};
    updatedCostData.participants.forEach((participant) => {
      if (participant.customAmount) {
        newCustomAmounts[participant.userId] = participant.customAmount;
      }
      if (participant.percentage) {
        newPercentageAmounts[participant.userId] = participant.percentage;
      }
    });
    setCustomAmounts(newCustomAmounts);
    setPercentageAmounts(newPercentageAmounts);

    // Close the split step
    setShowSplitStep(false);
  };

  const isOverdue = (dueDate) => {
    return new Date(dueDate) < new Date();
  };

  const getDaysOverdue = (dueDate) => {
    const today = new Date();
    const due = new Date(dueDate);
    const diffTime = today - due;
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const updateCustomAmount = (personId, value) => {
    setCustomAmounts((prev) => ({
      ...prev,
      [personId]: value,
    }));
  };

  const updatePercentageAmount = (personId, value) => {
    setPercentageAmounts((prev) => ({
      ...prev,
      [personId]: value,
    }));
  };

  const calculateSplitAmounts = (selectedPeople) => {
    const amounts = {};
    if (splitType === "equal") {
      const amountPerPerson = totalAmount / selectedPeople.length;
      selectedPeople.forEach((person) => {
        amounts[person.id] = amountPerPerson;
      });
    } else if (splitType === "equalWithMe") {
      const amountPerPerson = totalAmount / (selectedPeople.length + 1);
      selectedPeople.forEach((person) => {
        amounts[person.id] = amountPerPerson;
      });
    }
    return amounts;
  };

  // Convert participants to the format expected by SplitStep
  const selectedPeople = costSettings.participants
    .map((participant) => {
      const user = participants.find((p) => p.id === participant.userId);
      return {
        id: participant.userId,
        name: user?.name || "Unknown",
        avatar: user?.avatar || user?.name?.charAt(0) || "U",
        color: user?.color || "bg-gray-500",
      };
    })
    .filter((person) => person.name !== "Unknown");

  // Check if this is a recurring cost (not one-time)
  const isRecurringCost = cost.frequency && cost.frequency.toLowerCase() !== "one-time" && cost.frequency.toLowerCase() !== "onetime";

  // Create charge details for SplitStep

  if (showSplitStep) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 !mt-0">
        <div className="bg-white rounded-xl shadow-2xl w-full h-full overflow-hidden flex flex-col">
          <div className="flex-1 overflow-y-auto">
            <SplitStep
              selectedPeople={selectedPeople}
              onBack={() => setShowSplitStep(false)}
              selectedCharge={cost}
              newChargeDetails={null}
              splitType={splitType}
              setSplitType={setSplitType}
              totalAmount={totalAmount}
              setTotalAmount={setTotalAmount}
              customAmounts={customAmounts}
              updateCustomAmount={updateCustomAmount}
              calculateSplitAmounts={calculateSplitAmounts}
              percentageAmounts={percentageAmounts}
              updatePercentageAmount={updatePercentageAmount}
              isEditMode={true}
              onUpdateCost={handleUpdateCost}
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 !mt-0">
      <div className="bg-gray-50 rounded-xl shadow-2xl w-full h-full overflow-hidden flex flex-col">
        <div className="flex-1 overflow-y-auto">
          {/* Main content container with mobile-friendly padding matching SplitStep */}
          <div className="max-w-7xl mx-auto px-14 py-0 pb-24">
            {/* Header section - matching SplitStep structure */}
            <div className="flex items-center gap-4 mb-6 mt-8">
              <button
                onClick={onClose}
                className="p-3 hover:bg-white rounded-xl transition-all hover:shadow-md"
              >
                <ArrowLeft className="w-6 h-6 text-gray-700" />
              </button>
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-gray-900">
                  Manage Recurring Cost
                </h1>
                <p className="text-gray-600 capitalize">
                  {cost.name} • {formatAmountDisplay(cost).amount} each •{" "}
                  {cost.frequency || "monthly"}
                </p>
              </div>
            </div>

            {/* Update Future Requests Button - only show for recurring costs */}
            {isRecurringCost && (
              <div className="mb-6">
                <button
                  onClick={() => setShowSplitStep(true)}
                  className="w-full p-4 bg-white hover:bg-gray-100 rounded-xl border border-gray-200 transition-all flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center">
                      <Settings className="w-4 h-4 text-white" />
                    </div>
                    <div className="text-left">
                      <h4 className="font-semibold text-gray-900">
                        Update Future Requests
                      </h4>
                      <p className="text-gray-600 text-sm">
                        Update split method, amounts & schedule
                      </p>
                    </div>
                  </div>
                  <ArrowLeft className="w-5 h-5 text-gray-500 rotate-180" />
                </button>
              </div>
            )}

            {/* Payment History Section */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Payment History
              </h3>
              {sortedPayments.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-xl border-2 border-gray-200">
                  <Mail className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <h4 className="font-medium text-gray-900 mb-2">
                    No payment requests yet
                  </h4>
                  <p className="text-gray-600 text-sm">
                    Payment requests will appear here once sent.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {sortedPayments.map((payment) => {
                    const statusStyling = getPaymentStatusStyling(
                      payment.status
                    );
                    const StatusIcon = statusStyling.icon;

                    return (
                      <div
                        key={payment.id}
                        className={`border rounded-xl overflow-hidden ${statusStyling.cardClass} shadow-sm`}
                      >
                        {/* Subtle Status Header */}
                        <div
                          className={`${statusStyling.headerClass} px-4 py-3 flex items-center justify-between`}
                        >
                          <div className="flex items-center gap-3">
                            <div
                              className={`inline-flex items-center gap-2 px-3 py-1 rounded-full ${statusStyling.badgeClass}`}
                            >
                              <StatusIcon
                                className={`w-4 h-4 ${statusStyling.iconClass}`}
                              />
                              <span className="text-sm font-medium">
                                {statusStyling.label}
                              </span>
                            </div>
                          </div>
                          <span className="text-gray-900 font-semibold text-xl">
                            ${payment.amount}
                          </span>
                        </div>

                        <div className="p-4">
                          {/* Date Information */}
                          <div className="flex justify-between items-center mb-4 pb-3 border-b border-gray-100">
                            {payment.requestDate && (
                              <div className="flex items-center gap-2 text-gray-600">
                                <Calendar className="w-4 h-4" />
                                <span className="text-sm">
                                  Sent:{" "}
                                  {new Date(
                                    payment.requestDate
                                  ).toLocaleDateString()}
                                </span>
                              </div>
                            )}

                            {payment.dueDate && (
                              <div className="flex items-center gap-2 text-gray-600">
                                <Clock className="w-4 h-4" />
                                <span className="text-sm">
                                  Due:{" "}
                                  {new Date(
                                    payment.dueDate
                                  ).toLocaleDateString()}
                                </span>
                              </div>
                            )}
                          </div>

                          {/* Participant Status */}
                          <div className="space-y-3">
                            {payment.participants.map((participant) => {
                              const user = participants.find(
                                (u) => u.id === participant.userId
                              );
                              const { avatar } = getUserAvatar(user);
                              const statusIndicatorColor =
                                getStatusIndicatorColor(participant.status);
                              const canResend =
                                participant.status === "pending" ||
                                participant.status === "overdue";

                              return (
                                <div
                                  key={participant.userId}
                                  className="flex items-center justify-between p-3 rounded-lg border border-gray-100"
                                >
                                  <div className="flex items-center gap-3 flex-1 min-w-0">
                                    <div className="relative flex-shrink-0">
                                      <div
                                        className={`w-10 h-10 rounded-lg ${user?.color} flex items-center justify-center text-white font-semibold text-sm border-2 border-white shadow-sm`}
                                      >
                                        {avatar}
                                        {/* Status indicator - small and subtle */}
                                        <div
                                          className={`absolute -bottom-0.5 -right-0.5 ${statusIndicatorColor} rounded-full w-3 h-3 border-2 border-white`}
                                        ></div>
                                      </div>
                                    </div>

                                    <div className="flex-1 min-w-0">
                                      <div className="flex flex-col">
                                        <span className="font-semibold text-black text-lg truncate">
                                          {user?.name}
                                        </span>
                                        <div className="flex items-center gap-3 mt-1">
                                          <span className="text-gray-600 font-medium">
                                            ${participant.amount}
                                          </span> 
                                          
                                          {participant.paidDate ? (
                                            <span className="text-sm text-gray-600">
                                              {" "}Paid{" "}
                                              {new Date(
                                                participant.paidDate
                                              ).toLocaleDateString()}
                                            </span>
                                          ) : (
                                            <span className="text-sm text-gray-600">
                                              Unpaid
                                            </span>
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                  </div>

                                  {canResend && (
                                    <RequestButton
                                      costId={cost.id}
                                      participantUserId={participant.userId}
                                      className="px-3 py-2 text-sm ml-3 flex-shrink-0"
                                      loadingText="Sending..."
                                      successText="Sent!"
                                    >
                                      Resend
                                    </RequestButton>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManageRecurringCostModal;