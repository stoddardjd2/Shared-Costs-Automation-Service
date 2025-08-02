import React, { useState, useEffect, useRef } from "react";
import {
  Loader2,
  CreditCard,
  Shield,
  CheckCircle,
  AlertCircle,
  Lock,
} from "lucide-react";

// Backend Configuration - Update these variables for your environment
const CONFIG = {
  // Backend API endpoints
  CLIENT_TOKEN_ENDPOINT: "http://localhost:3001/api/braintree/client-token",
  PROCESS_PAYMENT_ENDPOINT:
    "http://localhost:3001/api/braintree/process-payment",

  // Braintree settings from your configuration
  MERCHANT_ID: "8q8qh3y7825xx99t", // Updated to match error logs
  ENVIRONMENT: "sandbox", // IMPORTANT: Make sure this matches your backend environment

  // Payment configuration - UPDATE THIS AMOUNT AS NEEDED
  PAYMENT_AMOUNT: "9.99",
  CURRENCY: "USD",

  // Google Pay Merchant ID (get this from Google Pay console)
  // Leave as null to disable Google Pay, or add your real merchant ID
  GOOGLE_PAY_MERCHANT_ID: null, // Set to your actual Google Pay merchant ID or null to disable
};

const BraintreePayment = () => {
  const [clientToken, setClientToken] = useState(null);
  const [dropinInstance, setDropinInstance] = useState(null);
  const [isInitializing, setIsInitializing] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const dropinContainerRef = useRef(null);
  const submitButtonRef = useRef(null);

  // Fetch client token from backend
  const fetchClientToken = async () => {
    try {
      console.log("=== CLIENT TOKEN REQUEST ===");
      console.log("Fetching client token...", CONFIG.CLIENT_TOKEN_ENDPOINT);
      console.log("Environment:", CONFIG.ENVIRONMENT);
      console.log("Merchant ID:", CONFIG.MERCHANT_ID);

      const response = await fetch(CONFIG.CLIENT_TOKEN_ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        // Send environment info to ensure backend uses correct settings
        body: JSON.stringify({
          environment: CONFIG.ENVIRONMENT,
          merchantId: CONFIG.MERCHANT_ID,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(
          "Client token response error:",
          response.status,
          errorText
        );
        throw new Error(`Failed to fetch client token: ${response.status}`);
      }

      const data = await response.json();
      console.log("Client token received successfully");
      console.log("Token length:", data.clientToken?.length);
      console.log("=== END CLIENT TOKEN REQUEST ===");
      return data.clientToken;
    } catch (err) {
      console.error("Error fetching client token:", err);
      throw new Error("Unable to initialize payment system. Please try again.");
    }
  };

  // Initialize Braintree Drop-in
  const initializeBraintree = async () => {
    try {
      setIsInitializing(true);
      setError(null);

      // Ensure the container element exists before proceeding
      if (!dropinContainerRef.current) {
        throw new Error("Payment container not ready");
      }

      // Load Braintree script if not already loaded
      if (!window.braintree) {
        await loadBraintreeScript();
      }

      const token = await fetchClientToken();
      setClientToken(token);

      // Clear any existing Drop-in instance
      if (dropinInstance) {
        dropinInstance.teardown();
      }

      const instance = await new Promise((resolve, reject) => {
        console.log("=== BRAINTREE DROP-IN CREATION ===");
        console.log("Authorization token length:", token.length);
        console.log("Container element:", dropinContainerRef.current);
        console.log("PayPal config:", {
          flow: "checkout",
          amount: CONFIG.PAYMENT_AMOUNT,
          currency: CONFIG.CURRENCY,
          locale: "en_US",
        });

        window.braintree.dropin.create(
          {
            authorization: token,
            container: dropinContainerRef.current,

            // PayPal configuration - Try minimal version if enhanced doesn't work
            // paypal: {
            //   flow: 'checkout',
            //   amount: CONFIG.PAYMENT_AMOUNT,
            //   currency: CONFIG.CURRENCY
            // },

            // Venmo configuration
            venmo: {
              allowNewBrowserTab: false,
            },

            // Google Pay configuration
            googlePay: {
              googlePayVersion: 2,
              merchantId: CONFIG.GOOGLE_PAY_MERCHANT_ID,
              transactionInfo: {
                totalPriceStatus: "FINAL",
                totalPrice: CONFIG.PAYMENT_AMOUNT,
                currencyCode: CONFIG.CURRENCY,
              },
              allowedPaymentMethods: [
                {
                  type: "CARD",
                  parameters: {
                    billingAddressRequired: true,
                    billingAddressParameters: {
                      format: "FULL",
                    },
                  },
                },
              ],
            },

            // Card configuration with postal code collection
            card: {
              cardholderName: {
                required: false,
              },
            },

            // Styling
            locale: "en_US",
          },
          (createErr, instance) => {
            if (createErr) {
              console.error("=== DROP-IN CREATION ERROR ===");
              console.error("Error details:", createErr);
              console.error("Error message:", createErr.message);
              console.error("Error code:", createErr.code);
              console.error("=== END DROP-IN ERROR ===");
              reject(createErr);
            } else {
              console.log("=== DROP-IN CREATED SUCCESSFULLY ===");
              console.log("Instance:", instance);
              console.log(
                "Payment methods available:",
                instance.isPaymentMethodRequestable()
              );
              console.log("=== END DROP-IN CREATION ===");
              resolve(instance);
            }
          }
        );
      });

      setDropinInstance(instance);

      // Enable submit button when payment method is available
      if (instance.isPaymentMethodRequestable()) {
        submitButtonRef.current?.removeAttribute("disabled");
      }

      // Set up event listeners
      instance.on("paymentMethodRequestable", () => {
        submitButtonRef.current?.removeAttribute("disabled");
      });

      instance.on("noPaymentMethodRequestable", () => {
        submitButtonRef.current?.setAttribute("disabled", "disabled");
      });

      // Add PayPal-specific error handling
      instance.on("paymentOptionSelected", (event) => {
        console.log("Payment option selected:", event);
      });
    } catch (err) {
      console.error("Braintree initialization error:", err);
      setError(err.message || "Failed to initialize payment system");
    } finally {
      setIsInitializing(false);
    }
  };

  // Load Braintree script dynamically
  const loadBraintreeScript = () => {
    return new Promise((resolve, reject) => {
      if (window.braintree) {
        resolve();
        return;
      }

      const script = document.createElement("script");
      script.src =
        "https://js.braintreegateway.com/web/dropin/1.44.1/js/dropin.min.js";
      script.onload = resolve;
      script.onerror = () => reject(new Error("Failed to load Braintree SDK"));
      document.head.appendChild(script);
    });
  };

  // Process payment
  const handlePayment = async () => {
    if (!dropinInstance) return;

    try {
      setIsProcessing(true);
      setError(null);

      // Request payment method nonce with improved error handling
      const payload = await new Promise((resolve, reject) => {
        dropinInstance.requestPaymentMethod((err, payload) => {
          if (err) {
            console.error("Payment method request error:", err);

            // Handle specific PayPal errors
            if (err.message) {
              if (err.message.includes("ppxo_no_token_passed_to_payment")) {
                reject(
                  new Error(
                    "PayPal authorization was cancelled or failed. Please try again."
                  )
                );
              } else if (
                err.message.includes("No payment method is available")
              ) {
                reject(new Error("Please select a payment method first."));
              } else if (err.message.includes("Customer canceled")) {
                reject(new Error("Payment was cancelled. Please try again."));
              } else {
                reject(new Error(`Payment failed: ${err.message}`));
              }
            } else {
              reject(
                new Error("Payment authorization failed. Please try again.")
              );
            }
          } else {
            console.log("Payment method payload:", payload);
            resolve(payload);
          }
        });
      });

      const { nonce, details } = payload;

      // Debug logging
      console.log("=== PAYMENT DEBUG INFO ===");
      console.log("Payment type:", payload.type);
      console.log("Nonce:", nonce);
      console.log("Details:", details);
      console.log("Sending to backend:", CONFIG.PROCESS_PAYMENT_ENDPOINT);

      const requestPayload = {
        paymentMethodNonce: nonce,
        amount: CONFIG.PAYMENT_AMOUNT,
        currency: CONFIG.CURRENCY,
        paymentDetails: details,
      };
      console.log("Request payload:", requestPayload);

      // Send nonce to backend for processing
      const response = await fetch(CONFIG.PROCESS_PAYMENT_ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          paymentMethodNonce: nonce,
          amount: CONFIG.PAYMENT_AMOUNT,
          currency: CONFIG.CURRENCY,
          paymentDetails: details,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.message || `Payment failed: ${response.status}`
        );
      }

      const result = await response.json();

      if (result.success) {
        setSuccess(true);
        // Clear the form after successful payment
        dropinInstance.clearSelectedPaymentMethod();
      } else {
        throw new Error(result.message || "Payment processing failed");
      }
    } catch (err) {
      console.error("Payment processing error:", err);
      setError(err.message || "Payment failed. Please try again.");

      // Clear selected payment method on error
      if (dropinInstance && dropinInstance.clearSelectedPaymentMethod) {
        dropinInstance.clearSelectedPaymentMethod();
      }
    } finally {
      setIsProcessing(false);
    }
  };

  // Reset component state
  const handleReset = () => {
    setSuccess(false);
    setError(null);
    if (dropinInstance) {
      dropinInstance.clearSelectedPaymentMethod();
    }
  };

  // Add styles to head when component mounts
  useEffect(() => {
    // Create style element for Braintree customizations
    const styleElement = document.createElement("style");
    styleElement.textContent = `
      .braintree-dropin {
        font-family: inherit !important;
      }

      .braintree-option__label {
        color: #374151 !important;
        font-weight: 500 !important;
      }

      .braintree-option {
        border-radius: 8px !important;
        border: 2px solid #e5e7eb !important;
        margin-bottom: 12px !important;
      }

      .braintree-option--selected {
        border-color: rgb(37, 99, 235) !important;
        box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1) !important;
      }

      .braintree-form__field-group {
        margin-bottom: 16px !important;
      }
    `;
    document.head.appendChild(styleElement);

    // Initialize Braintree with a slight delay to ensure DOM is ready
    const timer = setTimeout(() => {
      initializeBraintree();
    }, 0);

    // Cleanup on unmount
    return () => {
      clearTimeout(timer);
      if (dropinInstance) {
        dropinInstance.teardown();
      }
      // Remove the style element
      if (document.head.contains(styleElement)) {
        document.head.removeChild(styleElement);
      }
    };
  }, []);

  return (
    <div className="max-w-lg mx-auto p-8 bg-white rounded-2xl shadow-xl font-sans">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-semibold text-gray-800 mb-2 flex items-center justify-center gap-3">
          <Lock size={28} color="rgb(37, 99, 235)" />
          Secure Payment
        </h2>
        <p className="text-gray-500 text-base leading-6">
          Choose your preferred payment method. All transactions are encrypted
          and secure.
        </p>
      </div>

      {!success && (
        <div className="mb-6 p-5 bg-slate-50 rounded-xl border-2 border-gray-200">
          <div className="flex justify-between items-center">
            <span className="font-medium text-gray-500 text-base">
              Amount to Pay:
            </span>
            <span className="font-bold text-blue-600 text-2xl">
              ${CONFIG.PAYMENT_AMOUNT} {CONFIG.CURRENCY}
            </span>
          </div>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-lg mb-5 flex items-center gap-2 text-sm">
          <AlertCircle size={20} />
          {error}
        </div>
      )}

      {success ? (
        <div className="bg-green-50 border border-green-300 text-green-700 p-6 rounded-xl text-center flex flex-col items-center gap-3">
          <CheckCircle size={48} />
          <h3 className="text-xl font-semibold m-0">Payment Successful!</h3>
          <p className="m-0 opacity-80">
            Your payment of ${CONFIG.PAYMENT_AMOUNT} has been processed
            successfully.
          </p>
          <button
            onClick={handleReset}
            className="mt-4 px-4 py-2 bg-transparent border-2 border-green-700 text-green-700 rounded-lg cursor-pointer text-sm font-medium transition-all duration-200 hover:bg-green-700 hover:text-white"
          >
            Make Another Payment
          </button>
        </div>
      ) : (
        <>
          {/* Always render the container, but show loading overlay when initializing */}
          <div className="relative mb-6 min-h-[200px]">
            {/* Braintree Drop-in Container - Always rendered */}
            <div
              ref={dropinContainerRef}
              className={`${
                isInitializing ? "opacity-0" : "opacity-100"
              } transition-opacity duration-300`}
            />

            {/* Loading overlay */}
            {isInitializing && (
              <div className="absolute inset-0 flex flex-col items-center justify-center py-15 px-5 text-gray-500 bg-white">
                <Loader2 size={32} className="animate-spin mb-4" />
                <p>Initializing secure payment system...</p>
              </div>
            )}
          </div>

          <button
            ref={submitButtonRef}
            onClick={handlePayment}
            disabled={isProcessing || isInitializing}
            className={`w-full py-4 px-6 text-white border-none rounded-xl text-base font-semibold cursor-pointer transition-all duration-200 flex items-center justify-center gap-2 min-h-[56px] ${
              isProcessing || isInitializing
                ? "bg-gray-300 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-blue-600/30"
            } ${isProcessing ? "opacity-80" : ""}`}
          >
            {isProcessing ? (
              <>
                <Loader2 size={20} className="animate-spin" />
                Processing Payment...
              </>
            ) : (
              <>
                <CreditCard size={20} />
                Pay ${CONFIG.PAYMENT_AMOUNT}
              </>
            )}
          </button>

          <div className="flex items-center justify-center gap-2 mt-4 p-3 bg-slate-50 rounded-lg text-xs text-gray-500">
            <Shield size={16} />
            <span>PCI DSS Compliant • 256-bit SSL Encryption</span>
          </div>
        </>
      )}
    </div>
  );
};

export default BraintreePayment;
