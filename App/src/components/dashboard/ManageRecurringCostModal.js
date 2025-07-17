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
} from "lucide-react";
import { useData } from "../../contexts/DataContext";
import {
  getPaymentStatusColor,
} from "../../utils/helpers";
import SplitStep from "../steps/SplitStep"; // Import SplitStep component

const ManageRecurringCostModal = ({ cost, onClose }) => {
  const { participants, updateCost, sendPaymentRequest, resendPaymentRequest } = useData();
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
      
      cost.participants.forEach(participant => {
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
    const baseClasses = "px-2 py-1 text-xs rounded-full font-medium";
    switch (status) {
      case "paid":
        return `${baseClasses} bg-green-100 text-green-800`;
      case "pending":
        return `${baseClasses} bg-yellow-100 text-yellow-800`;
      case "partial":
        return `${baseClasses} bg-blue-100 text-blue-800`;
      case "overdue":
        return `${baseClasses} bg-red-100 text-red-800`;
      default:
        return `${baseClasses} bg-gray-100 text-gray-800`;
    }
  };

  const handleResendRequest = (paymentId, userId) => {
    console.log(`Resending payment request ${paymentId} to user ${userId} for cost ${cost.id}`);
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
      participants: updatedCostData.participants
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
    updatedCostData.participants.forEach(participant => {
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
    setCustomAmounts(prev => ({
      ...prev,
      [personId]: value
    }));
  };

  const updatePercentageAmount = (personId, value) => {
    setPercentageAmounts(prev => ({
      ...prev,
      [personId]: value
    }));
  };

  const calculateSplitAmounts = (selectedPeople) => {
    const amounts = {};
    if (splitType === "equal") {
      const amountPerPerson = totalAmount / selectedPeople.length;
      selectedPeople.forEach(person => {
        amounts[person.id] = amountPerPerson;
      });
    } else if (splitType === "equalWithMe") {
      const amountPerPerson = totalAmount / (selectedPeople.length + 1);
      selectedPeople.forEach(person => {
        amounts[person.id] = amountPerPerson;
      });
    }
    return amounts;
  };

  // Convert participants to the format expected by SplitStep
  const selectedPeople = costSettings.participants.map(participant => {
    const user = participants.find(p => p.id === participant.userId);
    return {
      id: participant.userId,
      name: user?.name || 'Unknown',
      avatar: user?.avatar || user?.name?.charAt(0) || 'U',
      color: user?.color || 'bg-gray-500',
    };
  }).filter(person => person.name !== 'Unknown');

  // Create mock charge details for SplitStep
  const mockChargeDetails = {
    name: cost.name,
    lastAmount: cost.amount,
    frequency: cost.frequency,
    nextDue: cost.nextDue, // Pass the next due date
    plaidMatched: true, // Assume true for existing costs
  };

  if (showSplitStep) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 !mt-0 p-4">
        <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full h-[95vh] overflow-hidden flex flex-col">
          {/* Split Step Header */}
          <div className="p-4 border-b bg-gray-50 flex items-center gap-4 flex-shrink-0">
            <button
              onClick={() => setShowSplitStep(false)}
              className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-700" />
            </button>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Edit Split Configuration</h2>
              <p className="text-sm text-gray-600">
                Update split settings for {selectedPeople.length} {selectedPeople.length !== 1 ? "people" : "person"}
              </p>
            </div>
          </div>
          
          {/* Split Step Content - Scrollable */}
          <div className="flex-1 overflow-y-auto">
            <div className="p-6 pb-0">
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
                // Edit mode props
                isEditMode={true}
                onUpdateCost={handleUpdateCost}
              />
            </div>
          </div>
          
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 !mt-0 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full h-[95vh] overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b bg-gray-50">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                <RefreshCw className="w-5 h-5 text-blue-600" />
                Manage {cost.name}
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                ${cost.amount} • {cost.frequency || "monthly"} • {cost.participants.length} people
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          {/* Tabs */}
          <div className="flex gap-4 mt-4">
            <button
              onClick={() => setActiveTab("requests")}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                activeTab === "requests"
                  ? "bg-blue-600 text-white"
                  : "bg-white text-gray-600 hover:bg-gray-100"
              }`}
            >
              Payment Requests
            </button>
            <button
              onClick={() => setShowSplitStep(true)}
              className="bg-blue-100 text-blue-700 px-4 py-2 rounded-lg hover:bg-blue-200 transition-colors flex items-center gap-2"
            >
              <Edit className="w-4 h-4" />
              Edit Split Configuration
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="px-6 pb-6 overflow-y-auto" style={{ height: 'calc(95vh - 200px)' }}>
          <div>
            {/* Next Payment Request */}
            {cost.nextDue && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-blue-900 flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      Next Payment Request
                    </h3>
                    <p className="text-sm text-blue-700 mt-1">
                      Scheduled for {new Date(cost.nextDue).toLocaleDateString()}
                      {isOverdue(cost.nextDue) && (
                        <span className="text-red-600 font-medium ml-2">
                          ({getDaysOverdue(cost.nextDue)} days overdue)
                        </span>
                      )}
                    </p>
                  </div>
                  <button 
                    onClick={handleSendNewRequest}
                    className="bg-blue-600 text-white px-3 py-1 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-1"
                  >
                    <Send className="w-3 h-3" />
                    Send Now
                  </button>
                </div>
              </div>
            )}

            {/* Current Status Overview */}
            <div className="bg-gray-50 border rounded-lg p-4 mt-6">
              <h3 className="font-medium text-gray-900 mb-3">Current Status</h3>
              <div className="flex flex-wrap gap-2">
                {cost.participants.map((participant) => {
                  const user = participants.find((u) => u.id === participant.userId);
                  return (
                    <div
                      key={participant.userId}
                      className={`flex items-center gap-1 px-2 py-1 rounded text-xs ${getPaymentStatusColor(participant.status)}`}
                    >
                      {getPaymentStatusIcon(participant.status)}
                      <span>{user?.name}</span>
                      {participant.paidAt && (
                        <span className="text-xs opacity-75 ml-1">
                          ({new Date(participant.paidAt).toLocaleDateString()})
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Payment History */}
            <div className="mt-6">
              <h3 className="font-medium text-gray-900 mb-4">Payment History</h3>
              {sortedPayments.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Mail className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>No payment requests sent yet.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {sortedPayments.map((payment) => (
                    <div key={payment.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-medium text-gray-900">
                              Payment Request
                            </h4>
                            <span className={getStatusBadge(payment.status)}>
                              {payment.status}
                            </span>
                            {payment.followUpSent && (
                              <div className="flex items-center gap-1 text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded-full">
                                <AlertTriangle className="w-3 h-3" />
                                Follow-up sent
                              </div>
                            )}
                          </div>
                          <p className="text-sm text-gray-600">
                            Sent on {new Date(payment.requestDate).toLocaleDateString()}
                            {payment.dueDate && (
                              <>
                                {" • Due "}
                                {new Date(payment.dueDate).toLocaleDateString()}
                              </>
                            )}
                            {payment.lastReminderSent && (
                              <>
                                {" • Last reminder "}
                                {new Date(payment.lastReminderSent).toLocaleDateString()}
                              </>
                            )}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium text-gray-900">${payment.amount}</p>
                        </div>
                      </div>

                      {/* Participant Status */}
                      <div className="space-y-2">
                        {payment.participants.map((participant) => {
                          const user = participants.find((u) => u.id === participant.userId);
                          const canResend = participant.status === "pending" || participant.status === "overdue";
                          
                          return (
                            <div
                              key={participant.userId}
                              className="flex items-center justify-between p-2 bg-gray-50 rounded"
                            >
                              <div className="flex items-center gap-2">
                                {getPaymentStatusIcon(participant.status)}
                                <span className="font-medium">{user?.name}</span>
                                <span className={`px-2 py-1 text-xs rounded ${getPaymentStatusColor(participant.status)}`}>
                                  {participant.status}
                                </span>
                                <span className="text-sm text-gray-600">${participant.amount}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                {participant.paidDate && (
                                  <span className="text-xs text-gray-600">
                                    Paid {new Date(participant.paidDate).toLocaleDateString()}
                                  </span>
                                )}
                                {participant.status === "overdue" && payment.dueDate && (
                                  <span className="text-xs text-red-600">
                                    {getDaysOverdue(payment.dueDate)} days overdue
                                  </span>
                                )}
                                {participant.remindersSent > 0 && (
                                  <div className="flex items-center gap-1 text-xs text-gray-500">
                                    <MessageCircle className="w-3 h-3" />
                                    {participant.remindersSent} reminder{participant.remindersSent > 1 ? 's' : ''}
                                    {participant.lastReminderDate && (
                                      <span className="ml-1">
                                        (last: {new Date(participant.lastReminderDate).toLocaleDateString()})
                                      </span>
                                    )}
                                  </div>
                                )}
                                {canResend && (
                                  <button
                                    onClick={() => handleResendRequest(payment.id, participant.userId)}
                                    className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded hover:bg-blue-200 transition-colors"
                                  >
                                    Resend
                                  </button>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
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