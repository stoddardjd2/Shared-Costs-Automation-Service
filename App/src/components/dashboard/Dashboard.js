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
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <button
          onClick={() => navigate("/costs/new")}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Payment Request
        </button>
      </div>

      <BankConnectionPrompt
        plaidAccessToken={plaidAccessToken}
        isLoadingTransactions={isLoadingTransactions}
        connectPlaid={connectPlaid}
      />

      <OverchargeAlerts overchargedCosts={overchargedCosts} />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Active Recurring Costs</p>
              <p className="text-2xl font-bold text-gray-900">{activeCosts}</p>
            </div>
            <RefreshCw className="w-8 h-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border">
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

        <div className="bg-white p-6 rounded-xl shadow-sm border">
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
      </div>

      <RecurringCostsSection />
      <RecurringCostsFromBank recurringFromBank={recurringFromBank} />
      <OneTimeCosts oneTimeCosts={oneTimeCosts} />
    </div>
  );
};

export default Dashboard;
