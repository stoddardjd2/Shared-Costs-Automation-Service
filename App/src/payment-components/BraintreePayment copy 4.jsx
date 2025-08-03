import React, { useState, useEffect, useRef } from "react";

const BraintreePayment = () => {
  const [clientToken, setClientToken] = useState(null);
  const [braintreeLoaded, setBraintreeLoaded] = useState(false);
  const [braintreeClient, setBraintreeClient] = useState(null);
  const [hostedFieldsInstance, setHostedFieldsInstance] = useState(null);
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
  const [cardFormValid, setCardFormValid] = useState(false);
  const [cardFormState, setCardFormState] = useState({
    number: { isValid: false, isEmpty: true },
    expirationDate: { isValid: false, isEmpty: true },
    cvv: { isValid: false, isEmpty: true }
  });

  const paypalButtonRef = useRef(null);
  const venmoButtonRef = useRef(null);
  const googlePayButtonRef = useRef(null);
  const applePayButtonRef = useRef(null);
  const scriptsLoadedRef = useRef(false);

  // Configuration - IMPORTANT: Update these with your actual values
  const HOST = "localhost:3001";
  const AMOUNT = "33.00";
  const BACKEND_ENDPOINT = `http://${HOST}/api/braintree/process-payment`;
  
  // IMPORTANT: Replace these with your actual values from Braintree dashboard
  const MERCHANT_CONFIG = {
    // Get this from your Braintree dashboard - Settings > Business
    merchantId: '8q8qh3y7825xx99t',
    merchantName: 'SmartSplit'
  };

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
          loadScript(`${baseUrl}/hosted-fields.min.js`),
          loadScript(`${baseUrl}/paypal-checkout.min.js`),
          loadScript(`${baseUrl}/venmo.min.js`),
          loadScript(`${baseUrl}/google-payment.min.js`),
          loadScript(`${baseUrl}/apple-pay.min.js`),
          loadScript(`${baseUrl}/data-collector.min.js`),
        ]);

        // Load Google Pay API only if Google Pay will be used
        if (window.google?.payments || !window.google) {
          await loadScript('https://pay.google.com/gp/p/js/pay.js');
        }

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
        // Clean up existing hosted fields if they exist
        if (hostedFieldsInstance) {
          try {
            hostedFieldsInstance.teardown(() => {
              console.log('Hosted fields cleaned up');
            });
          } catch (err) {
            console.log('Error during hosted fields cleanup:', err);
          }
          setHostedFieldsInstance(null);
        }

        // Create client
        window.braintree.client.create(
          {
            authorization: clientToken,
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
                  console.error("Error creating data collector:", dataCollectorErr);
                  return;
                }
                setDataCollectorInstance(dataCollectorInstance);
              }
            );

            // Create Hosted Fields for card input with cleanup check
            const createHostedFields = () => {
              // Check if elements exist and are empty
              const cardNumberEl = document.getElementById('card-number');
              const cvvEl = document.getElementById('cvv');
              const expirationEl = document.getElementById('expiration-date');
              
              if (!cardNumberEl || !cvvEl || !expirationEl) {
                console.log('Hosted field elements not ready, retrying...');
                setTimeout(createHostedFields, 100);
                return;
              }

              // Clear any existing content in the elements
              cardNumberEl.innerHTML = '';
              cvvEl.innerHTML = '';
              expirationEl.innerHTML = '';

              window.braintree.hostedFields.create({
                client: clientInstance,
                styles: {
                  'input': {
                    'font-size': '16px',
                    'font-family': 'system-ui, -apple-system, sans-serif',
                    'color': '#374151',
                    'padding': '12px'
                  },
                  'input:focus': {
                    'color': '#1f2937'
                  },
                  '.invalid': {
                    'color': '#ef4444'
                  },
                  '.valid': {
                    'color': '#059669'
                  }
                },
                fields: {
                  number: {
                    selector: '#card-number',
                    placeholder: '4111 1111 1111 1111'
                  },
                  cvv: {
                    selector: '#cvv',
                    placeholder: '123'
                  },
                  expirationDate: {
                    selector: '#expiration-date',
                    placeholder: 'MM/YY'
                  }
                }
              }, (hostedFieldsErr, hostedFieldsInstance) => {
                if (hostedFieldsErr) {
                  console.error('Error creating hosted fields:', hostedFieldsErr);
                  if (hostedFieldsErr.code === 'HOSTED_FIELDS_FIELD_DUPLICATE_IFRAME') {
                    console.log('Duplicate iframe detected, clearing and retrying...');
                    // Clear the elements and try again
                    setTimeout(() => {
                      cardNumberEl.innerHTML = '';
                      cvvEl.innerHTML = '';
                      expirationEl.innerHTML = '';
                      createHostedFields();
                    }, 500);
                  }
                  return;
                }

                setHostedFieldsInstance(hostedFieldsInstance);

                // Listen for validation events
                hostedFieldsInstance.on('validityChange', (event) => {
                  const newState = { ...cardFormState };
                  event.fields.number && (newState.number = event.fields.number);
                  event.fields.expirationDate && (newState.expirationDate = event.fields.expirationDate);
                  event.fields.cvv && (newState.cvv = event.fields.cvv);
                  
                  setCardFormState(newState);
                  
                  const isValid = Object.values(newState).every(field => field.isValid);
                  setCardFormValid(isValid);
                });
              });
            };

            // Start hosted fields creation
            createHostedFields();

            // Create PayPal component - FIXED: Proper Braintree PayPal integration
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

                if (venmoInstance.isBrowserSupported()) {
                  setVenmoInstance(venmoInstance);
                  setShowVenmo(true);

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

            // Create Google Pay component - Fixed to avoid manifest warnings
            if (window.google && window.google.payments) {
              try {
                window.braintree.googlePayment.create({
                  client: clientInstance,
                  googlePayVersion: 2
                }, (googlePayErr, googlePayInstance) => {
                  if (googlePayErr) {
                    console.error('Error creating Google Pay:', googlePayErr);
                    return;
                  }

                  const paymentsClient = new google.payments.api.PaymentsClient({
                    environment: 'TEST' // Change to 'PRODUCTION' for live
                  });

                  const isReadyToPayRequest = googlePayInstance.createPaymentDataRequest({
                    transactionInfo: {
                      totalPriceStatus: 'FINAL',
                      totalPrice: AMOUNT,
                      currencyCode: 'USD'
                    }
                  });

                  paymentsClient.isReadyToPay(isReadyToPayRequest)
                    .then((response) => {
                      if (response.result) {
                        setGooglePayInstance({
                          braintreeInstance: googlePayInstance,
                          paymentsClient: paymentsClient
                        });
                        setShowGooglePay(true);
                      }
                    })
                    .catch((err) => {
                      // Suppress Google Pay manifest errors in console
                      if (!err.message?.includes('manifest')) {
                        console.error('Google Pay not ready:', err);
                      }
                    });
                });
              } catch (err) {
                console.error('Error initializing Google Pay:', err);
              }
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
              }
            }
          }
        );
      } catch (err) {
        setError("Failed to initialize Braintree");
        console.error("Error initializing Braintree:", err);
      }
    };

    initializeBraintree();

    // Cleanup function to teardown hosted fields when component unmounts
    return () => {
      if (hostedFieldsInstance) {
        try {
          hostedFieldsInstance.teardown(() => {
            console.log('Hosted fields torn down on cleanup');
          });
        } catch (err) {
          console.log('Error during cleanup teardown:', err);
        }
      }
    };
  }, [braintreeLoaded, clientToken]); // Remove hostedFieldsInstance from dependencies to prevent re-initialization

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

  const handleCardPayment = () => {
    if (!hostedFieldsInstance || loading || !cardFormValid) return;

    setLoading(true);
    setError(null);
    setPaymentResult(null);

    hostedFieldsInstance.tokenize((tokenizeErr, payload) => {
      if (tokenizeErr) {
        setLoading(false);
        setError("Error processing card payment");
        handlePaymentError(tokenizeErr);
        return;
      }

      const paymentData = {
        nonce: payload.nonce,
        details: payload.details,
        deviceData: dataCollectorInstance?.deviceData,
        type: "Credit Card",
      };

      handlePaymentSuccess(paymentData);
    });
  };

  // FIXED: Proper PayPal implementation with better error handling and validation
  const handlePayPalPayment = () => {
    if (!paypalInstance || loading) return;

    setLoading(true);
    setError(null);
    setPaymentResult(null);

    // Create PayPal payment with proper validation
    paypalInstance.createPayment({
      flow: 'checkout', // Required
      amount: AMOUNT,
      currency: 'USD',
      // Remove intent as it may cause issues with some configurations
      intent: 'capture' 
    }, (createErr, data) => {
      if (createErr) {
        setLoading(false);
        console.error('PayPal createPayment error:', createErr);
        
        // Provide more specific error messages
        if (createErr.code === 'PAYPAL_INVALID_PAYMENT_OPTION') {
          setError("PayPal configuration error. Please check your Braintree setup.");
        } else if (createErr.code === 'PAYPAL_ACCOUNT_TOKENIZATION_FAILED') {
          setError("PayPal account setup required. Please check your Braintree PayPal configuration.");
        } else {
          setError(`PayPal error: ${createErr.message || 'Unknown error'}`);
        }
        
        handlePaymentError(createErr);
        return;
      }

      // Tokenize the payment
      paypalInstance.tokenizePayment(data, (tokenizeErr, payload) => {
        if (tokenizeErr) {
          setLoading(false);
          console.error('PayPal tokenization error:', tokenizeErr);
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
    });
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

  // FIXED: Proper Google Pay implementation
  const handleGooglePayPayment = () => {
    if (!googlePayInstance || loading) return;

    setLoading(true);
    setError(null);
    setPaymentResult(null);

    try {
      const { braintreeInstance, paymentsClient } = googlePayInstance;
      
      const paymentDataRequest = braintreeInstance.createPaymentDataRequest({
        transactionInfo: {
          totalPriceStatus: 'FINAL',
          totalPrice: AMOUNT,
          currencyCode: 'USD',
          countryCode: 'US'
        }
      });

      paymentsClient.loadPaymentData(paymentDataRequest)
        .then((paymentData) => {
          return braintreeInstance.parseResponse(paymentData);
        })
        .then((result) => {
          const paymentData = {
            nonce: result.nonce,
            details: result.details,
            deviceData: dataCollectorInstance?.deviceData,
            type: "Google Pay",
          };
          handlePaymentSuccess(paymentData);
        })
        .catch((err) => {
          setLoading(false);
          if (err.statusCode === 'CANCELED') {
            setError("Google Pay payment was cancelled");
          } else {
            setError("Error with Google Pay payment");
            console.error('Google Pay error:', err);
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
          label: MERCHANT_CONFIG.merchantName,
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
      <div className="max-w-md mx-auto mt-8 p-6 bg-white border border-gray-200 rounded-xl shadow-lg">
        <h2 className="text-2xl font-bold mb-6 text-center text-gray-900">
          Secure Payment
        </h2>
        <div className="animate-pulse space-y-4">
          <div className="h-12 bg-gray-200 rounded-lg"></div>
          <div className="h-12 bg-gray-200 rounded-lg"></div>
          <div className="h-12 bg-gray-200 rounded-lg"></div>
          <div className="h-12 bg-gray-200 rounded-lg"></div>
        </div>
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-800">
            <strong>Backend Configuration Error:</strong> 
            <br />Your backend is using an invalid merchant ID: "8q8qh3y7825xx99t"
            <br />Please update your backend with your actual Braintree merchant ID from your dashboard.
          </p>
        </div>
        <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-800">
            <strong>Additional Setup:</strong> 
            <br />1. Update MERCHANT_CONFIG with your Braintree merchant ID
            <br />2. Enable Google Pay in your Braintree sandbox console
            <br />3. Enable PayPal in your Braintree sandbox console
            <br />4. Update your backend configuration with valid credentials
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto mt-8">
      <div className="bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4">
          <h2 className="text-2xl font-bold text-white text-center">Secure Payment</h2>
          <p className="text-blue-100 text-center text-sm mt-1">Amount: ${AMOUNT}</p>
        </div>

        <div className="p-6 space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center">
              <svg className="w-5 h-5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd"/>
              </svg>
              <span className="text-sm">{error}</span>
            </div>
          )}

          {/* Card Payment Form */}
          <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
            <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
              <svg className="w-5 h-5 mr-2 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4zM18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z"/>
              </svg>
              Credit or Debit Card
            </h3>
            
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Card Number</label>
                <div id="card-number" className="border border-gray-300 rounded-md h-12 bg-white"></div>
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Expiry Date</label>
                  <div id="expiration-date" className="border border-gray-300 rounded-md h-12 bg-white"></div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">CVV</label>
                  <div id="cvv" className="border border-gray-300 rounded-md h-12 bg-white"></div>
                </div>
              </div>
            </div>

            <button
              onClick={handleCardPayment}
              disabled={loading || !cardFormValid}
              className="w-full mt-4 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              ) : (
                "Pay with Card"
              )}
            </button>
          </div>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">Or pay with</span>
            </div>
          </div>

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
                  <path d="M7.076 21.337H2.47a.641.641 0 0 1-.633-.74L4.944.901C5.026.382 5.474 0 5.998 0h7.46c2.57 0 4.578.543 5.69 1.81 1.01 1.15 1.304 2.42 1.012 4.287-.023.143-.047.288-.077.437-.983 5.05-4.349 6.797-8.647 6.797h-2.19c-.524 0-.968.382-1.05.9l-1.12 7.106zm1.565-3.22l.72-4.53h2.227c2.17 0 3.925-.616 5.242-2.28C17.76 9.902 18.235 8.052 18.235 5.79c0-.744-.17-1.331-.498-1.824C16.729 2.216 15.365 2 13.498 2H7.27l-3.75 16.117h5.121z"/>
                </svg>
                <span>PayPal</span>
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
                  <span>Apple Pay</span>
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
                  <span>Google Pay</span>
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
                  <span>Venmo</span>
                </>
              )}
            </button>
          )}

          <div className="text-xs text-gray-500 text-center pt-2 border-t border-gray-200 flex items-center justify-center space-x-2">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd"/>
            </svg>
            <span>Secured by SSL encryption • Backend: {HOST}</span>
          </div>
        </div>
      </div>

      {paymentResult && (
        <div
          className={`mt-6 p-4 rounded-lg border ${
            paymentResult.success
              ? "bg-green-50 text-green-800 border-green-200"
              : "bg-red-50 text-red-800 border-red-200"
          }`}
        >
          {paymentResult.success ? (
            <div>
              <div className="flex items-center mb-2">
                <svg className="w-5 h-5 mr-2 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                </svg>
                <h3 className="font-semibold">Payment Processed Successfully!</h3>
              </div>
              {paymentResult.transactionId && (
                <p className="text-sm mb-1">Transaction ID: {paymentResult.transactionId}</p>
              )}
              <p className="text-sm mb-1">Payment Method: {paymentResult.data.type}</p>
              {paymentResult.data.username && (
                <p className="text-sm mb-2">Venmo: @{paymentResult.data.username}</p>
              )}
              <button 
                onClick={resetPayment}
                className="mt-2 text-sm bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors"
              >
                Make Another Payment
              </button>
            </div>
          ) : (
            <div>
              <div className="flex items-center mb-2">
                <svg className="w-5 h-5 mr-2 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd"/>
                </svg>
                <h3 className="font-semibold">Payment Failed</h3>
              </div>
              <p className="text-sm mb-2">{paymentResult.error}</p>
              <button 
                onClick={resetPayment}
                className="mt-2 text-sm bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors"
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