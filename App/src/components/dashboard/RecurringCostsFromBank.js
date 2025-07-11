import React from 'react';
import { useNavigate } from 'react-router-dom';
import { TrendingUp } from 'lucide-react';

const RecurringCostsFromBank = ({ recurringFromBank }) => {
  const navigate = useNavigate();

  if (recurringFromBank.length === 0) return null;

  return (
    <div className="bg-white rounded-xl shadow-sm border">
      <div className="p-6 border-b">
        <h2 className="text-xl font-semibold text-gray-900">Recurring Costs Found in Bank Statements</h2>
        <p className="text-sm text-gray-600 mt-1">Automatically detected recurring transactions</p>
      </div>
      <div className="divide-y">
        {recurringFromBank.map((cost, index) => (
          <div key={index} className="p-6 hover:bg-gray-50 transition-colors">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <h3 className="font-semibold text-gray-900">{cost.name}</h3>
                  <span className={`px-2 py-1 text-xs rounded-full ${cost.isTracked ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                    {cost.isTracked ? 'Tracked' : 'Not Tracked'}
                  </span>
                  {cost.overcharge && (
                    <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full flex items-center gap-1">
                      <TrendingUp className="w-3 h-3" />
                      +{cost.overcharge.percentIncrease}%
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-600 mt-1">
                  Latest: ${cost.latestTransaction.amount} on {cost.latestTransaction.date}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Found {cost.frequency} times • Category: {cost.latestTransaction.category}
                </p>
              </div>
              <div className="flex items-center gap-2">
                {!cost.isTracked && (
                  <button
                    onClick={() => navigate('/costs/new')}
                    className="px-3 py-1 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Track & Share
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecurringCostsFromBank;
