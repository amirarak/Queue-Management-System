jest.mock('../src/models', () => ({
  User: {
    findOne: jest.fn(),
    findByPk: jest.fn(),
    create: jest.fn()
  }
}));

jest.mock('jsonwebtoken', () => ({
  sign: jest.fn(() => 'jwt-token')
}));

jest.mock('../src/config', () => ({
  jwt: { secret: 'test-secret', expire: '7d' },
  frontendUrl: 'http://localhost:5173'
}));

jest.mock('../src/services/emailService', () => ({
  sendInviteEmail: jest.fn(),
  sendPasswordResetEmail: jest.fn()
}));

jest.mock('../src/utils/logger', () => ({
  info: jest.fn(),
  error: jest.fn()
}));

const { User } = require('../src/models');
const emailService = require('../src/services/emailService');
const authController = require('../src/controllers/authController');

function createRes() {
  return {
    status: jest.fn().mockReturnThis(),
    json: jest.fn(),
    redirect: jest.fn()
  };
}

describe('auth controller unit tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('register rejects duplicate user', async () => {
    User.findOne.mockResolvedValue({ id: 1 });

    const req = { body: { username: 'staff@alatoo.edu.kg' } };
    const res = createRes();
    const next = jest.fn();

    await authController.register(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: false }));
    expect(User.create).not.toHaveBeenCalled();
  });

  test('register creates user even when invite email fails', async () => {
    User.findOne.mockResolvedValue(null);
    User.create.mockResolvedValue({
      id: 9,
      username: 'staff@alatoo.edu.kg',
      fullName: 'Staff User',
      role: 'staff',
      departmentId: 2,
      windowNumber: 4
    });
    emailService.sendInviteEmail.mockRejectedValue(new Error('smtp down'));

    const req = {
      body: {
        username: 'staff@alatoo.edu.kg',
        fullName: 'Staff User',
        role: 'staff',
        departmentId: 2,
        windowNumber: 4
      }
    };
    const res = createRes();
    const next = jest.fn();

    await authController.register(req, res, next);

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: true,
        data: expect.objectContaining({ inviteEmailSent: false, windowNumber: 4 })
      })
    );
    expect(next).not.toHaveBeenCalled();
  });

  test('setPassword returns 400 when token not found', async () => {
    User.findOne.mockResolvedValue(null);

    const req = { body: { token: 'bad-token', password: 'StrongPass123!' } };
    const res = createRes();
    const next = jest.fn();

    await authController.setPassword(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: false }));
  });

  test('setPassword updates user when token is valid', async () => {
    const update = jest.fn().mockResolvedValue(undefined);
    User.findOne.mockResolvedValue({ username: 'staff@alatoo.edu.kg', update });

    const req = { body: { token: 'ok-token', password: 'StrongPass123!' } };
    const res = createRes();
    const next = jest.fn();

    await authController.setPassword(req, res, next);

    expect(update).toHaveBeenCalledWith({
      password: 'StrongPass123!',
      isVerified: true,
      verificationToken: null
    });
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true }));
    expect(next).not.toHaveBeenCalled();
  });

  test('login rejects invalid credentials', async () => {
    User.findOne.mockResolvedValue(null);

    const req = { body: { username: 'none@alatoo.edu.kg', password: 'bad' } };
    const res = createRes();
    const next = jest.fn();

    await authController.login(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: false }));
    expect(next).not.toHaveBeenCalled();
  });

  test('login rejects inactive and unverified users', async () => {
    const comparePassword = jest.fn().mockResolvedValue(true);

    User.findOne.mockResolvedValueOnce({
      comparePassword,
      isActive: false,
      isVerified: true
    });

    const inactiveReq = { body: { username: 'staff@alatoo.edu.kg', password: 'pass' } };
    const inactiveRes = createRes();
    await authController.login(inactiveReq, inactiveRes, jest.fn());

    expect(inactiveRes.status).toHaveBeenCalledWith(403);

    User.findOne.mockResolvedValueOnce({
      comparePassword,
      isActive: true,
      isVerified: false
    });

    const unverifiedReq = { body: { username: 'staff@alatoo.edu.kg', password: 'pass' } };
    const unverifiedRes = createRes();
    await authController.login(unverifiedReq, unverifiedRes, jest.fn());

    expect(unverifiedRes.status).toHaveBeenCalledWith(403);
  });

  test('login returns token and user payload on success', async () => {
    const update = jest.fn().mockResolvedValue(undefined);
    const comparePassword = jest.fn().mockResolvedValue(true);

    User.findOne.mockResolvedValue({
      id: 4,
      username: 'admin@alatoo.edu.kg',
      fullName: 'Admin User',
      role: 'admin',
      departmentId: null,
      isActive: true,
      isVerified: true,
      comparePassword,
      update
    });

    const req = { body: { username: 'admin@alatoo.edu.kg', password: 'StrongPass123!' } };
    const res = createRes();
    const next = jest.fn();

    await authController.login(req, res, next);

    expect(update).toHaveBeenCalledWith({ lastLogin: expect.any(Date) });
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: true,
        data: expect.objectContaining({
          token: expect.any(String),
          user: expect.objectContaining({ username: 'admin@alatoo.edu.kg' })
        })
      })
    );
  });

  test('me returns 404 when user does not exist', async () => {
    User.findByPk.mockResolvedValue(null);

    const req = { user: { id: 999 } };
    const res = createRes();
    const next = jest.fn();

    await authController.me(req, res, next);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: false }));
  });

  test('verifyEmail redirects to set-password route', async () => {
    const req = { params: { token: 'invite-token' } };
    const res = createRes();

    await authController.verifyEmail(req, res);

    expect(res.redirect).toHaveBeenCalledWith('http://localhost:5173/set-password?token=invite-token');
  });

  test('logout always returns success', async () => {
    const req = { user: { username: 'staff@alatoo.edu.kg' } };
    const res = createRes();

    await authController.logout(req, res);

    expect(res.json).toHaveBeenCalledWith({ success: true, message: 'Logout successful' });
  });

  test('changePassword validates current password', async () => {
    const user = {
      comparePassword: jest.fn().mockResolvedValue(false),
      update: jest.fn()
    };
    User.findByPk.mockResolvedValue(user);

    const req = {
      user: { id: 1 },
      body: { currentPassword: 'old', newPassword: 'newStrong123!' }
    };
    const res = createRes();
    const next = jest.fn();

    await authController.changePassword(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(user.update).not.toHaveBeenCalled();
    expect(next).not.toHaveBeenCalled();
  });

  test('forgotPassword always returns 200 and triggers email for active user', async () => {
    const user = {
      username: 'staff@alatoo.edu.kg',
      fullName: 'Staff User',
      isActive: true,
      update: jest.fn().mockResolvedValue(undefined)
    };
    User.findOne.mockResolvedValue(user);
    emailService.sendPasswordResetEmail.mockResolvedValue(undefined);

    const req = { body: { username: 'staff@alatoo.edu.kg' } };
    const res = createRes();
    const next = jest.fn();

    await authController.forgotPassword(req, res, next);

    expect(user.update).toHaveBeenCalledWith({ verificationToken: expect.any(String) });
    expect(emailService.sendPasswordResetEmail).toHaveBeenCalled();
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true }));
    expect(next).not.toHaveBeenCalled();
  });
});
