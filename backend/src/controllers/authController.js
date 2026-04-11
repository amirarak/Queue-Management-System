const jwt = require('jsonwebtoken');
const { User } = require('../models');
const config = require('../config');
const logger = require('../utils/logger');
const emailService = require('../services/emailService');

function generateToken(length = 32) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) result += chars.charAt(Math.floor(Math.random() * chars.length));
  return result;
}

function generateTemporaryPassword(length = 10) {
  const upper = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
  const lower = 'abcdefghijkmnopqrstuvwxyz';
  const digits = '23456789';
  const all = upper + lower + digits;

  let password =
    upper.charAt(Math.floor(Math.random() * upper.length)) +
    lower.charAt(Math.floor(Math.random() * lower.length)) +
    digits.charAt(Math.floor(Math.random() * digits.length));

  for (let i = password.length; i < length; i++) {
    password += all.charAt(Math.floor(Math.random() * all.length));
  }

  return password
    .split('')
    .sort(() => Math.random() - 0.5)
    .join('');
}

function generateVerificationCode() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

exports.register = async (req, res, next) => {
  try {
    const { username, password, fullName, role, departmentId, windowNumber } = req.body;

    const existing = await User.findOne({ where: { username } });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Пользователь с таким email уже существует' });
    }

    const initialPassword = password || generateTemporaryPassword(10);

    const user = await User.create({
      username,
      password: initialPassword,
      fullName,
      role: role || 'staff',
      departmentId: departmentId || null,
      windowNumber: windowNumber || null,
      isVerified: true,
      isActive: true,
      verificationToken: null
    });

    let inviteEmailSent = true;
    try {
      await emailService.sendInviteEmail(username, fullName, initialPassword);
      logger.info(`Invite email sent to ${username}`);
    } catch (emailErr) {
      inviteEmailSent = false;
      logger.error('Failed to send invite email:', emailErr);
    }

    logger.info(`New user created: ${username}`);

    res.status(201).json({
      success: true,
      message: inviteEmailSent
        ? `Сотрудник создан. Временный пароль отправлен на ${username}`
        : `Сотрудник создан, но отправка письма не удалась. Проверьте настройки email.`,
      data: {
        id: user.id,
        username: user.username,
        fullName: user.fullName,
        role: user.role,
        departmentId: user.departmentId,
        windowNumber: user.windowNumber,
        inviteEmailSent
      }
    });
  } catch (error) { next(error); }
};

exports.setPassword = async (req, res, next) => {
  try {
    const { token, password } = req.body;
    const user = await User.findOne({ where: { verificationToken: token } });
    if (!user) {
      return res.status(400).json({ success: false, message: 'Ссылка недействительна или уже использована' });
    }
    await user.update({ password, isVerified: true, verificationToken: null });
    logger.info(`Password set for: ${user.username}`);
    res.json({ success: true, message: 'Пароль успешно установлен. Теперь вы можете войти.' });
  } catch (error) { next(error); }
};

exports.login = async (req, res, next) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ where: { username } });
    if (!user) return res.status(401).json({ success: false, message: 'Неверный email или пароль' });

    const valid = await user.comparePassword(password);
    if (!valid) return res.status(401).json({ success: false, message: 'Неверный email или пароль' });

    if (!user.isActive) return res.status(403).json({ success: false, message: 'Аккаунт деактивирован.' });
    if (!user.isVerified) return res.status(403).json({ success: false, message: 'Сначала установите пароль по ссылке из письма.' });

    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role, departmentId: user.departmentId },
      config.jwt.secret,
      { expiresIn: config.jwt.expire }
    );

    await user.update({ lastLogin: new Date() });
    logger.info(`User logged in: ${username}`);

    res.json({
      success: true,
      data: {
        token,
        user: { id: user.id, username: user.username, fullName: user.fullName, role: user.role, departmentId: user.departmentId }
      }
    });
  } catch (error) { next(error); }
};

exports.me = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.user.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.json({ success: true, data: user });
  } catch (error) { next(error); }
};

exports.verifyEmail = async (req, res) => {
  const { token } = req.params;
  const frontendUrl = config.frontendUrl || 'http://localhost:5173';
  res.redirect(`${frontendUrl}/set-password?token=${token}`);
};

exports.logout = async (req, res) => {
  logger.info(`User logged out: ${req.user?.username}`);
  res.json({ success: true, message: 'Logout successful' });
};

exports.changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findByPk(req.user.id);
    const valid = await user.comparePassword(currentPassword);
    if (!valid) return res.status(400).json({ success: false, message: 'Текущий пароль неверен' });
    await user.update({ password: newPassword });
    res.json({ success: true, message: 'Пароль изменён' });
  } catch (error) { next(error); }
};

exports.forgotPassword = async (req, res, next) => {
  try {
    const { username } = req.body;

    const user = await User.findOne({ where: { username } });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Аккаунт с таким email не найден'
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Аккаунт деактивирован. Обратитесь к администратору'
      });
    }

    const verificationCode = generateVerificationCode();
    await user.update({ verificationToken: `reset:${verificationCode}` });
    await emailService.sendVerificationEmail(user.username, verificationCode);
    logger.info(`Password reset code sent to: ${username}`);

    res.json({
      success: true,
      message: `Код подтверждения отправлен на ${username}`
    });
  } catch (error) { next(error); }
};

exports.resetPasswordWithCode = async (req, res, next) => {
  try {
    const { username, code, password } = req.body;

    const user = await User.findOne({ where: { username } });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Аккаунт с таким email не найден'
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Аккаунт деактивирован. Обратитесь к администратору'
      });
    }

    if (user.verificationToken !== `reset:${code}`) {
      return res.status(400).json({
        success: false,
        message: 'Неверный код подтверждения'
      });
    }

    await user.update({
      password,
      verificationToken: null,
      isVerified: true
    });

    logger.info(`Password reset completed for: ${username}`);
    res.json({ success: true, message: 'Пароль успешно изменён' });
  } catch (error) {
    next(error);
  }
};