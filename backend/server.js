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
  }
});

app.use(helmet());
app.use(cors({ origin: CLIENT_URL }));
app.use(express.json({ limit: '10mb' }));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100
});
app.use('/api/', limiter);

mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB Connected'))
  .catch(err => console.error('MongoDB Error:', err));

app.get('/', (req, res) => res.json({ status: 'ok', service: 'credixa-api' }));
app.get('/health', (req, res) => res.json({ status: 'healthy' }));

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('join_user', (userId) => {
    socket.join(`user_${userId}`);
    console.log(`User ${userId} joined their room`);
  });

  socket.on('join_admin', () => {
    socket.join('admin_room');
    console.log('Admin joined admin room');
  });

  socket.on('join_chat', (userId) => {
    socket.join(userId);
  });

  socket.on('send_message', async (data) => {
    try {
      const Chat = require('./models/Chat');
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
      io.to(data.userId).emit('new_message', chat.messages[chat.messages.length - 1]);
      io.to('admin_room').emit('new_chat', { userId: data.userId, message: data.text });
    } catch (err) {
      console.error('Chat error:', err);
    }
  });

  socket.on('admin_reply', async (data) => {
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
      io.to(data.userId).emit('new_message', chat.messages[chat.messages.length - 1]);
    } catch (err) {
      console.error('Admin reply error:', err);
    }
  });

  socket.on('send_notification', (data) => {
    io.to(`user_${data.userId}`).emit('notification', data.notification);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
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

const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => console.log(`Server running on port ${PORT}`));
