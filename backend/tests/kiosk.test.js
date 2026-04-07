// Kiosk — Ticket Creation Tests (TC-K01 – TC-K07)  


const request = require('supertest');
const { buildApp, seedUsers, resetTickets } = require('./testApp');

let app;

beforeAll(async () => {
  await seedUsers();
  app = buildApp();
});

beforeEach(() => {
  resetTickets();
});

describe('TC-K01 — Departments load without authentication', () => {
  test('GET /api/users/departments returns 200 without token', async () => {
    const res = await request(app).get('/api/users/departments');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  test('returns exactly 5 active faculties', async () => {
    const res = await request(app).get('/api/users/departments');

    expect(res.body.data).toHaveLength(5);
  });

  test('each faculty has code, nameRu, nameEn, nameKy', async () => {
    const res = await request(app).get('/api/users/departments');
    const dept = res.body.data[0];

    expect(dept).toHaveProperty('code');
    expect(dept).toHaveProperty('nameRu');
    expect(dept).toHaveProperty('nameEn');
    expect(dept).toHaveProperty('nameKy');
    expect(dept).toHaveProperty('isActive', true);
  });

  test('contains ENG, ECO, SOC, MED, HUM codes', async () => {
    const res = await request(app).get('/api/users/departments');
    const codes = res.body.data.map(d => d.code);

    expect(codes).toContain('ENG');
    expect(codes).toContain('ECO');
    expect(codes).toContain('SOC');
    expect(codes).toContain('MED');
    expect(codes).toContain('HUM');
  });
});

describe('TC-K02 — Ticket created with correct ticketCode', () => {
  test('first ticket for ENG dept gets code ENG-1', async () => {
    const res = await request(app)
      .post('/api/tickets')
      .send({ purposeKey: 'services.certificate', departmentId: 1 });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.ticketCode).toBe('ENG-1');
    expect(res.body.data.ticketNumber).toBe(1);
    expect(res.body.data.status).toBe('waiting');
  });

  test('second ticket increments to ENG-2', async () => {
    await request(app).post('/api/tickets').send({ purposeKey: 'services.certificate', departmentId: 1 });
    const res = await request(app).post('/api/tickets').send({ purposeKey: 'services.consultation', departmentId: 1 });

    expect(res.body.data.ticketCode).toBe('ENG-2');
  });

  test('different dept numbering is independent — ECO-1', async () => {
    await request(app).post('/api/tickets').send({ purposeKey: 'services.certificate', departmentId: 1 });
    const res = await request(app).post('/api/tickets').send({ purposeKey: 'services.certificate', departmentId: 2 });

    expect(res.body.data.ticketCode).toBe('ECO-1');
  });

  test('ticket is created without authentication (public kiosk)', async () => {
    const res = await request(app)
      .post('/api/tickets')
      .send({ purposeKey: 'services.certificate', departmentId: 1 });

    expect(res.status).toBe(201);
  });

  test('ticket includes department object in response', async () => {
    const res = await request(app)
      .post('/api/tickets')
      .send({ purposeKey: 'services.certificate', departmentId: 1 });

    expect(res.body.data.department).toBeDefined();
    expect(res.body.data.department.code).toBe('ENG');
  });
});

describe('TC-K03 — ticketCode prefix matches department code', () => {
  test.each([
    [1, 'ENG'],
    [2, 'ECO'],
    [3, 'SOC'],
    [4, 'MED'],
    [5, 'HUM']
  ])('departmentId %i produces %s prefix', async (deptId, expectedCode) => {
    const res = await request(app)
      .post('/api/tickets')
      .send({ purposeKey: 'services.certificate', departmentId: deptId });

    expect(res.body.data.ticketCode).toMatch(new RegExp(`^${expectedCode}-\\d+$`));
    const [prefix] = res.body.data.ticketCode.split('-');
    expect(prefix).toBe(expectedCode);
  });

  test('ticketCode can be split into prefix and number', async () => {
    const res = await request(app)
      .post('/api/tickets')
      .send({ purposeKey: 'services.certificate', departmentId: 1 });

    const code   = res.body.data.ticketCode; 
    const parts  = code.split('-');
    expect(parts).toHaveLength(2);
    expect(parts[0]).toBe('ENG');
    expect(Number(parts[1])).toBeGreaterThanOrEqual(1);
  });
});

describe('TC-K04 — purposeKey is stored correctly for i18n translation', () => {
  test('purposeKey is stored exactly as sent', async () => {
    const res = await request(app)
      .post('/api/tickets')
      .send({ purposeKey: 'services.certificate', departmentId: 1 });

    expect(res.body.data.purposeKey).toBe('services.certificate');
  });

  test('all six service keys are accepted', async () => {
    const keys = [
      'services.certificate',
      'services.academicLeave',
      'services.transfer',
      'services.curriculumChange',
      'services.consultation',
      'services.other'
    ];
    for (const key of keys) {
      const res = await request(app)
        .post('/api/tickets')
        .send({ purposeKey: key, departmentId: 1 });
      expect(res.status).toBe(201);
      expect(res.body.data.purposeKey).toBe(key);
    }
  });

  test('legacy "purpose" field is also accepted and stored', async () => {
    const res = await request(app)
      .post('/api/tickets')
      .send({ purpose: 'Consultation', departmentId: 1 });

    expect(res.status).toBe(201);
    expect(res.body.data.purpose).toBeDefined();
  });
});

describe('TC-K05 — Ticket persists in waiting status after creation', () => {
  test('created ticket has status "waiting"', async () => {
    const res = await request(app)
      .post('/api/tickets')
      .send({ purposeKey: 'services.certificate', departmentId: 1 });

    expect(res.body.data.status).toBe('waiting');
  });

  test('ticket is retrievable by id after creation', async () => {
    const created = await request(app)
      .post('/api/tickets')
      .send({ purposeKey: 'services.certificate', departmentId: 1 });

    const id  = created.body.data.id;
    const res = await request(app).get(`/api/tickets/${id}`);

    expect(res.status).toBe(200);
    expect(res.body.data.id).toBe(id);
    expect(res.body.data.status).toBe('waiting');
  });
});

describe('TC-K06 — API is locale-agnostic (purposeKey stored for any language)', () => {
  test('purposeKey can start with "services." prefix (i18n key)', async () => {
    const res = await request(app)
      .post('/api/tickets')
      .send({ purposeKey: 'services.consultation', departmentId: 1 });

    expect(res.status).toBe(201);
    expect(res.body.data.purposeKey).toBe('services.consultation');
  });

  test('purposeKey can be a plain string (Kyrgyz or Russian text)', async () => {
    const res = await request(app)
      .post('/api/tickets')
      .send({ purpose: 'Consultation', departmentId: 1 });

    expect(res.status).toBe(201);
  });
});

describe('TC-K07 — Kiosk public endpoints require no authentication', () => {
  test('GET /api/queue works without any token', async () => {
    const res = await request(app).get('/api/queue');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('tickets');
  });

  test('GET /api/queue/current works without any token', async () => {
    const res = await request(app).get('/api/queue/current');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  test('POST /api/tickets works without any token', async () => {
    const res = await request(app)
      .post('/api/tickets')
      .send({ purposeKey: 'services.other', departmentId: 3 });

    expect(res.status).toBe(201);
  });
});