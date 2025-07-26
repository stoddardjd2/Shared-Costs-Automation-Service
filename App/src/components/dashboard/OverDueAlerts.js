import React, { useState } from "react";
import {
  AlertTriangle,
  Clock,
  X,
  ChevronRight,
  Users,
  DollarSign,
  Calendar,
  Bell,
} from "lucide-react";
import { useData } from "../../contexts/DataContext";
import RequestButton from "./RequestButton";

const OverdueAlerts = () => {
  // Use real data from context
  const { costs, participants } = useData();
  const [isDismissed, setIsDismissed] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  
  const currentDate = new Date();
  // Helper function to check if a participant is overdue
  const isOverdue = (participant, dueDate) => {
    const participantId = participant._id && participant._id.$oid ? participant._id.$oid : participant._id;
    const isPending = participant.status === "pending";
    const isPastDue = currentDate > dueDate;
    return isPending && isPastDue;
  };

  // Flatten all payment requests from all costs' paymentHistory
  const allPaymentRequests = [];
  costs.forEach(cost => {
    if (cost.paymentHistory && Array.isArray(cost.paymentHistory)) {
      cost.paymentHistory.forEach(paymentRequest => {
        allPaymentRequests.push({
          ...paymentRequest,
          costName: cost.name,
          costId: cost._id
        });
      });
    }
  });


  // Find all payment requests with overdue participants
  const overduePaymentRequests = allPaymentRequests.filter((request) => {
    // Handle the MongoDB date structure
    let dueDate;
    if (request.dueDate && request.dueDate.$date) {
      dueDate = new Date(request.dueDate.$date);
    } else if (request.dueDate instanceof Date) {
      dueDate = request.dueDate;
    } else if (typeof request.dueDate === 'string') {
      dueDate = new Date(request.dueDate);
    } else {
      console.warn("Unknown dueDate format:", request.dueDate);
      return false;
    }
    
    
    const hasOverdueParticipants = request.participants.some((participant) => 
      isOverdue(participant, dueDate)
    );
    return hasOverdueParticipants;
  });


  // Calculate total overdue amount and participant count
  const overdueStats = overduePaymentRequests.reduce(
    (stats, request) => {
      let dueDate;
      if (request.dueDate && request.dueDate.$date) {
        dueDate = new Date(request.dueDate.$date);
      } else if (request.dueDate instanceof Date) {
        dueDate = request.dueDate;
      } else if (typeof request.dueDate === 'string') {
        dueDate = new Date(request.dueDate);
      } else {
        dueDate = new Date(request.dueDate);
      }
      
      const overdueParticipants = request.participants.filter(
        (participant) => isOverdue(participant, dueDate)
      );
      const overdueAmount = overdueParticipants.reduce((sum, participant) => {
        return sum + participant.amount;
      }, 0);

      return {
        totalAmount: stats.totalAmount + overdueAmount,
        totalParticipants: stats.totalParticipants + overdueParticipants.length,
        totalRequests: stats.totalRequests + 1,
      };
    },
    { totalAmount: 0, totalParticipants: 0, totalRequests: 0 }
  );

  // Don't render if no overdue requests or component is dismissed
  if (overduePaymentRequests.length === 0 || isDismissed) {
    return (
      <div className="bg-green-50 rounded-2xl shadow-sm border border-green-200/60 p-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
            <Users className="w-4 h-4 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-green-900">All Caught Up!</h3>
            <p className="text-green-700 text-sm">No overdue payments at the moment.</p>
          </div>
        </div>
      </div>
    );
  }

  const handleViewOverdue = () => {
    console.log("Navigate to overdue payments");
    // navigate("/payments?filter=overdue");
  };

  const handleDismiss = () => {
    setIsDismissed(true);
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: date.getFullYear() !== currentDate.getFullYear() ? 'numeric' : undefined
    });
  };

  const getDaysOverdue = (dueDate) => {
    const diffTime = currentDate - dueDate;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200/60 overflow-hidden mb-6">
      {/* Alert Banner */}
      <div className="bg-gradient-to-r from-red-50 to-orange-50 p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-red-500 rounded-lg flex items-center justify-center">
              <AlertTriangle className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-red-900 flex items-center gap-2">
                {overduePaymentRequests.length} Overdue Payment Request
                {overduePaymentRequests.length !== 1 ? "s" : ""}
              </h3>
              <p className="text-red-700 text-sm">
                ${overdueStats.totalAmount.toFixed(2)} from{" "}
                {overdueStats.totalParticipants} participant
                {overdueStats.totalParticipants !== 1 ? "s" : ""}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={handleDismiss}
              className="p-1.5 text-red-600 rounded-lg transition-colors"
              title="Dismiss alert"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 mt-3">
          <RequestButton
            isRequestAll={true}
            className="px-3 py-1.5 text-sm"
            color="red"
          >
            Request All Payments
          </RequestButton>
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="bg-white text-red-600 border border-red-200 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-2 font-medium text-sm"
          >
            {showDetails ? "Hide" : "Show"} Details
          </button>
        </div>
      </div>

      {/* Detailed View */}
      {showDetails && (
        <div className="">
          {overduePaymentRequests.slice(0, 5).map((request) => {
            let dueDate;
            if (request.dueDate && request.dueDate.$date) {
              dueDate = new Date(request.dueDate.$date);
            } else if (request.dueDate instanceof Date) {
              dueDate = request.dueDate;
            } else if (typeof request.dueDate === 'string') {
              dueDate = new Date(request.dueDate);
            } else {
              dueDate = new Date(request.dueDate);
            }
            
            const overdueParticipants = request.participants.filter(
              (participant) => isOverdue(participant, dueDate)
            );
            const overdueAmount = overdueParticipants.reduce(
              (sum, participant) => sum + participant.amount,
              0
            );
            const daysOverdue = getDaysOverdue(dueDate);
            const requestId = request._id && request._id.$oid ? request._id.$oid : request._id;

            return (
              <div
                key={requestId}
                className="p-4 transition-all duration-200 group"
              >
                {/* Header line with request info */}
                <div className="flex items-center justify-between gap-3 mb-2">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <h3 className="text-base font-semibold border-l-4 border-red-500 pl-3 text-red-900">
                      {request.costName} (${request.amount.toFixed(2)})
                    </h3>
                  </div>

                  {/* Due date and overdue info */}
                  <div className="flex items-center gap-2 text-red-700 bg-red-200/60 backdrop-blur-sm px-3 py-1.5 rounded-lg">
                    <Calendar className="w-4 h-4" />
                    <span className="text-sm">
                      Due {formatDate(dueDate)} ({daysOverdue} day{daysOverdue !== 1 ? 's' : ''} overdue)
                    </span>
                  </div>
                </div>

                {/* Amount and count info */}
                <div className="flex justify-start items-start mb-3">
                  <div className="text-left">
                    <div className="flex items-baseline gap-2">
                      <div className="text-lg font-bold text-red-700">
                        ${overdueAmount.toFixed(2)}
                      </div>
                      <span className="text-sm font-medium text-red-600/70">
                        overdue
                      </span>
                    </div>
                    <div className="text-sm text-red-600">
                      {overdueParticipants.length} of {request.participants.length} participants
                    </div>
                  </div>
                </div>

                {/* Overdue Participants List */}
                <div className="space-y-2">
                  {overdueParticipants.map((participant) => {
                    // Extract the actual ID from MongoDB ObjectId structure
                    const participantId = participant._id && participant._id.$oid ? participant._id.$oid : participant._id;
                    
                    // Find the matching user in the participants array
                    const user = participants.find(
                      (u) => u._id === participantId
                    );
                    
                    return (
                      <div
                        key={participantId}
                        className="flex items-center justify-between rounded-lg p-3 border border-red-200/80"
                      >
                        <div className="flex items-center gap-3">
                          {/* User Avatar */}
                          <div
                            className={`w-12 h-12 rounded-lg ${user?.color || 'bg-gray-500'} flex items-center justify-center text-white font-semibold text-sm relative`}
                          >
                            {user?.avatar || participantId.slice(-2).toUpperCase()}
                            {/* Overdue status indicator */}
                            <div className="absolute -bottom-0.5 -right-0.5 bg-red-500 rounded-full w-3 h-3 border border-white shadow-sm"></div>
                          </div>

                          {/* User Info */}
                          <div>
                            <div className="font-semibold text-red-900 text-sm">
                              {user?.name || `User ${participantId.slice(-4)}`}
                            </div>
                            <div className="text-xs text-red-700 font-medium">
                              Owes ${participant.amount.toFixed(2)}
                            </div>
                            {participant.reminderSent && (
                              <div className="text-xs text-red-600 flex items-center gap-1">
                                <Bell className="w-3 h-3" />
                                Reminder sent {participant.lastReminderDate && participant.lastReminderDate.$date ? formatDate(new Date(participant.lastReminderDate.$date)) : ''}
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Resend Button */}
                        <RequestButton
                          costId={request.costId && request.costId.$oid ? request.costId.$oid : request.costId}
                          participantUserId={participantId}
                          className="text-sm px-3 py-2 flex-shrink-0"
                          color="red"
                        >
                          Resend
                        </RequestButton>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}

          {overduePaymentRequests.length > 5 && (
            <div className="p-4 bg-red-100/40 border-t border-red-200/60">
              <div className="text-center">
                <button
                  onClick={handleViewOverdue}
                  className="text-red-700 hover:text-red-800 hover:bg-red-200/50 px-3 py-1.5 rounded-lg font-medium transition-all duration-200 text-sm"
                >
                  View all {overduePaymentRequests.length} overdue payment requests →
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default OverdueAlerts;