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
  } = useData();

  const [isLoadingDashboard, setIsLoadingDashboard] = useState(true);
  const [isAddingRequest, setIsAddingRequest] = useState(false);

  // get payment requests for user and save as costs (on a secure route)

  // backend
  // create schema for requests
  // access request under new route as should be seperate from users since next-
  // backend for automatic requests will not care about who the user is
  useEffect(() => {
    setTimeout(() => {
      setIsLoadingDashboard(false);
    }, 200);
  });

  return (
    <LoadingWrapper loading={isLoadingDashboard}>
      {/* <Navbar /> */}
      <div className="relative">
        {/* Main content container with mobile-friendly padding matching SplitStep */}
        {!isAddingRequest ? (
          <div className="mx-auto px-6 py-0 pb-24">
            {/* Header section - matching SplitStep structure */}
            <div className="flex items-center justify-between gap-4 mb-6 mt-8">
              <div className="flex-1 min-w-0">
                <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
                <p className="text-gray-600">Manage your payment requests</p>
              </div>
              <button
                // onClick={() => navigate("/costs/new")}
                onClick={() => {
                  setIsAddingRequest(true);
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
              <OverdueAlerts />
              <RecurringCostsSection setIsAddingRequest={setIsAddingRequest} />

              {/* <RecurringCostsFromBank recurringFromBank={recurringFromBank} /> */}
              {/* <OneTimeCosts oneTimeCosts={oneTimeCosts} /> */}
            </div>
          </div>
        ) : (
          <div className="mt-6 ">
            <AddCost setIsAddingRequest={setIsAddingRequest} />
          </div>
        )}
      </div>
    </LoadingWrapper>
  );
};

export default Dashboard;
