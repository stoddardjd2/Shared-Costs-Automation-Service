import React, { useEffect, useState, useRef } from "react";
import { createUser } from "../../queries/auth";
import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  User,
  ArrowRight,
  UserPlus,
  Check,
  AlertCircle,
  CheckCircle,
  X,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { pageview } from "../../googleAnalytics/googleAnalyticsHelpers";
const Signup = () => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [notification, setNotification] = useState(null);
  const [consent, setConsent] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    document.getElementById("root")?.scrollTo({
      top: 0,
    });
    pageview(null, "Signup_page");
  }, []);

  const showNotification = (message, type = "error") => {
    setNotification({ message, type });
    // Auto-hide success notifications after 5 seconds
    if (type === "success") {
      setTimeout(() => setNotification(null), 5000);
    }
  };

  const hideNotification = () => {
    setNotification(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear notification when user starts typing
    if (notification) {
      setNotification(null);
    }
  };

  const handleSubmit = async () => {
    // Clear any existing notifications
    // setNotification(null);

    // Validation
    // if (formData.password !== formData.confirmPassword) {
    //   showNotification("Passwords don't match!", "error");
    //   return;
    // }

    if (!formData.firstName.trim() || !formData.lastName.trim()) {
      showNotification("Please enter your first and last name", "error");
      return;
    }

    if (!formData.email.trim()) {
      showNotification("Please enter your email address", "error");
      return;
    }

    if (!formData.password) {
      showNotification("Please enter a password", "error");
      return;
    }

    // Check password requirements
    const passwordRequirements = {
      length: formData.password.length >= 8,
      uppercase: /[A-Z]/.test(formData.password),
      lowercase: /[a-z]/.test(formData.password),
      number: /\d/.test(formData.password),
    };

    const allRequirementsMet =
      Object.values(passwordRequirements).every(Boolean);
    if (!allRequirementsMet) {
      showNotification(
        "Please ensure your password meets all requirements",
        "error"
      );
      return;
    }
    setIsLoading(true);

    try {
      const userData = {
        name: `${formData.firstName.trim()} ${formData.lastName.trim()}`,
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
      };

      const response = await createUser(userData);

      // Assuming createUser returns a response object
      if (response && response.success) {
        navigate("/dashboard");

        // showNotification(
        //   "Account created successfully! Welcome aboard!",
        //   "success"
        // );
        // // Optional: Navigate to login or dashboard after successful signup
        // setTimeout(() => {
        //   navigate("/dashboard");
        // }, 2000);
      } else {
        // Handle API error response
        const errorMessage =
          response?.errors?.[0]?.msg ||
          response?.message ||
          "Failed to create account. Please try again.";
        showNotification(errorMessage, "error");
      }
    } catch (error) {
      // Handle network errors or other exceptions
      console.error("Signup error:", error);

      if (error.response) {
        // Server responded with error status
        const errorMessage =
          error.response.data?.message ||
          error.response.data?.error ||
          `Server error (${error.response.status}). Please try again.`;
        showNotification(errorMessage, "error");
      } else if (error.request) {
        // Network error
        showNotification(
          "Network error. Please check your connection and try again.",
          "error"
        );
      } else {
        // Other error
        showNotification(
          "An unexpected error occurred. Please try again.",
          "error"
        );
      }
    } finally {
      setTimeout(() => {
        setIsLoading(false);
      }, 300);
    }
  };

  const passwordsMatch =
    formData.password &&
    formData.confirmPassword &&
    formData.password === formData.confirmPassword;

  const passwordRequirements = {
    length: formData.password.length >= 8,
    uppercase: /[A-Z]/.test(formData.password),
    lowercase: /[a-z]/.test(formData.password),
    number: /\d/.test(formData.password),
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-600 rounded-2xl mx-auto mb-6 flex items-center justify-center">
            <UserPlus className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Create your account
          </h2>
          <p className="text-gray-600">
            Join to start managing your group bills the easy way.
          </p>
        </div>

        {/* Notification */}
        {notification && (
          <div
            className={`mb-6 p-4 rounded-lg border transition-all duration-300 ${
              notification.type === "error"
                ? "bg-red-50 border-red-200 text-red-800"
                : "bg-green-50 border-green-200 text-green-800"
            }`}
          >
            <div className="flex items-start">
              <div className="flex-shrink-0">
                {notification.type === "error" ? (
                  <AlertCircle className="h-5 w-5 text-red-400" />
                ) : (
                  <CheckCircle className="h-5 w-5 text-green-400" />
                )}
              </div>
              <div className="ml-3 flex-1">
                <p className="text-sm font-medium">{notification.message}</p>
              </div>
              <div className="ml-auto pl-3">
                <button
                  onClick={hideNotification}
                  className={`inline-flex rounded-md p-1.5 focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                    notification.type === "error"
                      ? "text-red-500 hover:bg-red-100 focus:ring-red-600"
                      : "text-green-500 hover:bg-green-100 focus:ring-green-600"
                  }`}
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Signup Form */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200/60 overflow-hidden">
          <div className="p-8">
            <div className="space-y-6">
              {/* Name Fields */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="firstName"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    First name
                  </label>
                  <input
                    id="firstName"
                    name="firstName"
                    type="text"
                    required
                    value={formData.firstName}
                    onChange={handleInputChange}
                    className="block w-full px-3 py-3 border border-slate-200/60 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-600 focus:border-blue-500 transition-all duration-200"
                    placeholder="John"
                  />
                </div>
                <div>
                  <label
                    htmlFor="lastName"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Last name
                  </label>
                  <input
                    id="lastName"
                    name="lastName"
                    type="text"
                    required
                    value={formData.lastName}
                    onChange={handleInputChange}
                    className="block w-full px-3 py-3 border border-slate-200/60 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-600 focus:border-blue-500 transition-all duration-200"
                    placeholder="Doe"
                  />
                </div>
              </div>

              {/* Email Field */}
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Email address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={formData.email}
                    onChange={handleInputChange}
                    className="block w-full pl-10 pr-3 py-3 border border-slate-200/60 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-600 focus:border-blue-500 transition-all duration-200"
                    placeholder="john@example.com"
                  />
                </div>
              </div>

              {/* Password Field */}
              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="new-password"
                    required
                    value={formData.password}
                    onChange={handleInputChange}
                    className="block w-full pl-10 pr-12 py-3 border border-slate-200/60 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-600 focus:border-blue-500 transition-all duration-200"
                    placeholder="Create a strong password"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600 transition-colors" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600 transition-colors" />
                    )}
                  </button>
                </div>

                {/* Password Requirements */}
                {formData.password && (
                  <div className="mt-3 space-y-2">
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div
                        className={`flex items-center gap-1 ${
                          passwordRequirements.length
                            ? "text-green-600"
                            : "text-gray-400"
                        }`}
                      >
                        <Check
                          className={`w-3 h-3 ${
                            passwordRequirements.length
                              ? "text-green-600"
                              : "text-gray-400"
                          }`}
                        />
                        8+ characters
                      </div>
                      <div
                        className={`flex items-center gap-1 ${
                          passwordRequirements.uppercase
                            ? "text-green-600"
                            : "text-gray-400"
                        }`}
                      >
                        <Check
                          className={`w-3 h-3 ${
                            passwordRequirements.uppercase
                              ? "text-green-600"
                              : "text-gray-400"
                          }`}
                        />
                        Uppercase
                      </div>
                      <div
                        className={`flex items-center gap-1 ${
                          passwordRequirements.lowercase
                            ? "text-green-600"
                            : "text-gray-400"
                        }`}
                      >
                        <Check
                          className={`w-3 h-3 ${
                            passwordRequirements.lowercase
                              ? "text-green-600"
                              : "text-gray-400"
                          }`}
                        />
                        Lowercase
                      </div>
                      <div
                        className={`flex items-center gap-1 ${
                          passwordRequirements.number
                            ? "text-green-600"
                            : "text-gray-400"
                        }`}
                      >
                        <Check
                          className={`w-3 h-3 ${
                            passwordRequirements.number
                              ? "text-green-600"
                              : "text-gray-400"
                          }`}
                        />
                        Number
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Confirm Password Field */}
              <div>
                <label
                  htmlFor="confirmPassword"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Confirm password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    autoComplete="new-password"
                    required
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className={`block w-full pl-10 pr-12 py-3 border rounded-lg placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-600 transition-all duration-200 ${
                      formData.confirmPassword && !passwordsMatch
                        ? "border-red-300 focus:border-red-500"
                        : passwordsMatch
                        ? "border-green-300 focus:border-green-500"
                        : "border-slate-200/60 focus:border-blue-500"
                    }`}
                    placeholder="Confirm your password"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600 transition-colors" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600 transition-colors" />
                    )}
                  </button>
                </div>
                {formData.confirmPassword && !passwordsMatch && (
                  <p className="mt-2 text-sm text-red-600">
                    Passwords don't match
                  </p>
                )}
                {passwordsMatch && (
                  <p className="mt-2 text-sm text-green-600">Passwords match</p>
                )}
              </div>

              {/* opt in */}
              <div className="flex items-start gap-3">
                {/* <input
                  id="consent"
                  type="checkbox"
                  checked={consent}
                  onChange={(e) => setConsent(e.target.checked)}
                  className="mt-1 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                /> */}
                <label htmlFor="consent" className="text-xs text-gray-400">
                  By signing up you agree to our
                  <a
                    className="text-[#1865f2]"
                    href="/about/termsAndConditions"
                  >
                    {" "}
                    Terms and Conditions
                  </a>{" "}
                  and our
                  <a className="text-[#1865f2]" href="/about/privacyPolicy">
                    {" "}
                    Privacy Policy.
                  </a>
                </label>
              </div>

              {/* Submit Button */}
              <button
                onClick={handleSubmit}
                disabled={isLoading}
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-1 focus:ring-blue-600 focus:ring-offset-2 transition-all duration-200 transform hover:scale-[1.02] font-medium shadow-sm flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <>
                    Create account
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Footer */}
          <div className="px-8 py-6 bg-slate-50/30 border-t border-slate-100">
            <p className="text-center text-sm text-gray-600">
              Already have an account?{" "}
              <button
                onClick={() => navigate("/login")}
                className="text-blue-600 hover:text-blue-700 font-medium transition-colors"
              >
                Sign in
              </button>
            </p>
          </div>
        </div>

        {/* Additional Options */}
        {/* <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-gray-50 text-gray-500">
                Or sign up with
              </span>
            </div>
          </div>

          <div className="mt-6 gap-3">
            <button
              onClick={() => {
                window.location.href = `${
                  import.meta.env.VITE_API_URL
                }/users/auth/google`;
              }}
              className="w-full inline-flex justify-center py-3 px-4 border border-slate-200/60 rounded-lg shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 transition-all duration-200"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              <span className="ml-2">
                Google
              </span>
            </button>
          </div>
        </div> */}
      </div>
    </div>
  );
};

export default Signup;
