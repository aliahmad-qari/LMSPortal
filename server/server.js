require('dotenv').config();
const express = require('express');
const http = require('http');
const mongoose = require('mongoose');
const cors = require('cors');
const socketIo = require('socket.io');
const path = require('path');
const fs = require('fs');

// Import routes
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const courseRoutes = require('./routes/courseRoutes');
const lectureRoutes = require('./routes/lectureRoutes');
const assignmentRoutes = require('./routes/assignmentRoutes');
const messageRoutes = require('./routes/messageRoutes');

// Import models
const Message = require('./models/Message');

const app = express();
const server = http.createServer(app);

const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';

const io = socketIo(server, {
  cors: {
    origin: CLIENT_URL,
    methods: ['GET', 'POST']
  }
});

// Ensure uploads directories exist
const uploadDirs = ['uploads', 'uploads/videos', 'uploads/pdfs', 'uploads/assignments', 'uploads/thumbnails'];
uploadDirs.forEach(dir => {
  const fullPath = path.join(__dirname, dir);
  if (!fs.existsSync(fullPath)) {
    fs.mkdirSync(fullPath, { recursive: true });
  }
});

// Middleware
app.use(cors({ origin: CLIENT_URL, credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/lectures', lectureRoutes);
app.use('/api/assignments', assignmentRoutes);
app.use('/api/messages', messageRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Track active video rooms
const videoRooms = {};

// Socket.io Logic
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  // Chat: Join room
  socket.on('join-room', (roomId) => {
    socket.join(roomId);
    console.log(`Socket ${socket.id} joined room: ${roomId}`);
  });

  // Chat: Leave room
  socket.on('leave-room', (roomId) => {
    socket.leave(roomId);
    console.log(`Socket ${socket.id} left room: ${roomId}`);
  });

  // Chat: Send message — persist to MongoDB
  socket.on('send-message', async (data) => {
    try {
      const { senderId, senderName, text, roomId } = data;
      const message = await Message.create({
        sender: senderId,
        senderName,
        text,
        roomId,
        timestamp: new Date()
      });
      io.to(roomId).emit('receive-message', {
        _id: message._id,
        sender: message.sender,
        senderName: message.senderName,
        text: message.text,
        roomId: message.roomId,
        timestamp: message.timestamp
      });
    } catch (err) {
      console.error('Error saving message:', err.message);
      socket.emit('error', { message: 'Failed to send message' });
    }
  });

  // WebRTC: Join video room
  socket.on('join-video-room', (data) => {
    const { roomId, userId, userName } = data;
    socket.join(`video-${roomId}`);

    if (!videoRooms[roomId]) {
      videoRooms[roomId] = [];
    }
    videoRooms[roomId].push({ socketId: socket.id, userId, userName });

    // Tell existing participants about the new user
    socket.to(`video-${roomId}`).emit('user-joined', {
      socketId: socket.id,
      userId,
      userName
    });

    // Tell the new user about existing participants
    const existingParticipants = videoRooms[roomId].filter(p => p.socketId !== socket.id);
    socket.emit('existing-participants', existingParticipants);

    console.log(`User ${userName} joined video room ${roomId}. Total: ${videoRooms[roomId].length}`);
  });

  // WebRTC: Leave video room
  socket.on('leave-video-room', (data) => {
    const { roomId } = data;
    if (videoRooms[roomId]) {
      videoRooms[roomId] = videoRooms[roomId].filter(p => p.socketId !== socket.id);
      if (videoRooms[roomId].length === 0) {
        delete videoRooms[roomId];
      }
    }
    socket.to(`video-${roomId}`).emit('user-left', { socketId: socket.id });
    socket.leave(`video-${roomId}`);
  });

  // WebRTC Signaling: Offer
  socket.on('offer', (data) => {
    socket.to(data.target).emit('offer', {
      sdp: data.sdp,
      caller: socket.id,
      callerUserId: data.callerUserId,
      callerUserName: data.callerUserName
    });
  });

  // WebRTC Signaling: Answer
  socket.on('answer', (data) => {
    socket.to(data.target).emit('answer', {
      sdp: data.sdp,
      answerer: socket.id
    });
  });

  // WebRTC Signaling: ICE Candidate
  socket.on('ice-candidate', (data) => {
    socket.to(data.target).emit('ice-candidate', {
      candidate: data.candidate,
      from: socket.id
    });
  });

  // Handle disconnect
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
    // Remove from all video rooms
    for (const roomId in videoRooms) {
      const idx = videoRooms[roomId].findIndex(p => p.socketId === socket.id);
      if (idx !== -1) {
        videoRooms[roomId].splice(idx, 1);
        io.to(`video-${roomId}`).emit('user-left', { socketId: socket.id });
        if (videoRooms[roomId].length === 0) {
          delete videoRooms[roomId];
        }
      }
    }
  });
});

// Connect to MongoDB and start server
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/lms';

mongoose.connect(MONGO_URI)
  .then(() => {
    console.log('MongoDB Connected');
    server.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`CORS origin: ${CLIENT_URL}`);
    });
  })
  .catch(err => {
    console.error('Database connection error:', err.message);
    process.exit(1);
  });
