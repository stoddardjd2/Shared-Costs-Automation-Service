// reminder-system.js - Complete functional implementation with Redis
const cron = require('node-cron');
const { MongoClient, ObjectId } = require('mongodb');
const Bull = require('bull');
const sgMail = require('@sendgrid/mail');
const twilio = require('twilio');
const winston = require('winston');

// Global state
let db = null;
let reminderQueue = null;
let twilioClient = null;
let logger = null;

// Metrics tracking
const metrics = {
  remindersSent: 0,
  remindersFailure: 0,
  processedRequests: 0,
  errors: 0,
  startTime: Date.now()
};

// Initialize logger
function initializeLogger() {
  logger = winston.createLogger({
    level: process.env.LOG_LEVEL || 'info',
    format: winston.format.combine(
      winston.format.timestamp(),
      winston.format.errors({ stack: true }),
      winston.format.json()
    ),
    defaultMeta: { service: 'reminder-scheduler' },
    transports: [
      new winston.transports.Console({
        format: winston.format.simple()
      })
    ]
  });

  // Add file logging in production
  if (process.env.NODE_ENV === 'production') {
    logger.add(new winston.transports.File({ 
      filename: 'logs/error.log', 
      level: 'error' 
    }));
    logger.add(new winston.transports.File({ 
      filename: 'logs/combined.log' 
    }));
  }

  return logger;
}

// Database connection and setup
async function connectToDatabase(mongoUrl, dbName) {
  try {
    const client = new MongoClient(mongoUrl, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });
    
    await client.connect();
    db = client.db(dbName);
    
    await createIndexes();
    logger.info('Connected to MongoDB successfully');
    return db;
  } catch (error) {
    logger.error('Failed to connect to MongoDB:', error);
    throw error;
  }
}

async function createIndexes() {
  const requestsCollection = db.collection('requests');
  
  // Index for finding requests with upcoming reminders
  await requestsCollection.createIndex({
    'paymentHistory.nextReminderDate': 1,
    'isRecurring': 1
  });
  
  // Index for one-time requests
  await requestsCollection.createIndex({
    'paymentHistory.nextReminderDate': 1,
    'isRecurring': 1,
    'paymentHistory.reminderSent': 1
  });

  logger.info('Database indexes created');
}

// Notification services setup
function setupNotificationServices(config) {
  // Setup SendGrid
  if (config.email.provider === 'sendgrid' && config.email.apiKey) {
    sgMail.setApiKey(config.email.apiKey);
    logger.info('SendGrid configured');
  }

  // Setup Twilio
  if (config.sms.provider === 'twilio' && config.sms.accountSid) {
    twilioClient = twilio(config.sms.accountSid, config.sms.authToken);
    logger.info('Twilio configured');
  }
}

// Queue setup
function setupQueue(redisUrl) {
  reminderQueue = new Bull('reminder queue', redisUrl, {
    defaultJobOptions: {
      removeOnComplete: 100,
      removeOnFail: 50,
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 2000
      }
    }
  });
  
  // Process individual reminder jobs
  reminderQueue.process('send-reminder', 5, async (job) => {
    const { requestId, paymentHistoryId, participantId } = job.data;
    return await sendReminderToParticipant(requestId, paymentHistoryId, participantId);
  });

  // Process batch reminder jobs
  reminderQueue.process('process-reminder-batch', 2, async (job) => {
    const { requests } = job.data;
    return await processBatch(requests);
  });

  // Queue event listeners
  reminderQueue.on('completed', (job) => {
    logger.info(`Job completed: ${job.id}`, { 
      jobType: job.name,
      processingTime: Date.now() - job.timestamp 
    });
  });

  reminderQueue.on('failed', (job, err) => {
    logger.error(`Job failed: ${job.id}`, { 
      jobType: job.name,
      error: err.message,
      attempts: job.attemptsMade
    });
    metrics.errors++;
  });

  logger.info('Redis queue configured');
  return reminderQueue;
}

// User lookup function
async function getParticipantDetails(participantId) {
  try {
    const usersCollection = db.collection('users');
    const user = await usersCollection.findOne({ _id: new ObjectId(participantId) });
    
    if (!user) {
      return null;
    }

    // Extract phone from contacts array if available
    let phone = null;
    if (user.contacts && user.contacts.length > 0) {
      const phoneContact = user.contacts.find(contact => 
        contact.type === 'phone' || contact.phone || contact.number
      );
      if (phoneContact) {
        phone = phoneContact.phone || phoneContact.value || phoneContact.number;
      }
    }

    return {
      _id: user._id,
      name: user.name,
      email: user.email,
      phone: phone,
      isActive: user.isActive,
      plan: user.plan
    };
  } catch (error) {
    logger.error(`Error getting participant details for ${participantId}:`, error);
    return null;
  }
}

// Main cron scheduler
function startScheduler(cronSchedule = '0 * * * *') {
  cron.schedule(cronSchedule, async () => {
    logger.info('Starting scheduled reminder check...');
    await processReminders();
  });
  
  logger.info(`Reminder scheduler started with schedule: ${cronSchedule}`);
}

// Main processing function
async function processReminders() {
  const startTime = Date.now();
  
  try {
    const currentDate = new Date();
    const batchSize = parseInt(process.env.BATCH_SIZE) || 1000;
    
    logger.info('Processing due reminders...', { currentDate });
    
    // Aggregation pipeline to find due reminders
    const pipeline = [
      {
        $match: {
          'paymentHistory.nextReminderDate': { $lte: currentDate }
        }
      },
      {
        $unwind: '$paymentHistory'
      },
      {
        $match: {
          'paymentHistory.nextReminderDate': { $lte: currentDate }
        }
      },
      {
        $project: {
          _id: 1,
          name: 1,
          amount: 1,
          isRecurring: 1,
          reminderFrequency: 1,
          participants: 1,
          paymentHistory: 1
        }
      }
    ];

    const requestsCollection = db.collection('requests');
    const cursor = requestsCollection.aggregate(pipeline);
    
    let batch = [];
    let totalProcessed = 0;

    await cursor.forEach(async (request) => {
      batch.push(request);
      
      if (batch.length >= batchSize) {
        await addBatchToQueue(batch);
        totalProcessed += batch.length;
        logger.info(`Queued batch of ${batch.length} requests. Total: ${totalProcessed}`);
        batch = [];
      }
    });

    // Process remaining batch
    if (batch.length > 0) {
      await addBatchToQueue(batch);
      totalProcessed += batch.length;
    }

    const duration = Date.now() - startTime;
    logger.info('Reminder processing completed', {
      totalRequests: totalProcessed,
      duration: `${duration}ms`
    });
    
  } catch (error) {
    logger.error('Error in processReminders:', error);
    metrics.errors++;
  }
}

async function addBatchToQueue(requests) {
  await reminderQueue.add('process-reminder-batch', { requests }, {
    priority: 10,
    delay: Math.random() * 1000 // Stagger batches slightly
  });
}

async function processBatch(requests) {
  const results = [];
  
  logger.info(`Processing batch of ${requests.length} requests`);
  
  for (const request of requests) {
    try {
      const participantsToRemind = getParticipantsNeedingReminders(request);
      
      for (const participant of participantsToRemind) {
        // Add individual reminder job to queue
        await reminderQueue.add('send-reminder', {
          requestId: request._id,
          paymentHistoryId: request.paymentHistory._id,
          participantId: participant._id
        }, {
          delay: Math.random() * 5000 // Stagger individual reminders
        });
      }
      
      // Update nextReminderDate for this payment history entry
      if (request.isRecurring) {
        await updateNextReminderDate(
          request._id, 
          request.paymentHistory._id, 
          request.reminderFrequency
        );
      }
      
      results.push({ 
        requestId: request._id, 
        participantsQueued: participantsToRemind.length 
      });
      
      metrics.processedRequests++;
      
    } catch (error) {
      logger.error(`Error processing request ${request._id}:`, error);
      results.push({ requestId: request._id, error: error.message });
      metrics.errors++;
    }
  }
  
  return results;
}

function getParticipantsNeedingReminders(request) {
  const participantsNeedingReminders = [];
  
  for (const participant of request.paymentHistory.participants) {
    // Find the corresponding participant info from the main participants array
    const mainParticipant = request.participants.find(p => 
      p._id.toString() === participant._id.toString()
    );
    
    if (!mainParticipant) continue;
    
    const requiredAmount = mainParticipant.amount;
    const paidAmount = participant.paymentAmount || 0;
    
    // Send reminder if payment is less than required amount
    if (paidAmount < requiredAmount) {
      participantsNeedingReminders.push(participant);
    }
  }
  
  return participantsNeedingReminders;
}

async function sendReminderToParticipant(requestId, paymentHistoryId, participantId) {
  try {
    // Get participant details
    const participantDetails = await getParticipantDetails(participantId);
    
    if (!participantDetails) {
      throw new Error(`Participant not found: ${participantId}`);
    }

    // Check if user is active
    if (!participantDetails.isActive) {
      logger.info(`Skipping reminder for inactive user: ${participantId}`);
      return { success: false, reason: 'User inactive', participantId };
    }

    // Get request details for reminder content
    const request = await db.collection('requests').findOne({ 
      _id: new ObjectId(requestId) 
    });
    
    if (!request) {
      throw new Error(`Request not found: ${requestId}`);
    }

    // Send reminder via SMS/Email
    const reminderResult = await sendReminder(participantDetails, request);
    
    if (reminderResult.success) {
      // Update reminder status
      await updateReminderStatus(requestId, paymentHistoryId, participantId);
      metrics.remindersSent++;
      
      logger.info('Reminder sent successfully', {
        participantId,
        requestId,
        channels: reminderResult.channels
      });
      
      return { success: true, participantId, channels: reminderResult.channels };
    } else {
      metrics.remindersFailure++;
      throw new Error('Failed to send reminder');
    }
    
  } catch (error) {
    logger.error(`Error sending reminder to participant ${participantId}:`, error);
    metrics.remindersFailure++;
    throw error;
  }
}

async function sendReminder(participantDetails, request) {
  const results = {
    sms: null,
    email: null,
    success: false,
    channels: []
  };

  const participantAmount = request.participants.find(p => 
    p._id.toString() === participantDetails._id.toString()
  )?.amount || 0;

  // Send SMS if phone number available
  if (participantDetails.phone) {
    try {
      const smsMessage = createSMSMessage(request, participantDetails, participantAmount);
      results.sms = await sendSMS(participantDetails.phone, smsMessage);
      if (results.sms.success) {
        results.channels.push('sms');
        results.success = true;
      }
    } catch (error) {
      logger.error('SMS sending failed:', error);
      results.sms = { success: false, error: error.message };
    }
  }

  // Send Email if email available
  if (participantDetails.email) {
    try {
      const { html, text } = createEmailTemplate(request, participantDetails, participantAmount);
      results.email = await sendEmail(
        participantDetails.email,
        `Payment Reminder: ${request.name}`,
        html,
        text
      );
      if (results.email.success) {
        results.channels.push('email');
        results.success = true;
      }
    } catch (error) {
      logger.error('Email sending failed:', error);
      results.email = { success: false, error: error.message };
    }
  }

  return results;
}

function createSMSMessage(request, participant, participantAmount) {
  return `Payment reminder: ${request.name} - You owe $${participantAmount.toFixed(2)}. Please pay when convenient. Questions? Reply HELP.`;
}

function createEmailTemplate(request, participant, participantAmount) {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Payment Reminder</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px; }
        .amount { font-size: 24px; font-weight: bold; color: #28a745; }
        .details { background-color: #fff; padding: 20px; border: 1px solid #dee2e6; border-radius: 8px; }
        .button { display: inline-block; padding: 12px 24px; background-color: #007bff; color: white; text-decoration: none; border-radius: 5px; margin-top: 20px; }
        .footer { margin-top: 30px; font-size: 14px; color: #6c757d; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h2>Payment Reminder</h2>
          <p>Hi ${participant.name || 'there'}!</p>
        </div>
        
        <div class="details">
          <p>This is a friendly reminder that you have a pending payment:</p>
          
          <p><strong>Request:</strong> ${request.name}</p>
          <p><strong>Your amount:</strong> <span class="amount">$${participantAmount.toFixed(2)}</span></p>
          <p><strong>Total request amount:</strong> $${request.amount.toFixed(2)}</p>
          
          <p>Please complete your payment at your earliest convenience.</p>
          
          ${process.env.PAYMENT_URL ? `<a href="${process.env.PAYMENT_URL}" class="button">Pay Now</a>` : ''}
        </div>
        
        <div class="footer">
          <p>If you have already made this payment, please disregard this reminder.</p>
          <p>Questions? Contact us at ${process.env.SUPPORT_EMAIL || 'support@yourapp.com'}</p>
        </div>
      </div>
    </body>
    </html>
  `;

  const text = `
Payment Reminder

Hi ${participant.name || 'there'}!

This is a friendly reminder that you have a pending payment:

Request: ${request.name}
Your amount: $${participantAmount.toFixed(2)}
Total request amount: $${request.amount.toFixed(2)}

Please complete your payment at your earliest convenience.

If you have already made this payment, please disregard this reminder.
Questions? Contact us at ${process.env.SUPPORT_EMAIL || 'support@yourapp.com'}
  `;

  return { html, text };
}

async function sendSMS(phoneNumber, message) {
  try {
    if (!twilioClient) {
      throw new Error('Twilio not configured');
    }

    const result = await twilioClient.messages.create({
      body: message,
      from: process.env.TWILIO_FROM_NUMBER,
      to: phoneNumber
    });

    return {
      success: true,
      messageId: result.sid,
      provider: 'twilio'
    };
  } catch (error) {
    logger.error('Twilio SMS error:', error);
    throw error;
  }
}

async function sendEmail(to, subject, htmlContent, textContent) {
  try {
    if (!sgMail) {
      throw new Error('SendGrid not configured');
    }

    const msg = {
      to,
      from: process.env.FROM_EMAIL,
      subject,
      text: textContent,
      html: htmlContent
    };

    const result = await sgMail.send(msg);

    return {
      success: true,
      messageId: result[0].headers['x-message-id'],
      provider: 'sendgrid'
    };
  } catch (error) {
    logger.error('SendGrid email error:', error);
    throw error;
  }
}

async function updateReminderStatus(requestId, paymentHistoryId, participantId) {
  await db.collection('requests').updateOne(
    { 
      _id: new ObjectId(requestId),
      'paymentHistory._id': new ObjectId(paymentHistoryId),
      'paymentHistory.participants._id': new ObjectId(participantId)
    },
    {
      $set: {
        'paymentHistory.$.participants.$[participant].reminderSent': true,
        'paymentHistory.$.participants.$[participant].reminderSentDate': new Date()
      }
    },
    {
      arrayFilters: [
        { 'participant._id': new ObjectId(participantId) }
      ]
    }
  );
}

async function updateNextReminderDate(requestId, paymentHistoryId, reminderFrequency) {
  const nextDate = calculateNextReminderDate(reminderFrequency);
  
  await db.collection('requests').updateOne(
    { 
      _id: new ObjectId(requestId),
      'paymentHistory._id': new ObjectId(paymentHistoryId)
    },
    {
      $set: {
        'paymentHistory.$.nextReminderDate': nextDate
      }
    }
  );
}

function calculateNextReminderDate(frequency) {
  const now = new Date();
  
  switch (frequency) {
    case 'daily':
      return new Date(now.getTime() + 24 * 60 * 60 * 1000);
    case 'weekly':
      return new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    case 'monthly':
      const nextMonth = new Date(now);
      nextMonth.setMonth(now.getMonth() + 1);
      return nextMonth;
    case 'yearly':
      const nextYear = new Date(now);
      nextYear.setFullYear(now.getFullYear() + 1);
      return nextYear;
    default:
      return new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000); // Default to weekly
  }
}

// Schedule one-time reminder
async function scheduleOneTimeReminder(requestId, paymentHistoryId, sendDate) {
  const request = await db.collection('requests').findOne({ 
    _id: new ObjectId(requestId) 
  });
  
  if (!request) {
    throw new Error('Request not found');
  }

  const delay = sendDate.getTime() - Date.now();
  
  await reminderQueue.add('process-reminder-batch', {
    requests: [request]
  }, {
    delay: Math.max(0, delay),
    attempts: 3
  });

  logger.info('One-time reminder scheduled', {
    requestId,
    paymentHistoryId,
    sendDate,
    delay
  });
}

// Get queue stats for monitoring
async function getQueueStats() {
  if (!reminderQueue) {
    return { error: 'Queue not initialized' };
  }

  const waiting = await reminderQueue.waiting();
  const active = await reminderQueue.active();
  const completed = await reminderQueue.completed();
  const failed = await reminderQueue.failed();
  
  return {
    waiting: waiting.length,
    active: active.length,
    completed: completed.length,
    failed: failed.length,
    isPaused: await reminderQueue.isPaused(),
    name: reminderQueue.name
  };
}

function getMetrics() {
  return {
    ...metrics,
    uptime: process.uptime(),
    systemUptime: Date.now() - metrics.startTime,
    timestamp: new Date().toISOString(),
    memoryUsage: process.memoryUsage(),
    queueType: 'redis_bull_queue'
  };
}

function resetMetrics() {
  metrics.remindersSent = 0;
  metrics.remindersFailure = 0;
  metrics.processedRequests = 0;
  metrics.errors = 0;
  logger.info('Metrics reset');
}

// Update payment amount helper
async function updatePaymentAmount(requestId, paymentHistoryId, participantId, paymentAmount) {
  await db.collection('requests').updateOne(
    {
      _id: new ObjectId(requestId),
      'paymentHistory._id': new ObjectId(paymentHistoryId),
      'paymentHistory.participants._id': new ObjectId(participantId)
    },
    {
      $set: {
        'paymentHistory.$.participants.$[participant].paymentAmount': paymentAmount,
        'paymentHistory.$.participants.$[participant].paidDate': paymentAmount > 0 ? new Date() : null
      }
    },
    {
      arrayFilters: [
        { 'participant._id': new ObjectId(participantId) }
      ]
    }
  );

  logger.info('Payment amount updated', {
    requestId,
    paymentHistoryId,
    participantId,
    paymentAmount
  });
}

// Initialize the entire system
async function initializeReminderSystem(config) {
  // Initialize logger first
  initializeLogger();
  
  try {
    // Connect to database
    await connectToDatabase(config.mongodb.url, config.mongodb.dbName);
    
    // Setup notification services
    setupNotificationServices(config.notifications);
    
    // Setup Redis queue
    setupQueue(config.redis.url);
    
    // Start cron scheduler
    startScheduler(config.cronSchedule);
    
    logger.info('Reminder system initialized successfully', {
      mongodb: config.mongodb.url,
      redis: config.redis.url,
      cronSchedule: config.cronSchedule
    });
    
    return {
      processReminders,
      scheduleOneTimeReminder,
      getQueueStats,
      getMetrics,
      resetMetrics,
      updatePaymentAmount,
      queue: reminderQueue,
      db
    };
  } catch (error) {
    logger.error('Failed to initialize reminder system:', error);
    throw error;
  }
}

module.exports = {
  initializeReminderSystem,
  processReminders,
  scheduleOneTimeReminder,
  getQueueStats,
  getMetrics,
  resetMetrics,
  updatePaymentAmount,
  connectToDatabase,
  setupQueue,
  startScheduler
};
