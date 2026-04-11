const { Resend } = require('resend');
const config = require('../config');
const logger = require('../utils/logger');

let resendClient;

function getResendClient() {
  if (resendClient) return resendClient;

  if (!config.email.apiKey) {
    throw new Error('RESEND_API_KEY is not set');
  }

  resendClient = new Resend(config.email.apiKey);
  logger.info('Resend email service ready');
  return resendClient;
}

async function sendEmail({ to, subject, html }) {
  const resend = getResendClient();
  const response = await resend.emails.send({
    from: config.email.from || 'no-reply@queue-management-system.me',
    to,
    subject,
    html
  });

  if (response.error) {
    throw new Error(`Resend error: ${response.error.message}`);
  }

  return response;
}


exports.sendInviteEmail = async (email, fullName, temporaryPassword) => {

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
         .pass-box { background: #111827; color: #fff; padding: 14px 16px; border-radius: 10px;
                font-size: 26px; text-align: center; letter-spacing: 3px; margin: 16px 0; }
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
          <p>Ваш временный пароль для входа:</p>
          <div class="pass-box">${temporaryPassword}</div>
          <p>Войдите в систему с этим паролем и затем измените его в личном кабинете.</p>
          <p class="note">⚠️ Если вы не ожидали этого письма — проигнорируйте его.</p>
        </div>
        <div class="footer">
          <p>© ${new Date().getFullYear()} Ala-Too International University. Все права защищены.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  const info = await sendEmail({
    to: email,
    subject: 'Добро пожаловать! Ваш временный пароль',
    html
  });

  logger.info(`Invite email sent to ${email}: ${info.data?.id || 'ok'}`);
  return info;
};


exports.sendVerificationEmail = async (email, code) => {
  const html = `
    <div style="font-family:Arial,sans-serif;max-width:500px;margin:0 auto">
      <h2 style="color:#1a2332">Сброс пароля</h2>
      <p>Введите этот код подтверждения на странице восстановления пароля:</p>
      <p style="font-size:28px;font-weight:700;letter-spacing:4px;color:#dc2626">${code}</p>
      <p style="color:#999;font-size:13px">Код действителен до следующего запроса. Если вы не запрашивали код, просто проигнорируйте это письмо.</p>
    </div>
  `;

  const info = await sendEmail({
    to: email,
    subject: 'Код подтверждения для сброса пароля',
    html
  });

  logger.info(`Verification email sent to ${email}: ${info.data?.id || 'ok'}`);
  return info;
};


exports.sendPasswordResetEmail = async (email, fullName, token) => {
  return exports.sendVerificationEmail(email, token);
};