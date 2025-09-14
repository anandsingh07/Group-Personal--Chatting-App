const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const http = require('http');
const socketIo = require('socket.io');

dotenv.config();

const app = express();
const server = http.createServer(app);

const io = socketIo(server, {
  cors: {
    origin: process.env.FRONTEND_URL, 
    methods: ['GET', 'POST'],
  },
});

app.use(cors({
  origin: process.env.FRONTEND_URL,
}));

app.use(express.json({ limit: '10mb' }));

app.get('/', (req, res) => res.send('API is running...'));

app.use('/api/auth', require('./routes/auth'));
app.use('/api/groups', require('./routes/group'));
app.use('/api/users', require('./routes/user'));
app.use('/api/messages', require('./routes/message'));

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ MongoDB connected'))
  .catch((err) => console.error('❌ MongoDB connection failed:', err));

const Message = require('./models/Message');
const User = require('./models/User');
const Group = require('./models/Group');
const { encrypt, decrypt } = require('./utils/encryption');

const roomMessages = new Map();

io.on('connection', (socket) => {
  console.log('✅ User connected:', socket.id);

  socket.on('joinRoom', (roomId, isGroup = false) => {
    socket.join(roomId);
    console.log(`✅ Socket ${socket.id} joined room: ${roomId}`);

    if (!isGroup && roomMessages.has(roomId)) {
      socket.emit('initialMessages', roomMessages.get(roomId));
    }
  });

  socket.on('sendMessage', async ({ roomId, senderId, text, isGroup, receiverId }) => {
    try {
      if (!text?.trim()) return;

      const encrypted = encrypt(text);

      const msgData = {
        sender: senderId,
        content: encrypted,
        createdAt: new Date(),
        ...(isGroup ? { group: roomId } : { to: receiverId }),
      };

      const msg = new Message(msgData);
      await msg.save();

      if (isGroup) {
        const group = await Group.findById(roomId);
        const member = group.groupMembers.find(m => m.user.toString() === senderId);
        const nickname = member ? member.nickname : 'Unknown';

        io.to(roomId).emit('newMessage', {
          sender: senderId,
          nickname,
          content: decrypt(encrypted),
          createdAt: msg.createdAt,
        });
      } else {
        const messages = roomMessages.get(roomId) || [];
        messages.push({
          sender: senderId,
          content: text,
          createdAt: msg.createdAt,
          receiverId,
        });
        roomMessages.set(roomId, messages);

        const sender = await User.findById(senderId).select('username');
        io.to(roomId).emit('newMessage', {
          sender: senderId,
          username: sender.username || 'Friend',
          content: text,
          createdAt: msg.createdAt,
        });
      }
    } catch (err) {
      console.error('❌ Error in sendMessage:', err.message);
    }
  });

  socket.on('clearChat', async ({ roomId, isGroup, receiverId }) => {
    try {
      if (isGroup) {
        await Message.deleteMany({ group: roomId });
      } else {
        await Message.deleteMany({
          $or: [
            { sender: receiverId, to: socket.id },
            { sender: socket.id, to: receiverId }
          ]
        });
        roomMessages.set(roomId, []);
      }

      io.to(roomId).emit('chatCleared');
      console.log(`✅ Cleared chat for room: ${roomId}`);
    } catch (err) {
      console.error('❌ Error clearing chat:', err.message);
    }
  });

  socket.on('leaveRoom', (roomId) => {
    socket.leave(roomId);
    console.log(`✅ Socket ${socket.id} left room: ${roomId}`);
  });

  socket.on('disconnect', () => {
    console.log('❌ User disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
