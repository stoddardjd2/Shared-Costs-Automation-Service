# Payment Reminder Scheduler

A scalable, functional job scheduler for payment reminders built with Node.js, MongoDB, Redis, and Bull Queue.

## 🚀 Features

- **Functional Programming Approach** - No classes, pure functions
- **Scalable Redis Queue** - Handles millions of reminders with Bull Queue
- **Multi-Channel Notifications** - SMS (Twilio) and Email (SendGrid)
- **Smart Scheduling** - Cron-based with configurable frequencies
- **Automatic Retries** - Exponential backoff for failed reminders
- **Comprehensive Monitoring** - Metrics, logging, and queue dashboard
- **Production Ready** - Graceful shutdowns, error handling, health checks

## 📋 Prerequisites

- **Node.js** 16+ 
- **MongoDB** 4.4+
- **Redis** 6.0+
- **SendGrid Account** (for email)
- **Twilio Account** (for SMS)

## 🛠️ Installation

### 1. Clone and Install

```bash
git clone <your-repo>
cd payment-reminder-scheduler
npm install
```

### 2. Environment Setup

```bash
cp .env.example .env
```

Edit `.env` with your configuration:

```bash
# Required
MONGODB_URL=mongodb://localhost:27017
REDIS_URL=redis://localhost:6379
DB_NAME=payment_app

# Notifications
SENDGRID_API_KEY=your_key_here
TWILIO_ACCOUNT_SID=your_sid_here
TWILIO_AUTH_TOKEN=your_token_here
TWILIO_FROM_NUMBER=+1234567890
FROM_EMAIL=noreply@yourapp.com
```

### 3. Start Services

```bash
# Start MongoDB (if local)
mongod

# Start Redis (if local)  
redis-server

# Start the application
npm start
```

## 🎯 Quick Start

### Basic Usage

```javascript
// The system automatically starts when you run:
npm start

// Server will be available at:
http://localhost:3000
```

### Manual Trigger

```bash
# Trigger reminder processing immediately
curl -X POST http://localhost:3000/api/reminders/process-now
```

### Check System Health

```bash
curl http://localhost:3000/health
```

## 📊 API Endpoints

### System Monitoring

```bash
GET  /health                    # System health check
GET  /api/reminders/metrics     # Performance metrics
GET  /api/reminders/stats       # Queue statistics
```

### Reminder Management

```bash
POST /api/reminders/process-now           # Manual trigger
POST /api/reminders/schedule-one-time     # Schedule one-time reminder
POST /api/reminders/update-payment        # Update payment amount
GET  /api/reminders/pending/:requestId    # Get pending reminders
```

### Queue Control

```bash
POST /api/reminders/queue/pause           # Pause queue processing
POST /api/reminders/queue/resume          # Resume queue processing
POST /api/reminders/reset-metrics         # Reset metrics (dev)
```

## 🔧 Configuration

### Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `MONGODB_URL` | ✅ | - | MongoDB connection string |
| `REDIS_URL` | ✅ | - | Redis connection string |
| `DB_NAME` | ✅ | - | Database name |
| `SENDGRID_API_KEY` | ⚠️ | - | For email notifications |
| `TWILIO_ACCOUNT_SID` | ⚠️ | - | For SMS notifications |
| `PORT` | ❌ | 3000 | Server port |
| `CRON_SCHEDULE` | ❌ | `0 * * * *` | Cron schedule (hourly) |
| `BATCH_SIZE` | ❌ | 1000 | Requests per batch |

## 🚀 Production Deployment

### Docker

```bash
# Build and run
docker build -t reminder-scheduler .
docker run -p 3000:3000 reminder-scheduler
```

### Docker Compose

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f app
```

## 🧪 Testing

```bash
# Run tests
npm test

# Run with coverage
npm run test:coverage

# Lint code
npm run lint
```

## 📞 Support

For issues or questions:

1. Check the logs: `npm run logs`
2. Verify environment: `curl http://localhost:3000/health` 
3. Test notifications: Use `/api/reminders/test-notification`
4. Check queue status: `/api/reminders/stats`

## 📄 License

MIT License - see LICENSE file for details.
