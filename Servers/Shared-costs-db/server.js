const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
require("dotenv").config();

// Import database connection
const connectDB = require("./config/database");

// Import routes
const userRoutes = require("./routes/userRoutes");
const requestRoutes = require('./routes/requestRoutes')
const supportRoutes = require('./routes/supportRoutes')
// Import error handler
const { errorHandler, notFound } = require("./utils/errorHandler");

// Initialize Express app
const app = express();

// Connect to MongoDB
connectDB();

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
  max: 30, // limit each IP to 100 requests per windowMs
  message: "Too many requests from this IP, please try again later.",
});
app.use(limiter);

// Body parsing middleware
app.use(express.json({ limit: "10mb" }));
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
app.use("/api/requests", requestRoutes)
app.use('/api/support', supportRoutes)
// manual routes for support email


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

module.exports = app;
