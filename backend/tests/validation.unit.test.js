const {
  validate,
  validateQuery,
  analyticsPeriodQuerySchema,
  analyticsExportQuerySchema,
  updateUserSchema,
  registerSchema
} = require('../src/middlewares/validation');

describe('validation middleware unit tests', () => {
  test('validateQuery accepts valid analytics period and strips unknown fields', () => {
    const middleware = validateQuery(analyticsPeriodQuerySchema);
    const req = { query: { startDate: '2026-01-01', endDate: '2026-01-31', noise: 'x' } };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    const next = jest.fn();

    middleware(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(req.query).toEqual({ startDate: '2026-01-01', endDate: '2026-01-31' });
    expect(res.status).not.toHaveBeenCalled();
  });

  test('validateQuery rejects invalid analytics period query', () => {
    const middleware = validateQuery(analyticsPeriodQuerySchema);
    const req = { query: { startDate: 'bad-date' } };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    const next = jest.fn();

    middleware(req, res, next);

    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: false, message: 'Validation error' }));
  });

  test('analyticsExportQuerySchema enforces startDate/endDate pair', () => {
    const { error } = analyticsExportQuerySchema.validate({ startDate: '2026-01-01' });
    expect(error).toBeTruthy();
  });

  test('updateUserSchema rejects empty update payload', () => {
    const { error } = updateUserSchema.validate({});
    expect(error).toBeTruthy();
  });

  test('register schema allows invite flow without explicit password', () => {
    const { error } = registerSchema.validate({
      username: 'staff@alatoo.edu.kg',
      fullName: 'Staff Name',
      role: 'staff'
    });

    expect(error).toBeUndefined();
  });

  test('validate() strips unknown body fields', () => {
    const middleware = validate(updateUserSchema);
    const req = { body: { fullName: 'Updated User', unknown: 'bad' } };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    const next = jest.fn();

    middleware(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(req.body).toEqual({ fullName: 'Updated User' });
  });
});
