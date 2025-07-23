import React, { useState, useEffect } from "react";
import {
  User,
  LogOut,
  Crown,
  Settings,
  ChevronDown,
  Bell,
  Search,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
const Navbar = () => {
  const [showUserMenu, setShowUserMenu] = useState(false);

  const navigate = useNavigate();

  // Demo user data
  const currentUser = {
    name: "Sarah Johnson",
    email: "sarah.johnson@example.com",
    plan: "Free",
    avatar: "SJ",
    color: "bg-gradient-to-br from-blue-500 to-blue-600",
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showUserMenu && !event.target.closest(".user-menu")) {
        setShowUserMenu(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showUserMenu]);

  const handleLogout = () => {
    // In a real app, this would handle actual logout
    setShowUserMenu(false);
    navigate("/login");
  };

  const getPlanColor = (plan) => {
    switch (plan.toLowerCase()) {
      case "pro":
        return "bg-gradient-to-r from-purple-500 to-purple-600";
      case "premium":
        return "bg-gradient-to-r from-yellow-500 to-yellow-600";
      default:
        return "bg-gradient-to-r from-gray-500 to-gray-600";
    }
  };

  const getPlanIcon = (plan) => {
    if (plan.toLowerCase() !== "free") {
      return <Crown className="w-3 h-3" />;
    }
    return null;
  };

  return (
    <nav className="bg-white border-b border-slate-200/60 shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex px-4 sm:px-8 justify-between items-center h-16">
          {/* Logo/Brand */}
          <div className="flex items-center">
            <div className="flex-shrink-0 flex items-center">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">P</span>
              </div>
              <span className="ml-3 text-xl font-semibold text-slate-900">
                PaymentApp
              </span>
            </div>
          </div>

          {/* Search Bar */}
          {/* <div className="hidden md:block flex-1 max-w-lg mx-8">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search payments, people..."
                className="w-full pl-10 pr-4 py-2 border border-slate-200/60 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-600 focus:border-blue-500 bg-gray-50 text-sm"
              />
            </div>
          </div> */}

          {/* Right side - User menu */}
          <div className="flex items-center space-x-4">
            {/* Notifications */}
            <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors relative">
              <Bell className="w-5 h-5" />
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
            </button>

            {/* Plan Badge */}
            {/* <div
              className={`px-3 py-1 rounded-full text-white text-xs font-medium flex items-center gap-1 ${getPlanColor(
                currentUser.plan
              )}`}
            >
              {getPlanIcon(currentUser.plan)}
              {currentUser.plan}
            </div> */}

            {/* User Menu */}
            <div className="relative user-menu">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                {/* User Avatar */}
                <div
                  className={`w-8 h-8 rounded-lg ${currentUser.color} flex items-center justify-center text-white font-semibold text-sm`}
                >
                  {currentUser.avatar}
                </div>

                {/* User Info */}
                <div className="hidden sm:block text-left">
                  <div className="text-sm font-medium text-gray-900">
                    {currentUser.name}
                  </div>
                  <div className="text-xs text-gray-600">
                    {currentUser.email}
                  </div>
                </div>

                <ChevronDown
                  className={`w-4 h-4 text-gray-500 transition-transform ${
                    showUserMenu ? "rotate-180" : ""
                  }`}
                />
              </button>

              {/* Dropdown Menu */}
              {showUserMenu && (
                <div className="absolute right-0 top-full mt-2 w-64 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                  {/* User Info Header */}
                  <div className="px-4 py-3 border-b border-gray-100">
                    <div className="flex items-center space-x-3">
                      <div
                        className={`w-10 h-10 rounded-lg ${currentUser.color} flex items-center justify-center text-white font-semibold`}
                      >
                        {currentUser.avatar}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-gray-900 truncate">
                          {currentUser.name}
                        </div>
                        <div className="text-xs text-gray-600 truncate">
                          {currentUser.email}
                        </div>
                        <div className="flex items-center gap-1 mt-1">
                          <div
                            className={`px-2 py-0.5 rounded text-white text-xs font-medium flex items-center gap-1 ${getPlanColor(
                              currentUser.plan
                            )}`}
                          >
                            {getPlanIcon(currentUser.plan)}
                            {currentUser.plan} Plan
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Menu Items */}
                  <div className="py-2">
                    <button
                      onClick={() => {
                        alert("Profile settings would open here");
                        setShowUserMenu(false);
                      }}
                      className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                    >
                      <User className="w-4 h-4 mr-3" />
                      Profile Settings
                    </button>

                    <button
                      onClick={() => {
                        alert("App settings would open here");
                        setShowUserMenu(false);
                      }}
                      className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                    >
                      <Settings className="w-4 h-4 mr-3" />
                      App Settings
                    </button>

                    {currentUser.plan === "Free" && (
                      <button
                        onClick={() => {
                          alert("Upgrade plan modal would open here");
                          setShowUserMenu(false);
                        }}
                        className="flex items-center w-full px-4 py-2 text-sm text-purple-600 hover:bg-purple-50 transition-colors"
                      >
                        <Crown className="w-4 h-4 mr-3" />
                        Upgrade Plan
                      </button>
                    )}
                  </div>

                  {/* Logout */}
                  <div className="border-t border-gray-100 py-2">
                    <button
                      onClick={handleLogout}
                      className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <LogOut className="w-4 h-4 mr-3" />
                      Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Search */}
      {/* <div className="md:hidden px-4 pb-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search payments, people..."
            className="w-full pl-10 pr-4 py-2 border border-slate-200/60 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-600 focus:border-blue-500 bg-gray-50 text-sm"
          />
        </div>
      </div> */}
    </nav>
  );
};

export default Navbar;
