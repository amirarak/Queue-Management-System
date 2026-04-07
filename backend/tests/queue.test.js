// Queue Management Tests (TC-Q01 – TC-Q08)

const request = require('supertest');
const { buildApp, seedUsers, resetTickets } = require('./testApp');

let app;
let adminToken, staffToken, staff2Token;

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

  const staff2Res = await request(app)
    .post('/api/auth/login')
    .send({ username: 'staff2@alatoo.edu.kg', password: 'Staff123!' });
  staff2Token = staff2Res.body.data.token;
});

beforeEach(() => {
  resetTickets();
});

async function createTicket(departmentId = 1, purposeKey = 'services.certificate') {
  const res = await request(app)
    .post('/api/tickets')
    .send({ purposeKey, departmentId });
  return res.body.data;
}

async function callNext(token) {
  return request(app)
    .post('/api/queue/call-next')
    .set('Authorization', `Bearer ${token}`);
}

describe('TC-Q01 — Call Next moves ticket to serving', () => {
  test('ticket status changes from waiting to serving', async () => {
    await createTicket(1);
    const res = await callNext(staffToken);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.status).toBe('serving');
  });

  test('calledAt timestamp is set', async () => {
    await createTicket(1);
    const res = await callNext(staffToken);

    expect(res.body.data.calledAt).not.toBeNull();
  });

  test('servedBy is populated with staff id', async () => {
    await createTicket(1);
    const res = await callNext(staffToken);

    expect(res.body.data.servedBy).toBeDefined();
    expect(typeof res.body.data.servedBy).toBe('number');
  });

  test('GET /api/queue/current reflects the serving ticket', async () => {
    await createTicket(1);
    await callNext(staffToken);

    const currentRes = await request(app)
      .get('/api/queue/current')
      .set('Authorization', `Bearer ${staffToken}`);

    expect(currentRes.body.data).not.toBeNull();
    expect(currentRes.body.data.status).toBe('serving');
  });
});

describe('TC-Q02 — Complete ticket', () => {
  test('ticket status changes to completed', async () => {
    await createTicket(1);
    const calledRes = await callNext(staffToken);
    const ticketId = calledRes.body.data.id;

    const completeRes = await request(app)
      .put(`/api/queue/${ticketId}/complete`)
      .set('Authorization', `Bearer ${staffToken}`)
      .send({ notes: 'Served successfully' });

    expect(completeRes.status).toBe(200);
    expect(completeRes.body.data.status).toBe('completed');
    expect(completeRes.body.data.completedAt).not.toBeNull();
    expect(completeRes.body.data.serviceTime).toBeGreaterThanOrEqual(0);
  });

  test('currentTicket is null after completion', async () => {
    await createTicket(1);
    const calledRes = await callNext(staffToken);
    const ticketId = calledRes.body.data.id;

    await request(app)
      .put(`/api/queue/${ticketId}/complete`)
      .set('Authorization', `Bearer ${staffToken}`);

    const currentRes = await request(app)
      .get('/api/queue/current')
      .set('Authorization', `Bearer ${staffToken}`);

    expect(currentRes.body.data).toBeNull();
  });

  test('cannot complete a ticket that is not serving', async () => {
    const ticket = await createTicket(1);
    const res = await request(app)
      .put(`/api/queue/${ticket.id}/complete`)
      .set('Authorization', `Bearer ${staffToken}`);

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });
});

describe('TC-Q03 — Skip ticket', () => {
  test('ticket status changes to cancelled with notes=skipped', async () => {
    await createTicket(1);
    const calledRes = await callNext(staffToken);
    const ticketId = calledRes.body.data.id;

    const skipRes = await request(app)
      .put(`/api/queue/${ticketId}/skip`)
      .set('Authorization', `Bearer ${staffToken}`);

    expect(skipRes.status).toBe(200);
    expect(skipRes.body.data.status).toBe('cancelled');
    expect(skipRes.body.data.notes).toBe('skipped');
  });

  test('completedAt is set on skip', async () => {
    await createTicket(1);
    const calledRes = await callNext(staffToken);
    const skipRes = await request(app)
      .put(`/api/queue/${calledRes.body.data.id}/skip`)
      .set('Authorization', `Bearer ${staffToken}`);

    expect(skipRes.body.data.completedAt).not.toBeNull();
  });

  test('cannot skip a waiting ticket (must be serving)', async () => {
    const ticket = await createTicket(1);
    const res = await request(app)
      .put(`/api/queue/${ticket.id}/skip`)
      .set('Authorization', `Bearer ${staffToken}`);

    expect(res.status).toBe(400);
  });
});

describe("TC-Q04 — Skip response contains full ticket info for modal", () => {
  test('skip response includes ticketCode for confirmation display', async () => {
    await createTicket(1);
    const calledRes = await callNext(staffToken);
    const skipRes = await request(app)
      .put(`/api/queue/${calledRes.body.data.id}/skip`)
      .set('Authorization', `Bearer ${staffToken}`);

    expect(skipRes.body.data.ticketCode).toBeDefined();
    expect(skipRes.body.data.ticketCode).toMatch(/^ENG-\d+$/);
  });
});

describe("TC-Q05 — Staff sees only their department's queue", () => {
  test('staff1 (dept 1) cannot see dept 2 tickets in queue', async () => {
    await createTicket(1);
    await createTicket(2);

    const res = await request(app)
      .get('/api/queue')
      .set('Authorization', `Bearer ${staffToken}`);

    expect(res.body.data.tickets.every(t => t.departmentId === 1)).toBe(true);
  });

  test('staff1 cannot call ECO tickets', async () => {
    await createTicket(2);
    const res = await callNext(staffToken);

    expect(res.status).toBe(404);
  });

  test('staff2 (dept 2) can call ECO ticket', async () => {
    await createTicket(2);
    const res = await callNext(staff2Token);

    expect(res.status).toBe(200);
    expect(res.body.data.departmentId).toBe(2);
  });
});

describe('TC-Q06 — Display Board (no auth) sees all department queues', () => {
  test('unauthenticated request returns tickets from all departments', async () => {
    await createTicket(1);
    await createTicket(2);
    await createTicket(3);

    const res = await request(app).get('/api/queue');

    expect(res.status).toBe(200);
    const deptIds = res.body.data.tickets.map(t => t.departmentId);
    expect(deptIds).toContain(1);
    expect(deptIds).toContain(2);
    expect(deptIds).toContain(3);
  });
});

describe('TC-Q07 — Cannot call next when a ticket is already serving', () => {
  test('second Call Next returns 400', async () => {
    await createTicket(1);
    await createTicket(1);
    await callNext(staffToken);

    const res = await callNext(staffToken);
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toMatch(/already.*serving|complete it first/i);
  });

  test('after completing, Call Next succeeds again', async () => {
    await createTicket(1);
    await createTicket(1);
    const first = await callNext(staffToken);

    await request(app)
      .put(`/api/queue/${first.body.data.id}/complete`)
      .set('Authorization', `Bearer ${staffToken}`);

    const second = await callNext(staffToken);
    expect(second.status).toBe(200);
  });
});

describe('TC-Q08 — Queue data is always fresh (no stale cache)', () => {
  test('queue count reflects newly created ticket immediately', async () => {
    const before = await request(app).get('/api/queue');
    const countBefore = before.body.data.count;

    await createTicket(1);

    const after = await request(app).get('/api/queue');
    expect(after.body.data.count).toBe(countBefore + 1);
  });

  test('queue count decreases after ticket is called', async () => {
    await createTicket(1);
    const before = await request(app).get('/api/queue');

    await callNext(staffToken);

    const after = await request(app).get('/api/queue');
    expect(after.body.data.count).toBe(before.body.data.count - 1);
  });

  test('history endpoint returns recently called tickets', async () => {
    await createTicket(1);
    await callNext(staffToken);

    const res = await request(app).get('/api/queue/history');
    expect(res.status).toBe(200);
    expect(res.body.data.length).toBeGreaterThan(0);
  });
});