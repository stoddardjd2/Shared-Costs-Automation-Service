// scripts/setup.js - Quick setup script
const fs = require("fs");
const path = require("path");
const { exec } = require("child_process");
const { promisify } = require("util");

const execAsync = promisify(exec);

async function checkPrerequisites() {
  console.log("🔍 Checking prerequisites...\n");

  const checks = [
    { name: "Node.js", command: "node --version", required: true },
    { name: "MongoDB", command: "mongod --version", required: true },
    { name: "Redis", command: "redis-server --version", required: true },
    { name: "Git", command: "git --version", required: false },
  ];

  for (const check of checks) {
    try {
      const { stdout } = await execAsync(check.command);
      console.log(`✅ ${check.name}: ${stdout.trim().split("\n")[0]}`);
    } catch (error) {
      if (check.required) {
        console.log(`❌ ${check.name}: Not found (REQUIRED)`);
        return false;
      } else {
        console.log(`⚠️  ${check.name}: Not found (optional)`);
      }
    }
  }

  return true;
}

async function setupEnvironment() {
  console.log("⚙️  Setting up environment...\n");

  const envPath = path.join(process.cwd(), ".env");
  const envExamplePath = path.join(process.cwd(), ".env.example");

  if (!fs.existsSync(envPath)) {
    if (fs.existsSync(envExamplePath)) {
      fs.copyFileSync(envExamplePath, envPath);
      console.log("✅ Created .env file from .env.example");
    } else {
      console.log("⚠️  .env.example not found, please create .env manually");
    }
  } else {
    console.log("⚠️  .env file already exists, skipping...");
  }
}

async function createLogDirectory() {
  const logDir = path.join(process.cwd(), "logs");

  if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir);
    console.log("✅ Created logs directory");
  } else {
    console.log("⚠️  logs directory already exists");
  }
}

async function testConnections() {
  console.log("\n🔌 Testing connections...\n");

  // Test MongoDB
  try {
    const { MongoClient } = require("mongodb");
    const client = new MongoClient(
      process.env.MONGODB_URL || "mongodb://localhost:27017"
    );
    await client.connect();
    await client.db("test").command({ ping: 1 });
    await client.close();
    console.log("✅ MongoDB connection successful");
  } catch (error) {
    console.log("❌ MongoDB connection failed:", error.message);
  }

  // Test Redis
  try {
    const Redis = require("ioredis");
    const redis = new Redis(process.env.REDIS_URL || "redis://localhost:6379");
    await redis.ping();
    redis.disconnect();
    console.log("✅ Redis connection successful");
  } catch (error) {
    console.log("❌ Redis connection failed:", error.message);
  }
}

async function displayNextSteps() {
  console.log(`
🎉 Setup complete! Next steps:

1. 📝 Update your .env file with real credentials:
   - SENDGRID_API_KEY (for email notifications)
   - TWILIO_ACCOUNT_SID & TWILIO_AUTH_TOKEN (for SMS)
   - FROM_EMAIL (your sending email address)

2. 🚀 Start the services:
   ${
     process.platform === "darwin"
       ? "brew services start mongodb-community"
       : "sudo systemctl start mongod"
   }
   ${
     process.platform === "darwin"
       ? "brew services start redis"
       : "sudo systemctl start redis"
   }

3. ▶️  Run the application:
   npm start

4. 🧪 Test the system:
   curl http://localhost:3000/health

5. 📊 View the dashboard:
   http://localhost:3000/

Need help? Check the README.md file for detailed instructions.
`);
}

async function main() {
  console.log("🚀 Payment Reminder Scheduler - Quick Setup\n");

  try {
    // Check prerequisites
    const prereqsOk = await checkPrerequisites();

    if (!prereqsOk) {
      console.log(
        "❌ Missing required prerequisites. Please install them and try again."
      );
      process.exit(1);
    }

    // Setup environment
    await setupEnvironment();

    // Create log directory
    await createLogDirectory();

    // Load environment variables
    require("dotenv").config();

    // Test connections (optional)
    const testConnectionsFlag = process.argv.includes("--test-connections");
    if (testConnectionsFlag) {
      await testConnections();
    }

    // Display next steps
    await displayNextSteps();
  } catch (error) {
    console.error("❌ Setup failed:", error.message);
    process.exit(1);
  }
}

// Run setup if called directly
if (require.main === module) {
  main();
}

module.exports = { main };
