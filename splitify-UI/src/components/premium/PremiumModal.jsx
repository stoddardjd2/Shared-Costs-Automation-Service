import React, { useState } from "react";
import {
  X,
  CreditCard,
  Shield,
  Settings,
  Users,
  MessageSquare,
  TrendingUp,
  CheckCircle,
  Star,
} from "lucide-react";

export default function PremiumModal() {
  const [isOpen, setIsOpen] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState("monthly");

  const pricing = {
    monthly: {
      price: 9.99,
      period: "month",
      features: ["All Premium Features", "Cancel Anytime"],
    },
    annual: {
      price: 99.99,
      period: "year",
      originalPrice: 119.88,
      savingsPercent: 17,
      features: ["All Premium Features", "2 Months Free"],
    },
  };

  if (!isOpen) {
   return null;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[95vh] overflow-y-auto shadow-2xl border border-gray-100">
        {/* Header */}
        <div className="relative bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 px-8 py-12 text-white rounded-t-3xl overflow-hidden">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 -left-4 w-72 h-72 bg-white rounded-full mix-blend-multiply filter blur-xl animate-pulse"></div>
            <div
              className="absolute top-0 -right-4 w-72 h-72 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl animate-pulse"
              style={{ animationDelay: "2s" }}
            ></div>
          </div>

          <button
            onClick={() => setIsOpen(false)}
            className="absolute top-6 right-6 text-white/80 hover:text-white hover:bg-white/10 p-2 rounded-full transition-all duration-200"
          >
            <X size={20} />
          </button>

          <div className="text-center relative z-10">
            <div className="inline-flex items-center bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 mb-4">
              <Star className="text-yellow-300 mr-2" size={18} />
              <span className="text-sm font-medium">Premium Upgrade</span>
            </div>
            <h2 className="text-4xl font-bold mb-4 tracking-tight">
              Unlock Splitify Premium
            </h2>
            <p className="text-blue-100 text-lg max-w-2xl mx-auto leading-relaxed">
              Transform the way you manage shared expenses with advanced
              features designed for power users
            </p>
          </div>
        </div>

        {/* Content */}
        <div className="p-8">
          {/* Features Grid */}
          <div className="mb-12">
            <h3 className="text-2xl font-bold text-gray-900 text-center mb-8">
              Everything you need to split smarter
            </h3>
            <div className="grid lg:grid-cols-2 gap-6">
              {/* Plaid Integration */}
              <div className="group bg-white border border-gray-200 hover:border-blue-300 rounded-2xl p-6 transition-all duration-300 hover:shadow-lg">
                <div className="flex items-start space-x-4">
                  <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-3 rounded-xl group-hover:scale-110 transition-transform duration-300">
                    <CreditCard className="text-white" size={24} />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-gray-900 mb-2 text-lg">
                      Bank Integration
                    </h4>
                    <p className="text-gray-600 mb-4 leading-relaxed">
                      Connect your bank account securely through Plaid to
                      automatically import and categorize transaction history.
                    </p>
                    <div className="flex items-center text-sm text-gray-500 bg-gray-50 rounded-lg px-3 py-2">
                      <Shield size={16} className="mr-2 text-green-600" />
                      <span>Bank-level security • Zero stored credentials</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Dynamic Cost Tracking */}
              <div className="group bg-white border border-gray-200 hover:border-green-300 rounded-2xl p-6 transition-all duration-300 hover:shadow-lg">
                <div className="flex items-start space-x-4">
                  <div className="bg-gradient-to-br from-green-500 to-green-600 p-3 rounded-xl group-hover:scale-110 transition-transform duration-300">
                    <TrendingUp className="text-white" size={24} />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-gray-900 mb-2 text-lg">
                      Smart Analytics
                    </h4>
                    <p className="text-gray-600 leading-relaxed">
                      Advanced expense categorization with real-time insights
                      and spending pattern analysis across all your groups.
                    </p>
                  </div>
                </div>
              </div>

              {/* Collaborative Payments */}
              <div className="group bg-white border border-gray-200 hover:border-purple-300 rounded-2xl p-6 transition-all duration-300 hover:shadow-lg">
                <div className="flex items-start space-x-4">
                  <div className="bg-gradient-to-br from-purple-500 to-purple-600 p-3 rounded-xl group-hover:scale-110 transition-transform duration-300">
                    <Users className="text-white" size={24} />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-gray-900 mb-2 text-lg">
                      Team Collaboration
                    </h4>
                    <p className="text-gray-600 leading-relaxed">
                      Enable any group member to mark payments as complete,
                      streamlining your expense workflow.
                    </p>
                  </div>
                </div>
              </div>

              {/* Custom Messages */}
              <div className="group bg-white border border-gray-200 hover:border-orange-300 rounded-2xl p-6 transition-all duration-300 hover:shadow-lg">
                <div className="flex items-start space-x-4">
                  <div className="bg-gradient-to-br from-orange-500 to-orange-600 p-3 rounded-xl group-hover:scale-110 transition-transform duration-300">
                    <MessageSquare className="text-white" size={24} />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-gray-900 mb-2 text-lg">
                      Custom Communications
                    </h4>
                    <p className="text-gray-600 leading-relaxed">
                      Personalize payment requests and reminders with custom
                      messaging that matches your style.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Advanced Settings Banner */}
            <div className="mt-6 bg-gradient-to-r from-gray-50 to-gray-100 border border-gray-200 rounded-2xl p-6">
              <div className="flex items-center justify-center space-x-4">
                <div className="bg-gradient-to-br from-gray-600 to-gray-700 p-3 rounded-xl">
                  <Settings className="text-white" size={24} />
                </div>
                <div className="text-center">
                  <h4 className="font-bold text-gray-900 mb-1 text-lg">
                    Advanced Settings & More
                  </h4>
                  <p className="text-gray-600">
                    Priority support, early access to new features, and granular
                    control over every aspect of your expense management.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Pricing Plans */}
          <div className="mb-8">
            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                Choose your plan
              </h3>
              <p className="text-gray-600">
                Start with a 7-day free trial, no credit card required
              </p>
            </div>

            {/* Plan Toggle */}
            <div className="flex bg-gray-100 rounded-2xl p-2 mb-8 max-w-md mx-auto">
              <button
                onClick={() => setSelectedPlan("monthly")}
                className={`flex-1 py-3 px-6 rounded-xl text-sm font-semibold transition-all duration-200 ${
                  selectedPlan === "monthly"
                    ? "bg-white text-blue-600 shadow-sm"
                    : "text-gray-600 hover:text-gray-800"
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setSelectedPlan("annual")}
                className={`flex-1 py-3 px-6 rounded-xl text-sm font-semibold transition-all duration-200 ${
                  selectedPlan === "annual"
                    ? "bg-white text-blue-600 shadow-sm"
                    : "text-gray-600 hover:text-gray-800"
                }`}
              >
                Annual
              </button>
            </div>

            {/* Pricing Cards */}
            <div className="max-w-2xl mx-auto">
              {selectedPlan === "monthly" ? (
                <div className="bg-white border-2 border-blue-500 rounded-3xl p-8 shadow-xl">
                  <div className="text-center">
                    <h4 className="text-xl font-bold text-gray-900 mb-4">
                      Monthly Plan
                    </h4>
                    <div className="mb-6">
                      <span className="text-5xl font-bold text-blue-600">
                        ${pricing.monthly.price}
                      </span>
                      <span className="text-gray-500 text-lg ml-1">
                        /{pricing.monthly.period}
                      </span>
                    </div>
                    <div className="space-y-4 mb-8">
                      {pricing.monthly.features.map((feature, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-center text-gray-700"
                        >
                          <CheckCircle
                            size={20}
                            className="text-green-500 mr-3 flex-shrink-0"
                          />
                          <span className="text-lg">{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-500 rounded-3xl p-8 shadow-xl relative">
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <div className="bg-gradient-to-r from-green-500 to-green-600 text-white px-6 py-2 rounded-full text-sm font-bold shadow-lg">
                      Save {pricing.annual.savingsPercent}%
                    </div>
                  </div>
                  <div className="text-center pt-4">
                    <h4 className="text-xl font-bold text-gray-900 mb-4">
                      Annual Plan
                    </h4>
                    <div className="mb-2">
                      <span className="text-5xl font-bold text-blue-600">
                        ${pricing.annual.price}
                      </span>
                      <span className="text-gray-500 text-lg ml-1">
                        /{pricing.annual.period}
                      </span>
                    </div>
                    <div className="text-gray-500 mb-6">
                      <span className="line-through text-lg">
                        ${pricing.annual.originalPrice}
                      </span>
                      <span className="text-green-600 font-semibold ml-2">
                        You save $
                        {(
                          pricing.annual.originalPrice - pricing.annual.price
                        ).toFixed(2)}
                      </span>
                    </div>
                    <div className="space-y-4 mb-8">
                      {pricing.annual.features.map((feature, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-center text-gray-700"
                        >
                          <CheckCircle
                            size={20}
                            className="text-green-500 mr-3 flex-shrink-0"
                          />
                          <span className="text-lg">{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="max-w-md mx-auto space-y-4">
            <button className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white py-4 rounded-2xl font-bold text-lg transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5">
              Start Free Trial
            </button>
            <button
              onClick={() => setIsOpen(false)}
              className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 py-4 rounded-2xl font-semibold text-lg transition-all duration-200"
            >
              Continue with Free Plan
            </button>
          </div>

          {/* Trust Indicators */}
          <div className="text-center mt-8 pt-6 border-t border-gray-100">
            <div className="flex items-center justify-center space-x-6 text-sm text-gray-500 mb-4">
              <div className="flex items-center">
                <Shield size={16} className="mr-2 text-green-500" />
                <span>7-day free trial</span>
              </div>
              <div className="flex items-center">
                <CheckCircle size={16} className="mr-2 text-green-500" />
                <span>No commitment</span>
              </div>
              <div className="flex items-center">
                <X size={16} className="mr-2 text-green-500" />
                <span>Cancel anytime</span>
              </div>
            </div>
            <p className="text-xs text-gray-400">
              Trusted by thousands of users worldwide • SOC 2 compliant •
              256-bit SSL encryption
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
