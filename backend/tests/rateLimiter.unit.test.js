const express = require('express');
const request = require('supertest');

process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-jwt-secret';

const { analyticsExportLimiter } = require('../src/middlewares/rateLimiter');

describe('analytics export limiter', () => {
  test('blocks requests after configured threshold', async () => {
    const app = express();
    app.get('/export', analyticsExportLimiter, (req, res) => {
      res.status(200).json({ ok: true });
    });

    for (let i = 0; i < 10; i++) {
      const res = await request(app).get('/export');
      expect(res.status).toBe(200);
    }

    const blocked = await request(app).get('/export');
    expect(blocked.status).toBe(429);
    expect(blocked.body).toEqual(expect.objectContaining({ success: false }));
  });
});
