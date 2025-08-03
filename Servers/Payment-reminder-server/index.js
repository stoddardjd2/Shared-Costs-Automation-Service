// index.js - Main application entry point
require('dotenv').config();

const { startServer } = require('./app');

// Validate required environment variables
function validateEnvironment() {
  const required = [
    'MONGODB_URL',
    'REDIS_URL',
    'DB_NAME'
  ];

  const missing = required.filter(env => !process.env[env]);
  
  if (missing.length > 0) {
    console.error('❌ Missing required environment variables:');
    missing.forEach(env => console.error(`   - ${env}`));
    console.error('\nPlease check your .env file');
    process.exit(1);
  }

  // Warn about missing notification configs
  const notificationWarnings = [];
  
  if (!process.env.SENDGRID_API_KEY) {
    notificationWarnings.push('SENDGRID_API_KEY - Email reminders will not work');
  }
  
  if (!process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_AUTH_TOKEN) {
    notificationWarnings.push('TWILIO credentials - SMS reminders will not work');
  }

  if (notificationWarnings.length > 0) {
    console.warn('⚠️  Optional configuration missing:');
    notificationWarnings.forEach(warning => console.warn(`   - ${warning}`));
    console.warn('   The system will still work but with limited functionality\n');
  }
}

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Main function
async function main() {
  try {
    console.log('🚀 Starting Payment Reminder Scheduler...\n');
    
    // Validate environment
    validateEnvironment();
    
    // Start the server
    await startServer();
    
  } catch (error) {
    console.error('❌ Failed to start application:', error);
    process.exit(1);
  }
}

// Start the application
if (require.main === module) {
  main();
}

module.exports = { main };
