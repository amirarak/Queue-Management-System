const errorHandler = require('../src/middlewares/errorHandler');

function mockRes() {
  return {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis()
  };
}

describe('errorHandler middleware unit tests', () => {
  const req = { url: '/x', method: 'GET', ip: '127.0.0.1', user: null };

  test('handles SequelizeValidationError', () => {
    const err = {
      name: 'SequelizeValidationError',
      message: 'Validation failed',
      errors: [{ path: 'username', message: 'required' }]
    };
    const res = mockRes();

    errorHandler(err, req, res, jest.fn());

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: 'Validation error' }));
  });

  test('handles SequelizeUniqueConstraintError', () => {
    const err = {
      name: 'SequelizeUniqueConstraintError',
      message: 'Duplicate',
      errors: [{ path: 'username', message: 'duplicate' }]
    };
    const res = mockRes();

    errorHandler(err, req, res, jest.fn());

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: 'Duplicate entry' }));
  });

  test('handles JWT-specific errors', () => {
    const jwtErrRes = mockRes();
    errorHandler({ name: 'JsonWebTokenError', message: 'bad' }, req, jwtErrRes, jest.fn());
    expect(jwtErrRes.status).toHaveBeenCalledWith(401);

    const expiredErrRes = mockRes();
    errorHandler({ name: 'TokenExpiredError', message: 'expired' }, req, expiredErrRes, jest.fn());
    expect(expiredErrRes.status).toHaveBeenCalledWith(401);
  });

  test('falls back to 500 for unknown error', () => {
    const res = mockRes();
    errorHandler({ message: 'Unexpected boom' }, req, res, jest.fn());

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: false, message: 'Unexpected boom' }));
  });
});
