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

      let encrypted, decrypted;
      if (isGroup) {
        // For group messages, encrypt with each member's secretKey and send individually
        const group = await Group.findById(roomId).populate('groupMembers.user');
        if (!group) throw new Error('Group not found');
        encrypted = {};
        for (const member of group.groupMembers) {
          const memberUser = member.user;
          if (memberUser && memberUser.secretKey) {
            encrypted[memberUser._id] = encrypt(text, memberUser.secretKey);
          }
        }
      } else {
        // Use receiver's secretKey for personal messages
        const receiver = await User.findById(receiverId).select('secretKey');
        if (!receiver || !receiver.secretKey) throw new Error('Receiver key not found');
        encrypted = encrypt(text, receiver.secretKey);
      }

      const msgData = {
        sender: senderId,
        content: isGroup ? encrypted : encrypted,
        createdAt: new Date(),
        ...(isGroup ? { group: roomId } : { to: receiverId }),
      };

      const msg = new Message(msgData);
      await msg.save();

      if (isGroup) {
        // Send each member their own encrypted message
        const group = await Group.findById(roomId).populate('groupMembers.user');
        for (const member of group.groupMembers) {
          const memberUser = member.user;
          if (memberUser && memberUser.secretKey) {
            const nickname = member.nickname || 'Unknown';
            const decryptedMsg = decrypt(encrypted[memberUser._id], memberUser.secretKey);
            io.to(roomId).emit('newMessage', {
              sender: senderId,
              nickname,
              content: decryptedMsg,
              createdAt: msg.createdAt,
              forUser: memberUser._id,
            });
          }
        }
      } else {
        // Decrypt with receiver's key for display
        const receiver = await User.findById(receiverId).select('secretKey username');
        decrypted = decrypt(encrypted, receiver.secretKey);

        const messages = roomMessages.get(roomId) || [];
        messages.push({
          sender: senderId,
          content: decrypted,
          createdAt: msg.createdAt,
          receiverId,
        });
        roomMessages.set(roomId, messages);

        io.to(roomId).emit('newMessage', {
          sender: senderId,
          username: receiver.username || 'Friend',
          content: decrypted,
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
