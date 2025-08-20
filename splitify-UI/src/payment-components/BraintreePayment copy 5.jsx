import React, { useState, useEffect, useRef } from 'react';
import { Loader2, CreditCard, Shield, CheckCircle, AlertCircle, Lock } from 'lucide-react';

// Configuration based on your provided image and requirements
const CONFIG = {
  // Backend API endpoints
  CLIENT_TOKEN_ENDPOINT: 'http://localhost:3001/api/braintree/client-token',
  PROCESS_PAYMENT_ENDPOINT: 'http://localhost:3001/api/braintree/process-payment',
  
  // Braintree settings from your configuration image
  MERCHANT_ID: '8q8qj3y7825xx9St',
  ENVIRONMENT: 'sandbox',
  
  // Payment configuration
  PAYMENT_AMOUNT: '25.00',
  CURRENCY: 'USD'
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
    const response = await fetch(CONFIG.CLIENT_TOKEN_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({}),
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch client token: ${response.status}`);
    }
    
    const data = await response.json();
    return data.clientToken;
  };

  // Load Braintree script
  const loadBraintreeScript = () => {
    return new Promise((resolve, reject) => {
      if (window.braintree) {
        resolve();
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://js.braintreegateway.com/web/dropin/1.44.1/js/dropin.min.js';
      script.onload = resolve;
      script.onerror = () => reject(new Error('Failed to load Braintree SDK'));
      document.head.appendChild(script);
    });
  };

  // Initialize Braintree Drop-in
  const initializeBraintree = async () => {
    try {
      setError(null);

      // Load Braintree script
      await loadBraintreeScript();

      // Get client token
      const token = await fetchClientToken();
      setClientToken(token);

      // Clear existing instance
      if (dropinInstance) {
        dropinInstance.teardown();
      }

      // Create Drop-in instance - Cards and PayPal only
      window.braintree.dropin.create({
        authorization: token,
        container: dropinContainerRef.current,
        
        // PayPal configuration for checkout flow
        paypal: {
          flow: 'checkout',
          amount: CONFIG.PAYMENT_AMOUNT,
          currency: CONFIG.CURRENCY,
          buttonStyle: {
            color: 'blue',
            shape: 'rect',
            size: 'responsive'
          }
        },
        
        // Card configuration
        card: {
          cardholderName: {
            required: false
          }
        }
        
      }, (createErr, instance) => {
        if (createErr) {
          setError(createErr.message);
          setIsInitializing(false);
          return;
        }

        setDropinInstance(instance);
        setIsInitializing(false);

        // Enable submit button when payment method is available
        if (instance.isPaymentMethodRequestable()) {
          submitButtonRef.current?.removeAttribute('disabled');
        }

        // Event listeners
        instance.on('paymentMethodRequestable', () => {
          submitButtonRef.current?.removeAttribute('disabled');
        });

        instance.on('noPaymentMethodRequestable', () => {
          submitButtonRef.current?.setAttribute('disabled', 'disabled');
        });
      });

    } catch (err) {
      setError(err.message || 'Failed to initialize payment system');
      setIsInitializing(false);
    }
  };

  // Process payment
  const handlePayment = async () => {
    if (!dropinInstance) return;

    try {
      setIsProcessing(true);
      setError(null);

      // Get payment method nonce
      const payload = await new Promise((resolve, reject) => {
        dropinInstance.requestPaymentMethod((err, payload) => {
          if (err) {
            reject(err);
          } else {
            resolve(payload);
          }
        });
      });

      // Send to backend
      const response = await fetch(CONFIG.PROCESS_PAYMENT_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          paymentMethodNonce: payload.nonce,
          amount: CONFIG.PAYMENT_AMOUNT,
          currency: CONFIG.CURRENCY
        }),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        setSuccess(true);
        dropinInstance.clearSelectedPaymentMethod();
      } else {
        throw new Error(result.message || 'Payment failed');
      }

    } catch (err) {
      setError(err.message || 'Payment failed. Please try again.');
      if (dropinInstance && dropinInstance.clearSelectedPaymentMethod) {
        dropinInstance.clearSelectedPaymentMethod();
      }
    } finally {
      setIsProcessing(false);
    }
  };

  // Reset for new payment
  const handleReset = () => {
    setSuccess(false);
    setError(null);
    if (dropinInstance) {
      dropinInstance.clearSelectedPaymentMethod();
    }
  };

  // Initialize when component mounts
  useEffect(() => {
    // Ensure DOM is ready before initializing
    const timer = setTimeout(() => {
      if (dropinContainerRef.current) {
        initializeBraintree();
      }
    }, 50);

    return () => {
      clearTimeout(timer);
      if (dropinInstance) {
        dropinInstance.teardown();
      }
    };
  }, []);

  return (
    <div className="braintree-payment-container max-w-lg mx-auto p-8 bg-white rounded-2xl shadow-xl font-sans">
      <style jsx>{`
        /* Braintree Drop-in custom styling */
        .braintree-payment-container :global(.braintree-dropin) {
          font-family: inherit !important;
        }

        .braintree-payment-container :global(.braintree-option__label) {
          color: #374151 !important;
          font-weight: 500 !important;
        }

        .braintree-payment-container :global(.braintree-option) {
          border-radius: 8px !important;
          border: 2px solid #e5e7eb !important;
          margin-bottom: 12px !important;
        }

        .braintree-payment-container :global(.braintree-option--selected) {
          border-color: rgb(37, 99, 235) !important;
          box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1) !important;
        }

        .braintree-payment-container :global(.braintree-form__field-group) {
          margin-bottom: 16px !important;
        }

        .braintree-payment-container :global(.braintree-paypal-button) {
          transition: all 0.2s ease !important;
        }
      `}</style>

      {/* Header */}
      <div className="text-center mb-8">
        <h2 className="text-3xl font-semibold text-gray-800 mb-2 flex items-center justify-center gap-3">
          <Lock size={28} color="rgb(37, 99, 235)" />
          Secure Payment
        </h2>
        <p className="text-gray-500 text-base leading-6">
          Pay securely with your credit card or PayPal account.
        </p>
      </div>

      {/* Amount Display */}
      {!success && (
        <div className="mb-6 p-5 bg-slate-50 rounded-xl border-2 border-gray-200">
          <div className="flex justify-between items-center">
            <span className="font-medium text-gray-500 text-base">Amount:</span>
            <span className="font-bold text-blue-600 text-2xl">${CONFIG.PAYMENT_AMOUNT} {CONFIG.CURRENCY}</span>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-lg mb-5 flex items-center gap-2 text-sm">
          <AlertCircle size={20} />
          {error}
        </div>
      )}

      {/* Success State */}
      {success ? (
        <div className="bg-green-50 border border-green-300 text-green-700 p-6 rounded-xl text-center flex flex-col items-center gap-3">
          <CheckCircle size={48} />
          <h3 className="text-xl font-semibold m-0">Payment Successful!</h3>
          <p className="m-0 opacity-80">
            Your payment of ${CONFIG.PAYMENT_AMOUNT} has been processed successfully.
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
          {/* Loading State */}
          {isInitializing ? (
            <div className="flex flex-col items-center py-15 px-5 text-gray-500">
              <Loader2 size={32} className="animate-spin mb-4" />
              <p>Loading payment options...</p>
            </div>
          ) : (
            <>
              {/* Drop-in Container */}
              <div ref={dropinContainerRef} className="mb-6 min-h-[200px]" />
              
              {/* Submit Button */}
              <button
                ref={submitButtonRef}
                onClick={handlePayment}
                disabled={isProcessing || isInitializing}
                className={`w-full py-4 px-6 text-white border-none rounded-xl text-base font-semibold cursor-pointer transition-all duration-200 flex items-center justify-center gap-2 min-h-[56px] ${
                  isProcessing || isInitializing
                    ? 'bg-gray-300 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-blue-600/30'
                }`}
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

              {/* Security Notice */}
              <div className="flex items-center justify-center gap-2 mt-4 p-3 bg-slate-50 rounded-lg text-xs text-gray-500">
                <Shield size={16} />
                <span>PCI DSS Compliant • 256-bit SSL Encryption</span>
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
};

export default BraintreePayment;