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

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  RefreshCw,
  Plus,
  Settings,
  Calendar,
  Link,
  MoreVertical,
  TrendingUp,
  Info,
  RotateCcw,
  Users,
} from "lucide-react";
import { useData } from "../../contexts/DataContext";
import { getFrequencyColor, getNextDueStatus } from "../../utils/helpers";
import ManageRecurringCostModal from "./ManageRecurringCostModal";

const RecurringCostsSection = () => {
  const { costs, participants, updateCost } = useData();
  const navigate = useNavigate();
  const [selectedCost, setSelectedCost] = useState(null);
  const [showManageModal, setShowManageModal] = useState(false);
  const [showCostTooltip, setShowCostTooltip] = useState(false);
  const [hoveredCostId, setHoveredCostId] = useState(null);

  const recurringCosts = costs.filter((cost) => cost.isRecurring);

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

  // Format billing frequency for display (adapted from tray)
  const formatBillingFrequency = (frequency) => {
    if (!frequency || frequency === "monthly") {
      return "Monthly requests";
    }
    if (frequency === "weekly") {
      return "Weekly requests";
    }
    if (frequency === "quarterly") {
      return "Quarterly requests";
    }
    if (frequency === "yearly") {
      return "Yearly requests";
    }
    return `${frequency} requests`;
  };

  // Get status color for solid indicator
  const getStatusColor = (status) => {
    switch (status) {
      case "paid":
        return "bg-green-500";
      case "pending":
        return "bg-orange-500";
      case "overdue":
        return "bg-red-500";
      default:
        return null;
    }
  };

  const getTotalMonthlyRecurring = () => {
    return recurringCosts.reduce((total, cost) => {
      let monthlyAmount = cost.amount;
      switch (cost.frequency) {
        case "weekly":
          monthlyAmount = cost.amount * 4.33;
          break;
        case "quarterly":
          monthlyAmount = cost.amount / 3;
          break;
        case "yearly":
          monthlyAmount = cost.amount / 12;
          break;
        default:
          monthlyAmount = cost.amount;
      }
      return total + monthlyAmount;
    }, 0);
  };

  const getPaymentStatusIcon = (status) => {
    switch (status) {
      case "paid":
        return <CheckCircle className="w-2.5 h-2.5 text-white" />;
      case "pending":
        return <Clock className="w-2.5 h-2.5 text-white" />;
      case "overdue":
        return <XCircle className="w-2.5 h-2.5 text-white" />;
      default:
        return <Clock className="w-2.5 h-2.5 text-white" />;
    }
  };

  // Get status indicator background color
  const getStatusIndicatorColor = (status) => {
    switch (status) {
      case "paid":
        return "bg-emerald-500";
      case "pending":
        return "bg-amber-500";
      case "overdue":
        return "bg-red-500";
      default:
        return "bg-slate-400";
    }
  };

  const handleManageCost = (cost) => {
    setSelectedCost(cost);
    setShowManageModal(true);
  };

  const handleCloseModal = () => {
    setShowManageModal(false);
    setSelectedCost(null);
  };

  return (
    <>
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200/60 overflow-hidden">
        <div className="p-6 border-b border-slate-100 to-white">
          <div className="flex justify-between items-center">
            {/* <div>
              <h2 className="text-xl font-semibold text-slate-900 flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center">
                  <RefreshCw className="w-5 h-5 text-white" />
                </div>
                Recurring Payment Requests
              </h2>
              <p className="text-sm text-slate-600 mt-2 ml-13">
                Manage your ongoing payment requests and subscriptions
              </p>
            </div> */}

            <div className="flex items-center gap-3 ">
              <div className="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center">
                <RefreshCw className="w-5 h-5 text-white" />
              </div>
              <div className="text-left">
                <h2 className="text-xl font-semibold text-slate-900 flex items-center gap-3">
                  Recurring Payment Requests
                </h2>
                <p className="text-gray-600 text-sm">
                  Manage your ongoing payment requests
                </p>
              </div>
            </div>
            {/* <ArrowLeft className="w-5 h-5 text-gray-500 rotate-180" /> */}
          </div>
        </div>

        {recurringCosts.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-20 h-20 bg-slate-100 rounded-2xl mx-auto mb-6 flex items-center justify-center">
              <RefreshCw className="w-10 h-10 text-slate-400" />
            </div>
            <h3 className="text-lg font-medium text-slate-900 mb-2">
              No recurring costs yet
            </h3>
            <p className="text-slate-600 mb-6 max-w-sm mx-auto">
              Start tracking your subscriptions and regular expenses to stay on
              top of your finances.
            </p>
            <button
              onClick={() => navigate("/costs/new")}
              className="bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 transition-all duration-200 transform hover:scale-105 font-medium shadow-sm"
            >
              <Plus className="w-4 h-4 inline mr-2" />
              Add Recurring Cost
            </button>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {recurringCosts.map((cost) => {
              const totalParticipants = cost.participants.length;
              const dueStatus = getNextDueStatus(cost.nextDue);

              return (
                <div
                  key={cost.id}
                  className="p-6 hover:bg-slate-50/50 transition-all duration-200 group"
                >
                  {/* Header line with cost name and manage button */}
                  <div className="flex items-center justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      {/* <h3 className="text-lg font-semibold border-l-4 border-blue-600 pl-3">
                        {cost.name}
                      </h3> */}

                      {cost.isDynamic ? (
                        <h3 className="text-lg font-semibold border-l-4 border-blue-600 pl-3 bg-gradient-to-r from-orange-300 via-orange-600 to-orange-600 bg-clip-text text-transparent animate-gradient">
                          {cost.name}
                        </h3>
                      ) : (
                        <h3 className="text-lg font-semibold border-l-4 border-blue-600 pl-3">
                          {cost.name}
                        </h3>
                      )}
                    </div>

                    {/* Manage button */}
                    <button
                      onClick={() => handleManageCost(cost)}
                      className="opacity-60 hover:opacity-100 text-slate-600 hover:text-slate-900 hover:bg-slate-100 p-2 rounded-lg transition-all duration-200 group-hover:opacity-80 shrink-0"
                      title="Manage recurring cost"
                    >
                      <MoreVertical className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Price and People section - full width */}
                  <div className="flex justify-between items-start mb-4">
                    {/* Price section */}
                    <div className="flex-shrink-0">
                      <div className="flex items-center gap-3 mb-2">
                        <div>
                          <div className="flex items-baseline gap-2">
                            <span className="text-lg font-bold text-gray-900">
                              {formatAmountDisplay(cost).amount}
                            </span>
                            <span className="text-sm font-medium text-gray-500">
                              {formatAmountDisplay(cost).label}
                            </span>
                          </div>
                        </div>

                        {/* Dynamic cost tracking badge */}
                        {cost.isDynamic && (
                          <div className="relative">
                            <div
                              className="flex items-center justify-center bg-gray-100 px-2 py-1 rounded-lg hover:bg-gray-200 transition-colors cursor-pointer relative"
                              onMouseEnter={() => setHoveredCostId(cost.id)}
                              onMouseLeave={() => setHoveredCostId(null)}
                            >
                              <TrendingUp className="w-6 h-6 text-orange-500" />
                              <Info className="w-4 h-4 text-gray-500 absolute -top-2 -right-2" />
                            </div>

                            {/* Tooltip - only show for the specific hovered cost */}
                            {hoveredCostId === cost.id && (
                              <div className="absolute bottom-full left-0 mb-2 w-64 bg-gray-900 text-white text-xs rounded-lg p-3 shadow-lg z-50">
                                <p className="mb-2">
                                  <strong>Dynamic Costs:</strong> Track when
                                  amounts change between payment cycles
                                </p>
                                <p>
                                  Dynamic costs are useful for any recurring cost that
                                  varies each period, like utilities
                                </p>
                                <div className="absolute top-full left-2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-gray-900"></div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <RotateCcw className="w-3 h-3 text-blue-500" />
                        <span>{formatBillingFrequency(cost.frequency)}</span>
                      </div>
                    </div>

                    {/* Next due date */}
                    {cost.nextDue && (
                      <div className="flex items-center gap-2 text-gray-600 bg-gray-100/80 backdrop-blur-sm px-3 py-1.5 rounded-lg w-fit">
                        <Calendar className="w-4 h-4" />
                        <span className="text-sm">
                          Next: {new Date(cost.nextDue).toLocaleDateString()}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* People display section */}
                  <div className="flex justify-start">
                    <div className="flex items-center gap-3">
                      <div className="flex -space-x-2">
                        {cost.participants
                          .slice(0, 5)
                          .map((participant, index) => {
                            const user = participants.find(
                              (u) => u.id === participant.userId
                            );
                            const { avatar } = getUserAvatar(user);
                            const statusColor = getStatusColor(
                              participant.status
                            );

                            return (
                              <div
                                key={participant.userId}
                                className={`w-9 h-9 rounded-xl ${user?.color} flex items-center justify-center text-white font-semibold text-xs border-2 border-white shadow-sm relative group/avatar hover:translate-x-1 transition-transform duration-200`}
                                style={{
                                  zIndex: cost.participants.length - index,
                                }}
                              >
                                {avatar}

                                {/* Solid color status indicator */}
                                {statusColor && (
                                  <div
                                    className={`absolute -bottom-0.5 -right-0.5 ${statusColor} rounded-full w-3 h-3 border border-white shadow-sm`}
                                  ></div>
                                )}

                                {/* Tooltip */}
                                <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs py-2 px-3 rounded-lg opacity-0 group-hover/avatar:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
                                  {user?.name}
                                  <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-2 h-2 bg-gray-900 rotate-45"></div>
                                </div>
                              </div>
                            );
                          })}
                        {cost.participants.length > 5 && (
                          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-gray-400 to-gray-500 flex items-center justify-center text-white font-semibold text-xs border-2 border-white shadow-sm relative group/avatar hover:translate-x-1 transition-transform duration-200">
                            +{cost.participants.length - 5}
                            {/* Tooltip for overflow count */}
                            <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs py-2 px-3 rounded-lg opacity-0 group-hover/avatar:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
                              {cost.participants.length - 5} more{" "}
                              {cost.participants.length - 5 === 1
                                ? "person"
                                : "people"}
                              <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-2 h-2 bg-gray-900 rotate-45"></div>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* People count indicator */}
                      <div className="flex items-center gap-1 text-sm text-gray-600 bg-gray-100 px-2 py-1 rounded-lg">
                        <Users className="w-4 h-4" />
                        <span className="font-medium">{totalParticipants}</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {recurringCosts.length > 0 && (
          <div className="p-6 bg-slate-50/30 border-t border-slate-100">
            <div className="flex justify-between items-center">
              <div className="text-sm text-slate-600">
                <span className="font-medium">{recurringCosts.length}</span>{" "}
                reocurring{" "}
                {recurringCosts.length === 1
                  ? "payment request"
                  : "payments requests"}{" "}
              </div>
              <button
                onClick={() => navigate("/costs/new")}
                className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-all duration-200"
              >
                <Plus className="w-4 h-4" />
                New Request
              </button>
            </div>
          </div>
        )}
      </div>

      {showManageModal && selectedCost && (
        <ManageRecurringCostModal
          cost={selectedCost}
          onClose={handleCloseModal}
        />
      )}
    </>
  );
};

export default RecurringCostsSection;
