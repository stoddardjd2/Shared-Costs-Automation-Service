// app.js - Express application with reminder system
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const { ObjectId } = require('mongodb');
const { initializeReminderSystem } = require('./reminder-system');

// Configuration
const config = {
  mongodb: {
    url: process.env.MONGODB_URL || 'mongodb://localhost:27017',
    dbName: process.env.DB_NAME || 'payment_app'
  },
  redis: {
    url: process.env.REDIS_URL || 'redis://localhost:6379'
  },
  notifications: {
    sms: {
      provider: process.env.SMS_PROVIDER || 'twilio',
      accountSid: process.env.TWILIO_ACCOUNT_SID,
      authToken: process.env.TWILIO_AUTH_TOKEN,
      fromNumber: process.env.TWILIO_FROM_NUMBER
    },
    email: {
      provider: process.env.EMAIL_PROVIDER || 'sendgrid',
      apiKey: process.env.SENDGRID_API_KEY,
      fromEmail: process.env.FROM_EMAIL || 'noreply@yourapp.com'
    }
  },
  cronSchedule: process.env.CRON_SCHEDULE || '0 * * * *', // Every hour
  server: {
    port: process.env.PORT || 3000,
    corsOrigins: process.env.CORS_ORIGINS?.split(',') || ['http://localhost:3000']
  }
};

// Global reminder system instance
let reminderSystem = null;

// Create reminder API routes
function createReminderAPI() {
  const router = express.Router();

  // Get system metrics
  router.get('/metrics', (req, res) => {
    try {
      const metrics = reminderSystem.getMetrics();
      res.json({
        success: true,
        data: metrics
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });

  // Get queue statistics
  router.get('/stats', async (req, res) => {
    try {
      const stats = await reminderSystem.getQueueStats();
      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });

  // Manually trigger reminder processing
  router.post('/process-now', async (req, res) => {
    try {
      await reminderSystem.processReminders();
      res.json({
        success: true,
        message: 'Reminder processing initiated'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });

  // Schedule a one-time reminder
  router.post('/schedule-one-time', async (req, res) => {
    try {
      const { requestId, paymentHistoryId, sendDate } = req.body;
      
      if (!requestId || !paymentHistoryId || !sendDate) {
        return res.status(400).json({
          success: false,
          error: 'Missing required fields: requestId, paymentHistoryId, sendDate'
        });
      }

      await reminderSystem.scheduleOneTimeReminder(
        requestId,
        paymentHistoryId,
        new Date(sendDate)
      );

      res.json({
        success: true,
        message: 'One-time reminder scheduled',
        scheduledFor: new Date(sendDate).toISOString()
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });

  // Get pending reminders for a specific request
  router.get('/pending/:requestId', async (req, res) => {
    try {
      const { requestId } = req.params;
      const pendingReminders = await getPendingReminders(requestId);
      
      res.json({
        success: true,
        data: pendingReminders
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });

  // Update payment amount
  router.post('/update-payment', async (req, res) => {
    try {
      const { requestId, paymentHistoryId, participantId, paymentAmount } = req.body;
      
      if (!requestId || !paymentHistoryId || !participantId || paymentAmount === undefined) {
        return res.status(400).json({
          success: false,
          error: 'Missing required fields: requestId, paymentHistoryId, participantId, paymentAmount'
        });
      }

      await reminderSystem.updatePaymentAmount(
        requestId, 
        paymentHistoryId, 
        participantId, 
        parseFloat(paymentAmount)
      );
      
      res.json({
        success: true,
        message: 'Payment amount updated',
        paymentAmount: parseFloat(paymentAmount)
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });

  // Reset metrics (for testing/debugging)
  router.post('/reset-metrics', (req, res) => {
    try {
      reminderSystem.resetMetrics();
      res.json({
        success: true,
        message: 'Metrics reset successfully'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });

  // Test notification endpoint
  router.post('/test-notification', async (req, res) => {
    try {
      const { phone, email, message } = req.body;
      
      if (!phone && !email) {
        return res.status(400).json({
          success: false,
          error: 'Either phone or email is required'
        });
      }

      const testMessage = message || 'Test notification from reminder system';
      const results = {};

      // Test SMS
      if (phone) {
        try {
          const smsResult = await sendTestSMS(phone, testMessage);
          results.sms = smsResult;
        } catch (error) {
          results.sms = { success: false, error: error.message };
        }
      }

      // Test Email
      if (email) {
        try {
          const emailResult = await sendTestEmail(email, testMessage);
          results.email = emailResult;
        } catch (error) {
          results.email = { success: false, error: error.message };
        }
      }

      res.json({
        success: true,
        data: results
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });

  // Pause/Resume queue
  router.post('/queue/:action', async (req, res) => {
    try {
      const { action } = req.params;
      
      if (action === 'pause') {
        await reminderSystem.queue.pause();
        res.json({ success: true, message: 'Queue paused' });
      } else if (action === 'resume') {
        await reminderSystem.queue.resume();
        res.json({ success: true, message: 'Queue resumed' });
      } else {
        res.status(400).json({ 
          success: false, 
          error: 'Invalid action. Use "pause" or "resume"' 
        });
      }
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });

  return router;
}

// Helper function to get pending reminders
async function getPendingReminders(requestId) {
  const request = await reminderSystem.db.collection('requests').findOne({
    _id: new ObjectId(requestId)
  });

  if (!request) {
    throw new Error('Request not found');
  }

  const pendingReminders = [];
  const currentDate = new Date();
  
  for (const paymentHistory of request.paymentHistory) {
    if (paymentHistory.nextReminderDate <= currentDate) {
      const participantsNeedingReminders = getParticipantsNeedingReminders({
        ...request,
        paymentHistory
      });
      
      if (participantsNeedingReminders.length > 0) {
        pendingReminders.push({
          paymentHistoryId: paymentHistory._id,
          nextReminderDate: paymentHistory.nextReminderDate,
          amount: paymentHistory.amount,
          participants: participantsNeedingReminders.map(p => ({
            _id: p._id,
            paymentAmount: p.paymentAmount,
            reminderSent: p.reminderSent,
            reminderSentDate: p.reminderSentDate
          }))
        });
      }
    }
  }

  return pendingReminders;
}

function getParticipantsNeedingReminders(request) {
  const participantsNeedingReminders = [];
  
  for (const participant of request.paymentHistory.participants) {
    const mainParticipant = request.participants.find(p => 
      p._id.toString() === participant._id.toString()
    );
    
    if (!mainParticipant) continue;
    
    const requiredAmount = mainParticipant.amount;
    const paidAmount = participant.paymentAmount || 0;
    
    if (paidAmount < requiredAmount) {
      participantsNeedingReminders.push(participant);
    }
  }
  
  return participantsNeedingReminders;
}

// Test notification functions
async function sendTestSMS(phone, message) {
  // This would use the same SMS sending logic as the main system
  console.log(`Test SMS to ${phone}: ${message}`);
  return { success: true, message: 'Test SMS sent (simulated)' };
}

async function sendTestEmail(email, message) {
  // This would use the same email sending logic as the main system
  console.log(`Test Email to ${email}: ${message}`);
  return { success: true, message: 'Test email sent (simulated)' };
}

// Create and configure Express app
async function createApp() {
  const app = express();

  // Security middleware
  app.use(helmet());
  app.use(cors({
    origin: config.server.corsOrigins,
    credentials: true
  }));

  // Body parsing middleware
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true }));

  // Request logging middleware
  app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
    next();
  });

  // Initialize reminder system
  try {
    reminderSystem = await initializeReminderSystem(config);
    console.log('Reminder system initialized successfully');
  } catch (error) {
    console.error('Failed to initialize reminder system:', error);
    process.exit(1);
  }

  // API routes
  app.use('/api/reminders', createReminderAPI());

  // Health check endpoint
  app.get('/health', async (req, res) => {
    try {
      const queueStats = await reminderSystem.getQueueStats();
      const metrics = reminderSystem.getMetrics();

      // Test database connection
      await reminderSystem.db.collection('requests').countDocuments({}, { limit: 1 });

      res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        service: 'reminder-scheduler',
        version: process.env.npm_package_version || '1.0.0',
        environment: process.env.NODE_ENV || 'development',
        database: 'connected',
        queue: queueStats,
        metrics
      });
    } catch (error) {
      console.error('Health check failed:', error);
      res.status(503).json({
        status: 'unhealthy',
        error: error.message,
        timestamp: new Date().toISOString()
      });
    }
  });

  // Root endpoint
  app.get('/', (req, res) => {
    res.json({
      message: 'Payment Reminder Scheduler API',
      version: '1.0.0',
      endpoints: {
        health: '/health',
        metrics: '/api/reminders/metrics',
        stats: '/api/reminders/stats',
        processNow: 'POST /api/reminders/process-now',
        scheduleOneTime: 'POST /api/reminders/schedule-one-time',
        updatePayment: 'POST /api/reminders/update-payment'
      }
    });
  });

  // Error handling middleware
  app.use((error, req, res, next) => {
    console.error('Unhandled error:', {
      error: error.message,
      stack: error.stack,
      url: req.url,
      method: req.method
    });

    res.status(500).json({
      success: false,
      error: 'Internal server error',
      ...(process.env.NODE_ENV === 'development' && { details: error.message })
    });
  });

  // 404 handler
  app.use((req, res) => {
    res.status(404).json({
      success: false,
      error: 'Endpoint not found',
      url: req.url,
      method: req.method
    });
  });

  return app;
}

// Start server function
async function startServer() {
  try {
    const app = await createApp();
    
    const server = app.listen(config.server.port, () => {
      console.log(`
🚀 Payment Reminder Scheduler started successfully!

Server: http://localhost:${config.server.port}
Health: http://localhost:${config.server.port}/health
Metrics: http://localhost:${config.server.port}/api/reminders/metrics

Environment: ${process.env.NODE_ENV || 'development'}
Cron Schedule: ${config.cronSchedule}
MongoDB: ${config.mongodb.url}
Redis: ${config.redis.url}
      `);
    });

    // Graceful shutdown
    const gracefulShutdown = async (signal) => {
      console.log(`\nReceived ${signal}, shutting down gracefully...`);
      
      server.close(async () => {
        try {
          if (reminderSystem && reminderSystem.queue) {
            await reminderSystem.queue.close();
            console.log('Redis queue closed');
          }
          console.log('Server shut down successfully');
          process.exit(0);
        } catch (error) {
          console.error('Error during shutdown:', error);
          process.exit(1);
        }
      });

      // Force shutdown after 30 seconds
      setTimeout(() => {
        console.error('Force shutdown after timeout');
        process.exit(1);
      }, 30000);
    };

    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));

    return server;
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

module.exports = {
  createApp,
  startServer,
  createReminderAPI,
  config
};
