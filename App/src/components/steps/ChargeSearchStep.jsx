// ChargeSearchStep.jsx
import { Search, ArrowLeft, CreditCard, Receipt } from "lucide-react";
import StepIndicator from "./StepIndicator";
// import setTotalAmount from "../../hooks/useSplitState";
const ChargeSearchStep = ({
  chargeSearchQuery,
  setChargeSearchQuery,
  filteredCharges,
  onChargeSelect,
  onCreateCharge,
  onBack,
  setTotalAmount,
  setCustomAmounts,
  setSplitType
}) => {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-lg mx-auto px-6 py-8">
        <StepIndicator current="chargeSearch" />

        <div className="flex items-center gap-4 mb-10">
          <button
            onClick={onBack}
            className="p-3 hover:bg-white rounded-xl transition-all hover:shadow-md"
          >
            <ArrowLeft className="w-6 h-6 text-gray-700" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Find Charge</h1>
            <p className="text-gray-600">
              Search for the charge name as it appears on your statement
            </p>
          </div>
        </div>

        <div className="relative mb-8">
          <Search className="absolute left-5 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Enter charge name (e.g., Netflix, Spotify)..."
            value={chargeSearchQuery}
            onChange={(e) => setChargeSearchQuery(e.target.value)}
            className="w-full pl-14 pr-5 py-4 border border-gray-200 rounded-xl outline-none text-base bg-white shadow-sm transition-all hover:shadow-md focus:ring-2 focus:ring-blue-600 focus:border-transparent"
          />
        </div>

        <div className="space-y-3 mb-32">
          {filteredCharges.length > 0 ? (
            filteredCharges.map((charge) => (
              <div
                key={charge.id}
                onClick={() => {
                  setTotalAmount(charge.lastAmount);
                  onChargeSelect(charge);

                  // reset charges
                  setCustomAmounts({})
                  setSplitType("equal");
                }}
                className="p-5 bg-white rounded-xl border-2 border-gray-200 hover:border-gray-300 cursor-pointer transition-all hover:shadow-md"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-blue-500 flex items-center justify-center">
                    <Receipt className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 text-lg">
                      {charge.name}
                    </h3>
                    <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                      <span>Last: ${charge.lastAmount}</span>
                      <span>•</span>
                      <span>{charge.lastDate}</span>
                      <span>•</span>
                      <span>{charge.frequency}</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {charge.matchCount} previous charges
                    </p>
                  </div>
                </div>
              </div>
            ))
          ) : chargeSearchQuery ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Search className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-gray-500 mb-4">
                No matches found for "{chargeSearchQuery}"
              </p>
              <button
                onClick={() => onCreateCharge(chargeSearchQuery)}
                className="hover:text-blue-700 font-semibold underline text-blue-600"
              >
                Create new charge for "{chargeSearchQuery}"
              </button>
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                <CreditCard className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-gray-500">
                Start typing to search for charges
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChargeSearchStep;
