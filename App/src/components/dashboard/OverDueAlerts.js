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

  // Find all costs with overdue participants
  const overdueCosts = costs.filter((cost) =>
    cost.participants.some((participant) => participant.status === "overdue")
  );

  // Calculate total overdue amount and participant count
  const overdueStats = overdueCosts.reduce(
    (stats, cost) => {
      const overdueParticipants = cost.participants.filter(
        (p) => p.status === "overdue"
      );
      const overdueAmount = overdueParticipants.reduce((sum, participant) => {
        return (
          sum + (participant.amount || cost.amount / cost.participants.length)
        );
      }, 0);

      return {
        totalAmount: stats.totalAmount + overdueAmount,
        totalParticipants: stats.totalParticipants + overdueParticipants.length,
        totalCosts: stats.totalCosts + 1,
      };
    },
    { totalAmount: 0, totalParticipants: 0, totalCosts: 0 }
  );

  // Don't render if no overdue costs or component is dismissed
  if (overdueCosts.length === 0 || isDismissed) {
    return null;
  }

  const handleViewOverdue = () => {
    // In real implementation, this would navigate to payments page with overdue filter
    console.log("Navigate to overdue payments");
    // navigate("/payments?filter=overdue");
  };

  const handleDismiss = () => {
    setIsDismissed(true);
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200/60 overflow-hidden mb-6">
      {/* Alert Banner - Smaller */}
      <div className="bg-gradient-to-r from-red-50 to-orange-50 p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-red-500 rounded-lg flex items-center justify-center">
              <AlertTriangle className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-red-900 flex items-center gap-2">
                {overdueCosts.length} Overdue Payment
                {overdueCosts.length !== 1 ? "s" : ""}
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
              className="p-1.5 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
              title="Dismiss alert"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Action Buttons - Smaller */}
        <div className="flex gap-2 mt-3">
          <RequestButton isRequestAll={true} className="px-3 py-1.5 text-sm">
            Request All Payments
          </RequestButton>
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="bg-white text-red-600 border border-red-200 px-3 py-1.5 rounded-lg hover:bg-red-50 transition-colors flex items-center gap-2 font-medium text-sm"
          >
            {showDetails ? "Hide" : "Show"} Details
          </button>
        </div>
      </div>

      {/* Detailed View - More Compact */}
      {showDetails && (
        <div className="bg-gradient-to-r from-red-50 to-orange-50 divide-y divide-red-100/60">
          {overdueCosts.slice(0, 5).map((cost) => {
            const overdueParticipants = cost.participants.filter(
              (p) => p.status === "overdue"
            );
            const overdueAmount = overdueParticipants.reduce(
              (sum, participant) => {
                return (
                  sum +
                  (participant.amount || cost.amount / cost.participants.length)
                );
              },
              0
            );

            return (
              <div
                key={cost.id}
                className="p-4 hover:bg-red-100/30 transition-all duration-200 group"
              >
                {/* Header line with cost name */}
                <div className="flex items-center justify-between gap-3 mb-2">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <h3 className="text-base font-semibold border-l-4 border-red-500 pl-3 text-red-900">
                      {cost.name}
                    </h3>
                  </div>

                  {/* Due date */}
                  {cost.nextDue && (
                    <div className="flex items-center gap-2 text-red-700 bg-red-200/60 backdrop-blur-sm px-3 py-1.5 rounded-lg">
                      <Calendar className="w-4 h-4" />
                      <span className="text-sm">
                        Overdue: {new Date(cost.nextDue).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                </div>

                {/* Participants and status info */}
                <div className="flex justify-start items-start mb-3">
                  {/* Overdue amount */}
                  <div className="text-left">
                    <div className="flex items-baseline gap-2">
                      <div className="text-lg font-bold text-red-700">
                        ${overdueAmount.toFixed(2)}
                      </div>

                      <span class="text-sm font-medium text-red-600/70">
                        total
                      </span>
                    </div>
                    <div className="text-sm text-red-600">
                      {overdueParticipants.length} overdue
                    </div>
                  </div>
                </div>

                {/* Overdue Participants List */}
                <div className="space-y-2">
                  {overdueParticipants.map((participant) => {
                    const user = participants.find(
                      (u) => u.id === participant.userId
                    );
                    const participantAmount =
                      participant.amount ||
                      cost.amount / cost.participants.length;

                    return (
                      <div
                        key={participant.userId}
                        className="flex items-center justify-between bg-red-100/60 rounded-lg p-3 border border-red-200/80"
                      >
                        <div className="flex items-center gap-3">
                          {/* User Avatar */}
                          <div
                            className={`w-8 h-8 rounded-lg ${user?.color} flex items-center justify-center text-white font-semibold text-sm relative`}
                          >
                            {user?.avatar}
                            {/* Overdue status indicator */}
                            <div className="absolute -bottom-0.5 -right-0.5 bg-red-500 rounded-full w-3 h-3 border border-white shadow-sm"></div>
                          </div>

                          {/* User Info */}
                          <div>
                            <div className="font-medium text-red-900 text-sm">
                              {user?.name}
                            </div>
                            <div className="text-xs text-red-700 font-medium">
                              Owes ${participantAmount.toFixed(2)}
                            </div>
                          </div>
                        </div>

                        {/* Resend Button */}
                        <RequestButton
                          costId={cost.id}
                          participantUserId={participant.userId}
                          className="text-sm px-3 py-2 flex-shrink-0"
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

          {overdueCosts.length > 5 && (
            <div className="p-4 bg-red-100/40 border-t border-red-200/60">
              <div className="text-center">
                <button
                  onClick={handleViewOverdue}
                  className="text-red-700 hover:text-red-800 hover:bg-red-200/50 px-3 py-1.5 rounded-lg font-medium transition-all duration-200 text-sm"
                >
                  View all {overdueCosts.length} overdue payments →
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
