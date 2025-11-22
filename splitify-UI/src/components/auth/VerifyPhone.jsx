import React, { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  CheckCircle,
  AlertCircle,
  ArrowRight,
  RefreshCw,
  X,
  ShieldCheck,
  CheckIcon,
} from "lucide-react";
import {
  pageview,
  gaEvent,
} from "../../googleAnalytics/googleAnalyticsHelpers";

import { verifyPhoneCode, sendPhoneCode } from "../../queries/auth";

const CODE_LENGTH = 6;
const INITIAL_RESEND_SECONDS = 5;
const RESEND_COOLDOWN_SECONDS = 60;

const VerifyPhone = ({ initialPhone, password }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const [phone] = useState(initialPhone);
  const [code, setCode] = useState("");
  const [notification, setNotification] = useState(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);

  const [resendLeft, setResendLeft] = useState(INITIAL_RESEND_SECONDS);

  const resendIntervalRef = useRef(null);
  const codeInputRef = useRef(null);

  const resendLockRef = useRef(false); // prevents double-clicks during cooldown

  useEffect(() => {
    document.getElementById("root")?.scrollTo({ top: 0 });
    pageview(null, "VerifyPhone_page");

    startResendTimer(INITIAL_RESEND_SECONDS);

    setTimeout(() => codeInputRef.current?.focus(), 50);

    return () => {
      if (resendIntervalRef.current) clearInterval(resendIntervalRef.current);
    };
  }, []);

  const showNotification = (message, type = "error") => {
    setNotification({ message, type });
    if (type === "success") {
      setTimeout(() => setNotification(null), 5000);
    }
  };

  const hideNotification = () => setNotification(null);

  const stopResendTimer = () => {
    if (resendIntervalRef.current) {
      clearInterval(resendIntervalRef.current);
      resendIntervalRef.current = null;
    }
  };

  // 🔧 CHANGED: timer unlocks resendLockRef when it hits 0
  const startResendTimer = (seconds) => {
    setResendLeft(seconds);
    stopResendTimer();

    resendIntervalRef.current = setInterval(() => {
      setResendLeft((s) => {
        if (s <= 1) {
          stopResendTimer();
          resendLockRef.current = false; // ✅ unlock ONLY when cooldown done
          return 0;
        }
        return s - 1;
      });
    }, 1000);
  };

  const handleCodeChange = (e) => {
    const digitsOnly = e.target.value.replace(/\D/g, "").slice(0, CODE_LENGTH);
    setCode(digitsOnly);
    if (notification) setNotification(null);
  };

  const handleVerify = async () => {
    hideNotification();

    if (!phone) {
      showNotification("Missing phone number. Please restart signup.", "error");
      return;
    }

    if (code.length !== CODE_LENGTH) {
      showNotification("Please enter the 6-digit code", "error");
      return;
    }

    setIsVerifying(true);
    try {
      const res = await verifyPhoneCode(phone, code, password);

      if (res?.success) {
        // Store token in localStorage if registration is successful
        if (res.success && res.data.token) {
          localStorage.setItem("token", res.data.token);
        }

        gaEvent("phone_verified", {
          event_category: "engagement",
          event_label: "Verify phone - Success",
        });

        // showNotification("Phone number verified!", "success");
        gaEvent("signup_completed", {
          event_category: "engagement",
          event_label: `Create Account Button CTA-Signup`,
        });
        setTimeout(() => {
          navigate(`/dashboard${location.search}`);
        }, 200);
      } else {
        showNotification(
          res?.errors?.[0]?.msg ||
            res?.message ||
            "Invalid code. Please try again.",
          "error"
        );
      }
    } catch (err) {
      showNotification(
        err?.response?.data?.message ||
          err?.response?.data?.error ||
          "Network error. Please try again.",
        "error"
      );
    } finally {
      setTimeout(() => setIsVerifying(false), 250);
    }
  };

  const handleResend = async () => {
    // 🔧 CHANGED: lock blocks re-clicks even *before* state updates render
    if (resendLeft > 0 || isResending || resendLockRef.current) return;

    hideNotification();

    if (!phone) {
      showNotification("Missing phone number. Please restart signup.", "error");
      return;
    }

    // ✅ Authoritative cooldown on click
    resendLockRef.current = true;
    startResendTimer(RESEND_COOLDOWN_SECONDS);

    setIsResending(true);
    try {
      const res = await sendPhoneCode(phone);
      console.log("resend res!!", res);
      // ✅ Treat any non-throwing response as "probably sent"
      if (res?.success) {
        gaEvent("phone_verification_code_resent", {
          event_category: "engagement",
          event_label: "Verify phone - Resend",
        });

        showNotification("New code sent!", "success");
        setTimeout(() => codeInputRef.current?.focus(), 50);
      } else {
        // 🔧 CHANGED: do NOT cancel cooldown here
        showNotification(
          res?.errors?.[0]?.msg ||
            res?.message ||
            "We tried to resend. If you don’t get it, try again in a minute.",
          "error"
        );
      }
    } catch (err) {
      // 🔧 CHANGED: do NOT cancel cooldown here either
      showNotification(
        err?.response?.data?.message ||
          err?.response?.data?.error ||
          "Network error. Please try again in a minute.",
        "error"
      );
    } finally {
      setTimeout(() => setIsResending(false), 250);
      // 🔧 CHANGED: no unlock here — timer will unlock at 0
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-600 rounded-2xl mx-auto mb-6 flex items-center justify-center">
            <CheckIcon className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Verify your phone
          </h2>
          <p className="text-gray-600">
            Enter the code we sent to{" "}
            <span className="font-medium text-gray-900">
              {phone || "your phone"}
            </span>
            .
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
                  onClick={() => setNotification(null)}
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

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200/60 overflow-hidden">
          <div className="p-8">
            <div className="space-y-6">
              {/* Code Field */}
              <div>
                <label
                  htmlFor="code"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  6-digit code
                </label>

                <input
                  ref={codeInputRef}
                  id="code"
                  name="code"
                  type="text"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  value={code}
                  onChange={handleCodeChange}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleVerify();
                    }
                  }}
                  className="block w-full px-3 py-3 border border-slate-200/60 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-600 focus:border-blue-500 transition-all duration-200 tracking-widest text-lg text-center"
                  placeholder="••••••"
                />

                <div className="mt-3 flex items-center justify-between">
                  <button
                    onClick={handleResend}
                    disabled={resendLeft > 0 || isResending}
                    className="inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 font-medium disabled:text-gray-400 disabled:cursor-not-allowed"
                  >
                    <RefreshCw className="w-4 h-4" />
                    {resendLeft > 0
                      ? `Resend in ${resendLeft}s`
                      : "Resend code"}
                  </button>

                  <p className="text-xs text-gray-500">
                    Didn’t get it? Try resending.
                  </p>
                </div>
              </div>

              {/* Verify Button */}
              <button
                onClick={handleVerify}
                disabled={isVerifying}
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-1 focus:ring-blue-600 focus:ring-offset-2 transition-all duration-200 transform hover:scale-[1.02] font-medium shadow-sm flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {isVerifying ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    Verify phone
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Footer */}
          <div className="px-8 py-6 bg-slate-50/30 border-t border-slate-100">
            <p className="text-center text-sm text-gray-600">
              Need help?{" "}
              <a
                onClick={() => navigate("/?support=true")}
                className="text-blue-600 cursor-pointer hover:text-blue-700 font-medium transition-colors"
              >
                Contact support
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerifyPhone;
