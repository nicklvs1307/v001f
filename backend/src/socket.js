const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const config = require('./config');

module.exports = (server) => {
  const io = new Server(server, {
    cors: {
      origin: process.env.FRONTEND_URL || 'http://localhost:3000',
      methods: ['GET', 'POST']
    }
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
    console.log('a user connected', socket.user.id);

    // Join a room based on the tenant ID
    if (socket.user.tenantId) {
      socket.join(socket.user.tenantId);
    }

    socket.on('disconnect', () => {
      console.log('user disconnected');
    });
  });

  return io;
};
