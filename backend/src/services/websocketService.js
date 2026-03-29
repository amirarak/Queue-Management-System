const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const config = require('../config');
const logger = require('../utils/logger');

let io;


exports.initializeWebSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: config.frontendUrl,
      methods: ['GET', 'POST'],
      credentials: true
    },
    path: '/socket.io'
  });
  
  
  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    
    if (token) {
      try {
        const decoded = jwt.verify(token, config.jwt.secret);
        socket.userId = decoded.id;
        socket.userRole = decoded.role;
        socket.departmentId = decoded.departmentId;
      } catch (error) {
 
      }
    }
    
    next();
  });
  

  io.on('connection', (socket) => {
    logger.info(`WebSocket client connected: ${socket.id}`);
    
    
    socket.on('join-department', (departmentId) => {
      socket.join(`department:${departmentId}`);
      logger.debug(`Socket ${socket.id} joined department:${departmentId}`);
    });
    
    
    socket.on('leave-department', (departmentId) => {
      socket.leave(`department:${departmentId}`);
      logger.debug(`Socket ${socket.id} left department:${departmentId}`);
    });
    
    
    socket.on('join-all', () => {
      socket.join('all-departments');
      logger.debug(`Socket ${socket.id} joined all-departments`);
    });
    
   
    socket.on('disconnect', (reason) => {
      logger.info(`WebSocket client disconnected: ${socket.id} (${reason})`);
    });
    
    
    socket.on('ping', () => {
      socket.emit('pong');
    });
  });
  
  logger.info(' WebSocket server initialized');
  
  return io;
};


exports.broadcastEvent = (event, data) => {
  if (!io) {
    logger.warn('WebSocket not initialized, cannot broadcast event');
    return;
  }
  
  const { departmentId } = data;
  
  if (departmentId) {
  
    io.to(`department:${departmentId}`).emit(event, data);
    logger.debug(`Event ${event} broadcasted to department:${departmentId}`);
  }
  
 
  io.to('all-departments').emit(event, data);
  
  logger.debug(`Event ${event} broadcasted to all-departments`);
};


exports.emitToUser = (userId, event, data) => {
  if (!io) {
    logger.warn('WebSocket not initialized, cannot emit to user');
    return;
  }
  

  const sockets = Array.from(io.sockets.sockets.values());
  const userSockets = sockets.filter(s => s.userId === userId);
  
  userSockets.forEach(socket => {
    socket.emit(event, data);
  });
  
  logger.debug(`Event ${event} sent to user ${userId}`);
};


exports.getConnectedClients = () => {
  if (!io) return 0;
  return io.engine.clientsCount;
};


exports.getRoomSize = async (room) => {
  if (!io) return 0;
  const sockets = await io.in(room).fetchSockets();
  return sockets.length;
};