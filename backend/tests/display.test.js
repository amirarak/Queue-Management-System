// Display Board Tests (TC-D01 – TC-D05) 

const request = require('supertest');
const { buildApp, seedUsers, resetTickets } = require('./testApp');

let app;
let staffToken;

beforeAll(async () => {
  await seedUsers();
  app = buildApp();

  const res = await request(app)
    .post('/api/auth/login')
    .send({ username: 'staff1@alatoo.edu.kg', password: 'Staff123!' });
  staffToken = res.body.data.token;
});

beforeEach(() => {
  resetTickets();
});

describe('TC-D01 — Display Board endpoints require no authentication', () => {
  test('GET /api/queue returns 200 without token', async () => {
    const res = await request(app).get('/api/queue');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  test('GET /api/queue/current returns 200 without token', async () => {
    const res = await request(app).get('/api/queue/current');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  test('GET /api/queue/history returns 200 without token', async () => {
    const res = await request(app).get('/api/queue/history');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  test('no 401 error is returned for any display endpoint', async () => {
    const endpoints = ['/api/queue', '/api/queue/current', '/api/queue/history'];
    for (const url of endpoints) {
      const res = await request(app).get(url);
      expect(res.status).not.toBe(401);
      expect(res.status).not.toBe(500);
    }
  });
});

describe('TC-D02 — Queue data is immediately current after ticket creation', () => {
  test('new ticket appears in queue instantly (no cache delay)', async () => {
    const before = (await request(app).get('/api/queue')).body.data.count;

    await request(app)
      .post('/api/tickets')
      .send({ purposeKey: 'services.certificate', departmentId: 1 });

    const after = (await request(app).get('/api/queue')).body.data.count;
    expect(after).toBe(before + 1);
  });

  test('GET /api/queue responds quickly (under 500ms)', async () => {
    const start = Date.now();
    await request(app).get('/api/queue');
    const elapsed = Date.now() - start;
    expect(elapsed).toBeLessThan(500);
  });
});

describe('TC-D03 — GET /api/queue/current returns serving ticket with ticketCode', () => {
  test('current ticket has ticketCode after being called', async () => {
    await request(app)
      .post('/api/tickets')
      .send({ purposeKey: 'services.certificate', departmentId: 1 });

    await request(app)
      .post('/api/queue/call-next')
      .set('Authorization', `Bearer ${staffToken}`);

    const res = await request(app).get('/api/queue/current');

    expect(res.status).toBe(200);
    expect(res.body.data).not.toBeNull();
    expect(res.body.data.ticketCode).toBeDefined();
    expect(res.body.data.ticketCode).toMatch(/^ENG-\d+$/);
    expect(res.body.data.status).toBe('serving');
  });

  test('current ticket is null when no ticket is being served', async () => {
    const res = await request(app).get('/api/queue/current');
    expect(res.body.data).toBeNull();
  });

  test('ticketCode has correct format for display (prefix-number)', async () => {
    await request(app)
      .post('/api/tickets')
      .send({ purposeKey: 'services.consultation', departmentId: 2 });

    await request(app)
      .post('/api/queue/call-next')
      .set('Authorization', `Bearer ${staffToken}`);

    const adminRes = await request(app)
      .post('/api/auth/login')
      .send({ username: 'admin@alatoo.edu.kg', password: 'Admin123!' });
    const adminToken = adminRes.body.data.token;

    await request(app)
      .post('/api/tickets')
      .send({ purposeKey: 'services.certificate', departmentId: 1 });

    await request(app)
      .post('/api/queue/call-next')
      .set('Authorization', `Bearer ${adminToken}`);

    const current = await request(app).get('/api/queue/current');
    if (current.body.data) {
      const [prefix, num] = current.body.data.ticketCode.split('-');
      expect(prefix).toMatch(/^[A-Z]{2,5}$/);
      expect(Number(num)).toBeGreaterThanOrEqual(1);
    }
  });
});

describe('TC-D04 — Display Board does not crash when user is not authenticated', () => {
  test('GET /api/queue returns 200 (not 500) without any token', async () => {
    const res = await request(app).get('/api/queue');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  test('GET /api/queue/current returns 200 (not 500) without token', async () => {
    const res = await request(app).get('/api/queue/current');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  test('response body has correct structure even without req.user', async () => {
    const queueRes   = await request(app).get('/api/queue');
    const currentRes = await request(app).get('/api/queue/current');
    const historyRes = await request(app).get('/api/queue/history');

    expect(queueRes.body).toHaveProperty('data');
    expect(currentRes.body).toHaveProperty('data');
    expect(historyRes.body).toHaveProperty('data');
  });

  test('invalid/expired token does not cause 500 (optionalAuth swallows error)', async () => {
    const res = await request(app)
      .get('/api/queue')
      .set('Authorization', 'Bearer expired.token.value');

    expect(res.status).toBe(200); 
  });
});

describe('TC-D05 — Multi-language department names available in API', () => {
  test('departments endpoint returns all three language names', async () => {
    const res = await request(app).get('/api/users/departments');

    res.body.data.forEach(dept => {
      expect(dept.nameRu).toBeTruthy();
      expect(dept.nameEn).toBeTruthy();
      expect(dept.nameKy).toBeTruthy();
    });
  });

  test('ticket response includes department with all language names', async () => {
  const res = await request(app)
    .post('/api/tickets')
    .send({ purposeKey: 'services.certificate', departmentId: 1 });

  const dept = res.body.data.department;

  expect(dept.nameRu).toBeTruthy();
  expect(dept.nameEn).toContain('Engineering');
  expect(dept.nameKy).toBeTruthy();
});
});