import React, { useState } from "react";
import { Menu, X, User, UserPlus } from "lucide-react";
import { ReactComponent as SmartSplitLogo } from "../../assets/SmartSplitLogo.svg?react";
import { useNavigate } from "react-router-dom";

const GlobalNavbar = ({
  showOptions = true,
  options = {
    login: true,
    signup: true,
    features: true,
    security: true,
    pricing: true,
    createFreeAccount: true,
  },
  className = "",
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

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
            <div className="text-2xl font-bold text-blue-600">
              Splitify
            </div>
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

                {options.signup && (
                  <button
                    onClick={() => {
                      navigate("/signup");
                    }}
                    className="flex items-center  px-6 py-2 rounded-lg text-gray-700 hover:text-gray-900 hover:bg-gray-100 transition-colors duration-200"
                  >
                    <User className="w-4 h-4 mr-2" />
                    Signup or Login
                  </button>
                )}

                {options.createFreeAccount && (
                  <button
                    onClick={() => {
                      navigate("/signup");
                    }}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
                  >
                    Create Your Free Account
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Mobile menu button */}
          {showOptions && (
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

      {/* Mobile Navigation Menu */}
      {showOptions && isMobileMenuOpen && (
        <div className="md:hidden border-t border-gray-200">
          <div className="px-2 pt-2 pb-3 space-y-1 bg-white">
            {options.login && (
              <button
                onClick={() => {
                  onLogin();
                  setIsMobileMenuOpen(false);
                }}
                className="flex items-center w-full px-3 py-2 text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors duration-200"
              >
                <User className="w-4 h-4 mr-2" />
                Login or Signup
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
