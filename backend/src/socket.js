const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const config = require('./config');

let io;

const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: process.env.FRONTEND_URL || 'http://localhost:3000',
      methods: ['GET', 'POST'],
    },
  });

  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) {
      return next(new Error('Authentication error'));
    }
    try {
      const decoded = jwt.verify(token, config.jwtSecret);
      socket.user = decoded;
      next();
    } catch (err) {
      return next(new Error('Authentication error'));
    }
  });

  io.on('connection', (socket) => {
    console.log('A user connected:', socket.user.id);

    if (socket.user.tenantId) {
      socket.join(socket.user.tenantId);
      console.log(`User ${socket.user.id} joined tenant room ${socket.user.tenantId}`);
    }
    
    // Super Admins can join a special room to receive all system-wide updates
    if (socket.user.role === 'Super Admin') {
      socket.join('super-admin');
      console.log(`User ${socket.user.id} joined super-admin room`);
    }

    socket.on('disconnect', () => {
      console.log('User disconnected:', socket.user.id);
    });
  });

  return io;
};

const getSocketIO = () => {
  if (!io) {
    throw new Error('Socket.IO not initialized!');
  }
  return io;
};

module.exports = { initSocket, getSocketIO };
