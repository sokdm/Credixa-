const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { createServer } = require('http');
const { Server } = require('socket.io');
require('dotenv').config();

const app = express();
const httpServer = createServer(app);

const CLIENT_URL = process.env.CLIENT_URL || "*";

const io = new Server(httpServer, {
  cors: {
    origin: CLIENT_URL,
    methods: ["GET", "POST"]
  },
  transports: ['polling', 'websocket'],
  pingTimeout: 60000,
  pingInterval: 25000,
  allowUpgrades: true,
  upgradeTimeout: 10000
});

app.set('trust proxy', 1);

app.use(helmet());
app.use(cors({ origin: CLIENT_URL }));
app.use(express.json({ limit: '10mb' }));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  validate: { trustProxy: false }
});
app.use('/api/', limiter);

mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB Connected'))
  .catch(err => console.error('MongoDB Error:', err));

app.get('/', (req, res) => res.json({ status: 'ok', service: 'credixa-api' }));
app.get('/health', (req, res) => res.json({ status: 'healthy' }));

const connectedAdmins = new Set();

io.on('connection', (socket) => {
  console.log(`[SOCKET] Connection established: ${socket.id}`);

  socket.on('join_user', (userId) => {
    const room = `user_${userId}`;
    socket.join(room);
    console.log(`[SOCKET] User ${userId} joined room: ${room}`);
  });

  socket.on('join_admin', () => {
    socket.join('admin_room');
    connectedAdmins.add(socket.id);
    console.log(`[SOCKET] Admin joined admin_room. Total admins: ${connectedAdmins.size}`);
  });

  socket.on('join_chat', (userId) => {
    socket.join(userId);
    socket.join(`user_${userId}`);
    console.log(`[SOCKET] Socket joined chat rooms: ${userId}, user_${userId}`);
  });

  socket.on('send_message', async (data) => {
    console.log(`[SOCKET] send_message received: userId=${data.userId}, text="${data.text.substring(0, 30)}..."`);
    try {
      const Chat = require('./models/Chat');
      const User = require('./models/User');

      const chat = await Chat.findOneAndUpdate(
        { userId: data.userId },
        {
          $push: {
            messages: {
              sender: data.sender,
              text: data.text,
              timestamp: new Date(),
              read: false
            }
          }
        },
        { upsert: true, new: true }
      );

      console.log(`[SOCKET] Chat saved for user: ${data.userId}`);

      const user = await User.findById(data.userId).select('fullName');
      const userName = user ? user.fullName : 'Unknown User';

      const lastMessage = chat.messages[chat.messages.length - 1];

      io.to(data.userId).emit('new_message', lastMessage);
      io.to(`user_${data.userId}`).emit('new_message', lastMessage);
      console.log(`[SOCKET] Emitted new_message to user rooms`);

      if (connectedAdmins.size > 0) {
        io.to('admin_room').emit('new_chat', {
          userId: data.userId,
          userName: userName,
          message: data.text,
          timestamp: new Date()
        });
        console.log(`[SOCKET] Emitted new_chat to admin_room (${connectedAdmins.size} admins online)`);
      } else {
        console.log(`[SOCKET] No admins online, message queued for later`);
      }

    } catch (err) {
      console.error('[SOCKET] Chat error:', err);
    }
  });

  socket.on('admin_reply', async (data) => {
    console.log(`[SOCKET] admin_reply received for user: ${data.userId}`);
    try {
      const Chat = require('./models/Chat');
      const chat = await Chat.findOneAndUpdate(
        { userId: data.userId },
        {
          $push: {
            messages: {
              sender: 'admin',
              text: data.text,
              timestamp: new Date(),
              read: false
            }
          }
        },
        { new: true }
      );

      const lastMessage = chat.messages[chat.messages.length - 1];
      io.to(data.userId).emit('new_message', lastMessage);
      io.to(`user_${data.userId}`).emit('new_message', lastMessage);
      console.log(`[SOCKET] Admin reply emitted to user: ${data.userId}`);
    } catch (err) {
      console.error('[SOCKET] Admin reply error:', err);
    }
  });

  socket.on('send_notification', (data) => {
    io.to(`user_${data.userId}`).emit('notification', data.notification);
  });

  socket.on('disconnect', (reason) => {
    console.log(`[SOCKET] Disconnected: ${socket.id}, reason: ${reason}`);
    if (connectedAdmins.has(socket.id)) {
      connectedAdmins.delete(socket.id);
      console.log(`[SOCKET] Admin disconnected. Remaining admins: ${connectedAdmins.size}`);
    }
  });
});

app.set('io', io);

app.use('/api/auth', require('./routes/auth'));
app.use('/api/user', require('./routes/user'));
app.use('/api/transfer', require('./routes/transfer'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/chat', require('./routes/chat'));
app.use('/api/loan', require('./routes/loan'));
app.use('/api/card', require('./routes/card'));
app.use('/api/support', require('./routes/support'));
app.use('/api/budget', require('./routes/budget'));
app.use('/api/savings', require('./routes/savings'));
app.use('/api/scheduled', require('./routes/scheduled'));
app.use('/api/beneficiary', require('./routes/beneficiary'));

const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => console.log(`Server running on port ${PORT}`));
