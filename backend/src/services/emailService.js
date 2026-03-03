const nodemailer = require('nodemailer');
const config = require('../config');
const logger = require('../utils/logger');

const transporter = nodemailer.createTransport({
  host: config.email.host,
  port: config.email.port,
  secure: false,
  auth: {
    user: config.email.user,
    pass: config.email.password
  }
});

transporter.verify((error) => {
  if (error) logger.error('Email service error:', error);
  else logger.info('Email service ready');
});


exports.sendInviteEmail = async (email, fullName, token) => {
  const frontendUrl = config.frontendUrl || 'http://localhost:5173';
  const setPasswordUrl = `${frontendUrl}/set-password?token=${token}`;

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: 'Segoe UI', Arial, sans-serif; background: #f5f5f5; margin: 0; padding: 20px; }
        .wrap { max-width: 560px; margin: 0 auto; }
        .header { background: #1a2332; color: white; padding: 32px; border-radius: 12px 12px 0 0; text-align: center; }
        .header h1 { margin: 0 0 6px; font-size: 22px; }
        .header p { margin: 0; opacity: 0.7; font-size: 14px; }
        .body { background: white; padding: 36px; border-radius: 0 0 12px 12px; }
        .body p { color: #444; line-height: 1.7; margin: 0 0 16px; }
        .btn-wrap { text-align: center; margin: 28px 0; }
        .btn { display: inline-block; padding: 14px 36px; background: #dc2626; color: white;
               text-decoration: none; border-radius: 8px; font-size: 16px; font-weight: 600; }
        .link-box { background: #f5f5f5; padding: 12px 16px; border-radius: 8px; word-break: break-all;
                    font-size: 13px; color: #666; margin: 12px 0; }
        .note { font-size: 13px; color: #999; margin-top: 24px; }
        .footer { text-align: center; color: #999; font-size: 12px; margin-top: 20px; }
      </style>
    </head>
    <body>
      <div class="wrap">
        <div class="header">
          <h1>Ala-Too International University</h1>
          <p>Система управления очередью</p>
        </div>
        <div class="body">
          <p>Здравствуйте, <strong>${fullName}</strong>!</p>
          <p>Администратор создал для вас аккаунт в системе электронной очереди учебной части.</p>
          <p>Чтобы завершить регистрацию и установить пароль, нажмите кнопку ниже:</p>
          <div class="btn-wrap">
            <a href="${setPasswordUrl}" class="btn">Установить пароль</a>
          </div>
          <p>Или скопируйте ссылку в браузер:</p>
          <div class="link-box">${setPasswordUrl}</div>
          <p class="note">⚠️ Ссылка действительна 48 часов. Если вы не ожидали этого письма — проигнорируйте его.</p>
        </div>
        <div class="footer">
          <p>© ${new Date().getFullYear()} Ala-Too International University. Все права защищены.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  const info = await transporter.sendMail({
    from: config.email.from || `"Учебная часть" <${config.email.user}>`,
    to: email,
    subject: 'Добро пожаловать! Установите пароль для входа в систему',
    html
  });

  logger.info(`Invite email sent to ${email}: ${info.messageId}`);
  return info;
};


exports.sendVerificationEmail = exports.sendInviteEmail;


exports.sendPasswordResetEmail = async (email, fullName, token) => {
  const frontendUrl = config.frontendUrl || 'http://localhost:5173';
  const resetUrl = `${frontendUrl}/set-password?token=${token}`;

  await transporter.sendMail({
    from: config.email.from || `"Учебная часть" <${config.email.user}>`,
    to: email,
    subject: 'Сброс пароля — Система очереди',
    html: `
      <div style="font-family:Arial,sans-serif;max-width:500px;margin:0 auto">
        <h2 style="color:#1a2332">Сброс пароля</h2>
        <p>Здравствуйте, <strong>${fullName}</strong>!</p>
        <p>Для сброса пароля перейдите по ссылке:</p>
        <p><a href="${resetUrl}" style="color:#dc2626">${resetUrl}</a></p>
        <p style="color:#999;font-size:13px">Ссылка действительна 1 час.</p>
      </div>
    `
  });
};