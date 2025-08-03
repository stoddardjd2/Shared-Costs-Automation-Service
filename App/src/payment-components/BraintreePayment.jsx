import React, { useState, useEffect, useRef } from 'react';

const BraintreePayment = () => {
  // Configuration - Edit these values as needed
  const CLIENT_TOKEN = "sandbox_5s47gmcy_8q8qh3y7825xx99t"; // Replace with your actual sandbox token
  const BACKEND_URL = "http://localhost:3001"; // Configure your backend URL
  const AMOUNT = "23.30";
  const CURRENCY = "USD";

  const [braintreeInstance, setBraintreeInstance] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [paymentResult, setPaymentResult] = useState(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const dropinContainerRef = useRef(null);

  useEffect(() => {
    // Load Braintree SDK
    const loadBraintreeScript = () => {
      return new Promise((resolve, reject) => {
        if (window.braintree) {
          resolve();
          return;
        }

        const script = document.createElement('script');
        script.src = 'https://js.braintreegateway.com/web/dropin/1.41.0/js/dropin.min.js';
        script.onload = resolve;
        script.onerror = reject;
        document.head.appendChild(script);
      });
    };

    const initializeBraintree = async () => {
      if (!CLIENT_TOKEN || CLIENT_TOKEN === "YOUR_SANDBOX_CLIENT_TOKEN_HERE") {
        setError('Please configure your Braintree client token');
        setIsLoading(false);
        return;
      }

      // Wait for the DOM element to be ready
      if (!dropinContainerRef.current) {
        setTimeout(initializeBraintree, 100);
        return;
      }

      try {
        await loadBraintreeScript();
        
        // Clear any existing content in the container
        dropinContainerRef.current.innerHTML = '';
        
        const instance = await window.braintree.dropin.create({
          authorization: CLIENT_TOKEN,
          container: dropinContainerRef.current,
          card: {
            overrides: {
              fields: {
                number: { placeholder: '1111 1111 1111 1111' },
                cvv: { placeholder: '123' },
                expirationDate: { placeholder: 'MM/YY' }
              }
            }
          },
          paypal: {
            flow: 'checkout',
            amount: AMOUNT,
            currency: CURRENCY
          },
          venmo: {},
          googlePay: {
            merchantId: 'merchant-id',
            transactionInfo: {
              totalPriceStatus: 'FINAL',
              totalPrice: AMOUNT,
              currencyCode: CURRENCY
            }
          }
        });

        // Listen for payment method selection
        instance.on('paymentMethodRequestable', (event) => {
          // Auto-submit only for non-card payment methods (PayPal, Venmo, etc.)
          if (event.type !== 'CreditCard') {
            handlePayment(instance);
          }
        });

        setBraintreeInstance(instance);
        setIsLoading(false);
      } catch (err) {
        setError(`Failed to initialize Braintree: ${err.message}`);
        setIsLoading(false);
      }
    };

    // Small delay to ensure DOM is ready
    const timer = setTimeout(initializeBraintree, 100);

    return () => {
      clearTimeout(timer);
      if (braintreeInstance) {
        braintreeInstance.teardown().catch(console.error);
      }
    };
  }, []);

  const processPaymentWithBackend = async (nonce) => {
    try { 
      const response = await fetch(`${BACKEND_URL}/api/braintree/process-payment`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          paymentMethodNonce: nonce,
          amount: AMOUNT,
          currency: CURRENCY
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Server error: ${response.status}`);
      }

      const result = await response.json();
      
      if (result.success) {
        setPaymentResult({
          success: true,
          message: result.message || 'Payment processed successfully!',
          transactionId: result.transactionId,
          amount: AMOUNT,
          currency: CURRENCY
        });
        setShowConfirmation(true);
      } else {
        throw new Error(result.message || 'Payment processing failed');
      }
    } catch (error) {
      throw error;
    }
  };

  const handlePayment = async (instance = braintreeInstance) => {
    if (!instance) {
      setError('Payment system not initialized');
      return;
    }

    setIsProcessing(true);
    setError(null);
    setPaymentResult(null);

    try {
      // Get payment method nonce from Braintree
      const { nonce } = await instance.requestPaymentMethod();
      
      // Process payment with backend
      await processPaymentWithBackend(nonce);
      
    } catch (err) {
      const errorMessage = err.message || 'Payment failed';
      setError(errorMessage);
      setPaymentResult({
        success: false,
        message: errorMessage
      });
    } finally {
      setIsProcessing(false);
    }
  };

  if (!CLIENT_TOKEN || CLIENT_TOKEN === "YOUR_SANDBOX_CLIENT_TOKEN_HERE") {
    return (
      <div className="h-screen bg-gray-50 py-8">
        <div className="max-w-2xl mx-auto px-4 h-full">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <h2 className="text-red-800 font-bold text-xl mb-4">Configuration Required</h2>
            <div className="space-y-3 text-red-700">
              <p className="font-medium">To use this component, you need to:</p>
              <ol className="list-decimal list-inside space-y-2 ml-4">
                <li>Get your sandbox client token from Braintree Control Panel</li>
                <li>Replace CLIENT_TOKEN at the top of this component</li>
                <li>Configure BACKEND_URL to point to your server</li>
                <li>Optionally modify AMOUNT, CURRENCY, and other settings</li>
              </ol>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Confirmation Screen
  if (showConfirmation && paymentResult?.success) {
    return (
      <div className="h-screen bg-gray-50 py-8">
        <div className="max-w-2xl mx-auto px-4 h-full">
          <div className="text-center">
            <div className="bg-white rounded-lg shadow-sm p-8 max-w-md mx-auto">
              <div className="mb-6">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLineCap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">Payment Successful!</h1>
                <p className="text-gray-600">Your payment has been processed successfully.</p>
              </div>
              
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-600">Amount:</span>
                  <span className="font-semibold text-gray-900">
                    {paymentResult.currency} {parseFloat(paymentResult.amount).toFixed(2)}
                  </span>
                </div>
                {paymentResult.transactionId && (
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Transaction ID:</span>
                    <span className="font-mono text-sm text-gray-900">
                      {paymentResult.transactionId}
                    </span>
                  </div>
                )}
              </div>
              
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-center mb-8 text-gray-800">
          Secure Payment
        </h1>
        
        <div className="max-w-md mx-auto p-6 bg-white border border-gray-200 rounded-lg shadow-sm ">
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Payment Details</h3>
            <p className="text-2xl font-bold text-gray-900">
              {CURRENCY} {parseFloat(AMOUNT).toFixed(2)}
            </p>
          </div>

          {isLoading && (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-2 text-gray-600">Loading payment form...</span>
            </div>
          )}

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          <div ref={dropinContainerRef} className="mb-4"></div>

          {!isLoading && braintreeInstance && !isProcessing && (
            <button
              onClick={() => handlePayment()}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors mb-4"
            >
              Pay Now
            </button>
          )}

          {isProcessing && (
            <div className="flex items-center justify-center py-4 mb-4">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              <span className="ml-2 text-gray-600">Processing payment...</span>
            </div>
          )}

          {!isLoading && !isProcessing && (
            <div className="mt-4 text-xs text-gray-500 text-center">
              <p>🔒 Secure payment powered by Braintree</p>
              <p className="mt-1">PayPal, Venmo, and Google Pay will process automatically when selected</p>
            </div>
          )}

          {paymentResult && !paymentResult.success && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-700 font-medium">❌ Payment Failed</p>
              <p className="text-red-600 text-sm mt-1">{paymentResult.message}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BraintreePayment;