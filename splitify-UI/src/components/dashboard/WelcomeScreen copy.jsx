import React, { useState, useEffect } from "react";
import { ArrowRight, Send, CreditCard, List, Calculator } from "lucide-react";
import { useNavigate } from "react-router-dom";
export default function WelcomeScreen() {
  const [isVisible, setIsVisible] = useState(false);
  const navigate = useNavigate();
  useEffect(() => {
    setIsVisible(true);
  }, []);

  const handleGetStarted = () => {
    // Navigate to dashboard/add
    navigate("/dashboard/add");
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
      description: "Send payment requests to your friends and family",
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
    <div
      className={`
        fixed inset-0 z-50
     [background:radial-gradient(52.87%_92.69%_at_53.89%_92.69%,_#075C7B_31.33%,_#022B3A_71.02%,_#0C0C0C_100%)]
    min-h-screen shadow-lg translate-y-[-0px] bg-white flex items-center justify-center`}
    >
      <div
        className={`max-w-2xl mx-auto text-center transition-all duration-700 ${
          isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
        }`}
      >
        <div className="mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 leading-tight">
            Welcome to Splitify
          </h1>

          <p className="text-lg text-gray-600 mb-8 leading-relaxed">
            Split bills and manage payments with friends and family.
          </p>
          <div className="flex gap-4">
            <button
              onClick={handleGetStarted}
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200"
            >
              Add Your First Bill
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => {
                navigate("/dashboard");
              }}
              className="inline-flex items-center gap-2 border border-black hover:bg-gray-100 text-black px-6 py-3 rounded-lg font-medium transition-colors duration-200"
            >
              Or Explore Your Dashboard
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="grid gap-6 mb-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className={`flex items-start gap-4 p-4 rounded-lg border border-gray-100 transition-all duration-500 ${
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
                <h3 className="font-medium text-gray-900 mb-1">
                  {feature.title}
                </h3>
                <p className="text-sm text-gray-600">{feature.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
