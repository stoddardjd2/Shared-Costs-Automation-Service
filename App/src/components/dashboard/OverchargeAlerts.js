import React from 'react';
import { AlertTriangle } from 'lucide-react';

const OverchargeAlerts = ({ overchargedCosts }) => {
  if (overchargedCosts.length === 0) return null;

  return (
    <div className="space-y-3">
      {overchargedCosts.map((cost, index) => (
        <div key={index} className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <h3 className="font-semibold text-red-900">Potential Overcharge Detected</h3>
              <p className="text-red-700 text-sm mt-1">
                <strong>{cost.name}</strong> charged ${cost.latestTransaction.amount} on {cost.latestTransaction.date}, 
                which is {cost.overcharge.percentIncrease}% higher than the average of ${cost.overcharge.averageAmount}
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default OverchargeAlerts;
