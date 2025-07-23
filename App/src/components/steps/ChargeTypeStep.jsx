import { Search, Plus, CreditCard, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import StepIndicator from "./StepIndicator";

const ChargeTypeStep = ({ onChargeTypeSelect }) => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-lg mx-auto px-6 py-0">
        <StepIndicator current="chargeType" />

        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => navigate("/dashboard")}
            className="p-3 hover:bg-white rounded-xl transition-all hover:shadow-md"
          >
            <X className="w-6 h-6 text-gray-700" />
          </button>
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-900">Choose Option</h1>
            <p className="text-gray-600">Track an existing charge or add a new recurring charge</p>
          </div>
        </div>

        <div className="space-y-4">
          <div
            onClick={() => onChargeTypeSelect("existing")}
            className="p-6 bg-white border-2 border-gray-200 hover:border-gray-300 rounded-xl cursor-pointer transition-all hover:shadow-md group"
          >
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-blue-600 flex items-center justify-center group-hover:scale-105 transition-transform">
                <Search className="w-7 h-7 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-semibold text-gray-900 mb-1">
                  Track Existing Charge
                </h3>
                <p className="text-gray-600 mb-2">
                  Find and split charges that already appear on your bank statement
                </p>
                <p className="text-xs text-gray-500">
                  * Requires Bilt account connection
                </p>
              </div>
            </div>
          </div>

          <div
            onClick={() => onChargeTypeSelect("new")}
            className="p-6 bg-white border-2 border-gray-200 hover:border-gray-300 rounded-xl cursor-pointer transition-all hover:shadow-md group"
          >
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-blue-600 flex items-center justify-center group-hover:scale-105 transition-transform">
                <Plus className="w-7 h-7 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-semibold text-gray-900 mb-1">
                  Add New Charge
                </h3>
                <p className="text-gray-600">
                  Set up a new charge to split
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChargeTypeStep;