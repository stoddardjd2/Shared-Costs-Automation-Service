import React from "react";
import { useNavigate } from "react-router-dom";
import { DollarSign } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";

const Navigation = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = window.location.pathName;
  if (!location == "/costs/new") {
    return (
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <button
                onClick={() => navigate("/dashboard")}
                className="flex items-center gap-2 hover:opacity-80 transition-opacity"
              >
                <DollarSign className="w-8 h-8 text-blue-600" />
                <span className="text-xl font-bold text-gray-900">
                  Shared Costs
                </span>
              </button>
            </div>

            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">
                Welcome, {user?.name}
              </span>
              <button
                onClick={() => {
                  logout();
                  navigate("/login");
                }}
                className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </nav>
    );
  }else{
    return <></>
  }
};

export default Navigation;
