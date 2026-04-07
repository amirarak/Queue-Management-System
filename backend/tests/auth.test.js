// Authentication Tests (TC-A01 – TC-A08)  

const request = require('supertest');
const jwt     = require('jsonwebtoken');
const { buildApp, seedUsers, resetTickets, JWT_SECRET } = require('./testApp');

let app;

beforeAll(async () => {
  await seedUsers();
  app = buildApp();
});

beforeEach(() => {
  resetTickets();
});

describe('TC-A01 — Login with valid credentials', () => {
  test('returns 200, JWT token and user data', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ username: 'admin@alatoo.edu.kg', password: 'Admin123!' });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.token).toBeDefined();
    expect(res.body.data.user.username).toBe('admin@alatoo.edu.kg');
    expect(res.body.data.user.role).toBe('admin');
    expect(res.body.data.user.password).toBeUndefined(); 
  });

  test('JWT token is valid and contains correct payload', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ username: 'staff1@alatoo.edu.kg', password: 'Staff123!' });

    const decoded = jwt.verify(res.body.data.token, JWT_SECRET);
    expect(decoded.username).toBe('staff1@alatoo.edu.kg');
    expect(decoded.role).toBe('staff');
    expect(decoded.departmentId).toBe(1);
  });
});

describe('TC-A02 — Login with wrong password', () => {
  test('returns 401 and error message', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ username: 'admin@alatoo.edu.kg', password: 'WrongPass999!' });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toMatch(/invalid|неверн/i);
  });

  test('returns 401 for unknown user', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ username: 'nobody@alatoo.edu.kg', password: 'Pass123!' });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });
});

describe('TC-A03 — Login with non-alatoo.edu.kg email', () => {
  test('backend Joi rejects gmail.com address with 400', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ username: 'user@gmail.com', password: 'Pass123!' });

    expect([400, 401]).toContain(res.status);
    expect(res.body.success).toBe(false);
  });

  test('register endpoint rejects non-alatoo email with 400', async () => {
    const adminToken = (await request(app)
      .post('/api/auth/login')
      .send({ username: 'admin@alatoo.edu.kg', password: 'Admin123!' })).body.data.token;

    const res = await request(app)
      .post('/api/users')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ username: 'user@gmail.com', password: 'Admin123!', fullName: 'Test User' });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });
});

describe('TC-A04 — Access protected endpoint without token', () => {
  test('GET /api/auth/me without token returns 401', async () => {
    const res = await request(app).get('/api/auth/me');
    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toMatch(/no token/i);
  });

  test('POST /api/queue/call-next without token returns 401', async () => {
    const res = await request(app).post('/api/queue/call-next');
    expect(res.status).toBe(401);
  });

  test('GET /api/tickets without token returns 401', async () => {
    const res = await request(app).get('/api/tickets');
    expect(res.status).toBe(401);
  });
});

describe('TC-A05 — Staff cannot access admin-only endpoints', () => {
  let staffToken;

  beforeAll(async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ username: 'staff1@alatoo.edu.kg', password: 'Staff123!' });
    staffToken = res.body.data.token;
  });

  test('GET /api/users returns 403 for staff', async () => {
    const res = await request(app)
      .get('/api/users')
      .set('Authorization', `Bearer ${staffToken}`);
    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
  });

  test('GET /api/analytics/export returns 403 for staff', async () => {
    const res = await request(app)
      .get('/api/analytics/export')
      .set('Authorization', `Bearer ${staffToken}`);
    expect(res.status).toBe(403);
  });

  test('POST /api/users returns 403 for staff', async () => {
    const res = await request(app)
      .post('/api/users')
      .set('Authorization', `Bearer ${staffToken}`)
      .send({ username: 'new@alatoo.edu.kg', password: 'Pass123!', fullName: 'New' });
    expect(res.status).toBe(403);
  });
});

describe('TC-A06 — Forgot password always returns 200', () => {
  test('valid @alatoo.edu.kg email returns 200', async () => {
    const res = await request(app)
      .post('/api/auth/forgot-password')
      .send({ username: 'admin@alatoo.edu.kg' });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  test('non-existent email also returns 200 (security — no enumeration)', async () => {
    const res = await request(app)
      .post('/api/auth/forgot-password')
      .send({ username: 'nobody@alatoo.edu.kg' });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toMatch(/if account exists|если аккаунт существует/i);
  });
});

describe('TC-A07 — Set password via valid invite token', () => {
  test('sets password and marks user as verified', async () => {
    const res = await request(app)
      .post('/api/auth/set-password')
      .send({ token: 'valid-invite-token-abc123', password: 'NewPass123!' });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toMatch(/successfully set|успешно установлен/i);
  });

  test('user can login after setting password', async () => {
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({ username: 'unverified@alatoo.edu.kg', password: 'NewPass123!' });

    expect(loginRes.status).toBe(200);
    expect(loginRes.body.data.token).toBeDefined();
  });
});

describe('TC-A08 — Set password via expired or used token', () => {
  test('returns 400 for unknown token', async () => {
    const res = await request(app)
      .post('/api/auth/set-password')
      .send({ token: 'expired-or-invalid-token-xyz', password: 'NewPass123!' });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toMatch(/invalid|already used|недействительна|использована/i);
  });

  test('returns 400 when token was already consumed (TC-A07)', async () => {
    const res = await request(app)
      .post('/api/auth/set-password')
      .send({ token: 'valid-invite-token-abc123', password: 'AnotherPass123!' });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  test('returns 400 when password is missing', async () => {
    const res = await request(app)
      .post('/api/auth/set-password')
      .send({ token: 'some-token' });

    expect(res.status).toBe(400);
  });
});