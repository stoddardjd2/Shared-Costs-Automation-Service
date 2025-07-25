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

  // Get status color for solid indicator
  const getStatusColor = (status) => {
    switch (status) {
      case "paid":
        return "bg-emerald-500";
      case "pending":
        return "bg-amber-500";
      case "overdue":
        return "bg-red-500";
      default:
        return null;
    }
  };

  // Get border color and status info for payment requests
  const getPaymentStatusBorder = (status) => {
    switch (status) {
      case "paid":
        return {
          borderClass: "border-emerald-500",
          bgClass: "bg-emerald-50",
          labelClass: "bg-emerald-500 text-white",
          label: "Completed",
        };
      case "pending":
        return {
          borderClass: "border-yellow-500",
          bgClass: "bg-yellow-50",
          labelClass: "bg-yellow-500 text-white",
          label: "Pending",
        };
      case "partial":
        return {
          borderClass: "border-amber-500",
          bgClass: "bg-amber-50",
          labelClass: "bg-amber-500 text-white",
          label: "Partial",
        };
      case "overdue":
        return {
          borderClass: "border-red-500",
          bgClass: "bg-red-50",
          labelClass: "bg-red-500 text-white",
          label: "Overdue",
        };
      default:
        return {
          borderClass: "border-gray-200",
          bgClass: "bg-white",
          labelClass: "bg-gray-500 text-white",
          label: "Unknown",
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
        return <Clock className="w-4 h-4 text-yellow-600" />;
      case "overdue":
        return <XCircle className="w-4 h-4 text-red-600" />;
      default:
        return <Clock className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusBadge = (status) => {
    const baseClasses = "px-2 py-1 text-xs rounded-lg font-medium";
    switch (status) {
      case "paid":
        return `${baseClasses} bg-emerald-500 text-white`;
      case "pending":
        return `${baseClasses} bg-yellow-100 text-yellow-800`;
      case "partial":
        return `${baseClasses} bg-amber-500 text-white`;
      case "overdue":
        return `${baseClasses} bg-red-500 text-white`;
      default:
        return `${baseClasses} bg-gray-100 text-gray-800`;
    }
  };

  const handleResendRequest = (paymentId, userId) => {
    console.log(
      `Resending payment request ${paymentId} to user ${userId} for cost ${cost.id}`
    );
    if (resendPaymentRequest) {
      resendPaymentRequest(cost.id, paymentId, userId);
    }
  };

  const handleSendNewRequest = () => {
    console.log(`Sending new payment request for cost ${cost.id}`);
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

  // Create mock charge details for SplitStep
  const mockChargeDetails = {
    name: cost.name,
    lastAmount: cost.amount,
    frequency: cost.frequency,
    nextDue: cost.nextDue,
    plaidMatched: true,
  };

  if (showSplitStep) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 !mt-0">
        <div className="bg-white rounded-xl shadow-2xl w-full h-full overflow-hidden flex flex-col">
          <div className="flex-1 overflow-y-auto">
            <SplitStep
              selectedPeople={selectedPeople}
              onBack={() => setShowSplitStep(false)}
              selectedCharge={mockChargeDetails}
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
          <div className="max-w-lg mx-auto px-6 py-0 pb-24">
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

            {/* Edit Split Button - matching SplitStep button styling */}
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
                      Edit Request
                    </h4>
                    <p className="text-gray-600 text-sm">
                      Update split method, amounts & schedule
                    </p>
                  </div>
                </div>
                <ArrowLeft className="w-5 h-5 text-gray-500 rotate-180" />
              </button>
            </div>

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
                    console.log("payment", payment);
                    const statusInfo = getPaymentStatusBorder(payment.status);

                    return (
                      //  <div
                      //   key={payment.id}
                      //   className={`border-2 ${statusInfo.borderClass} rounded-xl p-4 ${statusInfo.bgClass} relative`}
                      // >
                      <div
                        key={payment.id}
                        className={`border-2 ${statusInfo.borderClass} rounded-xl p-4 bg-white relative`}
                      >
                        {/* Status Label */}
                        <div className="absolute top-3 right-3">
                          <span
                            className={`px-2 py-1 text-xs rounded-lg font-medium ${statusInfo.labelClass}`}
                          >
                            {statusInfo.label}
                          </span>
                        </div>

                        <div className="flex justify-between items-start mb-4">
                          <div className="w-full">
                            <div className="flex items-center gap-2 mb-2 flex-wrap">
                              <h4 className="font-semibold text-gray-900 text-2xl">
                                ${payment.amount}
                              </h4>
                            </div>
                            {/* <p className="text-sm text-gray-600">
                              Sent on{" "}
                              {new Date(
                                payment.requestDate
                              ).toLocaleDateString()}
                              {payment.dueDate && (
                                <>
                                  {" • Due "}
                                  {new Date(
                                    payment.dueDate
                                  ).toLocaleDateString()}
                                </>
                              )}
                            </p> */} 
                            <div className="flex justify-between w-full  border-b-2
                            ">
                              {payment.requestDate && (
                                <div className="flex items-center gap-2 text-gray-600 bg-white backdrop-blur-sm pr-3 py-1.5 rounded-lg w-fit">
                                  {/* <Calendar className="w-4 h-4" /> */}
                                  <span className="text-sm">
                                    Sent on:{" "}
                                    {new Date(
                                      payment.requestDate
                                    ).toLocaleDateString()}
                                  </span>
                                </div>
                              )}

                              {payment.requestDate && (
                                <div className="flex items-center gap-2 text-gray-600 bg-white backdrop-blur-sm px-3 py-1.5 rounded-lg w-fit">
                                  {/* <Calendar className="w-4 h-4" /> */}
                                  <span className="text-sm">
                                    Due on:{" "}
                                    {new Date(
                                      payment.dueDate
                                    ).toLocaleDateString()}
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                          {/* <div className="text-right">
                            <p className="font-semibold text-gray-900 text-lg">
                              ${payment.amount}
                            </p>
                          </div> */}
                        </div>

                        {/* Participant Status */}
                        <div className="space-y-2">
                          {payment.participants.map((participant) => {
                            const user = participants.find(
                              (u) => u.id === participant.userId
                            );
                            const { avatar } = getUserAvatar(user);
                            const statusColor = getStatusColor(
                              participant.status
                            );
                            const canResend =
                              participant.status === "pending" ||
                              participant.status === "overdue";

                            return (
                              <div
                                key={participant.userId}
                                className="flex items-center justify-between p-3 pl-0 bg-white/100 rounded-lg"
                              >
                                <div className="flex items-center gap-3 flex-1 min-w-0">
                                  <div className="relative flex-shrink-0">
                                    <div
                                      className={`w-8 h-8 rounded-lg ${user?.color} flex items-center justify-center text-white font-semibold text-xs border-2 border-white shadow-sm`}
                                    >
                                      {avatar}

                                      {/* Status indicator */}
                                      {statusColor && (
                                        <div
                                          className={`absolute -bottom-0.5 -right-0.5 ${statusColor} rounded-full w-3 h-3 border border-white shadow-sm`}
                                        ></div>
                                      )}
                                    </div>
                                  </div>
                                  <div className="flex-1 flex items- min-w-0 justify-between">
                                    <div className="flex items-baseline mt-[2px] gap-2">
                                      <span className="font-medium text-lg truncate">
                                        {user?.name}
                                      </span>
                                      <span className="text-sm text-gray-600 flex-shrink-0">
                                        ${participant.amount}
                                      </span>
                                    </div>
                                    {participant.paidDate && (
                                      <div className="flex items-center gap-2 text-gray-600 bg-white backdrop-blur-sm px-3 py-1.5 rounded-lg w-fit">
                                        <Calendar className="w-4 h-4" />
                                        <span className="text-sm">
                                          Paid:{" "}
                                          {new Date(
                                            participant.paidDate
                                          ).toLocaleDateString()}
                                        </span>
                                      </div>
                                    )}
                                  </div>
                                </div>
                                {canResend && (
                                  <button
                                    onClick={() =>
                                      handleResendRequest(
                                        payment.id,
                                        participant.userId
                                      )
                                    }
                                    className="bg-blue-600 text-sm text-white px-3 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 flex-shrink-0 ml-2"
                                  >
                                    <Send className="w-4 h-4" />
                                    <span className="">Resend</span>
                                  </button>
                                )}
                              </div>
                            );
                          })}
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
