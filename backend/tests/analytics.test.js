// Analytics tests (TC-AN01 – TC-AN06)

const request = require('supertest');
const { buildApp, seedUsers, resetTickets } = require('./testApp');

let app;
let adminToken, staffToken;

beforeAll(async () => {
  await seedUsers();
  app = buildApp();

  const adminRes = await request(app)
    .post('/api/auth/login')
    .send({ username: 'admin@alatoo.edu.kg', password: 'Admin123!' });
  adminToken = adminRes.body.data.token;

  const staffRes = await request(app)
    .post('/api/auth/login')
    .send({ username: 'staff1@alatoo.edu.kg', password: 'Staff123!' });
  staffToken = staffRes.body.data.token;
});

beforeEach(() => {
  resetTickets();
});

async function createCompletedTicket(departmentId = 1) {
  await request(app)
    .post('/api/tickets')
    .send({ purposeKey: 'services.certificate', departmentId });

  const called = await request(app)
    .post('/api/queue/call-next')
    .set('Authorization', `Bearer ${adminToken}`);

  if (called.body.data) {
    await request(app)
      .put(`/api/queue/${called.body.data.id}/complete`)
      .set('Authorization', `Bearer ${adminToken}`);
  }
}

async function createSkippedTicket(departmentId = 1) {
  await request(app)
    .post('/api/tickets')
    .send({ purposeKey: 'services.consultation', departmentId });

  const called = await request(app)
    .post('/api/queue/call-next')
    .set('Authorization', `Bearer ${adminToken}`);

  if (called.body.data) {
    await request(app)
      .put(`/api/queue/${called.body.data.id}/skip`)
      .set('Authorization', `Bearer ${adminToken}`);
  }
}

describe('TC-AN01 — Analytics today endpoint returns data for admin', () => {

  test('GET /api/analytics/today returns 200 for admin', async () => {
    const res = await request(app)
      .get('/api/analytics/today')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  test('response contains all required fields', async () => {
    const res = await request(app)
      .get('/api/analytics/today')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.body.data).toHaveProperty('overview');
    expect(res.body.data).toHaveProperty('timing');
    expect(res.body.data).toHaveProperty('topServices');
    expect(res.body.data).toHaveProperty('staffStats');
  });

  test('overview contains main statistics', async () => {
    const res = await request(app)
      .get('/api/analytics/today')
      .set('Authorization', `Bearer ${adminToken}`);

    const ov = res.body.data.overview;
    expect(ov).toHaveProperty('total');
    expect(ov).toHaveProperty('completed');
    expect(ov).toHaveProperty('cancelled');
    expect(ov).toHaveProperty('waiting');
    expect(ov).toHaveProperty('completionRate');
  });

  test('staff can also access analytics', async () => {
    const res = await request(app)
      .get('/api/analytics/today')
      .set('Authorization', `Bearer ${staffToken}`);

    expect(res.status).toBe(200);
  });

  test('unauthorized request returns 401', async () => {
    const res = await request(app).get('/api/analytics/today');
    expect(res.status).toBe(401);
  });
});


describe('TC-AN02 — formatSeconds helper', () => {

  function formatSeconds(secs) {
    if (!secs || secs <= 0) return '0s';
    if (secs < 60) return `${secs}s`;
    const mins = Math.floor(secs / 60);
    const s = secs % 60;
    return s > 0 ? `${mins}m ${s}s` : `${mins}m`;
  }

    test('0 seconds returns 0s', () => {
    expect(formatSeconds(0)).toBe('0s');
    });

    test('45 seconds returns 45s', () => {
    expect(formatSeconds(45)).toBe('45s');
    });

    test('60 seconds returns 1m', () => {
    expect(formatSeconds(60)).toBe('1m');
    });

    test('90 seconds returns 1m 30s', () => {
    expect(formatSeconds(90)).toBe('1m 30s');
    });
    test('120 seconds → 2m', () => {
    expect(formatSeconds(120)).toBe('2m');
    });

  test('analytics returns numeric timing values', async () => {
    await createCompletedTicket();

    const res = await request(app)
      .get('/api/analytics/today')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(typeof res.body.data.timing.avgWaitTime).toBe('number');
    expect(typeof res.body.data.timing.avgServiceTime).toBe('number');
  });
});


describe('TC-AN03 — Cancelled tickets in analytics', () => {

  test('skipped ticket increases cancelled count', async () => {
    const before = (await request(app)
      .get('/api/analytics/today')
      .set('Authorization', `Bearer ${adminToken}`)).body.data.overview.cancelled;

    await createSkippedTicket();

    const after = (await request(app)
      .get('/api/analytics/today')
      .set('Authorization', `Bearer ${adminToken}`)).body.data.overview.cancelled;

    expect(after).toBe(before + 1);
  });

  test('cancelled includes skipped + manual delete', async () => {
    await createSkippedTicket();

    const ticket = await request(app)
      .post('/api/tickets')
      .send({ purposeKey: 'services.other', departmentId: 1 });

    await request(app)
      .delete(`/api/tickets/${ticket.body.data.id}`)
      .set('Authorization', `Bearer ${adminToken}`);

    const res = await request(app)
      .get('/api/analytics/today')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.body.data.overview.cancelled).toBeGreaterThanOrEqual(2);
  });
});


describe('TC-AN04 — Analytics grouping', () => {

  test('topServices groups by purposeKey', async () => {
    await request(app).post('/api/tickets').send({ purposeKey: 'services.certificate', departmentId: 1 });
    await request(app).post('/api/tickets').send({ purposeKey: 'services.certificate', departmentId: 1 });
    await request(app).post('/api/tickets').send({ purposeKey: 'services.consultation', departmentId: 1 });

    const res = await request(app)
      .get('/api/analytics/today')
      .set('Authorization', `Bearer ${adminToken}`);

    const top = res.body.data.topServices;
    expect(Array.isArray(top)).toBe(true);

    const cert = top.find(s => s.purpose === 'services.certificate');
    expect(cert).toBeDefined();
    expect(cert.count).toBeGreaterThanOrEqual(2);
  });

  test('period analytics supports date range', async () => {
    const today = new Date().toISOString().split('T')[0];

    const res = await request(app)
      .get('/api/analytics/period')
      .query({ startDate: today, endDate: today })
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
  });

  test('missing dates returns 400', async () => {
    const res = await request(app)
      .get('/api/analytics/period')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(400);
  });
});

describe('TC-AN05 — Export functionality', () => {

  test('admin can export data', async () => {
    const res = await request(app)
      .get('/api/analytics/export')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
  });

  test('export returns data and metadata', async () => {
    await createCompletedTicket();

    const res = await request(app)
      .get('/api/analytics/export')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.meta.count).toBe(res.body.data.length);
  });

  test('staff cannot export', async () => {
    const res = await request(app)
      .get('/api/analytics/export')
      .set('Authorization', `Bearer ${staffToken}`);

    expect(res.status).toBe(403);
  });
});

describe('TC-AN06 — Empty export', () => {

  test('future date returns empty array', async () => {
    const res = await request(app)
      .get('/api/analytics/export')
      .query({ startDate: '2099-01-01', endDate: '2099-01-01' })
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(0);
  });

  test('empty period analytics returns zero stats', async () => {
    const res = await request(app)
      .get('/api/analytics/period')
      .query({ startDate: '2099-01-01', endDate: '2099-01-01' })
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.body.data.overview.total).toBe(0);
  });
});