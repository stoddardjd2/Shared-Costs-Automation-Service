import { Search, Plus, CreditCard, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import StepIndicator from "./StepIndicator";

const ChargeTypeStep = ({ onChargeTypeSelect }) => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-lg mx-auto px-6 py-8">
        {/* X button in top right */}
        <div className="flex justify-end mb-4">
          <button
            onClick={() => navigate("/dashboard")}
            className="w-10 h-10 rounded-full bg-white shadow-md hover:shadow-lg flex items-center justify-center transition-all hover:bg-gray-50"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        <StepIndicator current="chargeType" />

        <div className="text-center mb-10">
          <div className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg bg-blue-600">
            <CreditCard className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-3">
            Choose Option
          </h1>
          <p className="text-gray-600 text-lg">
            Track an existing charge or add a new recurring charge
          </p>
        </div>

        <div className="space-y-4">
          <div
            onClick={() => onChargeTypeSelect("existing")}
            className="p-6 bg-white border-2 border-gray-200 hover:border-gray-300 rounded-xl cursor-pointer transition-all hover:shadow-md group"
          >
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-green-500 flex items-center justify-center group-hover:scale-105 transition-transform">
                <Search className="w-7 h-7 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-semibold text-gray-900 mb-1">
                  Track Existing Charge
                </h3>
                <p className="text-gray-600">
                  Find and split charges that already appear on your bank
                  statement
                </p>
              </div>
            </div>
          </div>

          <div
            onClick={() => onChargeTypeSelect("new")}
            className="p-6 bg-white border-2 border-gray-200 hover:border-gray-300 rounded-xl cursor-pointer transition-all hover:shadow-md group"
          >
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-purple-500 flex items-center justify-center group-hover:scale-105 transition-transform">
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