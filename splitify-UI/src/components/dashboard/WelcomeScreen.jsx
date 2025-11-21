import React, { useState, useEffect } from "react";
import { ArrowRight, Send, CreditCard, List, Calculator } from "lucide-react";
import { useNavigate } from "react-router-dom";
export default function WelcomeScreen({setShowFirstTimePrompt}) {
  const [isVisible, setIsVisible] = useState(false);
  const navigate = useNavigate();
  useEffect(() => {
    setIsVisible(true);
  }, []);

  const handleGetStarted = () => {
    // Navigate to dashboard/add
    navigate("/dashboard/add");
    setShowFirstTimePrompt(false)
  };

  const handleExploreDashboard = () => {
    navigate('/dashboard/')
    setShowFirstTimePrompt(false)
  };

  const features = [
    {
      icon: <Calculator className="w-5 h-5" />,
      title: "Split Bills",
      description: "Divide bills evenly or by custom amounts",
    },
    {
      icon: <Send className="w-5 h-5" />,
      title: "Send Requests",
      description: "Splitify sends text messages to your friends",
    },
    {
      icon: <CreditCard className="w-5 h-5" />,
      title: "Connect Your Bank",
      description:
        "Track costs and automatically update requests as costs change",
    },
    {
      icon: <List className="w-5 h-5" />,
      title: "Manage & Track",
      description: "View payment history and manage all requests",
    },
  ];

  return (
    <div className="fixed inset-0 z-50 min-h-screen bg-white flex items-start justify-center p-2 !pt-14 sm:p-4 lg:p-8 overflow-auto">
      <div
        className={`w-full max-w-2xl mx-auto text-center transition-all duration-700 ${
          isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
        }`}
      >
        <div className="mb-8 sm:mb-12">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4 sm:mb-6 leading-tight px-2">
            Welcome to Splitify
          </h1>

          <p className="text-base sm:text-lg text-gray-600 mb-6 sm:mb-8 leading-relaxed px-2">
            Split bills and manage payments with friends.
          </p>

          {/* Responsive button layout */}
          <div className="flex justify-center flex-col sm:flex-row gap-3 sm:gap-4 px-2">
            <button
              onClick={handleGetStarted}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 sm:px-6 py-3 rounded-lg font-medium transition-colors duration-200"
            >
              <span>Split Your First Request</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={handleExploreDashboard}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 border border-black hover:bg-gray-100 text-black px-4 sm:px-6 py-3 rounded-lg font-medium transition-colors duration-200"
            >
              <span className="hidden sm:inline">
                Or Explore Your Dashboard
              </span>
              <span className="sm:hidden">Explore Dashboard</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Responsive features grid */}
        <div className="grid gap-4 sm:gap-6 px-2">
          {features.map((feature, index) => (
            <div
              key={index}
              className={`flex items-start gap-3 sm:gap-4 p-3 sm:p-4 rounded-lg border border-gray-100 transition-all duration-500 ${
                isVisible
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-4"
              }`}
              style={{ transitionDelay: `${index * 100 + 200}ms` }}
            >
              <div className="text-blue-600 mt-1 flex-shrink-0">
                {feature.icon}
              </div>
              <div className="text-left">
                <h3 className="font-medium text-gray-900 mb-1 text-sm sm:text-base">
                  {feature.title}
                </h3>
                <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
