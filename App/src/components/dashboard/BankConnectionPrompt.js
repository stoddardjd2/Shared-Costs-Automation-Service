import React from 'react';
import { Link } from 'lucide-react';

const BankConnectionPrompt = ({ plaidAccessToken, isLoadingTransactions, connectPlaid }) => {
  if (plaidAccessToken) return null;

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
      <div className="flex items-center gap-3">
        <Link className="w-5 h-5 text-blue-600" />
        <div className="flex-1">
          <h3 className="font-semibold text-blue-900">Connect Your Bank Account</h3>
          <p className="text-blue-700 text-sm mt-1">
            Connect your bank account to automatically track recurring expenses
          </p>
        </div>
        <button
          onClick={connectPlaid}
          disabled={isLoadingTransactions}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
        >
          {isLoadingTransactions ? 'Connecting...' : 'Connect Bank'}
        </button>
      </div>
    </div>
  );
};

export default BankConnectionPrompt;
