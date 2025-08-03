import React, { useState } from "react";
import BraintreePayment from "./BraintreePayment"; // Adjust the import path as necessary

// Example usage component
export const PaymentPage = () => {
  const [showPayment, setShowPayment] = useState(false);

  const handlePaymentSuccess = (result) => {
    console.log("Payment successful:", result);
    // Handle successful payment (redirect, show confirmation, etc.)
  };

  const handlePaymentError = (error) => {
    console.error("Payment error:", error);
    // Handle payment error
  };

  // if (!showPayment) {
  //   return (
  //     <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-lg border text-center">
  //       <h2 className="text-2xl font-bold text-gray-900 mb-4">Checkout</h2>
  //       <p className="text-gray-600 mb-6">Ready to complete your purchase?</p>
  //       <button
  //         onClick={() => setShowPayment(true)}
  //         className="w-full py-3 px-4 rounded-md text-white font-medium transition-colors"
  //         style={{ backgroundColor: "rgb(37,99,235)" }}
  //       >
  //         Proceed to Payment
  //       </button>
  //     </div>
  //   );
  // }

  return (
    <BraintreePayment
      amount="29.99"
      onPaymentSuccess={handlePaymentSuccess}
      onPaymentError={handlePaymentError}
      customerData={{
        firstName: "John",
        lastName: "Doe",
        email: "john.doe@example.com",
      }}
      environment="sandbox"
    />
  );
};

export default PaymentPage;
