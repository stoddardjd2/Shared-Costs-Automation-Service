const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
require("dotenv").config();
const sendEmailRequest = require("./send-request-helpers/sendEmailRequest");

// Import database connection
const connectDB = require("./config/database");
const {
  startReminderScheduler,
  startSchedulerWithFrequentChecks,
  stopScheduler,
  runSchedulerNow,
  getSchedulerStatus,
} = require("./reminder-scheduler/reminderScheduler");

const {
  startRecurringRequestsCron,
  getRequestSchedulerStatus,
  runRecurringRequestsNow,
} = require("./payment-request-scheduler/paymentRequestScheduler");
// Import routes
const userRoutes = require("./routes/userRoutes");
const requestRoutes = require("./routes/requestRoutes");
const supportRoutes = require("./routes/supportRoutes");
const plaidRoutes = require("./routes/plaidRoutes");
const adminRoutes = require("./routes/adminRoutes");
// const stripeRoutes = require("./routes/stripeRoutes");

// Import error handler
const { errorHandler, notFound } = require("./utils/errorHandler");

// Initialize Express app
const app = express();

async function startServer() {
  // Connect to MongoDB
  try {
    await connectDB();
    console.log("✅ Database connected successfully");

    // FOR REMINDERSCHULEDULER, start after db connection
    // Option 1: Daily at 2 PM + startup check (recommended)
    // for reminders
    startReminderScheduler();
    // Option 2: Every hour (more resilient, higher resource usage)
    // startSchedulerWithFrequentChecks();

    // start payment scheduler:
    startRecurringRequestsCron();

    // Security middleware
    app.use(helmet());
    console.log("ACCEPTING CORS ORIGIN:", process.env.CLIENT_URL);
    app.use(
      cors({
        origin: [process.env.CLIENT_URL],
        credentials: true,
      })
    );

    if (process.env.NODE_ENV == "production") {
      app.enable("trust proxy");

      app.use((req, res, next) => {
        if (req.secure) return next();
        console.log("redirect");
        res.redirect(301, `https://${req.headers.host}${req.url}`);
      });
    }

    // Rate limiting
    const limiter = rateLimit({
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 400, // limit each IP to 100 requests per windowMs
      message: "Too many requests from this IP, please try again later.",
    });
    app.use(limiter);

    // Body parsing middleware
    app.use(express.json({ limit: "10mb" }));

    // Custom body parser for Stripe webhooks
    app.use(
      express.json({
        limit: "10mb",
        verify: (req, res, buf) => {
          // Look for the stripe-signature header and the specific path
          if (
            req.headers["stripe-signature"] &&
            req.originalUrl === "api/stripe/webhooks"
          ) {
            req.rawBody = buf;
          }
        },
      })
    );
    app.use(express.urlencoded({ extended: true, limit: "10mb" }));

    // Routes
    app.get("/", (req, res) => {
      res.json({
        message: "Splitify API",
        version: "1.0.0",
        status: "Active",
      });
    });

    app.get("/health", (req, res) => {
      res.status(200).json({
        status: "OK",
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
      });
    });

    app.use("/api/users", userRoutes);
    app.use("/api/requests", requestRoutes);
    app.use("/api/support", supportRoutes);
    app.use("/api/plaid", plaidRoutes);
    app.use("/api/admin", adminRoutes);
    // app.use("/api/stripe", stripeRoutes);

    // Error handling middleware
    app.use(notFound);
    app.use(errorHandler);

    // Start server
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
      console.log(
        `🚀 Server running in ${process.env.NODE_ENV} mode on port ${PORT}`
      );
      console.log(`📡 API documentation available at http://localhost:${PORT}`);
    });

    // run daily checks for sending payment request messages
    // Recurring, one-time, follow up
  } catch (error) {
    console.error("❌ Failed to start server:", error);
    process.exit(1);
  }
}

startServer();

module.exports = app;
