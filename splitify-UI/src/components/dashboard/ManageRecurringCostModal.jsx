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
  ParkingCircle,
} from "lucide-react";
import { useData } from "../../contexts/DataContext";
import { getPaymentStatusColor } from "../../utils/helpers";
import SplitStep from "../steps/SplitStep"; // Import SplitStep component
import RequestButton from "./RequestButton";
import { usePeopleState } from "../../hooks/usePeopleState";
import { useSplitState } from "../../hooks/useSplitState";
import { useChargeState } from "../../hooks/useChargeState";
import PaymentHistoryParticipantDetails from "./PaymentHistoryParticipantDetails";
import CancelRequestBtn from "./CancelRequestBtn";
import PauseRequestBtn from "./PauseRequestBtn";
import { useNavigate } from "react-router-dom";
import { Navigate } from "react-router-dom";
const ManageRecurringCostModal = ({ cost, onClose, setSelectedCost }) => {
  if (!cost || !onClose || !setSelectedCost) {
    return <Navigate to="/dashboard" replace />;
  }

  const { participants, updateCost, sendPaymentRequest, resendPaymentRequest } =
    useData();
  const [activeTab, setActiveTab] = useState("requests");
  const [showSplitStep, setShowSplitStep] = useState(false);
  const peopleState = usePeopleState();
  const splitState = useSplitState();
  const chargeState = useChargeState();

  useEffect(() => {
    // update
    chargeState.setSelectedCharge(cost);
    peopleState.setSelectedPeople(cost.participants);
    splitState.setSplitType(cost.splitType);
    splitState.setTotalAmount(cost.amount);
    splitState.setPercentageAmounts(cost.percentageAmounts);
    splitState.setCustomAmounts(cost.customAmounts);
  }, []);

  // Format the amount per person based on split type (adapted from tray)
  const formatAmountDisplay = (cost) => {
    const totalParticipants = cost.participants.length;
    const amountPerPerson =
      totalParticipants > 0 ? cost.amount / totalParticipants : cost.amount;
    return {
      amount: `$${Number(amountPerPerson).toFixed(2)}`,
      totalAmount: `$${cost.totalAmount.toFixed(2)}`,
      label: "each",
    };
  };

  const getParticipantStatus = (participant, payment) => {
    // check if paid full balance or greater
    if (participant.paymentAmount >= participant.amount) {
      return "paid";
    }

    // Check if overdue
    const dueDate = new Date(payment.dueDate);
    const today = new Date();

    // Set both dates to start of day for accurate comparison
    dueDate.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);

    return dueDate < today ? "overdue" : "pending";
  };

  // Get subtle status indicator color
  const getStatusIndicatorColor = (participant, payment) => {
    const status = getParticipantStatus(participant, payment);
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

  const getStatusLabel = (participant, payment) => {
    const status = getParticipantStatus(participant, payment);
    switch (status) {
      case "overdue":
        return "Overdue";
      case "pending":
        return "Pending";
      case "paid":
        const paymentDate = participant.paidDate
          ? new Date(participant.paidDate).toLocaleDateString()
          : "N/A";

        return `Paid on ${paymentDate}`;
    }
  };

  // Function to determine overall payment status from all participants
  // const getOverallPaymentStatus = (payment) => {
  //   const { participants, dueDate } = payment;
  //   if (!participants || participants.length === 0) {
  //     return "unknown";
  //   }

  //   // Check if payment is overdue
  //   const currentDate = new Date();
  //   const due = new Date(dueDate.$date);
  //   const isOverdue = currentDate > due;

  //   // Count participant statuses
  //   const statusCounts = participants.reduce((acc, participant) => {
  //     console.log("participant!!", participant);

  //     // check if payment is greater than or equal to amount owed to determine if paid
  //     let status;
  //     if (participant.paymentAmount >= participant.amount) {
  //       status = "paid";
  //     }else()
  //     acc[status] = (acc[status] || 0) + 1;
  //     return acc;
  //   }, {});

  //   console.log("statusCounts", statusCounts);
  //   const totalParticipants = participants.length;
  //   const paidCount = statusCounts.paid || 0;
  //   const pendingCount = statusCounts.pending || 0;

  //   // Determine overall status
  //   if (paidCount === totalParticipants) {
  //     return "paid";
  //   } else if (paidCount > 0 && paidCount < totalParticipants) {
  //     return "partial";
  //   } else if (pendingCount === totalParticipants && isOverdue) {
  //     return "overdue";
  //   } else if (pendingCount === totalParticipants) {
  //     return "pending";
  //   } else {
  //     return "unknown";
  //   }
  // };

  // Fixed version of your styling function (note: was using undefined 'status' variable)
  // const getPaymentStatusStyling = (payment) => {
  // Get the overall status first
  // const status = getOverallPaymentStatus(payment);

  //   console.log("status", status);
  //   switch (status) {
  //     case "paid":
  //       return {
  //         cardClass: "bg-white border-gray-200",
  //         headerClass: "bg-green-50 border-b border-green-100",
  //         badgeClass: "bg-green-100 text-green-700 border border-green-200",
  //         iconClass: "text-green-600",
  //         textClass: "text-green-700",
  //         label: "Completed",
  //         icon: CheckCircle,
  //       };
  //     case "pending":
  //       return {
  //         cardClass: "bg-white border-gray-200",
  //         headerClass: "bg-blue-50 border-b border-blue-100",
  //         badgeClass: "bg-blue-100 text-blue-700 border border-blue-200",
  //         iconClass: "text-blue-600",
  //         textClass: "text-blue-700",
  //         label: "Pending",
  //         icon: Clock,
  //       };
  //     case "partial":
  //       return {
  //         cardClass: "bg-white border-gray-200",
  //         headerClass: "bg-yellow-50 border-b border-yellow-100",
  //         badgeClass: "bg-yellow-100 text-yellow-700 border border-yellow-200",
  //         iconClass: "text-yellow-600",
  //         textClass: "text-yellow-700",
  //         label: "Partial",
  //         icon: AlertTriangle,
  //       };
  //     case "overdue":
  //       return {
  //         cardClass: "bg-white border-gray-200",
  //         headerClass: "bg-red-50 border-b border-red-100",
  //         badgeClass: "bg-red-100 text-red-700 border border-red-200",
  //         iconClass: "text-red-600",
  //         textClass: "text-red-700",
  //         label: "Overdue",
  //         icon: XCircle,
  //       };
  //     default:
  //       return {
  //         cardClass: "bg-white border-gray-200",
  //         headerClass: "bg-gray-50 border-b border-gray-100",
  //         badgeClass: "bg-gray-100 text-gray-700 border border-gray-200",
  //         iconClass: "text-gray-600",
  //         textClass: "text-gray-700",
  //         label: "Unknown",
  //         icon: Clock,
  //       };
  //   }
  // };

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

  // Check if this is a recurring cost (not one-time)
  const isRecurringCost =
    cost.frequency &&
    cost.frequency.toLowerCase() !== "one-time" &&
    cost.frequency.toLowerCase() !== "onetime";

  const formatBillingFrequency = (cost) => {
    const frequency = cost.frequency;
    const customInterval = cost.customInterval;
    const customUnit = cost.customUnit;
    if (!frequency || frequency === "monthly") {
      return "Monthly";
    }
    if (frequency === "weekly") {
      return "Weekly";
    }
    if (frequency === "biweekly") {
      return "Biweekly";
    }
    if (frequency === "yearly") {
      return "Yearly";
    }
    if (frequency === "daily") {
      return "Daily";
    }
    if (frequency === "custom") {
      // Handle pluralization for time units
      const getSingularUnit = (unit) => {
        const singularMap = {
          months: "month",
          days: "day",
          weeks: "week",
          years: "year",
        };
        return singularMap[unit] || unit;
      };

      const unit =
        customInterval === 1 ? getSingularUnit(customUnit) : customUnit;
      return `Every ${customInterval} ${unit}`;
    }
  };

  // Create charge details for SplitStep
  if (showSplitStep) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 !mt-0">
        <div className="bg-gray-50 shadow-2xl w-full h-full overflow-hidden flex flex-col">
          <div className="flex-1 overflow-y-auto mt-12">
            <SplitStep
              selectedPeople={peopleState.selectedPeople}
              setSelectedPeople={peopleState.setSelectedPeople}
              // onBack={() => onClose()}
              onBack={() => {
                setShowSplitStep(false);
              }}
              setSelectedCost={setSelectedCost}
              selectedCharge={chargeState.selectedCharge}
              setSelectedCharge={chargeState.setSelectedCharge}
              newChargeDetails={null}
              splitType={splitState.splitType}
              setSplitType={splitState.setSplitType}
              totalAmount={splitState.totalAmount}
              setTotalAmount={splitState.setTotalAmount}
              customAmounts={splitState.customAmounts}
              updateCustomAmount={splitState.updateCustomAmount}
              calculateSplitAmounts={splitState.calculateSplitAmounts}
              isEditMode={true}
              percentageAmounts={splitState.percentageAmounts}
              setPercentageAmounts={splitState.setPercentageAmounts}
              isEditingOneTimeRequest={!isRecurringCost}
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-black bg-opacity-50 flex items-center justify-center z-50 !mt-0">
      <div className="bg-gray-50 w-full h-full overflow-hidden flex flex-col">
        <div className="flex-1 overflow-y-auto">
          {/* Main content container with mobile-friendly padding matching SplitStep */}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-0 pb-24">
            {/* Header section - matching SplitStep structure */}
            <div className="flex flex-wrap items-center gap-4 mb-6 mt-8">
              <button
                onClick={onClose}
                className="p-3 hover:bg-white rounded-xl transition-all hover:shadow-md"
              >
                <ArrowLeft className="w-6 h-6 text-gray-700" />
              </button>
              <div className="flex-1">
                <h1 className="text-3xl font-bold whitespace-nowrap text-gray-900">
                  Manage Request
                </h1>
                <p className="text-gray-600">
                  View payment history or update future requests
                </p>
              </div>
              <div className="flex flex-wrap items-end justify-end">
                <div className="flex justify-between gap-10 ml-2">
                  <PauseRequestBtn
                    requestId={cost._id}
                    isPausedPassed={cost?.isPaused}
                  />
                  <CancelRequestBtn
                    requestId={cost._id}
                    onDeleteSuccess={onClose}
                  />
                </div>
              </div>
            </div>

            {/* Update Future Requests Button - only show for recurring costs */}
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
                    <h4 className="font-semibold text-gray-900">{cost.name}</h4>
                    <p className="text-gray-600 text-sm">
                      Edit request details
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
                <div className="space-y-4 bg-white">
                  {sortedPayments.map((payment) => {
                    // const statusStyling = getPaymentStatusStyling(payment);
                    // const StatusIcon = statusStyling.icon;

                    return (
                      <div
                        key={payment._id}
                        className={`border rounded-xl overflow-hidden shadow-sm`}
                      >
                        {/* Subtle Status Header */}
                        <div
                          className={` px-4 pt-3 flex items-center justify-between`}
                        >
                          {payment.totalAmountOwed == 0 ? (
                            <span className="text-gray-900 ml-2 font-semibold text-lg">
                              <span className="text-sm font-medium  text-gray-500 false">
                                All Paid
                              </span>
                            </span>
                          ) : (
                            <span className="text-gray-900 ml-2 font-semibold text-lg flex justify-center items-baseline gap-x-2 flex-col xxs:flex-row">
                              <div>${payment.totalAmountOwed.toFixed(2)} </div>
                              <span className="text-sm font-medium  text-gray-500 false">
                                Total owed
                              </span>
                            </span>
                          )}

                          <div className="flex items-center gap-3">
                            <div
                              className={`inline-flex items-center gap-2 px-3 py-1 rounded-full `}
                            >
                              {payment.dueDate && (
                                <div className="flex items-center font-semibold  gap-2">
                                  {/* <Clock className="w-5 h-5" /> */}
                                  <span className="text-lg  flex justify-center items-baseline row-x-3 flex-col-reverse xxs:flex-row">
                                    <span className="mr-2 text-sm text-gray-500 false">
                                      Due{" "}
                                      <span className="inline xxs:hidden">
                                        date
                                      </span>
                                    </span>
                                    <span className="text-lg text-gray-900">
                                      {new Date(
                                        payment.dueDate
                                      ).toLocaleDateString()}
                                    </span>
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="p-4">
                          {/* Date Information */}
                          {/* <div className="flex justify-between items-center mb-4 pb-3 border-b border-gray-200">
                            {payment.requestDate && (
                              <div className="flex items-center gap-2 text-gray-600 px-3">
                                <Calendar className="w-4 h-4" />
                                <span className="text-sm">
                                  Requested:{" "}
                                  {new Date(
                                    payment.requestDate
                                  ).toLocaleDateString()}
                                </span>
                              </div>
                            )}
                          </div> */}

                          {/* Participant Status */}
                          <div className="space-y-3">
                            {payment.participants.map((participant, index) => {
                              const user = participants.find(
                                (u) => u._id === participant._id
                              );
                              const statusIndicatorColor =
                                getStatusIndicatorColor(participant, payment);
                              const partcipantStatus = getParticipantStatus(
                                participant,
                                payment
                              );
                              const canResend =
                                partcipantStatus === "pending" ||
                                partcipantStatus === "overdue";

                              return (
                                <PaymentHistoryParticipantDetails
                                  key={index}
                                  costId={cost._id}
                                  participant={participant}
                                  paymentHistoryRequest={payment}
                                  user={user}
                                />
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
