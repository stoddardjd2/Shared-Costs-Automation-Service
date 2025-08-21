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
import PaymentHistoryParticipantDetails from "./PaymentHistoryParticipantDetails";

const OverdueAlerts = () => {
  // Use real data from context
  const { costs, participants } = useData();
  const [isDismissed, setIsDismissed] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [viewOverdueRequestsLimit, setViewOverdueRequestsLimit] = useState(5);
  const currentDate = new Date();
  // Helper function to check if a participant is overdue
  const isOverdue = (participant, dueDate) => {
    const participantId =
      participant._id && participant._id.$oid
        ? participant._id.$oid
        : participant._id;

    const isPastDue = currentDate > dueDate;
    return isPastDue && !participant?.paidDate;
  };

  // Flatten all payment requests from all costs' paymentHistory
  const allPaymentRequests = [];
  costs.forEach((cost) => {
    if (cost.paymentHistory && Array.isArray(cost.paymentHistory)) {
      cost.paymentHistory.forEach((paymentRequest) => {
        allPaymentRequests.push({
          ...paymentRequest,
          costName: cost.name,
          costId: cost._id,
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
    } else if (typeof request.dueDate === "string") {
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
      } else if (typeof request.dueDate === "string") {
        dueDate = new Date(request.dueDate);
      } else {
        dueDate = new Date(request.dueDate);
      }

      const overdueParticipants = request.participants.filter((participant) =>
        isOverdue(participant, dueDate)
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

  if (isDismissed) {
    return;
  }
  // Don't render if no overdue requests or component is dismissed
  if (overduePaymentRequests.length === 0) {
    return (
      <div
        style={{
          background:
            "linear-gradient(135deg, rgb(16, 185, 129) 0%, rgb(5, 150, 105) 100%)",
        }}
        className="rounded-2xl shadow-sm border border-green-200/60 p-4 mb-6"
      >
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-white/20 grid place-items-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="w-6 h-6 text-white"
            >
              <path
                fillRule="evenodd"
                d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm13.36-1.814a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z"
                clipRule="evenodd"
              ></path>
            </svg>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">All Caught Up!</h3>
            <p className="text-white/80 text-sm">
              No overdue payments at the moment.
            </p>
          </div>
        </div>
      </div>
      // <div className="bg-green-50 rounded-2xl shadow-sm border border-green-200/60 p-4 mb-6">
      //   <div className="flex items-center gap-3">
      //     <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
      //       <Users className="w-4 h-4 text-white" />
      //     </div>
      //     <div>
      //       <h3 className="text-lg font-semibold text-green-900">All Caught Up!</h3>
      //       <p className="text-green-700 text-sm">No overdue payments at the moment.</p>
      //     </div>
      //   </div>
      // </div>
    );
  }

  const handleDismiss = () => {
    setIsDismissed(true);
  };

  const formatDate = (date) => {
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
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
      <div
        style={{
          background:
            "linear-gradient(135deg, rgb(220 38 38) 0%, rgb(200 20 22) 100%)",
        }}
        className="bg-gradient-to-r from-red-50 to-orange-50 p-5 relative"
      >
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-red-500 rounded-lg flex items-center justify-center">
              <AlertTriangle className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                {overduePaymentRequests.length} Overdue Payment Request
                {overduePaymentRequests.length !== 1 ? "s" : ""}
              </h3>
              <p className="text-white/80 text-sm">
                ${overdueStats.totalAmount.toFixed(2)} from{" "}
                {overdueStats.totalParticipants} participant
                {overdueStats.totalParticipants !== 1 ? "s" : ""}
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 mt-3">
          {/* <RequestButton
            isRequestAll={true}
            className="px-3 py-1.5 text-sm bg-white/10 border border-white/30"
          >
            Request All Payments
          </RequestButton> */}

          <button
            onClick={() => setShowDetails(!showDetails)}
            className="bg-white/15 hover:bg-white/25 border border-white/30 text-white px-6 py-3 rounded-xl text-sm font-semibold cursor-pointer transition-all duration-300 flex items-center gap-2 backdrop-blur-md translate-y-0 hover:-translate-y-0.5 shadow-none hover:shadow-lg hover:shadow-black/10"
          >
            {showDetails ? "Hide" : "Show"} Details
          </button>
        </div>

        <button
          onClick={handleDismiss}
          className="absolute top-4 right-4 bg-white/20 border-none text-white w-8 h-8 rounded-lg cursor-pointer text-base transition-all duration-200 z-[3]"
          title="Dismiss alert"
          onMouseEnter={(e) =>
            (e.target.style.background = "rgba(255, 255, 255, 0.3)")
          }
          onMouseLeave={(e) =>
            (e.target.style.background = "rgba(255, 255, 255, 0.2)")
          }
        >
          ×
        </button>
      </div>

      {/* Detailed View */}
      {showDetails && (
        <div className="">
          {overduePaymentRequests
            .slice(0, viewOverdueRequestsLimit)
            .map((request) => {
              let dueDate;
              if (request.dueDate && request.dueDate.$date) {
                dueDate = new Date(request.dueDate.$date);
              } else if (request.dueDate instanceof Date) {
                dueDate = request.dueDate;
              } else if (typeof request.dueDate === "string") {
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
              const requestId =
                request._id && request._id.$oid
                  ? request._id.$oid
                  : request._id;

              // const paymentHistoryId = overduePaymentRequests

              return (
                <div
                  key={requestId}
                  className="p-4 transition-all duration-200 group"
                >
                  {/* Header line with request info */}
                  <div className="flex items-center justify-between gap-3 mb-2">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <h3 className="text-lg font-semibold border-l-4 border-red-500 pl-3 ">
                        {request.costName}
                      </h3>
                    </div>

                    {/* Due date and overdue info */}
                    <div className="flex items-center gap-2 text-black bg-gray-100/7a0 backdrop-blur-sm px-3 py-1.5 rounded-lg">
                      <Calendar className="w-4 h-4" />
                      <span className="text-sm">
                        Due {formatDate(dueDate)} ({daysOverdue} day
                        {daysOverdue !== 1 ? "s" : ""} overdue)
                      </span>
                    </div>
                  </div>

                  {/* Amount and count info */}
                  <div className="flex justify-start items-start mb-3">
                    <div className="text-left">
                      <div className="flex items-baseline gap-2">
                        <div className="text-lg font-bold text-black">
                          ${overdueAmount.toFixed(2)}
                        </div>{" "}
                        Total
                        {/* <span className="text-sm font-medium text-black/70">
                        overdue
                      </span> */}
                      </div>
                      {overdueParticipants.length !== 1 && <div className="text-sm">
                        {overdueParticipants.length} of{" "}
                        {request.participants.length} participants
                      </div>}
                    </div>
                  </div>

                  {/* Overdue Participants List */}
                  <div className="space-y-2">
                    {overdueParticipants.map((participant) => {
                      // Extract the actual ID from MongoDB ObjectId structure
                      const participantId =
                        participant._id && participant._id.$oid
                          ? participant._id.$oid
                          : participant._id;

                      // Find the matching user in the participants array
                      const user = participants.find(
                        (u) => u._id === participantId
                      );
                      return (
                        <PaymentHistoryParticipantDetails
                          costId={request.costId}
                          participant={participant}
                          paymentHistoryRequest={request}
                          user={user}
                        />
                        // <div
                        //   key={participantId}
                        //   className="flex items-center justify-between rounded-lg p-3 border "
                        // >
                        //   <div className="flex items-center gap-3">
                        //     {/* User Avatar */}
                        //     <div
                        //       className={`w-12 h-12 rounded-lg ${
                        //         user?.color || "bg-gray-500"
                        //       } flex items-center justify-center text-white font-semibold text-sm relative`}
                        //     >
                        //       {user?.avatar ||
                        //         participantId.slice(-2).toUpperCase()}
                        //       {/* Overdue status indicator */}
                        //       {/* <div className="absolute -bottom-0.5 -right-0.5 bg-red-500 rounded-full w-3 h-3 border border-white shadow-sm"></div> */}
                        //     </div>

                        //     {/* User Info */}
                        //     <div>
                        //       <div className="font-semibold text-sm">
                        //         {user?.name ||
                        //           `User ${participantId.slice(-4)}`}
                        //       </div>
                        //       <div className="text-xs font-medium">
                        //         Owes ${participant.amount.toFixed(2)}
                        //       </div>
                        //       {participant.reminderSent ? (
                        //         <div className="text-xs flex items-center text-black/70 gap-1">
                        //           <Bell className="w-3 h-3" />
                        //           Reminder sent on{" "}
                        //           {participant.reminderSent
                        //             ? formatDate(
                        //                 new Date(participant.reminderSentDate)
                        //               )
                        //             : ""}
                        //         </div>
                        //       ) : (
                        //         <div className="text-xs flex items-center text-black/70 gap-1">
                        //           <Bell className="w-3 h-3" /> No Reminders Sent
                        //         </div>
                        //       )}
                        //     </div>
                        //   </div>

                        //   {/* Resend Button */}
                        //   <RequestButton
                        //     className="px-3 py-1.5 text-sm !bg-blue-600 text-white border border-white/30 !hover:bg-blue-600/25"
                        //     costId={
                        //       request.costId && request.costId.$oid
                        //         ? request.costId.$oid
                        //         : request.costId
                        //     }
                        //     participantUserId={participantId}
                        //     paymentHistoryId={request._id}
                        //     reminderSentDate={participant.reminderSentDate}
                        //     paymentHistoryRequest={request}
                        //     participant={participant}
                        //   >
                        //     Resend
                        //   </RequestButton>
                        // </div>
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
                  onClick={() => {
                    if (
                      viewOverdueRequestsLimit < overduePaymentRequests.length
                    ) {
                      setViewOverdueRequestsLimit(
                        overduePaymentRequests.length + 1
                      );
                    } else {
                      setViewOverdueRequestsLimit(5);
                    }
                  }}
                  className="text-red-700 hover:text-red-800 hover:bg-red-200/50 px-3 py-1.5 rounded-lg font-medium transition-all duration-200 text-sm"
                >
                  View all {overduePaymentRequests.length} overdue payment
                  requests →
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
