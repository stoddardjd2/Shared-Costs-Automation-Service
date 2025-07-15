import { ArrowLeft, Receipt, User, DollarSign, Calendar, RefreshCw } from 'lucide-react';
import StepIndicator from './StepIndicator';

const ChargeDetailsStep = ({ 
  newChargeDetails, 
  setNewChargeDetails, 
  onContinue, 
  onBack,
  chargeType 
}) => {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-lg mx-auto px-6 py-8">
        <StepIndicator current="chargeDetails" />
        
        <div className="flex items-center gap-4 mb-10">
          <button
            onClick={onBack}
            className="p-3 hover:bg-white rounded-xl transition-all hover:shadow-md"
          >
            <ArrowLeft className="w-6 h-6 text-gray-700" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Charge Details</h1>
            <p className="text-gray-600">Enter the details for this recurring charge</p>
          </div>
        </div>

        <div className="space-y-6 mb-32">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              <Receipt className="w-4 h-4 inline mr-2" />
              Charge Name (as seen on statement)
            </label>
            <input
              type="text"
              value={newChargeDetails.name}
              onChange={(e) => setNewChargeDetails(prev => ({ ...prev, name: e.target.value }))}
              placeholder="e.g., Netflix, Spotify Premium"
              className="w-full p-4 border border-gray-200 rounded-xl outline-none text-base bg-white shadow-sm transition-all hover:shadow-md focus:ring-2 focus:ring-blue-600 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              <User className="w-4 h-4 inline mr-2" />
              Custom Display Name (optional)
            </label>
            <input
              type="text"
              value={newChargeDetails.customName}
              onChange={(e) => setNewChargeDetails(prev => ({ ...prev, customName: e.target.value }))}
              placeholder="e.g., Streaming Service, Music App"
              className="w-full p-4 border border-gray-200 rounded-xl outline-none text-base bg-white shadow-sm transition-all hover:shadow-md focus:ring-2 focus:ring-blue-600 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              <DollarSign className="w-4 h-4 inline mr-2" />
              Most Recent Charge Amount
            </label>
            <div className="relative">
              <DollarSign className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="number"
                value={newChargeDetails.lastAmount}
                onChange={(e) => setNewChargeDetails(prev => ({ ...prev, lastAmount: e.target.value }))}
                placeholder="0.00"
                className="w-full pl-12 pr-4 py-4 border border-gray-200 rounded-xl outline-none text-base bg-white shadow-sm focus:ring-2 focus:ring-blue-600 focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              <Calendar className="w-4 h-4 inline mr-2" />
              Last Charge Date
            </label>
            <input
              type="date"
              value={newChargeDetails.lastDate}
              onChange={(e) => setNewChargeDetails(prev => ({ ...prev, lastDate: e.target.value }))}
              className="w-full p-4 border border-gray-200 rounded-xl outline-none text-base bg-white shadow-sm focus:ring-2 focus:ring-blue-600 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              <RefreshCw className="w-4 h-4 inline mr-2" />
              Billing Frequency
            </label>
            <select
              value={newChargeDetails.frequency}
              onChange={(e) => setNewChargeDetails(prev => ({ ...prev, frequency: e.target.value }))}
              className="w-full p-4 border border-gray-200 rounded-xl outline-none text-base bg-white shadow-sm focus:ring-2 focus:ring-blue-600 focus:border-transparent"
            >
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
              <option value="quarterly">Quarterly</option>
              <option value="yearly">Yearly</option>
            </select>
          </div>

          {/* Preview */}
          {newChargeDetails.name && (
            <div className="p-4 bg-white rounded-xl border border-gray-200 shadow-sm">
              <p className="text-sm font-semibold text-gray-700 mb-2">Preview:</p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-semibold text-sm bg-blue-600">
                  <Receipt className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900">{newChargeDetails.customName || newChargeDetails.name}</p>
                  <p className="text-gray-600 text-sm">
                    ${newChargeDetails.lastAmount || '0.00'} • {newChargeDetails.frequency} • {newChargeDetails.lastDate || 'No date'}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-6 shadow-2xl">
          <div className="max-w-lg mx-auto">
            <button
              onClick={onContinue}
              disabled={!newChargeDetails.name.trim()}
              className="w-full text-white font-semibold py-4 rounded-xl shadow-lg transition-all disabled:bg-gray-300 disabled:cursor-not-allowed disabled:shadow-none"
              style={{ 
                backgroundColor: !newChargeDetails.name.trim() ? '#d1d5db' : '#2563eb'
              }}
            >
              Continue to Select People
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChargeDetailsStep;
