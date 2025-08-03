import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  CreditCard,
  Loader2,
  CheckCircle,
  XCircle,
  AlertCircle,
  RefreshCw,
  Shield,
  Lock,
} from "lucide-react";

const BraintreePayment = ({
  amount = "50.00",
  onPaymentSuccess,
  onPaymentError,
  customerData = {},
  environment = "sandbox",
  showDebugInfo = true,
}) => {
  const [clientToken, setClientToken] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [dropinReady, setDropinReady] = useState(false);
  const [scriptLoading, setScriptLoading] = useState(false);
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState(null);
  const dropinInstance = useRef(null);
  const dropinContainer = useRef(null);
  const scriptLoadPromise = useRef(null);
  const initializationAttempts = useRef(0);
  const mountedRef = useRef(true);

  const primaryColor = "rgb(37,99,235)";
  const maxRetries = 3;

  // Check if script is already loaded
  const isScriptLoaded = () => {
    return !!(window.braintree && window.braintree.dropin);
  };

  // Enhanced script loading with better error handling and debugging
  const loadBraintreeScript = useCallback(() => {
    console.log('📥 loadBraintreeScript called');
    
    if (scriptLoadPromise.current) {
      console.log('🔄 Script loading already in progress');
      return scriptLoadPromise.current;
    }

    if (isScriptLoaded()) {
      console.log('✓ Braintree script already loaded and working');
      setScriptLoaded(true);
      setScriptLoading(false);
      return Promise.resolve();
    }

    console.log('⏳ Starting fresh Braintree script load...');
    setScriptLoading(true);

    scriptLoadPromise.current = new Promise((resolve, reject) => {
      // Double-check there are no existing scripts
      const existingScripts = document.querySelectorAll('script[src*="braintreegateway.com"]');
      if (existingScripts.length > 0) {
        console.log('⚠️ Found lingering scripts during load, removing...');
        existingScripts.forEach(script => script.remove());
      }

      console.log('📥 Creating new Braintree script element...');
      const script = document.createElement("script");
      script.src = "https://js.braintreegateway.com/web/dropin/1.33.7/js/dropin.min.js";
      script.async = true;
      script.crossOrigin = "anonymous";
      
      // Add unique identifier to track this specific script
      script.setAttribute('data-braintree-load-attempt', Date.now().toString());
      
      const timeout = setTimeout(() => {
        console.error('❌ Script load timeout (20s)');
        script.remove(); // Clean up the failed script
        if (mountedRef.current) {
          setScriptLoading(false);
        }
        scriptLoadPromise.current = null;
        reject(new Error("Script load timeout after 20 seconds"));
      }, 20000); // Increased timeout
      
      script.onload = () => {
        console.log('📜 Script onload event fired');
        clearTimeout(timeout);
        
        // Wait longer for the Braintree API to initialize
        let checkAttempts = 0;
        const maxAttempts = 50; // 10 seconds with 200ms intervals
        
        const checkReady = () => {
          checkAttempts++;
          console.log(`🔍 Checking Braintree availability (attempt ${checkAttempts}/${maxAttempts})`);
          
          if (isScriptLoaded()) {
            console.log('✅ Braintree API confirmed available after', checkAttempts * 200, 'ms');
            if (mountedRef.current) {
              setScriptLoaded(true);
              setScriptLoading(false);
            }
            scriptLoadPromise.current = null;
            resolve();
          } else if (checkAttempts < maxAttempts) {
            setTimeout(checkReady, 200);
          } else {
            console.error('❌ Braintree API not available after script load');
            console.log('Final check - Window.braintree:', window.braintree);
            console.log('Script element:', script);
            console.log('Script readyState:', script.readyState);
            
            script.remove(); // Clean up the failed script
            if (mountedRef.current) {
              setScriptLoading(false);
            }
            scriptLoadPromise.current = null;
            reject(new Error("Braintree API not available after script load"));
          }
        };
        
        // Start checking after a brief delay
        setTimeout(checkReady, 200);
      };
      
      script.onerror = (error) => {
        console.error('❌ Script load error:', error);
        clearTimeout(timeout);
        script.remove(); // Clean up the failed script
        if (mountedRef.current) {
          setScriptLoading(false);
        }
        scriptLoadPromise.current = null;
        reject(new Error("Failed to load Braintree script"));
      };
      
      console.log('🚀 Appending script to document head...');
      document.head.appendChild(script);
    });

    return scriptLoadPromise.current;
  }, []);

  // Initialize when component mounts
  useEffect(() => {
    const initialize = async () => {
      if (!mountedRef.current) return;
      
      console.log('🚀 Component mounted, starting initialization...');
      
      try {
        setError("");
        setIsLoading(true);
        initializationAttempts.current = 0;
        
        // FORCE CLEAN START - Remove any existing scripts first
        const existingScripts = document.querySelectorAll('script[src*="braintreegateway.com"]');
        if (existingScripts.length > 0) {
          console.log(`🗑️ Found ${existingScripts.length} existing Braintree scripts, removing them...`);
          existingScripts.forEach(script => {
            try {
              script.remove();
            } catch (e) {
              console.warn('Could not remove existing script:', e);
            }
          });
          
          // Reset all script-related state
          scriptLoadPromise.current = null;
          setScriptLoaded(false);
          setScriptLoading(false);
          
          // Wait a moment for cleanup
          await new Promise(resolve => setTimeout(resolve, 100));
        }
        
        // Now start fresh
        await loadBraintreeScript();
        
        if (mountedRef.current) {
          await fetchClientToken();
        }
        
      } catch (err) {
        console.error('🚨 Initialization error:', err);
        if (mountedRef.current) {
          setError(`Initialization failed: ${err.message}`);
          setIsLoading(false);
        }
      }
    };

    initialize();
  }, []); // Remove loadBraintreeScript dependency to prevent loops

  // React-safe DOM cleanup that avoids conflicts
  const safeCleanupContainer = useCallback((container) => {
    if (!container) return;
    
    try {
      // Use a React-safe approach: clear content but let React manage the container
      const children = Array.from(container.children);
      children.forEach(child => {
        // Only remove non-React managed elements
        if (!child.hasAttribute('data-reactroot') && 
            !child.className.includes('react') &&
            child.className.includes('braintree')) {
          try {
            container.removeChild(child);
          } catch (e) {
            // If React has already removed it, that's fine
          }
        }
      });
    } catch (error) {
      // Fallback: just clear innerHTML if safe removal fails
      try {
        container.innerHTML = '';
      } catch (e) {
        console.warn('Could not clear container:', e);
      }
    }
  }, []);

  // Safe teardown of Braintree instance
  const teardownDropin = useCallback(async () => {
    if (dropinInstance.current) {
      try {
        await dropinInstance.current.teardown();
      } catch (error) {
        console.warn('Braintree teardown error:', error);
      } finally {
        dropinInstance.current = null;
      }
    }
  }, []);

  // Initialize Braintree Drop-in with retry logic
  const initializeBraintree = useCallback(async (token) => {
    if (!mountedRef.current) return;
    
    initializationAttempts.current += 1;
    
    if (!dropinContainer.current || !token || !isScriptLoaded()) {
      if (initializationAttempts.current < maxRetries && mountedRef.current) {
        setTimeout(() => {
          if (mountedRef.current) {
            initializeBraintree(token);
          }
        }, 1000);
        return;
      }
      if (mountedRef.current) {
        setError("Payment system initialization failed");
        setIsLoading(false);
      }
      return;
    }

    try {
      if (!mountedRef.current) return;
      setError("");
      
      // Clean teardown of existing instance
      await teardownDropin();

      const container = dropinContainer.current;
      if (!container || !mountedRef.current) return;

      // Clean the container safely
      safeCleanupContainer(container);
      
      // Wait a bit for cleanup to complete
      await new Promise(resolve => setTimeout(resolve, 100));
      
      if (!mountedRef.current) return;
      
      // Create Drop-in instance with enhanced configuration
      const dropinInstanceCreated = await window.braintree.dropin.create({
        authorization: token,
        container: container,
        
        paypal: {
          flow: "checkout",
          amount: amount,
          currency: "USD",
          buttonStyle: {
            color: "blue",
            shape: "rect",
            size: "medium",
          },
        },
        
        card: {
          cardholderName: {
            required: true,
          },
          overrides: {
            styles: {
              input: {
                'font-size': '16px',
                'font-family': 'system-ui, -apple-system, sans-serif',
              },
            },
          },
        },

        // Enhanced styling
        theme: {
          variables: {
            colorPrimary: primaryColor,
            fontFamily: 'system-ui, -apple-system, sans-serif',
          },
        },
      });

      if (!mountedRef.current) {
        // Component unmounted during creation, clean up
        try {
          await dropinInstanceCreated.teardown();
        } catch (e) {
          console.warn('Cleanup after unmount failed:', e);
        }
        return;
      }

      dropinInstance.current = dropinInstanceCreated;
      
      // Listen for payment method selection
      dropinInstanceCreated.on('paymentMethodRequestable', (event) => {
        if (mountedRef.current) {
          setPaymentMethod(event.type);
        }
      });

      dropinInstanceCreated.on('noPaymentMethodRequestable', () => {
        if (mountedRef.current) {
          setPaymentMethod(null);
        }
      });

      if (mountedRef.current) {
        setDropinReady(true);
        setIsLoading(false);
      }
      
    } catch (err) {
      if (!mountedRef.current) return;
      
      if (initializationAttempts.current < maxRetries) {
        setTimeout(() => {
          if (mountedRef.current) {
            initializeBraintree(token);
          }
        }, 2000);
      } else {
        setError(`Payment system initialization failed: ${err.message}`);
        setIsLoading(false);
        setDropinReady(false);
      }
    }
  }, [amount, primaryColor, teardownDropin, safeCleanupContainer]);

  // Initialize Braintree when conditions are met
  useEffect(() => {
    if (clientToken && scriptLoaded && dropinContainer.current && !dropinReady && mountedRef.current) {
      const initializeNow = () => {
        if (dropinContainer.current && !dropinReady && clientToken && mountedRef.current) {
          initializeBraintree(clientToken);
        }
      };

      initializeNow();
      const timer = setTimeout(initializeNow, 50);
      
      return () => clearTimeout(timer);
    }
  }, [clientToken, scriptLoaded, initializeBraintree, dropinReady]);

  const fetchClientToken = async () => {
    if (!mountedRef.current) return;
    
    console.log('🔑 Fetching client token from server...');
    
    try {
      const response = await fetch(
        "http://localhost:3001/api/braintree/client-token",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ customerData }),
        }
      );

      console.log('📡 Server response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Server error response:', errorText);
        throw new Error(`Failed to fetch client token: ${response.status} ${errorText}`);
      }

      const data = await response.json();
      console.log('📄 Server response data:', data);
      
      if (!data.clientToken) {
        console.error('❌ No client token in response');
        throw new Error("No client token received from server");
      }
      
      console.log('✅ Client token received successfully');
      if (mountedRef.current) {
        setClientToken(data.clientToken);
      }
      
    } catch (err) {
      console.error('❌ Client token fetch error:', err);
      if (mountedRef.current) {
        setError(`Failed to initialize payment system: ${err.message}`);
        setIsLoading(false);
      }
    }
  };

  const handlePayment = async () => {
    if (!dropinInstance.current || !mountedRef.current) {
      setError("Payment system not initialized");
      return;
    }

    try {
      setIsProcessing(true);
      setError("");

      // Request payment method from Drop-in
      const paymentData = await dropinInstance.current.requestPaymentMethod();

      if (!mountedRef.current) return;

      const response = await fetch("http://localhost:3001/api/braintree/process-payment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          nonce: paymentData.nonce,
          amount,
          paymentMethodType: paymentData.type,
          customerData,
          deviceData: paymentData.details.deviceData || null,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Payment failed");
      }

      if (mountedRef.current) {
        setSuccess(true);
        onPaymentSuccess && onPaymentSuccess(result);
      }
      
    } catch (err) {
      if (mountedRef.current) {
        const errorMessage = err.message || "Payment failed. Please try again.";
        setError(errorMessage);
        onPaymentError && onPaymentError(errorMessage);
      }
    } finally {
      if (mountedRef.current) {
        setIsProcessing(false);
      }
    }
  };

  const resetPayment = () => {
    if (!mountedRef.current) return;
    
    setSuccess(false);
    setError("");
    setDropinReady(false);
    setPaymentMethod(null);
    initializationAttempts.current = 0;
    
    const cleanupAndReinit = async () => {
      await teardownDropin();
      
      if (dropinContainer.current && mountedRef.current) {
        safeCleanupContainer(dropinContainer.current);
      }
      
      if (clientToken && scriptLoaded && mountedRef.current) {
        setTimeout(() => {
          if (mountedRef.current) {
            initializeBraintree(clientToken);
          }
        }, 100);
      }
    };
    
    cleanupAndReinit();
  };

  const retryInitialization = () => {
    if (!mountedRef.current) return;
    
    console.log('🔄 Manual retry triggered');
    setError("");
    setIsLoading(true);
    setDropinReady(false);
    setPaymentMethod(null);
    initializationAttempts.current = 0;
    
    const cleanup = async () => {
      await teardownDropin();
      
      if (dropinContainer.current && mountedRef.current) {
        safeCleanupContainer(dropinContainer.current);
      }
      
      // Force remove all existing Braintree scripts
      const existingScripts = document.querySelectorAll('script[src*="braintreegateway.com"]');
      console.log(`🗑️ Removing ${existingScripts.length} existing Braintree scripts`);
      existingScripts.forEach(script => {
        try {
          script.remove();
        } catch (e) {
          console.warn('Could not remove script:', e);
        }
      });
      
      // Reset script loading state
      scriptLoadPromise.current = null;
      setScriptLoaded(false);
      setScriptLoading(false);
      
      setTimeout(() => {
        if (!mountedRef.current) return;
        
        console.log('🚀 Starting fresh initialization...');
        loadBraintreeScript().then(() => {
          if (mountedRef.current) {
            fetchClientToken();
          }
        }).catch(err => {
          if (mountedRef.current) {
            setError(`Script reload failed: ${err.message}`);
            setIsLoading(false);
          }
        });
      }, 500);
    };
    
    cleanup();
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      mountedRef.current = false;
      
      const cleanup = async () => {
        if (dropinInstance.current) {
          try {
            await dropinInstance.current.teardown();
          } catch (err) {
            console.warn("Cleanup error:", err);
          } finally {
            dropinInstance.current = null;
          }
        }
        
        // Let React handle container cleanup naturally
        // Don't manually manipulate the DOM here
      };
      
      cleanup();
    };
  }, []);

  if (success) {
    return (
      <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-lg border">
        <div className="text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-10 h-10 text-green-500" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Payment Successful!
          </h3>
          <p className="text-gray-600 mb-4">
            Your payment of ${amount} has been processed successfully.
          </p>
          {paymentMethod && (
            <div className="bg-gray-50 rounded-lg p-3 mb-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Payment Method:</span>
                <span className="text-gray-700 capitalize">{paymentMethod}</span>
              </div>
            </div>
          )}
          <button
            onClick={resetPayment}
            className="w-full py-2 px-4 rounded-md text-white font-medium transition-colors hover:opacity-90"
            style={{ backgroundColor: primaryColor }}
          >
            Make Another Payment
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-lg border">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <CreditCard className="w-6 h-6 mr-2" style={{ color: primaryColor }} />
          <h2 className="text-xl font-semibold text-gray-900">
            Payment - ${amount}
          </h2>
        </div>
        <div className="flex items-center text-green-600">
          <Shield className="w-4 h-4 mr-1" />
          <span className="text-xs font-medium">Secure</span>
        </div>
      </div>

      {(isLoading || scriptLoading) && (
        <div className="flex items-center justify-center py-8">
          <Loader2
            className="w-8 h-8 animate-spin mr-3"
            style={{ color: primaryColor }}
          />
          <span className="text-gray-600">
            {scriptLoading ? "Loading payment system..." : "Loading payment options..."}
          </span>
        </div>
      )}

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
          <div className="flex items-start">
            <XCircle className="w-5 h-5 text-red-500 mr-2 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <span className="text-red-700 text-sm">{error}</span>
              <button
                onClick={retryInitialization}
                className="ml-2 text-xs text-red-600 hover:text-red-800 underline inline-flex items-center"
              >
                <RefreshCw className="w-3 h-3 mr-1" />
                Retry
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Debug information - can be toggled */}
      {showDebugInfo && (
        <div className="mb-4 p-2 bg-gray-100 rounded text-xs">
          <div className="font-semibold mb-1">Debug Info:</div>
          <div>• Client Token: {clientToken ? '✓ Available' : '✗ Missing'}</div>
          <div>• Script Loading: {scriptLoading ? '⏳ Loading...' : scriptLoaded ? '✓ Loaded' : '✗ Not Loaded'}</div>
          <div>• Braintree API: {typeof window !== 'undefined' && window.braintree ? 
            (window.braintree.dropin ? '✓ Available' : '⚠️ Partial (no dropin)') : 
            '✗ Not Available'}</div>
          <div>• Container: {dropinContainer.current ? '✓ Ready' : '✗ Not Ready'}</div>
          <div>• Drop-in Ready: {dropinReady ? '✓ Yes' : '✗ No'}</div>
          <div>• Loading State: {isLoading ? 'Yes' : 'No'}</div>
          <div>• Attempts: {initializationAttempts.current}/{maxRetries}</div>
          {paymentMethod && <div>• Selected Method: {paymentMethod}</div>}
          <div className="mt-2 pt-2 border-t border-gray-300">
            <div className="font-semibold mb-1">Network & Script Status:</div>
            <div>• Script Count: {typeof document !== 'undefined' ? 
              document.querySelectorAll('script[src*="braintreegateway.com"]').length : 0}</div>
            <div>• Window Braintree: {typeof window !== 'undefined' && window.braintree ? 
              Object.keys(window.braintree).join(', ') : 'undefined'}</div>
            <button 
              onClick={() => {
                console.log('🔍 Manual debug check:');
                console.log('- Script elements:', document.querySelectorAll('script[src*="braintreegateway.com"]'));
                console.log('- Window.braintree:', window.braintree);
                console.log('- Client token length:', clientToken ? clientToken.length : 0);
                console.log('- Current states:', {
                  scriptLoading,
                  scriptLoaded,
                  isLoading,
                  dropinReady,
                  error
                });
                
                // Check if script is actually loaded but not working
                const scripts = document.querySelectorAll('script[src*="braintreegateway.com"]');
                scripts.forEach((script, index) => {
                  console.log(`Script ${index}:`, {
                    src: script.src,
                    loaded: script.readyState,
                    hasError: script.onerror !== null
                  });
                });
              }}
              className="mt-1 px-2 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600 mr-2"
            >
              Log Debug Info
            </button>
            <button 
              onClick={() => {
                console.log('🔧 Force reloading Braintree script...');
                retryInitialization();
              }}
              className="mt-1 px-2 py-1 bg-orange-500 text-white text-xs rounded hover:bg-orange-600 mr-2"
            >
              Force Reload Script
            </button>
            <button 
              onClick={async () => {
                console.log('🧪 Running comprehensive diagnostic...');
                
                // Test 1: Network connectivity
                console.log('📡 Testing network connectivity...');
                try {
                  const testResponse = await fetch('https://js.braintreegateway.com/web/dropin/1.33.7/js/dropin.min.js', {
                    method: 'HEAD'
                  });
                  console.log('✅ Network test passed:', testResponse.status);
                } catch (e) {
                  console.error('❌ Network test failed:', e);
                }
                
                // Test 2: CSP check
                console.log('🛡️ Checking Content Security Policy...');
                const metaTags = document.querySelectorAll('meta[http-equiv="Content-Security-Policy"]');
                if (metaTags.length > 0) {
                  metaTags.forEach(meta => console.log('CSP:', meta.content));
                } else {
                  console.log('No CSP meta tags found');
                }
                
                // Test 3: Manual script injection
                console.log('💉 Testing manual script injection...');
                const testScript = document.createElement('script');
                testScript.src = 'https://js.braintreegateway.com/web/dropin/1.33.7/js/dropin.min.js';
                testScript.onload = () => {
                  console.log('🎯 Manual script loaded successfully');
                  setTimeout(() => {
                    console.log('🔍 Manual test result - window.braintree:', window.braintree);
                    if (window.braintree) {
                      console.log('✅ Braintree object found!');
                      console.log('Available methods:', Object.keys(window.braintree));
                    }
                  }, 2000);
                };
                testScript.onerror = (e) => {
                  console.error('❌ Manual script failed:', e);
                };
                
                // Remove any existing scripts first
                document.querySelectorAll('script[src*="braintreegateway.com"]').forEach(s => s.remove());
                document.head.appendChild(testScript);
                
                // Test 4: Environment check
                console.log('🌍 Environment check:', {
                  userAgent: navigator.userAgent,
                  cookies: navigator.cookieEnabled,
                  javascript: true,
                  localStorage: typeof Storage !== 'undefined'
                });
              }}
              className="mt-1 px-2 py-1 bg-purple-500 text-white text-xs rounded hover:bg-purple-600"
            >
              Run Diagnostics
            </button>
          </div>
        </div>
      )}

      {/* Container for Braintree Drop-in */}
      <div
        ref={dropinContainer}
        className={`mb-6 min-h-[200px] transition-opacity ${(isLoading || scriptLoading) ? 'opacity-50' : 'opacity-100'}`}
        style={{
          "--braintree-primary-color": primaryColor,
          "--braintree-focus-color": primaryColor,
        }}
      >
        {/* Show loading state inside container */}
        {!dropinReady && !error && (
          <div className="flex items-center justify-center h-full py-12 border-2 border-dashed border-gray-300 rounded-md">
            <div className="text-center">
              <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-gray-400" />
              <div className="text-sm text-gray-500">
                {scriptLoading ? 'Loading payment system...' : 
                 !clientToken ? 'Getting ready...' : 
                 !scriptLoaded ? 'Loading scripts...' : 
                 'Initializing payment options...'}
              </div>
            </div>
          </div>
        )}
      </div>

      {!isLoading && !scriptLoading && (
        <>
          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
            <div className="flex items-start">
              <AlertCircle className="w-5 h-5 text-blue-500 mr-2 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-blue-700">
                <p className="font-medium mb-1">Available Payment Methods:</p>
                <ul className="list-disc list-inside space-y-1 text-xs">
                  <li>Credit & Debit Cards (Visa, MasterCard, AmEx, Discover)</li>
                  <li>PayPal</li>
                </ul>
                {paymentMethod && (
                  <p className="mt-2 text-xs text-green-700 font-medium">
                    ✓ {paymentMethod.charAt(0).toUpperCase() + paymentMethod.slice(1)} method selected
                  </p>
                )}
              </div>
            </div>
          </div>

          <button
            onClick={handlePayment}
            disabled={isProcessing || isLoading || scriptLoading || !dropinReady}
            className="w-full py-3 px-4 rounded-md text-white font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center hover:shadow-lg"
            style={{ backgroundColor: primaryColor }}
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin mr-2" />
                Processing Payment...
              </>
            ) : (
              <>
                <Lock className="w-4 h-4 mr-2" />
                Pay ${amount}
              </>
            )}
          </button>

          <p className="text-xs text-gray-500 text-center mt-3 flex items-center justify-center">
            <Shield className="w-3 h-3 mr-1" />
            Your payment information is secure and encrypted
          </p>
        </>
      )}
    </div>
  );
};

export default BraintreePayment;