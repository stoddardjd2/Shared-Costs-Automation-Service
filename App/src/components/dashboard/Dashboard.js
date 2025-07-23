import React from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Link, RefreshCw, Users } from "lucide-react";
import { useData } from "../../contexts/DataContext";
import RecurringCostsSection from "./RecurringCostsSection";
import OverchargeAlerts from "./OverchargeAlerts";
import BankConnectionPrompt from "./BankConnectionPrompt";
import RecurringCostsFromBank from "./RecurringCostsFromBank";
import OneTimeCosts from "./OneTimeCosts";
import { detectOvercharge } from "../../utils/helpers";
import { DataContext } from "../../contexts/DataContext";
import { useContext } from "react";
import OverdueAlerts from "./OverDueAlerts";

const Dashboard = () => {
  const navigate = useNavigate();
  const {
    participants,
    costs,
    bankTransactions,
    plaidAccessToken,
    isLoadingTransactions,
    connectPlaid,
  } = useData();

  const recurringCostsFromBank = () => {
    const costGroups = {};

    bankTransactions.forEach((transaction) => {
      const baseName = transaction.description.replace(/\s*-.*$/, "");
      if (!costGroups[baseName]) {
        costGroups[baseName] = [];
      }
      costGroups[baseName].push(transaction);
    });

    return Object.entries(costGroups)
      .filter(([name, transactions]) => transactions.length > 1)
      .map(([name, transactions]) => {
        const latest = transactions.sort(
          (a, b) => new Date(b.date) - new Date(a.date)
        )[0];
        const isTracked = costs.some(
          (cost) =>
            cost.plaidMatch &&
            latest.description
              .toLowerCase()
              .includes(cost.plaidMatch.toLowerCase())
        );

        const historicalAmounts = transactions.slice(1).map((t) => t.amount);
        const overcharge = detectOvercharge(latest.amount, historicalAmounts);

        return {
          name,
          latestTransaction: latest,
          frequency: transactions.length,
          isTracked,
          overcharge,
          transactions,
        };
      });
  };

  const activeCosts = costs.filter((cost) => cost.isRecurring).length;
  const recurringFromBank = recurringCostsFromBank();
  const overchargedCosts = recurringFromBank.filter((cost) => cost.overcharge);
  const oneTimeCosts = costs.filter((cost) => !cost.isRecurring);

  return (
    <div className="relative">
      {/* Main content container with mobile-friendly padding matching SplitStep */}
      <div className="max-w-lg mx-auto px-6 py-0 pb-24">
        {/* Header section - matching SplitStep structure */}
        <div className="flex items-center justify-between gap-4 mb-6 mt-8">
          <div className="flex-1 min-w-0">
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-600">Manage your payment requests</p>
          </div>
          <button
            onClick={() => navigate("/costs/new")}
            className="bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 flex-shrink-0"
          >
            <Plus className="w-5 h-5" />
            <span className="hidden sm:inline">New Request</span>
            <span className="sm:hidden">New</span>
          </button>
          {/* <button
            onClick={() => navigate("/costs/new")}
            className="bg-blue-100 text-blue-600 px-4 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 flex-shrink-0"
          >
            <Plus className="w-5 h-5" />
            <span className="hidden sm:inline">New Request</span>
            <span className="sm:hidden">New</span>
          </button> */}
        </div>

        {/* Bank Connection Prompt - uncomment if needed */}
        {/* <BankConnectionPrompt
          plaidAccessToken={plaidAccessToken}
          isLoadingTransactions={isLoadingTransactions}
          connectPlaid={connectPlaid}
        /> */}

        {/* Overcharge Alerts */}
        <OverchargeAlerts overchargedCosts={overchargedCosts} />

        {/* Optional Stats Cards - uncomment if needed */}
        {/* <div className="grid grid-cols-1 gap-4 mb-6">
          <div className="bg-white p-4 rounded-xl shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active Recurring Costs</p>
                <p className="text-2xl font-bold text-gray-900">{activeCosts}</p>
              </div>
              <RefreshCw className="w-8 h-8 text-blue-600" />
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Bank Transactions</p>
                <p className="text-2xl font-bold text-gray-900">
                  {bankTransactions.length}
                </p>
              </div>
              <Link className="w-8 h-8 text-green-600" />
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Participants</p>
                <p className="text-2xl font-bold text-gray-900">
                  {participants.length}
                </p>
              </div>
              <Users className="w-8 h-8 text-purple-600" />
            </div>
          </div>
        </div> */}

        {/* Main Dashboard Sections */}
        <div className="space-y-6">
          <OverdueAlerts/>
          <RecurringCostsSection />
          <RecurringCostsFromBank recurringFromBank={recurringFromBank} />
          <OneTimeCosts oneTimeCosts={oneTimeCosts} />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
