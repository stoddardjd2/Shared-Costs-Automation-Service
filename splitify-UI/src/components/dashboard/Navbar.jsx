import React, { useState, useEffect } from "react";
import SmartSplitLogo from "../../assets/SmartSplitLogo.svg?react";

import {
  User,
  LogOut,
  Crown,
  Settings,
  ChevronDown,
  Bell,
  Search,
  DollarSign,
  ArrowUpCircle,
  Send,
  CreditCard,
  Inbox,
  Smartphone,
} from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { useData } from "../../contexts/DataContext";
import PaymentMethodPrompt from "./PaymentMethodPrompt";
import PwaInstallPrompt from "./PwaInstallPrompt";
import SplitifyPremiumModal from "../premium/SplitifyPremiumModal";
import { handleCreatePortalSession } from "../../queries/stripe";
import { clearUserId } from "../../googleAnalytics/googleAnalyticsHelpers";
const Navbar = () => {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showPaymentMethodPrompt, setShowPaymentMethodPrompt] = useState(false);
  const [showPwaGuide, setShowPwaGuide] = useState(false);
  const [showPremiumPrompt, setShowPremiumPrompt] = useState(false);
  const { userData, setUserData } = useData();
  const navigate = useNavigate();
  const location = useLocation();
  // Demo user data

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
    localStorage.removeItem("token");
    navigate("/login");

    //clear google anayltics id
    clearUserId();
  };

  const getPlanColor = (plan) => {
    switch (plan.toLowerCase()) {
      case "plaid":
        return "bg-gradient-to-r from-purple-500 to-purple-600";
      case "premium":
        return "bg-gradient-to-r from-yellow-500 to-yellow-600";
      default:
        return "bg-gradient-to-r from-gray-500 to-gray-600";
    }
  };

  function CreditCardIcon() {
    return (
      <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6 text-white">
        <path
          d="M21 8.5C21 7.11929 19.8807 6 18.5 6H5.5C4.11929 6 3 7.11929 3 8.5V15.5C3 16.8807 4.11929 18 5.5 18H18.5C19.8807 18 21 16.8807 21 15.5V8.5Z"
          stroke="currentColor"
          strokeWidth="2"
        />
        <path
          d="M7 12H7.01"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <path
          d="M11 12H15"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <path d="M3 9L21 9" stroke="currentColor" strokeWidth="2" />
      </svg>
    );
  }

  const getPlanIcon = (plan) => {
    if (plan.toLowerCase() !== "free") {
      return <Crown className="w-3 h-3" />;
    }
    return null;
  };

  function RequestMoneyIcon({
    size = 24,
    color = "currentColor",
    strokeWidth = 2,
  }) {
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width={size}
        height={size}
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        viewBox="0 0 24 24"
        aria-label="Request Money Icon"
        role="img"
      >
        {/* Dollar Sign */}
        <path d="M12 1v22M17 5H9.5a3.5 3.5 0 0 0 0 7h4a3.5 3.5 0 0 1 0 7H7" />
        {/* Up Arrow (above dollar sign) */}
        <path d="M12 5l-3 3h6l-3-3z" />
      </svg>
    );
  }

  const avatar = generateAvatar();
  function generateAvatar() {
    // Safety check for userData and name
    if (!userData || !userData.name) {
      return "?"; // Default fallback
    }

    const nameParts = userData.name
      .trim()
      .split(" ")
      .filter((part) => part.length > 0);

    // Handle edge cases
    if (nameParts.length === 0) {
      return "?"; // Fallback for empty name
    }

    const initials =
      nameParts.length === 1
        ? nameParts[0][0].toUpperCase()
        : (nameParts[0][0] + nameParts[nameParts.length - 1][0]).toUpperCase(); // Fixed: was .toUpper

    return initials;
  }

  useEffect(() => {
    const path = location.pathname;
    setShowPremiumPrompt(path.startsWith("/dashboard/premium"));
  }, [location.pathname]);


  return (
    <nav className="bg-white border-b border-slate-200/60 shadow-sm fixed top-0 w-full z-50">
      <div className="max-w-7xl mx-auto">
        <div className="flex px-4 sm:px-6 justify-between items-center h-16">
          {/* Logo/Brand */}
          <div
            onClick={() => {
              navigate(0);
            }}
            className="flex-shrink-0 flex items-center space-x-3 cursor-pointer"
          >
            <SmartSplitLogo className="w-8 h-8" />
            <div className="text-2xl font-bold text-blue-600">Splitify</div>
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
            {/* <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors relative">
              <Bell className="w-5 h-5" />
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
            </button> */}

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
                  className={`w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-semibold text-sm`}
                >
                  {avatar}
                </div>

                {/* User Info */}
                <div className="hidden sm:block text-left">
                  <div className="text-sm font-medium text-gray-900">
                    {userData.name}
                  </div>
                  <div className="text-xs text-gray-600">{userData.email}</div>
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
                        className={`w-10 h-10 self-centerm rounded-lg bg-blue-600 flex items-center justify-center text-white font-semibold`}
                      >
                        {avatar}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-gray-900 truncate">
                          {userData.name}
                        </div>
                        <div className="text-xs text-gray-600 truncate">
                          {userData.email}
                        </div>
                        <div className="flex items-center gap-1 mt-1">
                          <div
                            className={`px-2 py-0.5 capitalize rounded text-white text-xs font-medium flex items-center gap-1 ${getPlanColor(
                              userData.plan
                            )}`}
                          >
                            {getPlanIcon(userData.plan)}
                            {userData.plan} Plan
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Menu Items */}
                  <div className="py-2">
                    {/* <button
                      onClick={() => {
                        alert("Profile settings would open here");
                        setShowUserMenu(false);
                      }}
                      className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                    >
                      <User className="w-4 h-4 mr-3" />
                      Profile Settings
                    </button> */}

                    {/* <button
                      onClick={() => {
                        alert("App settings would open here");
                        setShowUserMenu(false);
                      }}
                      className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                    >
                      <Settings className="w-4 h-4 mr-3" />
                      App Settings
                    </button> */}
                  </div>

                  {/* premium */}
                  <button
                    onClick={async () => {
                      if (userData.plan == "free") {
                        setShowPremiumPrompt(!showPremiumPrompt);
                        navigate("/dashboard/premium");
                      } else {
                        // get url from stripe to manage subscription
                        const res = await handleCreatePortalSession();
                        window.location = res.url;
                      }
                      setShowUserMenu(false);
                    }}
                    className="flex items-center w-full px-4 py-4 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                  >
                    <Crown className="w-4 h-4 mr-3" />{" "}
                    {userData.plan == "free"
                      ? "Get Premium"
                      : "Manage Subscription"}
                  </button>

                  {userData.plan === "Free" && (
                    <button
                      onClick={() => {
                        alert("Upgrade plan modal would open here");
                        setShowUserMenu(false);
                      }}
                      className="flex items-center w-full px-4 py-4 text-sm text-purple-600 hover:bg-purple-50 transition-colors"
                    >
                      <Crown className="w-4 h-4 mr-3" />
                      Upgrade Plan
                    </button>
                  )}

                  {/* PWA */}
                  <button
                    onClick={() => {
                      setShowPwaGuide(!showPwaGuide);
                      setShowUserMenu(false);
                    }}
                    className="flex items-center w-full px-4 py-4 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                  >
                    <Smartphone className="w-4 h-4 mr-3" />
                    Install Web App
                  </button>

                  <button
                    onClick={() => {
                      // alert("App settings would open here");
                      setShowPaymentMethodPrompt(true);
                      setShowUserMenu(false);
                    }}
                    className="flex items-center w-full px-4 py-4 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                  >
                    <Settings className="w-4 h-4 mr-3" />
                    Edit Payment Methods
                  </button>

                  {/* Logout */}
                  <div className="border-t border-gray-100 py-2">
                    <button
                      onClick={handleLogout}
                      className="flex items-center w-full px-4 py-4 text-sm text-red-600 hover:bg-red-50 transition-colors"
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

      {/* MODALS */}
      <PwaInstallPrompt
        isOpen={showPwaGuide}
        onClose={() => setShowPwaGuide(false)}
      />

      <FullscreenModal
        isOpen={showPaymentMethodPrompt}
        onClose={() => setShowPaymentMethodPrompt(false)}
      >
        <PaymentMethodPrompt
          setShowPaymentMethodPrompt={setShowPaymentMethodPrompt}
          isEditingFromSettings={true}
        />
      </FullscreenModal>

      <SplitifyPremiumModal
        isOpen={showPremiumPrompt}
        onClose={() => {
          navigate("/dashboard");
          // setShowPremiumPrompt(false);
        }}
      />
    </nav>
  );
};

// SEPERATE COMPONENT

function FullscreenModal({ isOpen, onClose, children }) {
  // Close on ESC key
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape") onClose?.();
    };
    document.addEventListener("keydown", handleEsc);
    return () => document.removeEventListener("keydown", handleEsc);
  }, [onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed p-2 inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
      onClick={onClose}
    >
      <div
        className="flex justify-center items-center"
        onClick={(e) => e.stopPropagation()} // Prevent closing on inside click
      >
        <div className="max-w-[28rem]">{children}</div>
      </div>
    </div>
  );
}

export default Navbar;
