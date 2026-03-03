module.exports = {
  env: process.env.NODE_ENV || 'development',
  port: process.env.PORT || 3001,
  apiPrefix: process.env.API_PREFIX || '/api',
  
  jwt: {
    secret: process.env.JWT_SECRET || 'change-this-secret',
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
  
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3000'
};