import React, { useState, useEffect, useRef } from "react";

const BraintreePayment = () => {
  const [clientToken, setClientToken] = useState(null);
  const [braintreeLoaded, setBraintreeLoaded] = useState(false);
  const [braintreeClient, setBraintreeClient] = useState(null);
  const [paypalInstance, setPaypalInstance] = useState(null);
  const [venmoInstance, setVenmoInstance] = useState(null);
  const [googlePayInstance, setGooglePayInstance] = useState(null);
  const [applePayInstance, setApplePayInstance] = useState(null);
  const [dataCollectorInstance, setDataCollectorInstance] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showVenmo, setShowVenmo] = useState(false);
  const [showGooglePay, setShowGooglePay] = useState(false);
  const [showApplePay, setShowApplePay] = useState(false);
  const [paymentResult, setPaymentResult] = useState(null);

  const paypalButtonRef = useRef(null);
  const venmoButtonRef = useRef(null);
  const googlePayButtonRef = useRef(null);
  const applePayButtonRef = useRef(null);
  const scriptsLoadedRef = useRef(false);

  // Configuration - easy to change
  const HOST = "localhost:3001";
  const AMOUNT = "44.00";
  const BACKEND_ENDPOINT = `http://${HOST}/api/braintree/process-payment`; // Backend endpoint for processing payments

  // Load Braintree scripts
  useEffect(() => {
    if (scriptsLoadedRef.current) return;

    const loadScript = (src) => {
      return new Promise((resolve, reject) => {
        if (document.querySelector(`script[src="${src}"]`)) {
          resolve();
          return;
        }

        const script = document.createElement("script");
        script.src = src;
        script.onload = resolve;
        script.onerror = reject;
        document.head.appendChild(script);
      });
    };

    const loadBraintreeScripts = async () => {
      try {
        const baseUrl = "https://js.braintreegateway.com/web/3.124.0/js";
        await Promise.all([
          loadScript(`${baseUrl}/client.min.js`),
          loadScript(`${baseUrl}/paypal-checkout.min.js`),
          loadScript(`${baseUrl}/venmo.min.js`),
          loadScript(`${baseUrl}/google-payment.min.js`),
          loadScript(`${baseUrl}/apple-pay.min.js`),
          loadScript(`${baseUrl}/data-collector.min.js`),
        ]);

        // Load Google Pay API
        await loadScript('https://pay.google.com/gp/p/js/pay.js');

        scriptsLoadedRef.current = true;
        setBraintreeLoaded(true);
      } catch (err) {
        setError("Failed to load Braintree scripts");
        console.error("Error loading Braintree scripts:", err);
      }
    };

    loadBraintreeScripts();
  }, []);

  // Fetch client token
  useEffect(() => {
    const fetchClientToken = async () => {
      try {
        const response = await fetch(
          `http://${HOST}/api/braintree/client-token`,
          { 
            method: "POST",
            headers: {
              'Content-Type': 'application/json',
            }
          }
        );
        if (!response.ok) {
          throw new Error(`Failed to fetch client token: ${response.status}`);
        }
        const data = await response.json();
        const token = data.clientToken || data.client_token || data.token;
        if (!token) {
          throw new Error("No client token received from server");
        }
        setClientToken(token);
      } catch (err) {
        setError(`Failed to fetch client token: ${err.message}`);
        console.error("Error fetching client token:", err);
      }
    };

    fetchClientToken();
  }, []);

  // Initialize Braintree client and components
  useEffect(() => {
    if (!braintreeLoaded || !clientToken || !window.braintree) return;

    const initializeBraintree = async () => {
      try {
        // Create client
        window.braintree.client.create(
          {
            authorization: clientToken, // Use the fetched client token
          },
          (clientErr, clientInstance) => {
            if (clientErr) {
              setError("Error creating Braintree client");
              console.error("Error creating client:", clientErr);
              return;
            }

            setBraintreeClient(clientInstance);

            // Create data collector
            window.braintree.dataCollector.create(
              {
                client: clientInstance,
                paypal: true,
              },
              (dataCollectorErr, dataCollectorInstance) => {
                if (dataCollectorErr) {
                  console.error(
                    "Error creating data collector:",
                    dataCollectorErr
                  );
                  return;
                }
                setDataCollectorInstance(dataCollectorInstance);
              }
            );

            // Create PayPal component
            window.braintree.paypalCheckout.create(
              {
                client: clientInstance,
              },
              (paypalErr, paypalInstance) => {
                if (paypalErr) {
                  console.error("Error creating PayPal:", paypalErr);
                  return;
                }
                setPaypalInstance(paypalInstance);
              }
            );

            // Create Venmo component
            window.braintree.venmo.create(
              {
                client: clientInstance,
                allowDesktop: true,
                allowDesktopWebLogin: true,
                mobileWebFallBack: true,
                paymentMethodUsage: "single_use",
              },
              (venmoErr, venmoInstance) => {
                if (venmoErr) {
                  console.error("Error creating Venmo:", venmoErr);
                  return;
                }

                // Check if browser supports Venmo
                if (venmoInstance.isBrowserSupported()) {
                  setVenmoInstance(venmoInstance);
                  setShowVenmo(true);

                  // Check for existing tokenization result (for new tab returns)
                  if (venmoInstance.hasTokenizationResult()) {
                    venmoInstance.tokenize((tokenizeErr, payload) => {
                      if (tokenizeErr) {
                        handleVenmoError(tokenizeErr);
                      } else {
                        handleVenmoSuccess(payload);
                      }
                    });
                  }
                }
              }
            );

            // Create Google Pay component
            if (window.google && window.google.payments) {
              try {
                const paymentsClient = new google.payments.api.PaymentsClient({
                  environment: 'TEST' // Sandbox mode
                });

                const isReadyToPayRequest = {
                  apiVersion: 2,
                  apiVersionMinor: 0,
                  allowedPaymentMethods: [{
                    type: 'CARD',
                    parameters: {
                      allowedAuthMethods: ['PAN_ONLY', 'CRYPTOGRAM_3DS'],
                      allowedCardNetworks: ['MASTERCARD', 'VISA', 'AMEX', 'DISCOVER']
                    },
                    tokenizationSpecification: {
                      type: 'PAYMENT_GATEWAY',
                      parameters: {
                        'gateway': 'braintree',
                        'braintree:apiVersion': 'v1',
                        'braintree:sdkVersion': '3.124.0',
                        'braintree:merchantId': 'your_braintree_merchant_id',
                        'braintree:clientKey': clientToken
                      }
                    }
                  }]
                };

                paymentsClient.isReadyToPay(isReadyToPayRequest)
                  .then((response) => {
                    if (response.result) {
                      setGooglePayInstance(paymentsClient);
                      setShowGooglePay(true);
                    } else {
                      console.log('Google Pay not available for this user');
                    }
                  })
                  .catch((err) => {
                    console.error('Google Pay not ready:', err);
                  });
              } catch (err) {
                console.error('Error initializing Google Pay:', err);
              }
            } else {
              console.log('Google Pay API not loaded');
            }

            // Create Apple Pay component
            if (window.ApplePaySession && ApplePaySession.canMakePayments()) {
              if (window.braintree.applePay) {
                window.braintree.applePay.create(
                  {
                    client: clientInstance,
                  },
                  (applePayErr, applePayInstance) => {
                    if (applePayErr) {
                      console.error("Error creating Apple Pay:", applePayErr);
                      return;
                    }
                    setApplePayInstance(applePayInstance);
                    setShowApplePay(true);
                  }
                );
              } else {
                console.log("Braintree Apple Pay module not available");
              }
            } else {
              console.log("Apple Pay not supported on this device/browser");
            }
          }
        );
      } catch (err) {
        setError("Failed to initialize Braintree");
        console.error("Error initializing Braintree:", err);
      }
    };

    initializeBraintree();
  }, [braintreeLoaded, clientToken]);

  // Send payment to backend
  const sendPaymentToBackend = async (paymentData) => {
    try {
      const response = await fetch(BACKEND_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          nonce: paymentData.nonce,
          amount: AMOUNT,
          deviceData: paymentData.deviceData,
          paymentMethod: paymentData.type,
          details: paymentData.details
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
        throw new Error(errorData.message || `Server error: ${response.status}`);
      }

      const result = await response.json();
      return result;
    } catch (err) {
      console.error('Backend payment processing error:', err);
      throw err;
    }
  };

  const handlePaymentSuccess = async (paymentData) => {
    console.log("Payment method tokenized:", paymentData);
    
    setLoading(true);
    setError(null);

    try {
      // Send payment to backend for processing
      const backendResult = await sendPaymentToBackend(paymentData);
      
      setPaymentResult({
        success: true,
        data: paymentData,
        backendResult: backendResult,
        transactionId: backendResult.transaction?.id || backendResult.id
      });
    } catch (err) {
      setPaymentResult({
        success: false,
        error: err.message || "Backend processing failed",
        data: paymentData
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentError = (error) => {
    console.error("Payment failed:", error);
    setPaymentResult({
      success: false,
      error: error.message || "Payment failed",
    });
    setLoading(false);
  };

  const handlePayPalPayment = () => {
    if (!paypalInstance || loading) return;

    setLoading(true);
    setError(null);
    setPaymentResult(null);

    paypalInstance.loadPayPalSDK(
      {
        currency: "USD",
        intent: "capture",
      },
      () => {
        paypalInstance.createPayment(
          {
            flow: "checkout",
            amount: AMOUNT,
            currency: "USD",
          },
          (createPaymentErr, data) => {
            if (createPaymentErr) {
              setLoading(false);
              setError("Error creating PayPal payment");
              handlePaymentError(createPaymentErr);
              return;
            }

            paypalInstance.tokenizePayment(data, (tokenizeErr, payload) => {
              if (tokenizeErr) {
                setLoading(false);
                setError("Error processing PayPal payment");
                handlePaymentError(tokenizeErr);
                return;
              }

              const paymentData = {
                nonce: payload.nonce,
                details: payload.details,
                deviceData: dataCollectorInstance?.deviceData,
                type: "PayPal",
              };

              handlePaymentSuccess(paymentData);
            });
          }
        );
      }
    );
  };

  const handleVenmoPayment = () => {
    if (!venmoInstance || loading) return;

    setLoading(true);
    setError(null);
    setPaymentResult(null);

    venmoInstance.tokenize((tokenizeErr, payload) => {
      if (tokenizeErr) {
        setLoading(false);
        handleVenmoError(tokenizeErr);
        return;
      }

      handleVenmoSuccess(payload);
    });
  };

  const handleGooglePayPayment = () => {
    if (!googlePayInstance || loading) return;

    setLoading(true);
    setError(null);
    setPaymentResult(null);

    try {
      const paymentDataRequest = {
        apiVersion: 2,
        apiVersionMinor: 0,
        allowedPaymentMethods: [{
          type: 'CARD',
          parameters: {
            allowedAuthMethods: ['PAN_ONLY', 'CRYPTOGRAM_3DS'],
            allowedCardNetworks: ['MASTERCARD', 'VISA', 'AMEX', 'DISCOVER']
          },
          tokenizationSpecification: {
            type: 'PAYMENT_GATEWAY',
            parameters: {
              'gateway': 'braintree',
              'braintree:apiVersion': 'v1',
              'braintree:sdkVersion': '3.124.0',
              'braintree:merchantId': 'your_braintree_merchant_id',
              'braintree:clientKey': clientToken
            }
          }
        }],
        transactionInfo: {
          totalPriceStatus: 'FINAL',
          totalPrice: AMOUNT,
          currencyCode: 'USD',
          countryCode: 'US'
        },
        merchantInfo: {
          merchantName: 'Your Merchant Name',
          merchantId: 'BCR2DN4T2NCKM7LL'
        }
      };

      googlePayInstance.loadPaymentData(paymentDataRequest)
        .then((paymentData) => {
          // Process the actual Google Pay response
          const paymentResult = {
            nonce: paymentData.paymentMethodData.tokenizationData.token,
            details: { 
              email: paymentData.email || 'google-pay-user@example.com',
              cardNetwork: paymentData.paymentMethodData.info?.cardNetwork || 'UNKNOWN',
              cardDetails: paymentData.paymentMethodData.info?.cardDetails || 'XXXX'
            },
            deviceData: dataCollectorInstance?.deviceData,
            type: "Google Pay",
          };
          handlePaymentSuccess(paymentResult);
        })
        .catch((err) => {
          setLoading(false);
          if (err.statusCode === 'CANCELED') {
            setError("Google Pay payment was cancelled");
          } else {
            setError("Error with Google Pay payment");
          }
          handlePaymentError(err);
        });
    } catch (err) {
      setLoading(false);
      setError("Error initializing Google Pay payment");
      handlePaymentError(err);
    }
  };

  const handleApplePayPayment = () => {
    if (!applePayInstance || loading) return;

    setLoading(true);
    setError(null);
    setPaymentResult(null);

    try {
      const paymentRequest = {
        countryCode: 'US',
        currencyCode: 'USD',
        supportedNetworks: ['visa', 'masterCard', 'amex', 'discover'],
        merchantCapabilities: ['supports3DS'],
        total: {
          label: 'Your Merchant Name',
          amount: AMOUNT
        }
      };

      applePayInstance.performPayment(paymentRequest, (performPaymentErr, payload) => {
        if (performPaymentErr) {
          setLoading(false);
          setError("Error processing Apple Pay payment");
          handlePaymentError(performPaymentErr);
          return;
        }

        const paymentData = {
          nonce: payload.nonce,
          details: { 
            cardType: 'Apple Pay',
            ...payload.details 
          },
          deviceData: dataCollectorInstance?.deviceData,
          type: "Apple Pay",
        };
        handlePaymentSuccess(paymentData);
      });
    } catch (err) {
      setLoading(false);
      setError("Error initializing Apple Pay payment");
      handlePaymentError(err);
    }
  };

  const handleVenmoError = (err) => {
    if (err.code === "VENMO_CANCELED") {
      setError("Venmo app is not available or payment was cancelled");
    } else if (err.code === "VENMO_APP_CANCELED") {
      setError("Payment was cancelled in Venmo app");
    } else {
      setError("An error occurred with Venmo payment");
    }
    handlePaymentError(err);
  };

  const handleVenmoSuccess = (payload) => {
    const paymentData = {
      nonce: payload.nonce,
      details: payload.details,
      deviceData: dataCollectorInstance?.deviceData,
      type: "Venmo",
      username: payload.details.username,
    };

    handlePaymentSuccess(paymentData);
  };

  const resetPayment = () => {
    setPaymentResult(null);
    setError(null);
  };

  if (!braintreeLoaded || !clientToken) {
    return (
      <div className="max-w-md mx-auto mt-8 p-4 border rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold mb-6 text-center">
          Braintree Payment
        </h2>
        <div className="animate-pulse">
          <div className="h-12 bg-gray-200 rounded mb-3"></div>
          <div className="h-12 bg-gray-200 rounded mb-3"></div>
          <div className="h-12 bg-gray-200 rounded mb-3"></div>
          <div className="h-12 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto mt-8">
      <h2 className="text-2xl font-bold mb-6 text-center">Braintree Payment</h2>

      <div className="p-4 space-y-3 border rounded-lg shadow-lg">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        {/* PayPal Button */}
        <button
          ref={paypalButtonRef}
          onClick={handlePayPalPayment}
          disabled={loading || !paypalInstance}
          className="w-full bg-[#0070ba] hover:bg-[#005ea6] disabled:bg-gray-400 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2"
        >
          {loading ? (
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
          ) : (
            <>
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M7.016 19.625h-4.4a.6.6 0 0 1-.594-.694L4.814 4.181c.073-.48.49-.847.977-.847h8.083c2.378 0 4.083.452 5.111 1.356 1.028.904 1.542 2.24 1.542 4.009 0 3.088-1.596 4.807-4.793 5.18v.095c3.652.372 5.479 2.308 5.479 5.808 0 1.744-.461 3.291-1.382 4.641-.921 1.35-2.226 2.388-3.918 3.113-1.692.725-3.662 1.088-5.911 1.088H7.016zm2.877-11.664h2.444c1.237 0 2.152-.332 2.746-.996.594-.664.891-1.602.891-2.815 0-1.213-.26-2.067-.782-2.563-.522-.496-1.366-.753-2.533-.753H8.128l1.765 7.127zm-1.403 7.132h3.165c1.355 0 2.401-.37 3.14-1.109.739-.739 1.108-1.727 1.108-2.963 0-1.236-.369-2.146-1.108-2.815-.739-.669-1.785-.998-3.14-.998H8.49l1.0 6.885z"/>
              </svg>
              <span>Pay with PayPal</span>
            </>
          )}
        </button>

        {/* Apple Pay Button */}
        {showApplePay && (
          <button
            ref={applePayButtonRef}
            onClick={handleApplePayPayment}
            disabled={loading}
            className="w-full bg-black hover:bg-gray-800 disabled:bg-gray-400 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2"
          >
            {loading ? (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            ) : (
              <>
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
                </svg>
                <span>Pay with Apple Pay</span>
              </>
            )}
          </button>
        )}

        {/* Google Pay Button */}
        {showGooglePay && (
          <button
            ref={googlePayButtonRef}
            onClick={handleGooglePayPayment}
            disabled={loading}
            className="w-full bg-[#4285f4] hover:bg-[#3367d6] disabled:bg-gray-400 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2"
          >
            {loading ? (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            ) : (
              <>
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                <span>Pay with Google Pay</span>
              </>
            )}
          </button>
        )}

        {/* Venmo Button */}
        {showVenmo && (
          <button
            ref={venmoButtonRef}
            onClick={handleVenmoPayment}
            disabled={loading || !venmoInstance}
            className="w-full bg-[#008cff] hover:bg-[#0077d9] disabled:bg-gray-400 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2"
          >
            {loading ? (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            ) : (
              <>
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M9.39 5.73l-1.45 12.14h-2.6L7.17 5.73h2.22zm4.21 0h-1.86L9.2 17.87h1.7l1.51-6.76h.03l1.16 6.76h1.7l2.54-12.14zm4.6 0v1.8h-2.91v2.94h2.69v1.8h-2.69v3.8h2.91v1.8h-5.03V5.73h5.03z"/>
                </svg>
                <span>Pay with Venmo</span>
              </>
            )}
          </button>
        )}

        <div className="text-sm text-gray-600 text-center pt-2 border-t">
          Amount: ${AMOUNT} • Backend: {HOST}
        </div>
      </div>

      {paymentResult && (
        <div
          className={`mt-4 p-4 rounded ${
            paymentResult.success
              ? "bg-green-50 text-green-800 border border-green-200"
              : "bg-red-50 text-red-800 border border-red-200"
          }`}
        >
          {paymentResult.success ? (
            <div>
              <h3 className="font-semibold">✅ Payment Processed Successfully!</h3>
              {paymentResult.transactionId && (
                <p className="text-sm mt-1">Transaction ID: {paymentResult.transactionId}</p>
              )}
              <p className="text-sm">Payment Method: {paymentResult.data.type}</p>
              <p className="text-xs mt-1 opacity-75">Nonce: {paymentResult.data.nonce}</p>
              {paymentResult.data.username && (
                <p className="text-sm">Venmo: @{paymentResult.data.username}</p>
              )}
              <button 
                onClick={resetPayment}
                className="mt-2 text-sm bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700"
              >
                Make Another Payment
              </button>
            </div>
          ) : (
            <div>
              <h3 className="font-semibold">❌ Payment Failed</h3>
              <p className="text-sm">{paymentResult.error}</p>
              <button 
                onClick={resetPayment}
                className="mt-2 text-sm bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
              >
                Try Again
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default BraintreePayment;