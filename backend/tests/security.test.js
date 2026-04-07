// Security & Validation Tests (TC-S01 – TC-S08)  

const request = require('supertest');
const bcrypt  = require('bcryptjs');
const { buildApp, seedUsers, resetTickets, getUsers } = require('./testApp');

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

describe('TC-S01 — Ticket creation requires departmentId', () => {
  test('missing departmentId returns 400', async () => {
    const res = await request(app)
      .post('/api/tickets')
      .send({ purposeKey: 'services.certificate' }); 

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toMatch(/validation/i);
  });

  test('error includes field name "departmentId"', async () => {
    const res = await request(app)
      .post('/api/tickets')
      .send({ purposeKey: 'services.certificate' });

    const fields = res.body.errors?.map(e => e.field) || [];
    expect(fields).toContain('departmentId');
  });

  test('null departmentId returns 400', async () => {
    const res = await request(app)
      .post('/api/tickets')
      .send({ purposeKey: 'services.certificate', departmentId: null });

    expect(res.status).toBe(400);
  });

  test('invalid departmentId (999) returns 404 department not found', async () => {
    const res = await request(app)
      .post('/api/tickets')
      .send({ purposeKey: 'services.certificate', departmentId: 999 });

    expect(res.status).toBe(404);
    expect(res.body.message).toMatch(/department not found/i);
  });
});

describe('TC-S02 — Ticket creation requires purposeKey OR purpose', () => {
  test('no purposeKey and no purpose returns 400', async () => {
    const res = await request(app)
      .post('/api/tickets')
      .send({ departmentId: 1 });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  test('purposeKey alone is sufficient', async () => {
    const res = await request(app)
      .post('/api/tickets')
      .send({ purposeKey: 'services.certificate', departmentId: 1 });

    expect(res.status).toBe(201);
  });

  test('purpose alone is sufficient (legacy field)', async () => {
    const res = await request(app)
      .post('/api/tickets')
      .send({ purpose: 'Consultation', departmentId: 1 });

    expect(res.status).toBe(201);
  });

  test('both purposeKey and purpose is also valid', async () => {
    const res = await request(app)
      .post('/api/tickets')
      .send({ purposeKey: 'services.other', purpose: 'Other', departmentId: 1 });

    expect(res.status).toBe(201);
  });

  test('purposeKey shorter than 3 chars returns 400', async () => {
    const res = await request(app)
      .post('/api/tickets')
      .send({ purposeKey: 'ab', departmentId: 1 });

    expect(res.status).toBe(400);
  });
});

describe('TC-S03 — Queue management endpoints require authentication', () => {
  test('POST /api/queue/call-next without token returns 401', async () => {
    const res = await request(app).post('/api/queue/call-next');
    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  test('PUT /api/queue/:id/complete without token returns 401', async () => {
    const res = await request(app).put('/api/queue/1/complete');
    expect(res.status).toBe(401);
  });

  test('PUT /api/queue/:id/skip without token returns 401', async () => {
    const res = await request(app).put('/api/queue/1/skip');
    expect(res.status).toBe(401);
  });

  test('malformed Bearer token returns 401', async () => {
    const res = await request(app)
      .post('/api/queue/call-next')
      .set('Authorization', 'Bearer not.a.real.token');
    expect(res.status).toBe(401);
  });

  test('expired token simulation returns 401', async () => {
    const jwt = require('jsonwebtoken');
    const expiredToken = jwt.sign(
      { id: 1, username: 'admin@alatoo.edu.kg', role: 'admin' },
      'test-secret-key',
      { expiresIn: '-1s' } 
    );
    const res = await request(app)
      .post('/api/queue/call-next')
      .set('Authorization', `Bearer ${expiredToken}`);
    expect(res.status).toBe(401);
  });
});

describe('TC-S04 — Staff cannot access admin-only user management', () => {
  test('DELETE /api/users/:id as staff returns 403', async () => {
    const res = await request(app)
      .delete('/api/users/99')
      .set('Authorization', `Bearer ${staffToken}`);

    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
  });

  test('PUT /api/users/:id as staff returns 403', async () => {
    const res = await request(app)
      .put('/api/users/99')
      .set('Authorization', `Bearer ${staffToken}`)
      .send({ role: 'admin' });

    expect(res.status).toBe(403);
  });

  test('POST /api/users as staff returns 403', async () => {
    const res = await request(app)
      .post('/api/users')
      .set('Authorization', `Bearer ${staffToken}`)
      .send({ username: 'new@alatoo.edu.kg', password: 'Pass123!', fullName: 'New' });

    expect(res.status).toBe(403);
  });

  test('GET /api/users list as staff returns 403', async () => {
    const res = await request(app)
      .get('/api/users')
      .set('Authorization', `Bearer ${staffToken}`);

    expect(res.status).toBe(403);
  });
});

describe('TC-S05 — SQL injection attempts are rejected by Joi validation', () => {
  test('SQL injection in login email is rejected', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ username: "admin@alatoo.edu.kg' OR '1'='1", password: 'anything' });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  test('SQL injection in register email is rejected', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ username: "'; DROP TABLE users; --", password: 'anything' });

    expect(res.status).toBe(400);
  });

  test('script injection in purposeKey stored as-is (parameterized queries protect DB)', async () => {
    const res = await request(app)
      .post('/api/tickets')
      .send({
        purposeKey: '<script>alert(1)</script>',
        departmentId: 1
      });

    expect([201, 400]).toContain(res.status);
  });

  test('empty string in password field returns 400', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ username: 'admin@alatoo.edu.kg', password: '' });

    expect(res.status).toBe(400);
  });
});

describe('TC-S06 — Passwords are stored as bcrypt hashes', () => {
  test('seeded admin password starts with bcrypt prefix $2', () => {
    const admin = getUsers().find(u => u.username === 'admin@alatoo.edu.kg');
    expect(admin.password).toMatch(/^\$2[aby]\$/);
  });

  test('seeded staff password is hashed (not plaintext)', () => {
    const staff = getUsers().find(u => u.username === 'staff1@alatoo.edu.kg');
    expect(staff.password).not.toBe('Staff123!');
    expect(staff.password.length).toBeGreaterThan(20);
  });

  test('newly created user password is also hashed', async () => {
    await request(app)
      .post('/api/users')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ username: 'hashcheck@alatoo.edu.kg', password: 'Hashed123!', fullName: 'Hash Check', role: 'staff' });

    const user = getUsers().find(u => u.username === 'hashcheck@alatoo.edu.kg');
    expect(user.password).not.toBe('Hashed123!');
    expect(user.password).toMatch(/^\$2[aby]\$/);
  });

  test('bcrypt hash correctly validates the original password', async () => {
    const admin = getUsers().find(u => u.username === 'admin@alatoo.edu.kg');
    const isValid = await bcrypt.compare('Admin123!', admin.password);
    expect(isValid).toBe(true);
  });

  test('wrong password does not match bcrypt hash', async () => {
    const admin = getUsers().find(u => u.username === 'admin@alatoo.edu.kg');
    const isValid = await bcrypt.compare('WrongPass!', admin.password);
    expect(isValid).toBe(false);
  });

  test('password is never exposed in API responses', async () => {
    const meRes = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(meRes.body.data.password).toBeUndefined();
    expect(meRes.body.data.verificationToken).toBeUndefined();
  });
});

describe('TC-S07 — Admin credentials created via seed (bcrypt), not raw SQL', () => {
  test('admin user exists and is authenticated', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ username: 'admin@alatoo.edu.kg', password: 'Admin123!' });

    expect(res.status).toBe(200);
    expect(res.body.data.user.role).toBe('admin');
  });

  test('admin password hash has bcrypt cost factor 12 ($2b$12$)', () => {
    const admin = getUsers().find(u => u.username === 'admin@alatoo.edu.kg');
    expect(admin.password).toMatch(/^\$2[aby]\$12\$/);
  });

  test('admin account is isVerified=true from seed (not from invite flow)', () => {
    const admin = getUsers().find(u => u.username === 'admin@alatoo.edu.kg');
    expect(admin.isVerified).toBe(true);
    expect(admin.isActive).toBe(true);
  });
});

describe('TC-S08 — Public endpoints work without valid token (no spurious 401)', () => {
  const publicEndpoints = [
    { method: 'GET',  path: '/api/queue' },
    { method: 'GET',  path: '/api/queue/current' },
    { method: 'GET',  path: '/api/queue/history' },
    { method: 'GET',  path: '/api/users/departments' },
    { method: 'GET',  path: '/health' },
  ];

  test.each(publicEndpoints)(
    '$method $path returns 200 without token',
    async ({ method, path }) => {
      const res = method === 'GET'
        ? await request(app).get(path)
        : await request(app).post(path);
      expect(res.status).toBe(200);
    }
  );

  test('POST /api/tickets works without token (kiosk is public)', async () => {
    const res = await request(app)
      .post('/api/tickets')
      .send({ purposeKey: 'services.certificate', departmentId: 1 });
    expect(res.status).toBe(201);
  });

  test('public endpoints return 200 even with garbage Authorization header', async () => {
    for (const { method, path } of publicEndpoints) {
      const res = await request(app)
        [method.toLowerCase()](path)
        .set('Authorization', 'Bearer garbage.token.value');
      expect(res.status).toBe(200);
    }
  });

  test('POST /api/auth/forgot-password returns 200 (public, no token needed)', async () => {
    const res = await request(app)
      .post('/api/auth/forgot-password')
      .send({ username: 'test@alatoo.edu.kg' });
    expect(res.status).toBe(200);
  });
});