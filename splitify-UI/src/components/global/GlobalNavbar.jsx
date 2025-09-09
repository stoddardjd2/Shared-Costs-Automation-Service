import React, { useState } from "react";
import { Menu, X, User, UserPlus } from "lucide-react";
import SmartSplitLogo from "../../assets/SmartSplitLogo.svg?react";
import { useNavigate } from "react-router-dom";
import { trackCreateAccount } from "../../googleAnalytics/googleAnalyticsHelpers";

const GlobalNavbar = ({
  showOptions = true,
  options = {
    login: false,
    signup: false,
    features: false,
    security: false,
    pricing: false,
    createFreeAccount: true,
    isFullScreenMobileMode: false,
  },

  className = "",
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  function handleCreateAccount() {
    navigate("/signup");
    trackCreateAccount("navbar");
  }

  const navigate = useNavigate();
  return (
    <nav
      className={`bg-white border-b border-gray-200 shadow-sm ${className} sticky top-0 z-50`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo Section */}

          <div
            onClick={() => {
              navigate("/");
            }}
            className="flex-shrink-0 flex items-center space-x-3 cursor-pointer"
          >
            <SmartSplitLogo className="w-8 h-8" />
            <div className="text-2xl font-bold text-blue-600">Splitify</div>
          </div>

          {/* Desktop Navigation */}
          {showOptions && (
            <div className="hidden md:block">
              <div className="ml-10 flex items-center space-x-4">
                {/* {options.login && (
                  <button
                    onClick={() => {
                      navigate("/login");
                    }}
                    className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors duration-200"
                  >
                    <User className="w-4 h-4 mr-2" />
                    Login
                  </button>
                )} */}

                {options.features && (
                  <button
                    onClick={() => {
                      navigate("/features");
                    }}
                    className="flex items-center px-4 py-2 text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors duration-200"
                  >
                    Features
                  </button>
                )}

                {options.security && (
                  <button
                    onClick={() => {
                      navigate("/security");
                    }}
                    className="flex items-center px-4 py-2 text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors duration-200"
                  >
                    Security
                  </button>
                )}
                {options.pricing && (
                  <button
                    onClick={() => {
                      navigate("/pricing");
                    }}
                    className="flex items-center px-4 py-2 text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors duration-200"
                  >
                    Pricing
                  </button>
                )}

                {options.login && (
                  <button
                    onClick={() => {
                      navigate("/login");
                    }}
                    className="flex items-center  px-6 py-2 rounded-lg text-gray-700 hover:text-gray-900 hover:bg-gray-100 transition-colors duration-200"
                  >
                    <User className="w-4 h-4 mr-2" />
                    Login
                  </button>
                )}

                {options.createFreeAccount && (
                  <button
                    onClick={handleCreateAccount}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
                  >
                    Create Your Free Account
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Mobile menu button for full screen mobile mode*/}
          {showOptions && options.isFullScreenMobileMode && (
            <div className="md:hidden">
              <button
                onClick={toggleMobileMenu}
                className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
              >
                {isMobileMenuOpen ? (
                  <X className="block h-6 w-6" />
                ) : (
                  <Menu className="block h-6 w-6" />
                )}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Navigation Menu  for full screen mobile mode*/}
      {showOptions && isMobileMenuOpen && options.isFullScreenMobileMode && (
        <div
          className={`fixed inset-0 z-50 bg-white md:hidden ${
            isMobileMenuOpen ? "flex" : "hidden"
          } flex-col`}
        >
          {/* Close button */}
          <button
            onClick={() => setIsMobileMenuOpen(false)}
            className="absolute top-4 right-4 p-2 rounded-full text-gray-500 hover:text-gray-800 hover:bg-gray-100 transition-colors duration-200"
          >
            <X className="w-6 h-6" />
          </button>

          {/* Centered menu options */}
          <div className="flex flex-col flex-1 items-center justify-center space-y-6 text-center">
            {options.login && (
              <button
                onClick={() => {
                  navigate("/login");
                  setIsMobileMenuOpen(false);
                }}
                className="flex items-center bg-gray-100 justify-center w-full max-w-xs px-6 py-3 text-lg font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-200 rounded-lg transition-colors duration-200"
              >
                {/* <User className="w-5 h-5 mr-2" /> */}
                Login
              </button>
            )}

            {options.createFreeAccount && (
              <button
                onClick={handleCreateAccount}
                className="bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center w-full max-w-xs px-6 py-3  rounded-lg font-medium transition-colors"
              >
                Create Your Free Account
              </button>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

// Example usage:
//
// <GlobalNavbar
//   showOptions={true}
//   options={{ login: true }}
//   onLogin={() => console.log('Login clicked')}
// />

export default GlobalNavbar;
