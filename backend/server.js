require('dotenv').config();

process.env.TZ = 'Asia/Bishkek';

const app = require('./src/app');
const { sequelize } = require('./src/config/database');
const { redisClient } = require('./src/config/redis');
const logger = require('./src/utils/logger');
const { initializeWebSocket } = require('./src/services/websocketService');

const PORT = process.env.PORT || 3001;

const server = app.listen(PORT, async () => {
  try {
    await sequelize.authenticate();
    logger.info(' PostgreSQL connected successfully');

    
    try {
      await redisClient.connect();
      logger.info(' Redis connected successfully');
    } catch (redisError) {
      logger.warn(' Redis not available, continuing without cache:', redisError.message);
    }

    initializeWebSocket(server);
    logger.info(' WebSocket initialized');

    logger.info(` Server running on port ${PORT}`);
    logger.info(` Environment: ${process.env.NODE_ENV}`);
    logger.info(` Timezone: ${process.env.TZ}`);

  } catch (error) {
    logger.error(' Server initialization failed:', error);
    process.exit(1);
  }
});

process.on('SIGTERM', async () => {
  server.close(async () => {
    await sequelize.close();
    try { await redisClient.quit(); } catch(e) {}
    process.exit(0);
  });
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection:', reason);
});

module.exports = server;