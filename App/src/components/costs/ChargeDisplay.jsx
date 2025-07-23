import React from 'react';
import { Receipt } from 'lucide-react';

const ChargeDisplay = ({ selectedCharge, newChargeDetails }) => {
  if (!selectedCharge && !newChargeDetails.name) return null;

  return (
    <div className="p-4 mb-6 bg-white rounded-xl border border-gray-200 shadow-sm">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center">
          <Receipt className="w-5 h-5 text-white" />
        </div>
        <div>
          <p className="font-semibold text-gray-900">
            {selectedCharge?.name || newChargeDetails.customName || newChargeDetails.name}
          </p>
          <p className="text-gray-600 text-sm">
            ${selectedCharge?.lastAmount || newChargeDetails.lastAmount || '0.00'} • {""} 
            {selectedCharge?.frequency || newChargeDetails.frequency}
          </p>
        </div>
      </div>
    </div>
  );
};

export default ChargeDisplay;
