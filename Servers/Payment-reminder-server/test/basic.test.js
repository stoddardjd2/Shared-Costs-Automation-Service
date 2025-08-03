// test/basic.test.js - Basic tests
const request = require('supertest');

// Mock the createApp function for testing
jest.mock('../reminder-system', () => ({
  initializeReminderSystem: jest.fn().mockResolvedValue({
    getMetrics: () => ({ remindersSent: 0, errors: 0 }),
    getQueueStats: () => ({ waiting: 0, active: 0 }),
    processReminders: jest.fn(),
    db: { collection: () => ({ countDocuments: () => 1 }) }
  })
}));

const { createApp } = require('../app');

describe('Payment Reminder Scheduler', () => {
  let app;

  beforeAll(async () => {
    app = await createApp();
  });

  test('Health endpoint should return healthy status', async () => {
    const response = await request(app)
      .get('/health')
      .expect(200);

    expect(response.body.status).toBe('healthy');
    expect(response.body.service).toBe('reminder-scheduler');
  });

  test('Root endpoint should return API info', async () => {
    const response = await request(app)
      .get('/')
      .expect(200);

    expect(response.body.message).toBe('Payment Reminder Scheduler API');
    expect(response.body.endpoints).toBeDefined();
  });

  test('Metrics endpoint should return metrics', async () => {
    const response = await request(app)
      .get('/api/reminders/metrics')
      .expect(200);

    expect(response.body.success).toBe(true);
    expect(response.body.data).toBeDefined();
  });

  test('Invalid endpoint should return 404', async () => {
    const response = await request(app)
      .get('/invalid-endpoint')
      .expect(404);

    expect(response.body.success).toBe(false);
    expect(response.body.error).toBe('Endpoint not found');
  });
});
