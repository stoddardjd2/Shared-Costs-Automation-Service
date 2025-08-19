import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Link, RefreshCw, Users } from "lucide-react";
import RecurringCostsSection from "./RecurringCostsSection";
import OverdueAlerts from "./OverDueAlerts";
import LoadingWrapper from "../../utils/LoadingWrapper";
import Navbar from "./Navbar";
import { getUserData } from "../../queries/user";
import { getRequests } from "../../queries/requests";
import { useData } from "../../contexts/DataContext";
import AddCost from "../costs/AddCost";
import ManageRecurringCostModal from "./ManageRecurringCostModal";
import PaymentMethodPrompt from "./PaymentMethodPrompt";
const Dashboard = () => {
  const navigate = useNavigate();
  const {
    participants,
    costs,
    bankTransactions,
    plaidAccessToken,
    isLoadingTransactions,
    connectPlaid,
    setCosts,
    userData,
    paymentMethods,
  } = useData();

  const [isLoadingDashboard, setIsLoadingDashboard] = useState(true);
  const [isAddingRequest, setIsAddingRequest] = useState(false);
  const [view, setView] = useState("dashboard");
  const [selectedCost, setSelectedCost] = useState(null);

  const handleCloseModal = () => {
    // setShowManageModal(false);
    setView("dashboard")
    setSelectedCost(null);
  };

  useEffect(() => {
    setTimeout(() => {
      setIsLoadingDashboard(false);
    }, 200);
  });

  function getView() {
    switch (view) {
      case "addRequest":
        return (
          <div className="mt-6 ">
            <AddCost
              setView={setView}
              setIsAddingRequest={setIsAddingRequest}
            />
          </div>
        );

      case "requestDetails":
        return (
          <ManageRecurringCostModal
            cost={selectedCost}
            setSelectedCost={setSelectedCost}
            onClose={handleCloseModal}
          />
        );

      case "dashboard":
      default:
        return (
          <div className="mx-auto px-4 sm:px-6 py-0 pb-24">
            {/* Header section - matching SplitStep structure */}
            <div className="flex items-center justify-between gap-4 mb-6 mt-8">
              <div className="flex-1 min-w-0">
                <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
                <p className="text-gray-600">Manage your requests</p>
              </div>
              <button
                // onClick={() => navigate("/costs/new")}
                onClick={() => {
                  setView("addRequest");
                }}
                className="bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 flex-shrink-0"
              >
                <Plus className="w-5 h-5" />
                <span className="hidden sm:inline">New Request</span>
                <span className="sm:hidden">New</span>
              </button>
            </div>

            {/* Main Dashboard Sections */}
            <div className="space-y-6">
              {paymentMethods?.cashapp && paymentMethods?.venmo ? (
                ""
              ) : (
                <PaymentMethodPrompt />
              )}

              {costs.length !== 0 && <OverdueAlerts />}
              <RecurringCostsSection setView={setView} setSelectedCost={setSelectedCost} setIsAddingRequest={setIsAddingRequest} />
              {/* <RecurringCostsFromBank recurringFromBank={recurringFromBank} /> */}
              {/* <OneTimeCosts oneTimeCosts={oneTimeCosts} /> */}
            </div>
          </div>
        );
    }
  }

  return (
    <LoadingWrapper loading={isLoadingDashboard}>
      <div className="relative ">{getView()}</div>
    </LoadingWrapper>
  );
};

export default Dashboard;
