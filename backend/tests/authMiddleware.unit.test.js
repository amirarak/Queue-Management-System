const jwt = require('jsonwebtoken');

describe('auth middleware unit tests', () => {
  beforeEach(() => {
    process.env.JWT_SECRET = 'unit-test-secret';
    process.env.NODE_ENV = 'test';
    jest.resetModules();
  });

  function mockRes() {
    return {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis()
    };
  }

  test('authenticate rejects missing token', () => {
    const { authenticate } = require('../src/middlewares/auth');
    const req = { headers: {} };
    const res = mockRes();
    const next = jest.fn();

    authenticate(req, res, next);

    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: false }));
  });

  test('authenticate accepts valid token and sets req.user', () => {
    const { authenticate } = require('../src/middlewares/auth');
    const token = jwt.sign({ id: 7, role: 'admin' }, process.env.JWT_SECRET, { expiresIn: '1h' });
    const req = { headers: { authorization: `Bearer ${token}` } };
    const res = mockRes();
    const next = jest.fn();

    authenticate(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(req.user).toEqual(expect.objectContaining({ id: 7, role: 'admin' }));
  });

  test('optionalAuth ignores invalid token and continues', () => {
    const { optionalAuth } = require('../src/middlewares/auth');
    const req = { headers: { authorization: 'Bearer broken.token.value' } };
    const res = mockRes();
    const next = jest.fn();

    optionalAuth(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(req.user).toBeUndefined();
    expect(res.status).not.toHaveBeenCalled();
  });

  test('authorize rejects missing user and wrong role', () => {
    const { authorize } = require('../src/middlewares/auth');

    const noUserReq = {};
    const noUserRes = mockRes();
    const nextNoUser = jest.fn();
    authorize('admin')(noUserReq, noUserRes, nextNoUser);
    expect(nextNoUser).not.toHaveBeenCalled();
    expect(noUserRes.status).toHaveBeenCalledWith(401);

    const wrongRoleReq = { user: { role: 'staff' } };
    const wrongRoleRes = mockRes();
    const nextWrongRole = jest.fn();
    authorize('admin')(wrongRoleReq, wrongRoleRes, nextWrongRole);
    expect(nextWrongRole).not.toHaveBeenCalled();
    expect(wrongRoleRes.status).toHaveBeenCalledWith(403);
  });
});
