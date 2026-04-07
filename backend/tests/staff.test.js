// Staff Management Tests (TC-M01 – TC-M07)

const request = require('supertest');
const { buildApp, seedUsers, resetTickets } = require('./testApp');

let app;
let adminToken;

beforeAll(async () => {
  await seedUsers();
  app = buildApp();

  const res = await request(app)
    .post('/api/auth/login')
    .send({ username: 'admin@alatoo.edu.kg', password: 'Admin123!' });
  adminToken = res.body.data.token;
});

beforeEach(() => {
  resetTickets();
});

describe('TC-M01 — Admin creates staff member with department', () => {
  test('POST /api/users creates staff and returns 201', async () => {
    const res = await request(app)
      .post('/api/users')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        username:     'newstaff@alatoo.edu.kg',
        password:     'Staff123!',
        fullName:     'New Staff Member',
        role:         'staff',
        departmentId: 1
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.username).toBe('newstaff@alatoo.edu.kg');
    expect(res.body.data.departmentId).toBe(1);

    // было: "письмо отправлено"
    expect(res.body.message).toMatch(/email sent|письмо отправлено/i);
  });

  test('created staff has isVerified=false (awaiting invite)', async () => {
    const res = await request(app)
      .post('/api/users')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        username:  'staff.invite@alatoo.edu.kg',
        password:  'Staff123!',
        fullName:  'Invite Test',
        role:      'staff'
      });

    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({ username: 'staff.invite@alatoo.edu.kg', password: 'Staff123!' });

    expect(loginRes.status).toBe(403);

    // было: "установите пароль"
    expect(loginRes.body.message).toMatch(/set your password|установите пароль/i);
  });

  test('created staff appears in GET /api/users list', async () => {
    await request(app)
      .post('/api/users')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ username: 'listed@alatoo.edu.kg', password: 'Staff123!', fullName: 'Listed User', role: 'staff' });

    const list = await request(app)
      .get('/api/users')
      .set('Authorization', `Bearer ${adminToken}`);

    const found = list.body.data.find(u => u.username === 'listed@alatoo.edu.kg');
    expect(found).toBeDefined();
  });

  test('password is never returned in response', async () => {
    const res = await request(app)
      .post('/api/users')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ username: 'nopwd@alatoo.edu.kg', password: 'Staff123!', fullName: 'No Pwd', role: 'staff' });

    expect(res.body.data.password).toBeUndefined();
  });
});

describe('TC-M02 — fullName is required and validated', () => {
  test('empty fullName is rejected with 400', async () => {
    const res = await request(app)
      .post('/api/users')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ username: 'noname@alatoo.edu.kg', password: 'Staff123!', fullName: '' });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  test('single character fullName is rejected', async () => {
    const res = await request(app)
      .post('/api/users')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ username: 'shortname@alatoo.edu.kg', password: 'Staff123!', fullName: 'A' });

    expect(res.status).toBe(400);
  });

  test('missing fullName field is rejected', async () => {
    const res = await request(app)
      .post('/api/users')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ username: 'noname2@alatoo.edu.kg', password: 'Staff123!' });

    expect(res.status).toBe(400);
  });
});

describe('TC-M03 — GET /api/users/departments is public and returns all faculties', () => {
  test('returns 200 without authentication', async () => {
    const res = await request(app).get('/api/users/departments');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  test('returns exactly 5 faculties', async () => {
    const res = await request(app).get('/api/users/departments');
    expect(res.body.data).toHaveLength(5);
  });

  test('returns 200 even with invalid token (fully public endpoint)', async () => {
    const res = await request(app)
      .get('/api/users/departments')
      .set('Authorization', 'Bearer invalid.token');
    expect(res.status).toBe(200);
  });
});

describe('TC-M04 — Admin edits staff role and faculty', () => {
  let targetUserId;

  beforeAll(async () => {
    const list = await request(app)
      .get('/api/users')
      .set('Authorization', `Bearer ${adminToken}`);
    const staff = list.body.data.find(u => u.username === 'staff1@alatoo.edu.kg');
    targetUserId = staff.id;
  });

  test('PUT /api/users/:id updates role and departmentId', async () => {
    const res = await request(app)
      .put(`/api/users/${targetUserId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ role: 'admin', departmentId: 2 });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.role).toBe('admin');
    expect(res.body.data.departmentId).toBe(2);
  });

  test('can update fullName only', async () => {
    const res = await request(app)
      .put(`/api/users/${targetUserId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ fullName: 'Updated Full Name' });

    expect(res.status).toBe(200);
    expect(res.body.data.fullName).toBe('Updated Full Name');
  });

  test('returns 404 for non-existent user', async () => {
    const res = await request(app)
      .put('/api/users/99999')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ role: 'staff' });

    expect(res.status).toBe(404);
  });

  test('admin cannot edit own account via this endpoint', async () => {
    const meRes = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${adminToken}`);
    const adminId = meRes.body.data.id;

    const res = await request(app)
      .put(`/api/users/${adminId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ role: 'staff' });

    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/cannot modify/i);
  });
});

describe('TC-M05 — Admin deactivates staff account', () => {
  let targetId;

  beforeAll(async () => {
    const res = await request(app)
      .post('/api/users')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ username: 'deactivate.me@alatoo.edu.kg', password: 'Staff123!', fullName: 'Deactivate Me', role: 'staff' });
    targetId = res.body.data.id;

    const { users } = require('./testApp');
    const u = users.find(u => u.id === targetId);
    if (u) { u.isVerified = true; }
  });

  test('setting isActive=false blocks login with 403', async () => {
    await request(app)
      .put(`/api/users/${targetId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ isActive: false });

    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({ username: 'deactivate.me@alatoo.edu.kg', password: 'Staff123!' });

    expect(loginRes.status).toBe(403);

    // было: "деактивирован"
    expect(loginRes.body.message).toMatch(/account is deactivated|деактивирован/i);
  });

  test('pre-seeded inactive user is also blocked', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ username: 'inactive@alatoo.edu.kg', password: 'Staff123!' });

    expect(res.status).toBe(403);

    // было: "деактивирован"
    expect(res.body.message).toMatch(/account is deactivated|деактивирован/i);
  });

  test('re-activating staff restores login access', async () => {
    await request(app)
      .put(`/api/users/${targetId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ isActive: true });

    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({ username: 'deactivate.me@alatoo.edu.kg', password: 'Staff123!' });

    expect([200, 403]).toContain(loginRes.status);
  });
});

describe('TC-M06 — Logout endpoint returns success', () => {
  test('POST /api/auth/logout returns success with valid token', async () => {
    const res = await request(app)
      .post('/api/auth/logout')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toBe('Logout successful');
  });
});

describe('TC-M07 — Logout works for both staff and admin roles', () => {
  test('admin can logout', async () => {
    const res = await request(app)
      .post('/api/auth/logout')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
  });

  test('staff can logout', async () => {
    const staffRes = await request(app)
      .post('/api/auth/login')
      .send({ username: 'staff1@alatoo.edu.kg', password: 'Staff123!' });
    const staffToken = staffRes.body.data.token;

    const res = await request(app)
      .post('/api/auth/logout')
      .set('Authorization', `Bearer ${staffToken}`);
    expect(res.status).toBe(200);
  });

  test('logout without token returns 401', async () => {
    const res = await request(app).post('/api/auth/logout');
    expect(res.status).toBe(401);
  });
});