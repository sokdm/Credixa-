const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { createServer } = require('http');
const { Server } = require('socket.io');
const path = require('path');
const fs = require('fs');
const jwt = require('jsonwebtoken');
const User = require('./models/User');
const { startWebhookWorker } = require('./services/webhookDelivery');
require('dotenv').config({ path: path.join(__dirname, '.env') });

mongoose.set('bufferCommands', false);

const JWT_SECRET = process.env.JWT_SECRET || (process.env.NODE_ENV !== 'production' ? 'credixa-local-development-only-secret' : null);

const app = express();
const httpServer = createServer(app);

const ALLOWED_ORIGINS = [
  process.env.CLIENT_URL,
  'https://credixa-web.onrender.com',
  'https://dixa-web.onrender.com',
  'https://credixa-api.onrender.com',
  'http://localhost:3000',
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:5175',
  'http://localhost:5000'
].filter(Boolean);

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    if (ALLOWED_ORIGINS.indexOf(origin) !== -1 || ALLOWED_ORIGINS.some(o => origin.includes('onrender.com'))) {
      callback(null, true);
    } else {
      console.log('[CORS] Blocked origin:', origin);
      callback(new Error('Origin not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'X-API-Key', 'X-Request-Timestamp', 'X-Signature', 'Idempotency-Key']
};

const io = new Server(httpServer, {
  cors: corsOptions,
  transports: ['polling', 'websocket'],
  pingTimeout: 60000,
  pingInterval: 25000,
  allowEIO3: true
});

io.use(async (socket, next) => {
  try {
    const token = socket.handshake.auth?.token;
    if (!token || !JWT_SECRET) return next(new Error('Socket authentication required'));
    const decoded = jwt.verify(token, JWT_SECRET);
    const userId = decoded.id || decoded._id || decoded.userId;
    const user = await User.findById(userId).select('_id isAdmin');
    if (!user) return next(new Error('Socket user not found'));
    socket.user = user;
    next();
  } catch (error) {
    next(new Error('Socket authentication failed'));
  }
});

app.set('trust proxy', 1);
app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));
app.use(cors(corsOptions));
app.use(express.json({ limit: '10mb', verify: (req, res, buf) => { req.rawBody = buf; } }));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  validate: { trustProxy: false }
});
app.use('/api/', limiter);

let databaseReady = false;
mongoose.connection.on('connected', () => {
  databaseReady = true;
  console.log('MongoDB Connected');
  startWebhookWorker();
});
mongoose.connection.on('disconnected', () => {
  databaseReady = false;
  console.error('MongoDB disconnected');
});

if (process.env.MONGODB_URI) {
  mongoose.connect(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 10000 })
    .catch(err => console.error('MongoDB Error:', err.message));
} else {
  console.error('MongoDB is not configured. Set MONGODB_URI before using database features.');
}

app.get('/', (req, res) => res.json({ status: 'ok', service: 'credixa-api' }));
app.get('/health', (req, res) => res.status(databaseReady ? 200 : 503).json({ status: databaseReady ? 'healthy' : 'degraded', database: databaseReady ? 'connected' : 'disconnected' }));

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/api', (req, res, next) => {
  if (!databaseReady && !req.path.startsWith('/exchange-rates')) {
    return res.status(503).json({ error: 'Database unavailable. Configure MONGODB_URI and try again.' });
  }
  next();
});

const connectedAdmins = new Set();

io.on('connection', (socket) => {
  console.log(`[SOCKET] Connection established: ${socket.id}`);
  socket.on('ping', () => { socket.emit('pong'); });
  socket.on('join_user', (userId) => {
    if (!socket.user.isAdmin && socket.user._id.toString() !== userId.toString()) return;
    const room = `user_${userId}`;
    socket.join(room);
    console.log(`[SOCKET] User ${userId} joined room: ${room}`);
  });
  socket.on('join_admin', () => {
    if (!socket.user.isAdmin) return;
    socket.join('admin_room');
    connectedAdmins.add(socket.id);
    console.log(`[SOCKET] Admin joined admin_room. Total admins: ${connectedAdmins.size}`);
  });
  socket.on('join_chat', (userId) => {
    if (!socket.user.isAdmin && socket.user._id.toString() !== userId.toString()) return;
    socket.join(userId);
    socket.join(`user_${userId}`);
    console.log(`[SOCKET] Socket joined chat rooms: ${userId}, user_${userId}`);
  });
  socket.on('send_message', async (data) => {
    if (!socket.user || socket.user.isAdmin || socket.user._id.toString() !== String(data.userId)) return;
    console.log(`[SOCKET] send_message received: userId=${data.userId}`);
    try {
      const Chat = require('./models/Chat');
      const User = require('./models/User');
      const messageData = {
        sender: 'user',
        text: data.text || '',
        imageUrl: data.imageUrl || null,
        timestamp: new Date(),
        read: false
      };
      const chat = await Chat.findOneAndUpdate(
        { userId: data.userId },
        { $push: { messages: messageData } },
        { upsert: true, new: true }
      );
      const user = await User.findById(data.userId).select('fullName');
      const userName = user ? user.fullName : 'Unknown User';
      const lastMessage = chat.messages[chat.messages.length - 1];
      const messageToEmit = data.tempId ? { ...lastMessage.toObject(), tempId: data.tempId } : lastMessage;
      io.to(data.userId).emit('new_message', messageToEmit);
      io.to(`user_${data.userId}`).emit('new_message', messageToEmit);
      if (connectedAdmins.size > 0) {
        io.to('admin_room').emit('new_chat', {
          userId: data.userId,
          userName: userName,
          message: data.text || '📷 Image',
          timestamp: new Date()
        });
      }
    } catch (err) {
      console.error('[SOCKET] Chat error:', err);
    }
  });
  socket.on('admin_reply', async (data) => {
    if (!socket.user?.isAdmin) return;
    console.log(`[SOCKET] admin_reply received for user: ${data.userId}`);
    try {
      const Chat = require('./models/Chat');
      const messageData = {
        sender: 'admin',
        text: data.text || '',
        imageUrl: data.imageUrl || null,
        timestamp: new Date(),
        read: false
      };
      const chat = await Chat.findOneAndUpdate(
        { userId: data.userId },
        { $push: { messages: messageData } },
        { new: true }
      );
      const lastMessage = chat.messages[chat.messages.length - 1];
      io.to(data.userId).emit('new_message', lastMessage);
      io.to(`user_${data.userId}`).emit('new_message', lastMessage);
    } catch (err) {
      console.error('[SOCKET] Admin reply error:', err);
    }
  });
  socket.on('disconnect', (reason) => {
    console.log(`[SOCKET] Disconnected: ${socket.id}, reason: ${reason}`);
    if (connectedAdmins.has(socket.id)) {
      connectedAdmins.delete(socket.id);
    }
  });
});

app.set('io', io);

app.use('/api/auth', require('./routes/auth'));
app.use('/api/user', require('./routes/user'));
app.use('/api/transfer', require('./routes/transfer'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/chat', require('./routes/chat'));
app.use('/api/chat', require('./routes/chatUpload'));
app.use('/api/loan', require('./routes/loan'));
app.use('/api/card', require('./routes/card'));
app.use('/api/support', require('./routes/support'));
app.use('/api/budget', require('./routes/budget'));
app.use('/api/savings', require('./routes/savings'));
app.use('/api/scheduled', require('./routes/scheduled'));
app.use('/api/beneficiary', require('./routes/beneficiary'));
app.use('/api/otp', require('./routes/otp')); // OTP routes for forgot password/PIN
app.use('/api/checks', require('./routes/checks'));
app.use('/api/exchange-rates', require('./routes/exchangeRates'));
app.use('/api/developer', require('./routes/developer'));
app.use('/api/merchant', require('./routes/merchant'));

const possibleDistPaths = [
  path.join(__dirname, 'dist'),
  path.join(__dirname, '../frontend/dist'),
  path.join(__dirname, '../../frontend/dist'),
];

let distPath = null;
for (const testPath of possibleDistPaths) {
  const indexPath = path.join(testPath, 'index.html');
  if (fs.existsSync(indexPath)) {
    distPath = testPath;
    console.log(`[SERVER] Serving frontend from: ${distPath}`);
    break;
  }
}

if (distPath) {
  app.use(express.static(distPath));
  app.get('*', (req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });
} else {
  console.log('[SERVER] API-only mode.');
  app.get('*', (req, res) => {
    res.status(404).json({ error: 'Frontend not built' });
  });
}

const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => console.log(`Server running on port ${PORT}`));
