import React, { useState, useEffect, useRef } from 'react';

const BraintreePayment = () => {
  // Configuration - Edit these values as needed
  const CLIENT_TOKEN = "sandbox_5s47gmcy_8q8qh3y7825xx99t"; // Replace with your actual sandbox token
  const AMOUNT = "25.00";
  const CURRENCY = "USD";
  const SUBMIT_BUTTON_TEXT = "Pay Now";

  const [braintreeInstance, setBraintreeInstance] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [paymentResult, setPaymentResult] = useState(null);
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
          // googlePay: {
          //   merchantId: 'merchant-id',
          //   transactionInfo: {
          //     totalPriceStatus: 'FINAL',
          //     totalPrice: AMOUNT,
          //     currencyCode: CURRENCY
          //   }
          // },
          // applePay: {
          //   displayName: 'Your Store Name',
          //   paymentRequest: {
          //     total: {
          //       label: 'Your Store Name',
          //       amount: AMOUNT
          //     }
          //   }
          // }
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

  const handlePaymentSuccess = async (nonce) => {
    console.log('Payment nonce received:', nonce);
    
    // Here you would typically send the nonce to your server
    // Example server call:
    /*
    try {
      const response = await fetch('/process-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          nonce: nonce,
          amount: AMOUNT,
          currency: CURRENCY
        })
      });
      const result = await response.json();
      // Handle server response
    } catch (error) {
      console.error('Server error:', error);
    }
    */
    
    setPaymentResult({
      success: true,
      message: `Payment successful! Nonce: ${nonce.substring(0, 20)}...`
    });
  };

  const handlePaymentError = (error) => {
    console.error('Payment error:', error);
    setPaymentResult({
      success: false,
      message: `Payment failed: ${error.message}`
    });
  };

  const handlePayment = async () => {
    if (!braintreeInstance) {
      setError('Payment system not initialized');
      return;
    }

    setIsProcessing(true);
    setError(null);
    setPaymentResult(null);

    try {
      const { nonce } = await braintreeInstance.requestPaymentMethod();
      await handlePaymentSuccess(nonce);
    } catch (err) {
      const errorMessage = err.message || 'Payment failed';
      setError(errorMessage);
      handlePaymentError(err);
    } finally {
      setIsProcessing(false);
    }
  };

  if (!CLIENT_TOKEN || CLIENT_TOKEN === "YOUR_SANDBOX_CLIENT_TOKEN_HERE") {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-2xl mx-auto px-4">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <h2 className="text-red-800 font-bold text-xl mb-4">Configuration Required</h2>
            <div className="space-y-3 text-red-700">
              <p className="font-medium">To use this component, you need to:</p>
              <ol className="list-decimal list-inside space-y-2 ml-4">
                <li>Get your sandbox client token from Braintree Control Panel</li>
                <li>Replace <code className="bg-red-100 px-2 py-1 rounded">CLIENT_TOKEN</code> at the top of this component</li>
                <li>Optionally modify <code className="bg-red-100 px-2 py-1 rounded">AMOUNT</code>, <code className="bg-red-100 px-2 py-1 rounded">CURRENCY</code>, and other settings</li>
              </ol>
              <div className="mt-4 p-3 bg-red-100 rounded">
                <p className="font-medium">Quick Setup:</p>
                <p className="text-sm mt-1">
                  1. Log into your Braintree Sandbox<br/>
                  2. Go to Settings → API Keys<br/>
                  3. Generate a client token<br/>
                  4. Replace the CLIENT_TOKEN value in this component
                </p>
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
        
        <div className="max-w-md mx-auto p-6 bg-white border border-gray-200 rounded-lg shadow-sm">
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

          {!isLoading && braintreeInstance && (
            <button
              onClick={handlePayment}
              disabled={isProcessing}
              className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${
                isProcessing
                  ? 'bg-gray-400 text-gray-600 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
              }`}
            >
              {isProcessing ? (
                <span className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Processing...
                </span>
              ) : (
                SUBMIT_BUTTON_TEXT
              )}
            </button>
          )}

          <div className="mt-4 text-xs text-gray-500 text-center">
            <p>🔒 Secure payment powered by Braintree (Sandbox Mode)</p>
            <p className="mt-1">Test with: 4111 1111 1111 1111, CVV: 123, Any future date</p>
          </div>
        </div>

        {paymentResult && (
          <div className={`mt-6 max-w-md mx-auto p-4 rounded-lg ${
            paymentResult.success 
              ? 'bg-green-50 border border-green-200 text-green-700'
              : 'bg-red-50 border border-red-200 text-red-700'
          }`}>
            <p className="font-medium">
              {paymentResult.success ? '✅ Success!' : '❌ Error!'}
            </p>
            <p className="text-sm mt-1">{paymentResult.message}</p>
          </div>
        )}

        <div className="mt-8 bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="font-semibold text-gray-800 mb-3">Configuration Guide:</h3>
          <div className="space-y-3 text-sm text-gray-600">
            <div>
              <code className="bg-gray-100 px-2 py-1 rounded text-xs">CLIENT_TOKEN</code>
              <p className="mt-1">Replace with your Braintree sandbox client token</p>
            </div>
            <div>
              <code className="bg-gray-100 px-2 py-1 rounded text-xs">AMOUNT</code>
              <p className="mt-1">Set the payment amount (e.g., "25.00")</p>
            </div>
            <div>
              <code className="bg-gray-100 px-2 py-1 rounded text-xs">CURRENCY</code>
              <p className="mt-1">Set the currency code (e.g., "USD", "EUR")</p>
            </div>
            <div>
              <code className="bg-gray-100 px-2 py-1 rounded text-xs">handlePaymentSuccess</code>
              <p className="mt-1">Modify to send nonce to your server for processing</p>
            </div>
          </div>
          
          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded">
            <p className="text-blue-800 font-medium text-sm">Next Steps:</p>
            <p className="text-blue-700 text-xs mt-1">
              After receiving the payment nonce, send it to your server to complete the transaction using Braintree's server SDK.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BraintreePayment;