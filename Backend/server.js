const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('join-canvas', (canvasId) => {
    socket.join(canvasId);
    console.log(`User ${socket.id} joined canvas ${canvasId}`);
  });

  socket.on('canvas-update', ({ canvasId, elements }) => {
    socket.to(canvasId).emit('canvas-updated', elements);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

server.listen(3030, () => {
  console.log('Server running on port 3030');
});
