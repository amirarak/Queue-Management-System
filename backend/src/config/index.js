const env = process.env.NODE_ENV || 'development';
const jwtSecret = process.env.JWT_SECRET || (env === 'test' ? 'test-jwt-secret' : null);
const frontendUrls = (process.env.FRONTEND_URL || 'http://localhost:5173')
  .split(',')
  .map((url) => url.trim())
  .filter(Boolean);

if (!jwtSecret) {
  throw new Error('JWT_SECRET must be set in environment variables');
}

module.exports = {
  env,
  port: process.env.PORT || 3001,
  apiPrefix: process.env.API_PREFIX || '/api',
  
  jwt: {
    secret: jwtSecret,
    expire: process.env.JWT_EXPIRE || '1h',
    refreshExpire: process.env.JWT_REFRESH_EXPIRE || '7d'
  },
  
  email: {
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT) || 587,
    user: process.env.SMTP_USER,
    password: process.env.SMTP_PASSWORD,
    from: process.env.SMTP_FROM || 'noreply@alatoo.edu.kg'
  },
  
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 60000,
    maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100
  },
  
  frontendUrl: frontendUrls[0],
  frontendUrls
};