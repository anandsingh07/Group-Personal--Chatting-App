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
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST'],
  },
});

app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Routes
app.get('/', (req, res) => res.send('API is running...'));
app.use('/api/auth', require('./routes/auth'));
app.use('/api/groups', require('./routes/group'));
app.use('/api/users', require('./routes/user'));
app.use('/api/messages', require('./routes/message'));

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ MongoDB connected'))
  .catch((err) => console.error('❌ MongoDB failed:', err));

const Message = require('./models/Message');
const User = require('./models/User');
const Group = require('./models/Group');
const { encrypt, decrypt } = require('./utils/encryption');

io.on('connection', (socket) => {
  console.log('✅ User connected:', socket.id);

  // Join room
  socket.on('joinRoom', (roomId) => {
    socket.join(roomId);
    console.log(`✅ Socket ${socket.id} joined room: ${roomId}`);
  });

  // Send + save + broadcast
  socket.on('sendMessage', async ({ roomId, senderId, text, isGroup, receiverId }) => {
    try {
      const encrypted = encrypt(text);

      const msg = new Message({
        sender: senderId,
        content: encrypted,
        ...(isGroup ? { group: roomId } : { to: receiverId }),
      });

      await msg.save();

      if (isGroup) {
        const group = await Group.findById(roomId);
        const member = group.groupMembers.find((m) => m.user.toString() === senderId);
        const nickname = member ? member.nickname : 'Unknown';

        io.to(roomId).emit('newMessage', {
          sender: senderId,
          nickname,
          content: decrypt(encrypted),   // ✅ send decrypted
          createdAt: msg.createdAt,
        });
      } else {
        const sender = await User.findById(senderId).select('username');

        io.to(roomId).emit('newMessage', {
          sender: senderId,
          username: sender.username,
          content: decrypt(encrypted),   // ✅ send decrypted
          createdAt: msg.createdAt,
        });
      }
    } catch (err) {
      console.error('❌ Error in sendMessage:', err.message);
    }
  });

  socket.on('disconnect', () => {
    console.log('❌ User disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
