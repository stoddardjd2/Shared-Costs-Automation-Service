// server.js - Simple Express server for Braintree payments
const express = require('express');
const cors = require('cors');
const braintree = require('braintree');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Braintree Gateway Configuration
// Using your merchant ID from the configuration image
const gateway = new braintree.BraintreeGateway({
  environment: braintree.Environment.Sandbox, // Change to Production for live
  merchantId: '8q8qh3y7825xx99t',
  publicKey: '4r9hq6c3bpz9tvk5',    
  privateKey: 'a83f86f998877d984a5dba098eafc1a6'   
});

// ================================
// ROUTES
// ================================

// Generate Client Token
// POST /api/braintree/client-token
app.post('/api/braintree/client-token', async (req, res) => {
  try {
    console.log('Generating client token...');
    
    const response = await gateway.clientToken.generate({
      // Optional: include customer ID if you want to show saved payment methods
      // customerId: req.body.customerId
    });
    
    console.log('Client token generated successfully');
    
    res.json({
      clientToken: response.clientToken
    });
    
  } catch (error) {
    console.error('Error generating client token:', error);
    res.status(500).json({
      error: 'Failed to generate client token'
    });
  }
});

// Process Payment
// POST /api/braintree/process-payment
app.post('/api/braintree/process-payment', async (req, res) => {
  console.log('Processing payment...', req.body);
  
  try {
    const { paymentMethodNonce, amount, currency = 'USD' } = req.body;
    
    // Validate required fields
    if (!paymentMethodNonce || !amount) {
      return res.status(400).json({
        success: false,
        error: 'Payment method nonce and amount are required',
        errorCode: 'MISSING_DATA'
      });
    }
    
    // Create transaction request
    const transactionRequest = {
      amount: amount,
      paymentMethodNonce: paymentMethodNonce,
      options: {
        submitForSettlement: true // Automatically capture the payment
      }
    };
    
    console.log('Submitting transaction to Braintree...');
    
    // Process the transaction
    const result = await gateway.transaction.sale(transactionRequest);
    
    if (result.success) {
      const transaction = result.transaction;
      
      console.log('Payment successful:', transaction.id);
      
      // Create clean response object
      const transactionResponse = {
        transactionId: transaction.id,
        status: transaction.status,
        amount: transaction.amount,
        currency: transaction.currencyIsoCode,
        type: transaction.type,
        paymentMethod: {
          type: transaction.paymentInstrumentType
        },
        processedAt: transaction.createdAt,
        processorResponse: {
          code: transaction.processorResponseCode,
          text: transaction.processorResponseText
        }
      };
      
      // Add payment method specific details
      if (transaction.creditCard) {
        transactionResponse.paymentMethod.creditCard = {
          cardType: transaction.creditCard.cardType,
          last4: transaction.creditCard.last4,
          expirationMonth: transaction.creditCard.expirationMonth,
          expirationYear: transaction.creditCard.expirationYear
        };
      }
      
      if (transaction.paypalDetails) {
        transactionResponse.paymentMethod.paypal = {
          paymentId: transaction.paypalDetails.paymentId,
          payerEmail: transaction.paypalDetails.payerEmail,
          payerId: transaction.paypalDetails.payerId
        };
      }
      
      res.json({
        success: true,
        transaction: transactionResponse
      });
      
    } else if (result.transaction) {
      // Transaction was created but failed (declined, etc.)
      const transaction = result.transaction;
      
      console.log('Payment failed:', transaction.status, transaction.processorResponseText);
      
      res.status(400).json({
        success: false,
        error: `Payment ${transaction.status}: ${transaction.processorResponseText}`,
        errorCode: transaction.processorResponseCode,
        transactionId: transaction.id
      });
      
    } else {
      // Validation errors or gateway errors
      console.log('Payment validation errors:', result.errors);
      
      const errorMessages = result.errors.deepErrors().map(error => error.message);
      
      res.status(400).json({
        success: false,
        error: errorMessages.join(', '),
        errorCode: 'VALIDATION_ERROR'
      });
    }
    
  } catch (error) {
    console.error('Payment processing error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error during payment processing',
      errorCode: 'INTERNAL_ERROR'
    });
  }
});

// ================================
// UTILITY ROUTES (Optional)
// ================================

// Get transaction details
// GET /api/braintree/transaction/:id
app.get('/api/braintree/transaction/:id', async (req, res) => {
  try {
    const transactionId = req.params.id;
    
    const transaction = await gateway.transaction.find(transactionId);
    
    res.json({
      id: transaction.id,
      status: transaction.status,
      amount: transaction.amount,
      currency: transaction.currencyIsoCode,
      createdAt: transaction.createdAt,
      updatedAt: transaction.updatedAt
    });
    
  } catch (error) {
    console.error('Error finding transaction:', error);
    res.status(404).json({
      error: 'Transaction not found'
    });
  }
});

// Refund transaction
// POST /api/braintree/refund/:id
app.post('/api/braintree/refund/:id', async (req, res) => {
  try {
    const transactionId = req.params.id;
    const { amount } = req.body; // Optional partial refund amount
    
    let result;
    if (amount) {
      result = await gateway.transaction.refund(transactionId, amount);
    } else {
      result = await gateway.transaction.refund(transactionId);
    }
    
    if (result.success) {
      res.json({
        success: true,
        refund: {
          id: result.transaction.id,
          amount: result.transaction.amount,
          status: result.transaction.status
        }
      });
    } else {
      res.status(400).json({
        success: false,
        error: result.message
      });
    }
    
  } catch (error) {
    console.error('Refund error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to process refund'
    });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    environment: gateway.config.environment,
    merchantId: gateway.config.merchantId
  });
});

// ================================
// START SERVER
// ================================

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`🚀 Braintree Payment Server running on port ${PORT}`);
  console.log(`📍 Environment: ${gateway.config.environment}`);
  console.log(`🏪 Merchant ID: ${gateway.config.merchantId}`);
  console.log(`\n📋 Available endpoints:`);
  console.log(`   POST /api/braintree/client-token`);
  console.log(`   POST /api/braintree/process-payment`);
  console.log(`   GET  /api/braintree/transaction/:id`);
  console.log(`   POST /api/braintree/refund/:id`);
  console.log(`   GET  /health`);
});

// ================================
// ERROR HANDLING
// ================================

// Global error handler
app.use((error, req, res, next) => {
  console.error('Unhandled error:', error);
  res.status(500).json({
    success: false,
    error: 'Internal server error'
  });
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

module.exports = app;