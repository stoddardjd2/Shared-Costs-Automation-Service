import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  RefreshCw,
  Plus,
  Settings,
  Calendar,
  CheckCircle,
  Clock,
  XCircle,
  Link,
} from "lucide-react";
import { useData } from "../../contexts/DataContext";
import {
  getFrequencyColor,
  getNextDueStatus,
  getPaymentStatusColor,
} from "../../utils/helpers";
import ManageRecurringCostModal from "./ManageRecurringCostModal";

const RecurringCostsSection = () => {
  const { costs, participants, updateCost } = useData();
  const navigate = useNavigate();
  const [selectedCost, setSelectedCost] = useState(null);
  const [showManageModal, setShowManageModal] = useState(false);

  const recurringCosts = costs.filter((cost) => cost.isRecurring);

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
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case "pending":
        return <Clock className="w-4 h-4 text-yellow-600" />;
      case "overdue":
        return <XCircle className="w-4 h-4 text-red-600" />;
      default:
        return <Clock className="w-4 h-4 text-gray-400" />;
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
      <div className="bg-white rounded-xl shadow-sm border">
        <div className="p-6 border-b">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                <RefreshCw className="w-5 h-5 text-blue-600" />
                Reoccuring Payment Requests
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                Manage payment requests
              </p>
            </div>
            {/* <div className="text-right">
              <p className="text-sm text-gray-600">Total Monthly</p>
              <p className="text-2xl font-bold text-green-600">
                ${getTotalMonthlyRecurring().toFixed(2)}
              </p>
            </div> */}
          </div>
        </div>

        {recurringCosts.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <RefreshCw className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p className="mb-2">No recurring costs set up yet.</p>
            <p className="text-sm mb-4">
              Start tracking your subscriptions and regular expenses.
            </p>
            <button
              onClick={() => navigate("/costs/new")}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Add Recurring Cost
            </button>
          </div>
        ) : (
          <div className="divide-y">
            {recurringCosts.map((cost) => {
              const totalParticipants = cost.participants.length;
              const dueStatus = getNextDueStatus(cost.nextDue);

              return (
                <div
                  key={cost.id}
                  className="p-6 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-gray-900">
                          {cost.name}
                        </h3>
                        <span
                          className={`px-2 py-1 text-xs rounded-full ${getFrequencyColor(
                            cost.frequency
                          )}`}
                        >
                          {cost.frequency || "monthly"}
                        </span>
                      </div>

                      <div className="flex items-center gap-4 mb-2">
                        <p className="text-sm text-gray-600">
                          <span className="font-medium">${cost.amount}</span> •{" "}
                          {totalParticipants} people
                        </p>
                        {cost.nextDue && (
                          <div className="flex items-center gap-1">
                            <Calendar className="w-3 h-3 text-gray-400" />
                            <span className="text-xs text-gray-600">
                              Next Payment Request:{" "}
                              {new Date(cost.nextDue).toLocaleDateString()}
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-2 flex-wrap">
                        {cost.participants.map((participant) => {
                          const user = participants.find(
                            (u) => u.id === participant.userId
                          );
                          return (
                            <div
                              key={participant.userId}
                              className={`flex items-center gap-1 px-2 py-1 rounded text-xs ${getPaymentStatusColor(
                                participant.status
                              )}`}
                            >
                              {getPaymentStatusIcon(participant.status)}
                              <span>{user?.name}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleManageCost(cost)}
                        className="bg-blue-600 text-white px-3 py-1 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-1"
                      >
                        <Settings className="w-3 h-3" />
                        Manage
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {recurringCosts.length > 0 && (
          <div className="p-4 bg-gray-50 border-t">
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-600">
                {recurringCosts.length} recurring{" "}
                {recurringCosts.length === 1 ? "cost" : "costs"} tracked
              </span>
              <button
                onClick={() => navigate("/costs/new")}
                className="text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
              >
                <Plus className="w-4 h-4" />
                Add Recurring Cost
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
