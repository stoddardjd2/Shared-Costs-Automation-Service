const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
require("dotenv").config();

// Import database connection
const connectDB = require("./config/database");
const {
  startScheduler,
  startSchedulerWithFrequentChecks,
  stopScheduler,
  runSchedulerNow,
  getSchedulerStatus,
} = require("./reminder-scheduler/reminderScheduler");

// Import routes
const userRoutes = require("./routes/userRoutes");
const requestRoutes = require("./routes/requestRoutes");
const supportRoutes = require("./routes/supportRoutes");
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
    startScheduler();
    // Option 2: Every hour (more resilient, higher resource usage)
    // startSchedulerWithFrequentChecks();

    // Security middleware
    app.use(helmet());
    app.use(
      cors({
        origin: [
          process.env.CLIENT_URL,
          "http://localhost:3000",
          "http://localhost:3001", // Alternative React port
          "http://127.0.0.1:3000", // Alternative localhost format
        ],
        credentials: true,
      })
    );

    // Rate limiting
    const limiter = rateLimit({
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 100, // limit each IP to 100 requests per windowMs
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
        message: "Welcome to MongoDB Express MVC API",
        version: "1.0.0",
        status: "Active",
        endpoints: {
          users: "/api/users",
          health: "/health",
        },
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
    // app.use("/api/stripe", stripeRoutes);

    // FOR REMINDER SCHEDULER
    // Admin endpoint to check scheduler status
    app.get("/admin/scheduler-status", async (req, res) => {
      try {
        const status = await getSchedulerStatus();
        res.json(status);
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });
    // Manual trigger endpoint
    app.post("/admin/trigger-reminders", async (req, res) => {
      try {
        console.log("🔧 Manual reminder trigger requested");
        await runSchedulerNow();

        const status = await getSchedulerStatus();
        res.json({
          success: true,
          message: "Reminders processed successfully",
          timestamp: new Date().toISOString(),
          status,
        });
      } catch (error) {
        console.error("❌ Manual reminder trigger failed:", error);
        res.status(500).json({
          success: false,
          message: "Failed to process reminders",
          error: error.message,
        });
      }
    });

    // FOR STRIPE
    // app.get("/connect/standard", (req, res) => {
    //   const state = req.session.id; // CSRF protection
    //   const origin = process.env.SERVER_URL;
    //   const params = new URLSearchParams({
    //     response_type: "code",
    //     client_id: process.env.STRIPE_CLIENT_ID,
    //     scope: "read_write",
    //     redirect_uri: `${origin}/connect/standard/callback`,
    //     state,
    //   });
    //   res.redirect(
    //     `https://connect.stripe.com/oauth/authorize?${params.toString()}`
    //   );
    // });

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
